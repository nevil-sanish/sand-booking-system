import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Mountain, Phone, Lock, LogIn, Info } from 'lucide-react';
import { validatePhone, validatePassword } from '../../utils/validators';
import { APP_NAME } from '../../utils/constants';
import Modal from '../../components/common/Modal';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notRegistered, setNotRegistered] = useState(false);
  const [guideModal, setGuideModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleOpenContact = async () => {
    setContactModal(true);
    if (!contactInfo) {
      setLoadingContact(true);
      try {
        const docSnap = await getDoc(doc(db, 'config', 'contact'));
        if (docSnap.exists()) {
          setContactInfo(docSnap.data());
        }
      } catch (err) {
        console.error('Failed to load contact info', err);
      } finally {
        setLoadingContact(false);
      }
    }
  };

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
      if (err.message.includes('No account found')) {
        setNotRegistered(true);
      } else {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in app-shell-user">
      <div className="auth-card glass-panel" style={{ padding: 'var(--space-6) var(--space-5)' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon hover-lift" style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ marginBottom: 0 }}>mullonkal sand</h1>
          <p>Login Page</p>
        </div>

        {notRegistered ? (
          <div className="text-center animate-fade-in mb-6">
            <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-danger)', marginBottom: 'var(--space-2)' }}>User is not registered</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
              It looks like you don't have an account with this number yet.
            </p>
            <Link to={`/register?phone=${phone}`} className="btn btn-primary btn-full hover-lift mb-4" style={{ borderRadius: 'var(--radius-full)' }}>
              register now
            </Link>
            <button type="button" className="btn btn-ghost btn-sm mt-4 text-muted" onClick={() => setNotRegistered(false)}>
              try another number
            </button>
          </div>
        ) : (
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
              forgotten the password? <button type="button" onClick={handleOpenContact} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>contact the admin</button>
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
        )}

        <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p>
            dont have an account <Link to="/register">register</Link>
          </p>
          <button type="button" onClick={() => setGuideModal(true)} style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
            learn how the app works
          </button>
        </div>
      </div>

      {/* Guide Modal */}
      <Modal isOpen={guideModal} onClose={() => setGuideModal(false)} title="How to use the App">
        <div style={{ padding: 'var(--space-2)' }}>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Why use Mullonkal Sand?</h3>
          <p className="text-muted" style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
            We provide high-quality sand directly to your construction sites without the hassle of traditional ordering. This app acts as your secure, direct bridge to our inventory and delivery team.
          </p>

          <h3 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>How it Works</h3>
          <ul className="text-muted" style={{ listStyle: 'disc', paddingLeft: 'var(--space-4)', fontSize: 'var(--font-size-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li><strong>Register:</strong> Sign up with your proper details. An admin will verify and approve your account for safety purposes.</li>
            <li><strong>Order Items:</strong> Once approved, login, browse the available sand loads, and add them to your cart.</li>
            <li><strong>Delivery:</strong> Submit your cart. You can track your order status (Pending → Confirmed → Completed) right from the dashboard.</li>
            <li><strong>Support:</strong> Have questions? Use the messaging feature to chat directly with our admins!</li>
          </ul>
        </div>
        <div className="mt-6 text-center">
          <button className="btn btn-primary btn-full" onClick={() => setGuideModal(false)}>Got it!</button>
        </div>
      </Modal>

      {/* Contact Modal */}
      <Modal isOpen={contactModal} onClose={() => setContactModal(false)} title="Contact Admin">
        <div style={{ padding: 'var(--space-2)' }}>
          <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
            Please reach out to the admin directly if you cannot access your account or need immediate assistance.
          </p>
          {loadingContact ? (
            <div className="flex-center py-4"><div className="spinner spinner-sm" /></div>
          ) : contactInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {contactInfo.phone && (
                <a href={`tel:${contactInfo.phone}`} className="card glass-panel flex-between" style={{ padding: 'var(--space-3)', color: 'var(--color-text)' }}>
                  <span style={{ fontWeight: 600 }}>Phone</span>
                  <span style={{ color: 'var(--color-primary)' }}>{contactInfo.phone}</span>
                </a>
              )}
              {contactInfo.email && (
                <a href={`mailto:${contactInfo.email}`} className="card glass-panel flex-between" style={{ padding: 'var(--space-3)', color: 'var(--color-text)' }}>
                  <span style={{ fontWeight: 600 }}>Email</span>
                  <span style={{ color: 'var(--color-primary)' }}>{contactInfo.email}</span>
                </a>
              )}
            </div>
          ) : (
            <p className="text-muted text-center">Contact information is currently unavailable.</p>
          )}
        </div>
        <div className="mt-6 text-center">
          <button className="btn btn-secondary btn-full" onClick={() => setContactModal(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
}
