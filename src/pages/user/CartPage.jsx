import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useOrders } from '../../hooks/useOrders';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import EmptyState from '../../components/common/EmptyState';
import { ShoppingCart, Minus, Plus, Trash2, MapPin, Clock, Home, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, isEmpty, clearCart } = useCart();
  const { createOrder } = useOrders(null, false);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    location: '',
    time: 'morning',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmOrder = async () => {
    if (!form.location || !form.address) {
      toast.error('Please fill in location and address');
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({
        items: cartItems,
        totalAmount: totalPrice,
        location: form.location,
        time: form.time,
        address: form.address,
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error('Failed to confirm order.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isEmpty) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your Cart is Empty"
        description="Add items from the home page to get started."
        action={
          <button className="btn btn-primary ripple hover-lift" onClick={() => navigate('/')}>
            Browse Items
          </button>
        }
      />
    );
  }

  return (
    <div className="animate-fade-in app-shell-user">
      <div className="flex-between mb-6">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Review Order</h1>
      </div>

      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* ITEMS */}
        <div className="card glass-panel" style={{ padding: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-4)' }}>Selected Items</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {cartItems.map(item => (
              <div key={item.itemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{item.name}</p>
                  <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{formatPrice(item.price)} / {item.unit}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="qty-selector" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)' }}>
                    <button className="qty-btn" onClick={() => updateQuantity(item.itemId, item.quantity - 1)}><Minus size={14} /></button>
                    <span className="qty-value" style={{ width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.itemId, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DELIVERY INFO */}
        <div className="card glass-panel" style={{ padding: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-4)' }}>Delivery Details</h2>
          
          <div className="form-group hover-lift">
            <div className="form-input-icon">
              <MapPin size={18} />
              <input
                type="text"
                className="form-input glass"
                placeholder="search location in Map"
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group hover-lift">
            <div className="form-input-icon">
              <Clock size={18} />
              <select
                className="form-input glass form-select"
                value={form.time}
                onChange={e => setForm({...form, time: e.target.value})}
              >
                <option value="morning">Morning (8AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 4PM)</option>
                <option value="evening">Evening (4PM - 7PM)</option>
              </select>
            </div>
          </div>

          <div className="form-group hover-lift mb-0">
            <div className="form-input-icon">
              <Home size={18} style={{ alignSelf: 'flex-start', marginTop: '12px' }} />
              <textarea
                className="form-input glass"
                placeholder="house name"
                rows={3}
                value={form.address}
                onChange={e => setForm({...form, address: e.target.value})}
                style={{ resize: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="card glass-panel" style={{ padding: 'var(--space-4)' }}>
          <div className="flex-between">
            <span style={{ fontSize: 'var(--font-size-md)' }}>Total Amount</span>
            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-primary-light)' }}>
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        {/* SUBMIT */}
        <button
          className="btn btn-primary btn-lg btn-full hover-lift mt-2"
          onClick={handleConfirmOrder}
          disabled={submitting}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          {submitting ? <div className="spinner spinner-sm" /> : <><CheckCircle2 size={20} /> confirm order</>}
        </button>
      </div>
    </div>
  );
}
