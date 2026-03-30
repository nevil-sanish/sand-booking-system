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
      <h1 className="page-title">Dashboard Overview</h1>

      <div className="dashboard-grid stagger-children">
        <div className="card card-clickable glass-panel hover-lift" onClick={() => navigate('/admin/orders')} style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Package size={48} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }} />
          <h2 style={{ fontSize: 'var(--font-size-xl)' }}>STATUS</h2>
          <p className="text-muted text-center mt-2">
            {pendingOrders.length} Pending<br />
            {confirmedOrders.length} Active
          </p>
        </div>

        <div className="card card-clickable glass-panel hover-lift" onClick={() => navigate('/admin/items')} style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Layers size={48} style={{ color: 'var(--color-info)', marginBottom: 'var(--space-4)' }} />
          <h2 style={{ fontSize: 'var(--font-size-xl)' }}>INVENTORY</h2>
          <p className="text-muted text-center mt-2">
            Manage Sand Items & Pricing
          </p>
        </div>

        <div className="card card-clickable glass-panel hover-lift" onClick={() => navigate('/admin/messages')} style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <MessageSquare size={48} style={{ color: 'var(--color-success)', marginBottom: 'var(--space-4)' }} />
          <h2 style={{ fontSize: 'var(--font-size-xl)' }}>CHAT</h2>
          <p className="text-muted text-center mt-2">
            Messages & Enquiries
          </p>
        </div>

        <div className="card card-clickable glass-panel hover-lift" onClick={() => navigate('/admin/users')} style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Users size={48} style={{ color: 'var(--color-warning)', marginBottom: 'var(--space-4)' }} />
          <h2 style={{ fontSize: 'var(--font-size-xl)' }}>USERS</h2>
          <p className="text-muted text-center mt-2">
            {pendingUsers.length} Pending Approvals<br />
            {users.length} Total Users
          </p>
        </div>
      </div>
    </div>
  );
}
