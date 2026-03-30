import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '../../contexts/ToastContext';
import { Save, Phone, Mail, MapPin } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

export default function EditContactPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: ''
  });
  const toast = useToast();

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'config', 'contact'));
        if (docSnap.exists()) {
          setContactInfo(docSnap.data());
        }
      } catch (err) {
        console.error('Error fetching contact info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'contact'), contactInfo);
      toast.success('Contact information updated successfully');
    } catch (err) {
      toast.error('Failed to update contact info');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner text="Loading settings..." />;

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">Edit Contact Info</h1>

      <div className="card glass-panel p-6" style={{ padding: 'var(--space-6)' }}>
        <p className="text-muted mb-6">
          This information will be displayed to users who need to contact the administration.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group hover-lift">
            <label className="form-label">Support Phone</label>
            <div className="form-input-icon">
              <Phone />
              <input
                type="tel"
                className="form-input glass"
                value={contactInfo.phone}
                onChange={e => setContactInfo({...contactInfo, phone: e.target.value})}
                placeholder="+91 999 999 9999"
              />
            </div>
          </div>

          <div className="form-group hover-lift">
            <label className="form-label">Support Email</label>
            <div className="form-input-icon">
              <Mail />
              <input
                type="email"
                className="form-input glass"
                value={contactInfo.email}
                onChange={e => setContactInfo({...contactInfo, email: e.target.value})}
                placeholder="admin@mullonkalsand.com"
              />
            </div>
          </div>

          <div className="form-group hover-lift">
            <label className="form-label">Business Address</label>
            <div className="form-input-icon">
              <MapPin />
              <input
                type="text"
                className="form-input glass"
                value={contactInfo.address}
                onChange={e => setContactInfo({...contactInfo, address: e.target.value})}
                placeholder="Mullonkal Sand, Kerala"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg hover-lift mt-4"
            disabled={saving}
          >
            {saving ? <div className="spinner spinner-sm" /> : <><Save size={20} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
