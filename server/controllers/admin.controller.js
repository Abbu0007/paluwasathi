const User = require('../models/User');
const Rescue = require('../models/Rescue');
const Pet = require('../models/Pet');
const Adoption = require('../models/Adoption');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const VolunteerTask = require('../models/VolunteerTask');
const TaskSignup = require('../models/TaskSignup');
const LostFound = require('../models/LostFound');
const CommunityPost = require('../models/CommunityPost');
const Event = require('../models/Event');
const EventRsvp = require('../models/EventRsvp');
const { cloudinary } = require('../config/cloudinary');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthsAgo = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const buildMonthlySeries = (agg, valueKey) => {
  const map = {};
  agg.forEach((row) => {
    const key = row._id.year + '-' + row._id.month;
    map[key] = row[valueKey];
  });

  const series = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.getFullYear() + '-' + (d.getMonth() + 1);
    series.push({
      month: MONTHS[d.getMonth()],
      value: map[key] || 0,
    });
  }
  return series;
};

exports.getOverview = async (req, res) => {
  try {
    const cutoff = monthsAgo(11);

    const [
      totalUsers, volunteers, ngos, petOwners, admins,
      totalRescues, activeRescues, completedRescues,
      totalPets, availablePets, adoptedPets,
      totalAdoptions, pendingAdoptions,
      totalCampaigns, activeCampaigns,
      totalTasks, totalSignups,
      totalReports, reunitedReports,
      totalPosts, totalEvents, totalRsvps,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'volunteer' }),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'petOwner' }),
      User.countDocuments({ role: 'admin' }),
      Rescue.countDocuments(),
      Rescue.countDocuments({ status: { $in: ['reported', 'assigned', 'en_route', 'on_scene'] } }),
      Rescue.countDocuments({ status: { $in: ['rescued', 'closed'] } }),
      Pet.countDocuments(),
      Pet.countDocuments({ status: 'available' }),
      Pet.countDocuments({ status: 'adopted' }),
      Adoption.countDocuments(),
      Adoption.countDocuments({ status: 'pending' }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: 'active' }),
      VolunteerTask.countDocuments(),
      TaskSignup.countDocuments({ status: { $ne: 'cancelled' } }),
      LostFound.countDocuments(),
      LostFound.countDocuments({ status: 'reunited' }),
      CommunityPost.countDocuments(),
      Event.countDocuments(),
      EventRsvp.countDocuments({ status: { $ne: 'cancelled' } }),
    ]);

    const donationAgg = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const hoursAgg = await TaskSignup.aggregate([
      { $match: { status: 'attended' } },
      { $group: { _id: null, total: { $sum: '$hoursLogged' } } },
    ]);

    const rescueMonthly = await Rescue.aggregate([
      { $match: { createdAt: { $gte: cutoff } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const donationMonthly = await Donation.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: cutoff } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          amount: { $sum: '$amount' },
        },
      },
    ]);

    const userMonthly = await User.aggregate([
      { $match: { createdAt: { $gte: cutoff } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const rescuesByStatus = await Rescue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const rescuesByUrgency = await Rescue.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } },
    ]);

    const petsBySpecies = await Pet.aggregate([
      { $group: { _id: '$species', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      users: { total: totalUsers, volunteers, ngos, petOwners, admins },
      rescues: { total: totalRescues, active: activeRescues, completed: completedRescues },
      pets: { total: totalPets, available: availablePets, adopted: adoptedPets },
      adoptions: { total: totalAdoptions, pending: pendingAdoptions },
      donations: {
        total: (donationAgg[0] && donationAgg[0].total) || 0,
        count: (donationAgg[0] && donationAgg[0].count) || 0,
      },
      campaigns: { total: totalCampaigns, active: activeCampaigns },
      volunteering: {
        tasks: totalTasks,
        signups: totalSignups,
        hours: (hoursAgg[0] && hoursAgg[0].total) || 0,
      },
      lostFound: { total: totalReports, reunited: reunitedReports },
      community: { posts: totalPosts },
      events: { total: totalEvents, rsvps: totalRsvps },
      charts: {
        rescuesOverTime: buildMonthlySeries(rescueMonthly, 'count'),
        donationsOverTime: buildMonthlySeries(donationMonthly, 'amount'),
        usersOverTime: buildMonthlySeries(userMonthly, 'count'),
        rescuesByStatus: rescuesByStatus.map((r) => ({ name: r._id, value: r.count })),
        rescuesByUrgency: rescuesByUrgency.map((r) => ({ name: r._id, value: r.count })),
        petsBySpecies: petsBySpecies.map((p) => ({ name: p._id, value: p.count })),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch overview.', error: err.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const [rescues, users, donations, adoptions] = await Promise.all([
      Rescue.find().sort({ createdAt: -1 }).limit(5).select('caseNumber animalType urgency status createdAt'),
      User.find().sort({ createdAt: -1 }).limit(5).select('name role district createdAt'),
      Donation.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(5)
        .populate('ngo', 'name').select('receiptNumber amount isAnonymous donorInfo createdAt'),
      Adoption.find().sort({ createdAt: -1 }).limit(5)
        .populate('pet', 'name').populate('applicant', 'name').select('applicationNumber status createdAt'),
    ]);

    res.json({ rescues, users, donations, adoptions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activity.', error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, search, verified, sort = 'newest', page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (verified === 'true') filter.isVerified = true;
    if (verified === 'false') filter.isVerified = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name: { name: 1 },
    };

    const users = await User.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.', error: err.message });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const [rescuesReported, rescuesAssigned, adoptions, donations, signups, posts, reports] =
      await Promise.all([
        Rescue.countDocuments({ reportedBy: user._id }),
        Rescue.countDocuments({ assignedVolunteer: user._id }),
        Adoption.countDocuments({ applicant: user._id }),
        Donation.find({ donor: user._id, status: 'completed' }),
        TaskSignup.countDocuments({ volunteer: user._id, status: { $ne: 'cancelled' } }),
        CommunityPost.countDocuments({ author: user._id }),
        LostFound.countDocuments({ reportedBy: user._id }),
      ]);

    const donated = donations.reduce((sum, d) => sum + d.amount, 0);

    let ngoStats = null;
    if (user.role === 'ngo') {
      const [petsListed, petsAdopted, campaigns, tasks, events] = await Promise.all([
        Pet.countDocuments({ listedBy: user._id }),
        Pet.countDocuments({ listedBy: user._id, status: 'adopted' }),
        Campaign.countDocuments({ ngo: user._id }),
        VolunteerTask.countDocuments({ ngo: user._id }),
        Event.countDocuments({ organiser: user._id }),
      ]);

      const raised = await Donation.aggregate([
        { $match: { ngo: user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      ngoStats = {
        petsListed,
        petsAdopted,
        campaigns,
        tasks,
        events,
        raised: (raised[0] && raised[0].total) || 0,
      };
    }

    res.json({
      user,
      stats: {
        rescuesReported,
        rescuesAssigned,
        adoptions,
        donated,
        donationCount: donations.length,
        signups,
        posts,
        reports,
      },
      ngoStats,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user.', error: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['volunteer', 'ngo', 'petOwner', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.role = role;
    await user.save();

    res.json({ message: 'Role updated to ' + role + '.', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update role.', error: err.message });
  }
};

exports.toggleUserVerified = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.isVerified = !user.isVerified;
    await user.save();

    res.json({
      message: user.isVerified ? 'User verified.' : 'Verification removed.',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user.', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account here.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin account.' });
      }
    }

    if (user.profilePhoto && user.profilePhoto.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePhoto.publicId);
      } catch {
        // best effort
      }
    }

    await user.deleteOne();

    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user.', error: err.message });
  }
};

const MODELS = {
  rescues: { model: Rescue, populate: 'reportedBy assignedVolunteer', label: 'Rescue case' },
  pets: { model: Pet, populate: 'listedBy', label: 'Pet' },
  adoptions: { model: Adoption, populate: 'pet applicant', label: 'Adoption' },
  campaigns: { model: Campaign, populate: 'ngo', label: 'Campaign' },
  donations: { model: Donation, populate: 'donor ngo campaign', label: 'Donation' },
  tasks: { model: VolunteerTask, populate: 'ngo', label: 'Task' },
  lostfound: { model: LostFound, populate: 'reportedBy', label: 'Report' },
  posts: { model: CommunityPost, populate: 'author', label: 'Post' },
  events: { model: Event, populate: 'organiser', label: 'Event' },
};

exports.getCollection = async (req, res) => {
  try {
    const { collection } = req.params;
    const { search, status, page = 1, limit = 20 } = req.query;

    const config = MODELS[collection];
    if (!config) return res.status(404).json({ message: 'Unknown collection.' });

    const filter = {};
    if (status) filter.status = status;

    if (search) {
      const searchable = {
        rescues: ['caseNumber', 'animalType'],
        pets: ['name', 'breed'],
        adoptions: ['applicationNumber'],
        campaigns: ['title'],
        donations: ['receiptNumber', 'transactionId'],
        tasks: ['title'],
        lostfound: ['reportNumber', 'petName', 'color'],
        posts: ['title'],
        events: ['title'],
      };
      const fields = searchable[collection] || [];
      if (fields.length) {
        filter.$or = fields.map((f) => ({ [f]: { $regex: search, $options: 'i' } }));
      }
    }

    let query = config.model.find(filter).sort({ createdAt: -1 });

    if (config.populate) {
      config.populate.split(' ').forEach((p) => {
        query = query.populate(p, 'name email role title');
      });
    }

    const items = await query.skip((page - 1) * limit).limit(Number(limit));
    const total = await config.model.countDocuments(filter);

    res.json({
      items,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      collection,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch collection.', error: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { collection, id } = req.params;

    const config = MODELS[collection];
    if (!config) return res.status(404).json({ message: 'Unknown collection.' });

    const doc = await config.model.findById(id);
    if (!doc) return res.status(404).json({ message: config.label + ' not found.' });

    if (doc.photos && doc.photos.length) {
      for (const p of doc.photos) {
        if (p.publicId) {
          try {
            await cloudinary.uploader.destroy(p.publicId);
          } catch {
            // best effort
          }
        }
      }
    }

    if (doc.coverImage && doc.coverImage.publicId) {
      try {
        await cloudinary.uploader.destroy(doc.coverImage.publicId);
      } catch {
        // best effort
      }
    }

    await doc.deleteOne();

    res.json({ message: config.label + ' deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete.', error: err.message });
  }
};

exports.updateDocumentStatus = async (req, res) => {
  try {
    const { collection, id } = req.params;
    const { status } = req.body;

    const config = MODELS[collection];
    if (!config) return res.status(404).json({ message: 'Unknown collection.' });

    const doc = await config.model.findById(id);
    if (!doc) return res.status(404).json({ message: config.label + ' not found.' });

    if (doc.status === undefined) {
      return res.status(400).json({ message: 'This record has no status field.' });
    }

    doc.status = status;
    await doc.save();

    res.json({ message: 'Status updated to ' + status + '.', document: doc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status.', error: err.message });
  }
};

const toCsv = (rows, headers) => {
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? '"' + s + '"' : s;
  };

  const head = headers.map((h) => escape(h.label)).join(',');
  const body = rows
    .map((row) => headers.map((h) => escape(h.get(row))).join(','))
    .join('\n');

  return head + '\n' + body;
};

exports.exportCsv = async (req, res) => {
  try {
    const { collection } = req.params;

    let csv;
    let filename;

    if (collection === 'users') {
      const users = await User.find().sort({ createdAt: -1 });
      csv = toCsv(users, [
        { label: 'Name', get: (u) => u.name },
        { label: 'Email', get: (u) => u.email },
        { label: 'Phone', get: (u) => u.phone },
        { label: 'District', get: (u) => u.district },
        { label: 'Role', get: (u) => u.role },
        { label: 'Verified', get: (u) => (u.isVerified ? 'Yes' : 'No') },
        { label: 'Joined', get: (u) => new Date(u.createdAt).toISOString().split('T')[0] },
      ]);
      filename = 'paluwasathi-users.csv';
    } else if (collection === 'donations') {
      const donations = await Donation.find({ status: 'completed' })
        .populate('ngo', 'name')
        .populate('campaign', 'title')
        .sort({ createdAt: -1 });
      csv = toCsv(donations, [
        { label: 'Receipt', get: (d) => d.receiptNumber },
        { label: 'Date', get: (d) => new Date(d.paidAt || d.createdAt).toISOString().split('T')[0] },
        { label: 'Amount NPR', get: (d) => d.amount },
        { label: 'Donor', get: (d) => (d.isAnonymous ? 'Anonymous' : (d.donorInfo && d.donorInfo.name)) },
        { label: 'Email', get: (d) => (d.isAnonymous ? '' : (d.donorInfo && d.donorInfo.email)) },
        { label: 'Campaign', get: (d) => (d.campaign && d.campaign.title) || '' },
        { label: 'NGO', get: (d) => (d.ngo && d.ngo.name) || '' },
        { label: 'Method', get: (d) => d.paymentMethod },
        { label: 'Transaction', get: (d) => d.transactionId },
      ]);
      filename = 'paluwasathi-donations.csv';
    } else if (collection === 'rescues') {
      const rescues = await Rescue.find()
        .populate('reportedBy', 'name')
        .populate('assignedVolunteer', 'name')
        .sort({ createdAt: -1 });
      csv = toCsv(rescues, [
        { label: 'Case', get: (r) => r.caseNumber },
        { label: 'Date', get: (r) => new Date(r.createdAt).toISOString().split('T')[0] },
        { label: 'Animal', get: (r) => r.animalType },
        { label: 'Urgency', get: (r) => r.urgency },
        { label: 'Status', get: (r) => r.status },
        { label: 'Location', get: (r) => (r.location && r.location.address) || '' },
        { label: 'Reporter', get: (r) => (r.reportedBy && r.reportedBy.name) || 'Guest' },
        { label: 'Volunteer', get: (r) => (r.assignedVolunteer && r.assignedVolunteer.name) || '' },
      ]);
      filename = 'paluwasathi-rescues.csv';
    } else if (collection === 'adoptions') {
      const adoptions = await Adoption.find()
        .populate('pet', 'name species')
        .populate('applicant', 'name email phone')
        .sort({ createdAt: -1 });
      csv = toCsv(adoptions, [
        { label: 'Application', get: (a) => a.applicationNumber },
        { label: 'Date', get: (a) => new Date(a.createdAt).toISOString().split('T')[0] },
        { label: 'Pet', get: (a) => (a.pet && a.pet.name) || '' },
        { label: 'Species', get: (a) => (a.pet && a.pet.species) || '' },
        { label: 'Applicant', get: (a) => (a.applicant && a.applicant.name) || '' },
        { label: 'Email', get: (a) => (a.applicant && a.applicant.email) || '' },
        { label: 'Phone', get: (a) => (a.applicant && a.applicant.phone) || '' },
        { label: 'Status', get: (a) => a.status },
      ]);
      filename = 'paluwasathi-adoptions.csv';
    } else {
      return res.status(400).json({ message: 'Export not available for this collection.' });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    res.send('\uFEFF' + csv);
  } catch (err) {
    res.status(500).json({ message: 'Export failed.', error: err.message });
  }
};