const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

const communityPostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    type: {
      type: String,
      enum: ['story', 'update', 'question', 'tip'],
      required: true,
    },

    title: { type: String, required: true, trim: true, maxlength: 150 },
    content: { type: String, required: true, maxlength: 5000 },

    photos: [{ url: String, publicId: String }],
    tags: [String],

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],

    isPinned: { type: Boolean, default: false },
    status: { type: String, enum: ['published', 'hidden'], default: 'published' },
  },
  { timestamps: true }
);

communityPostSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

communityPostSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

communityPostSchema.set('toJSON', { virtuals: true });

communityPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
communityPostSchema.index({ type: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);