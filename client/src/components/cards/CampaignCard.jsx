import { Link } from 'react-router-dom';
import { Clock, Users, AlertTriangle } from 'lucide-react';
import { formatNPR } from '../../constants/donation-options';

export default function CampaignCard({ campaign }) {
  const ngo = campaign.ngo || {};
  const cover = campaign.coverImage || {};
  const percent = campaign.progressPercent || 0;
  const daysLeft = campaign.daysLeft;
  const isCompleted = campaign.status === 'completed';

  const barWidth = { width: percent + '%' };

  return (
    <Link
      to={'/donate/campaign/' + campaign._id}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-[16/9] bg-gray-100">
        {cover.url ? (
          <img src={cover.url} alt={campaign.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

        {campaign.urgent && !isCompleted && (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-danger text-white px-3 py-1 rounded-full text-xs font-bold">
            <AlertTriangle size={12} /> Urgent
          </span>
        )}

        {isCompleted && (
          <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
            <span className="bg-white text-ink px-4 py-1.5 rounded-full text-sm font-bold">
              Goal Reached
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-dark text-xs font-bold capitalize mb-2">
          {campaign.category}
        </span>

        <h3 className="font-black text-ink leading-snug mb-1.5 line-clamp-2">
          {campaign.title}
        </h3>

        <p className="text-xs text-gray-400 mb-4">{ngo.name}</p>

        <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-2">
          <div className="h-full rounded-full bg-primary transition-all" style={barWidth} />
        </div>

        <div className="flex items-center justify-between text-sm mb-3">
          <span className="font-black text-ink">{formatNPR(campaign.raisedAmount)}</span>
          <span className="text-gray-400">{percent}%</span>
        </div>

        <p className="text-xs text-gray-400 mb-3">
          raised of {formatNPR(campaign.goalAmount)} goal
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-50">
          <span className="flex items-center gap-1">
            <Users size={12} /> {campaign.donorCount} donors
          </span>
          {daysLeft !== null && daysLeft !== undefined && (
            <span className="flex items-center gap-1">
              <Clock size={12} /> {daysLeft} days left
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}