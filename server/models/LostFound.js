const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema(
  {
    reportNumber: { type: String, unique: true },
    type: { type: String, enum: ['lost', 'found'], required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    petName: { type: String, trim: true },
    species: {
      type: String,
      enum: ['dog', 'cat', 'bird', 'rabbit', 'other'],
      required: true,
    },
    breed: String,
    color: { type: String, required: true },
    size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    age: String,

    distinctiveMarks: String,
    hasCollar: { type: Boolean, default: false },
    collarDescription: String,
    isMicrochipped: { type: Boolean, default: false },

    photos: [{ url: String, publicId: String }],

    location: {
      address: { type: String, required: true },
      district: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    date: { type: Date, required: true },
    description: { type: String, maxlength: 1000 },

    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: String,

    reward: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['active', 'reunited', 'closed'],
      default: 'active',
    },

    matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'LostFound', default: null },
    reunitedAt: Date,
  },
  { timestamps: true }
);

lostFoundSchema.pre('save', async function () {
  if (!this.reportNumber) {
    const year = new Date().getFullYear();
    const prefix = this.type === 'lost' ? 'LST' : 'FND';
    const count = await mongoose.model('LostFound').countDocuments({ type: this.type });
    this.reportNumber = prefix + '-' + year + '-' + String(count + 1).padStart(4, '0');
  }
});

lostFoundSchema.virtual('daysAgo').get(function () {
  return Math.floor((Date.now() - this.date) / (1000 * 60 * 60 * 24));
});

lostFoundSchema.set('toJSON', { virtuals: true });

lostFoundSchema.index({ 'location.lat': 1, 'location.lng': 1 });
lostFoundSchema.index({ species: 1, status: 1, type: 1 });

module.exports = mongoose.model('LostFound', lostFoundSchema);