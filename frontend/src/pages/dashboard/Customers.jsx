import Card from '../../components/common/Card/Card';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import '../../styles/dashboard/customers.css';

// Placeholder feature page — real content lands here later.
function Customers() {
  return (
    <Card flat className="customers-page" padding="none">
      <EmptyState
        icon="customers"
        title="Customers"
        message="This feature page is ready and waiting for its real content."
      />
    </Card>
  );
}

export default Customers;
