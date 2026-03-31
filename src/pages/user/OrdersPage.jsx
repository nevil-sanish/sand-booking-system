import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../../contexts/ToastContext';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatPrice, formatRelativeTime, formatDateTime } from '../../utils/formatters';
import { Package, MapPin, Clock, XCircle, ExternalLink, CalendarDays } from 'lucide-react';

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders, loading, updateOrderStatus } = useOrders(user?.id);
  const toast = useToast();

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await updateOrderStatus(orderId, 'cancelled');
      toast.success('Order cancelled');
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  if (loading) return <Spinner text="Loading orders..." />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No Orders Yet"
        description="Your order history will appear here once you place an order."
      />
    );
  }

  return (
    <div className="animate-fade-in app-shell-user">
      <h1 className="page-title">My Orders</h1>

      <div className="stagger-children">
        {orders.map(order => (
          <div key={order.id} className="card order-card">
            <div className="order-card-header">
              <div>
                <p className="order-card-id">#{order.id.slice(-6).toUpperCase()}</p>
                {/* Non-editable created-on date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <CalendarDays size={11} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    {order.createdAt ? formatDateTime(order.createdAt) : 'Date unavailable'}
                  </span>
                </div>
              </div>
              <span className={`badge badge-${order.status}`}>
                {statusLabels[order.status]}
              </span>
            </div>

            <ul className="order-card-items">
              {order.items?.map((item, i) => (
                <li key={i}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="order-card-meta">
              <span className="order-card-meta-item">
                <Clock size={14} />
                {order.dateNeeded ? `${order.dateNeeded} ` : ''}{order.timeNeeded || 'Anytime'}
              </span>
              {order.location?.address && (
                <a
                  className="order-card-meta-item"
                  href={`https://www.google.com/maps?q=${order.location.lat},${order.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-info)' }}
                >
                  <MapPin size={14} />
                  View Map
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="flex-between">
              <span className="order-card-total">{formatPrice(order.totalPrice)}</span>
              {order.status === 'pending' && (
                <button
                  className="btn btn-danger btn-sm ripple"
                  onClick={() => handleCancel(order.id)}
                  id={`cancel-order-${order.id}`}
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
