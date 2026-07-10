import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, X, CheckCircle2, Ticket } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { formatEventDate, eventCategoryLabel } from '../../constants/event-options';
import { rsvpService } from '../../services/event.service';

const statusVariant = {
  confirmed: 'new',
  attended: 'stable',
  cancelled: 'neutral',
};

export default function MyEventsPage() {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [cancelling, setCancelling] = useState(null);

  const loadData = async () => {
    try {
      const res = await rsvpService.getMine();
      setRsvps(res.data.rsvps);
    } catch {
      setRsvps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCancel = async (rsvpId) => {
    const confirmed = window.confirm('Cancel your RSVP? Your spot will open for someone else.');
    if (!confirmed) return;

    setCancelling(rsvpId);
    try {
      await rsvpService.cancel(rsvpId);
      await loadData();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      alert(msg || 'Failed to cancel.');
    } finally {
      setCancelling(null);
    }
  };

  const now = new Date();
  const upcoming = rsvps.filter(function (r) {
    return r.event && new Date(r.event.startDate) >= now && r.status === 'confirmed';
  });
  const past = rsvps.filter(function (r) {
    return r.event && (new Date(r.event.startDate) < now || r.status === 'attended');
  });

  const list = tab === 'upcoming' ? upcoming : past;

  const totalGuests = rsvps.reduce(function (sum, r) { return sum + r.guestCount; }, 0);

  const statCards = [
    { label: 'Upcoming', value: upcoming.length, Icon: Calendar },
    { label: 'Attended', value: past.filter(function (r) { return r.status === 'attended'; }).length, Icon: CheckCircle2 },
    { label: 'Total Guests', value: totalGuests, Icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-ink">My Events</h1>
            <p className="text-gray-500 text-sm">
              Events you have RSVPed to.
            </p>
          </div>
          <Link to="/events" className="shrink-0">
            <Button variant="primary" icon={Calendar}>Browse Events</Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 max-w-2xl">
          {statCards.map(function (card) {
            const Icon = card.Icon;
            return (
              <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-primary" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-ink">{card.value}</p>
                <p className="text-xs sm:text-sm text-gray-500">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-100 mb-6 w-fit">
          <button
            onClick={function () { setTab('upcoming'); }}
            className={tab === 'upcoming'
              ? 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-50 text-primary-dark'
              : 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50'}
          >
            <Calendar size={16} />
            Upcoming
            <span className="text-xs opacity-60">({upcoming.length})</span>
          </button>
          <button
            onClick={function () { setTab('past'); }}
            className={tab === 'past'
              ? 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-50 text-primary-dark'
              : 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50'}
          >
            <CheckCircle2 size={16} />
            Past
            <span className="text-xs opacity-60">({past.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20"><Spinner size={40} /></div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">
              {tab === 'upcoming' ? 'No upcoming events' : 'No past events'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {tab === 'upcoming'
                ? 'RSVP to an event and it will appear here.'
                : 'Events you have attended will appear here.'}
            </p>
            <Link to="/events">
              <Button variant="outline" size="sm">Browse Events</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map(function (r) {
              const event = r.event || {};
              const organiser = event.organiser || {};
              const loc = event.location || {};
              const cover = event.coverImage || {};
              const timeRange = event.endTime ? event.startTime + ' – ' + event.endTime : event.startTime;

              return (
                <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    {cover.url ? (
                      <img src={cover.url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-primary-50 text-primary-dark text-xs font-bold mb-1">
                            {eventCategoryLabel(event.category)}
                          </span>
                          <p className="font-black text-ink truncate">{event.title}</p>
                          <p className="text-xs text-gray-400">{r.ticketNumber}</p>
                        </div>
                        <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                      </div>

                      <p className="text-sm text-gray-500 mb-2">{organiser.name}</p>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {formatEventDate(event.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {timeRange}
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate">{loc.venue}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {r.guestCount} guest{r.guestCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    <Link to={'/events/ticket/' + r._id} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50">
                        <Ticket size={15} /> View Ticket
                      </button>
                    </Link>
                    {tab === 'upcoming' && (
                      <button
                        onClick={function () { handleCancel(r._id); }}
                        disabled={cancelling === r._id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border-2 border-gray-200 text-danger text-sm font-bold hover:bg-red-50 disabled:opacity-50"
                      >
                        <X size={15} />
                        {cancelling === r._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}