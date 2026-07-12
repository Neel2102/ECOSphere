import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Icon from '../common/Icon/Icon';
import '../../styles/common/module.css';

/**
 * ModuleShell — shared tab-bar layout for all ESG module pages.
 * Props:
 *  - title: string
 *  - tabs: [{ label, to, icon, count }]
 */
function ModuleShell({ title, tabs }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="module-shell">
      <nav className="module-tabs" aria-label={`${title} tabs`}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to ||
            (location.pathname.startsWith(tab.to + '/'));
          return (
            <button
              key={tab.to}
              type="button"
              className={`module-tab${isActive ? ' is-active' : ''}`}
              onClick={() => navigate(tab.to)}
            >
              {tab.icon && <Icon name={tab.icon} size={17} />}
              <span className="module-tab-label">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="module-tab-count">{tab.count}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="module-content">
        <Outlet />
      </div>
    </div>
  );
}

export default ModuleShell;
