import Card from '../../components/common/Card/Card';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import '../../styles/dashboard/reports.css';

// Placeholder feature page — admin & manager only (see RoleBasedRoute).
function Reports() {
  return (
    <Card flat className="reports-page" padding="none">
      <EmptyState
        icon="reports"
        title="Reports"
        message="This feature page is ready and waiting for its real content."
      />
    </Card>
  );
}

export default Reports;
