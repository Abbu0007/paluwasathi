const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, unique: true },
    organiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    category: {
      type: String,
      enum: ['adoption_fair', 'vaccination_camp', 'awareness', 'fundraiser', 'workshop', 'other'],
      required: true,
    },

    coverImage: { url: String, publicId: String },
    shortDescription: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 3000 },

    location: {
      venue: { type: String, required: true },
      address: { type: String, required: true },
      district: { type: String, required: true },
      lat: Number,
      lng: Number,
    },

    startDate: { type: Date, required: true },
    endDate: Date,
    startTime: { type: String, required: true },
    endTime: String,

    capacity: { type: Number, default: 0 },
    attendeeCount: { type: Number, default: 0 },

    isFree: { type: Boolean, default: true },
    ticketPrice: { type: Number, default: 0 },

    highlights: [String],

    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

eventSchema.pre('save', async function () {
  if (!this.slug) {
    const base = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const count = await mongoose.model('Event').countDocuments();
    this.slug = base + '-' + (count + 1);
  }
});

eventSchema.virtual('spotsLeft').get(function () {
  if (!this.capacity) return null;
  return Math.max(this.capacity - this.attendeeCount, 0);
});

eventSchema.virtual('daysUntil').get(function () {
  return Math.ceil((this.startDate - Date.now()) / (1000 * 60 * 60 * 24));
});

eventSchema.virtual('isPast').get(function () {
  return this.startDate < Date.now();
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.index({ startDate: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);