const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');
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

exports.getCampaigns = async (req, res) => {
  try {
    const { category, status = 'active', urgent, sort = 'newest', page = 1, limit = 9 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = { $in: category.split(',') };
    if (urgent === 'true') filter.urgent = true;

    const sortMap = {
      newest: { createdAt: -1 },
      most_funded: { raisedAmount: -1 },
      ending_soon: { deadline: 1 },
      least_funded: { raisedAmount: 1 },
    };

    const campaigns = await Campaign.find(filter)
      .populate('ngo', 'name district')
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Campaign.countDocuments(filter);

    res.json({ campaigns, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch campaigns.', error: err.message });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('ngo', 'name district phone email');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });

    const recentDonations = await Donation.find({
      campaign: campaign._id,
      status: 'completed',
    })
      .populate('donor', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const donations = recentDonations.map((d) => ({
      _id: d._id,
      amount: d.amount,
      message: d.message,
      createdAt: d.createdAt,
      donorName: d.isAnonymous ? 'Anonymous' : (d.donorInfo.name || 'Supporter'),
    }));

    res.json({ campaign, donations });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch campaign.', error: err.message });
  }
};

exports.getNgos = async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo' }).select('name district phone email createdAt');

    const withStats = await Promise.all(
      ngos.map(async (ngo) => {
        const campaigns = await Campaign.countDocuments({ ngo: ngo._id, status: 'active' });
        const donations = await Donation.aggregate([
          { $match: { ngo: ngo._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]);

        return {
          _id: ngo._id,
          name: ngo.name,
          district: ngo.district,
          phone: ngo.phone,
          email: ngo.email,
          activeCampaigns: campaigns,
          totalRaised: donations[0]?.total || 0,
          donorCount: donations[0]?.count || 0,
        };
      })
    );

    res.json({ ngos: withStats });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch NGOs.', error: err.message });
  }
};

exports.getNgoProfile = async (req, res) => {
  try {
    const ngo = await User.findOne({ _id: req.params.id, role: 'ngo' })
      .select('name district phone email createdAt');
    if (!ngo) return res.status(404).json({ message: 'NGO not found.' });

    const campaigns = await Campaign.find({ ngo: ngo._id, status: 'active' }).sort({ createdAt: -1 });

    const donations = await Donation.aggregate([
      { $match: { ngo: ngo._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const Pet = require('../models/Pet');
    const petsListed = await Pet.countDocuments({ listedBy: ngo._id });
    const petsAdopted = await Pet.countDocuments({ listedBy: ngo._id, status: 'adopted' });

    res.json({
      ngo,
      campaigns,
      stats: {
        totalRaised: donations[0]?.total || 0,
        donorCount: donations[0]?.count || 0,
        activeCampaigns: campaigns.length,
        petsListed,
        petsAdopted,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch NGO profile.', error: err.message });
  }
};

exports.createCampaign = async (req, res) => {
  try {
    const body = req.body;

    let coverImage = {};
    if (req.files && req.files.length) {
      const result = await uploadToCloudinary(req.files[0].buffer, 'paluwasathi/campaigns');
      coverImage = { url: result.secure_url, publicId: result.public_id };
    }

    const campaign = await Campaign.create({
      ...body,
      coverImage,
      goalAmount: Number(body.goalAmount),
      urgent: body.urgent === 'true' || body.urgent === true,
      ngo: req.user.userId,
    });

    res.status(201).json({ message: 'Campaign created.', campaign });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create campaign.', error: err.message });
  }
};

exports.getMyCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ ngo: req.user.userId }).sort({ createdAt: -1 });
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch campaigns.', error: err.message });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });

    const isOwner = campaign.ngo.toString() === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own campaigns.' });
    }

    const allowed = ['title', 'category', 'shortDescription', 'description', 'goalAmount', 'deadline', 'status', 'urgent'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) campaign[field] = req.body[field];
    });

    await campaign.save();
    res.json({ message: 'Campaign updated.', campaign });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update campaign.', error: err.message });
  }
};

exports.getCampaignStats = async (req, res) => {
  try {
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    const totalRaised = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const donorCount = await Donation.countDocuments({ status: 'completed' });

    res.json({
      activeCampaigns,
      totalRaised: totalRaised[0]?.total || 0,
      donorCount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message });
  }
};