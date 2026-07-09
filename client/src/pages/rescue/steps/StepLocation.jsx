import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, Search, LocateFixed } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in Leaflet + bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, onMove }) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return position ? (
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
  ) : null;
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

export default function StepLocation({ location, onChange }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const center = location.lat && location.lng
    ? [location.lat, location.lng]
    : [27.7172, 85.3240]; // Kathmandu default

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  const handleMove = async (lat, lng) => {
    const address = await reverseGeocode(lat, lng);
    onChange({ lat, lng, address });
  };

  const detectLocation = () => {
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await handleMove(pos.coords.latitude, pos.coords.longitude);
        setDetecting(false);
      },
      () => {
        setDetecting(false);
        alert('Could not detect location. Please tap the map to set it manually.');
      }
    );
  };

  const searchLocation = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        onChange({ lat: parseFloat(lat), lng: parseFloat(lon), address: display_name });
      } else {
        alert('Location not found. Try a different search.');
      }
    } catch {
      alert('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-black text-ink mb-2">Where is the animal?</h2>
      <p className="text-gray-500 text-sm mb-6">
        Set the exact location so volunteers can reach the animal quickly.
      </p>

      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
            placeholder="Search area, e.g. Baneshwor"
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-ink"
          />
        </div>
        <button
          onClick={searchLocation}
          disabled={searching}
          className="px-5 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50"
        >
          {searching ? '...' : 'Search'}
        </button>
      </div>

      <button
        onClick={detectLocation}
        disabled={detecting}
        className="flex items-center gap-2 mb-4 text-sm font-bold text-primary disabled:opacity-50"
      >
        <LocateFixed size={16} />
        {detecting ? 'Detecting...' : 'Use my current location'}
      </button>

      <div className="rounded-2xl overflow-hidden border-2 border-gray-200 h-[300px]">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          <LocationMarker
            position={location.lat ? [location.lat, location.lng] : null}
            onMove={handleMove}
          />
          <RecenterMap lat={location.lat} lng={location.lng} />
        </MapContainer>
      </div>

      <p className="text-xs text-gray-400 mt-2">Tap the map or drag the pin to set exact location.</p>

      {location.address && (
        <div className="flex items-start gap-2 mt-4 p-4 rounded-xl bg-primary-50">
          <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-primary-dark font-medium">{location.address}</p>
        </div>
      )}
    </div>
  );
}