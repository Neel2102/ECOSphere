import { useApi, useMutation } from '../../hooks/useApi';
import governanceService from '../../services/governanceService';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/common/Table/Table';
import Button from '../../components/common/Button/Button';
import '../../styles/common/module.css';

function PolicyAcknowledgements() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);

  const { data, loading, error } = useApi(() => governanceService.listAcknowledgements(), []);
  const items = data?.items || data || [];

  const [sendReminder, { loading: reminding }] = useMutation(async () => {
    await governanceService.sendReminder();
    alert('Reminders sent!');
  });

  const columns = [
    { key: 'employee_name', title: 'Employee' },
    { key: 'policy_title', title: 'Policy' },
    { key: 'department_name', title: 'Department' },
    {
      key: 'acknowledged_at', title: 'Acknowledged At',
      render: (r) => r.acknowledged_at
        ? new Date(r.acknowledged_at).toLocaleDateString()
        : <span style={{ color: 'var(--color-warning)' }}>Pending</span>
    },
    {
      key: 'status', title: 'Status',
      render: (r) => (
        <span className={`status-badge status-badge--${r.acknowledged_at ? 'completed' : 'pending'}`}>
          {r.acknowledged_at ? 'Acknowledged' : 'Pending'}
        </span>
      )
    },
  ];

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}
      <div className="module-toolbar">
        {canManage && (
          <Button variant="warning" loading={reminding} onClick={sendReminder}>
            📧 Send Reminders
          </Button>
        )}
      </div>
      <div className="module-table-card">
        <div className="module-table-card__header">
          <span className="module-table-card__title">Policy Acknowledgement Status</span>
        </div>
        <Table columns={columns} data={items} loading={loading} />
      </div>
    </div>
  );
}

export default PolicyAcknowledgements;
