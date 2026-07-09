const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { uploadRescuePhotos } = require('../config/cloudinary');
const {
  createRescue,
  getRescues,
  getRescueById,
  updateRescue,
  getMyRescues,
  getRescueStats,
  getAvailableRescues,
  acceptRescue,
  updateRescueStatus,
  getAssignedRescues,
} = require('../controllers/rescue.controller');

const handleRescueUpload = (req, res, next) => {
  uploadRescuePhotos(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed.' });
    next();
  });
};

// Public / everyone
router.get('/stats', getRescueStats);
router.post('/', handleRescueUpload, createRescue);
router.get('/', getRescues);

// Authenticated — any role
router.get('/my', auth, getMyRescues);

// Volunteers only
router.get('/available', auth, role('volunteer'), getAvailableRescues);
router.get('/assigned', auth, role('volunteer'), getAssignedRescues);
router.post('/:id/accept', auth, role('volunteer'), acceptRescue);
router.patch('/:id/status', auth, role('volunteer', 'admin'), updateRescueStatus);

router.get('/:id', getRescueById);
router.patch('/:id', auth, role('admin'), updateRescue);

module.exports = router;