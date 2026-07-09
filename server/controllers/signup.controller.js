const TaskSignup = require('../models/TaskSignup');
const VolunteerTask = require('../models/VolunteerTask');

exports.createSignup = async (req, res) => {
  try {
    const { taskId, volunteerInfo, experience, notes, hasTransport } = req.body;

    const task = await VolunteerTask.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'This opportunity is no longer accepting volunteers.' });
    }

    if (task.startDate < new Date()) {
      return res.status(400).json({ message: 'This opportunity has already passed.' });
    }

    if (task.volunteersJoined >= task.volunteersNeeded) {
      return res.status(400).json({ message: 'All spots have been filled.' });
    }

    const existing = await TaskSignup.findOne({
      task: taskId,
      volunteer: req.user.userId,
      status: { $ne: 'cancelled' },
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already signed up for this opportunity.' });
    }

    const signup = await TaskSignup.create({
      task: taskId,
      volunteer: req.user.userId,
      volunteerInfo,
      experience,
      notes,
      hasTransport: !!hasTransport,
    });

    task.volunteersJoined += 1;
    if (task.volunteersJoined >= task.volunteersNeeded) {
      task.status = 'full';
    }
    await task.save();

    await signup.populate('task');

    res.status(201).json({
      message: 'Signed up successfully.',
      signup,
      confirmationNumber: signup.confirmationNumber,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already signed up for this opportunity.' });
    }
    res.status(500).json({ message: 'Failed to sign up.', error: err.message });
  }
};

exports.getMySignups = async (req, res) => {
  try {
    const signups = await TaskSignup.find({
      volunteer: req.user.userId,
      status: { $ne: 'cancelled' },
    })
      .populate({
        path: 'task',
        populate: { path: 'ngo', select: 'name district' },
      })
      .sort({ createdAt: -1 });

    const totalHours = signups
      .filter((s) => s.status === 'attended')
      .reduce((sum, s) => sum + s.hoursLogged, 0);

    res.json({ signups, totalHours, count: signups.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch signups.', error: err.message });
  }
};

exports.getSignupById = async (req, res) => {
  try {
    const signup = await TaskSignup.findById(req.params.id)
      .populate({
        path: 'task',
        populate: { path: 'ngo', select: 'name district phone email' },
      })
      .populate('volunteer', 'name email phone');

    if (!signup) return res.status(404).json({ message: 'Signup not found.' });

    const isVolunteer = signup.volunteer._id.toString() === req.user.userId;
    const isNgo = signup.task.ngo._id.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isVolunteer && !isNgo && !isAdmin) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ signup });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch signup.', error: err.message });
  }
};

exports.cancelSignup = async (req, res) => {
  try {
    const signup = await TaskSignup.findById(req.params.id).populate('task');
    if (!signup) return res.status(404).json({ message: 'Signup not found.' });

    if (signup.volunteer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only cancel your own signup.' });
    }

    if (signup.status === 'attended') {
      return res.status(400).json({ message: 'Cannot cancel a completed task.' });
    }

    signup.status = 'cancelled';
    await signup.save();

    const task = await VolunteerTask.findById(signup.task._id);
    task.volunteersJoined = Math.max(task.volunteersJoined - 1, 0);
    if (task.status === 'full' && task.volunteersJoined < task.volunteersNeeded) {
      task.status = 'open';
    }
    await task.save();

    res.json({ message: 'Signup cancelled.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel signup.', error: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { status, hoursLogged } = req.body;

    const signup = await TaskSignup.findById(req.params.id).populate('task');
    if (!signup) return res.status(404).json({ message: 'Signup not found.' });

    const isNgo = signup.task.ngo.toString() === req.user.userId;
    if (!isNgo && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the organising NGO can mark attendance.' });
    }

    signup.status = status;
    if (status === 'attended' && hoursLogged) {
      signup.hoursLogged = Number(hoursLogged);
    }
    await signup.save();

    res.json({ message: 'Attendance recorded.', signup });
  } catch (err) {
    res.status(500).json({ message: 'Failed to record attendance.', error: err.message });
  }
};