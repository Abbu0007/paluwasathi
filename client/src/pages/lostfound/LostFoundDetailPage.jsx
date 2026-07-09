import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import {
  ArrowLeft, MapPin, Calendar, Phone, Mail, Gift, CheckCircle2,
  Sparkles, ArrowRight, Heart,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { matchStrength } from '../../constants/lostfound-options';
import { useAuth } from '../../context/AuthContext';
import { lostFoundService } from '../../services/lostfound.service';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LostFoundDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const routeState = useLocation().state;
  const { user } = useAuth();

  const justCreated = routeState && routeState.justCreated;

  const [report, setReport] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [busy, setBusy] = useState(false);

  const loadData = async () => {
    try {
      const res = await lostFoundService.getById(id);
      setReport(res.data.report);
      setMatches(res.data.matches);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleReunited = async (matchedWithId) => {
    const confirmed = window.confirm('Mark this pet as reunited? Both reports will be closed.');
    if (!confirmed) return;

    setBusy(true);
    try {
      await lostFoundService.markReunited(id, matchedWithId);
      await loadData();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      alert(msg || 'Failed to update.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center"><Spinner size={40} /></div>
      </PageWrapper>
    );
  }

  if (!report) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-black text-ink mb-2">Report not found</h1>
          <Link to="/lost-found" className="font-bold text-primary hover:underline">
            Browse all reports
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const photos = report.photos || [];
  const loc = report.location || {};
  const isLost = report.type === 'lost';
  const isReunited = report.status === 'reunited';
  const isOwner = user && report.reportedBy && report.reportedBy._id === user._id;

  const typeBadgeClass = isLost
    ? 'inline-block px-4 py-1.5 rounded-full bg-danger text-white text-sm font-bold'
    : 'inline-block px-4 py-1.5 rounded-full bg-primary text-white text-sm font-bold';

  const details = [
    { label: 'Species', value: report.species },
    { label: 'Colour', value: report.color },
    { label: 'Breed', value: report.breed || 'Unknown' },
    { label: 'Size', value: report.size },
    { label: 'Gender', value: report.gender },
    { label: 'Age', value: report.age || 'Unknown' },
  ];

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {justCreated && (
          <div className="bg-primary-50 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <CheckCircle2 size={24} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-primary-dark">Report submitted</p>
              <p className="text-sm text-primary-dark mt-0.5">
                {matches.length > 0
                  ? 'We found ' + matches.length + ' possible match' + (matches.length !== 1 ? 'es' : '') + ' nearby. Check below.'
                  : 'No matches found yet. We will keep checking as new reports come in.'}
              </p>
            </div>
          </div>
        )}

        <Link to="/lost-found" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to lost & found
        </Link>

        {matches.length > 0 && !isReunited && (
          <div className="bg-white rounded-2xl border-2 border-primary p-6 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-primary" />
              <h2 className="font-black text-ink">
                {matches.length} possible match{matches.length !== 1 ? 'es' : ''} nearby
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              These {isLost ? 'found' : 'lost'} reports are within 5km and share key characteristics.
            </p>

            <div className="space-y-3">
              {matches.map(function (m) {
                const mr = m.report;
                const mPhotos = mr.photos || [];
                const strength = matchStrength(m.score);

                return (
                  <div key={mr._id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                    {mPhotos[0] ? (
                      <img src={mPhotos[0].url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-200 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-ink truncate">
                          {mr.petName || mr.color + ' ' + mr.species}
                        </p>
                        <Badge variant={strength.color === 'primary' ? 'stable' : 'new'}>
                          {strength.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{mr.location.address}</p>
                      <p className="text-xs text-primary font-bold mt-1">
                        {m.distanceKm} km away
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <Link to={'/lost-found/' + mr._id}>
                        <button className="px-4 py-2 rounded-full border-2 border-gray-200 text-gray-600 text-xs font-bold hover:bg-white">
                          View
                        </button>
                      </Link>
                      {isOwner && (
                        <button
                          onClick={function () { handleReunited(mr._id); }}
                          disabled={busy}
                          className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold disabled:opacity-50"
                        >
                          This is them
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3">
                {photos[activePhoto] ? (
                  <img src={photos[activePhoto].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No photo</div>
                )}
              </div>

              {photos.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {photos.map(function (p, i) {
                    const thumbClass = activePhoto === i
                      ? 'aspect-square rounded-lg overflow-hidden border-2 border-primary'
                      : 'aspect-square rounded-lg overflow-hidden border-2 border-transparent';
                    return (
                      <button key={i} onClick={function () { setActivePhoto(i); }} className={thumbClass}>
                        <img src={p.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className={typeBadgeClass}>{isLost ? 'LOST' : 'FOUND'}</span>
                  <h1 className="text-2xl sm:text-3xl font-black text-ink mt-3">
                    {report.petName || report.color + ' ' + report.species}
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">{report.reportNumber}</p>
                </div>
                {isReunited && (
                  <Badge variant="stable">Reunited</Badge>
                )}
              </div>

              {report.reward > 0 && !isReunited && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-accent/10 mb-5">
                  <Gift size={18} className="text-accent shrink-0" />
                  <p className="text-sm font-bold text-accent-dark">
                    NPR {report.reward.toLocaleString('en-IN')} reward offered
                  </p>
                </div>
              )}

              {report.description && (
                <p className="text-gray-600 leading-relaxed mb-6">{report.description}</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {details.map(function (d) {
                  return (
                    <div key={d.label} className="p-3 rounded-xl bg-gray-50">
                      <p className="text-xs text-gray-400">{d.label}</p>
                      <p className="text-sm font-bold text-ink capitalize">{d.value}</p>
                    </div>
                  );
                })}
              </div>

              {report.distinctiveMarks && (
                <div className="mt-4 p-4 rounded-xl bg-primary-50">
                  <p className="text-xs font-bold text-primary-dark uppercase mb-1">Distinctive marks</p>
                  <p className="text-sm text-primary-dark">{report.distinctiveMarks}</p>
                </div>
              )}

              {report.hasCollar && (
                <div className="mt-3 p-4 rounded-xl bg-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Collar</p>
                  <p className="text-sm text-ink">{report.collarDescription || 'Wearing a collar'}</p>
                </div>
              )}

              {report.isMicrochipped && (
                <p className="text-sm font-bold text-primary mt-3">Microchipped</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-ink mb-4">
                {isLost ? 'Last seen here' : 'Found here'}
              </h2>

              <div className="h-[280px] rounded-xl overflow-hidden mb-4">
                <MapContainer center={[loc.lat, loc.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[loc.lat, loc.lng]} />
                </MapContainer>
              </div>

              <div className="flex items-start gap-2 mb-3">
                <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600">{loc.address}</p>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400 shrink-0" />
                <p className="text-sm text-gray-600">
                  {new Date(report.date).toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  <span className="text-gray-400"> · {report.daysAgo} days ago</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="lg:sticky lg:top-[88px] space-y-6">

              {isReunited ? (
                <div className="bg-primary-50 rounded-2xl p-6 text-center">
                  <Heart size={32} className="text-primary mx-auto mb-3" />
                  <p className="font-black text-ink mb-1">Reunited</p>
                  <p className="text-sm text-gray-600 mb-4">
                    This pet found their way home.
                  </p>
                  <Link to="/lost-found">
                    <Button variant="outline" size="sm" className="w-full">
                      View other reports
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                    {isLost ? 'Seen this pet?' : 'Is this your pet?'}
                  </p>
                  <p className="text-sm text-gray-600 mb-5">
                    Contact {report.contactName} directly.
                  </p>

                  <a
                    href={'tel:' + report.contactPhone}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-primary text-white text-sm font-bold mb-2 hover:bg-primary-dark"
                  >
                    <Phone size={16} /> {report.contactPhone}
                  </a>

                  {report.contactEmail && (
                    <a
                      href={'mailto:' + report.contactEmail}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50"
                    >
                      <Mail size={16} /> Send email
                    </a>
                  )}

                  {isOwner && (
                    <button
                      onClick={function () { handleReunited(null); }}
                      disabled={busy}
                      className="w-full mt-4 pt-4 border-t border-gray-100 text-sm font-bold text-primary hover:underline disabled:opacity-50"
                    >
                      {busy ? 'Updating...' : 'Mark as reunited'}
                    </button>
                  )}
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Have you seen a pet?</p>
                <p className="text-sm text-gray-600 mb-4">
                  Report it and we will match it against missing pets nearby.
                </p>
                <Link to="/lost-found/report">
                  <Button variant="outline" size="sm" className="w-full" iconRight={ArrowRight}>
                    Report a Pet
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}