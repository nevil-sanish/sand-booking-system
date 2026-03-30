import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="layout">
      <Header />
      <main className="page container page-enter">
        {user?.flagged && (
          <div className="warning-banner" id="flagged-warning">
            <AlertTriangle />
            <p>Your account has been flagged by the admin. Please contact support for assistance.</p>
          </div>
        )}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
