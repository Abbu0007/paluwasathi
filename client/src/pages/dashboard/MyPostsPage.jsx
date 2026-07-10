import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Plus, Heart, Trash2, Eye } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { typeLabel, timeAgo } from '../../constants/community-options';
import { communityService } from '../../services/community.service';

const typeColors = {
  story: 'bg-primary-50 text-primary-dark',
  tip: 'bg-accent/10 text-accent-dark',
  question: 'bg-blue-50 text-blue-700',
  update: 'bg-gray-100 text-gray-700',
};

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const loadData = async () => {
    try {
      const res = await communityService.getMine();
      setPosts(res.data.posts);
      setTotalLikes(res.data.totalLikes);
      setTotalComments(res.data.totalComments);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (postId) => {
    const confirmed = window.confirm('Delete this post? This cannot be undone.');
    if (!confirmed) return;

    setBusy(postId);
    try {
      await communityService.deletePost(postId);
      await loadData();
    } catch {
      alert('Failed to delete post.');
    } finally {
      setBusy(null);
    }
  };

  const statCards = [
    { label: 'Posts', value: posts.length, Icon: MessageCircle },
    { label: 'Likes Received', value: totalLikes, Icon: Heart },
    { label: 'Comments', value: totalComments, Icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-ink">My Posts</h1>
            <p className="text-gray-500 text-sm">
              Stories, tips and questions you have shared.
            </p>
          </div>
          <Link to="/community/new" className="shrink-0">
            <Button variant="primary" icon={Plus}>Write a Post</Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 max-w-2xl">
          {statCards.map(function (card) {
            const Icon = card.Icon;
            return (
              <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-primary" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-ink">{card.value}</p>
                <p className="text-xs sm:text-sm text-gray-500">{card.label}</p>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="py-20"><Spinner size={40} /></div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">No posts yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Share a rescue story or something you have learned.
            </p>
            <Link to="/community/new">
              <Button variant="outline" size="sm" icon={Plus}>Write Your First Post</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(function (p) {
              const photos = p.photos || [];
              const likes = p.likes || [];
              const comments = p.comments || [];

              return (
                <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    {photos[0] ? (
                      <img src={photos[0].url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        <MessageCircle size={20} className="text-gray-300" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <span className={'inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-1.5 ' + (typeColors[p.type] || typeColors.update)}>
                        {typeLabel(p.type)}
                      </span>
                      <p className="font-black text-ink line-clamp-1">{p.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{p.content}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
                        <span className="flex items-center gap-1">
                          <Heart size={12} /> {likes.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} /> {comments.length}
                        </span>
                        <span>{timeAgo(p.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    <Link to={'/community/' + p._id} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50">
                        <Eye size={15} /> View Post
                      </button>
                    </Link>
                    <button
                      onClick={function () { handleDelete(p._id); }}
                      disabled={busy === p._id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border-2 border-gray-200 text-danger text-sm font-bold hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      {busy === p._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}