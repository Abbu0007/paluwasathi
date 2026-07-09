import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import {
  CheckCircle2, Phone, MessageCircle, ArrowLeft, MapPin, Clock,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STAGES = [
  { key: 'reported', label: 'Reported' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'en_route', label: 'En Route' },
  { key: 'on_scene', label: 'On Scene' },
  { key: 'rescued', label: 'Rescued' },
];

const urgencyVariant = { critical: 'critical', high: 'high', moderate: 'stable' };

export default function CaseTrackingPage() {
  const { id } = useParams();
  const location = useLocation();
  const justCreated = location.state?.justCreated;

  const [rescue, setRescue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchRescue = async () => {
      try {
        const { data } = await api.get(`/rescues/${id}`);
        if (active) setRescue(data.rescue);
      } catch {
        // handled by empty state
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchRescue();
    const poll = setInterval(fetchRescue, 30000); // poll every 30s
    return () => { active = false; clearInterval(poll); };
  }, [id]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size={40} />
        </div>
      </PageWrapper>
    );
  }

  if (!rescue) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-black text-ink mb-2">Case not found</h1>
          <p className="text-gray-500 mb-6">This rescue case doesn't exist or was removed.</p>
          <Link to="/dashboard" className="font-bold text-primary hover:underline">
            Back to dashboard
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === rescue.status);

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {justCreated && (
          <div className="bg-primary-50 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 size={22} className="text-primary shrink-0" />
            <div>
              <p className="font-bold text-primary-dark">Rescue reported successfully!</p>
              <p className="text-sm text-primary-dark/80">
                Case {rescue.caseNumber} — volunteers in the area are being notified.
              </p>
            </div>
          </div>
        )}

        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-4">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Case Number</p>
                  <h1 className="text-xl font-black text-ink">{rescue.caseNumber}</h1>
                </div>
                <Badge variant={urgencyVariant[rescue.urgency]}>
                  {rescue.urgency.toUpperCase()}
                </Badge>
              </div>

              {/* Photo + Map */}
              <div className="grid grid-cols-2 gap-3">
                {rescue.photos?.[0] ? (
                  <img
                    src={rescue.photos[0].url}
                    alt="Rescue"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                    No photo
                  </div>
                )}
                <div className="h-40 rounded-xl overflow-hidden">
                  <MapContainer
                    center={[rescue.location.lat, rescue.location.lng]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    dragging={false}
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[rescue.location.lat, rescue.location.lng]} />
                  </MapContainer>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-4">
                <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600">{rescue.location.address}</p>
              </div>
            </div>

            {/* Progress tracker */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-ink mb-6">Rescue Progress</h2>
              <div className="flex justify-between mb-2">
                {STAGES.map((stage, i) => (
                  <div key={stage.key} className="flex flex-col items-center flex-1">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      i <= currentStageIndex ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i < currentStageIndex ? <CheckCircle2 size={18} /> : i + 1}
                    </span>
                    <span className={`text-xs mt-2 text-center ${
                      i <= currentStageIndex ? 'text-ink font-bold' : 'text-gray-400'
                    }`}>
                      {stage.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-ink mb-4">Activity Timeline</h2>
              <div className="space-y-4">
                {rescue.timeline?.slice().reverse().map((entry, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
                      {i < rescue.timeline.length - 1 && <span className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-bold text-ink">{entry.message}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={12} />
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {rescue.assignedVolunteer ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Assigned Volunteer</p>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center">
                    {rescue.assignedVolunteer.name?.[0]}
                  </span>
                  <div>
                    <p className="font-bold text-ink">{rescue.assignedVolunteer.name}</p>
                    <p className="text-xs text-gray-500">Volunteer</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${rescue.assignedVolunteer.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-primary text-white text-sm font-bold">
                    <Phone size={16} /> Call
                  </a>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold">
                    <MessageCircle size={16} /> Message
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <p className="text-sm text-gray-500">
                  Waiting for a volunteer to accept this case. You'll be notified when someone responds.
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Case Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Animal</span>
                  <span className="font-bold text-ink capitalize">{rescue.animalType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-bold text-ink capitalize">{rescue.status.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reported</span>
                  <span className="font-bold text-ink">{new Date(rescue.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}