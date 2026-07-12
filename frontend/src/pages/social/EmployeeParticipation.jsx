import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import socialService from '../../services/socialService';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/common/Table/Table';
import Button from '../../components/common/Button/Button';
import { fileUrl } from '../../services/api';
import '../../styles/common/module.css';

function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status}`}>{status}</span>;
}

function EmployeeParticipation() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);
  const [filterStatus, setFilterStatus] = useState('');

  const { data, loading, error, refetch } = useApi(
    () => socialService.listParticipations({ approval_status: filterStatus }),
    [filterStatus]
  );

  const items = data?.items || data || [];

  const [approve, { loading: approving }] = useMutation(async (id) => {
    await socialService.approveParticipation(id, {});
    refetch();
  });

  const [reject, { loading: rejecting }] = useMutation(async (id) => {
    if (!window.confirm('Reject this participation?')) return;
    await socialService.rejectParticipation(id);
    refetch();
  });

  const columns = [
    { key: 'employee_name', title: 'Employee' },
    { key: 'activity_title', title: 'Activity / Challenge' },
    {
      key: 'proof_path', title: 'Proof',
      render: (r) => r.proof_path ? (
        <a href={fileUrl(r.proof_path)} target="_blank" rel="noreferrer" style={{ color: 'var(--color-secondary)' }}>
          📎 View
        </a>
      ) : '—'
    },
    { key: 'points_earned', title: 'Points', render: (r) => r.points_earned ?? '—' },
    { key: 'approval_status', title: 'Status', render: (r) => <StatusBadge status={r.approval_status} /> },
    {
      key: 'actions', title: '',
      render: (r) => canManage && r.approval_status === 'pending' ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="success" size="sm" loading={approving} onClick={() => approve(r.id)}>Approve</Button>
          <Button variant="danger" size="sm" loading={rejecting} onClick={() => reject(r.id)}>Reject</Button>
        </div>
      ) : null
    },
  ];

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      <div className="module-toolbar">
        <div className="module-toolbar__right">
          <select style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--color-surface-dim)', fontSize: 13 }}
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <div className="module-table-card">
        <div className="module-table-card__header">
          <span className="module-table-card__title">Employee Participation: Approval Queue</span>
        </div>
        <Table columns={columns} data={items} loading={loading} />
      </div>
    </div>
  );
}

export default EmployeeParticipation;
