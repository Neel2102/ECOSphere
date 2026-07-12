import { NavLink } from 'react-router-dom';
import Icon from '../common/Icon/Icon';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard/sidebar.css';

// Main modules only — sub-navigation lives inside each module as tabs.
// `accent` drives the module color-coding across the whole app.
export const ESG_MODULES = [
  { key: 'environmental', label: 'Environmental', icon: 'leaf', base: '/dashboard/environmental', accent: 'env' },
  { key: 'social', label: 'Social', icon: 'users', base: '/dashboard/social', accent: 'soc' },
  { key: 'governance', label: 'Governance', icon: 'shield', base: '/dashboard/governance', accent: 'gov' },
  { key: 'gamification', label: 'Gamification', icon: 'trophy', base: '/dashboard/gamification', accent: 'gam' },
];

// Flat list used by Header for page-title matching.
export const NAV_ITEMS = [
  { to: '/dashboard/onboarding', label: 'Onboarding' },
  { to: '/dashboard/reports', label: 'Reports' },
  { to: '/dashboard/settings', label: 'Settings' },
  { to: '/dashboard/profile', label: 'My Profile' },
  ...ESG_MODULES.map((m) => ({ to: m.base, label: m.label })),
];

function Sidebar({ collapsed, mobileOpen, onCloseMobile, onToggleCollapsed }) {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: 'home', end: true },
    { to: '/dashboard/onboarding', label: 'Onboarding', icon: 'activity' },
    ...ESG_MODULES.map((m) => ({ to: m.base, label: m.label, icon: m.icon, accent: m.accent })),
    // Reports & Settings are management screens.
    ...(canManage
      ? [
          { to: '/dashboard/reports', label: 'Reports', icon: 'reports' },
          { to: '/dashboard/settings', label: 'Settings', icon: 'sliders' },
        ]
      : []),
  ];

  return (
    <>
      {mobileOpen && (
        <div className="sidebar__scrim" onClick={onCloseMobile} aria-hidden="true" />
      )}

      <aside
        className={`sidebar${collapsed ? ' is-collapsed' : ''}${mobileOpen ? ' is-mobile-open' : ''}`}
      >
        {/* Brand */}
        <NavLink to="/dashboard" className="sidebar__header" onClick={onCloseMobile}>
          <img src="/images/Transparent_ESG_logo.png" alt="EcoSphere" className="sidebar__logo-img" />
        </NavLink>

        <nav className="sidebar__nav" aria-label="Main navigation">
          <ul>
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `sidebar__link${isActive ? ' is-active' : ''}${link.accent ? ` sidebar__link--${link.accent}` : ''}`
                  }
                  onClick={onCloseMobile}
                  title={link.label}
                >
                  <span className="sidebar__link-icon">
                    <Icon name={link.icon} size={17} />
                  </span>
                  <span className="sidebar__link-label">{link.label}</span>
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
          {collapsed ? '›' : '‹'}
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
