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