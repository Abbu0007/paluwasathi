import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MapPin, Calendar, Sparkles, X } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { lostFoundService } from '../../services/lostfound.service';

const statusVariant = {
  active: 'new',
  reunited: 'stable',
  closed: 'neutral',
};

export default function MyLostFoundPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);

  const loadData = async () => {
    try {
      const res = await lostFoundService.getMine();
      setReports(res.data.reports);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleClose = async (reportId) => {
    const confirmed = window.confirm('Close this report? It will be hidden from the public list.');
    if (!confirmed) return;

    setBusy(reportId);
    try {
      await lostFoundService.close(reportId);
      await loadData();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      alert(msg || 'Failed to close report.');
    } finally {
      setBusy(null);
    }
  };

  const filtered = filter === 'all' ? reports : reports.filter(function (r) { return r.status === filter; });

  const activeCount = reports.filter(function (r) { return r.status === 'active'; }).length;
  const reunitedCount = reports.filter(function (r) { return r.status === 'reunited'; }).length;

  const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'reunited', label: 'Reunited' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-ink">My Lost & Found Reports</h1>
            <p className="text-gray-500 text-sm">
              Pets you have reported lost or found.
            </p>
          </div>
          <Link to="/lost-found/report" className="shrink-0">
            <Button variant="primary" icon={Plus}>New Report</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <p className="text-xl sm:text-2xl font-black text-ink">{activeCount}</p>
            <p className="text-xs sm:text-sm text-gray-500">Active reports</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <p className="text-xl sm:text-2xl font-black text-primary">{reunitedCount}</p>
            <p className="text-xs sm:text-sm text-gray-500">Reunited</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(function (f) {
            const active = filter === f.value;
            return (
              <button key={f.value} onClick={function () { setFilter(f.value); }}
                className={active
                  ? 'px-4 py-1.5 rounded-full text-sm font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                  : 'px-4 py-1.5 rounded-full text-sm font-bold border-2 border-gray-200 text-gray-600 bg-white'}>
                {f.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-20"><Spinner size={40} /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">
              {filter === 'all' ? 'No reports yet' : 'No ' + filter + ' reports'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Report a lost or found pet and it will appear here.
            </p>
            <Link to="/lost-found/report">
              <Button variant="outline" size="sm">Report a Pet</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(function (r) {
              const photos = r.photos || [];
              const loc = r.location || {};
              const isLost = r.type === 'lost';
              const isActive = r.status === 'active';

              return (
                <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    {photos[0] ? (
                      <img src={photos[0].url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <span className={isLost
                            ? 'inline-block px-2 py-0.5 rounded-full bg-danger text-white text-xs font-bold mb-1'
                            : 'inline-block px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold mb-1'}>
                            {isLost ? 'LOST' : 'FOUND'}
                          </span>
                          <p className="font-black text-ink truncate">
                            {r.petName || r.color + ' ' + r.species}
                          </p>
                          <p className="text-xs text-gray-400">{r.reportNumber}</p>
                        </div>
                        <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate">{loc.district}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {r.daysAgo} days ago
                        </span>
                      </div>

                      {r.matchedWith && (
                        <p className="text-xs font-bold text-primary flex items-center gap-1 mt-2">
                          <Sparkles size={12} />
                          Matched with {r.matchedWith.reportNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    <Link to={'/lost-found/' + r._id} className="flex-1">
                      <button className="w-full py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50">
                        View Report
                      </button>
                    </Link>
                    {isActive && (
                      <button
                        onClick={function () { handleClose(r._id); }}
                        disabled={busy === r._id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border-2 border-gray-200 text-danger text-sm font-bold hover:bg-red-50 disabled:opacity-50"
                      >
                        <X size={15} />
                        {busy === r._id ? 'Closing...' : 'Close'}
                      </button>
                    )}
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