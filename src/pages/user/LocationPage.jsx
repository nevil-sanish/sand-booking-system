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
    if (!position) {
      toast.warning('Please select a delivery location');
      return;
    }

    // Store location in session
    sessionStorage.setItem('orderLocation', JSON.stringify({
      lat: position[0],
      lng: position[1],
      address,
    }));

    navigate('/order-summary');
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Delivery Location</h1>
      <p className="text-muted mb-4">Tap on the map or use GPS to set location</p>

      <div className="location-actions">
        <button
          className="btn btn-secondary btn-full ripple"
          onClick={handleUseGPS}
          disabled={loadingGPS}
          id="use-gps-btn"
        >
          {loadingGPS ? (
            <div className="spinner spinner-sm" />
          ) : (
            <>
              <Navigation size={18} />
              Use My Location
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

      <button
        className="btn btn-primary btn-lg btn-full ripple mt-4"
        onClick={handleProceed}
        disabled={!position}
        id="proceed-to-summary"
      >
        <ArrowRight size={20} />
        Review Order
      </button>
    </div>
  );
}
