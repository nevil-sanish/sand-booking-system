import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Mountain, Phone, UserIcon, CheckCircle, Lock } from 'lucide-react';
import { validatePhone, validateName } from '../../utils/validators';
import { APP_NAME } from '../../utils/constants';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateName(name);
    const phoneError = validatePhone(phone);
    let passwordError = '';
    if (password.length < 6) passwordError = 'Password must be at least 6 characters';

    if (nameError || phoneError || passwordError) {
      setErrors({ name: nameError, phone: phoneError, password: passwordError });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await register(name.trim(), phone, password);
      setSuccess(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page animate-fade-in app-shell-user">
        <div className="auth-card glass-panel" style={{ padding: 'var(--space-6) var(--space-5)' }}>
          <div className="auth-success animate-scale-in text-center">
            <CheckCircle style={{ width: 64, height: 64, color: 'var(--color-success)', margin: '0 auto var(--space-4)' }} />
            <h2 style={{ fontSize: 'var(--font-size-xl)' }}>Registration Successful!</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
              Your account is undergoing verification. Once the admin approves your request, you can login with your phone and password immediately.
            </p>
          </div>
          <div className="auth-footer mt-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p>
              Already approved? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page animate-fade-in app-shell-user">
      <div className="auth-card glass-panel" style={{ padding: 'var(--space-6) var(--space-5)' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon hover-lift" style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ marginBottom: 0 }}>mullonkal sand</h1>
          <p>Registration Page</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="form-input-icon hover-lift">
              <UserIcon />
              <input
                type="text"
                className="form-input glass"
                placeholder="name of the user"
                value={name}
                onChange={e => setName(e.target.value)}
                id="register-name"
              />
            </div>
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <div className="form-input-icon hover-lift">
              <Phone />
              <input
                type="tel"
                className="form-input glass"
                placeholder="phone number of the user"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                id="register-phone"
                maxLength={10}
              />
            </div>
            {errors.phone && <p className="form-error">{errors.phone}</p>}
          </div>

          <div className="form-group hover-lift mb-6">
            <div className="form-input-icon">
              <Lock size={18} style={{ color: 'var(--color-text-secondary)' }} />
              <input
                type="password"
                className="form-input glass"
                placeholder="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                id="register-password"
              />
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full hover-lift mb-6"
            style={{ borderRadius: 'var(--radius-full)' }}
            disabled={submitting}
            id="register-submit"
          >
            {submitting ? (
              <div className="spinner spinner-sm" />
            ) : (
              'create an account'
            )}
          </button>
        </form>

        <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p>
            already have account <Link to="/login">sign in</Link>
          </p>
          
          <button type="button" onClick={() => alert('Tutorial logic goes here.')} style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
            learn how the app works
          </button>
        </div>
      </div>
    </div>
  );
}
