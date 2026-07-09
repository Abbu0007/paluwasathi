import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2, Download, ArrowLeft, Share2, Heart,
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { formatNPR } from '../../constants/donation-options';
import { donationService } from '../../services/donation.service';

export default function ReceiptPage() {
  const { id } = useParams();
  const location = useLocation();
  const justPaid = location.state && location.state.justPaid;

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donationService.getById(id)
      .then(function (res) { setDonation(res.data.donation); })
      .catch(function () { setDonation(null); })
      .finally(function () { setLoading(false); });
  }, [id]);

  const handlePrint = () => {
    window.print();
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

  if (!donation) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-black text-ink mb-2">Receipt not found</h1>
          <Link to="/dashboard/donations" className="font-bold text-primary hover:underline">
            View my donations
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const ngo = donation.ngo || {};
  const campaign = donation.campaign || {};
  const donorInfo = donation.donorInfo || {};
  const paidDate = donation.paidAt
    ? new Date(donation.paidAt).toLocaleString()
    : new Date(donation.createdAt).toLocaleString();

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {justPaid && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black text-ink mb-2">Thank you for your donation</h1>
            <p className="text-gray-500">
              Your support helps {ngo.name} continue their work.
            </p>
          </div>
        )}

        {!justPaid && (
          <Link to="/dashboard/donations" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
            <ArrowLeft size={16} /> My donations
          </Link>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden print:border-0">

          <div className="bg-ink p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/60">Receipt</p>
                <p className="text-xl font-black mt-1">{donation.receiptNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60">Amount</p>
                <p className="text-2xl font-black">{formatNPR(donation.amount)}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">

            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50">
              <CheckCircle2 size={20} className="text-primary shrink-0" />
              <div>
                <p className="font-bold text-primary-dark text-sm">Payment successful</p>
                <p className="text-xs text-primary-dark">{paidDate}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Donation details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Campaign</span>
                  <span className="font-bold text-ink text-right ml-4">
                    {campaign.title || 'General donation'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Organisation</span>
                  <span className="font-bold text-ink">{ngo.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Payment method</span>
                  <span className="font-bold text-ink capitalize">{donation.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono text-xs text-ink">{donation.transactionId}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Status</span>
                  <span className="font-bold text-primary capitalize">{donation.status}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Donor</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Name</span>
                  <span className="font-bold text-ink">
                    {donation.isAnonymous ? 'Anonymous' : donorInfo.name}
                  </span>
                </div>
                {!donation.isAnonymous && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Email</span>
                    <span className="font-bold text-ink">{donorInfo.email}</span>
                  </div>
                )}
              </div>
            </div>

            {donation.message && (
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Your message</p>
                <p className="text-sm text-ink">{donation.message}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                This receipt was generated by PaluwaSathi on behalf of {ngo.name}.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Sandbox transaction — no real payment was processed.
              </p>
            </div>

          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 print:hidden">
          <Button variant="primary" icon={Download} className="flex-1" onClick={handlePrint}>
            Download Receipt
          </Button>
          <Link to="/donate" className="flex-1">
            <Button variant="outline" icon={Heart} className="w-full">
              Donate Again
            </Button>
          </Link>
        </div>

        <div className="text-center mt-6 print:hidden">
          <Link to="/dashboard/donations" className="text-sm font-bold text-primary hover:underline">
            View all my donations
          </Link>
        </div>

      </div>
    </PageWrapper>
  );
}