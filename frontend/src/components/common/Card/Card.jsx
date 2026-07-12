import '../../../styles/common/card.css';

function Card({ padding = 'md', flat = false, className = '', children, ...rest }) {
  const classes = ['card', `card--pad-${padding}`, flat && 'card--flat', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export default Card;
