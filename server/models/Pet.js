const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    species: {
      type: String,
      enum: ['dog', 'cat', 'bird', 'rabbit', 'other'],
      required: true,
    },
    breed: { type: String, default: 'Mixed' },
    age: { type: Number, required: true },
    ageUnit: { type: String, enum: ['months', 'years'], default: 'years' },
    gender: { type: String, enum: ['male', 'female'], required: true },
    size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    photos: [{ url: String, publicId: String }],
    shelter: {
      name: { type: String, required: true },
      location: { type: String, required: true },
      verified: { type: Boolean, default: false },
      phone: String,
    },
    traits: [String],
    vaccinated: { type: Boolean, default: false },
    neutered: { type: Boolean, default: false },
    microchipped: { type: Boolean, default: false },
    description: { type: String, maxlength: 1000 },
    status: {
      type: String,
      enum: ['available', 'pending', 'adopted'],
      default: 'available',
    },
    listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    waitingSince: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

petSchema.index({ name: 'text', breed: 'text', description: 'text' });

petSchema.virtual('waitingDays').get(function () {
  return Math.floor((Date.now() - this.waitingSince) / (1000 * 60 * 60 * 24));
});

petSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Pet', petSchema);