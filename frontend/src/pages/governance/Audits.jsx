import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import governanceService from '../../services/governanceService';
import settingsService from '../../services/settingsService';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/common/Table/Table';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import '../../styles/common/module.css';

function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status?.toLowerCase().replace(' ', '_')}`}>{status}</span>;
}

function Audits() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: '', department_id: '', auditor: '', audit_date: '', findings: '', status: 'scheduled' });

  const { data, loading, error, refetch } = useApi(() => governanceService.listAudits(), []);
  const { data: deptData } = useApi(() => settingsService.listDepartments(), []);
  const items = data?.items || data || [];
  const departments = deptData?.items || deptData || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    if (editItem) await governanceService.updateAudit(editItem.id, values);
    else await governanceService.createAudit(values);
    refetch();
    setShowModal(false);
    setEditItem(null);
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete this audit?')) return;
    await governanceService.deleteAudit(id);
    refetch();
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ title: item.title, department_id: item.department_id || '', auditor: item.auditor || '', audit_date: item.audit_date ? item.audit_date.substring(0, 10) : '', findings: item.findings || '', status: item.status || 'scheduled' });
    setShowModal(true);
  };

  const columns = [
    { key: 'title', title: 'Title' },
    { key: 'department_name', title: 'Department' },
    { key: 'auditor', title: 'Auditor' },
    { key: 'audit_date', title: 'Date', render: (r) => r.audit_date ? new Date(r.audit_date).toLocaleDateString() : '—' },
    { key: 'findings', title: 'Findings' },
    { key: 'status', title: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', title: '',
      render: (r) => canManage ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost-edit" size="sm" className="btn--icon-only" onClick={() => openEdit(r)} title="Edit"><Icon name="edit" size={15} /></Button>
          <Button variant="ghost-danger" size="sm" className="btn--icon-only" onClick={() => remove(r.id)} title="Delete"><Icon name="trash" size={15} /></Button>
        </div>
      ) : null
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    save({ ...form, department_id: form.department_id || null });
  };

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      <div className="module-toolbar">
        {canManage && (
          <Button variant="secondary" onClick={() => { setEditItem(null); setForm({ title: '', department_id: '', auditor: '', audit_date: '', findings: '', status: 'scheduled' }); setShowModal(true); }}>
            + New Audit
          </Button>
        )}
      </div>
      <div className="module-table-card">
        <Table columns={columns} data={items} loading={loading} />
      </div>
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Audit' : 'New Audit'}
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
              <label>Department</label>
              <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                <option value="">— None —</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="modal-form-field">
              <label>Auditor</label>
              <input value={form.auditor} onChange={(e) => setForm({ ...form, auditor: e.target.value })} />
            </div>
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>Audit Date</label>
              <input type="date" value={form.audit_date} onChange={(e) => setForm({ ...form, audit_date: e.target.value })} />
            </div>
            <div className="modal-form-field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="under_review">Under Review</option>
              </select>
            </div>
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Findings</label>
            <textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Audits;
