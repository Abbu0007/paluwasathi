import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Pin } from 'lucide-react';
import { typeLabel, timeAgo } from '../../constants/community-options';

const typeColors = {
  story: 'bg-primary-50 text-primary-dark',
  tip: 'bg-accent/10 text-accent-dark',
  question: 'bg-blue-50 text-blue-700',
  update: 'bg-gray-100 text-gray-700',
};

export default function PostCard({ post, currentUserId, onLike }) {
  const author = post.author || {};
  const photos = post.photos || [];
  const tags = post.tags || [];
  const likes = post.likes || [];

  const isLiked = currentUserId && likes.some(function (id) {
    const val = typeof id === 'object' ? id._id : id;
    return val === currentUserId;
  });

  const initials = author.name
    ? author.name.split(' ').map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase()
    : 'U';

  const heartClass = isLiked
    ? 'flex items-center gap-1.5 text-sm font-bold text-danger'
    : 'flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-danger transition-colors';

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) onLike(post._id);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="font-bold text-ink text-sm truncate">{author.name}</p>
              <p className="text-xs text-gray-400">
                {author.role === 'ngo' ? 'Organisation' : author.district || 'Nepal'}
                <span> · {timeAgo(post.createdAt)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {post.isPinned && <Pin size={14} className="text-accent" />}
            <span className={'px-2.5 py-0.5 rounded-full text-xs font-bold ' + (typeColors[post.type] || typeColors.update)}>
              {typeLabel(post.type)}
            </span>
          </div>
        </div>

        <Link to={'/community/' + post._id}>
          <h3 className="font-black text-ink text-lg leading-snug mb-2 hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {post.content}
          </p>
        </Link>

        {photos.length > 0 && (
          <Link to={'/community/' + post._id} className="block mt-4">
            <div className="rounded-xl overflow-hidden aspect-[16/9] bg-gray-100">
              <img src={photos[0].url} alt="" loading="lazy" className="w-full h-full object-cover" />
            </div>
            {photos.length > 1 && (
              <p className="text-xs text-gray-400 mt-1.5">+{photos.length - 1} more photo{photos.length > 2 ? 's' : ''}</p>
            )}
          </Link>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {tags.slice(0, 4).map(function (t) {
              return (
                <Link
                  key={t}
                  to={'/community?tag=' + t}
                  className="px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-500 text-xs font-medium hover:bg-gray-100"
                >
                  {t}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 px-5 py-3 border-t border-gray-50">
        <button onClick={handleLike} className={heartClass}>
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          {likes.length}
        </button>
        <Link
          to={'/community/' + post._id}
          className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-primary transition-colors"
        >
          <MessageCircle size={16} />
          {(post.comments || []).length}
        </Link>
      </div>
    </div>
  );
}