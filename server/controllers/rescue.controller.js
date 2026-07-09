const Rescue = require('../models/Rescue');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// POST /api/rescues
exports.createRescue = async (req, res) => {
  try {
    const {
      lat, lng, address,
      animalType, conditions, urgency,
      description, contactPhone,
    } = req.body;

    if (!lat || !lng || !address || !animalType || !urgency) {
      return res.status(400).json({ message: 'Location, animal type and urgency are required.' });
    }

    // Upload photos to Cloudinary if any
    let photos = [];
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          uploadToCloudinary(file.buffer, 'paluwasathi/rescues')
        )
      );
      photos = uploads.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
    }

    const rescue = await Rescue.create({
      reportedBy: req.user?.userId || null,
      photos,
      location: { lat: parseFloat(lat), lng: parseFloat(lng), address },
      animalType,
      conditions: conditions ? JSON.parse(conditions) : [],
      urgency,
      description,
      contactPhone,
      timeline: [{ status: 'reported', message: 'Rescue case reported successfully.' }],
    });

    res.status(201).json({
      message: 'Rescue reported successfully.',
      rescue,
      caseNumber: rescue.caseNumber,
    });
    } catch (err) {
    res.status(500).json({ message: 'Failed to create rescue.', error: err.message });
  }
};

// GET /api/rescues
exports.getRescues = async (req, res) => {
  try {
    const { status, urgency, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;

    const rescues = await Rescue.find(filter)
      .populate('reportedBy', 'name phone')
      .populate('assignedVolunteer', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Rescue.countDocuments(filter);

    res.json({ rescues, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rescues.', error: err.message });
  }
};

// GET /api/rescues/:id
exports.getRescueById = async (req, res) => {
  try {
    const rescue = await Rescue.findById(req.params.id)
      .populate('reportedBy', 'name phone')
      .populate('assignedVolunteer', 'name phone district');

    if (!rescue) return res.status(404).json({ message: 'Rescue not found.' });

    res.json({ rescue });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rescue.', error: err.message });
  }
};

// PATCH /api/rescues/:id
exports.updateRescue = async (req, res) => {
  try {
    const { status, progressPercent, message } = req.body;

    const rescue = await Rescue.findById(req.params.id);
    if (!rescue) return res.status(404).json({ message: 'Rescue not found.' });

    if (status) rescue.status = status;
    if (progressPercent !== undefined) rescue.progressPercent = progressPercent;
    if (status && message) {
      rescue.timeline.push({ status, message });
    }

    await rescue.save();
    res.json({ message: 'Rescue updated.', rescue });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update rescue.', error: err.message });
  }
};

// GET /api/rescues/my
exports.getMyRescues = async (req, res) => {
  try {
    const rescues = await Rescue.find({ reportedBy: req.user.userId })
      .sort({ createdAt: -1 });
    res.json({ rescues });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your rescues.', error: err.message });
  }
};

// GET /api/rescues/stats
exports.getRescueStats = async (req, res) => {
  try {
    const total = await Rescue.countDocuments();
    const active = await Rescue.countDocuments({
      status: { $in: ['reported', 'assigned', 'en_route', 'on_scene'] },
    });
    const rescued = await Rescue.countDocuments({ status: 'rescued' });
    res.json({ total, active, rescued });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message });
  }
};

// GET /api/rescues/available  (volunteers only)
exports.getAvailableRescues = async (req, res) => {
  try {
    const rescues = await Rescue.find({
      status: 'reported',
      assignedVolunteer: null,
    })
      .populate('reportedBy', 'name phone')
      .sort({ urgency: 1, createdAt: -1 })
      .limit(20);

    res.json({ rescues });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch available rescues.', error: err.message });
  }
};

// POST /api/rescues/:id/accept  (volunteers only)
exports.acceptRescue = async (req, res) => {
  try {
    const rescue = await Rescue.findById(req.params.id);
    if (!rescue) return res.status(404).json({ message: 'Rescue not found.' });

    if (rescue.assignedVolunteer) {
      return res.status(400).json({ message: 'This case is already assigned to another volunteer.' });
    }
    if (rescue.status !== 'reported') {
      return res.status(400).json({ message: 'This case is no longer available.' });
    }

    rescue.assignedVolunteer = req.user.userId;
    rescue.status = 'assigned';
    rescue.progressPercent = 25;
    rescue.volunteersAvailable = true;
    rescue.timeline.push({
      status: 'assigned',
      message: 'A volunteer has accepted this case and is preparing to respond.',
    });

    await rescue.save();
    await rescue.populate('assignedVolunteer', 'name phone district');

    res.json({ message: 'Case accepted.', rescue });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept case.', error: err.message });
  }
};

// PATCH /api/rescues/:id/status  (assigned volunteer or admin)
exports.updateRescueStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validFlow = {
      assigned: 'en_route',
      en_route: 'on_scene',
      on_scene: 'rescued',
    };

    const progressMap = {
      assigned: 25,
      en_route: 50,
      on_scene: 75,
      rescued: 100,
    };

    const messages = {
      en_route: 'Volunteer is on the way to the animal.',
      on_scene: 'Volunteer has arrived at the location.',
      rescued: 'The animal has been rescued and is safe.',
    };

    const rescue = await Rescue.findById(req.params.id);
    if (!rescue) return res.status(404).json({ message: 'Rescue not found.' });

    // Only the assigned volunteer (or admin) can update
    const isAssigned = rescue.assignedVolunteer?.toString() === req.user.userId;
    if (!isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the assigned volunteer can update this case.' });
    }

    const expected = validFlow[rescue.status];
    if (status !== expected && req.user.role !== 'admin') {
      return res.status(400).json({ message: `Next valid status is "${expected}".` });
    }

    rescue.status = status;
    rescue.progressPercent = progressMap[status] || rescue.progressPercent;
    rescue.timeline.push({ status, message: messages[status] || `Status updated to ${status}.` });

    await rescue.save();
    res.json({ message: 'Status updated.', rescue });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status.', error: err.message });
  }
};

// GET /api/rescues/assigned  (volunteers only — their accepted cases)
    exports.getAssignedRescues = async (req, res) => {
      try {
        const rescues = await Rescue.find({ assignedVolunteer: req.user.userId })
          .populate('reportedBy', 'name phone')
          .sort({ createdAt: -1 });
        res.json({ rescues });
      } catch (err) {
        res.status(500).json({ message: 'Failed to fetch assigned cases.', error: err.message });
      }
    };