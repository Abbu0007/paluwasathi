import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, HandCoins, X, Upload, Clock, Users } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { CATEGORIES, formatNPR } from '../../constants/donation-options';
import { campaignService } from '../../services/donation.service';

const statusVariant = {
  active: 'stable',
  completed: 'verified',
  paused: 'neutral',
};

export default function CampaignsPage() {
  const inputRef = useRef();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cover, setCover] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: '',
    shortDescription: '',
    description: '',
    goalAmount: '',
    deadline: '',
    urgent: false,
  });

  const loadData = async () => {
    try {
      const res = await campaignService.getMine();
      setCampaigns(res.data.campaigns);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const update = (field, value) => {
    setForm(function (prev) {
      return Object.assign({}, prev, { [field]: value });
    });
  };

  const isValid = form.title && form.category && form.shortDescription &&
    form.description && Number(form.goalAmount) >= 1000 && cover;

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('shortDescription', form.shortDescription);
      formData.append('description', form.description);
      formData.append('goalAmount', form.goalAmount);
      formData.append('urgent', form.urgent);
      if (form.deadline) formData.append('deadline', form.deadline);
      formData.append('photos', cover);

      await campaignService.create(formData);

      setShowForm(false);
      setForm({ title: '', category: '', shortDescription: '', description: '', goalAmount: '', deadline: '', urgent: false });
      setCover(null);
      setLoading(true);
      await loadData();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Failed to create campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-ink">My Campaigns</h1>
            <p className="text-gray-500 text-sm">
              Create and manage fundraising campaigns for your shelter.
            </p>
          </div>
          <Button
            variant="primary"
            icon={showForm ? X : Plus}
            className="shrink-0"
            onClick={function () { setShowForm(!showForm); }}
          >
            {showForm ? 'Cancel' : 'New Campaign'}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-5">
            <h2 className="font-bold text-ink">Create a Campaign</h2>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{error}</div>
            )}

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Cover image</label>
              <div
                onClick={function () { inputRef.current.click(); }}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {cover ? (
                  <img src={URL.createObjectURL(cover)} alt="" className="w-full h-40 object-cover rounded-xl" />
                ) : (
                  <div>
                    <Upload size={22} className="text-primary mx-auto mb-2" />
                    <p className="font-bold text-ink text-sm">Upload a cover image</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP</p>
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={function (e) { setCover(e.target.files[0]); }}
                  className="hidden"
                />
              </div>
            </div>

            <Input label="Campaign title" value={form.title}
              onChange={function (e) { update('title', e.target.value); }}
              placeholder="e.g. Emergency Surgery Fund" />

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(function (c) {
                  const active = form.category === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={function () { update('category', c.value); }}
                      className={active
                        ? 'py-2.5 rounded-xl text-sm font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                        : 'py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-600'}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Short description</label>
              <textarea
                rows={2}
                maxLength={200}
                value={form.shortDescription}
                onChange={function (e) { update('shortDescription', e.target.value); }}
                placeholder="One sentence that appears on the campaign card"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{form.shortDescription.length}/200</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Full description</label>
              <textarea
                rows={6}
                maxLength={3000}
                value={form.description}
                onChange={function (e) { update('description', e.target.value); }}
                placeholder="Explain the need, how funds will be used, and the impact."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/3000</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Goal amount (NPR)" type="number" min="1000" value={form.goalAmount}
                onChange={function (e) { update('goalAmount', e.target.value); }}
                placeholder="Minimum 1000" />

              <div>
                <label className="block text-sm font-bold text-ink mb-2">Deadline (optional)</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={function (e) { update('deadline', e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer p-4 rounded-xl bg-red-50">
              <input
                type="checkbox"
                checked={form.urgent}
                onChange={function (e) { update('urgent', e.target.checked); }}
                className="mt-0.5 w-4 h-4 accent-[#C0392B]"
              />
              <span className="text-sm text-red-800">
                Mark as urgent. Use sparingly, only for time-critical needs.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={function () { setShowForm(false); }}
                className="text-sm font-bold text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
              <Button variant="primary" loading={submitting} disabled={!isValid} onClick={handleSubmit}>
                Publish Campaign
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20"><Spinner size={40} /></div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <HandCoins size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">No campaigns yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Create a campaign to start raising funds for your shelter.
            </p>
            <Button variant="outline" size="sm" icon={Plus} onClick={function () { setShowForm(true); }}>
              Create Your First Campaign
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {campaigns.map(function (c) {
              const coverImg = c.coverImage || {};
              const percent = c.progressPercent || 0;
              const barWidth = { width: percent + '%' };

              return (
                <Link
                  key={c._id}
                  to={'/donate/campaign/' + c._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[16/9] bg-gray-100">
                    {coverImg.url ? (
                      <img src={coverImg.url} alt={c.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-black text-ink text-sm line-clamp-2">{c.title}</h3>
                      <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                    </div>

                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-2 mt-3">
                      <div className="h-full rounded-full bg-primary" style={barWidth} />
                    </div>

                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="font-black text-ink">{formatNPR(c.raisedAmount)}</span>
                      <span className="text-gray-400">{percent}%</span>
                    </div>

                    <p className="text-xs text-gray-400 mb-3">
                      of {formatNPR(c.goalAmount)} goal
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-50">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {c.donorCount} donors
                      </span>
                      {c.daysLeft !== null && c.daysLeft !== undefined && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {c.daysLeft}d left
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}