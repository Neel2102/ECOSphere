import { NavLink } from 'react-router-dom';
import Icon from '../common/Icon/Icon';
import '../../styles/dashboard/sidebar.css';

// The 5 feature links (placeholder names, to be renamed per hackathon feature).
export const NAV_ITEMS = [
  { to: '/dashboard/sales-orders', label: 'Sales Orders', icon: 'orders' },
  { to: '/dashboard/inventory', label: 'Inventory', icon: 'inventory' },
  { to: '/dashboard/invoicing', label: 'Invoicing', icon: 'invoicing' },
  { to: '/dashboard/customers', label: 'Customers', icon: 'customers' },
  { to: '/dashboard/reports', label: 'Reports', icon: 'reports' },
];

function Sidebar({ collapsed, mobileOpen, onCloseMobile, onToggleCollapsed }) {
  return (
    <>
      {mobileOpen && <div className="sidebar__scrim" onClick={onCloseMobile} aria-hidden="true" />}

      <aside
        className={`sidebar${collapsed ? ' is-collapsed' : ''}${mobileOpen ? ' is-mobile-open' : ''}`}
      >
        {/* Sidebar header — Switzer font per the design system */}
        <NavLink to="/dashboard" className="sidebar__header" onClick={onCloseMobile}>
          <span className="sidebar__logo" aria-hidden="true">
            U<span className="sidebar__logo-dot" />
          </span>
          <span className="sidebar__app-name">Unify</span>
        </NavLink>

        <nav className="sidebar__nav" aria-label="Main navigation">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
                  onClick={onCloseMobile}
                  title={item.label}
                >
                  <span className="sidebar__link-icon">
                    <Icon name={item.icon} size={21} />
                  </span>
                  <span className="sidebar__link-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="sidebar__collapse"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={18} />
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
