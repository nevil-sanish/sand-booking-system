import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { validatePhone, validatePassword } from '../../utils/validators';
import Modal from '../../components/common/Modal';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DotGrid from '../../components/animations/DotGrid';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080404',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* DotGrid Background */}
      <DotGrid
        dotSize={10}
        gap={28}
        baseColor="#3D2A1A"
        activeColor="#E2A16F"
        proximity={180}
        shockRadius={300}
        shockStrength={4}
        style={{ pointerEvents: 'auto' }}
      />
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(20, 12, 8, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px',
        boxShadow: '0 8px 60px rgba(226, 161, 111, 0.1), 0 2px 8px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(226, 161, 111, 0.15)',
        padding: '40px 32px 32px',
        position: 'relative',
        zIndex: 10,
        transform: 'scale(0.75)',
        transformOrigin: 'center center',
      }}>

        {/* Logo Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(226, 161, 111, 0.1)',
          border: '1px solid rgba(226, 161, 111, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 4px 20px rgba(226, 161, 111, 0.15)',
          overflow: 'hidden',
        }}>
          <img src="/logo.png" alt="Logo" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
        </div>

        {/* Title */}
        <h1 style={{
          textAlign: 'center',
          fontSize: '22px',
          fontWeight: 700,
          color: '#FFF0DD',
          marginBottom: '6px',
          fontFamily: 'var(--font-family)',
        }}>
          Mullonkal Sand
        </h1>

        {/* Subtitle */}
        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: 'rgba(226, 161, 111, 0.6)',
          marginBottom: '28px',
          lineHeight: 1.5,
        }}>
          Order premium sand delivered directly<br />to your construction site
        </p>

        {notRegistered ? (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', color: '#EF4444', marginBottom: '8px', fontWeight: 600 }}>
              User is not registered
            </h2>
            <p style={{ color: 'rgba(226,161,111,0.6)', fontSize: '13px', marginBottom: '20px' }}>
              No account found with this number.
            </p>
            <Link
              to={`/register?phone=${phone}`}
              style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #E2A16F, #C08050)',
                color: '#1a0f0a',
                borderRadius: '12px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                marginBottom: '12px',
              }}
            >
              Register Now
            </Link>
            <button
              type="button"
              onClick={() => setNotRegistered(false)}
              style={{
                color: 'rgba(226,161,111,0.5)',
                fontSize: '13px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Try another number
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Phone Input */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '0 14px',
                border: errors.phone ? '1.5px solid #EF4444' : '1px solid rgba(226, 161, 111, 0.15)',
                transition: 'border-color 0.2s',
              }}>
                <Phone size={18} color="#E2A16F" />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  id="login-phone"
                  maxLength={10}
                  style={{
                    flex: 1,
                    padding: '14px 0',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    color: '#FFF0DD',
                    fontFamily: 'var(--font-family)',
                  }}
                />
              </div>
              {errors.phone && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', paddingLeft: '14px' }}>{errors.phone}</p>}
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '0 14px',
                border: errors.password ? '1.5px solid #EF4444' : '1px solid rgba(226, 161, 111, 0.15)',
                transition: 'border-color 0.2s',
              }}>
                <Lock size={18} color="#E2A16F" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  id="login-password"
                  style={{
                    flex: 1,
                    padding: '14px 0',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    color: '#FFF0DD',
                    fontFamily: 'var(--font-family)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={18} color="#E2A16F" /> : <Eye size={18} color="#E2A16F" />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', paddingLeft: '14px' }}>{errors.password}</p>}
            </div>

            {/* Forgot Password */}
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={handleOpenContact}
                style={{
                  color: 'rgba(226,161,111,0.5)',
                  fontSize: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family)',
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              id="login-submit"
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #E2A16F, #C08050)',
                color: '#1a0f0a',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '15px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'opacity 0.2s, transform 0.15s',
                border: 'none',
                fontFamily: 'var(--font-family)',
              }}
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '24px 0 20px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(226, 161, 111, 0.15)' }} />
          <span style={{ fontSize: '11px', color: 'rgba(226,161,111,0.4)', whiteSpace: 'nowrap' }}>Quick links</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(226, 161, 111, 0.15)' }} />
        </div>

        {/* Bottom Links as Button Row */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
        }}>
          <button
            type="button"
            onClick={handleOpenContact}
            style={{
              flex: 1,
              padding: '10px 8px',
              background: 'rgba(226, 161, 111, 0.08)',
              border: '1px solid rgba(226, 161, 111, 0.15)',
              borderRadius: '10px',
              fontSize: '11px',
              color: '#E2A16F',
              cursor: 'pointer',
              fontWeight: 500,
              fontFamily: 'var(--font-family)',
              transition: 'background 0.2s',
            }}
          >
            Contact Admin
          </button>
          <button
            type="button"
            onClick={() => setGuideModal(true)}
            style={{
              flex: 1,
              padding: '10px 8px',
              background: 'rgba(226, 161, 111, 0.08)',
              border: '1px solid rgba(226, 161, 111, 0.15)',
              borderRadius: '10px',
              fontSize: '11px',
              color: '#E2A16F',
              cursor: 'pointer',
              fontWeight: 500,
              fontFamily: 'var(--font-family)',
              transition: 'background 0.2s',
            }}
          >
            How It Works
          </button>
          <Link
            to="/register"
            style={{
              flex: 1,
              padding: '10px 8px',
              background: 'rgba(226, 161, 111, 0.08)',
              border: '1px solid rgba(226, 161, 111, 0.15)',
              borderRadius: '10px',
              fontSize: '11px',
              color: '#E2A16F',
              cursor: 'pointer',
              fontWeight: 500,
              fontFamily: 'var(--font-family)',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            Register
          </Link>
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
