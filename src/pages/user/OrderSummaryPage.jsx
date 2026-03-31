import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../../contexts/ToastContext';
import { formatPrice } from '../../utils/formatters';
import { MapPin, Clock, Package, CheckCircle, Send, Navigation, Search, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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

function FlyToPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);
  return null;
}

export default function OrderSummaryPage() {
  const [location, setLocation] = useState(null);
  const [timeNeeded, setTimeNeeded] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const { cartItems, totalPrice, clearCart, isEmpty } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders(user?.id);
  const toast = useToast();
  const navigate = useNavigate();

  const defaultCenter = [10.0, 76.3];

  useEffect(() => {
    const stored = sessionStorage.getItem('orderLocation');
    if (stored) {
      const loc = JSON.parse(stored);
      setLocation(loc);
      setMapPosition([loc.lat, loc.lng]);
      setAddress(loc.address);
    }
  }, []);

  useEffect(() => {
    if (isEmpty && !success) {
      navigate('/cart');
    }
  }, [isEmpty, success, navigate]);

  // Reverse geocode when map position changes
  useEffect(() => {
    if (mapPosition) {
      reverseGeocode(mapPosition[0], mapPosition[1]);
    }
  }, [mapPosition]);

  const reverseGeocode = async (lat, lng) => {
    setLoadingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await res.json();
      const addr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(addr);
      setLocation({ lat, lng: lng, address: addr });
    } catch {
      const addr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(addr);
      setLocation({ lat, lng, address: addr });
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
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
    }, 400);
  };

  const handleSelectResult = (result) => {
    const newPos = [parseFloat(result.lat), parseFloat(result.lon)];
    setMapPosition(newPos);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    if (!showMap) setShowMap(true);
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
        setMapPosition(newPos);
        if (!showMap) setShowMap(true);
        setLoadingGPS(false);
      },
      () => {
        toast.error('Unable to get your location. Please search manually.');
        setLoadingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClearLocation = () => {
    setLocation(null);
    setMapPosition(null);
    setAddress('');
    setSearchQuery('');
    setShowMap(false);
    sessionStorage.removeItem('orderLocation');
  };

  const handlePlaceOrder = async () => {
    if (!timeNeeded) {
      toast.warning('Please select a delivery time');
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        items: cartItems.map(item => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalPrice,
        timeNeeded,
      };

      // Location is optional
      if (location) {
        orderData.location = {
          lat: location.lat,
          lng: location.lng,
          address: location.address,
        };
      }

      await createOrder(orderData);
      clearCart();
      sessionStorage.removeItem('orderLocation');
      setSuccess(true);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="empty-state animate-scale-in">
        <CheckCircle style={{ color: 'var(--color-success)', width: 72, height: 72 }} />
        <h3 style={{ marginTop: 'var(--space-4)' }}>Order Placed!</h3>
        <p>Your order has been submitted and is pending confirmation.</p>
        <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-primary ripple" onClick={() => navigate('/orders')}>
            <Package size={18} />
            View Orders
          </button>
          <button className="btn btn-secondary ripple" onClick={() => navigate('/')}>
            Order More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Order Summary</h1>

      {/* Items */}
      <div className="summary-section">
        <h3>Items</h3>
        <div className="card">
          {cartItems.map(item => (
            <div key={item.itemId} className="summary-row">
              <span className="summary-row-label">
                {item.name} × {item.quantity}
              </span>
              <span className="summary-row-value">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="divider" />
          <div className="summary-row">
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>Total</span>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-primary-light)' }}>
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Location (Optional) */}
      <div className="summary-section">
        <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Delivery Location <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></span>
          {location && (
            <button className="btn btn-ghost btn-sm" onClick={handleClearLocation} style={{ color: 'var(--color-danger)' }}>
              <X size={14} /> Clear
            </button>
          )}
        </h3>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '0 12px', border: '1px solid var(--color-border)' }}>
            <Search size={16} color="#9a8a7e" />
            <input
              type="text"
              placeholder="Search for an address..."
              value={searchQuery}
              onChange={handleSearch}
              style={{
                flex: 1, padding: '12px 0', background: 'transparent', border: 'none', outline: 'none',
                fontSize: '13px', color: 'var(--color-text)', fontFamily: 'var(--font-family)',
              }}
            />
            {isSearching && <div className="spinner spinner-sm" style={{ width: 16, height: 16 }} />}
          </div>
          {searchResults.length > 0 && (
            <ul style={{
              position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-bg)',
              zIndex: 1000, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              maxHeight: '180px', overflowY: 'auto', boxShadow: 'var(--shadow-md)', listStyle: 'none', padding: 0, margin: '4px 0 0'
            }}>
              {searchResults.map(res => (
                <li
                  key={res.place_id}
                  onClick={() => handleSelectResult(res)}
                  style={{
                    padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)',
                    fontSize: '12px', color: 'var(--color-text)', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = 'var(--color-surface-hover)'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  <MapPin size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  {res.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* GPS Button */}
        <button
          className="btn btn-secondary btn-full ripple mb-3"
          onClick={handleUseGPS}
          disabled={loadingGPS}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {loadingGPS ? <div className="spinner spinner-sm" /> : <><Navigation size={16} /> Use Current Location</>}
        </button>

        {/* Toggle Map */}
        {!showMap && !location && (
          <button className="btn btn-ghost btn-sm btn-full" onClick={() => setShowMap(true)} style={{ color: 'var(--color-primary)' }}>
            <MapPin size={14} /> Or pick on map
          </button>
        )}

        {/* Map */}
        {(showMap || location) && (
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', marginBottom: 'var(--space-3)' }}>
            <div style={{ width: '100%', height: '250px' }}>
              <MapContainer
                center={mapPosition || defaultCenter}
                zoom={mapPosition ? 15 : 10}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                {mapPosition && <FlyToPosition position={mapPosition} />}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Address display */}
        {address && (
          <div className="address-display animate-slide-up" style={{ fontSize: 'var(--font-size-sm)' }}>
            <MapPin size={14} />
            <div>{loadingAddress ? <span className="text-muted">Getting address...</span> : address}</div>
          </div>
        )}
      </div>

      {/* Time */}
      <div className="summary-section">
        <h3>Delivery Time</h3>
        <div className="form-group">
          <div className="form-input-icon">
            <Clock />
            <input
              type="time"
              className="form-input"
              value={timeNeeded}
              onChange={e => setTimeNeeded(e.target.value)}
              id="delivery-time"
            />
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg btn-full ripple mt-4"
        onClick={handlePlaceOrder}
        disabled={submitting || !timeNeeded}
        id="place-order-btn"
      >
        {submitting ? (
          <div className="spinner spinner-sm" />
        ) : (
          <>
            <Send size={20} />
            Place Order
          </>
        )}
      </button>
    </div>
  );
}
