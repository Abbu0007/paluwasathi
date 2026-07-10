import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { authService } from '../../services/auth.service';

const strengthOf = (pw) => {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pw)) score += 1;
  return score;
};

const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['bg-danger', 'bg-danger', 'bg-accent', 'bg-primary-light', 'bg-primary'];

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    authService.verifyResetToken(token)
      .then(function (res) {
        setValid(true);
        setEmail(res.data.email);
      })
      .catch(function () { setValid(false); })
      .finally(function () { setChecking(false); });
  }, [token]);

  const handleSubmit = async () => {
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      setTimeout(function () { navigate('/login'); }, 2500);
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Failed to reset password.');
      setSubmitting(false);
    }
  };

  const score = strengthOf(password);
  const isValid = password.length >= 8 && confirm.length >= 8;

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-danger" />
            </div>
            <h1 className="text-2xl font-black text-ink mb-2">Link expired</h1>
            <p className="text-gray-500 text-sm mb-6">
              This reset link is invalid or has already been used.
              Reset links expire after 15 minutes.
            </p>
            <Link to="/forgot-password">
              <Button variant="primary" className="w-full mb-3">Request a new link</Button>
            </Link>
            <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-700">
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black text-ink mb-2">Password reset</h1>
            <p className="text-gray-500 text-sm mb-6">
              You can now log in with your new password. Redirecting you.
            </p>
            <Link to="/login">
              <Button variant="primary" className="w-full">Go to log in</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const barWidth = { width: (score / 5) * 100 + '%' };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <div className="text-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black text-ink mb-2">Choose a new password</h1>
            <p className="text-gray-500 text-sm">
              Resetting the password for <span className="font-bold text-ink">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-5">{error}</div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">New password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={function (e) { setPassword(e.target.value); }}
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink"
                />
                <button
                  onClick={function () { setShowPw(!showPw); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {password && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={'h-full rounded-full transition-all ' + STRENGTH_COLORS[Math.max(score - 1, 0)]}
                      style={barWidth}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {password.length < 8
                      ? 'At least 8 characters'
                      : STRENGTH_LABELS[Math.max(score - 1, 0)]}
                  </p>
                </div>
              )}
            </div>

            <div>
              <Input
                label="Confirm new password"
                type="password"
                value={confirm}
                onChange={function (e) { setConfirm(e.target.value); }}
                onKeyDown={function (e) { if (e.key === 'Enter' && isValid) handleSubmit(); }}
              />
              {confirm && password !== confirm && (
                <p className="text-xs text-danger mt-1">Passwords do not match</p>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={Lock}
              loading={submitting}
              disabled={!isValid}
              onClick={handleSubmit}
            >
              Reset Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}