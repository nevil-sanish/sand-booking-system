import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Spinner from '../../components/common/Spinner';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

export default function ContactFeedbackPage() {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'config', 'contact'));
        if (docSnap.exists()) {
          setContactInfo(docSnap.data());
        }
      } catch (err) {
        console.error('Failed to load contact info', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        message: feedback.trim(),
        read: false,
        createdAt: serverTimestamp()
      });
      setFeedback('');
      toast.success('Your feedback has been submitted successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit feedback. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner text="Loading contact information..." />;

  return (
    <div className="animate-fade-in app-shell-user" style={{ paddingBottom: 80 }}>
      {/* Contact Section */}
      <h1 className="page-title mb-4">Contact Admin</h1>
      <div className="card glass-panel mb-8" style={{ padding: 'var(--space-4)' }}>
        <p className="text-muted mb-4" style={{ fontSize: 'var(--font-size-sm)' }}>
          Reach out to the administration directly using the details below for any major concerns or assistance.
        </p>

        {contactInfo ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {contactInfo.phone && (
              <a href={`tel:${contactInfo.phone}`} className="card glass-panel flex-between card-clickable" style={{ padding: 'var(--space-3)', color: 'var(--color-text)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Phone size={16} className="text-muted" />
                  <span style={{ fontWeight: 600 }}>Phone</span>
                </div>
                <span style={{ color: 'var(--color-primary)' }}>{contactInfo.phone}</span>
              </a>
            )}
            {contactInfo.email && (
              <a href={`mailto:${contactInfo.email}`} className="card glass-panel flex-between card-clickable" style={{ padding: 'var(--space-3)', color: 'var(--color-text)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Mail size={16} className="text-muted" />
                  <span style={{ fontWeight: 600 }}>Email</span>
                </div>
                <span style={{ color: 'var(--color-primary)' }}>{contactInfo.email}</span>
              </a>
            )}
            {contactInfo.address && (
              <div className="card glass-panel flex-between" style={{ padding: 'var(--space-3)', color: 'var(--color-text)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <MapPin size={16} className="text-muted" />
                  <span style={{ fontWeight: 600 }}>Address</span>
                </div>
                <span style={{ textAlign: 'right', fontSize: 'var(--font-size-sm)' }}>{contactInfo.address}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted">Contact details are not set.</p>
        )}
      </div>

      {/* Feedback Section */}
      <h2 className="section-title mb-4">Send Feedback</h2>
      <div className="card glass-panel" style={{ padding: 'var(--space-4)' }}>
        <p className="text-muted mb-4" style={{ fontSize: 'var(--font-size-sm)' }}>
          Have any suggestions, complaints, or app issues? Send us a direct message below.
        </p>
        <form onSubmit={handleFeedbackSubmit}>
          <textarea
            className="form-input mb-4"
            rows="4"
            placeholder="Write your message here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            style={{ resize: 'none' }}
          ></textarea>
          <button 
            type="submit" 
            className="btn btn-primary btn-full ripple"
            disabled={submitting || !feedback.trim()}
          >
            {submitting ? <div className="spinner spinner-sm" /> : <><Send size={18} /> Submit Feedback</>}
          </button>
        </form>
      </div>
    </div>
  );
}
