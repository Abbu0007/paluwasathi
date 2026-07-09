import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, Phone,
  CheckCircle2, AlertTriangle, Utensils, Car, Check, ArrowRight,
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { categoryLabel, formatTaskDate } from '../../constants/task-options';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/task.service';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [task, setTask] = useState(null);
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    taskService.getById(id)
      .then(function (res) {
        setTask(res.data.task);
        setHasSignedUp(res.data.hasSignedUp);
      })
      .catch(function () { setTask(null); })
      .finally(function () { setLoading(false); });
  }, [id]);

  const handleSignup = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/volunteer/' + id + '/signup');
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size={40} />
        </div>
      </PageWrapper>
    );
  }

  if (!task) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-black text-ink mb-2">Opportunity not found</h1>
          <Link to="/volunteer" className="font-bold text-primary hover:underline">
            Browse all opportunities
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const ngo = task.ngo || {};
  const cover = task.coverImage || {};
  const location = task.location || {};
  const requirements = task.requirements || [];
  const spotsLeft = task.spotsLeft;
  const isOpen = task.status === 'open' && spotsLeft > 0 && !task.isPast;
  const fillPercent = Math.round((task.volunteersJoined / task.volunteersNeeded) * 100);
  const barWidth = { width: fillPercent + '%' };

  const timeRange = task.endTime ? task.startTime + ' – ' + task.endTime : task.startTime;
  const dateRange = task.endDate
    ? formatTaskDate(task.startDate) + ' – ' + formatTaskDate(task.endDate)
    : formatTaskDate(task.startDate);

  const perks = [];
  if (task.providesFood) perks.push({ label: 'Meals provided', Icon: Utensils });
  if (task.providesTransport) perks.push({ label: 'Transport provided', Icon: Car });

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/volunteer" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to opportunities
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[16/9] relative">
              {cover.url ? (
                <img src={cover.url} alt={task.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
              {task.urgent && isOpen && (
                <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-danger text-white px-4 py-1.5 rounded-full text-sm font-bold">
                  <AlertTriangle size={14} /> Urgent
                </span>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-dark text-sm font-bold mb-3">
                {categoryLabel(task.category)}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-ink leading-tight mb-4">
                {task.title}
              </h1>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {task.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-ink mb-4">Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                  <Calendar size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                    <p className="text-sm font-bold text-ink">{dateRange}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                  <Clock size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Time</p>
                    <p className="text-sm font-bold text-ink">{timeRange}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 sm:col-span-2">
                  <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                    <p className="text-sm font-bold text-ink">{location.address}</p>
                    <p className="text-xs text-gray-500">{location.district}, Nepal</p>
                  </div>
                </div>
              </div>

              {perks.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {perks.map(function (p) {
                    const Icon = p.Icon;
                    return (
                      <span key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-dark text-sm font-bold">
                        <Icon size={15} /> {p.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {requirements.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-ink mb-4">What we need from you</h2>
                <div className="space-y-3">
                  {requirements.map(function (r) {
                    return (
                      <div key={r} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-primary" />
                        </span>
                        <p className="text-sm text-gray-600">{r}</p>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-primary" />
                    </span>
                    <p className="text-sm text-gray-600">Minimum age {task.minAge}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="lg:sticky lg:top-[88px] space-y-6">

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-3xl font-black text-ink">{task.volunteersJoined}</p>
                  <p className="text-sm text-gray-400">of {task.volunteersNeeded}</p>
                </div>
                <p className="text-sm text-gray-500 mb-4">volunteers signed up</p>

                <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-4">
                  <div className="h-full rounded-full bg-primary transition-all" style={barWidth} />
                </div>

                {isOpen && (
                  <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-primary-50">
                    <Users size={16} className="text-primary shrink-0" />
                    <p className="text-sm font-bold text-primary-dark">
                      {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining
                    </p>
                  </div>
                )}

                {hasSignedUp ? (
                  <div className="text-center py-2">
                    <CheckCircle2 size={32} className="text-primary mx-auto mb-3" />
                    <p className="font-bold text-ink mb-1">You're signed up</p>
                    <p className="text-sm text-gray-500 mb-4">
                      See you on {formatTaskDate(task.startDate)}.
                    </p>
                    <Link to="/dashboard/volunteer">
                      <Button variant="outline" size="sm" className="w-full">
                        View my tasks
                      </Button>
                    </Link>
                  </div>
                ) : task.isPast ? (
                  <div className="text-center py-2">
                    <p className="font-bold text-ink mb-1">This opportunity has passed</p>
                    <p className="text-sm text-gray-500 mb-4">Check for upcoming work.</p>
                    <Link to="/volunteer">
                      <Button variant="outline" size="sm" className="w-full">
                        Browse opportunities
                      </Button>
                    </Link>
                  </div>
                ) : !isOpen ? (
                  <div className="text-center py-2">
                    <CheckCircle2 size={32} className="text-primary mx-auto mb-3" />
                    <p className="font-bold text-ink mb-1">All spots filled</p>
                    <p className="text-sm text-gray-500 mb-4">
                      This opportunity is fully staffed.
                    </p>
                    <Link to="/volunteer">
                      <Button variant="outline" size="sm" className="w-full">
                        Find another opportunity
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    iconRight={ArrowRight}
                    onClick={handleSignup}
                  >
                    Sign Up to Volunteer
                  </Button>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Organised by</p>
                <Link to={'/donate/ngo/' + ngo._id} className="flex items-start gap-3 mb-4 group">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-ink text-sm truncate group-hover:text-primary">{ngo.name}</p>
                      <CheckCircle2 size={14} className="text-primary shrink-0" />
                    </div>
                    <p className="text-xs text-gray-500">{ngo.district}</p>
                  </div>
                </Link>

                {ngo.phone && (
                  <a
                    href={'tel:' + ngo.phone}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    <Phone size={15} /> Contact NGO
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}