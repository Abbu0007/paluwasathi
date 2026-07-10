const router = require('express').Router();
const auth = require('../middleware/auth');
const { uploadProfilePhoto } = require('../config/cloudinary');
const {
  updateProfile,
  removeProfilePhoto,
  changePassword,
  deleteAccount,
  getPublicProfile,
} = require('../controllers/user.controller');

const handleUpload = (req, res, next) => {
  uploadProfilePhoto(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed.' });
    next();
  });
};

router.patch('/profile', auth, handleUpload, updateProfile);
router.delete('/profile/photo', auth, removeProfilePhoto);
router.patch('/password', auth, changePassword);
router.delete('/account', auth, deleteAccount);
router.get('/:id', getPublicProfile);

module.exports = router;