import { useId, useState } from 'react';
import Icon from '../Icon/Icon';
import '../../../styles/common/input.css';

function Input({ label, error, hint, prefix, type = 'text', className = '', ...rest }) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  const classes = ['input-field', error && 'has-error', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label && (
        <label className="input-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="input-field__control">
        {prefix && <span className="input-field__prefix">{prefix}</span>}
        <input id={id} className="input-field__input" type={resolvedType} {...rest} />
        {isPassword && (
          <button
            type="button"
            className="input-field__toggle"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
          </button>
        )}
      </div>
      {error ? (
        <p className="input-field__error" role="alert">{error}</p>
      ) : (
        hint && <p className="input-field__hint">{hint}</p>
      )}
    </div>
  );
}

export default Input;
