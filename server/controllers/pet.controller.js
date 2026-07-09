const Pet = require('../models/Pet');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

exports.getPets = async (req, res) => {
  try {
    const {
      species, gender, size, status = 'available',
      minAge, maxAge, traits, search,
      sort = 'newest', page = 1, limit = 9,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (species) filter.species = { $in: species.split(',') };
    if (gender) filter.gender = gender;
    if (size) filter.size = { $in: size.split(',') };
    if (traits) filter.traits = { $in: traits.split(',') };
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }
    if (search) filter.$text = { $search: search };

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      longest_wait: { waitingSince: 1 },
    };

    const pets = await Pet.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Pet.countDocuments(filter);

    res.json({
      pets,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pets.', error: err.message });
  }
};

exports.getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found.' });

    const similar = await Pet.find({
      _id: { $ne: pet._id },
      species: pet.species,
      status: 'available',
    }).limit(3);

    res.json({ pet, similar });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pet.', error: err.message });
  }
};

exports.getPetStats = async (req, res) => {
  try {
    const available = await Pet.countDocuments({ status: 'available' });
    const adopted = await Pet.countDocuments({ status: 'adopted' });
    const total = await Pet.countDocuments();
    res.json({ available, adopted, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message });
  }
};

exports.createPet = async (req, res) => {
  try {
    const body = req.body;

    let photos = [];
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.buffer, 'paluwasathi/pets'))
      );
      photos = uploads.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
    }

    const pet = await Pet.create({
      ...body,
      photos,
      traits: body.traits ? JSON.parse(body.traits) : [],
      shelter: body.shelter ? JSON.parse(body.shelter) : {},
      listedBy: req.user.userId,
    });

    res.status(201).json({ message: 'Pet listed successfully.', pet });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list pet.', error: err.message });
  }
};

exports.savePet = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const petId = req.params.petId;

    if (user.savedPets.includes(petId)) {
      return res.status(400).json({ message: 'Pet already saved.' });
    }

    user.savedPets.push(petId);
    await user.save();

    res.json({ message: 'Pet saved.', savedPets: user.savedPets });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save pet.', error: err.message });
  }
};

exports.unsavePet = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.savedPets = user.savedPets.filter(
      (id) => id.toString() !== req.params.petId
    );
    await user.save();

    res.json({ message: 'Pet removed.', savedPets: user.savedPets });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove pet.', error: err.message });
  }
};

exports.getSavedPets = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('savedPets');
    res.json({ pets: user.savedPets });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch saved pets.', error: err.message });
  }
};