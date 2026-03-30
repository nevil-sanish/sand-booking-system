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
    <div className="auth-page animate-fade-in">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Mountain />
          </div>
          <h1>{APP_NAME}</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="form-input-icon">
              <Phone />
              <input
                type="tel"
                className="form-input"
                placeholder="Enter your phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                id="login-phone"
                maxLength={10}
              />
            </div>
            {errors.phone && <p className="form-error">{errors.phone}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-icon">
              <Lock />
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                id="login-password"
              />
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full ripple"
            disabled={submitting}
            id="login-submit"
          >
            {submitting ? (
              <div className="spinner spinner-sm" />
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
