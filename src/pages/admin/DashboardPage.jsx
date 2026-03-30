import { useOrders } from '../../hooks/useOrders';
import { useUsers } from '../../hooks/useUsers';
import Spinner from '../../components/common/Spinner';
import { useNavigate } from 'react-router-dom';
import { Package, Users, Clock, CheckCircle, Layers, MessageSquare } from 'lucide-react';

export default function DashboardPage() {
  const { orders, loading: ordersLoading } = useOrders(null, true);
  const { users, loading: usersLoading, getPendingUsers } = useUsers();
  const navigate = useNavigate();

  if (ordersLoading || usersLoading) return <Spinner text="Loading dashboard..." />;

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const pendingUsers = getPendingUsers();

  const stats = [
    { label: 'Pending Orders', value: pendingOrders.length, icon: Clock, color: 'var(--color-warning)' },
    { label: 'Active Orders', value: confirmedOrders.length, icon: Package, color: 'var(--color-info)' },
    { label: 'Completed', value: completedOrders.length, icon: CheckCircle, color: 'var(--color-success)' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'var(--color-primary)' },
  ];

  const quickActions = [
    { label: 'Manage Orders', icon: Package, path: '/admin/orders', desc: `${pendingOrders.length} pending` },
    { label: 'Manage Items', icon: Layers, path: '/admin/items', desc: 'Add, edit & price' },
    { label: 'Manage Users', icon: Users, path: '/admin/users', desc: `${pendingUsers.length} pending` },
    { label: 'Messages', icon: MessageSquare, path: '/admin/messages', desc: 'Send to users' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid stagger-children">
        {stats.map((stat, i) => (
          <div key={i} className="card stat-card">
            <stat.icon size={24} style={{ color: stat.color, marginBottom: 'var(--space-2)' }} />
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Quick Actions</h2>
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {quickActions.map((action, i) => (
          <div
            key={i}
            className="card card-clickable"
            onClick={() => navigate(action.path)}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)' }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)',
              background: 'rgba(var(--color-primary-rgb), 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <action.icon size={22} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600 }}>{action.label}</p>
              <p className="text-muted">{action.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
