const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { uploadPetPhotos } = require('../config/cloudinary');
const {
  getPets,
  getPetById,
  getPetStats,
  createPet,
  savePet,
  unsavePet,
  getSavedPets,
} = require('../controllers/pet.controller');

const handlePetUpload = (req, res, next) => {
  uploadPetPhotos(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed.' });
    next();
  });
};

router.get('/stats', getPetStats);
router.get('/saved', auth, getSavedPets);
router.get('/', getPets);
router.post('/', auth, role('ngo', 'admin'), handlePetUpload, createPet);
router.post('/:petId/save', auth, savePet);
router.delete('/:petId/save', auth, unsavePet);
router.get('/:id', getPetById);

module.exports = router;