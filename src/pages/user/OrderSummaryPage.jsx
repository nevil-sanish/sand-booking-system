import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../../contexts/ToastContext';
import { formatPrice } from '../../utils/formatters';
import { MapPin, Clock, Package, CheckCircle, Send } from 'lucide-react';

export default function OrderSummaryPage() {
  const [location, setLocation] = useState(null);
  const [timeNeeded, setTimeNeeded] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { cartItems, totalPrice, clearCart, isEmpty } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders(user?.id);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem('orderLocation');
    if (stored) {
      setLocation(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (isEmpty && !success) {
      navigate('/cart');
    }
  }, [isEmpty, success, navigate]);

  const handlePlaceOrder = async () => {
    if (!timeNeeded) {
      toast.warning('Please select a delivery time');
      return;
    }

    if (!location) {
      toast.warning('Please select a delivery location');
      navigate('/location');
      return;
    }

    setSubmitting(true);

    try {
      await createOrder({
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
        location: {
          lat: location.lat,
          lng: location.lng,
          address: location.address,
        },
        timeNeeded,
      });

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

      {/* Location */}
      <div className="summary-section">
        <h3>Delivery Location</h3>
        {location ? (
          <div className="address-display">
            <MapPin size={18} />
            <div>{location.address}</div>
          </div>
        ) : (
          <button className="btn btn-secondary btn-full" onClick={() => navigate('/location')}>
            <MapPin size={18} />
            Select Location
          </button>
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
        disabled={submitting || !location || !timeNeeded}
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
