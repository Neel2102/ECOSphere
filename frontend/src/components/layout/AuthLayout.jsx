import { Link } from 'react-router-dom';
import Card from '../common/Card/Card';
import '../../styles/auth/auth-layout.css';

// Shared shell for every auth screen: centered neumorphic card with branding.
function AuthLayout({ title, subtitle, footer, children, wide = false }) {
  return (
    <div className="auth-layout">
      <Link to="/login" className="auth-layout__brand">
        <span className="auth-layout__logo" aria-hidden="true">
          U<span className="auth-layout__logo-dot" />
        </span>
        <span className="auth-layout__name">Unify</span>
      </Link>

      <Card className={`auth-layout__card${wide ? ' auth-layout__card--wide' : ''}`} padding="lg">
        <h1 className="auth-layout__title">{title}</h1>
        {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}
        {children}
      </Card>

      {footer && <div className="auth-layout__footer">{footer}</div>}
    </div>
  );
}

export default AuthLayout;
