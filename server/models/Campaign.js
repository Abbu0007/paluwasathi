const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['medical', 'shelter', 'food', 'rescue', 'sterilization', 'other'],
      required: true,
    },
    coverImage: { url: String, publicId: String },
    shortDescription: { type: String, maxlength: 200, required: true },
    description: { type: String, maxlength: 3000, required: true },
    goalAmount: { type: Number, required: true, min: 1000 },
    raisedAmount: { type: Number, default: 0 },
    donorCount: { type: Number, default: 0 },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
    },
    urgent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

campaignSchema.pre('save', async function () {
  if (!this.slug) {
    const base = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const count = await mongoose.model('Campaign').countDocuments();
    this.slug = base + '-' + (count + 1);
  }
});

campaignSchema.virtual('progressPercent').get(function () {
  if (!this.goalAmount) return 0;
  return Math.min(Math.round((this.raisedAmount / this.goalAmount) * 100), 100);
});

campaignSchema.virtual('daysLeft').get(function () {
  if (!this.deadline) return null;
  const diff = Math.ceil((this.deadline - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
});

campaignSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);