const mongoose = require('mongoose');

const volunteerTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    category: {
      type: String,
      enum: ['rescue_drive', 'shelter_shift', 'feeding', 'awareness', 'medical_camp', 'fundraising', 'other'],
      required: true,
    },

    coverImage: { url: String, publicId: String },
    description: { type: String, maxlength: 2000, required: true },

    location: {
      address: { type: String, required: true },
      district: { type: String, required: true },
      lat: Number,
      lng: Number,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date },
    startTime: { type: String, required: true },
    endTime: { type: String },

    volunteersNeeded: { type: Number, required: true, min: 1 },
    volunteersJoined: { type: Number, default: 0 },

    requirements: [String],
    providesFood: { type: Boolean, default: false },
    providesTransport: { type: Boolean, default: false },
    minAge: { type: Number, default: 16 },

    status: {
      type: String,
      enum: ['open', 'full', 'completed', 'cancelled'],
      default: 'open',
    },
    urgent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

volunteerTaskSchema.virtual('spotsLeft').get(function () {
  return Math.max(this.volunteersNeeded - this.volunteersJoined, 0);
});

volunteerTaskSchema.virtual('daysUntil').get(function () {
  const diff = Math.ceil((this.startDate - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
});

volunteerTaskSchema.virtual('isPast').get(function () {
  return this.startDate < Date.now();
});

volunteerTaskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('VolunteerTask', volunteerTaskSchema);