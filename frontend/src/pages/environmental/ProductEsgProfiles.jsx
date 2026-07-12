import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import environmentalService from '../../services/environmentalService';
import Table from '../../components/common/Table/Table';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common/module.css';

const ESG_RATINGS = ['A', 'B', 'C', 'D', 'E'];

function ProductEsgProfiles() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ product_name: '', sku: '', carbon_per_unit: '', recyclable: false, esg_rating: 'A', notes: '', status: 'active' });

  const { data, loading, error, refetch } = useApi(() => environmentalService.listProductProfiles(), []);
  const items = data?.items || data || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    if (editItem) await environmentalService.updateProductProfile(editItem.id, values);
    else await environmentalService.createProductProfile(values);
    refetch();
    setShowModal(false);
    setEditItem(null);
    setForm({ product_name: '', sku: '', carbon_per_unit: '', recyclable: false, esg_rating: 'A', notes: '', status: 'active' });
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete this profile?')) return;
    await environmentalService.deleteProductProfile(id);
    refetch();
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      product_name: item.product_name,
      sku: item.sku || '',
      carbon_per_unit: item.carbon_per_unit,
      recyclable: item.recyclable || false,
      esg_rating: item.esg_rating || 'A',
      notes: item.notes || '',
      status: item.status || 'active',
    });
    setShowModal(true);
  };

  const columns = [
    { key: 'product_name', title: 'Product' },
    { key: 'sku', title: 'SKU' },
    { key: 'carbon_per_unit', title: 'Carbon per Unit', render: (r) => `${r.carbon_per_unit} kg CO₂` },
    { key: 'recyclable', title: 'Recyclable', render: (r) => r.recyclable ? '🟢 Yes' : '🔴 No' },
    { key: 'esg_rating', title: 'ESG Rating', render: (r) => <span className={`status-badge status-badge--${r.esg_rating === 'A' || r.esg_rating === 'B' ? 'active' : 'rejected'}`}>{r.esg_rating}</span> },
    { key: 'status', title: 'Status', render: (r) => <span className={`status-badge status-badge--${r.status}`}>{r.status}</span> },
    ...(canManage
      ? [
          {
            key: 'actions',
            title: '',
            render: (r) => (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" size="sm" onClick={() => openEdit(r)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => remove(r.id)}>Delete</Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    save({
      ...form,
      carbon_per_unit: Number(form.carbon_per_unit),
      recyclable: Boolean(form.recyclable),
      sku: form.sku || null,
      esg_rating: form.esg_rating || null,
    });
  };

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      <div className="module-toolbar">
        {canManage && (
          <Button variant="secondary" onClick={() => { setEditItem(null); setForm({ product_name: '', sku: '', carbon_per_unit: '', recyclable: false, esg_rating: 'A', notes: '', status: 'active' }); setShowModal(true); }}>
            + New Profile
          </Button>
        )}
      </div>
      <div className="module-table-card">
        <Table columns={columns} data={items} loading={loading} />
      </div>
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit ESG Profile' : 'New ESG Profile'}
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-field">
            <label>Product Name *</label>
            <input required value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>SKU</label>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. ECO-500" />
            </div>
            <div className="modal-form-field">
              <label>Carbon Footprint per Unit (kg) *</label>
              <input required type="number" step="0.0001" value={form.carbon_per_unit} onChange={(e) => setForm({ ...form, carbon_per_unit: e.target.value })} />
            </div>
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>ESG Rating</label>
              <select value={form.esg_rating} onChange={(e) => setForm({ ...form, esg_rating: e.target.value })}>
                {ESG_RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="modal-form-field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
            <input type="checkbox" id="recyclable" checked={form.recyclable} onChange={(e) => setForm({ ...form, recyclable: e.target.checked })} />
            <label htmlFor="recyclable" style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Recyclable Product</label>
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProductEsgProfiles;
