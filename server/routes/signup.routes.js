const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  createSignup,
  getMySignups,
  getSignupById,
  cancelSignup,
  markAttendance,
} = require('../controllers/signup.controller');

router.get('/my', auth, getMySignups);
router.post('/', auth, createSignup);
router.get('/:id', auth, getSignupById);
router.patch('/:id/cancel', auth, cancelSignup);
router.patch('/:id/attendance', auth, role('ngo', 'admin'), markAttendance);

module.exports = router;