const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  createRsvp,
  getMyRsvps,
  getRsvpById,
  cancelRsvp,
  markAttended,
} = require('../controllers/rsvp.controller');

router.get('/my', auth, getMyRsvps);
router.post('/', auth, createRsvp);
router.get('/:id', auth, getRsvpById);
router.patch('/:id/cancel', auth, cancelRsvp);
router.patch('/:id/attended', auth, role('ngo', 'admin'), markAttended);

module.exports = router;