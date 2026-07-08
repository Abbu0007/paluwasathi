const {
  uploadRescuePhotos,
  uploadPetPhotos,
  uploadProfilePhoto,
} = require('../config/cloudinary');

const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || 'Upload failed.',
      });
    }
    next();
  });
};

exports.rescuePhotos = handleUpload(uploadRescuePhotos);
exports.petPhotos = handleUpload(uploadPetPhotos);
exports.profilePhoto = handleUpload(uploadProfilePhoto);