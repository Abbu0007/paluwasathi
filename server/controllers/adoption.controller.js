const Adoption = require('../models/Adoption');
const Pet = require('../models/Pet');

exports.createAdoption = async (req, res) => {
  try {
    const { petId, personal, home, lifestyle } = req.body;

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found.' });
    if (pet.status !== 'available') {
      return res.status(400).json({ message: 'This pet is no longer available.' });
    }

    const existing = await Adoption.findOne({
      pet: petId,
      applicant: req.user.userId,
      status: { $in: ['pending', 'reviewing'] },
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending application for this pet.' });
    }

    const adoption = await Adoption.create({
      pet: petId,
      applicant: req.user.userId,
      personal,
      home,
      lifestyle,
    });

    pet.status = 'pending';
    await pet.save();

    await adoption.populate('pet');

    res.status(201).json({
      message: 'Application submitted.',
      adoption,
      applicationNumber: adoption.applicationNumber,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit application.', error: err.message });
  }
};

exports.getMyAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find({ applicant: req.user.userId })
      .populate('pet')
      .sort({ createdAt: -1 });
    res.json({ adoptions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applications.', error: err.message });
  }
};

exports.getAdoptionById = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id)
      .populate('pet')
      .populate('applicant', 'name email phone');

    if (!adoption) return res.status(404).json({ message: 'Application not found.' });

    const isOwner = adoption.applicant._id.toString() === req.user.userId;
    if (!isOwner && !['ngo', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ adoption });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch application.', error: err.message });
  }
};

exports.updateAdoptionStatus = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;

    const adoption = await Adoption.findById(req.params.id).populate('pet');
    if (!adoption) return res.status(404).json({ message: 'Application not found.' });

    adoption.status = status;
    if (reviewNote) adoption.reviewNote = reviewNote;
    await adoption.save();

    const pet = await Pet.findById(adoption.pet._id);
    if (status === 'approved') {
      pet.status = 'adopted';
      await pet.save();
      await Adoption.updateMany(
        { pet: pet._id, _id: { $ne: adoption._id }, status: { $in: ['pending', 'reviewing'] } },
        { status: 'rejected', reviewNote: 'Pet has been adopted by another applicant.' }
      );
    } else if (status === 'rejected') {
      const others = await Adoption.countDocuments({
        pet: pet._id,
        status: { $in: ['pending', 'reviewing'] },
      });
      if (others === 0) {
        pet.status = 'available';
        await pet.save();
      }
    }

    res.json({ message: 'Application updated.', adoption });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update application.', error: err.message });
  }
};

exports.getPendingAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find({ status: { $in: ['pending', 'reviewing'] } })
      .populate('pet')
      .populate('applicant', 'name email phone district')
      .sort({ createdAt: -1 });
    res.json({ adoptions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applications.', error: err.message });
  }
};