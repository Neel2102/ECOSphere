import '../../../styles/common/badge.css';

function Badge({ variant = 'neutral', dot = false, className = '', children, ...rest }) {
  const classes = ['badge', `badge--${variant}`, className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...rest}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export default Badge;
