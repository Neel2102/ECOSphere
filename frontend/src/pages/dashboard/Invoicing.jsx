import Card from '../../components/common/Card/Card';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import '../../styles/dashboard/invoicing.css';

// Placeholder feature page — real content lands here later.
function Invoicing() {
  return (
    <Card flat className="invoicing-page" padding="none">
      <EmptyState
        icon="invoicing"
        title="Invoicing"
        message="This feature page is ready and waiting for its real content."
      />
    </Card>
  );
}

export default Invoicing;
