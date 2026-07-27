import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Heart, Radio, Gift } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { NEPAL_DISTRICTS } from '../../constants/nepal-districts';
import { authService } from '../../services/auth.service';

const ROLES = [
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'ngo', label: 'NGO / Shelter' },
  { value: 'petOwner', label: 'Pet Owner' },
];

const BENEFITS = [
  { Icon: Zap, text: 'Report rescues in 60 seconds' },
  { Icon: ShieldCheck, text: 'Connect with verified NGOs' },
  { Icon: Heart, text: 'Adopt animals safely' },
  { Icon: Radio, text: 'Track every rescue live' },
  { Icon: Gift, text: '100% free to use' },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', district: '',
    password: '', confirmPassword: '', role: 'volunteer',
  });
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const err = {};
    if (form.name.trim().length < 2) err.name = 'Enter your full name';
    if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Enter a valid email';
    if (!/^9[78]\d{8}$/.test(form.phone)) err.phone = 'Enter a valid Nepal number';
    if (!form.district) err.district = 'Select your district';
    if (form.password.length < 8) err.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) err.confirmPassword = 'Passwords do not match';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    setServerError('');
    if (!agreed) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authService.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        district: form.district,
        password: form.password,
        role: form.role,
      });

      navigate('/verify-otp', {
        state: { userId: res.data.userId, email: res.data.email },
      });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-surface">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="auth-blob-1 absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/15 blur-3xl" />
        <div className="auth-blob-2 absolute -bottom-40 -right-24 w-[520px] h-[520px] rounded-full bg-accent/15 blur-3xl" />
        <div className="auth-blob-1 absolute top-1/3 right-1/4 w-[360px] h-[360px] rounded-full bg-primary-light/10 blur-3xl" />
      </div>

      <div className="auth-card relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[600px] my-6">

        <div className="hidden lg:flex lg:w-[45%] bg-ink flex-col justify-between p-10 xl:p-12">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="PaluwaSathi" className="h-9 w-auto" />
            <span className="text-xl font-black text-white">PaluwaSathi</span>
          </Link>

          <div className="py-6">
            <h1 className="text-4xl font-black text-white leading-tight mb-3">
              Every second<br />
              counts for an<br />
              <span className="text-primary-light">animal in need.</span>
            </h1>
            <p className="text-white/60 mb-7">Join a community making a difference in Nepal.</p>

            <img
              src="/signup.png"
              alt=""
              className="w-full max-w-xs rounded-2xl object-cover"
            />
          </div>

          <ul className="space-y-2.5">
            {BENEFITS.map(function (b, i) {
              const Icon = b.Icon;
              return (
                <li
                  key={b.text}
                  className="auth-item flex items-center gap-3"
                  style={{ animationDelay: (0.3 + i * 0.08) + 's' }}
                >
                  <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-primary-light" />
                  </span>
                  <span className="text-sm text-white/80">{b.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
          <div className="w-full max-w-sm py-2">
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2">
                <img src="/logo.png" alt="PaluwaSathi" className="h-10 w-auto" />
                <span className="text-2xl font-black text-ink">PaluwaSathi</span>
              </Link>
            </div>

            <h2 className="text-3xl font-black text-ink mb-1">Create your account</h2>
            <p className="text-gray-500 text-sm mb-8">Join free. Takes less than 2 minutes.</p>

            <div className="space-y-4">
              {serverError && (
                <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{serverError}</div>
              )}

              <Input label="Full Name" placeholder="Ramesh Sharma"
                value={form.name} onChange={update('name')} error={errors.name} />

              <Input label="Phone Number" placeholder="+977 98XXXXXXXX"
                value={form.phone} onChange={update('phone')} error={errors.phone} />

              <Input label="Email Address" type="email" placeholder="you@example.com"
                value={form.email} onChange={update('email')} error={errors.email} />

              <div className="w-full">
                <label className="block text-sm font-bold text-ink mb-2">Your District</label>
                <select
                  value={form.district}
                  onChange={update('district')}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-ink outline-none transition-all ${
                    errors.district ? 'border-danger' : 'border-gray-200 focus:border-primary'
                  }`}
                >
                  <option value="">Select district...</option>
                  {NEPAL_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.district && <p className="text-danger text-sm mt-1.5">{errors.district}</p>}
              </div>

              <Input label="Password" type="password" placeholder="Min. 8 characters"
                value={form.password} onChange={update('password')} error={errors.password} />

              <Input label="Confirm Password" type="password" placeholder="Re-enter password"
                value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} />

              <div className="w-full">
                <label className="block text-sm font-bold text-ink mb-2">I want to join as</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: r.value })}
                      className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                        form.role === r.value
                          ? 'border-primary bg-primary-50 text-primary-dark'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 accent-[#40916C]" />
                <span className="text-sm text-gray-500">
                  I agree to the Terms of Service and Privacy Policy.
                </span>
              </label>

              <Button variant="primary" size="lg" iconRight={ArrowRight}
                className="w-full" disabled={!agreed} loading={loading} onClick={handleSubmit}>
                Create Free Account
              </Button>

              <p className="text-center text-sm text-gray-500 pt-2">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary hover:underline">
                  Log in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}