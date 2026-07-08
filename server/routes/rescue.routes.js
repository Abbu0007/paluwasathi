const router = require('express').Router();
const auth = require('../middleware/auth');
const { uploadRescuePhotos } = require('../config/cloudinary');
const {
  createRescue,
  getRescues,
  getRescueById,
  updateRescue,
  getMyRescues,
  getRescueStats,
} = require('../controllers/rescue.controller');

// Inline multer middleware instead of using the wrapper
const handleRescueUpload = (req, res, next) => {
  uploadRescuePhotos(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Upload failed.' });
    }
    next();
  });
};

router.get('/stats', getRescueStats);
router.get('/my', auth, getMyRescues);
router.get('/', getRescues);
router.get('/:id', getRescueById);
router.post('/', handleRescueUpload, createRescue);
router.patch('/:id', auth, updateRescue);

module.exports = router;