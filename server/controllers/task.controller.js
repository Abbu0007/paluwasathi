const VolunteerTask = require('../models/VolunteerTask');
const TaskSignup = require('../models/TaskSignup');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

exports.getTasks = async (req, res) => {
  try {
    const { category, district, status = 'open', urgent, sort = 'soonest', page = 1, limit = 9 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = { $in: category.split(',') };
    if (district) filter['location.district'] = district;
    if (urgent === 'true') filter.urgent = true;

    if (status === 'open') {
      filter.startDate = { $gte: new Date() };
    }

    const sortMap = {
      soonest: { startDate: 1 },
      newest: { createdAt: -1 },
      most_needed: { volunteersNeeded: -1 },
    };

    const tasks = await VolunteerTask.find(filter)
      .populate('ngo', 'name district')
      .sort(sortMap[sort] || sortMap.soonest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await VolunteerTask.countDocuments(filter);

    res.json({ tasks, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await VolunteerTask.findById(req.params.id).populate('ngo', 'name district phone email');
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    let hasSignedUp = false;
    if (req.user) {
      const existing = await TaskSignup.findOne({
        task: task._id,
        volunteer: req.user.userId,
        status: { $ne: 'cancelled' },
      });
      hasSignedUp = !!existing;
    }

    res.json({ task, hasSignedUp });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task.', error: err.message });
  }
};

exports.getTaskStats = async (req, res) => {
  try {
    const openTasks = await VolunteerTask.countDocuments({
      status: 'open',
      startDate: { $gte: new Date() },
    });
    const totalVolunteers = await TaskSignup.countDocuments({ status: { $in: ['confirmed', 'attended'] } });
    const hoursLogged = await TaskSignup.aggregate([
      { $match: { status: 'attended' } },
      { $group: { _id: null, total: { $sum: '$hoursLogged' } } },
    ]);

    res.json({
      openTasks,
      totalVolunteers,
      hoursLogged: (hoursLogged[0] && hoursLogged[0].total) || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const body = req.body;

    let coverImage = {};
    if (req.files && req.files.length) {
      const result = await uploadToCloudinary(req.files[0].buffer, 'paluwasathi/tasks');
      coverImage = { url: result.secure_url, publicId: result.public_id };
    }

    const task = await VolunteerTask.create({
      title: body.title,
      category: body.category,
      description: body.description,
      coverImage,
      location: {
        address: body.address,
        district: body.district,
        lat: body.lat ? Number(body.lat) : undefined,
        lng: body.lng ? Number(body.lng) : undefined,
      },
      startDate: body.startDate,
      endDate: body.endDate || undefined,
      startTime: body.startTime,
      endTime: body.endTime || undefined,
      volunteersNeeded: Number(body.volunteersNeeded),
      requirements: body.requirements ? JSON.parse(body.requirements) : [],
      providesFood: body.providesFood === 'true' || body.providesFood === true,
      providesTransport: body.providesTransport === 'true' || body.providesTransport === true,
      minAge: body.minAge ? Number(body.minAge) : 16,
      urgent: body.urgent === 'true' || body.urgent === true,
      ngo: req.user.userId,
    });

    res.status(201).json({ message: 'Task published.', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task.', error: err.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await VolunteerTask.find({ ngo: req.user.userId }).sort({ startDate: -1 });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await VolunteerTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const isOwner = task.ngo.toString() === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own tasks.' });
    }

    const allowed = ['title', 'description', 'startDate', 'startTime', 'endTime', 'volunteersNeeded', 'status', 'urgent'];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) task[f] = req.body[f];
    });

    await task.save();
    res.json({ message: 'Task updated.', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task.', error: err.message });
  }
};

exports.getTaskSignups = async (req, res) => {
  try {
    const task = await VolunteerTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const isOwner = task.ngo.toString() === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const signups = await TaskSignup.find({ task: task._id, status: { $ne: 'cancelled' } })
      .populate('volunteer', 'name email phone district')
      .sort({ createdAt: -1 });

    res.json({ signups, task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch signups.', error: err.message });
  }
};

exports.getNgoTaskStats = async (req, res) => {
  try {
    const tasks = await VolunteerTask.find({ ngo: req.user.userId });
    const taskIds = tasks.map((t) => t._id);

    const open = tasks.filter((t) => t.status === 'open' && t.startDate >= new Date()).length;
    const completed = tasks.filter((t) => t.status === 'completed').length;

    const signups = await TaskSignup.countDocuments({
      task: { $in: taskIds },
      status: { $in: ['confirmed', 'attended'] },
    });

    const hours = await TaskSignup.aggregate([
      { $match: { task: { $in: taskIds }, status: 'attended' } },
      { $group: { _id: null, total: { $sum: '$hoursLogged' } } },
    ]);

    res.json({
      openTasks: open,
      completedTasks: completed,
      totalSignups: signups,
      hoursContributed: (hours[0] && hours[0].total) || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message });
  }
};