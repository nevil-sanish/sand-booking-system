import { useState, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { validatePhone, validatePassword } from '../../utils/validators';
import Modal from '../../components/common/Modal';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Hyperspeed = lazy(() => import('../../components/animations/Hyperspeed'));

const hyperspeedOptions = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x080404,
    shoulderLines: 0xE2A16F,
    brokenLines: 0xE2A16F,
    leftCars: [0xE2A16F, 0xD4956A, 0xC08050],
    rightCars: [0x86B0BD, 0x5C8A98, 0x4A7585],
    sticks: 0xE2A16F,
  }
};



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

      {/* Hyperspeed background — pointer-events disabled so canvas never steals focus */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <Hyperspeed effectOptions={hyperspeedOptions} />
        </Suspense>
      </div>

      {/* ── Glass card ── */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(226, 161, 111, 0.05)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderRadius: '24px',
        border: '1px solid rgba(226, 161, 111, 0.22)',
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.03) inset,' +
          '0 8px 32px rgba(0,0,0,0.55),' +
          '0 0 80px rgba(226,161,111,0.07)',
        padding: '40px 32px 32px',
        position: 'relative',
        zIndex: 10,
      }}>


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
                background: 'rgba(0, 0, 0, 0.28)',
                borderRadius: '12px',
                padding: '0 14px',
                border: errors.phone ? '1.5px solid #EF4444' : '1px solid rgba(226, 161, 111, 0.2)',
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
                background: 'rgba(0, 0, 0, 0.28)',
                borderRadius: '12px',
                padding: '0 14px',
                border: errors.password ? '1.5px solid #EF4444' : '1px solid rgba(226, 161, 111, 0.2)',
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
