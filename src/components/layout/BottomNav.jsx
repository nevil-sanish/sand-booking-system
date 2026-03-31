import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS_USER } from '../../utils/constants';
import { Package, MessageSquare, User, ShoppingCart, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../hooks/useMessages';

const iconMap = {
  Package, MessageSquare, User, ShoppingCart, Phone
};

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  // Subscribe to this user's messages so we can show an unread badge
  const { getUnseenCount } = useMessages(user?.id);
  const unreadMessages = getUnseenCount();

  return (
    <nav className="bottom-nav" id="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV_ITEMS_USER.map(item => {
          const Icon = iconMap[item.icon];
          const isActive = item.path === '/'
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item hover-lift ${isActive ? 'nav-item-active' : ''}`}
            >
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Icon size={22} />
                {item.label === 'Messages' && unreadMessages > 0 && (
                  <span
                    className="nav-badge"
                    style={{ position: 'absolute', top: -6, right: -8, fontSize: '9px', minWidth: 15, height: 15, padding: '0 3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
