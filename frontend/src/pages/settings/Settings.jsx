import { useState } from 'react';
import Departments from './Departments';
import Categories from './Categories';
import EsgConfiguration from './EsgConfiguration';
import NotificationSettings from './NotificationSettings';
import '../../styles/common/module.css';

const TABS = [
  { label: '🏢 Departments', key: 'departments' },
  { label: '🏷️ Categories', key: 'categories' },
  { label: '⚙️ ESG Configuration', key: 'esg-config' },
  { label: '🔔 Notifications', key: 'notifications' },
];

function Settings() {
  const [activeTab, setActiveTab] = useState('departments');

  return (
    <div>
      <nav className="module-tabs" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`module-tab${activeTab === t.key ? ' is-active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {activeTab === 'departments' && <Departments />}
      {activeTab === 'categories' && <Categories />}
      {activeTab === 'esg-config' && <EsgConfiguration />}
      {activeTab === 'notifications' && <NotificationSettings />}
    </div>
  );
}

export default Settings;
