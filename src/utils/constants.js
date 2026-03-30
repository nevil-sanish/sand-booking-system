export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const USER_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
};

export const MESSAGE_STATUSES = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  SEEN: 'seen',
};

export const APP_NAME = 'Mullonkal Sand';

export const NAV_ITEMS_USER = [
  { path: '/', label: 'Home', icon: 'Home' },
  { path: '/orders', label: 'Orders', icon: 'Package' },
  { path: '/messages', label: 'Messages', icon: 'MessageSquare' },
  { path: '/profile', label: 'Profile', icon: 'User' },
];

export const NAV_ITEMS_ADMIN = [
  { path: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/admin/orders', label: 'Orders', icon: 'Package' },
  { path: '/admin/items', label: 'Items', icon: 'Layers' },
  { path: '/admin/users', label: 'Users', icon: 'Users' },
  { path: '/admin/messages', label: 'Messages', icon: 'MessageSquare' },
];
