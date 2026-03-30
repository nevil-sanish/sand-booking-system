import { useAuth } from '../../contexts/AuthContext';
import { Mountain, LogOut, Bell } from 'lucide-react';
import { APP_NAME } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand" onClick={() => navigate(isAdmin ? '/admin' : '/')}>
          <div className="header-brand-icon">
            <Mountain />
          </div>
          <h2>{APP_NAME}</h2>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-icon btn-ghost btn-sm"
            onClick={handleLogout}
            title="Logout"
            id="logout-btn"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
