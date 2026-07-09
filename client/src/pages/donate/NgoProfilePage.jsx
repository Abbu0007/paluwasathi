import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, Mail, CheckCircle2,
  Heart, PawPrint, Users, HandCoins,
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import CampaignCard from '../../components/cards/CampaignCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { formatNPR } from '../../constants/donation-options';
import { campaignService } from '../../services/donation.service';

export default function NgoProfilePage() {
  const { id } = useParams();

  const [ngo, setNgo] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    campaignService.getNgoProfile(id)
      .then(function (res) {
        setNgo(res.data.ngo);
        setCampaigns(res.data.campaigns);
        setStats(res.data.stats);
      })
      .catch(function () { setNgo(null); })
      .finally(function () { setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size={40} />
        </div>
      </PageWrapper>
    );
  }

  if (!ngo) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-black text-ink mb-2">NGO not found</h1>
          <Link to="/donate" className="font-bold text-primary hover:underline">
            Browse all NGOs
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const memberSince = new Date(ngo.createdAt).getFullYear();

  const statCards = [
    { label: 'Total Raised', value: formatNPR(stats.totalRaised), Icon: HandCoins },
    { label: 'Donors', value: stats.donorCount, Icon: Users },
    { label: 'Pets Listed', value: stats.petsListed, Icon: PawPrint },
    { label: 'Pets Adopted', value: stats.petsAdopted, Icon: Heart },
  ];

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/donate" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to NGOs
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
              <Heart size={32} className="text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-ink">{ngo.name}</h1>
                <CheckCircle2 size={20} className="text-primary shrink-0" />
              </div>
              <p className="text-gray-500 flex items-center gap-1.5 mb-1">
                <MapPin size={14} /> {ngo.district}, Nepal
              </p>
              <p className="text-sm text-gray-400">Verified partner since {memberSince}</p>

              <div className="flex flex-wrap gap-2 mt-5">
                {ngo.phone && (
                  <a
                    href={'tel:' + ngo.phone}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    <Phone size={14} /> {ngo.phone}
                  </a>
                )}
                {ngo.email && (
                  <a
                    href={'mailto:' + ngo.email}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    <Mail size={14} /> Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
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

        <div>
          <h2 className="text-2xl font-black text-ink mb-1">Active Campaigns</h2>
          <p className="text-gray-500 text-sm mb-6">
            Support a specific programme run by {ngo.name}.
          </p>

          {campaigns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <HandCoins size={24} className="text-primary" />
              </div>
              <p className="font-bold text-ink mb-1">No active campaigns</p>
              <p className="text-sm text-gray-500 mb-6">
                This NGO has no fundraising campaigns right now.
              </p>
              <Link to="/donate">
                <Button variant="outline" size="sm">Browse other campaigns</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {campaigns.map(function (c) {
                const withNgo = Object.assign({}, c, { ngo: { name: ngo.name, _id: ngo._id } });
                return <CampaignCard key={c._id} campaign={withNgo} />;
              })}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}