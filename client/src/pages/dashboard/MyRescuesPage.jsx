import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Siren, CheckCircle2 } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import RescueCard from '../../components/cards/RescueCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { rescueService } from '../../services/rescue.service';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'rescued', label: 'Rescued' },
];

const NEXT_STATUS = {
  assigned: { next: 'en_route', label: 'Mark En Route' },
  en_route: { next: 'on_scene', label: 'Mark On Scene' },
  on_scene: { next: 'rescued', label: 'Mark Rescued' },
};

export default function MyRescuesPage() {
  const { user } = useAuth();
  const isVolunteer = user?.role === 'volunteer';

  const [tab, setTab] = useState(isVolunteer ? 'accepted' : 'reported');
  const [reported, setReported] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const loadData = async () => {
    try {
      const calls = [rescueService.getMine()];
      if (isVolunteer) calls.push(rescueService.getAssigned());

      const results = await Promise.all(calls);
      setReported(results[0].data.rescues);
      if (isVolunteer) setAccepted(results[1].data.rescues);
    } catch {
      // empty states handle it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await rescueService.updateStatus(id, status);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const source = tab === 'accepted' ? accepted : reported;

  const filtered = source.filter((r) => {
    if (filter === 'active') return !['rescued', 'closed'].includes(r.status);
    if (filter === 'rescued') return r.status === 'rescued';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-ink">My Rescue Cases</h1>
            <p className="text-gray-500 text-sm">
              {isVolunteer
                ? 'Cases you have accepted and cases you have reported.'
                : "Every animal you've reported and their current status."}
            </p>
          </div>
          <Link to="/rescue/report" className="shrink-0">
            <Button variant="primary" icon={Plus}>Report New</Button>
          </Link>
        </div>

        {/* Tabs — volunteers only */}
        {isVolunteer && (
          <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-100 mb-4 w-fit">
            <button
              onClick={() => { setTab('accepted'); setFilter('all'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                tab === 'accepted'
                  ? 'bg-primary-50 text-primary-dark'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <CheckCircle2 size={16} />
              Accepted
              <span className="text-xs opacity-60">({accepted.length})</span>
            </button>
            <button
              onClick={() => { setTab('reported'); setFilter('all'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                tab === 'reported'
                  ? 'bg-primary-50 text-primary-dark'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Siren size={16} />
              Reported
              <span className="text-xs opacity-60">({reported.length})</span>
            </button>
          </div>
        )}

        {/* Status filters */}
        <div className="flex gap-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                filter === f.value
                  ? 'border-primary bg-primary-50 text-primary-dark'
                  : 'border-gray-200 text-gray-600 bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20"><Spinner size={40} /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Siren size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">
              {tab === 'accepted'
                ? 'No accepted cases'
                : filter === 'all'
                  ? 'No rescues reported yet'
                  : `No ${filter} cases`}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {tab === 'accepted'
                ? 'Accept a case from your dashboard to start helping.'
                : 'When you report an animal in need, it will appear here.'}
            </p>
            <Link to={tab === 'accepted' ? '/dashboard' : '/rescue/report'}>
              <Button variant="outline" size="sm">
                {tab === 'accepted' ? 'View Available Cases' : 'Report a Rescue'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((rescue) => {
              const action = tab === 'accepted' ? NEXT_STATUS[rescue.status] : null;
              return (
                <div key={rescue._id}>
                  <Link to={`/rescue/${rescue._id}`}>
                    <RescueCard rescue={rescue} />
                  </Link>
                  {action && (
                    <button
                      onClick={() => handleUpdateStatus(rescue._id, action.next)}
                      disabled={updating === rescue._id}
                      className="w-full mt-2 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {updating === rescue._id ? 'Updating...' : action.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}