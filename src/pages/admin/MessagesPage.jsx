import { useState } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { useUsers } from '../../hooks/useUsers';
import { useToast } from '../../contexts/ToastContext';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { getInitials, formatPhone, formatRelativeTime } from '../../utils/formatters';
import { validateMessage } from '../../utils/validators';
import {
  MessageSquare, Send, Check, CheckCheck, User, ChevronRight, ArrowLeft
} from 'lucide-react';

export default function AdminMessagesPage() {
  const { messages, loading: messagesLoading, sendMessage, getMessagesByUser } = useMessages(null, true);
  const { users, loading: usersLoading, getApprovedUsers } = useUsers();
  const toast = useToast();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const err = validateMessage(messageText);
    if (err) {
      toast.warning(err);
      return;
    }

    setSending(true);
    try {
      await sendMessage(selectedUser.id, messageText.trim());
      setMessageText('');
      toast.success('Message sent');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (messagesLoading || usersLoading) return <Spinner text="Loading..." />;

  const approvedUsers = getApprovedUsers().filter(u => u.role !== 'admin');

  // List of users view
  if (!selectedUser) {
    return (
      <div className="animate-fade-in">
        <h1 className="page-title">Messages</h1>

        {approvedUsers.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No Users"
            description="Approved users will appear here for you to message."
          />
        ) : (
          <div className="stagger-children">
            {approvedUsers.map(u => {
              const userMsgs = getMessagesByUser(u.id);
              const lastMsg = userMsgs[0];
              const unseenCount = userMsgs.filter(m => m.status !== 'seen').length;

              return (
                <div
                  key={u.id}
                  className="card card-clickable"
                  onClick={() => setSelectedUser(u)}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)' }}
                  id={`user-msg-${u.id}`}
                >
                  <div className="avatar">
                    {getInitials(u.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600 }}>{u.name}</p>
                    <p className="text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lastMsg ? lastMsg.content : 'No messages yet'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {lastMsg && (
                      <span className="text-muted" style={{ fontSize: 10 }}>
                        {formatRelativeTime(lastMsg.createdAt)}
                      </span>
                    )}
                    {unseenCount > 0 && (
                      <span className="nav-badge" style={{ position: 'static' }}>{unseenCount}</span>
                    )}
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Conversation view
  const userMessages = getMessagesByUser(selectedUser.id).slice().reverse();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedUser(null)}>
            <ArrowLeft size={20} />
          </button>
          <div className="avatar avatar-sm">
            {getInitials(selectedUser.name)}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 'var(--font-size-base)' }}>{selectedUser.name}</p>
            <p className="text-muted" style={{ fontSize: 10 }}>{formatPhone(selectedUser.phone)}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-list" style={{ marginBottom: 80 }}>
        {userMessages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No Messages"
            description={`Start a conversation with ${selectedUser.name}`}
          />
        ) : (
          userMessages.map(msg => (
            <div key={msg.id} className={`message-bubble ${msg.senderId === 'admin' ? 'message-outgoing' : 'message-incoming'}`}>
              <p>{msg.content}</p>
              <div className="message-time" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{msg.createdAt ? formatRelativeTime(msg.createdAt) : ''}</span>
                <span className={`message-status ${msg.status === 'seen' ? 'message-status-seen' : ''}`}>
                  {msg.status === 'seen' ? <CheckCheck size={12} /> : <Check size={12} />}
                  {msg.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="message-input-bar">
        <input
          type="text"
          className="form-input"
          placeholder="Type a message..."
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          id="admin-message-input"
        />
        <button
          className="btn btn-primary btn-icon ripple"
          onClick={handleSend}
          disabled={sending || !messageText.trim()}
          id="admin-send-btn"
        >
          {sending ? <div className="spinner spinner-sm" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
}
