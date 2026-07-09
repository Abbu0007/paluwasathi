const mongoose = require('mongoose');

const taskSignupSchema = new mongoose.Schema(
  {
    confirmationNumber: { type: String, unique: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'VolunteerTask', required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    volunteerInfo: {
      name: String,
      email: String,
      phone: String,
    },

    experience: { type: String, maxlength: 500 },
    notes: { type: String, maxlength: 300 },
    hasTransport: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['confirmed', 'attended', 'no_show', 'cancelled'],
      default: 'confirmed',
    },

    hoursLogged: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSignupSchema.index({ task: 1, volunteer: 1 }, { unique: true });

taskSignupSchema.pre('save', async function () {
  if (!this.confirmationNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('TaskSignup').countDocuments();
    this.confirmationNumber = 'VOL-' + year + '-' + String(count + 1).padStart(4, '0');
  }
});

module.exports = mongoose.model('TaskSignup', taskSignupSchema);