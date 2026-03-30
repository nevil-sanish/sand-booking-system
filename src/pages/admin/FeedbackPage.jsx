import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '../../contexts/ToastContext';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { MessageCircle, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFeedbacks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error(error);
      toast.error('Failed to load feedback');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const markAsRead = async (id, currentStatus) => {
    if (currentStatus) return; // Already read
    try {
      await updateDoc(doc(db, 'feedback', id), { read: true });
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await deleteDoc(doc(db, 'feedback', id));
      toast.success('Feedback deleted');
    } catch {
      toast.error('Failed to delete feedback');
    }
  };

  if (loading) return <Spinner text="Loading feedback..." />;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">User Feedback</h1>
      
      {feedbacks.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No Feedback"
          description="You have not received any feedback from users yet."
        />
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {feedbacks.map(f => (
            <div key={f.id} className="card glass-panel card-clickable" style={{ padding: 'var(--space-4)', borderLeft: f.read ? 'none' : '4px solid var(--color-primary)' }} onClick={() => markAsRead(f.id, f.read)}>
              <div className="flex-between mb-2">
                <div>
                  <h3 style={{ fontWeight: 600 }}>{f.userName}</h3>
                  <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{f.userPhone}</span>
                </div>
                <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                  {f.createdAt ? formatRelativeTime(f.createdAt) : ''}
                </span>
              </div>
              <p style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-3)', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>
                {f.message}
              </p>
              <div className="flex-between">
                <span className={`badge ${f.read ? 'badge-confirmed' : 'badge-pending'}`}>
                  {f.read ? 'Reviewed' : 'New'}
                </span>
                <button className="btn btn-ghost btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); deleteFeedback(f.id); }}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
