import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { LuLeaf, LuUsers, LuShield, LuActivity, LuChevronRight, LuChartBar, LuZap, LuFileText, LuHeart } from 'react-icons/lu';
import Icon from '../../components/common/Icon/Icon';
import dashboardService from '../../services/dashboardService';
import '../../styles/dashboard/dashboard-home.css';

const SCORE_CONFIG = [
  { key: 'environmental_score', label: 'Environmental', icon: LuLeaf, color: 'var(--color-success)', gradient: '#ffffff' },
  { key: 'social_score', label: 'Social', icon: LuUsers, color: 'var(--color-secondary)', gradient: '#ffffff' },
  { key: 'governance_score', label: 'Governance', icon: LuShield, color: 'var(--color-warning)', gradient: '#ffffff' },
  { key: 'overall_score', label: 'Overall ESG', icon: LuActivity, color: 'var(--color-accent)', gradient: '#ffffff' },
];

const ACTIVITY_ICONS = {
  participation: 'check',
  challenge: 'trophy',
  compliance: 'alert',
  carbon: 'leaf',
  policy: 'orders',
};

/* Animated counter hook */
function useAnimatedCount(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Number(target) || 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return count;
}

function ScoreCard({ label, IconComp, score, color, gradient, loading }) {
  const pct = Math.min(100, Math.max(0, Number(score) || 0));
  const animatedValue = useAnimatedCount(loading ? 0 : pct);

  return (
    <div className="dash-score-card" style={{ background: gradient }}>
      <div className="dash-score-card__header">
        <span className="dash-score-card__icon" style={{ color }}>
          <IconComp size={22} />
        </span>
        <span className="dash-score-card__label">{label}</span>
      </div>
      {loading ? (
        <div className="skeleton skeleton--text" style={{ height: 40, width: '70%', marginTop: 8 }} />
      ) : (
        <>
          <div className="dash-score-card__value" style={{ color }}>
            {animatedValue} <span className="dash-score-card__denom">/ 100</span>
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
  const [hoveredIndex, setHoveredIndex] = useState(null);

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

  // Generate cubic bezier path
  const getBezierPath = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const pathD = getBezierPath(points);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
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
          <circle 
            key={i} 
            cx={p.x} 
            cy={p.y} 
            r={hoveredIndex === i ? "6" : "4"} 
            fill="var(--color-secondary)" 
            stroke="#fff" 
            strokeWidth="2"
            style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <title>{p.label}: {p.v.toFixed(1)} kg CO₂</title>
          </circle>
        ))}
      </svg>
      {hoveredIndex !== null && (
        <div style={{
          position: 'absolute',
          top: `${(points[hoveredIndex].y / height) * 100 - 20}%`,
          left: `${(points[hoveredIndex].x / width) * 100}%`,
          transform: 'translateX(-50%)',
          background: 'var(--color-heading)',
          color: 'var(--color-surface)',
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 'bold',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 100,
          boxShadow: 'var(--shadow-raised)',
          transition: 'all 0.15s ease'
        }}>
          {points[hoveredIndex].label}: {points[hoveredIndex].v.toFixed(1)} kg CO₂
        </div>
      )}
    </div>
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

const QUICK_ACTIONS = [
  { label: 'Log Carbon Data', icon: LuLeaf, route: '/dashboard/environmental/carbon-transactions', variant: 'green' },
  { label: 'Start Challenge', icon: LuZap, route: '/dashboard/gamification/challenges', variant: 'blue' },
  { label: 'View Reports', icon: LuChartBar, route: '/dashboard/reports', variant: 'grey' },
  { label: 'CSR Activities', icon: LuHeart, route: '/dashboard/social/activities', variant: 'orange' },
];

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
          <Icon name="alert" size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Could not load dashboard: {error}
        </div>
      )}

      {/* KPI Score Cards */}
      <section className="dash-scores">
        {SCORE_CONFIG.map(({ key, label, icon: IconComp, color, gradient }) => (
          <ScoreCard
            key={key}
            label={label}
            IconComp={IconComp}
            score={scores[key]}
            color={color}
            gradient={gradient}
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
          <h3 className="dash-chart-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LuLeaf size={18} /> Emissions Trend (12 mo)
          </h3>
          <EmissionsTrendChart trend={trend} loading={loading} />
        </div>
        <div className="dash-chart-card">
          <h3 className="dash-chart-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LuChartBar size={18} /> Department ESG Ranking
          </h3>
          <DeptRankingChart departments={departments} loading={loading} />
        </div>
      </section>

      {/* Activity + Quick Actions */}
      <section className="dash-bottom">
        <div className="dash-activity">
          <h3 className="dash-activity__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LuActivity size={18} /> Recent Activity
          </h3>
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
                  <span className="dash-activity__dot" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {ACTIVITY_ICONS[item.kind] ? (
                      <Icon name={ACTIVITY_ICONS[item.kind]} size={15} />
                    ) : (
                      '•'
                    )}
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
          <h3 className="dash-qa__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LuZap size={18} /> Quick Actions
          </h3>
          {QUICK_ACTIONS.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.route}
                className={`dash-qa__btn dash-qa__btn--${action.variant}`}
                onClick={() => navigate(action.route)}
              >
                <span className="dash-qa__btn-icon">
                  <ActionIcon size={18} />
                </span>
                <span className="dash-qa__btn-label">{action.label}</span>
                <LuChevronRight size={16} className="dash-qa__btn-arrow" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default DashboardHome;
