import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Siren, CheckCircle2, ArrowRight } from 'lucide-react';
import RescueCard from '../cards/RescueCard';
import Spinner from '../ui/Spinner';
import { rescueService } from '../../services/rescue.service';

const NEXT_STATUS = {
  assigned: { next: 'en_route', label: 'Mark En Route' },
  en_route: { next: 'on_scene', label: 'Mark On Scene' },
  on_scene: { next: 'rescued', label: 'Mark Rescued' },
};

export default function VolunteerPanel() {
  const [available, setAvailable] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [updating, setUpdating] = useState(null);

  const loadData = async () => {
    try {
      const [av, as] = await Promise.all([
        rescueService.getAvailable(),
        rescueService.getAssigned(),
      ]);
      setAvailable(av.data.rescues);
      setAssigned(as.data.rescues.filter((r) => r.status !== 'rescued'));
    } catch {
      // silently fail — empty states handle it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAccept = async (id) => {
    setAccepting(id);
    try {
      await rescueService.accept(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept case.');
    } finally {
      setAccepting(null);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* My assigned cases */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} className="text-primary" />
          <h2 className="font-bold text-ink">My Active Cases</h2>
          <span className="ml-auto text-xs font-bold text-gray-400">{assigned.length}</span>
        </div>

        {assigned.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            You haven't accepted any cases yet. Check available cases below.
          </p>
        ) : (
          <div className="space-y-4">
            {assigned.map((rescue) => {
              const action = NEXT_STATUS[rescue.status];
              return (
                <div key={rescue._id} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink text-sm">{rescue.caseNumber}</p>
                      <p className="text-xs text-gray-500 truncate">{rescue.location?.address}</p>
                      <p className="text-xs text-primary font-bold mt-1 capitalize">
                        {rescue.status.replace('_', ' ')}
                      </p>
                    </div>
                    <Link
                      to={`/rescue/${rescue._id}`}
                      className="text-xs font-bold text-primary shrink-0 flex items-center gap-1"
                    >
                      View <ArrowRight size={12} />
                    </Link>
                  </div>

                  {action && (
                    <button
                      onClick={() => handleUpdateStatus(rescue._id, action.next)}
                      disabled={updating === rescue._id}
                      className="w-full py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {updating === rescue._id ? 'Updating...' : action.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available cases */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Siren size={18} className="text-danger" />
          <h2 className="font-bold text-ink">Available Rescue Cases</h2>
          <span className="ml-auto text-xs font-bold text-gray-400">{available.length}</span>
        </div>

        {available.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No open cases right now. Great work — the area is covered!
          </p>
        ) : (
          <div className="space-y-4">
            {available.map((rescue) => (
              <RescueCard
                key={rescue._id}
                rescue={rescue}
                showAccept
                onAccept={handleAccept}
                accepting={accepting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}