import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Mountain, Phone, Lock, LogIn } from 'lucide-react';
import { validatePhone, validatePassword } from '../../utils/validators';
import { APP_NAME } from '../../utils/constants';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);
    if (phoneError || passwordError) {
      setErrors({ phone: phoneError, password: passwordError });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const user = await login(phone, password);
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in app-shell-user">
      <div className="auth-card glass-panel" style={{ padding: 'var(--space-6) var(--space-5)' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon hover-lift" style={{ cursor: 'pointer' }}>
            <Mountain />
          </div>
          <h1 style={{ marginBottom: 0 }}>mullonkal sand</h1>
          <p>Login Page</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="form-input-icon hover-lift">
              <Phone />
              <input
                type="tel"
                className="form-input glass"
                placeholder="phone no"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                id="login-phone"
                maxLength={10}
              />
            </div>
            {errors.phone && <p className="form-error">{errors.phone}</p>}
          </div>

          <div className="form-group">
            <div className="form-input-icon hover-lift">
              <Lock />
              <input
                type="password"
                className="form-input glass"
                placeholder="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                id="login-password"
              />
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <p className="text-center text-muted mb-6" style={{ fontSize: '12px' }}>
            forgotten the password <button type="button" onClick={() => alert('Please contact: admin@mullonkalsand.com')} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>contact the admin</button>
          </p>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full hover-lift mb-6"
            style={{ borderRadius: 'var(--radius-full)' }}
            disabled={submitting}
            id="login-submit"
          >
            {submitting ? (
              <div className="spinner spinner-sm" />
            ) : (
              'sign in'
            )}
          </button>
        </form>

        <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p>
            dont have an account <Link to="/register">register</Link>
          </p>
          <button type="button" onClick={() => alert('Tutorial logic goes here.')} style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
            learn how the app works
          </button>
        </div>
      </div>
    </div>
  );
}
