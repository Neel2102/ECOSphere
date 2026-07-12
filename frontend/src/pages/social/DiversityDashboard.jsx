import { useApi } from '../../hooks/useApi';
import socialService from '../../services/socialService';
import '../../styles/common/module.css';

function DiversityBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-soft)', marginBottom: 3 }}>
        <span>{label}</span>
        <span>{value} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

const GENDER_COLORS = {
  male: 'var(--color-secondary)',
  female: 'var(--color-accent)',
  other: 'var(--color-warning)',
  unspecified: 'var(--color-neutral)',
};

function DiversityDashboard() {
  const { data, loading, error } = useApi(() => socialService.getDiversity(), []);

  const departments = data?.departments || [];
  const totals = data?.totals || {};

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}

      {/* Overall totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {['total', 'male', 'female', 'other', 'unspecified'].map((key) => (
          <div key={key} className="dash-score-card">
            <div className="dash-score-card__label" style={{ textTransform: 'capitalize' }}>{key}</div>
            {loading ? (
              <div className="skeleton skeleton--text" style={{ height: 32, width: '50%' }} />
            ) : (
              <div className="dash-score-card__value" style={{ fontSize: 28, color: GENDER_COLORS[key] || 'var(--color-heading)' }}>
                {totals[key] ?? 0}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Per-department breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="activity-card">
                <div className="skeleton skeleton--text" style={{ height: 16, width: '60%', marginBottom: 12 }} />
                <div className="skeleton skeleton--text" style={{ height: 12 }} />
                <div className="skeleton skeleton--text" style={{ height: 12, marginTop: 8 }} />
              </div>
            ))
          : departments.map((dept) => (
              <div key={dept.department_id || dept.name} className="activity-card">
                <div className="activity-card__title">🏢 {dept.name}</div>
                <div style={{ marginTop: 8 }}>
                  <DiversityBar label="Male" value={dept.male} max={dept.total} color={GENDER_COLORS.male} />
                  <DiversityBar label="Female" value={dept.female} max={dept.total} color={GENDER_COLORS.female} />
                  <DiversityBar label="Other" value={dept.other} max={dept.total} color={GENDER_COLORS.other} />
                  {dept.unspecified > 0 && (
                    <DiversityBar label="Unspecified" value={dept.unspecified} max={dept.total} color={GENDER_COLORS.unspecified} />
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-soft)', marginTop: 6 }}>
                  Total: {dept.total} employees
                </div>
              </div>
            ))}
      </div>

      {departments.length === 0 && !loading && (
        <div className="module-table-card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-soft)' }}>
          No diversity data available yet.
        </div>
      )}
    </div>
  );
}

export default DiversityDashboard;
