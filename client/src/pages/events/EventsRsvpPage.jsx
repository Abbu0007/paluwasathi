import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Ticket, PawPrint } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatEventDate, GUEST_OPTIONS } from '../../constants/event-options';
import { useAuth } from '../../context/AuthContext';
import { eventService, rsvpService } from '../../services/event.service';

export default function EventRsvpPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    guestCount: 1,
    bringingPet: false,
    petDetails: '',
    notes: '',
    agreed: false,
  });

  useEffect(() => {
    eventService.getById(id)
      .then(function (res) {
        const e = res.data.event;
        if (res.data.hasRsvped || e.status !== 'upcoming' || e.isPast) {
          navigate('/events/' + id);
          return;
        }
        setEvent(e);
      })
      .catch(function () { navigate('/events'); })
      .finally(function () { setLoading(false); });
  }, [id, navigate]);

  useEffect(() => {
    if (user) {
      setForm(function (prev) {
        return Object.assign({}, prev, {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        });
      });
    }
  }, [user]);

  const update = (field, value) => {
    setForm(function (prev) {
      return Object.assign({}, prev, { [field]: value });
    });
  };

  const isValid = form.name && form.email && form.phone && form.agreed;

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const res = await rsvpService.create({
        eventId: id,
        attendeeInfo: { name: form.name, email: form.email, phone: form.phone },
        guestCount: form.guestCount,
        bringingPet: form.bringingPet,
        petDetails: form.petDetails,
        notes: form.notes,
      });

      navigate('/events/ticket/' + res.data.rsvp._id, { state: { justRsvped: true } });
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Failed to RSVP. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center"><Spinner size={40} /></div>
      </PageWrapper>
    );
  }

  const organiser = (event && event.organiser) || {};
  const location = (event && event.location) || {};
  const cover = (event && event.coverImage) || {};
  const timeRange = event.endTime ? event.startTime + ' – ' + event.endTime : event.startTime;
  const hasCapacity = event.capacity > 0;
  const totalCost = event.isFree ? 0 : event.ticketPrice * form.guestCount;

  const maxGuests = hasCapacity ? Math.min(5, event.spotsLeft) : 5;
  const guestChoices = GUEST_OPTIONS.filter(function (g) { return g <= maxGuests; });

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to={'/events/' + id} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to event
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-start gap-4">
            {cover.url && (
              <img src={cover.url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-400 uppercase">RSVPing to</p>
              <p className="font-black text-ink">{event.title}</p>
              <p className="text-sm text-gray-500 mb-2">{organiser.name}</p>

              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {formatEventDate(event.startDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {timeRange}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {location.venue}
                </span>
              </div>
            </div>
          </div>

          {hasCapacity && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
              <Users size={14} className="text-primary" />
              <p className="text-sm text-gray-600">
                <span className="font-bold text-ink">{event.spotsLeft}</span> of {event.capacity} spots remaining
              </p>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-5">
          <div>
            <h1 className="text-xl font-black text-ink mb-1">Your details</h1>
            <p className="text-gray-500 text-sm">
              {organiser.name} will use this to contact you about the event.
            </p>
          </div>

          <Input label="Full name" value={form.name}
            onChange={function (e) { update('name', e.target.value); }} />

          <Input label="Email" type="email" value={form.email}
            onChange={function (e) { update('email', e.target.value); }} />

          <Input label="Phone" value={form.phone}
            onChange={function (e) { update('phone', e.target.value); }} />

          <div>
            <label className="block text-sm font-bold text-ink mb-2">How many people?</label>
            <div className="grid grid-cols-5 gap-2">
              {guestChoices.map(function (g) {
                const active = form.guestCount === g;
                return (
                  <button
                    key={g}
                    onClick={function () { update('guestCount', g); }}
                    className={active
                      ? 'py-3 rounded-xl text-sm font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                      : 'py-3 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-600'}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1">Including yourself</p>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer p-4 rounded-xl bg-gray-50">
            <input
              type="checkbox"
              checked={form.bringingPet}
              onChange={function (e) { update('bringingPet', e.target.checked); }}
              className="mt-0.5 w-4 h-4 accent-[#40916C]"
            />
            <div>
              <span className="text-sm font-bold text-ink flex items-center gap-1.5">
                <PawPrint size={14} /> I'm bringing a pet
              </span>
              <span className="text-xs text-gray-500">
                Organisers need to know how many animals will be present.
              </span>
            </div>
          </label>

          {form.bringingPet && (
            <Input label="Tell us about your pet" value={form.petDetails}
              onChange={function (e) { update('petDetails', e.target.value); }}
              placeholder="e.g. One medium dog, friendly, on a lead" />
          )}

          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              Anything the organiser should know? (optional)
            </label>
            <textarea
              rows={2}
              maxLength={300}
              value={form.notes}
              onChange={function (e) { update('notes', e.target.value); }}
              placeholder="Accessibility needs, arrival time, questions"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none"
            />
          </div>

          {!event.isFree && (
            <div className="p-4 rounded-xl border-2 border-gray-200 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Ticket × {form.guestCount}
                </span>
                <span className="font-bold text-ink">NPR {event.ticketPrice * form.guestCount}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="font-bold text-ink flex items-center gap-1.5">
                  <Ticket size={15} /> Total
                </span>
                <span className="font-black text-ink text-lg">NPR {totalCost}</span>
              </div>
              <p className="text-xs text-gray-400 pt-1">
                Payment collected at the venue. This RSVP reserves your place.
              </p>
            </div>
          )}

          <label className="flex items-start gap-2.5 cursor-pointer p-4 rounded-xl bg-primary-50">
            <input
              type="checkbox"
              checked={form.agreed}
              onChange={function (e) { update('agreed', e.target.checked); }}
              className="mt-0.5 w-4 h-4 accent-[#40916C]"
            />
            <span className="text-sm text-primary-dark">
              I commit to attending. If my plans change I will cancel so the spot
              opens for someone else.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 mt-6">
          <Link to={'/events/' + id} className="text-sm font-bold text-gray-400 hover:text-gray-600">
            Cancel
          </Link>
          <Button variant="primary" size="lg" loading={submitting} disabled={!isValid} onClick={handleSubmit}>
            Confirm RSVP
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}