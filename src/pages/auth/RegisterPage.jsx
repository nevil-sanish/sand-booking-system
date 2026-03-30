import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Mountain, Phone, UserIcon, CheckCircle } from 'lucide-react';
import { validatePhone, validateName } from '../../utils/validators';
import { APP_NAME } from '../../utils/constants';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateName(name);
    const phoneError = validatePhone(phone);
    if (nameError || phoneError) {
      setErrors({ name: nameError, phone: phoneError });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await register(name.trim(), phone);
      setSuccess(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page animate-fade-in">
        <div className="auth-card">
          <div className="auth-success animate-scale-in">
            <CheckCircle />
            <h2>Registration Successful!</h2>
            <p>
              Your account is pending approval. The admin will review your request
              and set your password. You'll be able to log in once approved.
            </p>
          </div>
          <p className="auth-footer">
            Already approved? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Mountain />
          </div>
          <h1>{APP_NAME}</h1>
          <p>Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="form-input-icon">
              <UserIcon />
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                id="register-name"
              />
            </div>
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

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
                id="register-phone"
                maxLength={10}
              />
            </div>
            {errors.phone && <p className="form-error">{errors.phone}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full ripple"
            disabled={submitting}
            id="register-submit"
          >
            {submitting ? (
              <div className="spinner spinner-sm" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
