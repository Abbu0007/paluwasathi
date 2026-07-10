import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authService } from '../../services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSending(true);

    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const isValid = email.includes('@') && email.includes('.');

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black text-ink mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm mb-6">
              If an account exists with that address, we have sent a link to
              reset your password. It expires in 15 minutes.
            </p>

            <div className="p-4 rounded-xl bg-gray-50 text-left mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Did not arrive?</p>
              <p className="text-sm text-gray-600">
                Check your spam folder. The email comes from PaluwaSathi.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={function () { setSent(false); }}
                className="text-sm font-bold text-primary hover:underline"
              >
                Try a different email
              </button>
              <Link to="/login">
                <Button variant="outline" className="w-full">Back to log in</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to log in
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <div className="text-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black text-ink mb-2">Forgot your password?</h1>
            <p className="text-gray-500 text-sm">
              Enter the email you signed up with and we will send you a reset link.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-5">{error}</div>
          )}

          <div className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={function (e) { setEmail(e.target.value); }}
              onKeyDown={function (e) { if (e.key === 'Enter' && isValid) handleSubmit(); }}
              placeholder="you@example.com"
            />

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={Send}
              loading={sending}
              disabled={!isValid}
              onClick={handleSubmit}
            >
              Send Reset Link
            </Button>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6 pt-6 border-t border-gray-50">
            Remembered it?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}