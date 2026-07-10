const router = require('express').Router();
const auth = require('../middleware/auth');
const { uploadPetPhotos } = require('../config/cloudinary');
const {
  getPosts,
  getPostById,
  createPost,
  toggleLike,
  addComment,
  deleteComment,
  deletePost,
  getMyPosts,
  getStats,
  getPopularTags,
} = require('../controllers/community.controller');

const handleUpload = (req, res, next) => {
  uploadPetPhotos(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed.' });
    next();
  });
};

router.get('/stats', getStats);
router.get('/tags', getPopularTags);
router.get('/my', auth, getMyPosts);
router.get('/', getPosts);
router.post('/', auth, handleUpload, createPost);
router.post('/:id/like', auth, toggleLike);
router.post('/:id/comments', auth, addComment);
router.delete('/:id/comments/:commentId', auth, deleteComment);
router.delete('/:id', auth, deletePost);
router.get('/:id', getPostById);

module.exports = router;