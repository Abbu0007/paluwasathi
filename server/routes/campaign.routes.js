const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { uploadPetPhotos } = require('../config/cloudinary');
const {
  getCampaigns,
  getCampaignById,
  getNgos,
  getNgoProfile,
  createCampaign,
  getMyCampaigns,
  updateCampaign,
  getCampaignStats,
} = require('../controllers/campaign.controller');

const handleUpload = (req, res, next) => {
  uploadPetPhotos(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed.' });
    next();
  });
};

router.get('/stats', getCampaignStats);
router.get('/ngos', getNgos);
router.get('/ngos/:id', getNgoProfile);
router.get('/mine', auth, role('ngo', 'admin'), getMyCampaigns);
router.get('/', getCampaigns);
router.post('/', auth, role('ngo', 'admin'), handleUpload, createCampaign);
router.patch('/:id', auth, role('ngo', 'admin'), updateCampaign);
router.get('/:id', getCampaignById);

module.exports = router;