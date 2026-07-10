import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function OTPPage() {
  const navigate = useNavigate();
  const routeState = useLocation().state;
  const { login } = useAuth();

  const userId = routeState && routeState.userId;
  const email = routeState && routeState.email;

  const [digits, setDigits] = useState(new Array(OTP_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const inputsRef = useRef([]);

  useEffect(() => {
    if (!userId) navigate('/signup');
  }, [userId, navigate]);

  useEffect(() => {
    if (inputsRef.current[0]) inputsRef.current[0].focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(function () { setCooldown(cooldown - 1); }, 1000);
    return function () { clearTimeout(timer); };
  }, [cooldown]);

  const code = digits.join('');

  const handleChange = (index, value) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      const next = digits.slice();
      next[index] = '';
      setDigits(next);
      return;
    }

    const next = digits.slice();
    next[index] = clean[clean.length - 1];
    setDigits(next);
    setError('');

    if (index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1].focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = new Array(OTP_LENGTH).fill('');
    pasted.split('').forEach(function (d, i) { next[i] = d; });
    setDigits(next);

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[focusIndex].focus();
  };

  const handleVerify = async () => {
    setError('');
    setNotice('');
    setVerifying(true);

    try {
      const res = await authService.verifyOtp(userId, code);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Verification failed.');
      setDigits(new Array(OTP_LENGTH).fill(''));
      inputsRef.current[0].focus();
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    setResending(true);

    try {
      const res = await authService.resendOtp(userId);
      setNotice(res.data.message);
      setCooldown(RESEND_COOLDOWN);
      setDigits(new Array(OTP_LENGTH).fill(''));
      inputsRef.current[0].focus();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    if (code.length === OTP_LENGTH && !verifying) {
      handleVerify();
    }
  }, [code]);

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, function (_, a, b, c) {
        return a + '*'.repeat(Math.max(b.length, 3)) + c;
      })
    : '';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/signup" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to sign up
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black text-ink mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm">
              We sent a 6-digit code to
            </p>
            <p className="font-bold text-ink text-sm mt-0.5">{maskedEmail}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-5 text-center">
              {error}
            </div>
          )}

          {notice && (
            <div className="flex items-center justify-center gap-2 bg-primary-50 text-primary-dark text-sm rounded-xl p-3 mb-5">
              <CheckCircle2 size={16} /> {notice}
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {digits.map(function (d, i) {
              return (
                <input
                  key={i}
                  ref={function (el) { inputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  disabled={verifying}
                  onChange={function (e) { handleChange(i, e.target.value); }}
                  onKeyDown={function (e) { handleKeyDown(i, e); }}
                  className="w-12 h-14 text-center text-2xl font-black rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink disabled:opacity-50 transition-colors"
                />
              );
            })}
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full mb-5"
            loading={verifying}
            disabled={code.length !== OTP_LENGTH}
            onClick={handleVerify}
          >
            Verify Account
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Did not get the code?</p>
            {cooldown > 0 ? (
              <p className="text-sm text-gray-400">
                Resend available in {cooldown}s
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline disabled:opacity-50"
              >
                <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400 text-center mt-6 pt-6 border-t border-gray-50">
            Check your spam folder if it has not arrived within a minute.
          </p>
        </div>
      </div>
    </div>
  );
}