import { useState, useEffect } from 'react';
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
  const { messages } = useMessages(user?.id);

  // Key unique to this user — avoids cross-user contamination
  const seenKey = user?.id ? `msgs_seen_at_${user.id}` : null;

  // Initialise from localStorage so badge is correct immediately on mount
  const [seenAt, setSeenAt] = useState(() =>
    seenKey ? parseInt(localStorage.getItem(seenKey) || '0', 10) : 0
  );

  // MessagesPage dispatches 'msgs-seen' after updating localStorage.
  // This listener re-reads the timestamp so the badge drops to 0 without needing
  // a Firestore round-trip (fixes badge when Firestore security rules block user writes).
  useEffect(() => {
    if (!seenKey) return;
    const handler = () => {
      setSeenAt(parseInt(localStorage.getItem(seenKey) || '0', 10));
    };
    window.addEventListener('msgs-seen', handler);
    return () => window.removeEventListener('msgs-seen', handler);
  }, [seenKey]);

  // Unread = admin messages that arrived AFTER the user last opened MessagesPage
  const unreadMessages = messages.filter(m => {
    if (m.senderId !== 'admin') return false;
    const ts = m.createdAt?.toMillis ? m.createdAt.toMillis() : Date.now();
    return ts > seenAt;
  }).length;

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
                    style={{
                      position: 'absolute', top: -6, right: -8,
                      fontSize: '9px', minWidth: 15, height: 15,
                      padding: '0 3px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}
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
