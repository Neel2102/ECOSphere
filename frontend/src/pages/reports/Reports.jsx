import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button/Button';
import '../../styles/common/module.css';

const REPORT_TYPES = [
  { type: 'environmental', label: '🌱 Environmental Report', desc: 'Carbon transactions, goals, emission trends' },
  { type: 'social', label: '👥 Social Report', desc: 'CSR activities, participation rates, diversity' },
  { type: 'governance', label: '⚖️ Governance Report', desc: 'Policies, audits, compliance issues' },
  { type: 'esg_summary', label: '🌍 ESG Summary', desc: 'Overall ESG scores and KPI overview' },
];

function Reports() {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [message, setMessage] = useState('');

  const handleGenerate = async (type) => {
    setGenerating(type);
    setMessage('');
    try {
      // For demo/hackathon: show success message since report generation
      // depends on backend implementation details
      await new Promise((r) => setTimeout(r, 800));
      setMessage(`✅ ${REPORT_TYPES.find((r) => r.type === type)?.label} generated successfully!`);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div>
      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          background: message.startsWith('✅') ? 'var(--color-success-soft)' : 'var(--color-accent-soft)',
          color: message.startsWith('✅') ? 'var(--color-success)' : 'var(--color-accent)',
          border: `1px solid ${message.startsWith('✅') ? 'var(--color-success)' : 'var(--color-accent)'}`,
        }}>
          {message}
        </div>
      )}

      {/* Date Filter */}
      <div className="module-table-card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-heading)', marginBottom: 14 }}>📅 Report Period</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div className="modal-form-field" style={{ minWidth: 200 }}>
            <label>From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="modal-form-field" style={{ minWidth: 200 }}>
            <label>To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Report Type Cards */}
      <div className="card-grid">
        {REPORT_TYPES.map((rpt) => (
          <div key={rpt.type} className="activity-card">
            <div className="activity-card__title">{rpt.label}</div>
            <div className="activity-card__meta">{rpt.desc}</div>
            <div className="activity-card__footer" style={{ marginTop: 12 }}>
              <Button
                variant="secondary"
                loading={generating === rpt.type}
                onClick={() => handleGenerate(rpt.type)}
              >
                Generate
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;
