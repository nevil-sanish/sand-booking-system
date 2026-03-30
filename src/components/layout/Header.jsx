import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mountain, LogOut, Moon, Sun } from 'lucide-react';
import { APP_NAME } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand" onClick={() => navigate(isAdmin ? '/admin' : '/')}>
          <div className="header-brand-icon">
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2>{APP_NAME}</h2>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-icon btn-ghost btn-sm"
            onClick={toggleTheme}
            title="Toggle Theme"
            id="theme-toggle-btn"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
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
