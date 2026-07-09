import { Link } from 'react-router-dom';
import { MapPin, Calendar, Gift } from 'lucide-react';

const timeAgo = (date) => {
  const days = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return days + ' days ago';
};

export default function LostFoundCard({ report }) {
  const photos = report.photos || [];
  const location = report.location || {};
  const isLost = report.type === 'lost';
  const isReunited = report.status === 'reunited';

  const badgeClass = isLost
    ? 'absolute top-3 left-3 bg-danger text-white px-3 py-1 rounded-full text-xs font-bold'
    : 'absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold';

  return (
    <Link
      to={'/lost-found/' + report._id}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {photos[0] ? (
          <img src={photos[0].url} alt={report.petName || report.species} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No photo
          </div>
        )}

        <span className={badgeClass}>
          {isLost ? 'LOST' : 'FOUND'}
        </span>

        {report.reward > 0 && !isReunited && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-accent text-white px-2.5 py-1 rounded-full text-xs font-bold">
            <Gift size={11} /> Reward
          </span>
        )}

        {isReunited && (
          <div className="absolute inset-0 bg-primary/70 flex items-center justify-center">
            <span className="bg-white text-primary-dark px-4 py-1.5 rounded-full text-sm font-bold">
              Reunited
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-black text-ink mb-1">
          {report.petName || (isLost ? 'Unnamed pet' : report.color + ' ' + report.species)}
        </h3>

        <p className="text-sm text-gray-500 mb-3">
          {report.color} {report.species}
          {report.breed ? ' · ' + report.breed : ''}
        </p>

        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{location.address}</span>
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <Calendar size={12} className="shrink-0" />
            {isLost ? 'Lost ' : 'Found '}{timeAgo(report.date)}
          </p>
        </div>

        <p className="text-xs text-gray-300 mt-3 pt-3 border-t border-gray-50">
          {report.reportNumber}
        </p>
      </div>
    </Link>
  );
}