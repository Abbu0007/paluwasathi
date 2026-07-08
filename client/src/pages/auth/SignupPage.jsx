import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { NEPAL_DISTRICTS } from '../../constants/nepal-districts';
import api from '../../services/api';

const ROLES = [
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'ngo', label: 'NGO' },
  { value: 'petOwner', label: 'Pet Owner' },
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
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        district: form.district,
        password: form.password,
        role: form.role,
      });
      // DEV: pass devOtp through so OTP page can auto-fill
      navigate('/verify-otp', {
        state: { userId: data.userId, phone: form.phone, devOtp: data.devOtp },
      });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="PaluwaSathi" className="h-10 w-auto" />
            <span className="text-2xl font-black text-ink">PaluwaSathi</span>
          </Link>
          <h1 className="text-2xl font-black text-ink">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Nepal's animal rescue community.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
          {serverError && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{serverError}</div>
          )}

          <Input label="Full Name" placeholder="Ramesh Sharma"
            value={form.name} onChange={update('name')} error={errors.name} />

          <Input label="Phone Number" placeholder="98XXXXXXXX"
            value={form.phone} onChange={update('phone')} error={errors.phone} />

          <Input label="Email" type="email" placeholder="you@example.com"
            value={form.email} onChange={update('email')} error={errors.email} />

          <div className="w-full">
            <label className="block text-sm font-bold text-ink mb-2">District</label>
            <select
              value={form.district}
              onChange={update('district')}
              className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-ink outline-none transition-all ${
                errors.district ? 'border-danger' : 'border-gray-200 focus:border-primary'
              }`}
            >
              <option value="">Select district</option>
              {NEPAL_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.district && <p className="text-danger text-sm mt-1.5">{errors.district}</p>}
          </div>

          <Input label="Password" type="password" placeholder="Min 8 characters"
            value={form.password} onChange={update('password')} error={errors.password} />

          <Input label="Confirm Password" type="password" placeholder="Re-enter password"
            value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} />

          <div className="w-full">
            <label className="block text-sm font-bold text-ink mb-2">I am a</label>
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
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}