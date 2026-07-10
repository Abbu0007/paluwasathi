import { useState, useEffect } from 'react';
import {
  Search, Download, Trash2, ShieldCheck, X, Check,
  ChevronLeft, ChevronRight, Mail, Phone, MapPin, Loader2,
} from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import { adminService, downloadCsv } from '../../services/admin.service';

const ROLES = ['volunteer', 'ngo', 'petOwner', 'admin'];

const ROLE_BADGE = {
  admin: 'bg-ink text-white',
  ngo: 'bg-primary-50 text-primary-dark',
  volunteer: 'bg-blue-50 text-blue-700',
  petOwner: 'bg-orange-50 text-orange-700',
};

const formatNPR = (n) => 'NPR ' + Number(n || 0).toLocaleString('en-IN');

export default function AdminUsersPage() {
  const { user: me } = useAuth();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const res = await adminService.getUsers(params);
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, roleFilter]);

  useEffect(() => {
    const t = setTimeout(function () {
      setPage(1);
      load();
    }, 400);
    return function () { clearTimeout(t); };
  }, [search]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetail({ loading: true });
    try {
      const res = await adminService.getUserDetail(id);
      setDetail(res.data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    setError('');
    setBusy(id);
    try {
      await adminService.updateUserRole(id, role);
      await load();
      if (detail && detail.user && detail.user._id === id) openDetail(id);
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.message) || 'Failed.');
    } finally {
      setBusy('');
    }
  };

  const handleVerify = async (id) => {
    setError('');
    setBusy(id);
    try {
      await adminService.toggleVerified(id);
      await load();
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.message) || 'Failed.');
    } finally {
      setBusy('');
    }
  };

  const handleDelete = async (id, name) => {
    const ok = window.confirm('Delete ' + name + ' permanently? This cannot be undone.');
    if (!ok) return;

    setError('');
    setBusy(id);
    try {
      await adminService.deleteUser(id);
      setDetail(null);
      await load();
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.message) || 'Failed.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl">

          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-ink">Users</h1>
              <p className="text-gray-500 text-sm">{total} accounts registered</p>
            </div>
            <button
              onClick={function () { downloadCsv('users'); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-white"
            >
              <Download size={15} /> Export CSV
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>
          )}

          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={function (e) { setSearch(e.target.value); }}
                placeholder="Search name, email or phone"
                className="w-full pl-11 pr-4 py-2.5 rounded-full border-2 border-gray-200 focus:border-primary outline-none text-sm bg-white"
              />
            </div>

            <div className="flex gap-1 bg-white p-1 rounded-full border border-gray-200">
              <button
                onClick={function () { setRoleFilter(''); setPage(1); }}
                className={roleFilter === ''
                  ? 'px-4 py-1.5 rounded-full text-xs font-bold bg-ink text-white'
                  : 'px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50'}
              >
                All
              </button>
              {ROLES.map(function (r) {
                const active = roleFilter === r;
                return (
                  <button
                    key={r}
                    onClick={function () { setRoleFilter(r); setPage(1); }}
                    className={active
                      ? 'px-4 py-1.5 rounded-full text-xs font-bold bg-ink text-white capitalize'
                      : 'px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50 capitalize'}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="py-20 flex justify-center"><Spinner /></div>
            ) : users.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-sm text-gray-400">No users match those filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">User</th>
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">Contact</th>
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">Role</th>
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">Verified</th>
                      <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(function (u) {
                      const isMe = me && u._id === me._id;
                      const initials = u.name.split(' ').map(function (n) { return n[0]; })
                        .slice(0, 2).join('').toUpperCase();
                      const badge = ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-600';
                      const isBusy = busy === u._id;

                      return (
                        <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-5 py-3.5">
                            <button
                              onClick={function () { openDetail(u._id); }}
                              className="flex items-center gap-3 text-left"
                            >
                              {u.profilePhoto && u.profilePhoto.url ? (
                                <img src={u.profilePhoto.url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                              ) : (
                                <span className="w-9 h-9 rounded-full bg-primary-50 text-primary-dark text-xs font-bold flex items-center justify-center shrink-0">
                                  {initials}
                                </span>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-ink truncate hover:text-primary">
                                  {u.name}
                                  {isMe && <span className="text-xs text-gray-400 font-normal"> (you)</span>}
                                </p>
                                <p className="text-xs text-gray-400">{u.district}</p>
                              </div>
                            </button>
                          </td>

                          <td className="px-5 py-3.5">
                            <p className="text-xs text-gray-600 truncate max-w-[200px]">{u.email}</p>
                            <p className="text-xs text-gray-400">{u.phone}</p>
                          </td>

                          <td className="px-5 py-3.5">
                            {isMe ? (
                              <span className={'inline-block px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ' + badge}>
                                {u.role}
                              </span>
                            ) : (
                              <select
                                value={u.role}
                                disabled={isBusy}
                                onChange={function (e) { handleRoleChange(u._id, e.target.value); }}
                                className="text-xs font-bold rounded-lg border border-gray-200 px-2 py-1.5 bg-white capitalize outline-none focus:border-primary disabled:opacity-50"
                              >
                                {ROLES.map(function (r) {
                                  return <option key={r} value={r}>{r}</option>;
                                })}
                              </select>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <button
                              onClick={function () { handleVerify(u._id); }}
                              disabled={isBusy}
                              className={u.isVerified
                                ? 'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary-50 text-primary-dark disabled:opacity-50'
                                : 'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 disabled:opacity-50'}
                            >
                              {u.isVerified ? <Check size={11} /> : <X size={11} />}
                              {u.isVerified ? 'Verified' : 'Unverified'}
                            </button>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            {isBusy ? (
                              <Loader2 size={15} className="animate-spin text-gray-400 inline" />
                            ) : (
                              <button
                                onClick={function () { handleDelete(u._id, u.name); }}
                                disabled={isMe}
                                className="p-2 rounded-lg text-gray-300 hover:text-danger hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-300"
                                title={isMe ? 'You cannot delete yourself' : 'Delete user'}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={function () { setPage(page - 1); }}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-40"
                >
                  <ChevronLeft size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={function () { setPage(page + 1); }}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-40"
                >
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {detail && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={function () { setDetail(null); }} />
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white z-50 overflow-y-auto">
            {detailLoading || detail.loading ? (
              <div className="h-full flex items-center justify-center"><Spinner /></div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 h-[72px] border-b border-gray-100 sticky top-0 bg-white">
                  <h2 className="font-black text-ink">User detail</h2>
                  <button onClick={function () { setDetail(null); }} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    {detail.user.profilePhoto && detail.user.profilePhoto.url ? (
                      <img src={detail.user.profilePhoto.url} alt="" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <span className="w-16 h-16 rounded-full bg-primary text-white text-lg font-black flex items-center justify-center">
                        {detail.user.name.split(' ').map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-black text-ink truncate">{detail.user.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={'px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ' + (ROLE_BADGE[detail.user.role] || 'bg-gray-100')}>
                          {detail.user.role}
                        </span>
                        {detail.user.isVerified && (
                          <ShieldCheck size={14} className="text-primary" />
                        )}
                      </div>
                    </div>
                  </div>

                  {detail.user.bio && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-6 p-4 bg-gray-50 rounded-xl">
                      {detail.user.bio}
                    </p>
                  )}

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail size={15} className="text-gray-400 shrink-0" />
                      <span className="truncate">{detail.user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone size={15} className="text-gray-400 shrink-0" />
                      {detail.user.phone}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPin size={15} className="text-gray-400 shrink-0" />
                      {detail.user.district}
                    </div>
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-3">
                    Activity
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-4 rounded-xl bg-gray-50">
                      <p className="text-lg font-black text-ink">{detail.stats.rescuesReported}</p>
                      <p className="text-xs text-gray-500">Cases reported</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50">
                      <p className="text-lg font-black text-ink">{detail.stats.rescuesAssigned}</p>
                      <p className="text-xs text-gray-500">Cases accepted</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50">
                      <p className="text-lg font-black text-ink">{formatNPR(detail.stats.donated)}</p>
                      <p className="text-xs text-gray-500">Donated ({detail.stats.donationCount})</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50">
                      <p className="text-lg font-black text-ink">{detail.stats.signups}</p>
                      <p className="text-xs text-gray-500">Task signups</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50">
                      <p className="text-lg font-black text-ink">{detail.stats.posts}</p>
                      <p className="text-xs text-gray-500">Community posts</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50">
                      <p className="text-lg font-black text-ink">{detail.stats.reports}</p>
                      <p className="text-xs text-gray-500">Lost/found reports</p>
                    </div>
                  </div>

                  {detail.ngoStats && (
                    <>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-3">
                        Organisation
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-4 rounded-xl bg-primary-50">
                          <p className="text-lg font-black text-primary-dark">{detail.ngoStats.petsListed}</p>
                          <p className="text-xs text-primary-dark/60">Pets listed</p>
                        </div>
                        <div className="p-4 rounded-xl bg-primary-50">
                          <p className="text-lg font-black text-primary-dark">{detail.ngoStats.petsAdopted}</p>
                          <p className="text-xs text-primary-dark/60">Pets adopted</p>
                        </div>
                        <div className="p-4 rounded-xl bg-primary-50">
                          <p className="text-lg font-black text-primary-dark">{formatNPR(detail.ngoStats.raised)}</p>
                          <p className="text-xs text-primary-dark/60">Funds raised</p>
                        </div>
                        <div className="p-4 rounded-xl bg-primary-50">
                          <p className="text-lg font-black text-primary-dark">{detail.ngoStats.campaigns}</p>
                          <p className="text-xs text-primary-dark/60">Campaigns</p>
                        </div>
                      </div>
                    </>
                  )}

                  <p className="text-xs text-gray-400">
                    Joined {new Date(detail.user.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}