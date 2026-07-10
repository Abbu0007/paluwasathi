const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');
const { sendOtpEmail, sendResetEmail, sendPasswordChangedEmail } = require('../utils/email');

const MAX_OTP_ATTEMPTS = 5;

const signToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  district: user.district,
  role: user.role,
  isVerified: user.isVerified,
  profilePhoto: user.profilePhoto,
  bio: user.bio,
  website: user.website,
});

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, district, password, role } = req.body;

    if (!name || !email || !phone || !district || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
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

    try {
      await sendOtpEmail(user.email, user.name, otp);
    } catch (mailErr) {
      console.error('Failed to send OTP email:', mailErr.message);
      await user.deleteOne();
      return res.status(500).json({
        message: 'Could not send verification email. Please check the address and try again.',
      });
    }

    res.status(201).json({
      message: 'Account created. Check your email for the verification code.',
      userId: user._id,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select('+otp +otpExpiry +otpAttempts');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified. Please log in.' });
    }

    if (!user.otp) {
      return res.status(400).json({ message: 'No active code. Please request a new one.' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Code expired. Please request a new one.' });
    }

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      user.otp = null;
      user.otpExpiry = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(429).json({
        message: 'Too many incorrect attempts. Please request a new code.',
      });
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      const left = MAX_OTP_ATTEMPTS - user.otpAttempts;
      return res.status(400).json({
        message: 'Incorrect code. ' + left + ' attempt' + (left !== 1 ? 's' : '') + ' remaining.',
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    const token = signToken(user);
    res.json({ message: 'Verified.', token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed.', error: err.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).select('+otp +otpExpiry +otpAttempts');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();

    await sendOtpEmail(user.email, user.name, otp);

    res.json({ message: 'A new code has been sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend code.', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: 'Email/phone and password required.' });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your account first.',
        needsVerification: true,
        userId: user._id,
      });
    }

    const token = signToken(user);
    res.json({ message: 'Logged in.', token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        message: 'If an account exists with that email, a reset link has been sent.',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = hashToken(rawToken);
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetUrl = process.env.CLIENT_URL + '/reset-password/' + rawToken;

    try {
      await sendResetEmail(user.email, user.name, resetUrl);
    } catch (mailErr) {
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
      console.error('Failed to send reset email:', mailErr.message);
      return res.status(500).json({ message: 'Could not send the reset email. Try again shortly.' });
    }

    res.json({
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Request failed.', error: err.message });
  }
};

exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetToken: hashToken(token),
      resetTokenExpiry: { $gt: new Date() },
    }).select('+resetToken +resetTokenExpiry');

    if (!user) {
      return res.status(400).json({ message: 'This link is invalid or has expired.' });
    }

    res.json({ valid: true, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed.', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const user = await User.findOne({
      resetToken: hashToken(token),
      resetTokenExpiry: { $gt: new Date() },
    }).select('+resetToken +resetTokenExpiry +password');

    if (!user) {
      return res.status(400).json({ message: 'This link is invalid or has expired.' });
    }

    const sameAsOld = await bcrypt.compare(password, user.password);
    if (sameAsOld) {
      return res.status(400).json({ message: 'New password must be different from your current one.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch {
      // notification is best effort
    }

    res.json({ message: 'Password reset. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed.', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user.', error: err.message });
  }
};