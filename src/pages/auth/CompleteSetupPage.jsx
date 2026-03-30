import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';
import { useToast } from '../../contexts/ToastContext';
import { Mountain, Lock, Phone } from 'lucide-react';

export default function CompleteSetupPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { completeRegistration } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error('Please enter your phone number and new password');
      return;
    }
    
    setSubmitting(true);
    try {
      await completeRegistration(phone, password);
      navigate('/');
      toast.success('Password set successfully! Welcome to ' + APP_NAME);
    } catch (err) {
      toast.error(err.message || 'Failed to complete setup. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout animate-fade-in" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 'var(--space-4)'
    }}>
      <div className="card glass-panel auth-card" style={{ width: '100%', maxWidth: '360px', padding: 'var(--space-6)' }}>
        <div className="text-center mb-6">
          <div className="avatar avatar-lg" style={{ margin: '0 auto var(--space-4)', background: 'var(--color-primary-light)', color: '#fff' }}>
            <img src="/logo.png" alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Complete Setup</h1>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
            Your account was approved! Please set your password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group hover-lift">
            <div className="form-input-icon">
              <Phone size={18} />
              <input
                type="tel"
                className="form-input glass"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group hover-lift">
            <div className="form-input-icon">
              <Lock size={18} />
              <input
                type="password"
                className="form-input glass"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full hover-lift mt-2"
            disabled={submitting}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            {submitting ? <div className="spinner spinner-sm" /> : 'Set Password & Login'}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ fontSize: 'var(--font-size-sm)' }}>
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
