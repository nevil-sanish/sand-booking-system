import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { getInitials, formatPhone, formatDateTime, formatPrice } from '../../utils/formatters';
import { Lock, LogOut, Phone, Shield, Package, CalendarDays } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { orders, loading: ordersLoading } = useOrders(user?.id);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Past orders = completed or cancelled, newest first
  const pastOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  return (
    <div className="animate-fade-in app-shell-user">
      <h1 className="page-title">Profile</h1>

      {/* ── User identity card ── */}
      <div className="card glass-panel" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
        <div className="avatar avatar-lg" style={{ margin: '0 auto var(--space-4)' }}>
          {getInitials(user?.name)}
        </div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
          {user?.name}
        </h2>
        <p className="text-muted" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
          <Phone size={14} />
          {formatPhone(user?.phone)}
        </p>
        <span className="badge badge-approved" style={{ marginTop: 'var(--space-3)' }}>
          <Shield size={12} />
          {user?.role}
        </span>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <button
          className="btn btn-secondary btn-full hover-lift"
          onClick={() => navigate('/change-password')}
          id="change-password-link"
        >
          <Lock size={20} />
          Change Password
        </button>
        <button
          className="btn btn-danger btn-full hover-lift"
          onClick={handleLogout}
          id="profile-logout"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      {/* ── Past Orders ── */}
      <div style={{ marginTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
        <h2 style={{
          fontSize: 'var(--font-size-lg)', fontWeight: 700,
          marginBottom: 'var(--space-3)', color: 'var(--color-text)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        }}>
          <Package size={18} style={{ color: 'var(--color-primary)' }} />
          Order History
        </h2>

        {ordersLoading ? (
          <Spinner text="Loading orders..." />
        ) : pastOrders.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 'var(--space-8) var(--space-4)',
            color: 'var(--color-text-muted)', borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--color-border)',
          }}>
            <Package size={32} style={{ margin: '0 auto var(--space-3)', opacity: 0.35 }} />
            <p style={{ fontSize: 'var(--font-size-sm)' }}>No completed or cancelled orders yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {pastOrders.map(order => (
              <div key={order.id} className="card glass-panel" style={{ padding: 'var(--space-4)' }}>

                {/* Order ID + Created date + status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                      #{order.id.slice(-6).toUpperCase()}
                    </p>
                    {/* Non-editable created-on date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <CalendarDays size={11} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        {order.createdAt ? formatDateTime(order.createdAt) : 'Date unavailable'}
                      </span>
                    </div>
                  </div>
                  <span className={`badge badge-${order.status}`} style={{ flexShrink: 0 }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                {/* Items list */}
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 'var(--space-3)' }}>
                  {order.items?.map((item, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {item.name} × {item.quantity}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {item.price != null ? formatPrice(item.price * item.quantity) : '—'}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--color-primary)' }}>
                    {order.totalPrice != null ? formatPrice(order.totalPrice) : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
