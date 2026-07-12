import { useEffect, useId, useRef, useState } from 'react';
import Icon from '../Icon/Icon';
import '../../../styles/common/select.css';

// Custom-styled dropdown: a button + option list, so the open menu can match
// the neumorphic design (native <select> popups can't be styled).
function Select({ label, error, hint, options = [], value, onChange, placeholder = 'Select…', disabled, className = '' }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const classes = ['select-field', error && 'has-error', disabled && 'is-disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} ref={wrapperRef}>
      {label && (
        <label className="select-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <button
        type="button"
        id={id}
        className={`select-field__trigger${open ? ' is-open' : ''}`}
        onClick={() => !disabled && setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={selected ? '' : 'select-field__placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon name="chevronDown" size={16} className={`select-field__chevron${open ? ' is-open' : ''}`} />
      </button>

      {open && (
        <ul className="select-field__menu" role="listbox">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`select-field__option${option.value === value ? ' is-selected' : ''}`}
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
                {option.value === value && <Icon name="check" size={14} />}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p className="select-field__error" role="alert">{error}</p>
      ) : (
        hint && <p className="select-field__hint">{hint}</p>
      )}
    </div>
  );
}

export default Select;
