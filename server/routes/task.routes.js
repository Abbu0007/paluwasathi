const router = require('express').Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const role = require('../middleware/role');
const { uploadPetPhotos } = require('../config/cloudinary');
const {
  getTasks,
  getTaskById,
  getTaskStats,
  createTask,
  getMyTasks,
  updateTask,
  getTaskSignups,
  getNgoTaskStats,
} = require('../controllers/task.controller');

const handleUpload = (req, res, next) => {
  uploadPetPhotos(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed.' });
    next();
  });
};

router.get('/stats', getTaskStats);
router.get('/mine', auth, role('ngo', 'admin'), getMyTasks);
router.get('/ngo/stats', auth, role('ngo', 'admin'), getNgoTaskStats);
router.get('/', getTasks);
router.post('/', auth, role('ngo', 'admin'), handleUpload, createTask);
router.get('/:id/signups', auth, role('ngo', 'admin'), getTaskSignups);
router.patch('/:id', auth, role('ngo', 'admin'), updateTask);
router.get('/:id', optionalAuth, getTaskById);

module.exports = router;