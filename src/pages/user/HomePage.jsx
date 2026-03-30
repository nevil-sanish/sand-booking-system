import { useItems } from '../../hooks/useItems';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Mountain, Plus, ShoppingCart, Package } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { items, loading: itemsLoading } = useItems(true);
  const { orders, loading: ordersLoading } = useOrders(null, false);
  const { user } = useAuth();
  const { addToCart, totalItems, totalPrice } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    toast.success(`${item.name} added to cart`);
  };

  if (itemsLoading || ordersLoading) return <Spinner text="Loading your dashboard..." />;

  const activeOrders = orders.filter(o => ['pending', 'confirmed'].includes(o.status));

  return (
    <div className="animate-fade-in" style={{ paddingBottom: totalItems > 0 ? '80px' : '0' }}>
      
      {/* HEADER SECTION */}
      <div className="flex-between mb-6">
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Hello {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-muted">what do you need today?</p>
        </div>
        <div className="avatar avatar-lg">
          {user?.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* ITEMS HORIZONTAL SCROLL */}
      <div className="horizontal-scroll stagger-children mb-6">
        {items.length === 0 ? (
          <p className="text-muted">No items available.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="card horizontal-item glass-panel hover-lift card-clickable" onClick={() => handleAddToCart(item)} style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div className="item-card-icon" style={{ marginBottom: 'var(--space-2)' }}>
                <Mountain />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>{item.name}</h3>
              <div>
                <span className="item-card-price" style={{ fontSize: 'var(--font-size-lg)' }}>{formatPrice(item.price)}</span>
                <span className="item-card-unit text-muted" style={{ fontSize: 'var(--font-size-xs)' }}> / {item.unit || 'load'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ACTIVE ORDERS SECTION */}
      <h2 className="section-title mb-4">Your Active Orders</h2>
      {activeOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Active Orders"
          description="Your current orders will appear here."
        />
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {activeOrders.map(order => (
            <div key={order.id} className="card glass-panel hover-lift card-clickable" onClick={() => navigate('/orders')} style={{ padding: 'var(--space-4)' }}>
              <div className="flex-between mb-2">
                <span className="order-card-id">#{order.id.slice(-6).toUpperCase()}</span>
                <span className={`badge badge-${order.status}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
              </div>
              <div className="mt-3 flex-between">
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  {order.createdAt?.toDate().toLocaleDateString()}
                </span>
                <strong style={{ color: 'var(--color-primary-light)' }}>{formatPrice(order.totalAmount)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FLOATING CART SUMMARY (BOTTOM) */}
      {totalItems > 0 && (
        <div 
          className="glass-panel animate-slide-up hover-lift"
          onClick={() => navigate('/cart')}
          style={{
            position: 'fixed',
            bottom: 'calc(var(--bottom-nav-height) + var(--space-4))',
            left: 'var(--space-4)',
            right: 'var(--space-4)',
            maxWidth: 'calc(var(--max-width-user) - var(--space-8))',
            margin: '0 auto',
            padding: 'var(--space-4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 10,
            background: 'rgba(212, 147, 13, 0.9)',
            borderColor: 'var(--color-primary-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="nav-badge" style={{ position: 'relative', top: 0, right: 0, background: '#fff', color: 'var(--color-primary)' }}>
              {totalItems}
            </div>
            <span style={{ color: '#fff', fontWeight: 600 }}>Cart Items</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ color: '#fff', fontWeight: 800 }}>{formatPrice(totalPrice)}</span>
            <span style={{ color: '#fff' }}>➔</span>
          </div>
        </div>
      )}

    </div>
  );
}
