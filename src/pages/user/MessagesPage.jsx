import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../hooks/useMessages';
import { useToast } from '../../contexts/ToastContext';
import Spinner from '../../components/common/Spinner';
import { MessageSquare, Check, CheckCheck, Send } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';
import { MESSAGE_STATUSES } from '../../utils/constants';

export default function MessagesPage() {
  const { user } = useAuth();
  const { messages, loading, markAsSeen, sendMessage } = useMessages(user?.id);
  const toast = useToast();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

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

  // Clear BottomNav badge via localStorage (reliable even if Firestore rules block user writes)
  // Also attempt Firestore status update as a best-effort
  useEffect(() => {
    if (loading || !user?.id) return;
    // Stamp the current time so BottomNav knows which messages are "seen"
    const seenKey = `msgs_seen_at_${user.id}`;
    localStorage.setItem(seenKey, String(Date.now()));
    window.dispatchEvent(new Event('msgs-seen'));
    // Best-effort Firestore update
    messages.forEach(msg => {
      if (msg.senderId === 'admin' && msg.status !== MESSAGE_STATUSES.SEEN) {
        markAsSeen(msg.id);
      }
    });
  }, [messages]);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <Spinner text="Loading messages..." />;

  // Display messages oldest → newest (hook returns newest-first, so reverse)
  const chronological = [...messages].reverse();

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100dvh - var(--header-height) - var(--bottom-nav-height))',
        maxWidth: '600px',
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      <h1 className="page-title" style={{ padding: 'var(--space-4) var(--space-4) var(--space-2)', flexShrink: 0 }}>
        Messages
      </h1>

      {/* Chat Area */}
      <div
        className="custom-scrollbar"
        style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-4) var(--space-3)' }}
      >
        {chronological.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-10)' }}>
            <MessageSquare size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No messages yet — say hi! 👋
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {chronological.map(msg => (
              <div
                key={msg.id}
                className={`message-bubble ${msg.senderId === user.id ? 'message-outgoing' : 'message-incoming'}`}
              >
                <p>{msg.content}</p>
                <div className="message-time" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span>{msg.createdAt ? formatRelativeTime(msg.createdAt) : ''}</span>
                  {msg.senderId === user.id && (
                    <span className={`message-status ${msg.status === 'seen' ? 'message-status-seen' : ''}`}>
                      {msg.status === 'seen' ? <CheckCheck size={12} /> : <Check size={12} />}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input Bar — always visible so user can initiate conversation */}
      <div
        className="message-input-bar glass-panel"
        style={{
          flexShrink: 0,
          borderRadius: 0,
          borderTop: '1px solid var(--color-border)',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          padding: 'var(--space-3)',
        }}
      >
        <input
          type="text"
          className="form-input"
          placeholder="Message admin..."
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          autoComplete="off"
          enterKeyHint="send"
        />
        <button
          className="btn btn-primary btn-icon ripple"
          onClick={handleSend}
          disabled={sending || !messageText.trim()}
          id="send-message-btn"
        >
          {sending ? <div className="spinner spinner-sm" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
}
