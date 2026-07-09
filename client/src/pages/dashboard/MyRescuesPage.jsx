import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Siren } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import RescueCard from '../../components/cards/RescueCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { rescueService } from '../../services/rescue.service';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'rescued', label: 'Rescued' },
];

export default function MyRescuesPage() {
  const [rescues, setRescues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    rescueService.getMine()
      .then(({ data }) => setRescues(data.rescues))
      .catch(() => setRescues([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rescues.filter((r) => {
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
              Every animal you've reported and their current status.
            </p>
          </div>
          <Link to="/rescue/report" className="shrink-0">
            <Button variant="primary" icon={Plus}>Report New</Button>
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          {FILTERS.map((f) => (
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
              {filter === 'all' ? 'No rescues reported yet' : `No ${filter} cases`}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              When you report an animal in need, it will appear here.
            </p>
            <Link to="/rescue/report">
              <Button variant="outline" size="sm">Report a Rescue</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((rescue) => (
              <Link key={rescue._id} to={`/rescue/${rescue._id}`}>
                <RescueCard rescue={rescue} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}