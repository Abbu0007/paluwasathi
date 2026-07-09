const router = require('express').Router();
const auth = require('../middleware/auth');
const { uploadPetPhotos } = require('../config/cloudinary');
const {
  createReport,
  getReports,
  getReportById,
  getMatches,
  getMyReports,
  markReunited,
  closeReport,
  getStats,
} = require('../controllers/lostfound.controller');

const handleUpload = (req, res, next) => {
  uploadPetPhotos(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed.' });
    next();
  });
};

router.get('/stats', getStats);
router.get('/my', auth, getMyReports);
router.get('/', getReports);
router.post('/', auth, handleUpload, createReport);
router.get('/:id/matches', getMatches);
router.patch('/:id/reunited', auth, markReunited);
router.patch('/:id/close', auth, closeReport);
router.get('/:id', getReportById);

module.exports = router;