require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const NGOS = [
  {
    name: 'Animal Nepal',
    email: 'animalnepal@paluwasathi.com',
    phone: '9800000001',
    district: 'Kathmandu',
    password: 'Ngo@123456',
    role: 'ngo',
    isVerified: true,
  },
  {
    name: 'Sneha Care',
    email: 'snehacare@paluwasathi.com',
    phone: '9800000002',
    district: 'Bhaktapur',
    password: 'Ngo@123456',
    role: 'ngo',
    isVerified: true,
  },
  {
    name: 'Kathmandu Animal Treatment',
    email: 'kat@paluwasathi.com',
    phone: '9800000003',
    district: 'Kathmandu',
    password: 'Ngo@123456',
    role: 'ngo',
    isVerified: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({ role: 'ngo' });
    console.log('Cleared existing NGO accounts');

    for (const ngo of NGOS) {
      const hashed = await bcrypt.hash(ngo.password, 10);
      const created = await User.create({ ...ngo, password: hashed });
      console.log(`Created NGO: ${created.name} (${created.email})`);
    }

    console.log('\nLogin with any of these:');
    NGOS.forEach((n) => console.log(`  ${n.email} / Ngo@123456`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();