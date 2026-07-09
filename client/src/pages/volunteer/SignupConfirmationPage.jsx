import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2, Calendar, Clock, MapPin, Phone, ArrowLeft, Download,
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { formatTaskDate, categoryLabel } from '../../constants/task-options';
import { signupService } from '../../services/task.service';

export default function SignupConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const justSignedUp = location.state && location.state.justSignedUp;

  const [signup, setSignup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signupService.getById(id)
      .then(function (res) { setSignup(res.data.signup); })
      .catch(function () { setSignup(null); })
      .finally(function () { setLoading(false); });
  }, [id]);

  const downloadICS = () => {
    const task = signup.task;
    const start = new Date(task.startDate);
    const pad = function (n) { return String(n).padStart(2, '0'); };

    const startStr = start.getFullYear() + pad(start.getMonth() + 1) + pad(start.getDate());
    const startTimeStr = task.startTime.replace(':', '') + '00';
    const endTimeStr = (task.endTime || task.startTime).replace(':', '') + '00';

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PaluwaSathi//Volunteer//EN',
      'BEGIN:VEVENT',
      'UID:' + signup.confirmationNumber + '@paluwasathi.com',
      'DTSTART:' + startStr + 'T' + startTimeStr,
      'DTEND:' + startStr + 'T' + endTimeStr,
      'SUMMARY:' + task.title,
      'DESCRIPTION:Volunteer opportunity with ' + task.ngo.name,
      'LOCATION:' + task.location.address + ', ' + task.location.district,
      'END:VEVENT',
      'END:VCALENDAR',
    ];

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paluwasathi-' + signup.confirmationNumber + '.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size={40} />
        </div>
      </PageWrapper>
    );
  }

  if (!signup) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-black text-ink mb-2">Signup not found</h1>
          <Link to="/dashboard/volunteer" className="font-bold text-primary hover:underline">
            View my tasks
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const task = signup.task || {};
  const ngo = task.ngo || {};
  const location2 = task.location || {};
  const timeRange = task.endTime ? task.startTime + ' – ' + task.endTime : task.startTime;

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {justSignedUp && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black text-ink mb-2">You're signed up</h1>
            <p className="text-gray-500">
              {ngo.name} will contact you before the event with final details.
            </p>
          </div>
        )}

        {!justSignedUp && (
          <Link to="/dashboard/volunteer" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
            <ArrowLeft size={16} /> My volunteer tasks
          </Link>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-ink p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-white/60">Confirmation</p>
            <p className="text-xl font-black mt-1">{signup.confirmationNumber}</p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-dark text-xs font-bold mb-2">
                {categoryLabel(task.category)}
              </span>
              <h2 className="text-xl font-black text-ink">{task.title}</h2>
              <p className="text-sm text-gray-500">{ngo.name}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                  <p className="text-sm font-bold text-ink">{formatTaskDate(task.startDate)}</p>
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
                  <p className="text-xs font-bold text-gray-400 uppercase">Where to meet</p>
                  <p className="text-sm font-bold text-ink">{location2.address}</p>
                  <p className="text-xs text-gray-500">{location2.district}, Nepal</p>
                </div>
              </div>
            </div>

            {task.requirements && task.requirements.length > 0 && (
              <div className="p-4 rounded-xl bg-primary-50">
                <p className="text-xs font-bold text-primary-dark uppercase mb-2">Remember to bring</p>
                <ul className="space-y-1">
                  {task.requirements.map(function (r) {
                    return <li key={r} className="text-sm text-primary-dark">· {r}</li>;
                  })}
                </ul>
              </div>
            )}

            {ngo.phone && (
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100">
                <div className="min-w-0">
                  <p className="font-bold text-ink text-sm truncate">{ngo.name}</p>
                  <p className="text-xs text-gray-500">Questions before the event?</p>
                </div>
                <a
                  href={'tel:' + ngo.phone}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-bold shrink-0"
                >
                  <Phone size={15} /> Call
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button variant="primary" icon={Download} className="flex-1" onClick={downloadICS}>
            Add to Calendar
          </Button>
          <Link to="/volunteer" className="flex-1">
            <Button variant="outline" className="w-full">Find More Opportunities</Button>
          </Link>
        </div>

        <div className="text-center mt-6">
          <Link to="/dashboard/volunteer" className="text-sm font-bold text-primary hover:underline">
            View all my volunteer tasks
          </Link>
        </div>

      </div>
    </PageWrapper>
  );
}