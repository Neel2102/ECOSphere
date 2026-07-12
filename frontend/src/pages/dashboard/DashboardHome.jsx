import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import dashboardService from '../../services/dashboardService';
import '../../styles/dashboard/dashboard-home.css';

const SCORE_CONFIG = [
  { key: 'environmental_score', label: 'Environmental', icon: '🌱', color: 'var(--color-success)' },
  { key: 'social_score', label: 'Social', icon: '👥', color: 'var(--color-secondary)' },
  { key: 'governance_score', label: 'Governance', icon: '⚖️', color: 'var(--color-warning)' },
  { key: 'overall_score', label: 'Overall ESG', icon: '🌍', color: 'var(--color-accent)' },
];

const ACTIVITY_ICONS = {
  participation: '✅',
  challenge: '🏆',
  compliance: '⚠️',
  carbon: '♻️',
  policy: '📋',
};

function ScoreCard({ label, icon, score, color, loading }) {
  const pct = Math.min(100, Math.max(0, Number(score) || 0));
  return (
    <div className="dash-score-card">
      <div className="dash-score-card__header">
        <span className="dash-score-card__icon">{icon}</span>
        <span className="dash-score-card__label">{label}</span>
      </div>
      {loading ? (
        <div className="skeleton skeleton--text" style={{ height: 40, width: '70%', marginTop: 8 }} />
      ) : (
        <>
          <div className="dash-score-card__value" style={{ color }}>
            {pct} <span className="dash-score-card__denom">/ 100</span>
          </div>
          <div className="dash-score-card__bar-track">
            <div
              className="dash-score-card__bar-fill"
              style={{ width: `${pct}%`, background: color }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function EmissionsTrendChart({ trend, loading }) {
  if (loading) return <div className="dash-chart-placeholder"><div className="skeleton skeleton--text" style={{ height: 120 }} /></div>;
  if (!trend || trend.length === 0) return <div className="dash-chart-placeholder">No emissions data yet.</div>;

  const values = trend.map((t) => Number(t.total_co2) || 0);
  const max = Math.max(...values, 1);
  const width = 460;
  const height = 140;
  const pad = 20;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1 || 1)) * (width - pad * 2);
    const y = height - pad - (v / max) * (height - pad * 2);
    return { x, y, v, label: trend[i].month || '' };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="dash-trend-svg" aria-label="Emissions trend chart">
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
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path
        d={`${pathD} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`}
        fill="url(#trendGrad)"
      />

      {/* Line */}
      <path d={pathD} fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--color-secondary)" stroke="#fff" strokeWidth="2">
          <title>{p.label}: {p.v.toFixed(1)} kg CO₂</title>
        </circle>
      ))}
    </svg>
  );
}

function DeptRankingChart({ departments, loading }) {
  if (loading) return <div className="dash-chart-placeholder"><div className="skeleton skeleton--text" style={{ height: 120 }} /></div>;
  if (!departments || departments.length === 0) return <div className="dash-chart-placeholder">No department data yet.</div>;

  const maxScore = Math.max(...departments.map((d) => Number(d.total_score) || 0), 1);
  const COLORS = ['var(--color-secondary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-indigo)'];

  return (
    <div className="dash-dept-chart">
      {departments.slice(0, 6).map((dept, i) => {
        const pct = (Number(dept.total_score) || 0) / maxScore * 100;
        return (
          <div key={dept.department_id || i} className="dash-dept-bar">
            <div className="dash-dept-bar__track">
              <div
                className="dash-dept-bar__fill"
                style={{ height: `${pct}%`, background: COLORS[i % COLORS.length] }}
                title={`${dept.department_name}: ${dept.total_score}`}
              />
            </div>
            <span className="dash-dept-bar__label">{(dept.department_name || 'Dept').substring(0, 6)}</span>
          </div>
        );
      })}
    </div>
  );
}

function DashboardHome() {
  const navigate = useNavigate();
  const { data: overview, loading, error } = useApi(() => dashboardService.getOverview(), []);

  const scores = overview?.scores || {};
  const trend = overview?.emissionsTrend || [];
  const departments = overview?.departmentRanking || [];
  const activity = overview?.recentActivity || [];
  const counts = overview?.counts || {};

  return (
    <div className="dash-home">
      {error && (
        <div className="dash-error">
          ⚠️ Could not load dashboard: {error}
        </div>
      )}

      {/* KPI Score Cards */}
      <section className="dash-scores">
        {SCORE_CONFIG.map(({ key, label, icon, color }) => (
          <ScoreCard
            key={key}
            label={label}
            icon={icon}
            score={scores[key]}
            color={color}
            loading={loading}
          />
        ))}
      </section>

      {/* Quick Count Pills */}
      <section className="dash-counts">
        <div className="dash-count-pill">
          <span className="dash-count-pill__num">{counts.carbon_transactions ?? '—'}</span>
          <span className="dash-count-pill__label">Carbon Logs</span>
        </div>
        <div className="dash-count-pill dash-count-pill--blue">
          <span className="dash-count-pill__num">{counts.active_challenges ?? '—'}</span>
          <span className="dash-count-pill__label">Active Challenges</span>
        </div>
        <div className="dash-count-pill dash-count-pill--orange">
          <span className="dash-count-pill__num">{counts.pending_approvals ?? '—'}</span>
          <span className="dash-count-pill__label">Pending Approvals</span>
        </div>
        <div className="dash-count-pill dash-count-pill--red">
          <span className="dash-count-pill__num">{counts.open_issues ?? '—'}</span>
          <span className="dash-count-pill__label">Open Issues</span>
        </div>
      </section>

      {/* Charts Row */}
      <section className="dash-charts">
        <div className="dash-chart-card">
          <h3 className="dash-chart-card__title">🌿 Emissions Trend (12 mo)</h3>
          <EmissionsTrendChart trend={trend} loading={loading} />
        </div>
        <div className="dash-chart-card">
          <h3 className="dash-chart-card__title">🏢 Department ESG Ranking</h3>
          <DeptRankingChart departments={departments} loading={loading} />
        </div>
      </section>

      {/* Activity + Quick Actions */}
      <section className="dash-bottom">
        <div className="dash-activity">
          <h3 className="dash-activity__title">🕐 Recent Activity</h3>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton skeleton--text" style={{ margin: '8px 0' }} />
            ))
          ) : activity.length === 0 ? (
            <p className="dash-activity__empty">No recent activity yet.</p>
          ) : (
            <ul className="dash-activity__list">
              {activity.map((item, i) => (
                <li key={i} className="dash-activity__item">
                  <span className="dash-activity__dot">
                    {ACTIVITY_ICONS[item.kind] || '•'}
                  </span>
                  <span className="dash-activity__text">{item.text}</span>
                  <span className="dash-activity__time">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dash-quick-actions">
          <h3 className="dash-qa__title">⚡ Quick Actions</h3>
          <button className="dash-qa__btn dash-qa__btn--green" onClick={() => navigate('/dashboard/environmental/carbon-transactions')}>
            + Log Carbon Data
          </button>
          <button className="dash-qa__btn dash-qa__btn--blue" onClick={() => navigate('/dashboard/gamification/challenges')}>
            🏁 Start Challenge
          </button>
          <button className="dash-qa__btn dash-qa__btn--grey" onClick={() => navigate('/dashboard/reports')}>
            📊 View Reports
          </button>
          <button className="dash-qa__btn dash-qa__btn--orange" onClick={() => navigate('/dashboard/social/activities')}>
            🤝 CSR Activities
          </button>
        </div>
      </section>
    </div>
  );
}

export default DashboardHome;
