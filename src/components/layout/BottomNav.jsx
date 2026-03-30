import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS_USER } from '../../utils/constants';
import { Package, MessageSquare, User, ShoppingCart, Phone } from 'lucide-react';

const iconMap = {
  Package, MessageSquare, User, ShoppingCart, Phone
};

export default function BottomNav() {
  const location = useLocation();

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
              <Icon size={22} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
