import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Calendar, MapPin, X, CheckCircle2 } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { formatTaskDate, categoryLabel } from '../../constants/task-options';
import { signupService } from '../../services/task.service';

const statusVariant = {
  confirmed: 'new',
  attended: 'stable',
  no_show: 'critical',
};

export default function VolunteerTasksPage() {
  const [signups, setSignups] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [cancelling, setCancelling] = useState(null);

  const loadData = async () => {
    try {
      const res = await signupService.getMine();
      setSignups(res.data.signups);
      setTotalHours(res.data.totalHours);
    } catch {
      setSignups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCancel = async (signupId) => {
    const confirmed = window.confirm('Cancel this signup? Your spot will open for someone else.');
    if (!confirmed) return;

    setCancelling(signupId);
    try {
      await signupService.cancel(signupId);
      await loadData();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      alert(msg || 'Failed to cancel.');
    } finally {
      setCancelling(null);
    }
  };

  const now = new Date();
  const upcoming = signups.filter(function (s) {
    return s.task && new Date(s.task.startDate) >= now && s.status === 'confirmed';
  });
  const past = signups.filter(function (s) {
    return s.task && (new Date(s.task.startDate) < now || s.status === 'attended');
  });

  const list = tab === 'upcoming' ? upcoming : past;

  const statCards = [
    { label: 'Upcoming Tasks', value: upcoming.length, Icon: Calendar },
    { label: 'Completed', value: past.filter(function (s) { return s.status === 'attended'; }).length, Icon: CheckCircle2 },
    { label: 'Hours Logged', value: totalHours, Icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-ink">My Volunteer Tasks</h1>
            <p className="text-gray-500 text-sm">
              Opportunities you've signed up for and hours you've contributed.
            </p>
          </div>
          <Link to="/volunteer" className="shrink-0">
            <Button variant="primary" icon={Users}>Find Opportunities</Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 max-w-2xl">
          {statCards.map(function (card) {
            const Icon = card.Icon;
            return (
              <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-primary" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-ink">{card.value}</p>
                <p className="text-xs sm:text-sm text-gray-500">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-100 mb-6 w-fit">
          <button
            onClick={function () { setTab('upcoming'); }}
            className={tab === 'upcoming'
              ? 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-50 text-primary-dark'
              : 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50'}
          >
            <Calendar size={16} />
            Upcoming
            <span className="text-xs opacity-60">({upcoming.length})</span>
          </button>
          <button
            onClick={function () { setTab('past'); }}
            className={tab === 'past'
              ? 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-50 text-primary-dark'
              : 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50'}
          >
            <CheckCircle2 size={16} />
            Past
            <span className="text-xs opacity-60">({past.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20"><Spinner size={40} /></div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">
              {tab === 'upcoming' ? 'No upcoming tasks' : 'No past tasks'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {tab === 'upcoming'
                ? 'Sign up for an opportunity and it will appear here.'
                : 'Completed tasks will appear here.'}
            </p>
            <Link to="/volunteer">
              <Button variant="outline" size="sm">Browse Opportunities</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map(function (s) {
              const task = s.task || {};
              const ngo = task.ngo || {};
              const loc = task.location || {};
              const cover = task.coverImage || {};
              const timeRange = task.endTime ? task.startTime + ' – ' + task.endTime : task.startTime;

              return (
                <div key={s._id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    {cover.url ? (
                      <img src={cover.url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-primary-50 text-primary-dark text-xs font-bold mb-1">
                            {categoryLabel(task.category)}
                          </span>
                          <p className="font-black text-ink truncate">{task.title}</p>
                          <p className="text-xs text-gray-400">{s.confirmationNumber}</p>
                        </div>
                        <Badge variant={statusVariant[s.status]}>{s.status.replace('_', ' ')}</Badge>
                      </div>

                      <p className="text-sm text-gray-500 mb-2">{ngo.name}</p>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {formatTaskDate(task.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {timeRange}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {loc.district}
                        </span>
                      </div>

                      {s.status === 'attended' && s.hoursLogged > 0 && (
                        <p className="text-xs font-bold text-primary mt-2">
                          {s.hoursLogged} hours logged
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    <Link to={'/volunteer/confirmation/' + s._id} className="flex-1">
                      <button className="w-full py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50">
                        View Confirmation
                      </button>
                    </Link>
                    {tab === 'upcoming' && (
                      <button
                        onClick={function () { handleCancel(s._id); }}
                        disabled={cancelling === s._id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border-2 border-gray-200 text-danger text-sm font-bold hover:bg-red-50 disabled:opacity-50"
                      >
                        <X size={15} />
                        {cancelling === s._id ? 'Cancelling...' : 'Cancel'}
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