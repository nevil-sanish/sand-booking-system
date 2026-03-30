import { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { getInitials, formatPhone } from '../../utils/formatters';
import { validatePassword } from '../../utils/validators';
import {
  Users, UserCheck, UserX, AlertTriangle, Flag, FlagOff, Lock, Shield, Save
} from 'lucide-react';

export default function AdminUsersPage() {
  const { users, loading, approveUser, rejectUser, flagUser, setUserPassword, getPendingUsers, getApprovedUsers, getRejectedUsers } = useUsers();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [passwordModal, setPasswordModal] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = (user) => {
    setPasswordModal(user);
    setPassword('');
    setPasswordError('');
  };

  const handleApproveSubmit = async () => {
    const err = validatePassword(password);
    if (err) {
      setPasswordError(err);
      return;
    }

    setSubmitting(true);
    try {
      await approveUser(passwordModal.id, password);
      toast.success(`${passwordModal.name} approved`);
      setPasswordModal(null);
    } catch {
      toast.error('Failed to approve user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlag = async (user) => {
    try {
      await flagUser(user.id, !user.flagged);
      toast.success(user.flagged ? 'User unflagged' : 'User flagged as suspicious');
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleResetPassword = (user) => {
    setPasswordModal({ ...user, isReset: true });
    setPassword('');
    setPasswordError('');
  };

  const handleResetPasswordSubmit = async () => {
    const err = validatePassword(password);
    if (err) {
      setPasswordError(err);
      return;
    }

    setSubmitting(true);
    try {
      await setUserPassword(passwordModal.id, password);
      toast.success('Password updated');
      setPasswordModal(null);
    } catch {
      toast.error('Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner text="Loading users..." />;

  const pendingUsers = getPendingUsers();
  const approvedUsers = getApprovedUsers();
  const rejectedUsers = getRejectedUsers();
  
  let displayUsers = [];
  if (activeTab === 'pending') displayUsers = pendingUsers;
  else if (activeTab === 'approved') displayUsers = approvedUsers;
  else if (activeTab === 'rejected') displayUsers = rejectedUsers;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Users</h1>

      <div className="tabs mb-4">
        <button
          className={`tab ${activeTab === 'pending' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
          {pendingUsers.length > 0 && <span className="tab-count">{pendingUsers.length}</span>}
        </button>
        <button
          className={`tab ${activeTab === 'approved' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved
          <span className="tab-count">{approvedUsers.length}</span>
        </button>
        <button
          className={`tab ${activeTab === 'rejected' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected
          <span className="tab-count">{rejectedUsers.length}</span>
        </button>
      </div>

      {displayUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={activeTab === 'pending' ? 'No Pending Users' : activeTab === 'approved' ? 'No Approved Users' : 'No Rejected Users'}
          description={activeTab === 'pending'
            ? 'New user registrations will appear here.'
            : activeTab === 'approved'
              ? 'Approved users will appear here.'
              : 'Rejected users will appear here.'
          }
        />
      ) : (
        <div className="stagger-children">
          {displayUsers.map(u => (
            <div key={u.id} className="card admin-user-card">
              <div className="avatar">
                {getInitials(u.name)}
              </div>
              <div className="admin-user-info">
                <p className="admin-user-name" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {u.name}
                  {u.flagged && (
                    <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />
                  )}
                </p>
                <p className="admin-user-phone">{formatPhone(u.phone)}</p>
                {u.role === 'admin' && (
                  <span className="badge badge-confirmed" style={{ marginTop: 4 }}>
                    <Shield size={10} /> Admin
                  </span>
                )}
              </div>
              <div className="admin-user-actions">
                {u.status === 'pending' ? (
                  <>
                    <button
                      className="btn btn-danger btn-sm ripple"
                      onClick={() => handleReject(u)}
                    >
                      <UserX size={14} />
                      Reject
                    </button>
                    <button
                      className="btn btn-success btn-sm ripple"
                      onClick={() => handleApprove(u)}
                      id={`approve-${u.id}`}
                    >
                      <UserCheck size={14} />
                      Approve
                    </button>
                  </>
                ) : u.status === 'approved' ? (
                  <>
                    <button
                      className={`btn btn-sm ripple ${u.flagged ? 'btn-secondary' : 'btn-ghost'}`}
                      onClick={() => handleFlag(u)}
                      title={u.flagged ? 'Unflag' : 'Flag as suspicious'}
                      id={`flag-${u.id}`}
                      style={u.flagged ? { color: 'var(--color-warning)' } : {}}
                    >
                      {u.flagged ? <FlagOff size={14} /> : <Flag size={14} />}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm ripple"
                      onClick={() => handleResetPassword(u)}
                      title="Reset Password"
                      id={`reset-pw-${u.id}`}
                    >
                      <Lock size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-success btn-sm ripple"
                    onClick={() => handleApprove(u)}
                  >
                    <UserCheck size={14} />
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve / Reset Password Modal */}
      <Modal
        isOpen={!!passwordModal}
        onClose={() => setPasswordModal(null)}
        title={passwordModal?.isReset ? 'Reset Password' : `Approve ${passwordModal?.name}`}
        footer={
          <>
            <button className="btn btn-secondary btn-full" onClick={() => setPasswordModal(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary btn-full ripple"
              onClick={passwordModal?.isReset ? handleResetPasswordSubmit : handleApproveSubmit}
              disabled={submitting}
              id="password-modal-submit"
            >
              {submitting ? <div className="spinner spinner-sm" /> : (
                <><Save size={16} /> {passwordModal?.isReset ? 'Update Password' : 'Approve & Set Password'}</>
              )}
            </button>
          </>
        }
      >
        <p className="text-muted mb-4">
          {passwordModal?.isReset
            ? `Set a new password for ${passwordModal?.name}`
            : `Set an initial password for ${passwordModal?.name} to complete approval.`
          }
        </p>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="form-input-icon">
            <Lock />
            <input
              type="text"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              id="user-password-input"
            />
          </div>
          {passwordError && <p className="form-error">{passwordError}</p>}
        </div>
      </Modal>
    </div>
  );
}
