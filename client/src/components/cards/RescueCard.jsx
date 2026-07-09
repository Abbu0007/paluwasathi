import { MapPin, Clock, ArrowRight } from 'lucide-react';
import Badge from '../ui/Badge';

const urgencyVariant = { critical: 'critical', high: 'high', moderate: 'stable' };

const timeAgo = (date) => {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function RescueCard({ rescue, onAccept, accepting, showAccept = false }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex gap-4 p-4">
        {rescue.photos?.[0] ? (
          <img
            src={rescue.photos[0].url}
            alt="Rescue"
            className="w-24 h-24 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs shrink-0">
            No photo
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-bold text-ink text-sm">{rescue.caseNumber}</p>
            <Badge variant={urgencyVariant[rescue.urgency]}>
              {rescue.urgency}
            </Badge>
          </div>

          <p className="text-sm text-ink capitalize font-medium mb-1">
            {rescue.animalType}
            {rescue.conditions?.length > 0 && ` — ${rescue.conditions.slice(0, 2).join(', ')}`}
          </p>

          <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{rescue.location?.address}</span>
          </p>

          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <Clock size={12} />
            {timeAgo(rescue.createdAt)}
          </p>
        </div>
      </div>

      {showAccept && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onAccept(rescue._id)}
            disabled={accepting === rescue._id}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {accepting === rescue._id ? 'Accepting...' : 'Accept This Case'}
            {accepting !== rescue._id && <ArrowRight size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}