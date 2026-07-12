import { useState } from 'react';
import { LuLayoutGrid, LuTag, LuSettings } from 'react-icons/lu';
import Departments from './Departments';
import Categories from './Categories';
import EsgConfiguration from './EsgConfiguration';
import NotificationSettings from './NotificationSettings';
import '../../styles/common/module.css';
import '../../styles/settings/settings.css';

const TABS = [
  { label: 'Departments', key: 'departments', icon: LuLayoutGrid },
  { label: 'Categories', key: 'categories', icon: LuTag },
  { label: 'ESG Configuration & Notifications', key: 'esg-notif', icon: LuSettings },
];

function Settings() {
  const [activeTab, setActiveTab] = useState('departments');

  return (
    <div>
      <nav className="module-tabs" style={{ marginBottom: 20 }}>
        {TABS.map((t) => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.key}
              className={`module-tab${activeTab === t.key ? ' is-active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <TabIcon size={15} style={{ flexShrink: 0 }} />
              <span className="module-tab-label">{t.label}</span>
            </button>
          );
        })}
      </nav>
      {activeTab === 'departments' && <Departments />}
      {activeTab === 'categories' && <Categories />}
      {activeTab === 'esg-notif' && (
        <div className="settings-grid">
          <div className="settings-grid__col">
            <EsgConfiguration />
          </div>
          <div className="settings-grid__col">
            <NotificationSettings />
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
