import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search, Download, Trash2, ChevronLeft, ChevronRight, Loader2, ExternalLink,
} from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import Spinner from '../../components/ui/Spinner';
import { adminService, downloadCsv } from '../../services/admin.service';

const formatNPR = (n) => 'NPR ' + Number(n || 0).toLocaleString('en-IN');
const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const nameOf = (ref) => (ref && ref.name) || '—';

const CONFIG = {
  rescues: {
    title: 'Rescue Cases',
    exportable: true,
    statuses: ['reported', 'assigned', 'en_route', 'on_scene', 'rescued', 'closed'],
    link: function (d) { return '/rescue/' + d._id; },
    columns: [
      { label: 'Case', get: function (d) { return d.caseNumber; }, bold: true },
      { label: 'Animal', get: function (d) { return d.animalType; }, capitalize: true },
      { label: 'Urgency', get: function (d) { return d.urgency; }, capitalize: true },
      { label: 'Reporter', get: function (d) { return d.reportedBy ? d.reportedBy.name : 'Guest'; } },
      { label: 'Volunteer', get: function (d) { return nameOf(d.assignedVolunteer); } },
      { label: 'Date', get: function (d) { return formatDate(d.createdAt); } },
    ],
  },
  pets: {
    title: 'Pets',
    statuses: ['available', 'pending', 'adopted'],
    link: function (d) { return '/adopt/' + d._id; },
    columns: [
      { label: 'Name', get: function (d) { return d.name; }, bold: true },
      { label: 'Species', get: function (d) { return d.species; }, capitalize: true },
      { label: 'Breed', get: function (d) { return d.breed || '—'; } },
      { label: 'Listed by', get: function (d) { return nameOf(d.listedBy); } },
      { label: 'Added', get: function (d) { return formatDate(d.createdAt); } },
    ],
  },
  adoptions: {
    title: 'Adoption Applications',
    exportable: true,
    statuses: ['pending', 'reviewing', 'approved', 'rejected'],
    columns: [
      { label: 'Application', get: function (d) { return d.applicationNumber; }, bold: true },
      { label: 'Pet', get: function (d) { return nameOf(d.pet); } },
      { label: 'Applicant', get: function (d) { return nameOf(d.applicant); } },
      { label: 'Submitted', get: function (d) { return formatDate(d.createdAt); } },
    ],
  },
  campaigns: {
    title: 'Campaigns',
    statuses: ['active', 'completed', 'cancelled'],
    link: function (d) { return '/donate/campaign/' + d._id; },
    columns: [
      { label: 'Title', get: function (d) { return d.title; }, bold: true },
      { label: 'NGO', get: function (d) { return nameOf(d.ngo); } },
      { label: 'Goal', get: function (d) { return formatNPR(d.goalAmount); } },
      { label: 'Raised', get: function (d) { return formatNPR(d.raisedAmount); } },
      { label: 'Donors', get: function (d) { return d.donorCount; } },
    ],
  },
  donations: {
    title: 'Donations',
    exportable: true,
    statuses: ['pending', 'completed', 'failed'],
    columns: [
      { label: 'Receipt', get: function (d) { return d.receiptNumber; }, bold: true },
      { label: 'Amount', get: function (d) { return formatNPR(d.amount); } },
      { label: 'Donor', get: function (d) { return d.isAnonymous ? 'Anonymous' : (d.donorInfo && d.donorInfo.name) || '—'; } },
      { label: 'NGO', get: function (d) { return nameOf(d.ngo); } },
      { label: 'Method', get: function (d) { return d.paymentMethod; }, capitalize: true },
      { label: 'Date', get: function (d) { return formatDate(d.createdAt); } },
    ],
  },
  tasks: {
    title: 'Volunteer Opportunities',
    statuses: ['open', 'full', 'completed', 'cancelled'],
    link: function (d) { return '/volunteer/' + d._id; },
    columns: [
      { label: 'Title', get: function (d) { return d.title; }, bold: true },
      { label: 'NGO', get: function (d) { return nameOf(d.ngo); } },
      { label: 'Needed', get: function (d) { return d.volunteersNeeded; } },
      { label: 'Joined', get: function (d) { return d.volunteersJoined; } },
      { label: 'Starts', get: function (d) { return formatDate(d.startDate); } },
    ],
  },
  lostfound: {
    title: 'Lost & Found Reports',
    statuses: ['active', 'reunited', 'closed'],
    link: function (d) { return '/lost-found/' + d._id; },
    columns: [
      { label: 'Report', get: function (d) { return d.reportNumber; }, bold: true },
      { label: 'Type', get: function (d) { return d.type; }, capitalize: true },
      { label: 'Pet', get: function (d) { return d.petName || d.color + ' ' + d.species; } },
      { label: 'District', get: function (d) { return (d.location && d.location.district) || '—'; } },
      { label: 'Reported', get: function (d) { return formatDate(d.createdAt); } },
    ],
  },
  posts: {
    title: 'Community Posts',
    statuses: ['published', 'hidden'],
    link: function (d) { return '/community/' + d._id; },
    columns: [
      { label: 'Title', get: function (d) { return d.title; }, bold: true },
      { label: 'Type', get: function (d) { return d.type; }, capitalize: true },
      { label: 'Author', get: function (d) { return nameOf(d.author); } },
      { label: 'Likes', get: function (d) { return (d.likes && d.likes.length) || 0; } },
      { label: 'Comments', get: function (d) { return (d.comments && d.comments.length) || 0; } },
      { label: 'Posted', get: function (d) { return formatDate(d.createdAt); } },
    ],
  },
  events: {
    title: 'Events',
    statuses: ['published', 'cancelled', 'completed'],
    link: function (d) { return '/events/' + d._id; },
    columns: [
      { label: 'Title', get: function (d) { return d.title; }, bold: true },
      { label: 'Category', get: function (d) { return d.category.replace('_', ' '); }, capitalize: true },
      { label: 'Organiser', get: function (d) { return nameOf(d.organiser); } },
      { label: 'Attendees', get: function (d) { return d.attendeeCount; } },
      { label: 'Starts', get: function (d) { return formatDate(d.startDate); } },
    ],
  },
};

const STATUS_STYLE = {
  reported: 'bg-gray-100 text-gray-600',
  assigned: 'bg-blue-50 text-blue-700',
  en_route: 'bg-blue-50 text-blue-700',
  on_scene: 'bg-orange-50 text-orange-700',
  rescued: 'bg-primary-50 text-primary-dark',
  closed: 'bg-gray-100 text-gray-500',
  available: 'bg-primary-50 text-primary-dark',
  pending: 'bg-orange-50 text-orange-700',
  adopted: 'bg-gray-100 text-gray-500',
  reviewing: 'bg-blue-50 text-blue-700',
  approved: 'bg-primary-50 text-primary-dark',
  rejected: 'bg-red-50 text-red-700',
  active: 'bg-primary-50 text-primary-dark',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-700',
  failed: 'bg-red-50 text-red-700',
  open: 'bg-primary-50 text-primary-dark',
  full: 'bg-orange-50 text-orange-700',
  reunited: 'bg-primary-50 text-primary-dark',
  published: 'bg-primary-50 text-primary-dark',
  hidden: 'bg-gray-100 text-gray-500',
};

export default function AdminCollectionPage() {
  const { collection } = useParams();
  const config = CONFIG[collection];

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    if (!config) return;
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await adminService.getCollection(collection, params);
      setItems(res.data.items);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setSearch('');
    setStatusFilter('');
  }, [collection]);

  useEffect(() => { load(); }, [collection, page, statusFilter]);

  useEffect(() => {
    const t = setTimeout(function () {
      setPage(1);
      load();
    }, 400);
    return function () { clearTimeout(t); };
  }, [search]);

  const handleStatus = async (id, status) => {
    setError('');
    setBusy(id);
    try {
      await adminService.updateStatus(collection, id, status);
      await load();
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.message) || 'Failed.');
    } finally {
      setBusy('');
    }
  };

  const handleDelete = async (id, label) => {
    const ok = window.confirm('Delete ' + label + ' permanently? This cannot be undone.');
    if (!ok) return;

    setError('');
    setBusy(id);
    try {
      await adminService.deleteDocument(collection, id);
      await load();
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.message) || 'Failed.');
    } finally {
      setBusy('');
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-8">
          <p className="text-gray-500">Unknown collection.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl">

          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-ink">{config.title}</h1>
              <p className="text-gray-500 text-sm">{total} records</p>
            </div>
            {config.exportable && (
              <button
                onClick={function () { downloadCsv(collection); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-white"
              >
                <Download size={15} /> Export CSV
              </button>
            )}
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
                placeholder="Search"
                className="w-full pl-11 pr-4 py-2.5 rounded-full border-2 border-gray-200 focus:border-primary outline-none text-sm bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-1 bg-white p-1 rounded-full border border-gray-200">
              <button
                onClick={function () { setStatusFilter(''); setPage(1); }}
                className={statusFilter === ''
                  ? 'px-4 py-1.5 rounded-full text-xs font-bold bg-ink text-white'
                  : 'px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50'}
              >
                All
              </button>
              {config.statuses.map(function (s) {
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={function () { setStatusFilter(s); setPage(1); }}
                    className={active
                      ? 'px-4 py-1.5 rounded-full text-xs font-bold bg-ink text-white'
                      : 'px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50'}
                  >
                    {s.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="py-20 flex justify-center"><Spinner /></div>
            ) : items.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-sm text-gray-400">No records match those filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {config.columns.map(function (c) {
                        return (
                          <th key={c.label} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                            {c.label}
                          </th>
                        );
                      })}
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">Status</th>
                      <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(function (d) {
                      const isBusy = busy === d._id;
                      const badge = STATUS_STYLE[d.status] || 'bg-gray-100 text-gray-600';
                      const label = config.columns[0].get(d);

                      return (
                        <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          {config.columns.map(function (c) {
                            let cls = 'px-5 py-3.5 text-sm text-gray-600';
                            if (c.bold) cls = 'px-5 py-3.5 text-sm font-bold text-ink';
                            if (c.capitalize) cls = cls + ' capitalize';

                            return (
                              <td key={c.label} className={cls}>
                                <span className="block max-w-[180px] truncate">{c.get(d)}</span>
                              </td>
                            );
                          })}

                          <td className="px-5 py-3.5">
                            <select
                              value={d.status}
                              disabled={isBusy}
                              onChange={function (e) { handleStatus(d._id, e.target.value); }}
                              className={'text-[11px] font-bold rounded-full px-2.5 py-1 border-0 outline-none capitalize disabled:opacity-50 ' + badge}
                            >
                              {config.statuses.map(function (s) {
                                return <option key={s} value={s}>{s.replace('_', ' ')}</option>;
                              })}
                            </select>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            {isBusy ? (
                              <Loader2 size={15} className="animate-spin text-gray-400 inline" />
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                {config.link && (
                                  <a
                                    href={config.link(d)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg text-gray-300 hover:text-primary hover:bg-primary-50"
                                    title="View on site"
                                  >
                                    <ExternalLink size={15} />
                                  </a>
                                )}
                                <button
                                  onClick={function () { handleDelete(d._id, label); }}
                                  className="p-2 rounded-lg text-gray-300 hover:text-danger hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
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
    </div>
  );
}