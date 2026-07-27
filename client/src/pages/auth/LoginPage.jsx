import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Heart, Radio, Gift } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';

const BENEFITS = [
  { Icon: Zap, text: 'Report rescues in 60 seconds' },
  { Icon: ShieldCheck, text: 'Connect with verified NGOs' },
  { Icon: Heart, text: 'Adopt animals safely' },
  { Icon: Radio, text: 'Track every rescue live' },
  { Icon: Gift, text: '100% free to use' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const justVerified = location.state?.verified;

  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    setServerError('');
    const err = {};
    if (!form.emailOrPhone) err.emailOrPhone = 'Enter your email or phone';
    if (!form.password) err.password = 'Enter your password';
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setLoading(true);
    try {
      const { data } = await authService.login(form.emailOrPhone, form.password);
      login(data.token, data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const res = err.response && err.response.data;
      if (res && res.needsVerification) {
        navigate('/verify-otp', { state: { userId: res.userId } });
        return;
      }
      setServerError((res && res.message) || 'Login failed. Try again.');
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

      <div className="auth-card relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[600px]">

        <div className="hidden lg:flex lg:w-[45%] bg-ink flex-col justify-between p-10 xl:p-12">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="PaluwaSathi" className="h-9 w-auto" />
            <span className="text-xl font-black text-white">PaluwaSathi</span>
          </Link>

          <div className="py-6">
            <h1 className="text-4xl font-black text-white leading-tight mb-3">
              Welcome back.<br />
              Animals <span className="text-primary-light">need you</span> today.
            </h1>
            <p className="text-white/60 mb-7">Good to have you back.</p>

            <img
              src="/login.png"
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

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2">
                <img src="/logo.png" alt="PaluwaSathi" className="h-10 w-auto" />
                <span className="text-2xl font-black text-ink">PaluwaSathi</span>
              </Link>
            </div>

            <h2 className="text-3xl font-black text-ink mb-1">Log in to your account</h2>
            <p className="text-gray-500 text-sm mb-8">Good to have you back.</p>

            <div className="space-y-4">
              {justVerified && (
                <div className="bg-primary-50 text-primary-dark text-sm rounded-xl p-3">
                  Account verified. Please log in.
                </div>
              )}

              {serverError && (
                <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{serverError}</div>
              )}

              <Input label="Email or Phone" placeholder="you@example.com or 98XXXXXXXX"
                value={form.emailOrPhone} onChange={update('emailOrPhone')} error={errors.emailOrPhone} />

              <Input label="Password" type="password" placeholder="Enter your password"
                value={form.password} onChange={update('password')} error={errors.password} />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="accent-[#40916C]" />
                  <span className="text-sm text-gray-500">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-bold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button variant="primary" size="lg" iconRight={ArrowRight}
                className="w-full" loading={loading} onClick={handleSubmit}>
                Log In
              </Button>

              <div className="p-4 rounded-xl border border-accent/30 bg-accent/5">
                <p className="text-sm font-bold text-ink">Have an emergency right now?</p>
                <p className="text-xs text-gray-500">
                  You can report a rescue without logging in.{' '}
                  <Link to="/rescue/report" className="font-bold text-accent hover:underline">
                    Report as guest
                  </Link>
                </p>
              </div>

              <p className="text-center text-sm text-gray-500 pt-2">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-primary hover:underline">
                  Create a free account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}