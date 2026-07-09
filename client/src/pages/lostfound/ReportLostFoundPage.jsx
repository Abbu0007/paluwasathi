import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { ArrowLeft, Upload, X, MapPin, LocateFixed, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import {
  REPORT_TYPES, SPECIES_OPTIONS, SIZE_OPTIONS,
  GENDER_OPTIONS, COMMON_COLORS,
} from '../../constants/lostfound-options';
import { NEPAL_DISTRICTS } from '../../constants/nepal-districts';
import { useAuth } from '../../context/AuthContext';
import { lostFoundService } from '../../services/lostfound.service';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, onMove }) {
  useMapEvents({
    click(e) { onMove(e.latlng.lat, e.latlng.lng); },
  });
  if (!position) return null;
  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend(e) {
          const m = e.target.getLatLng();
          onMove(m.lat, m.lng);
        },
      }}
    />
  );
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

export default function ReportLostFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef();

  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const [form, setForm] = useState({
    type: '',
    petName: '',
    species: '',
    breed: '',
    color: '',
    size: 'medium',
    gender: 'unknown',
    age: '',
    distinctiveMarks: '',
    hasCollar: false,
    collarDescription: '',
    isMicrochipped: false,
    address: '',
    district: '',
    lat: null,
    lng: null,
    date: new Date().toISOString().split('T')[0],
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    reward: '',
  });

  useEffect(() => {
    if (user) {
      setForm(function (prev) {
        return Object.assign({}, prev, {
          contactName: user.name || '',
          contactPhone: user.phone || '',
          contactEmail: user.email || '',
          district: user.district || '',
        });
      });
    }
  }, [user]);

  const update = (field, value) => {
    setForm(function (prev) {
      return Object.assign({}, prev, { [field]: value });
    });
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(photos.concat(files).slice(0, 5));
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter(function (_, i) { return i !== index; }));
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lng + '&format=json');
      const data = await res.json();
      return data.display_name || lat.toFixed(5) + ', ' + lng.toFixed(5);
    } catch {
      return lat.toFixed(5) + ', ' + lng.toFixed(5);
    }
  };

  const handleMove = async (lat, lng) => {
    const address = await reverseGeocode(lat, lng);
    setForm(function (prev) {
      return Object.assign({}, prev, { lat, lng, address });
    });
  };

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      function (pos) { handleMove(pos.coords.latitude, pos.coords.longitude); },
      function () { alert('Could not detect location. Tap the map to set it manually.'); }
    );
  };

  const searchLocation = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query) + '&format=json&limit=1');
      const data = await res.json();
      if (data.length > 0) {
        setForm(function (prev) {
          return Object.assign({}, prev, {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            address: data[0].display_name,
          });
        });
      } else {
        alert('Location not found.');
      }
    } catch {
      alert('Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const isValid = form.type && form.species && form.color && form.lat &&
    form.address && form.district && form.date && form.contactName &&
    form.contactPhone && photos.length > 0;

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.keys(form).forEach(function (key) {
        if (form[key] !== null && form[key] !== '') {
          fd.append(key, form[key]);
        }
      });
      photos.forEach(function (file) { fd.append('photos', file); });

      const res = await lostFoundService.create(fd);
      navigate('/lost-found/' + res.data.report._id, {
        state: { justCreated: true, matchCount: res.data.matches.length },
      });
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      setError(msg || 'Failed to submit report.');
      setSubmitting(false);
    }
  };

  const center = form.lat && form.lng ? [form.lat, form.lng] : [27.7172, 85.3240];
  const isLost = form.type === 'lost';

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/lost-found" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 mb-6">
          <ArrowLeft size={16} /> Back to lost & found
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-ink">Report a Pet</h1>
          <p className="text-gray-500 text-sm">
            We will automatically check for matching reports nearby.
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <label className="block text-sm font-bold text-ink mb-3">What are you reporting?</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {REPORT_TYPES.map(function (t) {
              const active = form.type === t.value;
              const isLostOpt = t.value === 'lost';
              let btnClass = 'text-left p-5 rounded-xl border-2 transition-all border-gray-200';
              if (active && isLostOpt) btnClass = 'text-left p-5 rounded-xl border-2 border-danger bg-red-50';
              else if (active) btnClass = 'text-left p-5 rounded-xl border-2 border-primary bg-primary-50';

              return (
                <button key={t.value} onClick={function () { update('type', t.value); }} className={btnClass}>
                  <p className="font-black text-ink">{t.label}</p>
                  <p className="text-sm text-gray-500">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {form.type && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
              <h2 className="font-bold text-ink mb-4">Photos</h2>
              <div
                onClick={function () { inputRef.current.click(); }}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload size={22} className="text-primary mx-auto mb-2" />
                <p className="font-bold text-ink text-sm">Upload photos</p>
                <p className="text-xs text-gray-400 mt-1">Clear photos help people recognise the animal</p>
                <input ref={inputRef} type="file" accept="image/*" multiple
                  onChange={handleFiles} className="hidden" />
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {photos.map(function (file, i) {
                    return (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={function () { removePhoto(i); }}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">{photos.length}/5 photos</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 space-y-5">
              <h2 className="font-bold text-ink">About the animal</h2>

              {isLost && (
                <Input label="Pet's name" value={form.petName}
                  onChange={function (e) { update('petName', e.target.value); }}
                  placeholder="e.g. Kaalu" />
              )}

              <div>
                <label className="block text-sm font-bold text-ink mb-2">Species</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {SPECIES_OPTIONS.map(function (s) {
                    const active = form.species === s.value;
                    return (
                      <button key={s.value} onClick={function () { update('species', s.value); }}
                        className={active
                          ? 'py-2.5 rounded-xl text-sm font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                          : 'py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-600'}>
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Input label="Breed (if known)" value={form.breed}
                onChange={function (e) { update('breed', e.target.value); }}
                placeholder="e.g. Nepali Street Dog" />

              <div>
                <label className="block text-sm font-bold text-ink mb-2">Colour</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_COLORS.map(function (c) {
                    const active = form.color === c;
                    return (
                      <button key={c} onClick={function () { update('color', c); }}
                        className={active
                          ? 'px-3.5 py-1.5 rounded-full text-xs font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                          : 'px-3.5 py-1.5 rounded-full text-xs font-bold border-2 border-gray-200 text-gray-600'}>
                        {c}
                      </button>
                    );
                  })}
                </div>
                <input value={form.color}
                  onChange={function (e) { update('color', e.target.value); }}
                  placeholder="Or type a custom colour"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZE_OPTIONS.map(function (s) {
                      const active = form.size === s.value;
                      return (
                        <button key={s.value} onClick={function () { update('size', s.value); }}
                          className={active
                            ? 'py-2.5 rounded-xl text-xs font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                            : 'py-2.5 rounded-xl text-xs font-bold border-2 border-gray-200 text-gray-600'}>
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-2">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GENDER_OPTIONS.map(function (g) {
                      const active = form.gender === g.value;
                      return (
                        <button key={g.value} onClick={function () { update('gender', g.value); }}
                          className={active
                            ? 'py-2.5 rounded-xl text-xs font-bold border-2 border-primary bg-primary-50 text-primary-dark'
                            : 'py-2.5 rounded-xl text-xs font-bold border-2 border-gray-200 text-gray-600'}>
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Input label="Approximate age" value={form.age}
                onChange={function (e) { update('age', e.target.value); }}
                placeholder="e.g. 3 years, or Puppy" />

              <div>
                <label className="block text-sm font-bold text-ink mb-2">Distinctive marks</label>
                <textarea rows={2} value={form.distinctiveMarks}
                  onChange={function (e) { update('distinctiveMarks', e.target.value); }}
                  placeholder="Scars, unusual markings, torn ear, limp"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none" />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.hasCollar}
                  onChange={function (e) { update('hasCollar', e.target.checked); }}
                  className="w-4 h-4 accent-[#40916C]" />
                <span className="text-sm text-gray-600">Wearing a collar</span>
              </label>

              {form.hasCollar && (
                <Input label="Collar description" value={form.collarDescription}
                  onChange={function (e) { update('collarDescription', e.target.value); }}
                  placeholder="e.g. Red leather, brass tag" />
              )}

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isMicrochipped}
                  onChange={function (e) { update('isMicrochipped', e.target.checked); }}
                  className="w-4 h-4 accent-[#40916C]" />
                <span className="text-sm text-gray-600">Microchipped</span>
              </label>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 space-y-5">
              <h2 className="font-bold text-ink">
                {isLost ? 'Where was your pet last seen?' : 'Where did you find the animal?'}
              </h2>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={query}
                    onChange={function (e) { setQuery(e.target.value); }}
                    onKeyDown={function (e) { if (e.key === 'Enter') searchLocation(); }}
                    placeholder="Search area"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink" />
                </div>
                <button onClick={searchLocation} disabled={searching}
                  className="px-5 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50">
                  {searching ? '...' : 'Search'}
                </button>
              </div>

              <button onClick={detectLocation} className="flex items-center gap-2 text-sm font-bold text-primary">
                <LocateFixed size={16} /> Use my current location
              </button>

              <div className="rounded-2xl overflow-hidden border-2 border-gray-200 h-[280px]">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                  <LocationMarker position={form.lat ? [form.lat, form.lng] : null} onMove={handleMove} />
                  <RecenterMap lat={form.lat} lng={form.lng} />
                </MapContainer>
              </div>

              {form.address && (
                <div className="flex items-start gap-2 p-4 rounded-xl bg-primary-50">
                  <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-primary-dark font-medium">{form.address}</p>
                </div>
              )}

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

              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  {isLost ? 'Date last seen' : 'Date found'}
                </label>
                <input type="date" value={form.date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={function (e) { update('date', e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink" />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">Details</label>
                <textarea rows={4} maxLength={1000} value={form.description}
                  onChange={function (e) { update('description', e.target.value); }}
                  placeholder={isLost
                    ? 'Circumstances, behaviour, anything that helps identify them'
                    : 'Condition of the animal, where exactly you found them, current whereabouts'}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink resize-none" />
                <p className="text-xs text-gray-400 mt-1">{form.description.length}/1000</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-4">
              <h2 className="font-bold text-ink">Contact details</h2>

              <Input label="Your name" value={form.contactName}
                onChange={function (e) { update('contactName', e.target.value); }} />

              <Input label="Phone" value={form.contactPhone}
                onChange={function (e) { update('contactPhone', e.target.value); }} />

              <Input label="Email (optional)" type="email" value={form.contactEmail}
                onChange={function (e) { update('contactEmail', e.target.value); }} />

              {isLost && (
                <Input label="Reward (optional, NPR)" type="number" min="0" value={form.reward}
                  onChange={function (e) { update('reward', e.target.value); }}
                  placeholder="Leave blank if none" />
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <Link to="/lost-found" className="text-sm font-bold text-gray-400 hover:text-gray-600">
                Cancel
              </Link>
              <Button variant="primary" size="lg" loading={submitting} disabled={!isValid} onClick={handleSubmit}>
                Submit Report
              </Button>
            </div>

            {!isValid && (
              <p className="text-xs text-gray-400 text-right mt-2">
                Type, species, colour, location, date, contact details and a photo are required.
              </p>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}