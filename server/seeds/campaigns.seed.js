require('dotenv').config();
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const User = require('../models/User');

const CAMPAIGNS = [
  {
    title: 'Emergency Surgery Fund for Street Dogs',
    category: 'medical',
    ngoName: 'Animal Nepal',
    shortDescription: 'Urgent surgical care for dogs injured in road accidents across Kathmandu.',
    description: 'Every week we receive dogs with severe injuries from vehicle collisions. Surgery costs between NPR 8,000 and NPR 25,000 per animal depending on severity. This fund covers anaesthesia, orthopaedic implants, medication and two weeks of post-operative care at our Chobhar facility. Last year this fund saved 47 dogs who would otherwise have been euthanised.',
    goalAmount: 500000,
    raisedAmount: 342000,
    donorCount: 89,
    urgent: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200' },
  },
  {
    title: 'Winter Shelter Construction, Bhaktapur',
    category: 'shelter',
    ngoName: 'Sneha Care',
    shortDescription: 'Building insulated kennels for 40 rescued animals before winter arrives.',
    description: 'Our current shelter houses 40 animals in structures that offer little protection from Kathmandu valley winters. Temperatures drop below 2°C at night. We are constructing insulated kennels with raised flooring, heat lamps in the medical wing, and a covered exercise area. Construction begins as soon as we reach 70% of our goal.',
    goalAmount: 800000,
    raisedAmount: 195000,
    donorCount: 34,
    coverImage: { url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200' },
  },
  {
    title: 'Daily Feeding Programme',
    category: 'food',
    ngoName: 'Kathmandu Animal Treatment',
    shortDescription: 'Feeding 200 street animals daily across six Kathmandu neighbourhoods.',
    description: 'Six volunteers distribute cooked meals to street dogs and cats every evening across Budhanilkantha, Chabahil, Boudha, Maharajgunj, Baneshwor and Patan. A single meal costs NPR 45. Our monthly food bill is NPR 270,000. Regular feeding reduces aggression, improves vaccination compliance, and lets us monitor animals for illness before it becomes critical.',
    goalAmount: 300000,
    raisedAmount: 278000,
    donorCount: 156,
    coverImage: { url: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200' },
  },
  {
    title: 'Mass Sterilization Drive',
    category: 'sterilization',
    ngoName: 'Animal Nepal',
    shortDescription: 'Spay and neuter 500 street dogs to humanely control the population.',
    description: 'Nepal has an estimated 30,000 street dogs in Kathmandu valley alone. Culling is inhumane and ineffective. Sterilization is the only humane, permanent solution. Each surgery costs NPR 2,200 including vaccination, ear-notching for identification, and 48 hours of recovery care. This drive targets 500 dogs across five wards.',
    goalAmount: 1100000,
    raisedAmount: 445000,
    donorCount: 112,
    urgent: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200' },
  },
  {
    title: 'Rescue Ambulance Fuel & Maintenance',
    category: 'rescue',
    ngoName: 'Sneha Care',
    shortDescription: 'Keeping our two rescue vehicles on the road, responding within 30 minutes.',
    description: 'Our two rescue vans respond to emergency calls across the valley, averaging 14 rescues per week. Fuel, servicing, and equipment replacement cost NPR 45,000 monthly. When funds run short, response times triple. This campaign ensures we can reach any animal in the valley within 30 minutes of a report coming in.',
    goalAmount: 540000,
    raisedAmount: 87000,
    donorCount: 21,
    coverImage: { url: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=1200' },
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

    await Campaign.deleteMany({});
    console.log('Cleared existing campaigns');

    for (let i = 0; i < CAMPAIGNS.length; i++) {
      const c = CAMPAIGNS[i];
      const { ngoName, ...rest } = c;
      await Campaign.create({
        ...rest,
        ngo: ngoByName[ngoName] || ngos[0]._id,
        deadline: new Date(Date.now() + (30 + i * 15) * 24 * 60 * 60 * 1000),
      });
    }

    console.log(`Seeded ${CAMPAIGNS.length} campaigns`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();