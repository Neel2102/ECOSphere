import { useState } from 'react';
import EnvironmentalReport from './EnvironmentalReport';
import SocialReport from './SocialReport';
import GovernanceReport from './GovernanceReport';
import EsgSummaryReport from './EsgSummaryReport';
import CustomReportBuilder from './CustomReportBuilder';
import '../../styles/common/module.css';

const TABS = [
  { label: '🌍 ESG Summary', key: 'summary' },
  { label: '🌱 Environmental', key: 'environmental' },
  { label: '👥 Social', key: 'social' },
  { label: '⚖️ Governance', key: 'governance' },
  { label: '🛠️ Custom Query Builder', key: 'custom' },
];

function Reports() {
  const [activeTab, setActiveTab] = useState('summary');

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
      {activeTab === 'summary' && <EsgSummaryReport />}
      {activeTab === 'environmental' && <EnvironmentalReport />}
      {activeTab === 'social' && <SocialReport />}
      {activeTab === 'governance' && <GovernanceReport />}
      {activeTab === 'custom' && <CustomReportBuilder />}
    </div>
  );
}

export default Reports;
