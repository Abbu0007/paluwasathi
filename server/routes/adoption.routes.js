const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  createAdoption,
  getMyAdoptions,
  getAdoptionById,
  updateAdoptionStatus,
  getPendingAdoptions,
} = require('../controllers/adoption.controller');

router.get('/my', auth, getMyAdoptions);
router.get('/pending', auth, role('ngo', 'admin'), getPendingAdoptions);
router.post('/', auth, createAdoption);
router.get('/:id', auth, getAdoptionById);
router.patch('/:id/status', auth, role('ngo', 'admin'), updateAdoptionStatus);

module.exports = router;