import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, isEmpty } = useCart();
  const navigate = useNavigate();

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
    <div className="animate-fade-in">
      <div className="flex-between mb-6">
        <h1 className="page-title" style={{ marginBottom: 0 }}>My Cart</h1>
        <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {cartItems.map(item => (
          <div key={item.itemId} className="card glass-panel" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '2px' }}>{item.name}</p>
                <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                  {formatPrice(item.price)} / {item.unit || 'load'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div className="qty-selector" style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <button className="qty-btn" onClick={() => updateQuantity(item.itemId, item.quantity - 1)}>
                    <Minus size={14} />
                  </button>
                  <span style={{ width: '24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeFromCart(item.itemId)}
                  style={{ color: 'var(--color-danger)', padding: '4px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: 'var(--space-2)', fontWeight: 600, color: 'var(--color-primary)' }}>
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Total + Proceed */}
      <div className="card glass-panel mt-4" style={{ padding: 'var(--space-4)' }}>
        <div className="flex-between">
          <span style={{ fontSize: 'var(--font-size-md)' }}>Total</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-primary-light)' }}>
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg btn-full ripple mt-4"
        onClick={() => navigate('/order-summary')}
        style={{ borderRadius: 'var(--radius-full)' }}
      >
        <ArrowRight size={20} />
        Proceed to Order
      </button>
    </div>
  );
}
