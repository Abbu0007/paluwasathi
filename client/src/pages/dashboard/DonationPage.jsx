import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HandCoins, ArrowRight, Heart, Users, Receipt } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { formatNPR } from '../../constants/donation-options';
import { useAuth } from '../../context/AuthContext';
import { donationService } from '../../services/donation.service';

export default function DonationsPage() {
  const { user } = useAuth();
  const isNGO = user && user.role === 'ngo';

  const [donations, setDonations] = useState([]);
  const [total, setTotal] = useState(0);
  const [ngoStats, setNgoStats] = useState({ totalRaised: 0, thisMonth: 0, donorCount: 0, activeCampaigns: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isNGO) {
          const [received, stats] = await Promise.all([
            donationService.getNgoReceived(),
            donationService.getNgoStats(),
          ]);
          setDonations(received.data.donations);
          setTotal(received.data.total);
          setNgoStats(stats.data);
        } else {
          const res = await donationService.getMine();
          setDonations(res.data.donations);
          setTotal(res.data.total);
        }
      } catch {
        setDonations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isNGO]);

  const donorStatCards = [
    { label: 'Total Donated', value: formatNPR(total), Icon: HandCoins },
    { label: 'Donations Made', value: donations.length, Icon: Receipt },
  ];

  const ngoStatCards = [
    { label: 'Total Raised', value: formatNPR(ngoStats.totalRaised), Icon: HandCoins },
    { label: 'This Month', value: formatNPR(ngoStats.thisMonth), Icon: Receipt },
    { label: 'Total Donors', value: ngoStats.donorCount, Icon: Users },
    { label: 'Active Campaigns', value: ngoStats.activeCampaigns, Icon: Heart },
  ];

  const statCards = isNGO ? ngoStatCards : donorStatCards;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-ink">
              {isNGO ? 'Donations Received' : 'My Donations'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isNGO
                ? 'Every donation made to your campaigns.'
                : 'Your contribution history and receipts.'}
            </p>
          </div>
          {!isNGO && (
            <Link to="/donate" className="shrink-0">
              <Button variant="primary" icon={Heart}>Donate</Button>
            </Link>
          )}
        </div>

        <div className={isNGO
          ? 'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6'
          : 'grid grid-cols-2 gap-3 sm:gap-4 mb-6 max-w-md'}>
          {statCards.map(function (card) {
            const Icon = card.Icon;
            return (
              <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-primary" />
                </div>
                <p className="text-lg sm:text-xl font-black text-ink">{card.value}</p>
                <p className="text-xs sm:text-sm text-gray-500">{card.label}</p>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="py-20"><Spinner size={40} /></div>
        ) : donations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <HandCoins size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">
              {isNGO ? 'No donations yet' : 'No donations made yet'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {isNGO
                ? 'Donations to your campaigns will appear here.'
                : 'Support a campaign and your receipts will appear here.'}
            </p>
            <Link to={isNGO ? '/dashboard/campaigns' : '/donate'}>
              <Button variant="outline" size="sm">
                {isNGO ? 'Create a Campaign' : 'Browse Campaigns'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {donations.map(function (d) {
              const campaign = d.campaign || {};
              const ngo = d.ngo || {};
              const donorInfo = d.donorInfo || {};
              const dateStr = new Date(d.paidAt || d.createdAt).toLocaleDateString();

              const inner = (
                <div className="flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <HandCoins size={18} className="text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm truncate">
                      {isNGO ? donorInfo.name : (campaign.title || 'General donation')}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {isNGO ? (campaign.title || 'General donation') : ngo.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {d.receiptNumber} · {dateStr}
                    </p>
                    {isNGO && d.message && (
                      <p className="text-xs text-gray-500 italic mt-1 truncate">"{d.message}"</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-black text-ink">{formatNPR(d.amount)}</p>
                    <p className="text-xs text-gray-400 capitalize">{d.paymentMethod}</p>
                  </div>

                  {!isNGO && <ArrowRight size={16} className="text-gray-300 shrink-0" />}
                </div>
              );

              if (isNGO) {
                return (
                  <div key={d._id} className="border-b border-gray-50 last:border-0">
                    {inner}
                  </div>
                );
              }

              return (
                <Link key={d._id} to={'/donate/receipt/' + d._id} className="block border-b border-gray-50 last:border-0">
                  {inner}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}