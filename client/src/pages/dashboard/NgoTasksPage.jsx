import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, X, Upload, Users, Calendar, Clock, MapPin,
  ChevronDown, ChevronUp, Check, Phone, Mail,
} from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { TASK_CATEGORIES, COMMON_REQUIREMENTS, formatTaskDate, categoryLabel } from '../../constants/task-options';
import { NEPAL_DISTRICTS } from '../../constants/nepal-districts';
import { taskService,signupService } from '../../services/task.service';

const statusVariant = {
  open: 'stable',
  full: 'high',
  completed: 'verified',
  cancelled: 'neutral',
};

function TaskRoster({ taskId, onClose }) {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [hours, setHours] = useState({});

  const loadData = async () => {
    try {
      const res = await taskService.getSignups(taskId);
      setSignups(res.data.signups);
    } catch {
      setSignups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [taskId]);

  const handleAttendance = async (signupId, status) => {
    setBusy(signupId);
    try {
      await signupService.markAttendance(signupId, status, hours[signupId] || 0);
      await loadData();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      alert(msg || 'Failed to record attendance.');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="py-8"><Spinner /></div>;

  if (signups.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-500">No volunteers have signed up yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {signups.map(function (s) {
        const v = s.volunteer || {};
        const info = s.volunteerInfo || {};
        const isPending = s.status === 'confirmed';

        return (
          <div key={s._id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-bold text-ink text-sm">{info.name || v.name}</p>
                <p className="text-xs text-gray-400">{s.confirmationNumber}</p>
              </div>
              <Badge variant={s.status === 'attended' ? 'stable' : s.status === 'no_show' ? 'critical' : 'new'}>
                {s.status.replace('_', ' ')}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
              <a href={'tel:' + info.phone} className="flex items-center gap-1 hover:text-primary">
                <Phone size={11} /> {info.phone}
              </a>
              <a href={'mailto:' + info.email} className="flex items-center gap-1 hover:text-primary">
                <Mail size={11} /> {info.email}
              </a>
              {s.hasTransport && (
                <span className="text-primary font-bold">Has transport</span>
              )}
            </div>

            {s.experience && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-400 mb-0.5">Experience</p>
                <p className="text-xs text-ink">{s.experience}</p>
              </div>
            )}

            {s.notes && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-400 mb-0.5">Notes</p>
                <p className="text-xs text-ink">{s.notes}</p>
              </div>
            )}

            {s.status === 'attended' && s.hoursLogged > 0 && (
              <p className="text-xs font-bold text-primary mb-3">
                {s.hoursLogged} hours logged
              </p>
            )}

            {isPending && (
              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <input
                  type="number"
                  min="0"
                  max="24"
                  placeholder="Hours"
                  value={hours[s._id] || ''}
                  onChange={function (e) {
                    setHours(Object.assign({}, hours, { [s._id]: e.target.value }));
                  }}
                  className="w-20 px-3 py-2 rounded-lg border-2 border-gray-200 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={function () { handleAttendance(s._id, 'attended'); }}
                  disabled={busy === s._id}
                  className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-bold disabled:opacity-50"
                >
                  Mark Attended
                </button>
                <button
                  onClick={function () { handleAttendance(s._id, 'no_show'); }}
                  disabled={busy === s._id}
                  className="flex-1 py-2 rounded-lg border-2 border-gray-200 text-gray-600 text-xs font-bold disabled:opacity-50"
                >
                  No Show
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NgoTasksPage() {
  const inputRef = useRef();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ openTasks: 0, completedTasks: 0, totalSignups: 0, hoursContributed: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cover, setCover] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    address: '',
    district: '',
    startDate: '',
    startTime: '',
    endTime: '',
    volunteersNeeded: '',
    requirements: [],
    providesFood: false,
    providesTransport: false,
    minAge: 16,
    urgent: false,
  });

  const loadData = async () => {
    try {
      const [mine, s] = await Promise.all([
        taskService.getMine(),
        taskService.getNgoStats(),
      ]);
      setTasks(mine.data.tasks);
      setStats(s.data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const update = (field, value) => {
    setForm(function (prev) {
      return Object.assign({}, prev, { [field]: value });
    });
  };

  const toggleRequirement = (r) => {
    setForm(function (prev) {
      const next = prev.requirements.includes(r)
        ? prev.requirements.filter(function (x) { return x !== r; })
        : prev.requirements.concat([r]);
      return Object.assign({}, prev, { requirements: next });
    });
  };

  const isValid = form.title && form.category && form.description && form.address &&
    form.district && form.startDate && form.startTime && Number(form.volunteersNeeded) >= 1 && cover;

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('description', form.description);
      fd.append('address', form.address);
      fd.append('district', form.district);
      fd.append('startDate', form.startDate);
      fd.append('startTime', form.startTime);
      if (form.endTime) fd.append('endTime', form.endTime);
      fd.append('volunteersNeeded', form.volunteersNeeded);
      fd.append('requirements', JSON.stringify(form.requirements));
      fd.append('providesFood', form.providesFood);
      fd.append('providesTransport', form.providesTransport);
      fd.append('minAge', form.minAge);
      fd.append('urgent', form.urgent);
      fd.append('photos', cover);

      await taskService.create(fd);

      setShowForm(false);
      setForm({
        title: '', category: '', description: '', address: '', district: '',
        startDate: '', startTime: '', endTime: '', volunteersNeeded: '',
        requirements: [], providesFood: false, providesTransport: false, minAge: 16, urgent: false,
      });
      setCover(null);
      setLoading(true);
      await loadData();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const statCards = [
    { label: 'Open Tasks', value: stats.openTasks, Icon: Calendar },
    { label: 'Completed', value: stats.completedTasks, Icon: Check },
    { label: 'Total Signups', value: stats.totalSignups, Icon: Users },
    { label: 'Hours Contributed', value: stats.hoursContributed, Icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-ink">Volunteer Opportunities</h1>
            <p className="text-gray-500 text-sm">
              Post opportunities and manage the volunteers who sign up.
            </p>
          </div>
          <Button
            variant="primary"
            icon={showForm ? X : Plus}
            className="shrink-0"
            onClick={function () { setShowForm(!showForm); }}
          >
            {showForm ? 'Cancel' : 'New Opportunity'}
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
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

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-5">
            <h2 className="font-bold text-ink">Create an Opportunity</h2>

            {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{error}</div>}

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Cover image</label>
              <div
                onClick={function () { inputRef.current.click(); }}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {cover ? (
                  <img src={URL.createObjectURL(cover)} alt="" className="w-full h-40 object-cover rounded-xl" />
                ) : (
                  <div>
                    <Upload size={22} className="text-primary mx-auto mb-2" />
                    <p className="font-bold text-ink text-sm">Upload a cover image</p>
                  </div>
                )}
                <input ref={inputRef} type="file" accept="image/*"
                  onChange={function (e) { setCover(e.target.files[0]); }} className="hidden" />
              </div>
            </div>

            <Input label="Title" value={form.title}
              onChange={function (e) { update('title', e.target.value); }}
              placeholder="e.g. Weekend Street Dog Feeding Drive" />

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Type of work</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TASK_CATEGORIES.map(function (c) {
                  const active = form.category === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={function () { update('category', c.value); }}
                      className={active
                        ? 'py-2.5 rounded-xl text-xs font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                        : 'py-2.5 rounded-xl text-xs font-bold border-2 border-gray-200 text-gray-600'}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Description</label>
              <textarea
                rows={5}
                maxLength={2000}
                value={form.description}
                onChange={function (e) { update('description', e.target.value); }}
                placeholder="What will volunteers do? What should they expect? Be honest about difficulty."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000</p>
            </div>

            <Input label="Meeting address" value={form.address}
              onChange={function (e) { update('address', e.target.value); }}
              placeholder="e.g. Animal Nepal, Chobhar" />

            <div>
              <label className="block text-sm font-bold text-ink mb-2">District</label>
              <select
                value={form.district}
                onChange={function (e) { update('district', e.target.value); }}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary bg-white text-ink outline-none"
              >
                <option value="">Select district</option>
                {NEPAL_DISTRICTS.map(function (d) {
                  return <option key={d} value={d}>{d}</option>;
                })}
              </select>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Date</label>
                <input type="date" value={form.startDate}
                  onChange={function (e) { update('startDate', e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Start time</label>
                <input type="time" value={form.startTime}
                  onChange={function (e) { update('startTime', e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">End time</label>
                <input type="time" value={form.endTime}
                  onChange={function (e) { update('endTime', e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Volunteers needed" type="number" min="1" value={form.volunteersNeeded}
                onChange={function (e) { update('volunteersNeeded', e.target.value); }} />
              <Input label="Minimum age" type="number" min="12" max="99" value={form.minAge}
                onChange={function (e) { update('minAge', e.target.value); }} />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Requirements</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_REQUIREMENTS.map(function (r) {
                  const active = form.requirements.includes(r);
                  return (
                    <button
                      key={r}
                      onClick={function () { toggleRequirement(r); }}
                      className={active
                        ? 'px-3.5 py-1.5 rounded-full text-xs font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                        : 'px-3.5 py-1.5 rounded-full text-xs font-bold border-2 border-gray-200 text-gray-600'}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.providesFood}
                  onChange={function (e) { update('providesFood', e.target.checked); }}
                  className="w-4 h-4 accent-[#40916C]" />
                <span className="text-sm text-gray-600">We provide meals</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.providesTransport}
                  onChange={function (e) { update('providesTransport', e.target.checked); }}
                  className="w-4 h-4 accent-[#40916C]" />
                <span className="text-sm text-gray-600">We provide transport</span>
              </label>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer p-4 rounded-xl bg-red-50">
              <input type="checkbox" checked={form.urgent}
                onChange={function (e) { update('urgent', e.target.checked); }}
                className="mt-0.5 w-4 h-4 accent-[#C0392B]" />
              <span className="text-sm text-red-800">
                Mark as urgent. Use only for time-critical needs.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={function () { setShowForm(false); }}
                className="text-sm font-bold text-gray-400 hover:text-gray-600">
                Cancel
              </button>
              <Button variant="primary" loading={submitting} disabled={!isValid} onClick={handleSubmit}>
                Publish Opportunity
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20"><Spinner size={40} /></div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">No opportunities posted yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Post an opportunity to recruit volunteers.
            </p>
            <Button variant="outline" size="sm" icon={Plus} onClick={function () { setShowForm(true); }}>
              Create Your First Opportunity
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(function (t) {
              const cover2 = t.coverImage || {};
              const loc = t.location || {};
              const isExpanded = expandedTask === t._id;
              const fillPercent = Math.round((t.volunteersJoined / t.volunteersNeeded) * 100);
              const barWidth = { width: fillPercent + '%' };

              return (
                <div key={t._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      {cover2.url ? (
                        <img src={cover2.url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-primary-50 text-primary-dark text-xs font-bold mb-1">
                              {categoryLabel(t.category)}
                            </span>
                            <p className="font-black text-ink truncate">{t.title}</p>
                          </div>
                          <Badge variant={statusVariant[t.status]}>{t.status}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {formatTaskDate(t.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {t.startTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {loc.district}
                          </span>
                        </div>

                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-1.5">
                          <div className="h-full rounded-full bg-primary" style={barWidth} />
                        </div>
                        <p className="text-xs text-gray-400">
                          {t.volunteersJoined}/{t.volunteersNeeded} volunteers signed up
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={function () { setExpandedTask(isExpanded ? null : t._id); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-bold text-primary hover:bg-primary-50 transition-colors"
                      >
                        {isExpanded ? 'Hide volunteers' : 'View volunteers (' + t.volunteersJoined + ')'}
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      <Link to={'/volunteer/' + t._id} className="flex-1">
                        <button className="w-full py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50">
                          View Public Page
                        </button>
                      </Link>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
                      <TaskRoster taskId={t._id} />
                    </div>
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