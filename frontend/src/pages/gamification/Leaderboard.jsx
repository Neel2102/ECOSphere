import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import gamificationService from '../../services/gamificationService';
import '../../styles/common/module.css';

const MEDAL = ['🥇', '🥈', '🥉'];

function Leaderboard() {
  const [view, setView] = useState('employees');
  const { data, loading, error } = useApi(() => gamificationService.getLeaderboard({ limit: 20 }), []);

  const employees = data?.employees || [];
  const departments = data?.departments || [];
  const rows = view === 'employees' ? employees : departments;

  return (
    <div>
      {error && <div className="page-error">⚠️ {error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          className={`module-tab${view === 'employees' ? ' is-active' : ''}`}
          style={{ flex: 1 }}
          onClick={() => setView('employees')}
        >
          👤 Employees
        </button>
        <button
          className={`module-tab${view === 'departments' ? ' is-active' : ''}`}
          style={{ flex: 1 }}
          onClick={() => setView('departments')}
        >
          🏢 Departments
        </button>
      </div>

      <div className="module-table-card">
        <div className="module-table-card__header">
          <span className="module-table-card__title">
            {view === 'employees' ? '🏆 Employee Leaderboard' : '🏢 Department Leaderboard'}
          </span>
        </div>

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-surface-dim)', display: 'flex', gap: 16 }}>
              <div className="skeleton skeleton--text" style={{ width: 30 }} />
              <div className="skeleton skeleton--text" style={{ flex: 1 }} />
              <div className="skeleton skeleton--text" style={{ width: 60 }} />
            </div>
          ))
        ) : rows.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-soft)' }}>
            No data yet. Complete challenges to appear here!
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th className="tbl__th" style={{ width: 60 }}>Rank</th>
                <th className="tbl__th">{view === 'employees' ? 'Employee' : 'Department'}</th>
                {view === 'employees' && <th className="tbl__th">Department</th>}
                <th className="tbl__th" style={{ textAlign: 'right' }}>XP</th>
                {view === 'employees' && <th className="tbl__th" style={{ textAlign: 'right' }}>Badges</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className="tbl__row" style={{ background: i < 3 ? `rgba(0,184,255,${0.07 - i * 0.02})` : undefined }}>
                  <td className="tbl__td">
                    <span style={{ fontSize: 20 }}>{MEDAL[i] || `#${row.rank}`}</span>
                  </td>
                  <td className="tbl__td" style={{ fontWeight: i < 3 ? 700 : 400 }}>
                    {row.full_name || row.name}
                  </td>
                  {view === 'employees' && (
                    <td className="tbl__td" style={{ color: 'var(--color-text-soft)', fontSize: 12 }}>
                      {row.department_name || '—'}
                    </td>
                  )}
                  <td className="tbl__td" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-secondary)' }}>
                    ⭐ {row.xp || 0}
                  </td>
                  {view === 'employees' && (
                    <td className="tbl__td" style={{ textAlign: 'right' }}>
                      {row.badges > 0 ? `🏆 ${row.badges}` : '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
