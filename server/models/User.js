const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    district: { type: String, required: true },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ['volunteer', 'ngo', 'petOwner', 'admin'],
      default: 'volunteer',
    },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    savedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);