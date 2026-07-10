const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  getOverview,
  getRecentActivity,
  getUsers,
  getUserDetail,
  updateUserRole,
  toggleUserVerified,
  deleteUser,
  getCollection,
  deleteDocument,
  updateDocumentStatus,
  exportCsv,
} = require('../controllers/admin.controller');

router.use(auth, role('admin'));

router.get('/overview', getOverview);
router.get('/activity', getRecentActivity);

router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/verify', toggleUserVerified);
router.delete('/users/:id', deleteUser);

router.get('/export/:collection', exportCsv);

router.get('/collections/:collection', getCollection);
router.patch('/collections/:collection/:id/status', updateDocumentStatus);
router.delete('/collections/:collection/:id', deleteDocument);

module.exports = router;