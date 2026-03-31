import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useToast } from '../../contexts/ToastContext';
import { MapPin, Navigation, ArrowRight, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPage() {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  // Default center (Kerala, India)
  const defaultCenter = [10.0, 76.3];

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (position) {
      reverseGeocode(position[0], position[1]);
    }
  }, [position]);

  const reverseGeocode = async (lat, lng) => {
    setLoadingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await res.json();
      setAddress(data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    const newPos = [parseFloat(result.lat), parseFloat(result.lon)];
    setPosition(newPos);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    if (mapRef.current) {
      mapRef.current.flyTo(newPos, 15);
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        if (mapRef.current) {
          mapRef.current.flyTo(newPos, 15);
        }
        setLoadingGPS(false);
      },
      (err) => {
        toast.error('Unable to get your location. Please select manually.');
        setLoadingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleProceed = () => {
    if (position) {
      sessionStorage.setItem('orderLocation', JSON.stringify({
        lat: position[0],
        lng: position[1],
        address,
      }));
    } else {
      sessionStorage.removeItem('orderLocation');
    }
    navigate('/order-summary');
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Delivery Location</h1>
      <p className="text-muted mb-4">Tap on the map or use GPS to set location</p>

      <div className="location-actions" style={{ flexDirection: 'column' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search for an address..."
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchResults.length > 0 && (
            <ul style={{
              position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-bg)',
              zIndex: 1000, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-md)', listStyle: 'none', padding: 0, margin: '4px 0 0'
            }}>
              {searchResults.map(res => (
                <li
                  key={res.place_id}
                  onClick={() => handleSelectResult(res)}
                  style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
                >
                  {res.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="btn btn-secondary btn-full ripple"
          onClick={handleUseGPS}
          disabled={loadingGPS}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          id="use-gps-btn"
        >
          {loadingGPS ? (
            <div className="spinner spinner-sm" />
          ) : (
            <>
              <Navigation size={18} />
              Use My Current Location
            </>
          )}
        </button>
      </div>

      <div className="map-container">
        <MapContainer
          center={defaultCenter}
          zoom={10}
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      {position && (
        <div className="address-display animate-slide-up">
          <MapPin size={18} />
          <div>
            {loadingAddress ? (
              <span className="text-muted">Getting address...</span>
            ) : (
              address
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        <button
          className="btn btn-secondary btn-full ripple"
          onClick={handleProceed}
          id="skip-location"
        >
          Skip Location
        </button>
        <button
          className="btn btn-primary btn-full ripple"
          onClick={handleProceed}
          disabled={!position}
          id="proceed-to-summary"
        >
          <ArrowRight size={20} />
          Use Selected
        </button>
      </div>
    </div>
  );
}
