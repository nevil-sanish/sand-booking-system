import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../hooks/useMessages';
import { useToast } from '../../contexts/ToastContext';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { MessageSquare, Check, CheckCheck, Send } from 'lucide-react';
import { useState } from 'react';
import { formatRelativeTime } from '../../utils/formatters';
import { MESSAGE_STATUSES } from '../../utils/constants';

export default function MessagesPage() {
  const { user } = useAuth();
  const { messages, loading, markAsSeen, sendMessage } = useMessages(user?.id);
  const toast = useToast();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    setSending(true);
    try {
      await sendMessage(user.id, messageText.trim());
      setMessageText('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Mark unseen messages as seen on mount / when messages change
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.status !== MESSAGE_STATUSES.SEEN) {
        markAsSeen(msg.id);
      }
    });
  }, [messages]);

  if (loading) return <Spinner text="Loading messages..." />;

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No Messages"
        description="Messages from the admin will appear here."
      />
    );
  }

  return (
    <div className="animate-fade-in app-shell-user" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 className="page-title">Messages</h1>

      <div className="messages-list stagger-children" style={{ marginBottom: 80 }}>
        {messages.map(msg => (
          <div key={msg.id} className={`message-bubble ${msg.senderId === user.id ? 'message-outgoing' : 'message-incoming'}`}>
            <p>{msg.content}</p>
            <div className="message-time" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{msg.createdAt ? formatRelativeTime(msg.createdAt) : ''}</span>
              <span className={`message-status ${msg.status === 'seen' ? 'message-status-seen' : ''}`}>
                {msg.status === 'seen' ? <CheckCheck size={12} /> : <Check size={12} />}
                {msg.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Message Input */}
      <div className="message-input-bar" style={{ position: 'fixed', bottom: 'calc(var(--bottom-nav-height) + var(--space-2))', left: 'var(--space-2)', right: 'var(--space-2)', margin: 'auto' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Type a message..."
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          className="btn btn-primary btn-icon ripple"
          onClick={handleSend}
          disabled={sending || !messageText.trim()}
        >
          {sending ? <div className="spinner spinner-sm" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
}
