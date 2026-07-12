import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import settingsService from '../../services/settingsService';
import Button from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import Table from '../../components/common/Table/Table';
import '../../styles/common/module.css';

function Departments() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', status: 'active' });

  const { data, loading, error, refetch } = useApi(() => settingsService.listDepartments(), []);
  const items = data?.items || data || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    if (editItem) await settingsService.updateDepartment(editItem.id, values);
    else await settingsService.createDepartment(values);
    refetch();
    setShowModal(false);
    setEditItem(null);
    setForm({ name: '', code: '', description: '', status: 'active' });
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete department?')) return;
    await settingsService.deleteDepartment(id);
    refetch();
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, code: item.code || '', description: item.description || '', status: item.status || 'active' });
    setShowModal(true);
  };

  const columns = [
    { key: 'name', title: 'Department Name' },
    { key: 'code', title: 'Code' },
    { key: 'description', title: 'Description' },
    { key: 'status', title: 'Status', render: (r) => <span className={`status-badge status-badge--${r.status}`}>{r.status}</span> },
    {
      key: 'actions', title: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => openEdit(r)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => remove(r.id)}>Delete</Button>
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
        <Button variant="secondary" onClick={() => { setEditItem(null); setForm({ name: '', code: '', description: '', status: 'active' }); setShowModal(true); }}>
          + New Department
        </Button>
      </div>
      <div className="module-table-card">
        <Table columns={columns} data={items} loading={loading} />
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Department' : 'New Department'}
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-row">
            <div className="modal-form-field">
              <label>Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sales" />
            </div>
            <div className="modal-form-field">
              <label>Code *</label>
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. SALE" />
            </div>
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

export default Departments;
