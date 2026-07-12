import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import settingsService from '../../services/settingsService';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import Modal from '../../components/common/Modal/Modal';
import Table from '../../components/common/Table/Table';
import '../../styles/common/module.css';

function ChallengeCategories() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'challenge', status: 'active' });

  const { data, loading, error, refetch } = useApi(() => settingsService.listCategories({ type: 'challenge' }), []);
  const items = data?.items || data || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    if (editItem) await settingsService.updateCategory(editItem.id, values);
    else await settingsService.createCategory(values);
    refetch();
    setShowModal(false);
    setEditItem(null);
    setForm({ name: '', type: 'challenge', status: 'active' });
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete category?')) return;
    await settingsService.deleteCategory(id);
    refetch();
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, type: 'challenge', status: item.status || 'active' });
    setShowModal(true);
  };

  const columns = [
    { key: 'name', title: 'Category Name' },
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
        <Button variant="secondary" onClick={() => { setEditItem(null); setForm({ name: '', type: 'challenge', status: 'active' }); setShowModal(true); }}>
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
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Waste Management" />
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ChallengeCategories;
