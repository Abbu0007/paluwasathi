import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import ApplicationCard from '../../components/dashboard/ApplicationCard';
import Spinner from '../../components/ui/Spinner';
import { adoptionService } from '../../services/pet.service';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [busy, setBusy] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await adoptionService.getNgoApplications(params);
      setApplications(data.adoptions);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filter]);

  const handleDecision = async (id, status, reviewNote) => {
    setBusy(id);
    try {
      await adoptionService.updateStatus(id, status, reviewNote);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-ink">Adoption Applications</h1>
          <p className="text-gray-500 text-sm">
            Review applications for pets your shelter has listed.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value || 'all'}
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
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">
              {filter ? `No ${filter} applications` : 'No applications yet'}
            </p>
            <p className="text-sm text-gray-500">
              Applications for your listed pets will appear here.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-5">
            {applications.map((app) => (
              <ApplicationCard
                key={app._id}
                application={app}
                onDecision={handleDecision}
                busy={busy === app._id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}