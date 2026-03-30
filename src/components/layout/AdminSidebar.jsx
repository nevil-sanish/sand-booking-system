import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { APP_NAME } from '../../utils/constants';
import { 
  Mountain, 
  LayoutDashboard, 
  ShoppingCart, 
  Bell, 
  Tag, 
  Users, 
  MessageSquare, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

export default function AdminSidebar({ isMobileOpen, setMobileOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
    { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
    { path: '/admin/notifications', icon: <Bell size={20} />, label: 'Notifications' },
    { path: '/admin/items', icon: <Tag size={20} />, label: 'Pricing (Items)' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { path: '/admin/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Edit Contact Info' },
  ];

  return (
    <>
      <div className={`admin-drawer-overlay ${isMobileOpen ? 'visible' : ''}`} onClick={() => setMobileOpen(false)} />
      
      <aside className={`admin-sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header flex-between">
          <div className="header-brand">
            <div className="header-brand-icon">
              <Mountain />
            </div>
            <h2>{APP_NAME}</h2>
          </div>
          {/* Close button only visible on mobile css logically */}
          <button 
            className="btn btn-icon btn-ghost btn-sm"
            onClick={() => setMobileOpen(false)}
            style={{ display: window.innerWidth > 768 ? 'none' : 'flex' }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => 
                `admin-sidebar-item hover-lift ${isActive ? 'active' : ''}`
              }
            >
              <div style={{ position: 'relative' }}>
                {item.icon}
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="nav-badge" style={{ top: -4, right: -4 }}>{unreadCount}</span>
                )}
              </div>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4" style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-glass-border)' }}>
          <button 
            className="btn btn-ghost btn-full flex-between hover-lift" 
            onClick={handleLogout}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <LogOut size={20} />
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
