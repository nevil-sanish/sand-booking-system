import { useState } from 'react';
import { useItems } from '../../hooks/useItems';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { formatPrice } from '../../utils/formatters';
import { validateItemName, validatePrice } from '../../utils/validators';
import { Plus, Edit2, Mountain, Save } from 'lucide-react';

export default function AdminItemsPage() {
  const { items, loading, addItem, updateItem, toggleItem } = useItems(false);
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', unit: 'load' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: '', price: '', unit: 'load' });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditing(item);
    setForm({ name: item.name, price: String(item.price), unit: item.unit || 'load' });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const nameErr = validateItemName(form.name);
    const priceErr = validatePrice(form.price);
    if (nameErr || priceErr) {
      setErrors({ name: nameErr, price: priceErr });
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await updateItem(editing.id, {
          name: form.name.trim(),
          price: Number(form.price),
          unit: form.unit,
        });
        toast.success('Item updated');
      } else {
        await addItem({
          name: form.name.trim(),
          price: Number(form.price),
          unit: form.unit,
        });
        toast.success('Item added');
      }
      setModalOpen(false);
    } catch {
      toast.error('Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleItem(item.id, !item.active);
      toast.success(item.active ? 'Item disabled' : 'Item enabled');
    } catch {
      toast.error('Failed to update item');
    }
  };

  if (loading) return <Spinner text="Loading items..." />;

  return (
    <div className="animate-fade-in">
      <div className="flex-between mb-4">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Items</h1>
        <button className="btn btn-primary btn-sm ripple" onClick={openAddModal} id="add-item-btn">
          <Plus size={16} />
          Add Item
        </button>
      </div>

      <div className="stagger-children">
        {items.map(item => (
          <div key={item.id} className="card admin-item-card">
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)',
              background: item.active ? 'rgba(var(--color-primary-rgb), 0.12)' : 'var(--color-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Mountain size={22} style={{ color: item.active ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
            </div>
            <div className="admin-item-info">
              <p className="admin-item-name">{item.name}</p>
              <p className="admin-item-price">{formatPrice(item.price)} / {item.unit || 'load'}</p>
              <p className="admin-item-status">
                {item.active ? '● Active' : '○ Disabled'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => openEditModal(item)}
                title="Edit"
                id={`edit-item-${item.id}`}
              >
                <Edit2 size={18} />
              </button>
              <button
                className={`switch ${item.active ? 'switch-active' : ''}`}
                onClick={() => handleToggle(item)}
                title={item.active ? 'Disable' : 'Enable'}
                id={`toggle-item-${item.id}`}
              />
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="empty-state">
          <Mountain style={{ width: 64, height: 64, opacity: 0.3 }} />
          <h3>No Items Yet</h3>
          <p>Add your first sand item to start receiving orders.</p>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Item' : 'Add New Item'}
        footer={
          <>
            <button className="btn btn-secondary btn-full" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary btn-full ripple"
              onClick={handleSubmit}
              disabled={submitting}
              id="save-item-btn"
            >
              {submitting ? <div className="spinner spinner-sm" /> : (
                <><Save size={16} /> {editing ? 'Update' : 'Add Item'}</>
              )}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Item Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. River Sand, M-Sand"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            id="item-name-input"
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Price (₹)</label>
          <input
            type="number"
            className="form-input"
            placeholder="Enter price"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            id="item-price-input"
            min="0"
          />
          {errors.price && <p className="form-error">{errors.price}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <select
            className="form-input form-select"
            value={form.unit}
            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
            id="item-unit-select"
          >
            <option value="load">Load</option>
            <option value="ton">Ton</option>
            <option value="cubic meter">Cubic Meter</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
