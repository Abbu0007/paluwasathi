import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, MapPin, CheckCircle2, ArrowRight, HandCoins } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import CampaignCard from '../../components/cards/CampaignCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { CATEGORIES, SORT_OPTIONS, formatNPR } from '../../constants/donation-options';
import { campaignService } from '../../services/donation.service';

export default function DonatePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [campaigns, setCampaigns] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [stats, setStats] = useState({ activeCampaigns: 0, totalRaised: 0, donorCount: 0 });
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const urgentOnly = searchParams.get('urgent') === 'true';

  useEffect(() => {
    campaignService.getStats().then(function (res) { setStats(res.data); }).catch(function () {});
    campaignService.getNgos().then(function (res) { setNgos(res.data.ngos); }).catch(function () {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { sort, limit: 12 };
    if (category) params.category = category;
    if (urgentOnly) params.urgent = 'true';

    campaignService.getAll(params)
      .then(function (res) { setCampaigns(res.data.campaigns); })
      .catch(function () { setCampaigns([]); })
      .finally(function () { setLoading(false); });
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        <div className="mb-10">
          <p className="text-sm font-bold text-primary uppercase tracking-wide mb-1">Support</p>
          <h1 className="text-3xl font-black text-ink">Fund Animal Welfare in Nepal</h1>
          <p className="text-gray-500 mt-1 max-w-2xl">
            Every rupee goes directly to verified NGOs running rescue operations,
            medical care, and shelter programmes across the country.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-12">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <p className="text-xl sm:text-3xl font-black text-ink">{formatNPR(stats.totalRaised)}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Raised so far</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <p className="text-xl sm:text-3xl font-black text-primary">{stats.activeCampaigns}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Active campaigns</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <p className="text-xl sm:text-3xl font-black text-accent">{stats.donorCount}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Donors</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-black text-ink mb-1">Verified NGO Partners</h2>
          <p className="text-gray-500 text-sm mb-6">
            Donate directly to an organisation, or fund a specific campaign below.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ngos.map(function (ngo) {
              return (
                <Link
                  key={ngo._id}
                  to={'/donate/ngo/' + ngo._id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
                      <Heart size={20} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-black text-ink truncate">{ngo.name}</p>
                        <CheckCircle2 size={14} className="text-primary shrink-0" />
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin size={11} /> {ngo.district}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-sm font-black text-ink">{ngo.activeCampaigns}</p>
                      <p className="text-xs text-gray-400">Campaigns</p>
                    </div>
                    <div>
                      <p className="text-sm font-black text-ink">{ngo.donorCount}</p>
                      <p className="text-xs text-gray-400">Donors</p>
                    </div>
                    <div>
                      <p className="text-sm font-black text-primary">{formatNPR(ngo.totalRaised)}</p>
                      <p className="text-xs text-gray-400">Raised</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-ink">Active Campaigns</h2>
              <p className="text-gray-500 text-sm">Choose a cause that matters to you.</p>
            </div>
            <select
              value={sort}
              onChange={function (e) { updateParam('sort', e.target.value); }}
              className="px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-600 outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map(function (o) {
                return <option key={o.value} value={o.value}>{o.label}</option>;
              })}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={function () { updateParam('category', ''); }}
              className={!category
                ? 'px-4 py-1.5 rounded-full text-sm font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                : 'px-4 py-1.5 rounded-full text-sm font-bold border-2 border-gray-200 text-gray-600 bg-white'}
            >
              All
            </button>
            {CATEGORIES.map(function (c) {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  onClick={function () { updateParam('category', c.value); }}
                  className={active
                    ? 'px-4 py-1.5 rounded-full text-sm font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                    : 'px-4 py-1.5 rounded-full text-sm font-bold border-2 border-gray-200 text-gray-600 bg-white'}
                >
                  {c.label}
                </button>
              );
            })}
            <button
              onClick={function () { updateParam('urgent', urgentOnly ? '' : 'true'); }}
              className={urgentOnly
                ? 'px-4 py-1.5 rounded-full text-sm font-bold border-2 border-danger bg-red-50 text-danger'
                : 'px-4 py-1.5 rounded-full text-sm font-bold border-2 border-gray-200 text-gray-600 bg-white'}
            >
              Urgent only
            </button>
          </div>

          {loading ? (
            <div className="py-20"><Spinner size={40} /></div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <HandCoins size={24} className="text-primary" />
              </div>
              <p className="font-bold text-ink mb-1">No campaigns match your filters</p>
              <p className="text-sm text-gray-500 mb-6">Try a different category.</p>
              <Button variant="outline" size="sm" onClick={function () { setSearchParams({}); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {campaigns.map(function (c) {
                return <CampaignCard key={c._id} campaign={c} />;
              })}
            </div>
          )}
        </div>

      </div>
    </PageWrapper>
  );
}