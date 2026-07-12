import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import governanceService from '../../services/governanceService';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/common/Table/Table';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import '../../styles/common/module.css';

function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status?.toLowerCase()}`}>{status}</span>;
}

function Policies() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: '', effective_date: '', status: 'active' });

  const { data, loading, error, refetch } = useApi(() => governanceService.listPolicies(), []);
  const items = data?.items || data || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    if (editItem) await governanceService.updatePolicy(editItem.id, values);
    else await governanceService.createPolicy(values);
    refetch();
    setShowModal(false);
    setEditItem(null);
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete this policy?')) return;
    await governanceService.deletePolicy(id);
    refetch();
  });

  const [acknowledge, { loading: acking }] = useMutation(async (id) => {
    await governanceService.acknowledgePolicy(id);
    refetch();
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ title: item.title, description: item.description || '', category: item.category || '', effective_date: item.effective_date ? item.effective_date.substring(0, 10) : '', status: item.status || 'active' });
    setShowModal(true);
  };

  const columns = [
    { key: 'title', title: 'Policy Title' },
    { key: 'category', title: 'Category' },
    { key: 'effective_date', title: 'Effective Date', render: (r) => r.effective_date ? new Date(r.effective_date).toLocaleDateString() : '—' },
    { key: 'status', title: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', title: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" loading={acking} onClick={() => acknowledge(r.id)}>Acknowledge</Button>
          {canManage && <Button variant="ghost-edit" size="sm" className="btn--icon-only" onClick={() => openEdit(r)} title="Edit"><Icon name="edit" size={15} /></Button>}
          {canManage && <Button variant="ghost-danger" size="sm" className="btn--icon-only" onClick={() => remove(r.id)} title="Delete"><Icon name="trash" size={15} /></Button>}
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
        {canManage && (
          <Button variant="secondary" onClick={() => { setEditItem(null); setForm({ title: '', description: '', category: '', effective_date: '', status: 'active' }); setShowModal(true); }}>
            + New Policy
          </Button>
        )}
      </div>
      <div className="module-table-card">
        <Table columns={columns} data={items} loading={loading} />
      </div>
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Policy' : 'New Policy'}
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-field">
            <label>Title *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="modal-form-field">
              <label>Effective Date</label>
              <input type="date" value={form.effective_date} onChange={(e) => setForm({ ...form, effective_date: e.target.value })} />
            </div>
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Policies;
