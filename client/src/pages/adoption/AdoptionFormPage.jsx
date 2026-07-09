import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { HOME_TYPES, ACTIVITY_LEVELS } from '../../constants/pet-options';
import { NEPAL_DISTRICTS } from '../../constants/nepal-districts';
import { useAuth } from '../../context/AuthContext';
import { petService, adoptionService } from '../../services/pet.service';

const STEPS = ['Personal', 'Home', 'Lifestyle'];
const DRAFT_KEY = 'adoptionDraft';

export default function AdoptionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    personal: {
      fullName: '', email: '', phone: '', address: '', district: '',
    },
    home: {
      homeType: '', hasYard: false, ownOrRent: '',
      householdSize: '', hasChildren: false, currentPets: '',
    },
    lifestyle: {
      hoursAlone: '', activityLevel: '', experience: '',
      reason: '', commitment: false,
    },
  });

  useEffect(() => {
    petService.getById(id)
      .then(({ data }) => {
        if (data.pet.status !== 'available') {
          navigate(`/adopt/${id}`);
          return;
        }
        setPet(data.pet);
      })
      .catch(() => navigate('/adopt'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    const saved = sessionStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        setForm(JSON.parse(saved));
        return;
      } catch {
        sessionStorage.removeItem(DRAFT_KEY);
      }
    }
    if (user) {
      setForm((f) => ({
        ...f,
        personal: {
          ...f.personal,
          fullName: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          district: user.district || '',
        },
      }));
    }
  }, [user]);

  const update = (section, field, value) => {
    setForm((prev) => {
      const next = { ...prev, [section]: { ...prev[section], [field]: value } };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const canProceed = () => {
    if (step === 0) {
      const p = form.personal;
      return p.fullName && p.email && p.phone && p.address && p.district;
    }
    if (step === 1) {
      const h = form.home;
      return h.homeType && h.ownOrRent && h.householdSize;
    }
    if (step === 2) {
      const l = form.lifestyle;
      return l.hoursAlone !== '' && l.activityLevel && l.reason && l.commitment;
    }
    return false;
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const { data } = await adoptionService.create({
        petId: id,
        personal: form.personal,
        home: {
          ...form.home,
          householdSize: Number(form.home.householdSize),
        },
        lifestyle: {
          ...form.lifestyle,
          hoursAlone: Number(form.lifestyle.hoursAlone),
        },
      });
      sessionStorage.removeItem(DRAFT_KEY);
      navigate(`/adopt/application/${data.adoption._id}`, { state: { justCreated: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
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

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link to={`/adopt/${id}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to {pet?.name}
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 mb-6">
          {pet?.photos?.[0] && (
            <img src={pet.photos[0].url} alt={pet.name} className="w-16 h-16 rounded-xl object-cover" />
          )}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Applying to adopt</p>
            <p className="font-black text-ink text-lg">{pet?.name}</p>
            <p className="text-sm text-gray-500">{pet?.shelter?.name}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-gray-300'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i < step ? 'bg-primary text-white'
                  : i === step ? 'bg-primary-50 text-primary border-2 border-primary'
                  : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <Check size={16} /> : i + 1}
                </span>
                <span className="hidden sm:inline text-sm font-bold">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-ink mb-1">About you</h2>
                <p className="text-gray-500 text-sm mb-6">The shelter will use this to contact you.</p>
              </div>

              <Input label="Full Name" value={form.personal.fullName}
                onChange={(e) => update('personal', 'fullName', e.target.value)} />

              <Input label="Email" type="email" value={form.personal.email}
                onChange={(e) => update('personal', 'email', e.target.value)} />

              <Input label="Phone" value={form.personal.phone}
                onChange={(e) => update('personal', 'phone', e.target.value)} />

              <Input label="Full Address" placeholder="Street, area, ward"
                value={form.personal.address}
                onChange={(e) => update('personal', 'address', e.target.value)} />

              <div>
                <label className="block text-sm font-bold text-ink mb-2">District</label>
                <select
                  value={form.personal.district}
                  onChange={(e) => update('personal', 'district', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary bg-white text-ink outline-none"
                >
                  <option value="">Select district</option>
                  {NEPAL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-ink mb-1">Your home</h2>
                <p className="text-gray-500 text-sm mb-6">Help us picture where {pet?.name} would live.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">Home type</label>
                <div className="grid grid-cols-3 gap-2">
                  {HOME_TYPES.map((h) => (
                    <button
                      key={h.value}
                      onClick={() => update('home', 'homeType', h.value)}
                      className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                        form.home.homeType === h.value
                          ? 'border-primary bg-primary-50 text-primary-dark'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">Do you own or rent?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['own', 'rent'].map((v) => (
                    <button
                      key={v}
                      onClick={() => update('home', 'ownOrRent', v)}
                      className={`py-2.5 rounded-xl text-sm font-bold border-2 capitalize transition-all ${
                        form.home.ownOrRent === v
                          ? 'border-primary bg-primary-50 text-primary-dark'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <Input label="How many people live in your home?" type="number" min="1"
                value={form.home.householdSize}
                onChange={(e) => update('home', 'householdSize', e.target.value)} />

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.home.hasYard}
                  onChange={(e) => update('home', 'hasYard', e.target.checked)}
                  className="w-4 h-4 accent-[#40916C]" />
                <span className="text-sm text-gray-600">I have a yard or outdoor space</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.home.hasChildren}
                  onChange={(e) => update('home', 'hasChildren', e.target.checked)}
                  className="w-4 h-4 accent-[#40916C]" />
                <span className="text-sm text-gray-600">There are children in my home</span>
              </label>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">Current pets (optional)</label>
                <textarea
                  rows={3}
                  value={form.home.currentPets}
                  onChange={(e) => update('home', 'currentPets', e.target.value)}
                  placeholder="e.g. one 3-year-old female dog, vaccinated"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-ink mb-1">Your lifestyle</h2>
                <p className="text-gray-500 text-sm mb-6">This helps us match {pet?.name} to the right home.</p>
              </div>

              <Input label="Hours the pet would be alone on a typical day" type="number" min="0" max="24"
                value={form.lifestyle.hoursAlone}
                onChange={(e) => update('lifestyle', 'hoursAlone', e.target.value)} />

              <div>
                <label className="block text-sm font-bold text-ink mb-2">Your activity level</label>
                <div className="space-y-2">
                  {ACTIVITY_LEVELS.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => update('lifestyle', 'activityLevel', a.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        form.lifestyle.activityLevel === a.value
                          ? 'border-primary bg-primary-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <p className="font-bold text-ink">{a.label}</p>
                      <p className="text-sm text-gray-500">{a.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Previous pet experience (optional)
                </label>
                <textarea
                  rows={3}
                  value={form.lifestyle.experience}
                  onChange={(e) => update('lifestyle', 'experience', e.target.value)}
                  placeholder="Have you cared for animals before?"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Why do you want to adopt {pet?.name}?
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={form.lifestyle.reason}
                  onChange={(e) => update('lifestyle', 'reason', e.target.value)}
                  placeholder="Tell the shelter a little about your motivation."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{form.lifestyle.reason.length}/500</p>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer p-4 rounded-xl bg-primary-50">
                <input type="checkbox" checked={form.lifestyle.commitment}
                  onChange={(e) => update('lifestyle', 'commitment', e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#40916C]" />
                <span className="text-sm text-primary-dark">
                  I understand that adopting a pet is a long-term commitment and I am prepared
                  to care for {pet?.name} for their entire life.
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <Link to={`/adopt/${id}`} className="text-sm font-bold text-gray-400 hover:text-gray-600">
              Cancel
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <Button variant="primary" iconRight={ArrowRight}
              disabled={!canProceed()} onClick={() => setStep(step + 1)}>
              Next
            </Button>
          ) : (
            <Button variant="primary" loading={submitting}
              disabled={!canProceed()} onClick={handleSubmit}>
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}