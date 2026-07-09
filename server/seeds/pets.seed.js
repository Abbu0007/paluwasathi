require('dotenv').config();
const mongoose = require('mongoose');
const Pet = require('../models/Pet');
const User = require('../models/User');

const PETS = [
  { name: 'Bruno', species: 'dog', breed: 'Nepali Street Dog', age: 2, gender: 'male', size: 'medium', traits: ['Friendly', 'Energetic', 'Good with kids'], vaccinated: true, neutered: true, description: 'Bruno was rescued from the streets of Baneshwor. He is playful, loves long walks, and gets along wonderfully with children.', shelter: { name: 'Animal Nepal', location: 'Chobhar, Kathmandu', verified: true, phone: '014469601' }, photos: [{ url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800' }] },
  { name: 'Kali', species: 'dog', breed: 'Labrador Mix', age: 4, gender: 'female', size: 'large', traits: ['Calm', 'Trained', 'Loyal'], vaccinated: true, neutered: true, microchipped: true, description: 'Kali is a gentle soul who was surrendered when her family moved abroad. She knows basic commands and is house-trained.', shelter: { name: 'Sneha Care', location: 'Bhaktapur', verified: true, phone: '9801234567' }, photos: [{ url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800' }] },
  { name: 'Muna', species: 'cat', breed: 'Domestic Shorthair', age: 8, ageUnit: 'months', gender: 'female', size: 'small', traits: ['Affectionate', 'Quiet', 'Indoor'], vaccinated: true, description: 'Muna was found as a kitten near Patan Durbar Square. She loves sunny windowsills and gentle head scratches.', shelter: { name: 'Kathmandu Animal Treatment', location: 'Budhanilkantha', verified: true, phone: '9812345678' }, photos: [{ url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800' }] },
  { name: 'Raja', species: 'dog', breed: 'German Shepherd Mix', age: 3, gender: 'male', size: 'large', traits: ['Protective', 'Intelligent', 'Active'], vaccinated: true, neutered: true, description: 'Raja needs an experienced owner with space to run. Extremely loyal once bonded.', shelter: { name: 'Animal Nepal', location: 'Chobhar, Kathmandu', verified: true, phone: '014469601' }, photos: [{ url: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800' }] },
  { name: 'Chhori', species: 'cat', breed: 'Tabby', age: 2, gender: 'female', size: 'small', traits: ['Playful', 'Curious', 'Good with cats'], vaccinated: true, neutered: true, description: 'Chhori is a chatty tabby who will follow you around the house. Best in a home with another cat.', shelter: { name: 'Sneha Care', location: 'Bhaktapur', verified: true, phone: '9801234567' }, photos: [{ url: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800' }] },
  { name: 'Moti', species: 'dog', breed: 'Nepali Street Dog', age: 6, gender: 'male', size: 'medium', traits: ['Gentle', 'Senior', 'Low energy'], vaccinated: true, neutered: true, description: 'Moti is a senior gentleman looking for a quiet retirement home. Perfect for a calm household.', shelter: { name: 'Kathmandu Animal Treatment', location: 'Budhanilkantha', verified: true, phone: '9812345678' }, photos: [{ url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800' }] },
  { name: 'Simba', species: 'cat', breed: 'Orange Tabby', age: 1, gender: 'male', size: 'medium', traits: ['Bold', 'Playful', 'Good with kids'], vaccinated: true, description: 'Simba is fearless and full of personality. He will keep you entertained for hours.', shelter: { name: 'Animal Nepal', location: 'Chobhar, Kathmandu', verified: true, phone: '014469601' }, photos: [{ url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800' }] },
  { name: 'Gauri', species: 'dog', breed: 'Beagle Mix', age: 5, ageUnit: 'months', gender: 'female', size: 'small', traits: ['Puppy', 'Energetic', 'Needs training'], vaccinated: true, description: 'Gauri is a bundle of energy looking for a patient family to help her grow into a well-mannered dog.', shelter: { name: 'Sneha Care', location: 'Bhaktapur', verified: true, phone: '9801234567' }, photos: [{ url: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800' }] },
  { name: 'Bhale', species: 'bird', breed: 'Cockatiel', age: 3, gender: 'male', size: 'small', traits: ['Vocal', 'Social', 'Hand-tame'], vaccinated: false, description: 'Bhale whistles Nepali folk tunes and loves shoulder rides. Needs a household that enjoys birdsong.', shelter: { name: 'Kathmandu Animal Treatment', location: 'Budhanilkantha', verified: true, phone: '9812345678' }, photos: [{ url: 'https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?w=800' }] },
  { name: 'Laali', species: 'cat', breed: 'Calico', age: 4, gender: 'female', size: 'medium', traits: ['Independent', 'Quiet', 'Indoor'], vaccinated: true, neutered: true, microchipped: true, description: 'Laali prefers a calm home. She will bond deeply with one person and is content to observe from a distance.', shelter: { name: 'Animal Nepal', location: 'Chobhar, Kathmandu', verified: true, phone: '014469601' }, photos: [{ url: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800' }] },
  { name: 'Hero', species: 'dog', breed: 'Nepali Street Dog', age: 1, gender: 'male', size: 'medium', traits: ['Friendly', 'Trained', 'Good with dogs'], vaccinated: true, neutered: true, description: 'Hero was rescued from a construction site. Despite a rough start, he trusts people completely.', shelter: { name: 'Sneha Care', location: 'Bhaktapur', verified: true, phone: '9801234567' }, photos: [{ url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800' }] },
  { name: 'Munni', species: 'rabbit', breed: 'Dutch Rabbit', age: 2, gender: 'female', size: 'small', traits: ['Quiet', 'Gentle', 'Litter-trained'], vaccinated: true, description: 'Munni is a calm house rabbit who enjoys fresh greens and quiet corners.', shelter: { name: 'Kathmandu Animal Treatment', location: 'Budhanilkantha', verified: true, phone: '9812345678' }, photos: [{ url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800' }] },
  { name: 'Sano', species: 'cat', breed: 'Domestic Shorthair', age: 4, ageUnit: 'months', gender: 'male', size: 'small', traits: ['Kitten', 'Playful', 'Cuddly'], vaccinated: true, description: 'Sano is a tiny kitten with a huge purr. He needs a family who will be home often during his first year.', shelter: { name: 'Animal Nepal', location: 'Chobhar, Kathmandu', verified: true, phone: '014469601' }, photos: [{ url: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800' }] },
  { name: 'Sheru', species: 'dog', breed: 'Tibetan Mastiff Mix', age: 5, gender: 'male', size: 'large', traits: ['Protective', 'Calm', 'Needs space'], vaccinated: true, neutered: true, description: 'Sheru is a large, dignified dog who needs a home with a compound. Excellent guardian, gentle with family.', shelter: { name: 'Sneha Care', location: 'Bhaktapur', verified: true, phone: '9801234567' }, photos: [{ url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800' }] },
  { name: 'Rani', species: 'dog', breed: 'Nepali Street Dog', age: 3, gender: 'female', size: 'medium', traits: ['Gentle', 'Shy', 'Good with cats'], vaccinated: true, neutered: true, status: 'adopted', description: 'Rani found her forever home in Lalitpur.', shelter: { name: 'Animal Nepal', location: 'Chobhar, Kathmandu', verified: true, phone: '014469601' }, photos: [{ url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800' }] },
  { name: 'Kancha', species: 'cat', breed: 'Black Domestic', age: 2, gender: 'male', size: 'medium', traits: ['Affectionate', 'Vocal'], vaccinated: true, neutered: true, status: 'adopted', description: 'Kancha was adopted by a family in Bhaktapur.', shelter: { name: 'Sneha Care', location: 'Bhaktapur', verified: true, phone: '9801234567' }, photos: [{ url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800' }] },
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

    await Pet.deleteMany({});
    console.log('Cleared existing pets');

    const staggered = PETS.map((pet, i) => ({
      ...pet,
      listedBy: ngoByName[pet.shelter.name] || ngos[0]._id,
      waitingSince: new Date(Date.now() - (i * 7 + 3) * 24 * 60 * 60 * 1000),
    }));

    await Pet.insertMany(staggered);
    console.log(`Seeded ${staggered.length} pets, linked to NGO accounts`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();