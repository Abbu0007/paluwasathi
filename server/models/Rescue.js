const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  status: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const rescueSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, unique: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    photos: [{ url: String, publicId: String }],
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    animalType: {
      type: String,
      enum: ['dog', 'cat', 'bird', 'cow', 'monkey', 'other'],
      required: true,
    },
    conditions: [String],
    urgency: {
      type: String,
      enum: ['critical', 'high', 'moderate'],
      required: true,
    },
    description: { type: String, maxlength: 500 },
    contactPhone: { type: String },
    status: {
      type: String,
      enum: ['reported', 'assigned', 'en_route', 'on_scene', 'rescued', 'closed'],
      default: 'reported',
    },
    assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    progressPercent: { type: Number, default: 0 },
    timeline: [timelineSchema],
    volunteersAvailable: { type: Boolean, default: false },
    notifiedVolunteers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate case number before saving
rescueSchema.pre('save', async function () {
  if (!this.caseNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Rescue').countDocuments();
    this.caseNumber = `KTM-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});
// 2dsphere index for geo queries
rescueSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('Rescue', rescueSchema);