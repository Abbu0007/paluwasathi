const Event = require('../models/Event');
const EventRsvp = require('../models/EventRsvp');
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

exports.getEvents = async (req, res) => {
  try {
    const { category, district, status = 'upcoming', featured, sort = 'soonest', page = 1, limit = 9 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = { $in: category.split(',') };
    if (district) filter['location.district'] = district;
    if (featured === 'true') filter.featured = true;

    if (status === 'upcoming') filter.startDate = { $gte: new Date() };

    const sortMap = {
      soonest: { featured: -1, startDate: 1 },
      newest: { createdAt: -1 },
      popular: { attendeeCount: -1 },
    };

    const events = await Event.find(filter)
      .populate('organiser', 'name district')
      .sort(sortMap[sort] || sortMap.soonest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Event.countDocuments(filter);

    res.json({ events, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events.', error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organiser', 'name district phone email');
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    let hasRsvped = false;
    let myRsvp = null;
    if (req.user) {
      myRsvp = await EventRsvp.findOne({
        event: event._id,
        attendee: req.user.userId,
        status: { $ne: 'cancelled' },
      });
      hasRsvped = !!myRsvp;
    }

    res.json({ event, hasRsvped, myRsvp });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch event.', error: err.message });
  }
};

exports.getEventStats = async (req, res) => {
  try {
    const upcoming = await Event.countDocuments({ status: 'upcoming', startDate: { $gte: new Date() } });
    const attendees = await EventRsvp.countDocuments({ status: { $in: ['confirmed', 'attended'] } });
    const completed = await Event.countDocuments({ status: 'completed' });

    res.json({ upcoming, attendees, completed });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const body = req.body;

    let coverImage = {};
    if (req.files && req.files.length) {
      const result = await uploadToCloudinary(req.files[0].buffer, 'paluwasathi/events');
      coverImage = { url: result.secure_url, publicId: result.public_id };
    }

    const event = await Event.create({
      title: body.title,
      category: body.category,
      coverImage,
      shortDescription: body.shortDescription,
      description: body.description,
      location: {
        venue: body.venue,
        address: body.address,
        district: body.district,
        lat: body.lat ? Number(body.lat) : undefined,
        lng: body.lng ? Number(body.lng) : undefined,
      },
      startDate: body.startDate,
      endDate: body.endDate || undefined,
      startTime: body.startTime,
      endTime: body.endTime || undefined,
      capacity: body.capacity ? Number(body.capacity) : 0,
      isFree: body.isFree !== 'false' && body.isFree !== false,
      ticketPrice: body.ticketPrice ? Number(body.ticketPrice) : 0,
      highlights: body.highlights ? JSON.parse(body.highlights) : [],
      organiser: req.user.userId,
    });

    res.status(201).json({ message: 'Event published.', event });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create event.', error: err.message });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organiser: req.user.userId }).sort({ startDate: -1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events.', error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const isOwner = event.organiser.toString() === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own events.' });
    }

    const allowed = ['title', 'shortDescription', 'description', 'startDate', 'startTime', 'endTime', 'capacity', 'status'];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) event[f] = req.body[f];
    });

    await event.save();
    res.json({ message: 'Event updated.', event });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update event.', error: err.message });
  }
};

exports.getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const isOwner = event.organiser.toString() === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const rsvps = await EventRsvp.find({ event: event._id, status: { $ne: 'cancelled' } })
      .populate('attendee', 'name email phone district')
      .sort({ createdAt: -1 });

    const totalGuests = rsvps.reduce((sum, r) => sum + r.guestCount, 0);

    res.json({ rsvps, event, totalGuests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attendees.', error: err.message });
  }
};

exports.getNgoEventStats = async (req, res) => {
  try {
    const events = await Event.find({ organiser: req.user.userId });
    const eventIds = events.map((e) => e._id);

    const upcoming = events.filter((e) => e.status === 'upcoming' && e.startDate >= new Date()).length;
    const completed = events.filter((e) => e.status === 'completed').length;

    const rsvps = await EventRsvp.find({ event: { $in: eventIds }, status: { $ne: 'cancelled' } });
    const totalGuests = rsvps.reduce((sum, r) => sum + r.guestCount, 0);

    res.json({
      upcomingEvents: upcoming,
      completedEvents: completed,
      totalRsvps: rsvps.length,
      totalGuests,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message });
  }
};