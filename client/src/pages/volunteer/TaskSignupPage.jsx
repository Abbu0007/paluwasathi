import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatTaskDate } from '../../constants/task-options';
import { useAuth } from '../../context/AuthContext';
import { taskService, signupService } from '../../services/task.service';

export default function TaskSignupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    notes: '',
    hasTransport: false,
    agreed: false,
  });

  useEffect(() => {
    taskService.getById(id)
      .then(function (res) {
        const t = res.data.task;
        if (res.data.hasSignedUp || t.status !== 'open' || t.isPast) {
          navigate('/volunteer/' + id);
          return;
        }
        setTask(t);
      })
      .catch(function () { navigate('/volunteer'); })
      .finally(function () { setLoading(false); });
  }, [id, navigate]);

  useEffect(() => {
    if (user) {
      setForm(function (prev) {
        return Object.assign({}, prev, {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        });
      });
    }
  }, [user]);

  const update = (field, value) => {
    setForm(function (prev) {
      return Object.assign({}, prev, { [field]: value });
    });
  };

  const isValid = form.name && form.email && form.phone && form.agreed;

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const res = await signupService.create({
        taskId: id,
        volunteerInfo: { name: form.name, email: form.email, phone: form.phone },
        experience: form.experience,
        notes: form.notes,
        hasTransport: form.hasTransport,
      });

      navigate('/volunteer/confirmation/' + res.data.signup._id, { state: { justSignedUp: true } });
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Failed to sign up. Please try again.');
      setSubmitting(false);
    }
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

  const ngo = (task && task.ngo) || {};
  const location = (task && task.location) || {};
  const cover = (task && task.coverImage) || {};
  const timeRange = task.endTime ? task.startTime + ' – ' + task.endTime : task.startTime;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to={'/volunteer/' + id} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to opportunity
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-start gap-4">
            {cover.url && (
              <img src={cover.url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-400 uppercase">Signing up for</p>
              <p className="font-black text-ink">{task.title}</p>
              <p className="text-sm text-gray-500 mb-2">{ngo.name}</p>

              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {formatTaskDate(task.startDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {timeRange}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {location.district}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
            <Users size={14} className="text-primary" />
            <p className="text-sm text-gray-600">
              <span className="font-bold text-ink">{task.spotsLeft}</span> of {task.volunteersNeeded} spots remaining
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-5">
          <div>
            <h1 className="text-xl font-black text-ink mb-1">Your details</h1>
            <p className="text-gray-500 text-sm">
              {ngo.name} will use this to contact you before the event.
            </p>
          </div>

          <Input label="Full name" value={form.name}
            onChange={function (e) { update('name', e.target.value); }} />

          <Input label="Email" type="email" value={form.email}
            onChange={function (e) { update('email', e.target.value); }} />

          <Input label="Phone" value={form.phone}
            onChange={function (e) { update('phone', e.target.value); }} />

          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              Relevant experience (optional)
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={form.experience}
              onChange={function (e) { update('experience', e.target.value); }}
              placeholder="Have you volunteered with animals before? Any relevant skills?"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{form.experience.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              Anything the organiser should know? (optional)
            </label>
            <textarea
              rows={2}
              maxLength={300}
              value={form.notes}
              onChange={function (e) { update('notes', e.target.value); }}
              placeholder="Allergies, mobility needs, arrival time constraints"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer p-4 rounded-xl bg-gray-50">
            <input
              type="checkbox"
              checked={form.hasTransport}
              onChange={function (e) { update('hasTransport', e.target.checked); }}
              className="w-4 h-4 accent-[#40916C]"
            />
            <span className="text-sm text-gray-600">
              I have my own transport and can help carry supplies
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer p-4 rounded-xl bg-primary-50">
            <input
              type="checkbox"
              checked={form.agreed}
              onChange={function (e) { update('agreed', e.target.checked); }}
              className="mt-0.5 w-4 h-4 accent-[#40916C]"
            />
            <span className="text-sm text-primary-dark">
              I confirm I am at least {task.minAge} years old and I commit to attending.
              If my plans change, I will cancel so the spot opens for someone else.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 mt-6">
          <Link to={'/volunteer/' + id} className="text-sm font-bold text-gray-400 hover:text-gray-600">
            Cancel
          </Link>
          <Button variant="primary" size="lg" loading={submitting} disabled={!isValid} onClick={handleSubmit}>
            Confirm Signup
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}