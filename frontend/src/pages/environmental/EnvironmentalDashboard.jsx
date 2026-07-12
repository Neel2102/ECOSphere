import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import environmentalService from '../../services/environmentalService';
import '../../styles/common/module.css';
import '../../styles/environmental/environmental-dashboard.css';

const SOURCE_COLORS = {
  purchase: '#2b3ce7',       // indigo
  manufacturing: '#1fa864',  // success green
  fleet: '#00b8ff',          // secondary blue
  expense: '#eda23a',        // warning orange
  manual: '#7d8593',         // neutral grey
};

function EnvironmentalDashboard() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: dbData, loading, error } = useApi(
    () => environmentalService.getEnvironmentalDashboard({
      from: dateFrom || undefined,
      to: dateTo || undefined
    }),
    [dateFrom, dateTo]
  );

  if (loading && !dbData) {
    return (
      <div className="env-dashboard">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dash-score-card">
              <div className="skeleton skeleton--title" style={{ width: '50%' }} />
              <div className="skeleton skeleton--text" style={{ height: 32, marginTop: 10 }} />
            </div>
          ))}
        </div>
        <div className="env-grid-2col">
          <div className="env-chart-card">
            <div className="skeleton skeleton--title" style={{ width: '40%' }} />
            <div className="skeleton skeleton--text" style={{ height: 180 }} />
          </div>
          <div className="env-chart-card">
            <div className="skeleton skeleton--title" style={{ width: '40%' }} />
            <div className="skeleton skeleton--text" style={{ height: 180 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="page-error">⚠️ {error}</div>;
  }

  const { totalCo2 = 0, txCount = 0, bySource = [], byDepartment = [], trend = [], goals = [] } = dbData || {};

  // Total CO2 in tonnes
  const totalCo2Tonnes = (Number(totalCo2) / 1000).toFixed(2);

  // Calculate percentages for source breakdown
  const sourceTotalsSum = bySource.reduce((sum, item) => sum + Number(item.total_co2), 0) || 1;

  // Custom SVG Trend Line calculation
  const renderTrendChart = () => {
    if (trend.length === 0) return <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-soft)' }}>No carbon data logged yet.</div>;
    const values = trend.map((t) => Number(t.total_co2) || 0);
    const maxVal = Math.max(...values, 100);
    const width = 500;
    const height = 180;
    const pad = 24;

    const points = values.map((v, i) => {
      const x = pad + (i / (values.length - 1 || 1)) * (width - pad * 2);
      const y = height - pad - (v / maxVal) * (height - pad * 2);
      return { x, y, val: v, label: trend[i].month };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="envTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <line
              key={pct}
              x1={pad} y1={pad + (1 - pct) * (height - pad * 2)}
              x2={width - pad} y2={pad + (1 - pct) * (height - pad * 2)}
              stroke="var(--color-surface-dim)" strokeWidth="1"
            />
          ))}
          {/* Area fill */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`}
            fill="url(#envTrendGrad)"
          />
          {/* Path Line */}
          <path d={pathD} fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Circles */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--color-success)" stroke="var(--color-surface)" strokeWidth="1.5">
              <title>{p.label}: {p.val.toFixed(1)} kg CO₂</title>
            </circle>
          ))}
        </svg>
        {/* X-axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: `0 ${pad}px`, marginTop: 8 }}>
          {points.map((p, i) => (
            <span key={i} style={{ fontSize: 9.5, color: 'var(--color-text-soft)', transform: 'rotate(-15deg)', transformOrigin: 'top left' }}>
              {p.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="env-dashboard">
      {/* Search & Dates Filter Toolbar */}
      <div className="module-toolbar" style={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 550, color: 'var(--color-text)' }}>From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--color-surface-dim)',
              background: 'var(--color-surface)',
              fontSize: 13,
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 550, color: 'var(--color-text)' }}>To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--color-surface-dim)',
              background: 'var(--color-surface)',
              fontSize: 13,
            }}
          />
        </div>
        {(dateFrom || dateTo) && (
          <Button variant="neutral" onClick={() => { setDateFrom(''); setDateTo(''); }}>Reset</Button>
        )}
      </div>

      {/* KPI Cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        <div className="dash-score-card">
          <div className="dash-score-card__header">
            <span className="dash-score-card__icon">🌱</span>
            <span className="dash-score-card__label">Total CO₂ Emissions</span>
          </div>
          <div className="dash-score-card__value" style={{ color: 'var(--color-success)' }}>
            {totalCo2Tonnes} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-soft)' }}>tonnes</span>
          </div>
        </div>
        <div className="dash-score-card">
          <div className="dash-score-card__header">
            <span className="dash-score-card__icon">📊</span>
            <span className="dash-score-card__label">Total Logs Count</span>
          </div>
          <div className="dash-score-card__value" style={{ color: 'var(--color-secondary)' }}>
            {txCount}
          </div>
        </div>
        <div className="dash-score-card">
          <div className="dash-score-card__header">
            <span className="dash-score-card__icon">⚡</span>
            <span className="dash-score-card__label">Primary Source</span>
          </div>
          <div className="dash-score-card__value" style={{ fontSize: 22, textTransform: 'capitalize', color: 'var(--color-warning)' }}>
            {bySource.length > 0
              ? [...bySource].sort((a, b) => Number(b.total_co2) - Number(a.total_co2))[0]?.source_type
              : 'N/A'}
          </div>
        </div>
        <div className="dash-score-card">
          <div className="dash-score-card__header">
            <span className="dash-score-card__icon">🏢</span>
            <span className="dash-score-card__label">Highest Contributor</span>
          </div>
          <div className="dash-score-card__value" style={{ fontSize: 18, color: 'var(--color-accent)' }}>
            {byDepartment.length > 0
              ? [...byDepartment].sort((a, b) => Number(b.total_co2) - Number(a.total_co2))[0]?.department_name || 'Corp'
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Grid of charts and details */}
      <div className="env-grid-2col">
        {/* Trend chart */}
        <div className="env-chart-card">
          <div className="env-chart-card__title">📈 Monthly Carbon Trend</div>
          <div style={{ marginTop: 10 }}>{renderTrendChart()}</div>
        </div>

        {/* Source breakdown progress bars */}
        <div className="env-chart-card">
          <div className="env-chart-card__title">♻️ Emissions by Source Type</div>
          <div className="env-source-bars" style={{ marginTop: 12 }}>
            {bySource.map((src) => {
              const val = Number(src.total_co2);
              const pct = ((val / sourceTotalsSum) * 100).toFixed(1);
              const color = SOURCE_COLORS[src.source_type] || 'var(--color-neutral)';
              return (
                <div key={src.source_type} className="env-source-bar">
                  <div className="env-source-bar__label">
                    <span>{src.source_type} ({src.tx_count} tx)</span>
                    <span>{(val / 1000).toFixed(2)} t ({pct}%)</span>
                  </div>
                  <div className="env-source-bar__track">
                    <div className="env-source-bar__fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
            {bySource.length === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-soft)' }}>
                No emissions broken down by source.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="env-grid-2col">
        {/* Department Comparison */}
        <div className="env-chart-card">
          <div className="env-chart-card__title">🏢 Emissions by Department</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
            {byDepartment.map((dept) => {
              const maxDeptVal = Math.max(...byDepartment.map((d) => Number(d.total_co2)), 1);
              const pct = ((Number(dept.total_co2) / maxDeptVal) * 100).toFixed(1);
              return (
                <div key={dept.department_id || dept.department_name} className="env-source-bar">
                  <div className="env-source-bar__label">
                    <span>{dept.department_name || 'Unspecified'}</span>
                    <span>{(Number(dept.total_co2) / 1000).toFixed(2)} tonnes</span>
                  </div>
                  <div className="env-source-bar__track">
                    <div className="env-source-bar__fill" style={{ width: `${pct}%`, background: 'var(--color-secondary)' }} />
                  </div>
                </div>
              );
            })}
            {byDepartment.length === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-soft)' }}>
                No departmental emission logs found.
              </div>
            )}
          </div>
        </div>

        {/* Environmental Goals progress */}
        <div className="env-chart-card">
          <div className="env-chart-card__title">🎯 Target Goals Progress</div>
          <div className="env-goal-list" style={{ marginTop: 10 }}>
            {goals.map((goal) => {
              const current = Number(goal.current_co2);
              const target = Number(goal.target_co2);
              const progressPct = Math.min(100, Math.round((current / (target || 1)) * 100));
              const isExceeded = current > target;
              
              // Standard color coding: goals are usually to reduce, so if current is higher than target, it's warning/danger!
              let color = 'var(--color-success)';
              if (progressPct >= 90) color = 'var(--color-warning)';
              if (isExceeded) color = 'var(--color-danger)';

              return (
                <div key={goal.id} className="env-goal-item">
                  <div className="env-goal-item__header">
                    <div>
                      <span className="env-goal-item__name">{goal.name}</span>
                      <span style={{ fontSize: 10, padding: '1px 6px', background: 'var(--color-surface-soft)', color: 'var(--color-text-soft)', marginLeft: 8, borderRadius: 4 }}>
                        {goal.department_name}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 650,
                      color: goal.status === 'completed' ? 'var(--color-success)' : goal.status === 'missed' ? 'var(--color-danger)' : 'var(--color-secondary)'
                    }}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--color-text-soft)' }}>
                    <span>Current: {current} t CO₂</span>
                    <span>Target limit: {target} t CO₂</span>
                  </div>
                  <div className="env-source-bar__track" style={{ height: 8 }}>
                    <div className="env-source-bar__fill" style={{ width: `${progressPct}%`, background: color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--color-text-faint)' }}>
                    <span>{progressPct}% utilized</span>
                    <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-soft)' }}>
                No active goals defined.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentalDashboard;
