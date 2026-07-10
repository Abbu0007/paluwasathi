require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const EVENTS = [
  {
    title: 'Kathmandu Adoption Fair 2026',
    ngoName: 'Animal Nepal',
    category: 'adoption_fair',
    shortDescription: 'Forty dogs and cats looking for homes, all vaccinated and sterilised.',
    description: 'Our largest adoption event of the year. Forty animals from three shelters will be present, all vaccinated, sterilised, and health checked.\n\nAdoption counsellors will be on site to talk you through what each animal needs. We do not do same day adoptions. You meet the animal, submit an application, and we conduct a home visit before finalising. This protects the animal and you.\n\nEven if you are not adopting, come. Meeting forty animals who need homes changes how you see the streets.',
    venue: 'Bhrikutimandap Exhibition Ground',
    address: 'Bhrikutimandap, Kathmandu',
    district: 'Kathmandu',
    startDate: daysFromNow(11),
    startTime: '10:00',
    endTime: '17:00',
    capacity: 300,
    attendeeCount: 87,
    highlights: ['40 pets available', 'Free vet consultation', 'Adoption counselling', 'Food stalls'],
    featured: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200' },
  },
  {
    title: 'Free Rabies Vaccination Camp',
    ngoName: 'Kathmandu Animal Treatment',
    category: 'vaccination_camp',
    shortDescription: 'Free rabies shots for street and owned dogs. No registration required.',
    description: 'Rabies kills roughly one hundred people in Nepal every year and the overwhelming majority of cases come from dog bites. Vaccination is the only thing that breaks the chain.\n\nBring your dog. Bring the street dog you feed. There is no charge and no paperwork beyond a name and a ward number.\n\nWe will also be doing basic health checks and distributing deworming tablets. If you cannot bring an animal in, tell our team where they are and we will send a catcher.',
    venue: 'Ward 12 Community Hall',
    address: 'New Baneshwor, Kathmandu',
    district: 'Kathmandu',
    startDate: daysFromNow(5),
    startTime: '08:00',
    endTime: '15:00',
    highlights: ['Free rabies vaccine', 'Deworming tablets', 'Basic health check', 'Street dog catchers on site'],
    coverImage: { url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200' },
  },
  {
    title: 'Animal First Aid Workshop',
    ngoName: 'Sneha Care',
    category: 'workshop',
    shortDescription: 'A four hour hands-on workshop in emergency animal care.',
    description: 'Taught by two practising veterinarians. Covers wound assessment, safe restraint, controlling bleeding, recognising shock, transporting an injured animal, and knowing when a situation is beyond first aid.\n\nThis is hands on. You will practise on models. Twenty places only because we want every participant to actually handle the equipment rather than watch from a chair.\n\nSuitable for anyone who feeds street animals, volunteers, or owns pets. No medical background required.',
    venue: 'Sneha Care Shelter Training Room',
    address: 'Sallaghari, Bhaktapur',
    district: 'Bhaktapur',
    startDate: daysFromNow(18),
    startTime: '09:00',
    endTime: '13:00',
    capacity: 20,
    attendeeCount: 14,
    isFree: false,
    ticketPrice: 500,
    highlights: ['Taught by vets', 'Hands-on practice', 'Take-home first aid guide', 'Certificate provided'],
    coverImage: { url: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1200' },
  },
  {
    title: 'Charity Run for Street Dogs',
    ngoName: 'Animal Nepal',
    category: 'fundraiser',
    shortDescription: 'A 5km run through the valley. All proceeds fund the rescue ambulance.',
    description: 'Five kilometres, starting and finishing at Tundikhel. Walk it, jog it, or run it. Dogs on leads are welcome and there will be water stations for them too.\n\nEvery rupee of the registration fee goes to fuel and maintain our two rescue ambulances. Last year the run raised NPR 340,000, which kept both vehicles on the road for four months.\n\nRegistration includes a T-shirt and refreshments at the finish.',
    venue: 'Tundikhel Ground',
    address: 'Tundikhel, Kathmandu',
    district: 'Kathmandu',
    startDate: daysFromNow(25),
    startTime: '06:30',
    endTime: '10:00',
    capacity: 500,
    attendeeCount: 213,
    isFree: false,
    ticketPrice: 1000,
    highlights: ['5km route', 'Dogs welcome', 'T-shirt included', 'Refreshments provided'],
    featured: true,
    coverImage: { url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200' },
  },
  {
    title: 'School Awareness Programme Launch',
    ngoName: 'Kathmandu Animal Treatment',
    category: 'awareness',
    shortDescription: 'Launching our animal welfare curriculum across twelve valley schools.',
    description: 'We have spent eight months building an animal welfare curriculum for grades four through eight. It covers responsible pet ownership, what to do if you find an injured animal, why street dogs behave the way they do, and how to approach an unfamiliar animal safely.\n\nThis event launches the programme with representatives from twelve participating schools. Teachers, parents, and anyone interested in animal education are welcome.\n\nWe are also looking for volunteers to help deliver sessions.',
    venue: 'Russian Cultural Centre',
    address: 'Kamalpokhari, Kathmandu',
    district: 'Kathmandu',
    startDate: daysFromNow(8),
    startTime: '14:00',
    endTime: '17:00',
    capacity: 120,
    attendeeCount: 41,
    highlights: ['Curriculum unveiling', '12 partner schools', 'Volunteer recruitment', 'Refreshments'],
    coverImage: { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200' },
  },
  {
    title: 'Lalitpur Adoption Day',
    ngoName: 'Sneha Care',
    category: 'adoption_fair',
    shortDescription: 'Smaller, quieter adoption event for anxious animals.',
    description: 'Large adoption fairs are overwhelming for some animals. This is a smaller event, twelve animals, designed for dogs and cats who struggle with noise and crowds.\n\nIf you have been to a fair and found the atmosphere too chaotic to properly meet an animal, this is for you. Slower pace. More time with each animal. Fewer people.\n\nAll animals are vaccinated, sterilised, and have been assessed by our behaviour team.',
    venue: 'Patan Community Centre',
    address: 'Pulchowk, Lalitpur',
    district: 'Lalitpur',
    startDate: daysFromNow(15),
    startTime: '11:00',
    endTime: '16:00',
    capacity: 80,
    attendeeCount: 22,
    highlights: ['12 animals', 'Quiet environment', 'Behaviour assessments included', 'One-to-one counselling'],
    coverImage: { url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200' },
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

    await Event.deleteMany({});
    console.log('Cleared existing events');

    for (const e of EVENTS) {
      const { ngoName, venue, address, district, ...rest } = e;
      await Event.create({
        ...rest,
        location: { venue, address, district },
        organiser: ngoByName[ngoName] || ngos[0]._id,
      });
    }

    console.log(`Seeded ${EVENTS.length} events`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();