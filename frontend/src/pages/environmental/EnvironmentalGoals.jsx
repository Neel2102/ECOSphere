import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import environmentalService from '../../services/environmentalService';
import settingsService from '../../services/settingsService';
import Table from '../../components/common/Table/Table';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common/module.css';

const STATUS_OPTS = ['active', 'on_track', 'completed', 'missed'];

function ProgressCell({ value }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  const color = pct >= 100 ? 'success' : pct >= 60 ? '' : 'danger';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="progress-bar" style={{ width: 100 }}>
        <div className={`progress-bar__fill${color ? ` progress-bar--${color}` : ''}`} style={{ width: `${pct}%` }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>{pct}%</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const display = status === 'missed' ? 'overdue' : status;
  return <span className={`status-badge status-badge--${display}`}>{display?.replace(/_/g, ' ')}</span>;
}

function EnvironmentalGoals() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [q, setQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ name: '', department_id: '', target_co2: '', current_co2: '', deadline: '', status: 'active' });

  const { data, loading, error, refetch } = useApi(
    () => environmentalService.listGoals({ q, status: filterStatus }),
    [q, filterStatus]
  );
  const { data: deptData } = useApi(() => settingsService.listDepartments(), []);

  const items = data?.items || data || [];
  const departments = deptData?.items || deptData || [];

  const [save, { loading: saving }] = useMutation(async (values) => {
    if (editItem) await environmentalService.updateGoal(editItem.id, values);
    else await environmentalService.createGoal(values);
    refetch();
    setShowModal(false);
    setEditItem(null);
  });

  const [remove] = useMutation(async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await environmentalService.deleteGoal(id);
    refetch();
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      department_id: item.department_id || '',
      target_co2: item.target_co2,
      current_co2: item.current_co2,
      deadline: item.deadline ? item.deadline.substring(0, 10) : '',
      status: item.status,
    });
    setShowModal(true);
  };

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'department_name', title: 'Department' },
    { key: 'target_co2', title: 'Target CO₂', render: (r) => `${r.target_co2} t` },
    { key: 'current_co2', title: 'Current CO₂', render: (r) => `${r.current_co2} t` },
    { key: 'progress', title: 'Progress', render: (r) => <ProgressCell value={r.progress} /> },
    { key: 'deadline', title: 'Deadline', render: (r) => r.deadline ? new Date(r.deadline).toLocaleDateString() : '—' },
    { key: 'status', title: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ...(canManage
      ? [
          {
            key: 'actions',
            title: '',
            render: (r) => (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost-edit" size="sm" className="btn--icon-only" onClick={() => openEdit(r)} title="Edit"><Icon name="edit" size={15} /></Button>
                <Button variant="ghost-danger" size="sm" className="btn--icon-only" onClick={() => remove(r.id)} title="Delete"><Icon name="trash" size={15} /></Button>
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
      target_co2: Number(form.target_co2),
      current_co2: Number(form.current_co2),
      department_id: form.department_id || null,
    });
  };

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      <div className="module-toolbar">
        {canManage && (
          <Button variant="secondary" onClick={() => { setEditItem(null); setForm({ name: '', department_id: '', target_co2: '', current_co2: '', deadline: '', status: 'active' }); setShowModal(true); }}>
            + New Goal
          </Button>
        )}
        <div className="module-toolbar__right">
          <select style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--color-surface-dim)', fontSize: 13, cursor: 'pointer' }}
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <div className="module-search">
            <span>🔍</span>
            <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="module-table-card">
        <Table columns={columns} data={items} loading={loading} />
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Goal' : 'New Environmental Goal'}
        footer={
          <div className="modal-footer-btns">
            <Button variant="neutral" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="secondary" loading={saving} onClick={handleSubmit}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-field">
            <label>Goal Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-form-row" style={{ marginTop: 14 }}>
            <div className="modal-form-field">
              <label>Target CO₂ (tonnes) *</label>
              <input required type="number" step="0.1" value={form.target_co2} onChange={(e) => setForm({ ...form, target_co2: e.target.value })} />
            </div>
            <div className="modal-form-field">
              <label>Current CO₂ (tonnes) *</label>
              <input required type="number" step="0.1" value={form.current_co2} onChange={(e) => setForm({ ...form, current_co2: e.target.value })} />
            </div>
          </div>
          <div className="modal-form-field" style={{ marginTop: 14 }}>
            <label>Deadline</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EnvironmentalGoals;
