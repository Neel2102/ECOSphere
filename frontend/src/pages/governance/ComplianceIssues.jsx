import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import governanceService from '../../services/governanceService';
import settingsService from '../../services/settingsService';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/common/Table/Table';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import '../../styles/common/module.css';

function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status}`}>{status}</span>;
}

function SeverityBadge({ severity }) {
  return <span className={`status-badge severity-badge--${severity}`}>{severity}</span>;
}

function ComplianceIssues() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);
  const [showModal, setShowModal] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title: '', description: '', severity: 'medium', department_id: '', owner_id: '', due_date: '', status: 'open' });

  const { data, loading, error, refetch } = useApi(
    () => governanceService.listIssues({ severity: filterSeverity, status: filterStatus }),
    [filterSeverity, filterStatus]
  );
  const { data: deptData } = useApi(() => settingsService.listDepartments(), []);

  const items = data?.items || data || [];
  const departments = deptData?.items || deptData || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    await governanceService.createIssue(values);
    refetch();
    setShowModal(false);
  });

  const [updateStatus, { loading: updating }] = useMutation(async (id, status) => {
    await governanceService.updateIssue(id, { status });
    refetch();
  });

  const [flagOverdue] = useMutation(async () => {
    const result = await governanceService.flagOverdue();
    alert(`${result.data?.flagged || 0} issues flagged as overdue.`);
    refetch();
  });

  const columns = [
    { key: 'title', title: 'Issue' },
    { key: 'severity', title: 'Severity', render: (r) => <SeverityBadge severity={r.severity} /> },
    { key: 'department_name', title: 'Department' },
    { key: 'due_date', title: 'Due Date', render: (r) => r.due_date ? new Date(r.due_date).toLocaleDateString() : '—' },
    { key: 'status', title: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', title: '',
      render: (r) => canManage ? (
        <div style={{ display: 'flex', gap: 8 }}>
          {r.status !== 'resolved' && (
            <Button variant="success" size="sm" loading={updating} onClick={() => updateStatus(r.id, 'resolved')}>Resolve</Button>
          )}
        </div>
      ) : null
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    save({ ...form, department_id: form.department_id || null, owner_id: form.owner_id || null });
  };

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      <div className="module-toolbar">
        {canManage && (
          <>
            <Button variant="secondary" onClick={() => { setForm({ title: '', description: '', severity: 'medium', department_id: '', owner_id: '', due_date: '', status: 'open' }); setShowModal(true); }}>
              + New Issue
            </Button>
            <Button variant="warning" onClick={flagOverdue}>🚨 Flag Overdue</Button>
          </>
        )}
        <div className="module-toolbar__right">
          <select style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--color-surface-dim)', fontSize: 13 }}
            value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--color-surface-dim)', fontSize: 13 }}
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="module-table-card">
        <div className="module-table-card__header">
          <span className="module-table-card__title">Compliance Issues — severity-tagged, resolution tracked</span>
        </div>
        <Table columns={columns} data={items} loading={loading} />
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Compliance Issue"
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>Create</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-field">
            <label>Issue Title *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>Severity</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="modal-form-field">
              <label>Department</label>
              <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                <option value="">— None —</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Due Date</label>
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
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

export default ComplianceIssues;
