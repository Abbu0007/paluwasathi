import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Sparkles, Ticket } from 'lucide-react';
import { eventCategoryLabel, formatEventDate } from '../../constants/event-options';

export default function EventCard({ event }) {
  const organiser = event.organiser || {};
  const cover = event.coverImage || {};
  const location = event.location || {};
  const spotsLeft = event.spotsLeft;
  const isFull = event.capacity > 0 && spotsLeft === 0;

  const hasCapacity = event.capacity > 0;
  const fillPercent = hasCapacity
    ? Math.round((event.attendeeCount / event.capacity) * 100)
    : 0;
  const barWidth = { width: fillPercent + '%' };

  return (
    <Link
      to={'/events/' + event._id}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-[16/9] bg-gray-100">
        {cover.url ? (
          <img src={cover.url} alt={event.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

        {event.featured && !isFull && (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles size={12} /> Featured
          </span>
        )}

        {!event.isFree && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-ink text-white px-2.5 py-1 rounded-full text-xs font-bold">
            <Ticket size={11} /> NPR {event.ticketPrice}
          </span>
        )}

        {isFull && (
          <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
            <span className="bg-white text-ink px-4 py-1.5 rounded-full text-sm font-bold">
              Fully booked
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-dark text-xs font-bold">
            {eventCategoryLabel(event.category)}
          </span>
          {event.isFree && (
            <span className="text-xs font-bold text-primary">Free</span>
          )}
        </div>

        <h3 className="font-black text-ink leading-snug mb-1.5 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-xs text-gray-400 mb-3">{organiser.name}</p>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {event.shortDescription}
        </p>

        <div className="space-y-1.5 mb-4">
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Calendar size={12} className="shrink-0" />
            {formatEventDate(event.startDate)}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Clock size={12} className="shrink-0" />
            {event.startTime}
            {event.endTime ? ' – ' + event.endTime : ''}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{location.venue}</span>
          </p>
        </div>

        {hasCapacity && (
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-2">
            <div className="h-full rounded-full bg-primary transition-all" style={barWidth} />
          </div>
        )}

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-gray-400 flex items-center gap-1">
            <Users size={12} />
            {event.attendeeCount} attending
          </span>
          {hasCapacity && !isFull && (
            <span className="font-bold text-primary">{spotsLeft} spots left</span>
          )}
        </div>
      </div>
    </Link>
  );
}