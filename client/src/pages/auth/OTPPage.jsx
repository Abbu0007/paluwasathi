import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import api from '../../services/api';

export default function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { userId, phone, devOtp } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!userId) {
      navigate('/signup');
      return;
    }
    if (devOtp) {
      setOtp(devOtp.split(''));
    }
    inputsRef.current[0]?.focus();
  }, [userId, devOtp, navigate]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = pasted.split('');
    while (next.length < 6) next.push('');
    setOtp(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    setError('');
    if (otp.some((d) => d === '')) return;

    setLoading(true);
    try {
      await api.post('/auth/verify-otp', {
        userId,
        otp: otp.join(''),
      });
      navigate('/login', {
        state: { verified: true },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
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
          <h1 className="text-2xl font-black text-ink">Verify your phone</h1>
          <p className="text-gray-500 text-sm mt-1">
            We sent a 6-digit code to {phone || 'your number'}.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>
          )}

          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-2xl font-black rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink"
              />
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mb-6">
            {seconds > 0 ? (
              <>Code expires in <span className="font-bold text-ink">{format(seconds)}</span></>
            ) : (
              <span className="text-danger font-bold">Code expired</span>
            )}
          </p>

          <Button variant="primary" size="lg" iconRight={ArrowRight}
            className="w-full mb-4" loading={loading} onClick={handleVerify}>
            Verify and Continue
          </Button>

          <button
            disabled={seconds > 240}
            onClick={() => setSeconds(300)}
            className="w-full text-sm font-bold text-primary disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            {seconds > 240 ? `Resend code in ${format(seconds - 240)}` : 'Resend code'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="font-bold text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}