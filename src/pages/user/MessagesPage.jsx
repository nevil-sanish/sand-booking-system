import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../hooks/useMessages';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { MessageSquare, Check, CheckCheck } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';
import { MESSAGE_STATUSES } from '../../utils/constants';

export default function MessagesPage() {
  const { user } = useAuth();
  const { messages, loading, markAsSeen } = useMessages(user?.id);

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

      <div className="messages-list stagger-children">
        {messages.map(msg => (
          <div key={msg.id} className="message-bubble message-incoming">
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
    </div>
  );
}
