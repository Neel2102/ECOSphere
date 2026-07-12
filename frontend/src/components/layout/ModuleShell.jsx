import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import '../../styles/common/module.css';

/**
 * ModuleShell — shared tab-bar layout for all ESG module pages.
 * Props:
 *  - title: string
 *  - tabs: [{ label, to }]
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
              {tab.label}
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
