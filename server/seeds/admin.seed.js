require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const User = require('../models/User');

const ask = (question, hidden) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (hidden) {
      const stdin = process.openStdin();
      process.stdin.on('data', function (char) {
        char = char + '';
        if (char === '\n' || char === '\r' || char === '\u0004') {
          stdin.pause();
        } else {
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(question + '*'.repeat(rl.line.length));
        }
      });
    }

    rl.question(question, function (answer) {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const email = await ask('Admin email: ');
    if (!email.includes('@')) {
      console.error('Invalid email.');
      process.exit(1);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.role === 'admin') {
        console.log('\nThis account is already an admin. Nothing to do.');
        await mongoose.disconnect();
        process.exit(0);
      }

      console.log('\nAn account with this email already exists:');
      console.log('  Name: ' + existing.name);
      console.log('  Role: ' + existing.role);

      const confirm = await ask('\nPromote it to admin? (yes/no): ');
      if (confirm.toLowerCase() !== 'yes') {
        console.log('Cancelled.');
        await mongoose.disconnect();
        process.exit(0);
      }

      existing.role = 'admin';
      existing.isVerified = true;
      await existing.save();

      console.log('\nPromoted to admin. Log in with your existing password.');
      await mongoose.disconnect();
      process.exit(0);
    }

    const name = await ask('Admin name: ');
    const phone = await ask('Admin phone (98XXXXXXXX): ');
    const district = await ask('District: ');
    const password = await ask('Password (min 8 chars): ', true);

    if (password.length < 8) {
      console.error('\nPassword too short.');
      process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      district,
      password: hashed,
      role: 'admin',
      isVerified: true,
    });

    console.log('\nAdmin account created.');
    console.log('  Email: ' + email);
    console.log('  Panel: http://localhost:5173/admin');
    console.log('\nChange this password before deploying.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();