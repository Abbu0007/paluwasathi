import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Users, MapPin, Phone, CheckCircle2,
  AlertTriangle, HandCoins, ArrowRight,
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { formatNPR } from '../../constants/donation-options';
import { campaignService } from '../../services/donation.service';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    campaignService.getById(id)
      .then(function (res) {
        setCampaign(res.data.campaign);
        setDonations(res.data.donations);
      })
      .catch(function () { setCampaign(null); })
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

  if (!campaign) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-black text-ink mb-2">Campaign not found</h1>
          <Link to="/donate" className="font-bold text-primary hover:underline">
            Browse all campaigns
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const ngo = campaign.ngo || {};
  const cover = campaign.coverImage || {};
  const percent = campaign.progressPercent || 0;
  const isActive = campaign.status === 'active';
  const barWidth = { width: percent + '%' };
  const remaining = Math.max(campaign.goalAmount - campaign.raisedAmount, 0);

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/donate" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to campaigns
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[16/9] relative">
              {cover.url ? (
                <img src={cover.url} alt={campaign.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
              {campaign.urgent && isActive && (
                <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-danger text-white px-4 py-1.5 rounded-full text-sm font-bold">
                  <AlertTriangle size={14} /> Urgent
                </span>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-dark text-sm font-bold capitalize mb-3">
                {campaign.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-ink leading-tight mb-4">
                {campaign.title}
              </h1>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {campaign.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-ink">Recent Supporters</h2>
                <span className="text-sm text-gray-400">{campaign.donorCount} total</span>
              </div>

              {donations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Be the first to support this campaign.
                </p>
              ) : (
                <div className="space-y-3">
                  {donations.map(function (d) {
                    return (
                      <div key={d._id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                        <span className="w-10 h-10 rounded-full bg-primary-50 text-primary-dark font-bold text-sm flex items-center justify-center shrink-0">
                          {d.donorName.charAt(0)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-ink text-sm truncate">{d.donorName}</p>
                            <p className="font-black text-primary text-sm shrink-0">
                              {formatNPR(d.amount)}
                            </p>
                          </div>
                          {d.message && (
                            <p className="text-sm text-gray-500 mt-0.5">{d.message}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="lg:sticky lg:top-[88px] space-y-6">

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-3xl font-black text-ink">{formatNPR(campaign.raisedAmount)}</p>
                <p className="text-sm text-gray-500 mb-4">
                  raised of {formatNPR(campaign.goalAmount)} goal
                </p>

                <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-primary transition-all" style={barWidth} />
                </div>

                <div className="flex items-center justify-between text-sm mb-6">
                  <span className="font-bold text-primary">{percent}% funded</span>
                  {remaining > 0 && (
                    <span className="text-gray-400">{formatNPR(remaining)} to go</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-bold text-ink">{campaign.donorCount}</p>
                      <p className="text-xs text-gray-400">Donors</p>
                    </div>
                  </div>
                  {campaign.daysLeft !== null && campaign.daysLeft !== undefined && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-bold text-ink">{campaign.daysLeft}</p>
                        <p className="text-xs text-gray-400">Days left</p>
                      </div>
                    </div>
                  )}
                </div>

                {isActive ? (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    icon={HandCoins}
                    iconRight={ArrowRight}
                    onClick={function () { navigate('/donate/payment/' + campaign._id); }}
                  >
                    Donate Now
                  </Button>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle2 size={32} className="text-primary mx-auto mb-3" />
                    <p className="font-bold text-ink mb-1">Goal reached</p>
                    <p className="text-sm text-gray-500 mb-4">
                      This campaign has been fully funded. Thank you.
                    </p>
                    <Link to="/donate">
                      <Button variant="outline" size="sm" className="w-full">
                        Support another campaign
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Organised by</p>
                <Link to={'/donate/ngo/' + ngo._id} className="flex items-start gap-3 mb-4 group">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-ink text-sm truncate group-hover:text-primary">
                        {ngo.name}
                      </p>
                      <CheckCircle2 size={14} className="text-primary shrink-0" />
                    </div>
                    <p className="text-xs text-gray-500">{ngo.district}</p>
                  </div>
                </Link>

                {ngo.phone && (
                  <a
                    href={'tel:' + ngo.phone}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    <Phone size={15} /> Contact NGO
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}