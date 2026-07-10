const mongoose = require('mongoose');

const eventRsvpSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    attendeeInfo: {
      name: String,
      email: String,
      phone: String,
    },

    guestCount: { type: Number, default: 1, min: 1, max: 5 },
    bringingPet: { type: Boolean, default: false },
    petDetails: String,
    notes: { type: String, maxlength: 300 },

    status: {
      type: String,
      enum: ['confirmed', 'attended', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

eventRsvpSchema.index({ event: 1, attendee: 1 }, { unique: true });

eventRsvpSchema.pre('save', async function () {
  if (!this.ticketNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('EventRsvp').countDocuments();
    this.ticketNumber = 'EVT-' + year + '-' + String(count + 1).padStart(4, '0');
  }
});

module.exports = mongoose.model('EventRsvp', eventRsvpSchema);