const LostFound = require('../models/LostFound');
const { distanceKm } = require('../utils/geo');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const MATCH_RADIUS_KM = 5;
const MATCH_DAYS_WINDOW = 30;

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 1000, quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

const scoreMatch = (report, candidate) => {
  let score = 0;

  const dist = distanceKm(
    report.location.lat, report.location.lng,
    candidate.location.lat, candidate.location.lng
  );

  if (dist <= 1) score += 40;
  else if (dist <= 3) score += 25;
  else if (dist <= 5) score += 15;

  if (report.species === candidate.species) score += 25;

  if (report.color && candidate.color) {
    const c1 = report.color.toLowerCase();
    const c2 = candidate.color.toLowerCase();
    if (c1 === c2) score += 20;
    else if (c1.includes(c2) || c2.includes(c1)) score += 10;
  }

  if (report.size === candidate.size) score += 10;

  if (report.gender !== 'unknown' && report.gender === candidate.gender) score += 5;

  if (report.hasCollar && candidate.hasCollar) score += 10;

  const daysDiff = Math.abs(
    (new Date(report.date) - new Date(candidate.date)) / (1000 * 60 * 60 * 24)
  );
  if (daysDiff <= 3) score += 15;
  else if (daysDiff <= 7) score += 8;

  return { score, distanceKm: Math.round(dist * 10) / 10 };
};

const findMatches = async (report) => {
  const oppositeType = report.type === 'lost' ? 'found' : 'lost';
  const cutoff = new Date(Date.now() - MATCH_DAYS_WINDOW * 24 * 60 * 60 * 1000);

  const candidates = await LostFound.find({
    type: oppositeType,
    status: 'active',
    species: report.species,
    _id: { $ne: report._id },
    date: { $gte: cutoff },
  });

  const scored = candidates
    .map((c) => {
      const { score, distanceKm: dist } = scoreMatch(report, c);
      return { report: c, score, distanceKm: dist };
    })
    .filter((m) => m.distanceKm <= MATCH_RADIUS_KM && m.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored;
};

exports.createReport = async (req, res) => {
  try {
    const body = req.body;

    let photos = [];
    if (req.files && req.files.length) {
      const uploads = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.buffer, 'paluwasathi/lostfound'))
      );
      photos = uploads.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
    }

    const report = await LostFound.create({
      type: body.type,
      reportedBy: req.user.userId,
      petName: body.petName,
      species: body.species,
      breed: body.breed,
      color: body.color,
      size: body.size,
      gender: body.gender,
      age: body.age,
      distinctiveMarks: body.distinctiveMarks,
      hasCollar: body.hasCollar === 'true' || body.hasCollar === true,
      collarDescription: body.collarDescription,
      isMicrochipped: body.isMicrochipped === 'true' || body.isMicrochipped === true,
      photos,
      location: {
        address: body.address,
        district: body.district,
        lat: Number(body.lat),
        lng: Number(body.lng),
      },
      date: body.date,
      description: body.description,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      reward: body.reward ? Number(body.reward) : 0,
    });

    const matches = await findMatches(report);

    res.status(201).json({
      message: 'Report submitted.',
      report,
      reportNumber: report.reportNumber,
      matches,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create report.', error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const {
      type, species, district, status = 'active',
      sort = 'newest', page = 1, limit = 12,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (species) filter.species = { $in: species.split(',') };
    if (district) filter['location.district'] = district;

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      date_desc: { date: -1 },
    };

    const reports = await LostFound.find(filter)
      .populate('reportedBy', 'name')
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await LostFound.countDocuments(filter);

    res.json({ reports, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports.', error: err.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id)
      .populate('reportedBy', 'name')
      .populate('matchedWith');

    if (!report) return res.status(404).json({ message: 'Report not found.' });

    let matches = [];
    if (report.status === 'active') {
      matches = await findMatches(report);
    }

    res.json({ report, matches });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report.', error: err.message });
  }
};

exports.getMatches = async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    const matches = await findMatches(report);
    res.json({ matches, radiusKm: MATCH_RADIUS_KM });
  } catch (err) {
    res.status(500).json({ message: 'Failed to find matches.', error: err.message });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await LostFound.find({ reportedBy: req.user.userId })
      .populate('matchedWith', 'reportNumber petName type')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your reports.', error: err.message });
  }
};

exports.markReunited = async (req, res) => {
  try {
    const { matchedWithId } = req.body;

    const report = await LostFound.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    const isOwner = report.reportedBy.toString() === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own report.' });
    }

    report.status = 'reunited';
    report.reunitedAt = new Date();

    if (matchedWithId) {
      const other = await LostFound.findById(matchedWithId);
      if (other) {
        report.matchedWith = other._id;
        other.status = 'reunited';
        other.matchedWith = report._id;
        other.reunitedAt = new Date();
        await other.save();
      }
    }

    await report.save();
    res.json({ message: 'Marked as reunited.', report });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update report.', error: err.message });
  }
};

exports.closeReport = async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    const isOwner = report.reportedBy.toString() === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only close your own report.' });
    }

    report.status = 'closed';
    await report.save();
    res.json({ message: 'Report closed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to close report.', error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const lost = await LostFound.countDocuments({ type: 'lost', status: 'active' });
    const found = await LostFound.countDocuments({ type: 'found', status: 'active' });
    const reunited = await LostFound.countDocuments({ status: 'reunited' });

    res.json({ lost, found, reunited });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message });
  }
};