const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

exports.initiateDonation = async (req, res) => {
  try {
    const { campaignId, ngoId, amount, donorInfo, isAnonymous, message, paymentMethod } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ message: 'Minimum donation is NPR 100.' });
    }

    let targetNgo = ngoId;
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
      if (campaign.status !== 'active') {
        return res.status(400).json({ message: 'This campaign is no longer accepting donations.' });
      }
      targetNgo = campaign.ngo;
    }

    if (!targetNgo) {
      return res.status(400).json({ message: 'A campaign or NGO must be specified.' });
    }

    const donation = await Donation.create({
      donor: req.user?.userId || null,
      campaign: campaignId || null,
      ngo: targetNgo,
      amount: Number(amount),
      donorInfo,
      isAnonymous: !!isAnonymous,
      message,
      paymentMethod,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Donation initiated.',
      donation,
      transactionId: donation.transactionId,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to initiate donation.', error: err.message });
  }
};

exports.confirmDonation = async (req, res) => {
  try {
    const { transactionId, success } = req.body;

    const donation = await Donation.findOne({ transactionId });
    if (!donation) return res.status(404).json({ message: 'Transaction not found.' });

    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'This transaction has already been processed.' });
    }

    if (!success) {
      donation.status = 'failed';
      await donation.save();
      return res.json({ message: 'Payment failed.', donation });
    }

    donation.status = 'completed';
    donation.paidAt = new Date();
    await donation.save();

    if (donation.campaign) {
      const campaign = await Campaign.findById(donation.campaign);
      campaign.raisedAmount += donation.amount;
      campaign.donorCount += 1;
      if (campaign.raisedAmount >= campaign.goalAmount) {
        campaign.status = 'completed';
      }
      await campaign.save();
    }

    await donation.populate('campaign');
    await donation.populate('ngo', 'name district');

    res.json({ message: 'Donation successful.', donation });
  } catch (err) {
    res.status(500).json({ message: 'Failed to confirm donation.', error: err.message });
  }
};

exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('campaign', 'title slug coverImage')
      .populate('ngo', 'name district phone email')
      .populate('donor', 'name email');

    if (!donation) return res.status(404).json({ message: 'Donation not found.' });

    const isDonor = donation.donor && donation.donor._id.toString() === req.user.userId;
    const isNgo = donation.ngo._id.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isDonor && !isNgo && !isAdmin) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ donation });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch donation.', error: err.message });
  }
};

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.userId, status: 'completed' })
      .populate('campaign', 'title coverImage')
      .populate('ngo', 'name district')
      .sort({ createdAt: -1 });

    const total = donations.reduce((sum, d) => sum + d.amount, 0);

    res.json({ donations, total, count: donations.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch donations.', error: err.message });
  }
};

exports.getNgoDonations = async (req, res) => {
  try {
    const { campaignId } = req.query;

    const filter = { ngo: req.user.userId, status: 'completed' };
    if (campaignId) filter.campaign = campaignId;

    const donations = await Donation.find(filter)
      .populate('campaign', 'title')
      .populate('donor', 'name email phone')
      .sort({ createdAt: -1 });

    const visible = donations.map((d) => ({
      _id: d._id,
      receiptNumber: d.receiptNumber,
      amount: d.amount,
      message: d.message,
      campaign: d.campaign,
      paymentMethod: d.paymentMethod,
      createdAt: d.createdAt,
      paidAt: d.paidAt,
      isAnonymous: d.isAnonymous,
      donorInfo: d.isAnonymous
        ? { name: 'Anonymous Donor', email: null, phone: null }
        : d.donorInfo,
    }));

    const total = donations.reduce((sum, d) => sum + d.amount, 0);

    res.json({ donations: visible, total, count: donations.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch donations.', error: err.message });
  }
};

exports.getNgoDonationStats = async (req, res) => {
  try {
    const donations = await Donation.find({ ngo: req.user.userId, status: 'completed' });

    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    const thisMonth = donations
      .filter((d) => {
        const now = new Date();
        const paid = new Date(d.paidAt);
        return paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear();
      })
      .reduce((sum, d) => sum + d.amount, 0);

    const activeCampaigns = await Campaign.countDocuments({ ngo: req.user.userId, status: 'active' });

    res.json({
      totalRaised: total,
      thisMonth,
      donorCount: donations.length,
      activeCampaigns,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message });
  }
};