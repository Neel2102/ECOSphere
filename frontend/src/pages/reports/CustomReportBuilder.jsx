import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import reportService from '../../services/reportService';
import settingsService from '../../services/settingsService';
import userService from '../../services/userService';
import gamificationService from '../../services/gamificationService';
import Table from '../../components/common/Table/Table';
import Button from '../../components/common/Button/Button';
import '../../styles/common/module.css';

const MODULE_OPTIONS = [
  { value: 'environmental', label: 'Environmental Module' },
  { value: 'social', label: 'Social Module' },
  { value: 'governance', label: 'Governance Module' },
  { value: 'gamification', label: 'Gamification Module' },
];

function CustomReportBuilder() {
  const [module, setModule] = useState('environmental');
  const [departmentId, setDepartmentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);

  // Fetch filter dropdown resources
  const { data: deptData } = useApi(() => settingsService.listDepartments(), []);
  const { data: employeesData } = useApi(() => userService.listUsers(), []);
  const { data: challengesData } = useApi(() => gamificationService.listChallenges(), []);
  const { data: categoriesData } = useApi(() => settingsService.listCategories(), []);

  const departments = deptData?.items || deptData || [];
  const employees = employeesData || [];
  const challenges = challengesData?.items || challengesData || [];
  const categories = categoriesData?.items || categoriesData || [];

  // Reset inapplicable fields on module change
  useEffect(() => {
    setEmployeeId('');
    setChallengeId('');
    setCategoryId('');
  }, [module]);

  const loadReport = () => {
    setReport(null); // Loader state trigger
    reportService
      .getReportJson('custom', {
        module,
        department_id: departmentId || undefined,
        employee_id: employeeId || undefined,
        challenge_id: challengeId || undefined,
        category_id: categoryId || undefined,
        from: from || undefined,
        to: to || undefined,
      })
      .then(setReport)
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadReport();
  }, [module, departmentId, employeeId, challengeId, categoryId, from, to]);

  const handleDownload = (format) => {
    const url = reportService.getReportDownloadUrl('custom', format, {
      module,
      department_id: departmentId || '',
      employee_id: employeeId || '',
      challenge_id: challengeId || '',
      category_id: categoryId || '',
      from: from || '',
      to: to || '',
    });
    window.open(url, '_blank');
  };

  const summary = report?.summary || [];
  const columns = (report?.columns || []).map((col) => ({
    key: col.key,
    title: col.label,
  }));
  const rows = report?.rows || [];

  return (
    <div>
      {/* Configuration Controls */}
      <div className="module-table-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-heading)', marginBottom: 16 }}>🛠️ Custom Query Builder</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          <div className="modal-form-field">
            <label>ESG Module Area *</label>
            <select value={module} onChange={(e) => setModule(e.target.value)}>
              {MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="modal-form-field">
            <label>Department Scope</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          
          <div className="modal-form-field">
            <label>Employee Filter</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} disabled={module === 'governance' && false}>
              <option value="">All Employees</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
            </select>
          </div>

          <div className="modal-form-field">
            <label>Challenge Filter</label>
            <select 
              value={challengeId} 
              onChange={(e) => setChallengeId(e.target.value)}
              disabled={module !== 'gamification'}
            >
              <option value="">All Challenges</option>
              {challenges.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className="modal-form-field">
            <label>ESG Category Filter</label>
            <select 
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={module !== 'social' && module !== 'gamification'}
            >
              <option value="">All Categories</option>
              {categories
                .filter(c => {
                  if (module === 'social') return c.type === 'csr_activity';
                  if (module === 'gamification') return c.type === 'challenge';
                  return true;
                })
                .map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
              }
            </select>
          </div>

          <div className="modal-form-field">
            <label>Start Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="modal-form-field">
            <label>End Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
          {summary.map((s, idx) => (
            <div key={idx} className="dash-score-card">
              <div className="dash-score-card__label">{s.label}</div>
              <div className="dash-score-card__value" style={{ fontSize: 24, marginTop: 4, color: 'var(--color-secondary)' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Query Results */}
      <div className="module-table-card">
        <div className="module-table-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="module-table-card__title">📋 Live Query Result Preview</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="neutral" size="sm" onClick={() => handleDownload('csv')}>📥 CSV</Button>
            <Button variant="neutral" size="sm" onClick={() => handleDownload('xlsx')}>📊 Excel</Button>
            <Button variant="neutral" size="sm" onClick={() => handleDownload('pdf')}>📄 PDF</Button>
          </div>
        </div>
        <Table columns={columns} data={rows} loading={!report} />
      </div>
    </div>
  );
}

export default CustomReportBuilder;
