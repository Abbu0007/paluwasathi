const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');

const signToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  district: user.district,
  role: user.role,
  isVerified: user.isVerified,
});

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, district, password, role } = req.body;

    if (!name || !email || !phone || !district || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const user = await User.create({
      name, email, phone, district,
      password: hashedPassword,
      role: role || 'volunteer',
      otp,
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log(`[DEV] OTP for ${phone}: ${otp}`);

    res.status(201).json({
      message: 'Account created. OTP sent.',
      userId: user._id,
      devOtp: otp, // DEV ONLY — remove before production
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please resend.' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = signToken(user);
    res.json({ message: 'Verified.', token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed.', error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: 'Email/phone and password required.' });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user);
    res.json({ message: 'Logged in.', token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
};

// GET /api/auth/me  (protected)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -otp -otpExpiry');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user.', error: err.message });
  }
};