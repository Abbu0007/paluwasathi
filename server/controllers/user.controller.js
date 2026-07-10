const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { name, district, bio, website } = req.body;

    if (name !== undefined) {
      const clean = name.trim();
      if (clean.length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters.' });
      }
      user.name = clean;
    }

    if (district !== undefined && district) user.district = district;
    if (bio !== undefined) user.bio = bio.trim();
    if (website !== undefined) user.website = website.trim();

    if (req.files && req.files.length) {
      if (user.profilePhoto && user.profilePhoto.publicId) {
        try {
          await cloudinary.uploader.destroy(user.profilePhoto.publicId);
        } catch {
          // best effort cleanup
        }
      }

      const result = await uploadToCloudinary(req.files[0].buffer, 'paluwasathi/profiles');
      user.profilePhoto = { url: result.secure_url, publicId: result.public_id };
    }

    await user.save();

    res.json({ message: 'Profile updated.', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile.', error: err.message });
  }
};

exports.removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.profilePhoto && user.profilePhoto.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePhoto.publicId);
      } catch {
        // best effort
      }
    }

    user.profilePhoto = undefined;
    await user.save();

    res.json({ message: 'Photo removed.', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove photo.', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from the current one.' });
    }

    const user = await User.findById(req.user.userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to change password.', error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    if (confirmation !== 'DELETE') {
      return res.status(400).json({ message: 'Type DELETE to confirm.' });
    }

    const user = await User.findById(req.user.userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.role === 'ngo') {
      return res.status(403).json({
        message: 'Organisation accounts cannot be self-deleted. Contact support.',
      });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: 'Password is incorrect.' });
    }

    if (user.profilePhoto && user.profilePhoto.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePhoto.publicId);
      } catch {
        // best effort
      }
    }

    await user.deleteOne();

    res.json({ message: 'Account deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete account.', error: err.message });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name role district bio website profilePhoto createdAt');

    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile.', error: err.message });
  }
};