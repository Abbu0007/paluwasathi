const CommunityPost = require('../models/CommunityPost');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

exports.getPosts = async (req, res) => {
  try {
    const { type, tag, search, sort = 'newest', page = 1, limit = 10 } = req.query;

    const filter = { status: 'published' };
    if (type) filter.type = { $in: type.split(',') };
    if (tag) filter.tags = tag;
    if (search) filter.$text = { $search: search };

    let query = CommunityPost.find(filter)
      .populate('author', 'name role district')
      .populate('comments.author', 'name');

    if (sort === 'popular') {
      const all = await query.lean({ virtuals: true });
      const sorted = all
        .sort((a, b) => (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length))
        .slice((page - 1) * limit, page * limit);
      const total = await CommunityPost.countDocuments(filter);
      return res.json({ posts: sorted, total, page: Number(page), totalPages: Math.ceil(total / limit) });
    }

    const sortMap = {
      newest: { isPinned: -1, createdAt: -1 },
      oldest: { createdAt: 1 },
    };

    const posts = await query
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await CommunityPost.countDocuments(filter);

    res.json({ posts, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts.', error: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('author', 'name role district createdAt')
      .populate('comments.author', 'name role');

    if (!post || post.status === 'hidden') {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const related = await CommunityPost.find({
      _id: { $ne: post._id },
      type: post.type,
      status: 'published',
    })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({ post, related });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch post.', error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const body = req.body;

    let photos = [];
    if (req.files && req.files.length) {
      const uploads = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.buffer, 'paluwasathi/community'))
      );
      photos = uploads.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
    }

    const post = await CommunityPost.create({
      author: req.user.userId,
      type: body.type,
      title: body.title,
      content: body.content,
      photos,
      tags: body.tags ? JSON.parse(body.tags) : [],
    });

    await post.populate('author', 'name role district');

    res.status(201).json({ message: 'Post published.', post });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create post.', error: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const userId = req.user.userId;
    const index = post.likes.findIndex((id) => id.toString() === userId);

    let liked;
    if (index > -1) {
      post.likes.splice(index, 1);
      liked = false;
    } else {
      post.likes.push(userId);
      liked = true;
    }

    await post.save();
    res.json({ liked, likeCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update like.', error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty.' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    post.comments.push({ author: req.user.userId, text: text.trim() });
    await post.save();
    await post.populate('comments.author', 'name role');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({ message: 'Comment added.', comment: newComment, commentCount: post.comments.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment.', error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const isCommentAuthor = comment.author.toString() === req.user.userId;
    const isPostAuthor = post.author.toString() === req.user.userId;

    if (!isCommentAuthor && !isPostAuthor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You cannot delete this comment.' });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: 'Comment deleted.', commentCount: post.comments.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete comment.', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const isAuthor = post.author.toString() === req.user.userId;
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post.', error: err.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find({ author: req.user.userId })
      .sort({ createdAt: -1 });

    const totalLikes = posts.reduce((sum, p) => sum + p.likes.length, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.comments.length, 0);

    res.json({ posts, totalLikes, totalComments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your posts.', error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalPosts = await CommunityPost.countDocuments({ status: 'published' });

    const agg = await CommunityPost.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: { $size: '$likes' } },
          totalComments: { $sum: { $size: '$comments' } },
        },
      },
    ]);

    const authors = await CommunityPost.distinct('author', { status: 'published' });

    res.json({
      totalPosts,
      totalLikes: (agg[0] && agg[0].totalLikes) || 0,
      totalComments: (agg[0] && agg[0].totalComments) || 0,
      contributors: authors.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message });
  }
};

exports.getPopularTags = async (req, res) => {
  try {
    const tags = await CommunityPost.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]);

    res.json({ tags: tags.map((t) => ({ tag: t._id, count: t.count })) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tags.', error: err.message });
  }
};