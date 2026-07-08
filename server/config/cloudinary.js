const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const rescueStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'paluwasathi/rescues',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
  },
});

const petStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'paluwasathi/pets',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }],
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'paluwasathi/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

exports.cloudinary = cloudinary;

exports.uploadRescuePhotos = multer({
  storage: rescueStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('photos', 5);

exports.uploadPetPhotos = multer({
  storage: petStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('photos', 8);

exports.uploadProfilePhoto = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('photo');