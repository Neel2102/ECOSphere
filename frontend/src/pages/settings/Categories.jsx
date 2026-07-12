import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import settingsService from '../../services/settingsService';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import Modal from '../../components/common/Modal/Modal';
import Table from '../../components/common/Table/Table';
import '../../styles/common/module.css';

const CATEGORY_TYPES = [
  { value: 'csr_activity', label: 'CSR Activity' },
  { value: 'challenge', label: 'Gamification Challenge' },
];

function Categories() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'csr_activity', status: 'active' });

  const { data, loading, error, refetch } = useApi(() => settingsService.listCategories(), []);
  const items = data?.items || data || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    if (editItem) await settingsService.updateCategory(editItem.id, values);
    else await settingsService.createCategory(values);
    refetch();
    setShowModal(false);
    setEditItem(null);
    setForm({ name: '', type: 'csr_activity', status: 'active' });
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete category?')) return;
    await settingsService.deleteCategory(id);
    refetch();
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, type: item.type, status: item.status || 'active' });
    setShowModal(true);
  };

  const columns = [
    { key: 'name', title: 'Category Name' },
    { key: 'type', title: 'Type', render: (r) => CATEGORY_TYPES.find((t) => t.value === r.type)?.label || r.type },
    { key: 'status', title: 'Status', render: (r) => <span className={`status-badge status-badge--${r.status}`}>{r.status}</span> },
    {
      key: 'actions', title: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost-edit" size="sm" className="btn--icon-only" onClick={() => openEdit(r)} title="Edit"><Icon name="edit" size={15} /></Button>
          <Button variant="ghost-danger" size="sm" className="btn--icon-only" onClick={() => remove(r.id)} title="Delete"><Icon name="trash" size={15} /></Button>
        </div>
      )
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    save(form);
  };

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      <div className="module-toolbar">
        <Button variant="secondary" onClick={() => { setEditItem(null); setForm({ name: '', type: 'csr_activity', status: 'active' }); setShowModal(true); }}>
          + New Category
        </Button>
      </div>
      <div className="module-table-card">
        <Table columns={columns} data={items} loading={loading} />
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Category' : 'New Category'}
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-field">
            <label>Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Energy Efficiency" />
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>Type *</label>
              <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {CATEGORY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
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
        </form>
      </Modal>
    </div>
  );
}

export default Categories;
