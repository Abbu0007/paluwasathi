import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2, Calendar, Clock, MapPin, Phone, ArrowLeft,
  Download, Users, Ticket, PawPrint,
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { formatLongDate, eventCategoryLabel } from '../../constants/event-options';
import { rsvpService } from '../../services/event.service';

export default function EventTicketPage() {
  const { id } = useParams();
  const routeState = useLocation().state;
  const justRsvped = routeState && routeState.justRsvped;

  const [rsvp, setRsvp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rsvpService.getById(id)
      .then(function (res) { setRsvp(res.data.rsvp); })
      .catch(function () { setRsvp(null); })
      .finally(function () { setLoading(false); });
  }, [id]);

  const downloadICS = () => {
    const event = rsvp.event;
    const start = new Date(event.startDate);
    const pad = function (n) { return String(n).padStart(2, '0'); };

    const startStr = start.getFullYear() + pad(start.getMonth() + 1) + pad(start.getDate());
    const startTimeStr = event.startTime.replace(':', '') + '00';
    const endTimeStr = (event.endTime || event.startTime).replace(':', '') + '00';

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PaluwaSathi//Events//EN',
      'BEGIN:VEVENT',
      'UID:' + rsvp.ticketNumber + '@paluwasathi.com',
      'DTSTART:' + startStr + 'T' + startTimeStr,
      'DTEND:' + startStr + 'T' + endTimeStr,
      'SUMMARY:' + event.title,
      'DESCRIPTION:Organised by ' + event.organiser.name + '. Ticket ' + rsvp.ticketNumber,
      'LOCATION:' + event.location.venue + ', ' + event.location.address,
      'END:VEVENT',
      'END:VCALENDAR',
    ];

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paluwasathi-' + rsvp.ticketNumber + '.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center"><Spinner size={40} /></div>
      </PageWrapper>
    );
  }

  if (!rsvp) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-black text-ink mb-2">Ticket not found</h1>
          <Link to="/dashboard/events" className="font-bold text-primary hover:underline">
            View my events
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const event = rsvp.event || {};
  const organiser = event.organiser || {};
  const loc = event.location || {};
  const timeRange = event.endTime ? event.startTime + ' – ' + event.endTime : event.startTime;
  const totalCost = event.isFree ? 0 : event.ticketPrice * rsvp.guestCount;

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {justRsvped && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black text-ink mb-2">You're going</h1>
            <p className="text-gray-500">
              {organiser.name} will contact you with any final details.
            </p>
          </div>
        )}

        {!justRsvped && (
          <Link to="/dashboard/events" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
            <ArrowLeft size={16} /> My events
          </Link>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden print:border-0">
          <div className="bg-ink p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/60">Ticket</p>
                <p className="text-xl font-black mt-1">{rsvp.ticketNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60">Admits</p>
                <p className="text-2xl font-black">{rsvp.guestCount}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-dark text-xs font-bold mb-2">
                {eventCategoryLabel(event.category)}
              </span>
              <h2 className="text-xl font-black text-ink">{event.title}</h2>
              <p className="text-sm text-gray-500">{organiser.name}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                  <p className="text-sm font-bold text-ink">{formatLongDate(event.startDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                <Clock size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Time</p>
                  <p className="text-sm font-bold text-ink">{timeRange}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 sm:col-span-2">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase">Venue</p>
                  <p className="text-sm font-bold text-ink">{loc.venue}</p>
                  <p className="text-xs text-gray-500">{loc.address}, {loc.district}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Users size={14} /> Guests
                </span>
                <span className="font-bold text-ink">{rsvp.guestCount}</span>
              </div>
              {rsvp.bringingPet && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <PawPrint size={14} /> Bringing a pet
                  </span>
                  <span className="font-bold text-ink text-right ml-4 max-w-[60%]">
                    {rsvp.petDetails || 'Yes'}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Ticket size={14} /> Cost
                </span>
                <span className="font-bold text-primary">
                  {event.isFree ? 'Free' : 'NPR ' + totalCost + ' at venue'}
                </span>
              </div>
            </div>

            {organiser.phone && (
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100">
                <div className="min-w-0">
                  <p className="font-bold text-ink text-sm truncate">{organiser.name}</p>
                  <p className="text-xs text-gray-500">Questions before the event?</p>
                </div>
                <a
                  href={'tel:' + organiser.phone}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-bold shrink-0"
                >
                  <Phone size={15} /> Call
                </a>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center pt-2">
              Show this ticket number at the venue entrance.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 print:hidden">
          <Button variant="primary" icon={Download} className="flex-1" onClick={downloadICS}>
            Add to Calendar
          </Button>
          <Link to="/events" className="flex-1">
            <Button variant="outline" className="w-full">Browse More Events</Button>
          </Link>
        </div>

        <div className="text-center mt-6 print:hidden">
          <Link to="/dashboard/events" className="text-sm font-bold text-primary hover:underline">
            View all my events
          </Link>
        </div>

      </div>
    </PageWrapper>
  );
}