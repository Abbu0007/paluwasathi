const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  createAdoption,
  getMyAdoptions,
  getAdoptionById,
  updateAdoptionStatus,
  getNgoApplications,
  getNgoStats,
} = require('../controllers/adoption.controller');

router.get('/my', auth, getMyAdoptions);
router.get('/ngo/applications', auth, role('ngo', 'admin'), getNgoApplications);
router.get('/ngo/stats', auth, role('ngo', 'admin'), getNgoStats);
router.post('/', auth, createAdoption);
router.get('/:id', auth, getAdoptionById);
router.patch('/:id/status', auth, role('ngo', 'admin'), updateAdoptionStatus);

module.exports = router;