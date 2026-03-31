import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { APP_NAME } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand" onClick={() => navigate(isAdmin ? '/admin' : '/')}>

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
