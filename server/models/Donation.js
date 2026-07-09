const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, unique: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    amount: { type: Number, required: true, min: 100 },
    currency: { type: String, default: 'NPR' },

    donorInfo: {
      name: String,
      email: String,
      phone: String,
    },

    isAnonymous: { type: Boolean, default: false },
    message: { type: String, maxlength: 300 },

    paymentMethod: {
      type: String,
      enum: ['esewa', 'khalti', 'card', 'bank'],
      required: true,
    },
    transactionId: { type: String, unique: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paidAt: Date,
  },
  { timestamps: true }
);

donationSchema.pre('save', async function () {
  if (!this.receiptNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Donation').countDocuments();
    this.receiptNumber = 'RCP-' + year + '-' + String(count + 1).padStart(5, '0');
  }
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
  }
});

module.exports = mongoose.model('Donation', donationSchema);