import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Icon from '../common/Icon/Icon';
import '../../styles/dashboard/sidebar.css';

export const ESG_MODULES = [
  {
    key: 'environmental',
    label: 'Environmental',
    icon: 'leaf',
    base: '/dashboard/environmental',
    children: [
      { to: '/dashboard/environmental/emission-factors', label: 'Emission Factors' },
      { to: '/dashboard/environmental/product-profiles', label: 'Product ESG Profiles' },
      { to: '/dashboard/environmental/carbon-transactions', label: 'Carbon Transactions' },
      { to: '/dashboard/environmental/goals', label: 'Environmental Goals' },
    ],
  },
  {
    key: 'social',
    label: 'Social',
    icon: 'users',
    base: '/dashboard/social',
    children: [
      { to: '/dashboard/social/activities', label: 'CSR Activities' },
      { to: '/dashboard/social/participation', label: 'Employee Participation' },
      { to: '/dashboard/social/diversity', label: 'Diversity Dashboard' },
    ],
  },
  {
    key: 'governance',
    label: 'Governance',
    icon: 'shield',
    base: '/dashboard/governance',
    children: [
      { to: '/dashboard/governance/policies', label: 'Policies' },
      { to: '/dashboard/governance/acknowledgements', label: 'Policy Acknowledgements' },
      { to: '/dashboard/governance/audits', label: 'Audits' },
      { to: '/dashboard/governance/issues', label: 'Compliance Issues' },
    ],
  },
  {
    key: 'gamification',
    label: 'Gamification',
    icon: 'trophy',
    base: '/dashboard/gamification',
    children: [
      { to: '/dashboard/gamification/challenges', label: 'Challenges' },
      { to: '/dashboard/gamification/participation', label: 'Challenge Participation' },
      { to: '/dashboard/gamification/badges', label: 'Badges' },
      { to: '/dashboard/gamification/rewards', label: 'Rewards' },
      { to: '/dashboard/gamification/leaderboard', label: 'Leaderboard' },
    ],
  },
  {
    key: 'operations',
    label: 'Daily Operations',
    icon: 'briefcase',
    base: '/dashboard/operations',
    children: [
      { to: '/dashboard/inventory', label: 'Manufacturing Logs' },
      { to: '/dashboard/invoicing', label: 'Expenses & Utilities' },
      { to: '/dashboard/customers', label: 'Logistics & Fleet' },
      { to: '/dashboard/sales', label: 'Sales Orders' },
    ],
  },
];

// Flat list used by Header for page-title matching
export const NAV_ITEMS = ESG_MODULES.flatMap((m) => m.children);

function Sidebar({ collapsed, mobileOpen, onCloseMobile, onToggleCollapsed }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState(() => {
    // Auto-open the group matching the current URL on first render
    const initial = {};
    ESG_MODULES.forEach((m) => {
      if (location.pathname.startsWith(m.base)) initial[m.key] = true;
    });
    return initial;
  });

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
            {/* Dashboard home */}
            <li>
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
                onClick={onCloseMobile}
                title="Dashboard"
              >
                <span className="sidebar__link-icon">
                  <Icon name="home" size={17} />
                </span>
                <span className="sidebar__link-label">Dashboard</span>
              </NavLink>
            </li>


            {/* ESG module groups */}
            {ESG_MODULES.map((module) => {
              const isGroupActive = location.pathname.startsWith(module.base);
              const isOpen = openGroups[module.key];

              return (
                <li key={module.key} className="sidebar__group">
                  <button
                    type="button"
                    className={`sidebar__group-btn${isGroupActive ? ' is-active' : ''}`}
                    onClick={() => toggleGroup(module.key)}
                    title={module.label}
                  >
                    <span className="sidebar__link-icon">
                      <Icon name={module.icon} size={17} />
                    </span>
                    <span className="sidebar__link-label">{module.label}</span>
                    <span className={`sidebar__chevron${isOpen ? ' is-open' : ''}`}>▾</span>
                  </button>

                  {isOpen && !collapsed && (
                    <ul className="sidebar__sub-nav">
                      {module.children.map((child) => (
                        <li key={child.to}>
                          <NavLink
                            to={child.to}
                            className={({ isActive }) =>
                              `sidebar__sub-link${isActive ? ' is-active' : ''}`
                            }
                            onClick={onCloseMobile}
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}

            {/* Reports */}
            <li>
              <NavLink
                to="/dashboard/reports"
                className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
                onClick={onCloseMobile}
                title="Reports"
              >
                <span className="sidebar__link-icon">
                  <Icon name="reports" size={17} />
                </span>
                <span className="sidebar__link-label">Reports</span>
              </NavLink>
            </li>

            {/* Settings */}
            <li>
              <NavLink
                to="/dashboard/settings"
                className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
                onClick={onCloseMobile}
                title="Settings"
              >
                <span className="sidebar__link-icon">
                  <Icon name="sliders" size={17} />
                </span>
                <span className="sidebar__link-label">Settings</span>
              </NavLink>
            </li>
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
