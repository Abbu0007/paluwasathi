import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Heart, ArrowRight } from 'lucide-react';
import ApplicationCard from './ApplicationCard';
import Spinner from '../ui/Spinner';
import { adoptionService } from '../../services/pet.service';

export default function NgoPanel() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const loadData = async () => {
    try {
      const { data } = await adoptionService.getNgoApplications({ status: 'pending' });
      setApplications(data.adoptions);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <h2 className="font-bold text-ink">Pending Applications</h2>
          <span className="text-xs font-bold text-gray-400">({applications.length})</span>
        </div>
        <Link
          to="/dashboard/applications"
          className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <Heart size={24} className="text-primary" />
          </div>
          <p className="font-bold text-ink mb-1">No pending applications</p>
          <p className="text-sm text-gray-500">
            When someone applies to adopt one of your pets, it appears here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.slice(0, 3).map((app) => (
            <ApplicationCard
              key={app._id}
              application={app}
              onDecision={handleDecision}
              busy={busy === app._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}