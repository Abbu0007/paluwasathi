import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, MessageCircle, Trash2, Send, Pin, Share2,
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { typeLabel, timeAgo } from '../../constants/community-options';
import { useAuth } from '../../context/AuthContext';
import { communityService } from '../../services/community.service';

const typeColors = {
  story: 'bg-primary-50 text-primary-dark',
  tip: 'bg-accent/10 text-accent-dark',
  question: 'bg-blue-50 text-blue-700',
  update: 'bg-gray-100 text-gray-700',
};

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const loadData = async () => {
    try {
      const res = await communityService.getById(id);
      setPost(res.data.post);
      setRelated(res.data.related);
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await communityService.toggleLike(id);
      await loadData();
    } catch {
      // silent
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await communityService.addComment(id, comment.trim());
      setComment('');
      await loadData();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      alert(msg || 'Failed to post comment.');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm('Delete this comment?');
    if (!confirmed) return;
    try {
      await communityService.deleteComment(id, commentId);
      await loadData();
    } catch {
      alert('Failed to delete comment.');
    }
  };

  const handleDeletePost = async () => {
    const confirmed = window.confirm('Delete this post? This cannot be undone.');
    if (!confirmed) return;
    try {
      await communityService.deletePost(id);
      navigate('/community');
    } catch {
      alert('Failed to delete post.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard.');
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center"><Spinner size={40} /></div>
      </PageWrapper>
    );
  }

  if (!post) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-black text-ink mb-2">Post not found</h1>
          <Link to="/community" className="font-bold text-primary hover:underline">
            Back to community
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const author = post.author || {};
  const photos = post.photos || [];
  const tags = post.tags || [];
  const likes = post.likes || [];
  const comments = post.comments || [];

  const currentUserId = user && user._id;
  const isAuthor = currentUserId && author._id === currentUserId;
  const isLiked = currentUserId && likes.some(function (lid) {
    const val = typeof lid === 'object' ? lid._id : lid;
    return val === currentUserId;
  });

  const initials = author.name
    ? author.name.split(' ').map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase()
    : 'U';

  const likeBtnClass = isLiked
    ? 'flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 text-danger text-sm font-bold'
    : 'flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:border-danger hover:text-danger transition-colors';

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/community" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to community
        </Link>

        <article className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-ink truncate">{author.name}</p>
                <p className="text-xs text-gray-400">
                  {author.role === 'ngo' ? 'Organisation' : author.district || 'Nepal'}
                  <span> · {timeAgo(post.createdAt)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {post.isPinned && <Pin size={16} className="text-accent" />}
              <span className={'px-3 py-1 rounded-full text-xs font-bold ' + (typeColors[post.type] || typeColors.update)}>
                {typeLabel(post.type)}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-ink leading-tight mb-5">
            {post.title}
          </h1>

          {photos.length > 0 && (
            <div className="mb-6">
              <div className="rounded-xl overflow-hidden aspect-[16/9] bg-gray-100 mb-2">
                <img src={photos[activePhoto].url} alt="" className="w-full h-full object-cover" />
              </div>
              {photos.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {photos.map(function (p, i) {
                    const thumbClass = activePhoto === i
                      ? 'aspect-square rounded-lg overflow-hidden border-2 border-primary'
                      : 'aspect-square rounded-lg overflow-hidden border-2 border-transparent';
                    return (
                      <button key={i} onClick={function () { setActivePhoto(i); }} className={thumbClass}>
                        <img src={p.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
            {post.content}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map(function (t) {
                return (
                  <Link
                    key={t}
                    to={'/community?tag=' + t}
                    className="px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-xs font-medium hover:bg-gray-100"
                  >
                    #{t}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
            <button onClick={handleLike} className={likeBtnClass}>
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              {likes.length}
            </button>

            <span className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold">
              <MessageCircle size={16} />
              {comments.length}
            </span>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50"
            >
              <Share2 size={16} />
            </button>

            {isAuthor && (
              <button
                onClick={handleDeletePost}
                className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-full text-danger text-sm font-bold hover:bg-red-50"
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </article>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mt-5">
          <h2 className="font-black text-ink mb-5">
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </h2>

          {isAuthenticated && user ? (
            <div className="flex gap-3 mb-6">
              <span className="w-10 h-10 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
                {user.name.split(' ').map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase()}
              </span>
              <div className="flex-1">
                <textarea
                  rows={2}
                  maxLength={500}
                  value={comment}
                  onChange={function (e) { setComment(e.target.value); }}
                  placeholder="Add a comment"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none text-sm"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">{comment.length}/500</p>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Send}
                    loading={posting}
                    disabled={!comment.trim()}
                    onClick={handleComment}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gray-50 mb-6 text-center">
              <p className="text-sm text-gray-600 mb-3">Log in to join the conversation.</p>
              <Link to="/login">
                <Button variant="outline" size="sm">Log In</Button>
              </Link>
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No comments yet. Be the first.
            </p>
          ) : (
            <div className="space-y-5">
              {comments.map(function (c) {
                const ca = c.author || {};
                const cInitials = ca.name
                  ? ca.name.split(' ').map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase()
                  : 'U';
                const canDelete = currentUserId && (ca._id === currentUserId || isAuthor);

                return (
                  <div key={c._id} className="flex gap-3">
                    <span className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {cInitials}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="font-bold text-ink text-sm truncate">{ca.name}</p>
                            {ca.role === 'ngo' && (
                              <span className="px-1.5 py-0.5 rounded bg-primary-50 text-primary-dark text-xs font-bold shrink-0">
                                NGO
                              </span>
                            )}
                          </div>
                          {canDelete && (
                            <button
                              onClick={function () { handleDeleteComment(c._id); }}
                              className="text-gray-300 hover:text-danger shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{c.text}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-1">{timeAgo(c.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="font-black text-ink mb-4">More {typeLabel(post.type).toLowerCase()} posts</h2>
            <div className="space-y-3">
              {related.map(function (r) {
                const ra = r.author || {};
                return (
                  <Link
                    key={r._id}
                    to={'/community/' + r._id}
                    className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
                  >
                    <p className="font-bold text-ink text-sm line-clamp-1">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {ra.name} · {timeAgo(r.createdAt)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}