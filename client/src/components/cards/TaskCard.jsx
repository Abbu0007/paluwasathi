import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, AlertTriangle } from 'lucide-react';
import { categoryLabel, formatTaskDate } from '../../constants/task-options';

export default function TaskCard({ task }) {
  const ngo = task.ngo || {};
  const cover = task.coverImage || {};
  const location = task.location || {};
  const spotsLeft = task.spotsLeft;
  const isFull = task.status === 'full' || spotsLeft === 0;

  const fillPercent = Math.round((task.volunteersJoined / task.volunteersNeeded) * 100);
  const barWidth = { width: fillPercent + '%' };

  return (
    <Link
      to={'/volunteer/' + task._id}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-[16/9] bg-gray-100">
        {cover.url ? (
          <img src={cover.url} alt={task.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

        {task.urgent && !isFull && (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-danger text-white px-3 py-1 rounded-full text-xs font-bold">
            <AlertTriangle size={12} /> Urgent
          </span>
        )}

        {isFull && (
          <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
            <span className="bg-white text-ink px-4 py-1.5 rounded-full text-sm font-bold">
              All spots filled
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-dark text-xs font-bold mb-2">
          {categoryLabel(task.category)}
        </span>

        <h3 className="font-black text-ink leading-snug mb-1.5 line-clamp-2">
          {task.title}
        </h3>

        <p className="text-xs text-gray-400 mb-4">{ngo.name}</p>

        <div className="space-y-1.5 mb-4">
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Calendar size={12} className="shrink-0" />
            {formatTaskDate(task.startDate)}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Clock size={12} className="shrink-0" />
            {task.startTime}
            {task.endTime ? ' – ' + task.endTime : ''}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{location.district}</span>
          </p>
        </div>

        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-2">
          <div className="h-full rounded-full bg-primary transition-all" style={barWidth} />
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-gray-400 flex items-center gap-1">
            <Users size={12} />
            {task.volunteersJoined}/{task.volunteersNeeded} joined
          </span>
          {!isFull && (
            <span className="font-bold text-primary">{spotsLeft} spots left</span>
          )}
        </div>
      </div>
    </Link>
  );
}