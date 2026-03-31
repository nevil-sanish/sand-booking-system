import { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../../contexts/ToastContext';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { ORDER_STATUSES } from '../../utils/constants';
import { formatPrice, formatRelativeTime, formatPhone } from '../../utils/formatters';
import {
  Package, MapPin, Clock, Phone as PhoneIcon,
  CheckCircle, XCircle, Check, ExternalLink, User, Trash2
} from 'lucide-react';

const tabs = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const { orders, loading, updateOrderStatus, getOrdersByStatus, deleteOrder } = useOrders(null, true);
  const toast = useToast();

  const handleAction = async (orderId, status, label) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order ${label}`);
    } catch {
      toast.error(`Failed to ${label} order`);
    }
  };

  if (loading) return <Spinner text="Loading orders..." />;

  const filteredOrders = getOrdersByStatus(activeTab);
  const counts = {};
  tabs.forEach(t => { counts[t.key] = getOrdersByStatus(t.key).length; });

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Orders</h1>

      <div className="tabs mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            id={`tab-${tab.key}`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className="tab-count">{counts[tab.key]}</span>
            )}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={`No ${activeTab} orders`}
          description={`There are no ${activeTab} orders at the moment.`}
        />
      ) : (
        <div className="stagger-children">
          {filteredOrders.map(order => (
            <div key={order.id} className="card order-card">
              <div className="order-card-header">
                <div>
                  <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <User size={14} />
                    {order.userName || 'Unknown'}
                  </p>
                  <p className="order-card-id">#{order.id.slice(-6).toUpperCase()}</p>
                </div>
                <span className={`badge badge-${order.status}`}>
                  {order.status}
                </span>
              </div>

              {/* Customer phone */}
              <div className="order-card-meta" style={{ marginBottom: 'var(--space-2)' }}>
                <a
                  href={`tel:${order.userPhone}`}
                  className="order-card-meta-item"
                  style={{ color: 'var(--color-success)' }}
                >
                  <PhoneIcon size={14} />
                  {formatPhone(order.userPhone)}
                </a>
              </div>

              {/* Items list */}
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
                {order.createdAt && (
                  <span className="order-card-meta-item">
                    {formatRelativeTime(order.createdAt)}
                  </span>
                )}
                {order.location?.address && (
                  <a
                    className="order-card-meta-item"
                    href={`https://www.google.com/maps?q=${order.location.lat},${order.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-info)' }}
                  >
                    <MapPin size={14} />
                    Map
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="flex-between" style={{ marginTop: 'var(--space-3)' }}>
                <span className="order-card-total">{formatPrice(order.totalPrice)}</span>

                <div className="order-card-actions">
                  {/* Call button */}
                  <a href={`tel:${order.userPhone}`} className="btn btn-secondary btn-sm ripple">
                    <PhoneIcon size={14} />
                    Call
                  </a>

                  {order.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-success btn-sm ripple"
                        onClick={() => handleAction(order.id, 'confirmed', 'confirmed')}
                        id={`confirm-${order.id}`}
                      >
                        <Check size={14} />
                        Confirm
                      </button>
                      <button
                        className="btn btn-danger btn-sm ripple"
                        onClick={() => handleAction(order.id, 'cancelled', 'cancelled')}
                        id={`cancel-${order.id}`}
                      >
                        <XCircle size={14} />
                        Cancel
                      </button>
                    </>
                  )}

                  {order.status === 'confirmed' && (
                    <button
                      className="btn btn-success btn-sm ripple"
                      onClick={() => handleAction(order.id, 'completed', 'completed')}
                      id={`complete-${order.id}`}
                    >
                      <CheckCircle size={14} />
                      Complete
                    </button>
                  )}

                  <button
                    className="btn btn-ghost btn-danger btn-sm ripple"
                    onClick={async () => {
                      if(window.confirm('Are you sure you want to permanently delete this order?')) {
                        try {
                          await deleteOrder(order.id);
                          toast.success('Order deleted successfully');
                        } catch {
                          toast.error('Failed to delete order');
                        }
                      }
                    }}
                    title="Delete permanently"
                    id={`delete-${order.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
