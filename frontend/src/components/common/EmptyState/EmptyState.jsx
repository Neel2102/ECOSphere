import Icon from '../Icon/Icon';
import '../../../styles/common/empty-state.css';

function EmptyState({ icon = 'inbox', title = 'Nothing here yet', message, action, className = '' }) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <span className="empty-state__icon">
        <Icon name={icon} size={30} />
      </span>
      <h3 className="empty-state__title">{title}</h3>
      {message && <p className="empty-state__message">{message}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

export default EmptyState;
