import { useItems } from '../../hooks/useItems';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import TextType from '../../components/animations/TextType';
import TextPressure from '../../components/animations/TextPressure';
import StarBorder from '../../components/animations/StarBorder';
import CountUp from '../../components/animations/CountUp';
import TiltedCard from '../../components/animations/TiltedCard';
import { ParticleCard, GlobalSpotlight } from '../../components/animations/MagicBento';

export default function HomePage() {
  const { items, loading: itemsLoading } = useItems(true);
  const { orders, loading: ordersLoading } = useOrders(null, false);
  const { user } = useAuth();
  const { cartItems, addToCart, updateQuantity, totalItems, totalPrice } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const gridRef = useRef(null);

  const handleIncrement = (item) => {
    const existing = cartItems.find(ci => ci.itemId === item.id);
    if (existing) {
      updateQuantity(item.id, existing.quantity + 1);
    } else {
      addToCart(item, 1);
      toast.success(`${item.name} added to cart`);
    }
  };

  const handleDecrement = (item) => {
    const existing = cartItems.find(ci => ci.itemId === item.id);
    if (existing) {
      updateQuantity(item.id, existing.quantity - 1);
    }
  };

  if (itemsLoading || ordersLoading) return <Spinner text="Loading your dashboard..." />;

  const activeOrders = orders.filter(o => ['pending', 'confirmed'].includes(o.status));

  return (
    <div className="animate-fade-in bento-section" style={{ paddingBottom: totalItems > 0 ? '80px' : '0' }}>
      <GlobalSpotlight gridRef={gridRef} spotlightRadius={400} />
      
      {/* BRAND HOVER FX */}
      <div style={{ width: '100%', height: '80px', marginBottom: 'var(--space-2)' }}>
        <TextPressure text="MULLONKAL SAND" minFontSize={32} />
      </div>

      {/* HEADER SECTION */}
      <div className="flex-between mb-4">
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Hello {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-muted" style={{ minHeight: '20px' }}>
            <TextType text="what do you need today?" speed={0.8} />
          </p>
        </div>
        <div className="avatar avatar-lg">
          {user?.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* TOTAL ORDERS HAPPY CUSTOMERS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
        <span>Over</span> 
        <strong style={{ fontSize: 'var(--font-size-md)' }}><CountUp from={0} to={450} duration={3} />+</strong>
        <span>Happy Orders Delivered!</span>
      </div>

      {/* AVAILABLE ITEMS - Vertical List for Mobile */}
      <h2 className="section-title mb-4">Available Items</h2>
      <div className="stagger-children mb-6" ref={gridRef} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {items.length === 0 ? (
          <p className="text-muted text-center">No items available right now.</p>
        ) : (
          items.map(item => {
            const cartItem = cartItems.find(ci => ci.itemId === item.id);
            const quantity = cartItem ? cartItem.quantity : 0;

            return (
              <StarBorder key={item.id} speed="4s" color="var(--color-primary-light)" thickness={1} as="div" style={{ width: '100%', padding: '1px' }}>
                <ParticleCard className="card glass-panel magic-bento-card" enableTilt={true} clickEffect={true} style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
                    <div className="item-card-icon" style={{ flexShrink: 0 }}>
                      <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                      <div>
                        <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-primary)' }}>{formatPrice(item.price)}</span>
                        <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}> / {item.unit || 'load'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="qty-selector" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)' }}>
                    <button className="qty-btn" onClick={() => handleDecrement(item)} disabled={quantity === 0} style={{ width: 32, height: 32, opacity: quantity === 0 ? 0.3 : 1 }}>
                      <Minus size={14} />
                    </button>
                    <span className="qty-value" style={{ borderLeft: 'none', borderRight: 'none', padding: '0 var(--space-2)', minWidth: 28, fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {quantity}
                    </span>
                    <button className="qty-btn" onClick={() => handleIncrement(item)} style={{ width: 32, height: 32 }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </ParticleCard>
              </StarBorder>
            );
          })
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
        <div className="stagger-children flex-between" style={{ display: 'flex', flexDirection: 'row', gap: 'var(--space-3)', overflowX: 'auto', paddingBottom: '1rem' }}>
          {activeOrders.map(order => (
            <div key={order.id} onClick={() => navigate('/orders')} style={{ cursor: 'pointer', flexShrink: 0 }}>
              <TiltedCard 
                imageSrc="/logo.png" 
                altText="Orders Background"
                captionText={`Order #${order.id.slice(-6).toUpperCase()}`}
                containerHeight="220px"
                containerWidth="220px"
                imageHeight="220px"
                imageWidth="220px"
                scaleOnHover={1.05}
                rotateAmplitude={10}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                  <div style={{ padding: '1rem', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <div className="flex-between mb-2">
                      <span className={`badge badge-${order.status}`}>{order.status}</span>
                    </div>
                    <div className="text-white" style={{ fontSize: 'var(--font-size-sm)', marginBottom: '8px' }}>
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                    <strong style={{ color: 'var(--color-primary-light)' }}>{formatPrice(order.totalPrice)}</strong>
                  </div>
                }
              />
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
