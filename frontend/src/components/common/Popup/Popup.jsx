import { createPortal } from 'react-dom';
import Icon from '../Icon/Icon';
import Button from '../Button/Button';
import '../../../styles/common/popup.css';

// Lightweight confirm/alert dialog (e.g. "Delete 3 orders?").
function Popup({
  open,
  variant = 'danger',
  icon = 'alert',
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return createPortal(
    <div className="popup__overlay" onMouseDown={(event) => event.target === event.currentTarget && onCancel?.()}>
      <div className="popup" role="alertdialog" aria-modal="true" aria-label={title}>
        <span className={`popup__icon popup__icon--${variant}`}>
          <Icon name={icon} size={26} />
        </span>
        <h3 className="popup__title">{title}</h3>
        {message && <p className="popup__message">{message}</p>}
        <div className="popup__actions">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
          )}
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Popup;
