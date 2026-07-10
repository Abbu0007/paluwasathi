require('dotenv').config();
const mongoose = require('mongoose');
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');

const POSTS = [
  {
    type: 'story',
    title: 'Six months after we found Kaalu on the ring road',
    content: 'He was curled against a wall near Koteshwor with a broken back leg, and honestly I did not think he would live through the night. We took him to KAT. The surgery cost more than I had, and my mother was not happy about it.\n\nToday he sleeps at the foot of my bed and barks at the doorbell like he owns the building. The leg never healed straight and he runs with a strange hop. Children in the gully laugh at it. He does not seem to mind.\n\nI am writing this because six months ago I searched for stories like this one and could not find any. If you are sitting with an injured street dog wondering whether it is worth it, it is worth it. Not because every story ends well. Some do not. But because the alternative is walking past.',
    tags: ['rescue-story', 'street-dogs', 'recovery'],
    isPinned: true,
  },
  {
    type: 'tip',
    title: 'What to actually do when you find an injured animal',
    content: 'I volunteer with rescue teams and the same mistakes come up every week.\n\nDo not pick up an injured animal without covering its head with a cloth first. A dog in pain will bite. This is not aggression, it is reflex, and it happens to experienced handlers too.\n\nDo not give food or water to an animal with a suspected spinal injury or one that cannot lift its head. Aspiration will kill it faster than the injury.\n\nDo not move an animal that has been hit by a vehicle unless it is in the road and will be hit again. Internal bleeding is common. Movement makes it worse. Call a rescue number and stand guard.\n\nDo photograph the animal and the exact location. Rescue teams waste enormous time searching a general area.\n\nDo stay on the phone with the rescue coordinator. They will talk you through it.',
    tags: ['first-aid', 'rescue', 'safety'],
  },
  {
    type: 'question',
    title: 'Adopted cat will not stop hiding after two weeks',
    content: 'We adopted a two year old female from Sneha Care fourteen days ago. She lives entirely behind the washing machine. She eats at night when nobody is in the kitchen and uses the litter box, so she is not unwell.\n\nWe have tried sitting quietly in the room, treats, a Feliway diffuser. Nothing. She flinches if we come within two metres.\n\nThe shelter said she was found as an adult stray, so I understand she has history. But is fourteen days normal? At what point should I be worried? Has anyone had a cat come around after this long?',
    tags: ['adoption', 'cats', 'behaviour'],
  },
  {
    type: 'update',
    title: 'Sterilization camp in Ward 12 sterilized 148 dogs',
    content: 'Three days, six vets, twenty two volunteers. We targeted 150 and reached 148.\n\nA breakdown for those interested. Eighty six females, sixty two males. Nine animals were found to have existing infections and were treated. Two were pregnant and the procedure was performed with the pregnancy terminated, which is a decision our vets do not take lightly and which we discuss openly rather than hide.\n\nWard 12 has an estimated street dog population of four hundred. Sustained coverage of seventy percent over three years is what breaks the breeding cycle. We are at roughly thirty seven percent.\n\nThank you to everyone who fed volunteers, lent vehicles, and held frightened dogs steady. The next camp is being planned for Ward 9.',
    tags: ['sterilization', 'ngo-update', 'impact'],
  },
  {
    type: 'tip',
    title: 'Winter care for street dogs in the valley',
    content: 'Temperatures in Kathmandu drop to near freezing in January and street dogs die of exposure every year, particularly puppies and older animals.\n\nA cardboard box lined with old cloth, placed against a wall out of the wind, costs nothing and saves lives. Do not use straw if it will get wet. Wet insulation is worse than none.\n\nIf you feed street dogs, feed them more in winter. They burn calories staying warm. Cooked rice with a little oil and any meat scraps is fine.\n\nCheck under parked cars before starting the engine. Dogs sleep against warm engine blocks. This one kills more animals than people realise.',
    tags: ['winter', 'street-dogs', 'care'],
  },
  {
    type: 'story',
    title: 'The dog nobody wanted for four hundred days',
    content: 'Sheru came to the shelter in early 2024. Adult male, mixed breed, one eye, scarred face from what the vet thought was acid or hot oil. He was gentle from the first day.\n\nFor four hundred and eleven days people walked past his kennel. They looked, they made a sound in their throat, they moved to the next kennel. I watched it happen perhaps two hundred times. He stopped standing up when visitors came.\n\nA week ago a woman in her sixties came looking for a companion. She sat outside his kennel for forty minutes. She said her husband had died and she was not looking for something beautiful, she was looking for something that would stay.\n\nHe went home on Tuesday. I am not going to pretend I did not cry.',
    tags: ['adoption', 'shelter-life', 'senior-pets'],
  },
  {
    type: 'question',
    title: 'Is it legal to keep a street dog you have been feeding?',
    content: 'There is a dog that has lived outside my shop for three years. I feed her, she sleeps in the doorway, she is effectively mine but she has no papers and I never formally adopted her.\n\nNow my landlord is complaining and mentioning the municipality. Does she count as a stray or as my pet? Do I need to register her? Does the sterilization certificate from KAT count as proof of ownership?\n\nI am not going to abandon her. I just want to know where I stand.',
    tags: ['legal', 'street-dogs', 'nepal'],
  },
  {
    type: 'update',
    title: 'Ambulance response times cut from ninety minutes to thirty four',
    content: 'When we started the rescue ambulance in 2023 our average response time from call to arrival was ninety three minutes across the valley. Last month it was thirty four.\n\nWhat changed. We added a second vehicle. We moved to a volunteer standby rotation instead of a single on call driver. We stopped routing every call through one coordinator.\n\nWhat has not changed. We still turn down roughly one call in six because both vehicles are already out. Fuel and maintenance remain our largest unfunded cost.\n\nThirty four minutes still means an animal bleeding on a road for thirty four minutes. We are not celebrating. We are reporting.',
    tags: ['ngo-update', 'rescue', 'impact'],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find().limit(6);
    if (users.length < 2) {
      console.error('Need at least 2 users. Run: node seeds/ngos.seed.js and register a user.');
      process.exit(1);
    }

    await CommunityPost.deleteMany({});
    console.log('Cleared existing posts');

    for (let i = 0; i < POSTS.length; i++) {
      const author = users[i % users.length];

      const likers = users
        .filter((u) => u._id.toString() !== author._id.toString())
        .slice(0, Math.floor(Math.random() * users.length));

      const post = await CommunityPost.create({
        ...POSTS[i],
        author: author._id,
        likes: likers.map((u) => u._id),
      });

      if (i % 2 === 0 && users.length > 1) {
        const commenter = users[(i + 1) % users.length];
        post.comments.push({
          author: commenter._id,
          text: 'Thank you for writing this. More people need to read it.',
        });
        await post.save();
      }
    }

    console.log(`Seeded ${POSTS.length} community posts`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();