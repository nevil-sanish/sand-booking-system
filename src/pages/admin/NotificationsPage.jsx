import { useNotifications } from '../../hooks/useNotifications';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Bell, Check, CheckCircle2 } from 'lucide-react';

export default function AdminNotificationsPage() {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  if (loading) return <Spinner text="Loading notifications..." />;

  return (
    <div className="animate-fade-in">
      <div className="flex-between mb-4">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Notifications</h1>
        {unreadCount > 0 && (
          <button 
            className="btn btn-ghost btn-sm text-primary"
            onClick={markAllAsRead}
          >
            <Check size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState 
          icon={Bell} 
          title="No Notifications" 
          description="You're all caught up! New alerts will appear here." 
        />
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`card ${notif.read ? '' : 'glass-panel'} hover-lift`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                opacity: notif.read ? 0.7 : 1,
                borderLeft: notif.read ? '' : '3px solid var(--color-primary)'
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: notif.read ? 500 : 700, marginBottom: '2px' }}>
                  {notif.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {notif.message}
                </p>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', marginTop: 'var(--space-2)' }}>
                  {notif.createdAt?.toDate().toLocaleDateString()} • {notif.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              {!notif.read && (
                <button 
                  className="btn btn-icon btn-ghost btn-sm"
                  onClick={() => markAsRead(notif.id)}
                  title="Mark as read"
                >
                  <CheckCircle2 size={20} style={{ color: 'var(--color-primary)' }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
