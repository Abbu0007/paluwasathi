const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema(
  {
    applicationNumber: { type: String, unique: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    personal: {
      fullName: String,
      email: String,
      phone: String,
      address: String,
      district: String,
    },

    home: {
      homeType: { type: String, enum: ['apartment', 'house', 'farm'] },
      hasYard: Boolean,
      ownOrRent: { type: String, enum: ['own', 'rent'] },
      householdSize: Number,
      hasChildren: Boolean,
      currentPets: String,
    },

    lifestyle: {
      hoursAlone: Number,
      activityLevel: { type: String, enum: ['low', 'moderate', 'high'] },
      experience: String,
      reason: String,
      commitment: Boolean,
    },

    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewNote: String,
  },
  { timestamps: true }
);

adoptionSchema.pre('save', async function () {
  if (!this.applicationNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Adoption').countDocuments();
    this.applicationNumber = `APP-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Adoption', adoptionSchema);