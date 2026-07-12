import '../../../styles/common/button.css';

function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full',
    loading && 'is-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      <span className="btn__content">
        {iconLeft && <span className="btn__icon">{iconLeft}</span>}
        {children}
        {iconRight && <span className="btn__icon">{iconRight}</span>}
      </span>
    </button>
  );
}

export default Button;
