const router = require('express').Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const role = require('../middleware/role');
const { uploadPetPhotos } = require('../config/cloudinary');
const {
  getEvents,
  getEventById,
  getEventStats,
  createEvent,
  getMyEvents,
  updateEvent,
  getEventAttendees,
  getNgoEventStats,
} = require('../controllers/event.controller');

const handleUpload = (req, res, next) => {
  uploadPetPhotos(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed.' });
    next();
  });
};

router.get('/stats', getEventStats);
router.get('/mine', auth, role('ngo', 'admin'), getMyEvents);
router.get('/ngo/stats', auth, role('ngo', 'admin'), getNgoEventStats);
router.get('/', getEvents);
router.post('/', auth, role('ngo', 'admin'), handleUpload, createEvent);
router.get('/:id/attendees', auth, role('ngo', 'admin'), getEventAttendees);
router.patch('/:id', auth, role('ngo', 'admin'), updateEvent);
router.get('/:id', optionalAuth, getEventById);

module.exports = router;