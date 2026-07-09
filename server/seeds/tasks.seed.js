require('dotenv').config();
const mongoose = require('mongoose');
const VolunteerTask = require('../models/VolunteerTask');
const User = require('../models/User');

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const TASKS = [
  {
    title: 'Weekend Street Dog Feeding Drive',
    ngoName: 'Kathmandu Animal Treatment',
    category: 'feeding',
    description: 'Join our team distributing cooked meals to street dogs across Budhanilkantha and Chabahil. We meet at the shelter at 6 AM, load the vans, and cover six feeding points over four hours. No prior experience needed. Wear closed shoes and clothes you do not mind getting dirty. Breakfast and tea provided at the shelter before we set out.',
    address: 'KAT Centre, Budhanilkantha',
    district: 'Kathmandu',
    startDate: daysFromNow(5),
    startTime: '06:00',
    endTime: '10:00',
    volunteersNeeded: 12,
    volunteersJoined: 7,
    requirements: ['Closed shoes', 'Comfortable clothes', 'Physically fit'],
    providesFood: true,
    minAge: 16,
    coverImage: { url: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200' },
  },
  {
    title: 'Emergency Rescue Response Team',
    ngoName: 'Animal Nepal',
    category: 'rescue_drive',
    description: 'We are building a standby team of volunteers who can respond to rescue calls within 30 minutes. This is a training session covering safe animal handling, basic first aid, transport protocols, and when to call a vet. Successful participants join our on-call rotation. This is demanding work — you will encounter animals in distress and sometimes beyond saving. We need people who can stay calm.',
    address: 'Animal Nepal, Chobhar',
    district: 'Kathmandu',
    startDate: daysFromNow(9),
    startTime: '09:00',
    endTime: '16:00',
    volunteersNeeded: 20,
    volunteersJoined: 4,
    requirements: ['Age 18+', 'Two-wheeler licence preferred', 'Available weekends'],
    providesFood: true,
    providesTransport: true,
    minAge: 18,
    urgent: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=1200' },
  },
  {
    title: 'Shelter Cleaning and Dog Walking',
    ngoName: 'Sneha Care',
    category: 'shelter_shift',
    description: 'Our 40 residents need daily care. Volunteers help clean kennels, refill water, prepare food, and walk dogs in rotation. Walking is the part they wait for all week. If you have never handled a dog before, our staff pair you with a calm one. Three hour shift, morning or afternoon.',
    address: 'Sneha Care Shelter, Bhaktapur',
    district: 'Bhaktapur',
    startDate: daysFromNow(3),
    startTime: '08:00',
    endTime: '11:00',
    volunteersNeeded: 8,
    volunteersJoined: 8,
    requirements: ['Comfortable around dogs'],
    minAge: 16,
    status: 'full',
    coverImage: { url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200' },
  },
  {
    title: 'Free Sterilization Camp Support',
    ngoName: 'Animal Nepal',
    category: 'medical_camp',
    description: 'Three-day sterilization camp targeting 150 street dogs in Ward 12. Volunteers assist with catching, holding during pre-op checks, post-operative monitoring, and release. Vets and vet techs handle all clinical work. This is intense and rewarding. You will see surgery. If you are squeamish, consider the feeding drive instead.',
    address: 'Community Hall, Baneshwor',
    district: 'Kathmandu',
    startDate: daysFromNow(14),
    endDate: daysFromNow(16),
    startTime: '07:00',
    endTime: '17:00',
    volunteersNeeded: 15,
    volunteersJoined: 6,
    requirements: ['Age 18+', 'Not squeamish', 'Available all three days'],
    providesFood: true,
    minAge: 18,
    urgent: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200' },
  },
  {
    title: 'School Awareness Programme',
    ngoName: 'Kathmandu Animal Treatment',
    category: 'awareness',
    description: 'We visit schools across the valley teaching children about animal welfare, responsible pet ownership, and what to do if they find an injured animal. Volunteers help run activities and answer questions. Good for anyone comfortable speaking to groups of 30 children. Materials and training provided.',
    address: 'Various schools, Lalitpur',
    district: 'Lalitpur',
    startDate: daysFromNow(7),
    startTime: '10:00',
    endTime: '14:00',
    volunteersNeeded: 6,
    volunteersJoined: 2,
    requirements: ['Comfortable public speaking', 'Good with children'],
    providesTransport: true,
    minAge: 18,
    coverImage: { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200' },
  },
  {
    title: 'Winter Shelter Construction',
    ngoName: 'Sneha Care',
    category: 'other',
    description: 'Physical work building insulated kennels before winter. We need people who can handle basic construction — carrying materials, holding frames, painting. Skilled carpenters especially welcome. Two-day build, meals provided. Bring gloves if you have them.',
    address: 'Sneha Care Shelter, Bhaktapur',
    district: 'Bhaktapur',
    startDate: daysFromNow(21),
    endDate: daysFromNow(22),
    startTime: '08:00',
    endTime: '17:00',
    volunteersNeeded: 10,
    volunteersJoined: 3,
    requirements: ['Physically fit', 'Age 18+', 'Construction experience a plus'],
    providesFood: true,
    minAge: 18,
    coverImage: { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200' },
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const ngos = await User.find({ role: 'ngo' });
    if (ngos.length === 0) {
      console.error('No NGO accounts found. Run: node seeds/ngos.seed.js first');
      process.exit(1);
    }

    const ngoByName = {};
    ngos.forEach((n) => { ngoByName[n.name] = n._id; });

    await VolunteerTask.deleteMany({});
    console.log('Cleared existing tasks');

    for (const t of TASKS) {
      const { ngoName, ...rest } = t;
      await VolunteerTask.create({
        ...rest,
        location: {
          address: t.address,
          district: t.district,
        },
        ngo: ngoByName[ngoName] || ngos[0]._id,
      });
    }

    console.log(`Seeded ${TASKS.length} volunteer tasks`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();