import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [remember, setRemember] = useState(false);

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = () => {
    const err = {};
    if (!form.emailOrPhone) err.emailOrPhone = 'Enter your email or phone';
    if (!form.password) err.password = 'Enter your password';
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="PaluwaSathi" className="h-10 w-auto" />
            <span className="text-2xl font-black text-ink">PaluwaSathi</span>
          </Link>
          <h1 className="text-2xl font-black text-ink">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Log in to continue your work.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
          <Input label="Email or Phone" placeholder="you@example.com"
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
            className="w-full" onClick={handleSubmit}>
            Log In
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or</span>
            </div>
          </div>

          <Link to="/rescue/report">
            <Button variant="outline" size="lg" className="w-full">
              Report as Guest
            </Button>
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-primary hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}