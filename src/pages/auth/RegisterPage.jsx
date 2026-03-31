import { useState, lazy, Suspense } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Phone, UserIcon, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { validatePhone, validateName } from '../../utils/validators';

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

const inputStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '0 14px',
  border: '1px solid rgba(226, 161, 111, 0.15)',
  transition: 'border-color 0.2s',
};

const fieldStyle = {
  flex: 1,
  padding: '14px 0',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: '14px',
  color: '#FFF0DD',
  fontFamily: 'var(--font-family)',
};

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const Wrapper = ({ children }) => (
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
      <Suspense fallback={null}>
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </Suspense>
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
      }}>
        {children}
      </div>
    </div>
  );

  if (success) {
    return (
      <Wrapper>
        <div style={{ textAlign: 'center' }}>
          <CheckCircle style={{ width: 64, height: 64, color: '#4ADE80', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFF0DD', marginBottom: '8px' }}>
            Registration Successful!
          </h2>
          <p style={{ color: 'rgba(226,161,111,0.6)', fontSize: '13px', marginBottom: '24px', lineHeight: 1.5 }}>
            Your account is under verification. Once the admin approves, you can login with your phone and password.
          </p>
          <Link
            to="/login"
            style={{
              display: 'block',
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #E2A16F, #C08050)',
              color: '#1a0f0a',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '15px',
              textDecoration: 'none',
            }}
          >
            Go to Sign In
          </Link>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {/* Logo */}
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

      <h1 style={{
        textAlign: 'center',
        fontSize: '22px',
        fontWeight: 700,
        color: '#FFF0DD',
        marginBottom: '6px',
        fontFamily: 'var(--font-family)',
      }}>
        Create Account
      </h1>

      <p style={{
        textAlign: 'center',
        fontSize: '13px',
        color: 'rgba(226, 161, 111, 0.6)',
        marginBottom: '28px',
      }}>
        Register to start ordering sand
      </p>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ ...inputStyle, border: errors.name ? '1.5px solid #EF4444' : inputStyle.border }}>
            <UserIcon size={18} color="#E2A16F" />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              id="register-name"
              style={fieldStyle}
            />
          </div>
          {errors.name && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', paddingLeft: '14px' }}>{errors.name}</p>}
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ ...inputStyle, border: errors.phone ? '1.5px solid #EF4444' : inputStyle.border }}>
            <Phone size={18} color="#E2A16F" />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              id="register-phone"
              maxLength={10}
              style={fieldStyle}
            />
          </div>
          {errors.phone && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', paddingLeft: '14px' }}>{errors.phone}</p>}
        </div>

        {/* Password */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ ...inputStyle, border: errors.password ? '1.5px solid #EF4444' : inputStyle.border }}>
            <Lock size={18} color="#E2A16F" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              id="register-password"
              style={fieldStyle}
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

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          id="register-submit"
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
            transition: 'opacity 0.2s',
            border: 'none',
            fontFamily: 'var(--font-family)',
          }}
        >
          {submitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '24px 0 16px',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(226, 161, 111, 0.15)' }} />
        <span style={{ fontSize: '11px', color: 'rgba(226,161,111,0.4)', whiteSpace: 'nowrap' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(226, 161, 111, 0.15)' }} />
      </div>

      <Link
        to="/login"
        style={{
          display: 'block',
          width: '100%',
          padding: '12px',
          background: 'rgba(226, 161, 111, 0.08)',
          border: '1px solid rgba(226, 161, 111, 0.15)',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#E2A16F',
          fontWeight: 500,
          fontFamily: 'var(--font-family)',
          textDecoration: 'none',
          transition: 'background 0.2s',
        }}
      >
        Already have an account? Sign In
      </Link>
    </Wrapper>
  );
}
