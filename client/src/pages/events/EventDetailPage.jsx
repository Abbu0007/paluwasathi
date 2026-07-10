import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, Phone, Ticket,
  CheckCircle2, Sparkles, ArrowRight, Check,
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { eventCategoryLabel, formatLongDate, formatEventDate } from '../../constants/event-options';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/event.service';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [hasRsvped, setHasRsvped] = useState(false);
  const [myRsvp, setMyRsvp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    eventService.getById(id)
      .then(function (res) {
        setEvent(res.data.event);
        setHasRsvped(res.data.hasRsvped);
        setMyRsvp(res.data.myRsvp);
      })
      .catch(function () { setEvent(null); })
      .finally(function () { setLoading(false); });
  }, [id]);

  const handleRsvp = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    navigate('/events/' + id + '/rsvp');
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center"><Spinner size={40} /></div>
      </PageWrapper>
    );
  }

  if (!event) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-black text-ink mb-2">Event not found</h1>
          <Link to="/events" className="font-bold text-primary hover:underline">
            Browse all events
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const organiser = event.organiser || {};
  const cover = event.coverImage || {};
  const location = event.location || {};
  const highlights = event.highlights || [];
  const spotsLeft = event.spotsLeft;
  const hasCapacity = event.capacity > 0;
  const isFull = hasCapacity && spotsLeft === 0;
  const isOpen = event.status === 'upcoming' && !isFull && !event.isPast;

  const fillPercent = hasCapacity ? Math.round((event.attendeeCount / event.capacity) * 100) : 0;
  const barWidth = { width: fillPercent + '%' };

  const timeRange = event.endTime ? event.startTime + ' – ' + event.endTime : event.startTime;
  const dateRange = event.endDate
    ? formatEventDate(event.startDate) + ' – ' + formatEventDate(event.endDate)
    : formatLongDate(event.startDate);

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to events
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[16/9] relative">
              {cover.url ? (
                <img src={cover.url} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
              {event.featured && (
                <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-accent text-white px-4 py-1.5 rounded-full text-sm font-bold">
                  <Sparkles size={14} /> Featured
                </span>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-dark text-sm font-bold">
                  {eventCategoryLabel(event.category)}
                </span>
                {event.isFree ? (
                  <span className="px-3 py-1 rounded-full bg-primary text-white text-sm font-bold">Free</span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink text-white text-sm font-bold">
                    <Ticket size={13} /> NPR {event.ticketPrice}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-ink leading-tight mb-3">
                {event.title}
              </h1>
              <p className="text-gray-500 mb-5">{event.shortDescription}</p>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-ink mb-4">Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                  <Calendar size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                    <p className="text-sm font-bold text-ink">{dateRange}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                  <Clock size={18} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Time</p>
                    <p className="text-sm font-bold text-ink">{timeRange}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 sm:col-span-2">
                  <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase">Venue</p>
                    <p className="text-sm font-bold text-ink">{location.venue}</p>
                    <p className="text-xs text-gray-500">{location.address}, {location.district}</p>
                  </div>
                </div>
              </div>
            </div>

            {highlights.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-ink mb-4">What to expect</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {highlights.map(function (h) {
                    return (
                      <div key={h} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-primary" />
                        </span>
                        <p className="text-sm text-gray-600">{h}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="lg:sticky lg:top-[88px] space-y-6">

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-3xl font-black text-ink">{event.attendeeCount}</p>
                  {hasCapacity && <p className="text-sm text-gray-400">of {event.capacity}</p>}
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {hasCapacity ? 'people attending' : 'people attending, no limit'}
                </p>

                {hasCapacity && (
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-4">
                    <div className="h-full rounded-full bg-primary transition-all" style={barWidth} />
                  </div>
                )}

                {isOpen && hasCapacity && (
                  <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-primary-50">
                    <Users size={16} className="text-primary shrink-0" />
                    <p className="text-sm font-bold text-primary-dark">
                      {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining
                    </p>
                  </div>
                )}

                {event.daysUntil >= 0 && event.daysUntil <= 7 && isOpen && (
                  <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-accent/10">
                    <Clock size={16} className="text-accent shrink-0" />
                    <p className="text-sm font-bold text-accent-dark">
                      {event.daysUntil === 0 ? 'Happening today' : 'In ' + event.daysUntil + ' day' + (event.daysUntil !== 1 ? 's' : '')}
                    </p>
                  </div>
                )}

                {hasRsvped ? (
                  <div className="text-center py-2">
                    <CheckCircle2 size={32} className="text-primary mx-auto mb-3" />
                    <p className="font-bold text-ink mb-1">You're going</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {myRsvp && myRsvp.guestCount > 1
                        ? myRsvp.guestCount + ' guests confirmed'
                        : 'See you on ' + formatEventDate(event.startDate)}
                    </p>
                    {myRsvp && (
                      <Link to={'/events/ticket/' + myRsvp._id}>
                        <Button variant="outline" size="sm" className="w-full">
                          View your ticket
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : event.isPast ? (
                  <div className="text-center py-2">
                    <p className="font-bold text-ink mb-1">This event has passed</p>
                    <p className="text-sm text-gray-500 mb-4">Check for upcoming events.</p>
                    <Link to="/events">
                      <Button variant="outline" size="sm" className="w-full">Browse events</Button>
                    </Link>
                  </div>
                ) : isFull ? (
                  <div className="text-center py-2">
                    <CheckCircle2 size={32} className="text-primary mx-auto mb-3" />
                    <p className="font-bold text-ink mb-1">Fully booked</p>
                    <p className="text-sm text-gray-500 mb-4">All spots have been taken.</p>
                    <Link to="/events">
                      <Button variant="outline" size="sm" className="w-full">Find another event</Button>
                    </Link>
                  </div>
                ) : (
                  <Button variant="primary" size="lg" className="w-full" iconRight={ArrowRight} onClick={handleRsvp}>
                    RSVP Now
                  </Button>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Organised by</p>
                <Link to={'/donate/ngo/' + organiser._id} className="flex items-start gap-3 mb-4 group">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-ink text-sm truncate group-hover:text-primary">{organiser.name}</p>
                      <CheckCircle2 size={14} className="text-primary shrink-0" />
                    </div>
                    <p className="text-xs text-gray-500">{organiser.district}</p>
                  </div>
                </Link>

                {organiser.phone && (
                  <a
                    href={'tel:' + organiser.phone}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    <Phone size={15} /> Contact organiser
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