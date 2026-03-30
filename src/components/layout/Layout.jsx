import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, Menu } from 'lucide-react';
import { USER_ROLES } from '../../utils/constants';

export default function Layout() {
  const { user, isAdmin } = useAuth();
  const [isMobileOpen, setMobileOpen] = useState(false);

  // ADMIN LAYOUT: Desktop Sidebar + Mobile Hamburger
  if (isAdmin) {
    return (
      <div className="admin-layout-wrapper app-shell-admin">
        <AdminSidebar 
          isMobileOpen={isMobileOpen} 
          setMobileOpen={setMobileOpen} 
        />
        
        {/* Mobile-only header for the hamburger icon */}
        <div 
          className="header" 
          style={{ display: window.innerWidth > 768 ? 'none' : 'flex' }}
        >
          <div className="header-inner">
            <button 
              className="btn btn-icon btn-ghost" 
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="header-brand">
              <h2 style={{ fontSize: 'var(--font-size-md)' }}>Admin Panel</h2>
            </div>
          </div>
        </div>

        <main className="admin-main page-enter" style={{ paddingTop: window.innerWidth > 768 ? 'var(--space-6)' : 'calc(var(--header-height) + var(--space-4))' }}>
          <Outlet />
        </main>
      </div>
    );
  }

  // USER LAYOUT: Mobile constraints + Bottom Nav
  return (
    <div className="app-shell-user">
      <Header />
      <main className="page container page-enter">
        {user?.flagged && (
          <div className="warning-banner" id="flagged-warning">
            <AlertTriangle />
            <p>Your account has been flagged by the admin. Please contact support.</p>
          </div>
        )}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
