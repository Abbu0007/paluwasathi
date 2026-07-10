import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, X, Upload, Users, Calendar, Clock, MapPin,
  ChevronDown, ChevronUp, Check, Phone, Mail, PawPrint,
} from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { EVENT_CATEGORIES, formatEventDate, eventCategoryLabel } from '../../constants/event-options';
import { NEPAL_DISTRICTS } from '../../constants/nepal-districts';
import { eventService, rsvpService } from '../../services/event.service';

const statusVariant = {
  upcoming: 'stable',
  ongoing: 'high',
  completed: 'verified',
  cancelled: 'neutral',
};

function AttendeeRoster({ eventId }) {
  const [rsvps, setRsvps] = useState([]);
  const [totalGuests, setTotalGuests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const loadData = async () => {
    try {
      const res = await eventService.getAttendees(eventId);
      setRsvps(res.data.rsvps);
      setTotalGuests(res.data.totalGuests);
    } catch {
      setRsvps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [eventId]);

  const handleAttended = async (rsvpId) => {
    setBusy(rsvpId);
    try {
      await rsvpService.markAttended(rsvpId);
      await loadData();
    } catch {
      alert('Failed to mark attendance.');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="py-8"><Spinner /></div>;

  if (rsvps.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-500">No RSVPs yet.</p>
      </div>
    );
  }

  const petCount = rsvps.filter(function (r) { return r.bringingPet; }).length;

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-lg font-black text-ink">{rsvps.length}</p>
          <p className="text-xs text-gray-500">RSVPs</p>
        </div>
        <div>
          <p className="text-lg font-black text-primary">{totalGuests}</p>
          <p className="text-xs text-gray-500">Total guests</p>
        </div>
        <div>
          <p className="text-lg font-black text-accent">{petCount}</p>
          <p className="text-xs text-gray-500">Bringing pets</p>
        </div>
      </div>

      <div className="space-y-3">
        {rsvps.map(function (r) {
          const a = r.attendee || {};
          const info = r.attendeeInfo || {};
          const isPending = r.status === 'confirmed';

          return (
            <div key={r._id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-bold text-ink text-sm">{info.name || a.name}</p>
                  <p className="text-xs text-gray-400">
                    {r.ticketNumber} · {r.guestCount} guest{r.guestCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <Badge variant={r.status === 'attended' ? 'stable' : 'new'}>
                  {r.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                <a href={'tel:' + info.phone} className="flex items-center gap-1 hover:text-primary">
                  <Phone size={11} /> {info.phone}
                </a>
                <a href={'mailto:' + info.email} className="flex items-center gap-1 hover:text-primary">
                  <Mail size={11} /> {info.email}
                </a>
              </div>

              {r.bringingPet && (
                <div className="bg-accent/10 rounded-lg p-3 mb-3">
                  <p className="text-xs font-bold text-accent-dark flex items-center gap-1.5 mb-0.5">
                    <PawPrint size={12} /> Bringing a pet
                  </p>
                  <p className="text-xs text-ink">{r.petDetails || 'No details given'}</p>
                </div>
              )}

              {r.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-400 mb-0.5">Notes</p>
                  <p className="text-xs text-ink">{r.notes}</p>
                </div>
              )}

              {isPending && (
                <button
                  onClick={function () { handleAttended(r._id); }}
                  disabled={busy === r._id}
                  className="w-full py-2 rounded-lg bg-primary text-white text-xs font-bold disabled:opacity-50"
                >
                  {busy === r._id ? 'Saving...' : 'Mark Attended'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function NgoEventsPage() {
  const inputRef = useRef();

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ upcomingEvents: 0, completedEvents: 0, totalRsvps: 0, totalGuests: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cover, setCover] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [highlightInput, setHighlightInput] = useState('');

  const [form, setForm] = useState({
    title: '',
    category: '',
    shortDescription: '',
    description: '',
    venue: '',
    address: '',
    district: '',
    startDate: '',
    startTime: '',
    endTime: '',
    capacity: '',
    isFree: true,
    ticketPrice: '',
    highlights: [],
  });

  const loadData = async () => {
    try {
      const [mine, s] = await Promise.all([
        eventService.getMine(),
        eventService.getNgoStats(),
      ]);
      setEvents(mine.data.events);
      setStats(s.data);
    } catch {
      setEvents([]);
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

  const addHighlight = () => {
    const clean = highlightInput.trim();
    if (!clean || form.highlights.length >= 6) return;
    update('highlights', form.highlights.concat([clean]));
    setHighlightInput('');
  };

  const removeHighlight = (h) => {
    update('highlights', form.highlights.filter(function (x) { return x !== h; }));
  };

  const isValid = form.title && form.category && form.shortDescription && form.description &&
    form.venue && form.address && form.district && form.startDate && form.startTime && cover;

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('shortDescription', form.shortDescription);
      fd.append('description', form.description);
      fd.append('venue', form.venue);
      fd.append('address', form.address);
      fd.append('district', form.district);
      fd.append('startDate', form.startDate);
      fd.append('startTime', form.startTime);
      if (form.endTime) fd.append('endTime', form.endTime);
      if (form.capacity) fd.append('capacity', form.capacity);
      fd.append('isFree', form.isFree);
      if (!form.isFree && form.ticketPrice) fd.append('ticketPrice', form.ticketPrice);
      fd.append('highlights', JSON.stringify(form.highlights));
      fd.append('photos', cover);

      await eventService.create(fd);

      setShowForm(false);
      setForm({
        title: '', category: '', shortDescription: '', description: '',
        venue: '', address: '', district: '', startDate: '', startTime: '',
        endTime: '', capacity: '', isFree: true, ticketPrice: '', highlights: [],
      });
      setCover(null);
      setLoading(true);
      await loadData();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  const statCards = [
    { label: 'Upcoming', value: stats.upcomingEvents, Icon: Calendar },
    { label: 'Completed', value: stats.completedEvents, Icon: Check },
    { label: 'Total RSVPs', value: stats.totalRsvps, Icon: Users },
    { label: 'Total Guests', value: stats.totalGuests, Icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-ink">Events</h1>
            <p className="text-gray-500 text-sm">
              Publish events and manage who is attending.
            </p>
          </div>
          <Button
            variant="primary"
            icon={showForm ? X : Plus}
            className="shrink-0"
            onClick={function () { setShowForm(!showForm); }}
          >
            {showForm ? 'Cancel' : 'New Event'}
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
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

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-5">
            <h2 className="font-bold text-ink">Create an Event</h2>

            {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{error}</div>}

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
                  </div>
                )}
                <input ref={inputRef} type="file" accept="image/*"
                  onChange={function (e) { setCover(e.target.files[0]); }} className="hidden" />
              </div>
            </div>

            <Input label="Event title" value={form.title}
              onChange={function (e) { update('title', e.target.value); }}
              placeholder="e.g. Kathmandu Adoption Fair 2026" />

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EVENT_CATEGORIES.map(function (c) {
                  const active = form.category === c.value;
                  return (
                    <button key={c.value} onClick={function () { update('category', c.value); }}
                      className={active
                        ? 'py-2.5 rounded-xl text-xs font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                        : 'py-2.5 rounded-xl text-xs font-bold border-2 border-gray-200 text-gray-600'}>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Short description</label>
              <textarea rows={2} maxLength={200} value={form.shortDescription}
                onChange={function (e) { update('shortDescription', e.target.value); }}
                placeholder="One line that appears on the event card"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none" />
              <p className="text-xs text-gray-400 mt-1">{form.shortDescription.length}/200</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Full description</label>
              <textarea rows={6} maxLength={3000} value={form.description}
                onChange={function (e) { update('description', e.target.value); }}
                placeholder="What happens at the event? What should attendees expect?"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none" />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/3000</p>
            </div>

            <Input label="Venue name" value={form.venue}
              onChange={function (e) { update('venue', e.target.value); }}
              placeholder="e.g. Bhrikutimandap Exhibition Ground" />

            <Input label="Address" value={form.address}
              onChange={function (e) { update('address', e.target.value); }}
              placeholder="e.g. Bhrikutimandap, Kathmandu" />

            <div>
              <label className="block text-sm font-bold text-ink mb-2">District</label>
              <select value={form.district}
                onChange={function (e) { update('district', e.target.value); }}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary bg-white text-ink outline-none">
                <option value="">Select district</option>
                {NEPAL_DISTRICTS.map(function (d) {
                  return <option key={d} value={d}>{d}</option>;
                })}
              </select>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Date</label>
                <input type="date" value={form.startDate}
                  onChange={function (e) { update('startDate', e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Start time</label>
                <input type="time" value={form.startTime}
                  onChange={function (e) { update('startTime', e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">End time</label>
                <input type="time" value={form.endTime}
                  onChange={function (e) { update('endTime', e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink" />
              </div>
            </div>

            <Input label="Capacity (leave blank for unlimited)" type="number" min="1" value={form.capacity}
              onChange={function (e) { update('capacity', e.target.value); }}
              placeholder="e.g. 200" />

            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isFree}
                  onChange={function (e) { update('isFree', e.target.checked); }}
                  className="w-4 h-4 accent-[#40916C]" />
                <span className="text-sm text-gray-600">This is a free event</span>
              </label>

              {!form.isFree && (
                <Input label="Ticket price (NPR)" type="number" min="0" value={form.ticketPrice}
                  onChange={function (e) { update('ticketPrice', e.target.value); }}
                  placeholder="e.g. 500" />
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-1">Highlights</label>
              <p className="text-xs text-gray-400 mb-3">Up to 6. What can attendees expect?</p>

              <div className="flex gap-2 mb-3">
                <input value={highlightInput}
                  onChange={function (e) { setHighlightInput(e.target.value); }}
                  onKeyDown={function (e) { if (e.key === 'Enter') { e.preventDefault(); addHighlight(); } }}
                  placeholder="e.g. Free vet consultation"
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink text-sm" />
                <button onClick={addHighlight}
                  disabled={!highlightInput.trim() || form.highlights.length >= 6}
                  className="px-4 rounded-xl border-2 border-gray-200 text-gray-600 disabled:opacity-40">
                  <Plus size={16} />
                </button>
              </div>

              {form.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.highlights.map(function (h) {
                    return (
                      <span key={h} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-dark text-xs font-bold">
                        {h}
                        <button onClick={function () { removeHighlight(h); }}>
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={function () { setShowForm(false); }}
                className="text-sm font-bold text-gray-400 hover:text-gray-600">
                Cancel
              </button>
              <Button variant="primary" loading={submitting} disabled={!isValid} onClick={handleSubmit}>
                Publish Event
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20"><Spinner size={40} /></div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-primary" />
            </div>
            <p className="font-bold text-ink mb-1">No events yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Publish an event to reach the community.
            </p>
            <Button variant="outline" size="sm" icon={Plus} onClick={function () { setShowForm(true); }}>
              Create Your First Event
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(function (e) {
              const cover2 = e.coverImage || {};
              const loc = e.location || {};
              const isExpanded = expandedEvent === e._id;
              const hasCapacity = e.capacity > 0;
              const fillPercent = hasCapacity ? Math.round((e.attendeeCount / e.capacity) * 100) : 0;
              const barWidth = { width: fillPercent + '%' };

              return (
                <div key={e._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      {cover2.url ? (
                        <img src={cover2.url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-primary-50 text-primary-dark text-xs font-bold mb-1">
                              {eventCategoryLabel(e.category)}
                            </span>
                            <p className="font-black text-ink truncate">{e.title}</p>
                          </div>
                          <Badge variant={statusVariant[e.status]}>{e.status}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {formatEventDate(e.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {e.startTime}
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <MapPin size={12} className="shrink-0" />
                            <span className="truncate">{loc.venue}</span>
                          </span>
                        </div>

                        {hasCapacity && (
                          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-1.5">
                            <div className="h-full rounded-full bg-primary" style={barWidth} />
                          </div>
                        )}
                        <p className="text-xs text-gray-400">
                          {e.attendeeCount} attending{hasCapacity ? ' of ' + e.capacity : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={function () { setExpandedEvent(isExpanded ? null : e._id); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-bold text-primary hover:bg-primary-50 transition-colors"
                      >
                        {isExpanded ? 'Hide attendees' : 'View attendees'}
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      <Link to={'/events/' + e._id} className="flex-1">
                        <button className="w-full py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50">
                          View Public Page
                        </button>
                      </Link>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
                      <AttendeeRoster eventId={e._id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}