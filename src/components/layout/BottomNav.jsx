import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { NAV_ITEMS_USER, NAV_ITEMS_ADMIN } from '../../utils/constants';
import {
  Home, Package, MessageSquare, User,
  LayoutDashboard, Layers, Users, ShoppingCart
} from 'lucide-react';

const iconMap = {
  Home, Package, MessageSquare, User,
  LayoutDashboard, Layers, Users, ShoppingCart,
};

export default function BottomNav() {
  const { isAdmin } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  const navItems = isAdmin ? NAV_ITEMS_ADMIN : [
    ...NAV_ITEMS_USER.slice(0, 1),
    { path: '/cart', label: 'Cart', icon: 'ShoppingCart' },
    ...NAV_ITEMS_USER.slice(1),
  ];

  return (
    <nav className="bottom-nav" id="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map(item => {
          const Icon = iconMap[item.icon];
          const isActive = item.path === '/' || item.path === '/admin'
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              id={`nav-${item.label.toLowerCase()}`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
              {item.path === '/cart' && totalItems > 0 && (
                <span className="nav-badge">{totalItems}</span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
