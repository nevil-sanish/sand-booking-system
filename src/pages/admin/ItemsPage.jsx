import { useState } from 'react';
import { useItems } from '../../hooks/useItems';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { formatPrice } from '../../utils/formatters';
import { validateItemName, validatePrice } from '../../utils/validators';
import { Plus, Edit2, Mountain, Save, Trash2 } from 'lucide-react';

export default function AdminItemsPage() {
  const { items, loading, addItem, updateItem, toggleItem, deleteItem } = useItems(false);
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
    setForm({ name: item.name, price: item.price != null ? String(item.price) : '', unit: item.unit || 'load' });
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
    // Price is optional — save null when field is blank
    const priceValue = form.price !== '' ? Number(form.price) : null;
    try {
      if (editing) {
        await updateItem(editing.id, {
          name: form.name.trim(),
          price: priceValue,
          unit: form.unit,
        });
        toast.success('Item updated');
      } else {
        await addItem({
          name: form.name.trim(),
          price: priceValue,
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

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await deleteItem(item.id);
        toast.success('Item deleted successfully');
      } catch {
        toast.error('Failed to delete item');
      }
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

      <div className="dashboard-grid stagger-children">
        {items.map(item => (
          <div key={item.id} className="card admin-item-card glass-panel hover-lift" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-5)' }}>
            <div className="flex-between w-full" style={{ width: '100%', marginBottom: 'var(--space-3)' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                background: item.active ? 'rgba(var(--color-primary-rgb), 0.12)' : 'var(--color-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Mountain size={22} style={{ opacity: item.active ? 1 : 0.5, color: item.active ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
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
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => handleDelete(item)}
                  title="Delete"
                  id={`delete-item-${item.id}`}
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="admin-item-info" style={{ width: '100%' }}>
              <p className="admin-item-name" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-1)' }}>{item.name}</p>
              <p className="admin-item-price" style={{ fontSize: 'var(--font-size-xl)' }}>
                {item.price != null && item.price > 0
                  ? <>{formatPrice(item.price)} <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: 400 }}>/ {item.unit || 'load'}</span></>
                  : <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 400 }}>Price not set</span>
                }
              </p>
              <p className="admin-item-status mt-4" style={{ display: 'inline-block', padding: '4px 12px', background: item.active ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255,255,255,0.05)', color: item.active ? 'var(--color-success)' : 'var(--color-text-muted)', borderRadius: 'var(--radius-full)' }}>
                {item.active ? 'Active' : 'Disabled'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="empty-state">
          <Mountain size={64} style={{ opacity: 0.3, color: 'var(--color-primary)' }} />
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
          <label className="form-label">
            Price (₹) <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: '0.75em' }}>(optional)</span>
          </label>
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
