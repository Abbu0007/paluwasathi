const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    district: { type: String, required: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['volunteer', 'ngo', 'petOwner', 'admin'],
      default: 'volunteer',
    },

    profilePhoto: {
      url: String,
      publicId: String,
    },
    bio: { type: String, maxlength: 500 },
    website: { type: String, trim: true },

    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null, select: false },
    otpExpiry: { type: Date, default: null, select: false },
    otpAttempts: { type: Number, default: 0, select: false },

    resetToken: { type: String, default: null, select: false },
    resetTokenExpiry: { type: Date, default: null, select: false },

    savedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);