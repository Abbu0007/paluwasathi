import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Siren, Plus, Filter } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import RescueCard from '../../components/cards/RescueCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { rescueService } from '../../services/rescue.service';

const URGENCY_FILTERS = [
  { value: '', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
];

const STATUS_FILTERS = [
  { value: '', label: 'All Cases' },
  { value: 'reported', label: 'Awaiting Volunteer' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'en_route', label: 'En Route' },
  { value: 'on_scene', label: 'On Scene' },
  { value: 'rescued', label: 'Rescued' },
];

export default function RescueListPage() {
  const [rescues, setRescues] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, rescued: 0 });
  const [loading, setLoading] = useState(true);
  const [urgency, setUrgency] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    rescueService.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (urgency) params.urgency = urgency;
    if (status) params.status = status;

    rescueService.getAll(params)
      .then(({ data }) => setRescues(data.rescues))
      .catch(() => setRescues([]))
      .finally(() => setLoading(false));
  }, [urgency, status]);

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-wide mb-1">
              Live Cases
            </p>
            <h1 className="text-3xl font-black text-ink">Rescue Cases in Nepal</h1>
            <p className="text-gray-500 mt-1">
              Every case here is a real animal waiting for help.
            </p>
          </div>
          <Link to="/rescue/report" className="shrink-0">
            <Button variant="primary" icon={Plus}>Report a Rescue</Button>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <p className="text-2xl sm:text-3xl font-black text-ink">{stats.total}</p>
            <p className="text-xs sm:text-sm text-gray-500">Total Cases</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <p className="text-2xl sm:text-3xl font-black text-danger">{stats.active}</p>
            <p className="text-xs sm:text-sm text-gray-500">Active Now</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <p className="text-2xl sm:text-3xl font-black text-primary">{stats.rescued}</p>
            <p className="text-xs sm:text-sm text-gray-500">Rescued</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-gray-400" />
            <p className="text-sm font-bold text-ink">Filter cases</p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Urgency</p>
              <div className="flex flex-wrap gap-2">
                {URGENCY_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setUrgency(f.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                      urgency === f.value
                        ? 'border-primary bg-primary-50 text-primary-dark'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatus(f.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                      status === f.value
                        ? 'border-primary bg-primary-50 text-primary-dark'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-20"><Spinner size={40} /></div>
        ) : rescues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Siren size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">No cases match your filters</p>
            <p className="text-sm text-gray-500 mb-6">
              Try changing the filters, or report a new case.
            </p>
            <Link to="/rescue/report">
              <Button variant="outline" size="sm">Report a Rescue</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {rescues.length} case{rescues.length !== 1 && 's'}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {rescues.map((rescue) => (
                <Link key={rescue._id} to={`/rescue/${rescue._id}`}>
                  <RescueCard rescue={rescue} />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}