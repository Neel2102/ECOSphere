import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import reportService from '../../services/reportService';
import settingsService from '../../services/settingsService';
import Table from '../../components/common/Table/Table';
import Button from '../../components/common/Button/Button';
import { LuUsers, LuDownload, LuSheet, LuFileText } from 'react-icons/lu';
import '../../styles/common/module.css';

function SocialReport() {
  const [departmentId, setDepartmentId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);

  const { data: deptData } = useApi(() => settingsService.listDepartments(), []);
  const departments = deptData?.items || deptData || [];

  const loadReport = () => {
    reportService
      .getReportJson('social', {
        department_id: departmentId || undefined,
        from: from || undefined,
        to: to || undefined,
      })
      .then(setReport)
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadReport();
  }, [departmentId, from, to]);

  const handleDownload = (format) => {
    const url = reportService.getReportDownloadUrl('social', format, {
      department_id: departmentId || '',
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
      {/* Filters */}
      <div className="module-table-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          <div className="modal-form-field">
            <label>Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="modal-form-field">
            <label>From Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="modal-form-field">
            <label>To Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Summary Scores */}
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

      {/* Report Table */}
      <div className="module-table-card">
        <div className="module-table-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="module-table-card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><LuUsers size={16} /> Social Engagement Logs</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="neutral" size="sm" onClick={() => handleDownload('csv')} iconLeft={<LuDownload size={14} />}>CSV</Button>
            <Button variant="neutral" size="sm" onClick={() => handleDownload('xlsx')} iconLeft={<LuSheet size={14} />}>Excel</Button>
            <Button variant="neutral" size="sm" onClick={() => handleDownload('pdf')} iconLeft={<LuFileText size={14} />}>PDF</Button>
          </div>
        </div>
        <Table columns={columns} data={rows} loading={!report} />
      </div>
    </div>
  );
}

export default SocialReport;
