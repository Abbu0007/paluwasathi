require('dotenv').config();
const mongoose = require('mongoose');
const LostFound = require('../models/LostFound');
const User = require('../models/User');

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const REPORTS = [
  {
    type: 'lost',
    petName: 'Kaalu',
    species: 'dog',
    breed: 'Nepali Street Dog',
    color: 'Black',
    size: 'medium',
    gender: 'male',
    age: '3 years',
    distinctiveMarks: 'White patch on chest, torn left ear',
    hasCollar: true,
    collarDescription: 'Red leather collar, no tag',
    location: { address: 'Baneshwor Chowk, Kathmandu', district: 'Kathmandu', lat: 27.6893, lng: 85.3436 },
    date: daysAgo(4),
    description: 'Kaalu slipped out of the gate on Saturday evening. He is friendly but nervous around traffic. Responds to his name. Please call any time, day or night.',
    contactName: 'Suman Shrestha',
    contactPhone: '9841234567',
    contactEmail: 'suman@example.com',
    reward: 5000,
    photos: [{ url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800' }],
  },
  {
    type: 'found',
    species: 'dog',
    breed: 'Street Dog Mix',
    color: 'Black',
    size: 'medium',
    gender: 'male',
    age: 'Adult',
    distinctiveMarks: 'White marking on chest, one ear looks damaged',
    hasCollar: true,
    collarDescription: 'Red collar, worn',
    location: { address: 'New Baneshwor, near Everest Hotel', district: 'Kathmandu', lat: 27.6910, lng: 85.3390 },
    date: daysAgo(2),
    description: 'Found this dog wandering near the hotel entrance. Very friendly, clearly someone pet. Currently keeping him at my home. He seems well fed and cared for.',
    contactName: 'Anita Gurung',
    contactPhone: '9851112233',
    photos: [{ url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800' }],
  },
  {
    type: 'lost',
    petName: 'Mimi',
    species: 'cat',
    breed: 'Domestic Shorthair',
    color: 'Grey and white',
    size: 'small',
    gender: 'female',
    age: '2 years',
    distinctiveMarks: 'Grey tabby with white socks and white bib',
    hasCollar: false,
    isMicrochipped: true,
    location: { address: 'Patan Durbar Square area, Lalitpur', district: 'Lalitpur', lat: 27.6727, lng: 85.3250 },
    date: daysAgo(8),
    description: 'Mimi is an indoor cat who escaped through a window. She is microchipped. Very shy with strangers, may be hiding. Please do not chase her, just call us.',
    contactName: 'Rajesh Maharjan',
    contactPhone: '9802345678',
    contactEmail: 'rajesh@example.com',
    reward: 3000,
    photos: [{ url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800' }],
  },
  {
    type: 'found',
    species: 'cat',
    color: 'Orange',
    size: 'small',
    gender: 'unknown',
    age: 'Young',
    distinctiveMarks: 'Orange tabby, very thin',
    hasCollar: false,
    location: { address: 'Thamel, Kathmandu', district: 'Kathmandu', lat: 27.7154, lng: 85.3123 },
    date: daysAgo(1),
    description: 'Small orange cat has been hanging around our guesthouse for three days. Seems hungry and lost. Feeding it for now but cannot keep it long term.',
    contactName: 'Prakash Thapa',
    contactPhone: '9813456789',
    photos: [{ url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800' }],
  },
  {
    type: 'lost',
    petName: 'Bruno',
    species: 'dog',
    breed: 'Labrador',
    color: 'Golden',
    size: 'large',
    gender: 'male',
    age: '5 years',
    distinctiveMarks: 'Golden lab, slight limp in back left leg',
    hasCollar: true,
    collarDescription: 'Blue collar with brass tag reading Bruno',
    isMicrochipped: true,
    location: { address: 'Bhaktapur Durbar Square', district: 'Bhaktapur', lat: 27.6722, lng: 85.4278 },
    date: daysAgo(12),
    description: 'Bruno wandered off during a family visit to Bhaktapur. He is gentle, good with children, and does not bite. Microchipped and wearing a tag. Getting desperate.',
    contactName: 'Sita Karki',
    contactPhone: '9861234567',
    reward: 10000,
    photos: [{ url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800' }],
  },
  {
    type: 'found',
    species: 'dog',
    color: 'Brown',
    size: 'small',
    gender: 'female',
    age: 'Puppy',
    distinctiveMarks: 'Small brown puppy, no collar',
    hasCollar: false,
    location: { address: 'Chabahil, Kathmandu', district: 'Kathmandu', lat: 27.7180, lng: 85.3450 },
    date: daysAgo(3),
    description: 'Found a puppy alone near the temple. No mother or siblings in sight. Approximately two months old. Taking care of her but need to find her owner or a home.',
    contactName: 'Deepak Tamang',
    contactPhone: '9824567890',
    photos: [{ url: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800' }],
  },
  {
    type: 'lost',
    petName: 'Coco',
    species: 'bird',
    breed: 'Cockatiel',
    color: 'Grey and yellow',
    size: 'small',
    gender: 'male',
    age: '4 years',
    distinctiveMarks: 'Grey body, yellow crest, orange cheek patches',
    location: { address: 'Kupondole, Lalitpur', district: 'Lalitpur', lat: 27.6820, lng: 85.3160 },
    date: daysAgo(6),
    description: 'Coco flew out when the window was left open. He whistles a distinctive tune. Very tame, will land on shoulders. Reward offered for safe return.',
    contactName: 'Bina Adhikari',
    contactPhone: '9807654321',
    reward: 2000,
    photos: [{ url: 'https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?w=800' }],
  },
  {
    type: 'found',
    species: 'dog',
    color: 'Golden',
    size: 'large',
    gender: 'male',
    age: 'Adult',
    distinctiveMarks: 'Large golden dog, limping slightly, blue collar with tag',
    hasCollar: true,
    collarDescription: 'Blue collar, has a name tag',
    location: { address: 'Suryabinayak, Bhaktapur', district: 'Bhaktapur', lat: 27.6650, lng: 85.4310 },
    date: daysAgo(10),
    description: 'Large friendly golden dog found near the temple road. Wearing a blue collar with a tag but the writing is worn. Seems to have an injured leg. Being kept safe.',
    contactName: 'Hari Prasad Shrestha',
    contactPhone: '9843216789',
    photos: [{ url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800' }],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ role: { $in: ['volunteer', 'petOwner'] } }).limit(5);
    if (users.length === 0) {
      console.error('No regular users found. Register at least one user first.');
      process.exit(1);
    }

    await LostFound.deleteMany({});
    console.log('Cleared existing reports');

    for (let i = 0; i < REPORTS.length; i++) {
      await LostFound.create({
        ...REPORTS[i],
        reportedBy: users[i % users.length]._id,
      });
    }

    console.log(`Seeded ${REPORTS.length} lost and found reports`);
    console.log('\nMatch pairs seeded for testing:');
    console.log('  Kaalu (lost, black dog, Baneshwor) <-> found black dog New Baneshwor');
    console.log('  Bruno (lost, golden lab, Bhaktapur) <-> found golden dog Suryabinayak');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();