import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';

import Layout from './components/layout/Layout';
import Spinner from './components/common/Spinner';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';

// User Pages
import HomePage from './pages/user/HomePage';
import CartPage from './pages/user/CartPage';
import OrderSummaryPage from './pages/user/OrderSummaryPage';
import UserOrdersPage from './pages/user/OrdersPage';
import UserMessagesPage from './pages/user/MessagesPage';
import ProfilePage from './pages/user/ProfilePage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import AdminItemsPage from './pages/admin/ItemsPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminMessagesPage from './pages/admin/MessagesPage';
import AdminNotificationsPage from './pages/admin/NotificationsPage';
import EditContactPage from './pages/admin/EditContactPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner text="Loading..." />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  if (!adminOnly && isAdmin) return <Navigate to="/admin" replace />;

  return children;
}

function PublicRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner text="Loading..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* User Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="order-summary" element={<OrderSummaryPage />} />
        <Route path="orders" element={<UserOrdersPage />} />
        <Route path="messages" element={<UserMessagesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="items" element={<AdminItemsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="messages" element={<AdminMessagesPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="settings" element={<EditContactPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
