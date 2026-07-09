import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { PRESET_AMOUNTS, PAYMENT_METHODS, formatNPR } from '../../constants/donation-options';
import { useAuth } from '../../context/AuthContext';
import { campaignService, donationService } from '../../services/donation.service';

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState('esewa');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');

  const [donor, setDonor] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    campaignService.getById(id)
      .then(function (res) {
        if (res.data.campaign.status !== 'active') {
          navigate('/donate/campaign/' + id);
          return;
        }
        setCampaign(res.data.campaign);
      })
      .catch(function () { navigate('/donate'); })
      .finally(function () { setLoading(false); });
  }, [id, navigate]);

  useEffect(() => {
    if (user) {
      setDonor({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const finalAmount = customAmount ? Number(customAmount) : amount;
  const isValid = finalAmount >= 100 && donor.name && donor.email && donor.phone && method;

  const handlePay = async () => {
    setError('');
    setProcessing(true);

    try {
      const res = await donationService.initiate({
        campaignId: id,
        amount: finalAmount,
        donorInfo: donor,
        isAnonymous,
        message,
        paymentMethod: method,
      });

      const txnId = res.data.transactionId;
      const donationId = res.data.donation._id;

      await new Promise(function (r) { setTimeout(r, 2000); });

      await donationService.confirm(txnId, true);

      navigate('/donate/receipt/' + donationId, { state: { justPaid: true } });
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Payment failed. Please try again.');
      setProcessing(false);
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

  const ngo = (campaign && campaign.ngo) || {};
  const cover = (campaign && campaign.coverImage) || {};

  if (processing) {
    return (
      <PageWrapper>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <Loader2 size={48} className="text-primary mx-auto mb-6 animate-spin" />
            <h1 className="text-xl font-black text-ink mb-2">Processing your donation</h1>
            <p className="text-gray-500 text-sm mb-6">
              Confirming payment of {formatNPR(finalAmount)} via {method}. Please do not close this page.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Lock size={12} /> Secure sandbox transaction
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link to={'/donate/campaign/' + id} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to campaign
        </Link>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 text-sm">Sandbox mode</p>
            <p className="text-xs text-amber-800 mt-0.5">
              This is a demonstration payment gateway. No real money will be charged.
              Your donation will be recorded and a receipt generated.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-5">

            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{error}</div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-ink mb-4">Choose an amount</h2>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                {PRESET_AMOUNTS.map(function (a) {
                  const active = !customAmount && amount === a;
                  return (
                    <button
                      key={a}
                      onClick={function () { setAmount(a); setCustomAmount(''); }}
                      className={active
                        ? 'py-3 rounded-xl text-sm font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                        : 'py-3 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-600'}
                    >
                      {a.toLocaleString('en-IN')}
                    </button>
                  );
                })}
              </div>

              <label className="block text-sm font-bold text-ink mb-2">Or enter a custom amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                  NPR
                </span>
                <input
                  type="number"
                  min="100"
                  value={customAmount}
                  onChange={function (e) { setCustomAmount(e.target.value); }}
                  placeholder="Enter amount"
                  className="w-full pl-14 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum NPR 100</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-ink mb-4">Payment method</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(function (m) {
                  const active = method === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={function () { setMethod(m.value); }}
                      className={active
                        ? 'text-left p-4 rounded-xl border-2 border-primary bg-primary-50'
                        : 'text-left p-4 rounded-xl border-2 border-gray-200'}
                    >
                      <p className="font-bold text-ink text-sm">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-ink">Your details</h2>

              <Input label="Full name" value={donor.name}
                onChange={function (e) { setDonor(Object.assign({}, donor, { name: e.target.value })); }} />

              <Input label="Email" type="email" value={donor.email}
                onChange={function (e) { setDonor(Object.assign({}, donor, { email: e.target.value })); }} />

              <Input label="Phone" value={donor.phone}
                onChange={function (e) { setDonor(Object.assign({}, donor, { phone: e.target.value })); }} />

              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Message to the NGO (optional)
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={message}
                  onChange={function (e) { setMessage(e.target.value); }}
                  placeholder="Share why this cause matters to you"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{message.length}/300</p>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer p-4 rounded-xl bg-gray-50">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={function (e) { setIsAnonymous(e.target.checked); }}
                  className="mt-0.5 w-4 h-4 accent-[#40916C]"
                />
                <span className="text-sm text-gray-600">
                  Donate anonymously. The NGO will see the amount but not your name or contact details.
                </span>
              </label>
            </div>
          </div>

          <div>
            <div className="lg:sticky lg:top-[88px] bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Summary</p>

              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-50">
                {cover.url && (
                  <img src={cover.url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-bold text-ink text-sm line-clamp-2">{campaign.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ngo.name}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Donation</span>
                  <span className="font-bold text-ink">{formatNPR(finalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Processing fee</span>
                  <span className="font-bold text-primary">Free</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-50">
                  <span className="font-bold text-ink">Total</span>
                  <span className="font-black text-ink text-lg">{formatNPR(finalAmount)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mb-3"
                icon={Lock}
                disabled={!isValid}
                onClick={handlePay}
              >
                Donate {formatNPR(finalAmount)}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                100% of your donation goes to {ngo.name}.
              </p>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}