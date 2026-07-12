import '../../../styles/common/skeleton-loader.css';

// Shimmering placeholders. Variants: text | title | avatar | card | table-row
function SkeletonLoader({ variant = 'text', count = 1, width, height, className = '' }) {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={`skeleton-card ${className}`.trim()}>
        <div className="skeleton skeleton--avatar" />
        <div className="skeleton-card__lines">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--text" />
          <div className="skeleton skeleton--text" style={{ width: '60%' }} />
        </div>
      </div>
    );
  }

  if (variant === 'table-row') {
    return items.map((item, index) => (
      <div key={index} className={`skeleton-row ${className}`.trim()}>
        <div className="skeleton skeleton--box" />
        <div className="skeleton skeleton--text" style={{ width: '18%' }} />
        <div className="skeleton skeleton--text" style={{ width: '26%' }} />
        <div className="skeleton skeleton--pill" />
        <div className="skeleton skeleton--text" style={{ width: '14%' }} />
        <div className="skeleton skeleton--text" style={{ width: '14%' }} />
      </div>
    ));
  }

  return items.map((item, index) => (
    <span key={index} className={`skeleton skeleton--${variant} ${className}`.trim()} style={style} />
  ));
}

export default SkeletonLoader;
