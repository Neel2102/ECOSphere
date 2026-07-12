import { useState } from 'react';
import { LuGlobe, LuDroplet, LuUsers, LuShield, LuWrench } from 'react-icons/lu';
import EnvironmentalReport from './EnvironmentalReport';
import SocialReport from './SocialReport';
import GovernanceReport from './GovernanceReport';
import EsgSummaryReport from './EsgSummaryReport';
import CustomReportBuilder from './CustomReportBuilder';
import '../../styles/common/module.css';

const TABS = [
  { label: 'ESG Summary', key: 'summary', icon: LuGlobe },
  { label: 'Environmental', key: 'environmental', icon: LuDroplet },
  { label: 'Social', key: 'social', icon: LuUsers },
  { label: 'Governance', key: 'governance', icon: LuShield },
  { label: 'Custom Query Builder', key: 'custom', icon: LuWrench },
];

function Reports() {
  const [activeTab, setActiveTab] = useState('summary');

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
      {activeTab === 'summary' && <EsgSummaryReport />}
      {activeTab === 'environmental' && <EnvironmentalReport />}
      {activeTab === 'social' && <SocialReport />}
      {activeTab === 'governance' && <GovernanceReport />}
      {activeTab === 'custom' && <CustomReportBuilder />}
    </div>
  );
}

export default Reports;
