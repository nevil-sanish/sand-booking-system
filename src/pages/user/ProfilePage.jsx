import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getInitials, formatPhone } from '../../utils/formatters';
import { Lock, LogOut, User, Phone, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="animate-fade-in app-shell-user">
      <h1 className="page-title">Profile</h1>

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
        <span className={`badge badge-approved`} style={{ marginTop: 'var(--space-3)' }}>
          <Shield size={12} />
          {user?.role}
        </span>
      </div>

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
    </div>
  );
}
