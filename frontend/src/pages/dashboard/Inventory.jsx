import Card from '../../components/common/Card/Card';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import '../../styles/dashboard/inventory.css';

// Placeholder feature page — real content lands here later.
function Inventory() {
  return (
    <Card flat className="inventory-page" padding="none">
      <EmptyState
        icon="inventory"
        title="Inventory"
        message="This feature page is ready and waiting for its real content."
      />
    </Card>
  );
}

export default Inventory;
