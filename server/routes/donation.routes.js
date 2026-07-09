const router = require('express').Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const role = require('../middleware/role');
const {
  initiateDonation,
  confirmDonation,
  getDonationById,
  getMyDonations,
  getNgoDonations,
  getNgoDonationStats,
} = require('../controllers/donation.controller');

router.get('/my', auth, getMyDonations);
router.get('/ngo/received', auth, role('ngo', 'admin'), getNgoDonations);
router.get('/ngo/stats', auth, role('ngo', 'admin'), getNgoDonationStats);
router.post('/initiate', optionalAuth, initiateDonation);
router.post('/confirm', optionalAuth, confirmDonation);
router.get('/:id', auth, getDonationById);

module.exports = router;