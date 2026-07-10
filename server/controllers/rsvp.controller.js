const EventRsvp = require('../models/EventRsvp');
const Event = require('../models/Event');

exports.createRsvp = async (req, res) => {
  try {
    const { eventId, attendeeInfo, guestCount, bringingPet, petDetails, notes } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'This event is no longer accepting RSVPs.' });
    }

    if (event.startDate < new Date()) {
      return res.status(400).json({ message: 'This event has already taken place.' });
    }

    const guests = Number(guestCount) || 1;

    if (event.capacity > 0 && event.attendeeCount + guests > event.capacity) {
      return res.status(400).json({ message: 'Not enough spots remaining for that many guests.' });
    }

    const existing = await EventRsvp.findOne({
      event: eventId,
      attendee: req.user.userId,
      status: { $ne: 'cancelled' },
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already RSVPed to this event.' });
    }

    const rsvp = await EventRsvp.create({
      event: eventId,
      attendee: req.user.userId,
      attendeeInfo,
      guestCount: guests,
      bringingPet: !!bringingPet,
      petDetails,
      notes,
    });

    event.attendeeCount += guests;
    await event.save();

    await rsvp.populate({ path: 'event', populate: { path: 'organiser', select: 'name' } });

    res.status(201).json({
      message: 'RSVP confirmed.',
      rsvp,
      ticketNumber: rsvp.ticketNumber,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already RSVPed to this event.' });
    }
    res.status(500).json({ message: 'Failed to RSVP.', error: err.message });
  }
};

exports.getMyRsvps = async (req, res) => {
  try {
    const rsvps = await EventRsvp.find({
      attendee: req.user.userId,
      status: { $ne: 'cancelled' },
    })
      .populate({
        path: 'event',
        populate: { path: 'organiser', select: 'name district' },
      })
      .sort({ createdAt: -1 });

    res.json({ rsvps, count: rsvps.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch RSVPs.', error: err.message });
  }
};

exports.getRsvpById = async (req, res) => {
  try {
    const rsvp = await EventRsvp.findById(req.params.id)
      .populate({
        path: 'event',
        populate: { path: 'organiser', select: 'name district phone email' },
      })
      .populate('attendee', 'name email phone');

    if (!rsvp) return res.status(404).json({ message: 'RSVP not found.' });

    const isAttendee = rsvp.attendee._id.toString() === req.user.userId;
    const isOrganiser = rsvp.event.organiser._id.toString() === req.user.userId;

    if (!isAttendee && !isOrganiser && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ rsvp });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch RSVP.', error: err.message });
  }
};

exports.cancelRsvp = async (req, res) => {
  try {
    const rsvp = await EventRsvp.findById(req.params.id).populate('event');
    if (!rsvp) return res.status(404).json({ message: 'RSVP not found.' });

    if (rsvp.attendee.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only cancel your own RSVP.' });
    }

    if (rsvp.status === 'attended') {
      return res.status(400).json({ message: 'Cannot cancel a completed event.' });
    }

    rsvp.status = 'cancelled';
    await rsvp.save();

    const event = await Event.findById(rsvp.event._id);
    event.attendeeCount = Math.max(event.attendeeCount - rsvp.guestCount, 0);
    await event.save();

    res.json({ message: 'RSVP cancelled.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel RSVP.', error: err.message });
  }
};

exports.markAttended = async (req, res) => {
  try {
    const rsvp = await EventRsvp.findById(req.params.id).populate('event');
    if (!rsvp) return res.status(404).json({ message: 'RSVP not found.' });

    const isOrganiser = rsvp.event.organiser.toString() === req.user.userId;
    if (!isOrganiser && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the organiser can mark attendance.' });
    }

    rsvp.status = 'attended';
    await rsvp.save();

    res.json({ message: 'Marked as attended.', rsvp });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark attendance.', error: err.message });
  }
};