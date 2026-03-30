import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Lock, Save } from 'lucide-react';
import { validatePassword } from '../../utils/validators';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { changePassword } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    const currentErr = validatePassword(currentPassword);
    if (currentErr) errs.currentPassword = currentErr;

    const newErr = validatePassword(newPassword);
    if (newErr) errs.newPassword = newErr;

    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (currentPassword === newPassword) {
      errs.newPassword = 'New password must be different from current';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Change Password</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <div className="form-input-icon">
            <Lock />
            <input
              type="password"
              className="form-input"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              id="current-password"
            />
          </div>
          {errors.currentPassword && <p className="form-error">{errors.currentPassword}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <div className="form-input-icon">
            <Lock />
            <input
              type="password"
              className="form-input"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              id="new-password"
            />
          </div>
          {errors.newPassword && <p className="form-error">{errors.newPassword}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <div className="form-input-icon">
            <Lock />
            <input
              type="password"
              className="form-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              id="confirm-password"
            />
          </div>
          {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg btn-full ripple"
          disabled={submitting}
          id="change-password-submit"
        >
          {submitting ? (
            <div className="spinner spinner-sm" />
          ) : (
            <>
              <Save size={20} />
              Update Password
            </>
          )}
        </button>
      </form>
    </div>
  );
}
