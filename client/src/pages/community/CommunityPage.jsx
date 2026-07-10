import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MessageCircle, Plus, Search, Users, Heart, X } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import PostCard from '../../components/cards/PostCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { POST_TYPES, COMMUNITY_SORT } from '../../constants/community-options';
import { useAuth } from '../../context/AuthContext';
import { communityService } from '../../services/community.service';

export default function CommunityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0, contributors: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');

  const type = searchParams.get('type') || '';
  const tag = searchParams.get('tag') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    communityService.getStats().then(function (res) { setStats(res.data); }).catch(function () {});
    communityService.getTags().then(function (res) { setTags(res.data.tags); }).catch(function () {});
  }, []);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const loadPosts = () => {
    setLoading(true);
    const params = { sort, limit: 10 };
    if (type) params.type = type;
    if (tag) params.tag = tag;
    if (search) params.search = search;

    communityService.getAll(params)
      .then(function (res) { setPosts(res.data.posts); })
      .catch(function () { setPosts([]); })
      .finally(function () { setLoading(false); });
  };

  useEffect(() => { loadPosts(); }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const handleSearch = () => {
    updateParam('search', searchInput.trim());
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) return;
    try {
      await communityService.toggleLike(postId);
      loadPosts();
    } catch {
      // silent
    }
  };

  const clearAll = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const activeCount = (type ? 1 : 0) + (tag ? 1 : 0) + (search ? 1 : 0);

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-wide mb-1">Community</p>
            <h1 className="text-3xl font-black text-ink">Stories, Advice, Questions</h1>
            <p className="text-gray-500 mt-1 max-w-2xl">
              A place for the people doing this work to talk to each other.
            </p>
          </div>
          {isAuthenticated && (
            <Link to="/community/new" className="shrink-0">
              <Button variant="primary" icon={Plus}>Write a Post</Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <MessageCircle size={18} className="text-primary" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-ink">{stats.totalPosts}</p>
            <p className="text-xs sm:text-sm text-gray-500">Posts</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <Users size={18} className="text-primary" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-primary">{stats.contributors}</p>
            <p className="text-xs sm:text-sm text-gray-500">Contributors</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <Heart size={18} className="text-primary" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-accent">{stats.totalLikes}</p>
            <p className="text-xs sm:text-sm text-gray-500">Likes given</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={function (e) { setSearchInput(e.target.value); }}
              onKeyDown={function (e) { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Search posts"
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink"
            />
          </div>
          <select
            value={sort}
            onChange={function (e) { updateParam('sort', e.target.value); }}
            className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-600 outline-none focus:border-primary"
          >
            {COMMUNITY_SORT.map(function (o) {
              return <option key={o.value} value={o.value}>{o.label}</option>;
            })}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={function () { updateParam('type', ''); }}
            className={!type
              ? 'px-4 py-1.5 rounded-full text-sm font-bold border-2 border-primary bg-primary-50 text-primary-dark'
              : 'px-4 py-1.5 rounded-full text-sm font-bold border-2 border-gray-200 text-gray-600 bg-white'}
          >
            All
          </button>
          {POST_TYPES.map(function (t) {
            const active = type === t.value;
            return (
              <button
                key={t.value}
                onClick={function () { updateParam('type', t.value); }}
                className={active
                  ? 'px-4 py-1.5 rounded-full text-sm font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                  : 'px-4 py-1.5 rounded-full text-sm font-bold border-2 border-gray-200 text-gray-600 bg-white'}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {activeCount > 0 && (
          <div className="flex items-center gap-2 mb-6">
            {tag && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-dark text-sm font-bold">
                #{tag}
                <button onClick={function () { updateParam('tag', ''); }}>
                  <X size={13} />
                </button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-bold">
                "{search}"
                <button onClick={function () { updateParam('search', ''); }}>
                  <X size={13} />
                </button>
              </span>
            )}
            <button onClick={clearAll} className="text-sm font-bold text-gray-400 hover:text-gray-600">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="py-20"><Spinner size={40} /></div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={24} className="text-primary" />
                </div>
                <p className="font-bold text-ink mb-1">No posts found</p>
                <p className="text-sm text-gray-500 mb-6">
                  {activeCount > 0 ? 'Try a different filter.' : 'Be the first to write something.'}
                </p>
                {activeCount > 0 ? (
                  <Button variant="outline" size="sm" onClick={clearAll}>Clear filters</Button>
                ) : isAuthenticated && (
                  <Link to="/community/new">
                    <Button variant="outline" size="sm">Write a Post</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {posts.map(function (p) {
                  return (
                    <PostCard
                      key={p._id}
                      post={p}
                      currentUserId={user && user._id}
                      onLike={handleLike}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-[88px] space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Popular tags</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(function (t) {
                    const active = tag === t.tag;
                    return (
                      <button
                        key={t.tag}
                        onClick={function () { updateParam('tag', active ? '' : t.tag); }}
                        className={active
                          ? 'px-3 py-1 rounded-full bg-primary text-white text-xs font-bold'
                          : 'px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100'}
                      >
                        {t.tag}
                        <span className="opacity-50 ml-1">{t.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isAuthenticated && (
                <div className="bg-primary rounded-2xl p-5 text-white">
                  <p className="font-black mb-1">Join the conversation</p>
                  <p className="text-sm text-white/80 mb-4">
                    Sign in to post, comment, and support others.
                  </p>
                  <Link to="/login">
                    <button className="w-full py-2.5 rounded-full bg-white text-primary-dark text-sm font-bold">
                      Log In
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>

      </div>
    </PageWrapper>
  );
}