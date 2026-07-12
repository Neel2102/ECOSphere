import { useState, useEffect } from 'react';
import { useApi, useMutation } from '../../hooks/useApi';
import trainingService from '../../services/trainingService';
import settingsService from '../../services/settingsService';
import userService from '../../services/userService';
import Table from '../../components/common/Table/Table';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common/module.css';

function TrainingCompletion() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);

  // States for course modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    duration_hours: '',
    category: 'Social',
    status: 'active',
  });

  // States for completion modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [recordForm, setRecordForm] = useState({
    course_id: '',
    employee_id: '',
    completion_date: '',
    score: '',
    status: 'completed',
  });

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  // Fetch API data
  const { data: coursesData, refetch: refetchCourses } = useApi(() => trainingService.listCourses(), []);
  const { data: recordsData, refetch: refetchRecords } = useApi(
    () => trainingService.listRecords({
      q: searchQuery || undefined,
      department_id: filterDept || undefined,
      course_id: filterCourse || undefined
    }),
    [searchQuery, filterDept, filterCourse]
  );
  const { data: stats, refetch: refetchStats } = useApi(() => trainingService.getStats(), []);
  const { data: deptData } = useApi(() => settingsService.listDepartments(), []);
  const { data: employees } = useApi(() => userService.listUsers(), []);

  const courses = coursesData?.items || coursesData || [];
  const records = recordsData?.items || recordsData || [];
  const departments = deptData?.items || deptData || [];

  // Mutations
  const [saveCourse, { loading: savingCourse }] = useMutation(async (values) => {
    if (editCourse) {
      await trainingService.updateCourse(editCourse.id, values);
    } else {
      await trainingService.createCourse(values);
    }
    refetchCourses();
    setShowCourseModal(false);
    setEditCourse(null);
  });

  const [deleteCourse] = useMutation(async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? All associated completion records will be deleted.')) return;
    await trainingService.deleteCourse(id);
    refetchCourses();
    refetchRecords();
    refetchStats();
  });

  const [saveRecord, { loading: savingRecord }] = useMutation(async (values) => {
    if (editRecord) {
      await trainingService.updateRecord(editRecord.id, values);
    } else {
      await trainingService.createRecord(values);
    }
    refetchRecords();
    refetchStats();
    setShowRecordModal(false);
    setEditRecord(null);
  });

  const [deleteRecord] = useMutation(async (id) => {
    if (!window.confirm('Delete this completion record?')) return;
    await trainingService.deleteRecord(id);
    refetchRecords();
    refetchStats();
  });

  const openEditCourse = (course) => {
    setEditCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || '',
      duration_hours: course.duration_hours || '',
      category: course.category || 'Social',
      status: course.status || 'active',
    });
    setShowCourseModal(true);
  };

  const openEditRecord = (rec) => {
    setEditRecord(rec);
    setRecordForm({
      course_id: rec.course_id,
      employee_id: rec.employee_id,
      completion_date: rec.completion_date ? rec.completion_date.substring(0, 10) : '',
      score: rec.score || '',
      status: rec.status || 'completed',
    });
    setShowRecordModal(true);
  };

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    saveCourse({
      ...courseForm,
      duration_hours: Number(courseForm.duration_hours) || 0,
    });
  };

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    saveRecord({
      ...recordForm,
      score: recordForm.score !== '' ? Number(recordForm.score) : null,
      completion_date: recordForm.completion_date || new Date().toISOString().substring(0, 10),
    });
  };

  // Setup completion table columns
  const tableColumns = [
    { key: 'employee_name', title: 'Employee' },
    { key: 'department_name', title: 'Department' },
    { key: 'course_title', title: 'Course' },
    {
      key: 'completion_date',
      title: 'Completion Date',
      render: (rec) => (rec.completion_date ? new Date(rec.completion_date).toLocaleDateString() : '-'),
    },
    { key: 'score', title: 'Score', render: (rec) => (rec.score !== null ? `${rec.score}%` : '-') },
    {
      key: 'status',
      title: 'Status',
      render: (rec) => (
        <span className={`status-badge status-badge--${rec.status === 'completed' ? 'approved' : rec.status === 'enrolled' ? 'pending' : 'rejected'}`}>
          {rec.status}
        </span>
      ),
    },
  ];

  if (canManage) {
    tableColumns.push({
      key: 'actions',
      title: 'Actions',
      render: (rec) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="neutral" size="sm" onClick={() => openEditRecord(rec)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => deleteRecord(rec.id)}>Delete</Button>
        </div>
      ),
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        <div className="dash-score-card">
          <div className="dash-score-card__header">
            <span className="dash-score-card__icon">🎓</span>
            <span className="dash-score-card__label">Total Completions</span>
          </div>
          <div className="dash-score-card__value" style={{ color: 'var(--color-secondary)' }}>
            {stats?.total_completions || 0}
          </div>
        </div>
        <div className="dash-score-card">
          <div className="dash-score-card__header">
            <span className="dash-score-card__icon">👥</span>
            <span className="dash-score-card__label">Employees Trained</span>
          </div>
          <div className="dash-score-card__value" style={{ color: 'var(--color-success)' }}>
            {stats?.unique_employees_completed || 0}
          </div>
        </div>
        <div className="dash-score-card">
          <div className="dash-score-card__header">
            <span className="dash-score-card__icon">⏱️</span>
            <span className="dash-score-card__label">Total Training Hours</span>
          </div>
          <div className="dash-score-card__value" style={{ color: 'var(--color-warning)' }}>
            {stats?.total_training_hours || 0} hrs
          </div>
        </div>
        <div className="dash-score-card">
          <div className="dash-score-card__header">
            <span className="dash-score-card__icon">🏆</span>
            <span className="dash-score-card__label">Average Score</span>
          </div>
          <div className="dash-score-card__value" style={{ color: 'var(--color-indigo)' }}>
            {stats?.average_score || 0}%
          </div>
        </div>
      </div>

      {/* 2. Course Catalog */}
      <div className="module-table-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-heading)' }}>📚 Course Catalog</h3>
          {canManage && (
            <Button
              variant="secondary"
              onClick={() => {
                setEditCourse(null);
                setCourseForm({ title: '', description: '', duration_hours: '', category: 'Social', status: 'active' });
                setShowCourseModal(true);
              }}
            >
              + Add New Course
            </Button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {courses.map((course) => (
            <div
              key={course.id}
              className="dash-score-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 16,
                minHeight: 150,
                border: '1px solid var(--color-surface-dim)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'var(--color-surface-dim)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {course.category}
                  </span>
                  {canManage && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span
                        onClick={() => openEditCourse(course)}
                        style={{ cursor: 'pointer', fontSize: 12, color: 'var(--color-secondary)' }}
                        title="Edit Course"
                      >
                        ✏️
                      </span>
                      <span
                        onClick={() => deleteCourse(course.id)}
                        style={{ cursor: 'pointer', fontSize: 12, color: 'var(--color-accent)' }}
                        title="Delete Course"
                      >
                        🗑️
                      </span>
                    </div>
                  )}
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginTop: 10, color: 'var(--color-heading)' }}>{course.title}</h4>
                <p style={{ fontSize: 12, color: 'var(--color-text-soft)', marginTop: 6, lineBreak: 'anywhere' }}>
                  {course.description || 'No description provided.'}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, borderTop: '1px solid var(--color-surface-dim)', paddingTop: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>⏱️ {course.duration_hours} hours</span>
                <span className={`status-badge status-badge--${course.status === 'active' ? 'approved' : 'rejected'}`}>
                  {course.status}
                </span>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: 24, textAlign: 'center', color: 'var(--color-text-soft)' }}>
              No courses configured.
            </div>
          )}
        </div>
      </div>

      {/* 3. Completion Logs Table */}
      <div className="module-table-card">
        <div className="module-table-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span className="module-table-card__title">📋 Training Logs</span>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search employee or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--color-surface-dim)',
                background: 'var(--color-surface-soft)',
                fontSize: 13,
                width: 200,
              }}
            />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--color-surface-dim)',
                background: 'var(--color-surface-soft)',
                fontSize: 13,
              }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--color-surface-dim)',
                background: 'var(--color-surface-soft)',
                fontSize: 13,
                maxWidth: 200,
              }}
            >
              <option value="">All Courses</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <Button
              variant="secondary"
              onClick={() => {
                setEditRecord(null);
                setRecordForm({
                  course_id: courses[0]?.id || '',
                  employee_id: employees[0]?.id || '',
                  completion_date: new Date().toISOString().substring(0, 10),
                  score: '',
                  status: 'completed',
                });
                setShowRecordModal(true);
              }}
            >
              + Log Completion
            </Button>
          </div>
        </div>
        <Table columns={tableColumns} data={records} loading={false} />
      </div>

      {/* 4. Course Modal */}
      <Modal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} title={editCourse ? 'Edit Course' : 'Create Course'}>
        <form onSubmit={handleCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="modal-form-field">
            <label>Course Title *</label>
            <input
              required
              type="text"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              placeholder="e.g. Climate Action Workshop"
            />
          </div>
          <div className="modal-form-field">
            <label>Description</label>
            <textarea
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              placeholder="Brief course syllabus..."
              style={{ minHeight: 80, resize: 'vertical' }}
            />
          </div>
          <div className="modal-form-field">
            <label>Duration (Hours) *</label>
            <input
              required
              type="number"
              step="0.1"
              min="0"
              value={courseForm.duration_hours}
              onChange={(e) => setCourseForm({ ...courseForm, duration_hours: e.target.value })}
              placeholder="e.g. 2.5"
            />
          </div>
          <div className="modal-form-field">
            <label>ESG Category</label>
            <select value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}>
              <option value="Environmental">Environmental</option>
              <option value="Social">Social</option>
              <option value="Governance">Governance</option>
            </select>
          </div>
          <div className="modal-form-field">
            <label>Status</label>
            <select value={courseForm.status} onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <Button variant="neutral" type="button" onClick={() => setShowCourseModal(false)}>Cancel</Button>
            <Button variant="secondary" type="submit" loading={savingCourse}>Save Course</Button>
          </div>
        </form>
      </Modal>

      {/* 5. Completion Modal */}
      <Modal isOpen={showRecordModal} onClose={() => setShowRecordModal(false)} title={editRecord ? 'Edit Completion Log' : 'Log Course Completion'}>
        <form onSubmit={handleRecordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="modal-form-field">
            <label>Course *</label>
            <select
              required
              value={recordForm.course_id}
              onChange={(e) => setRecordForm({ ...recordForm, course_id: e.target.value })}
            >
              <option value="" disabled>Select Course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="modal-form-field">
            <label>Employee *</label>
            <select
              required
              value={recordForm.employee_id}
              onChange={(e) => setRecordForm({ ...recordForm, employee_id: e.target.value })}
              disabled={!canManage}
            >
              <option value="" disabled>Select Employee</option>
              {employees?.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.email})</option>)}
            </select>
          </div>
          <div className="modal-form-field">
            <label>Completion Date *</label>
            <input
              required
              type="date"
              value={recordForm.completion_date}
              onChange={(e) => setRecordForm({ ...recordForm, completion_date: e.target.value })}
            />
          </div>
          <div className="modal-form-field">
            <label>Quiz Score (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={recordForm.score}
              onChange={(e) => setRecordForm({ ...recordForm, score: e.target.value })}
              placeholder="e.g. 85 (optional)"
            />
          </div>
          <div className="modal-form-field">
            <label>Completion Status</label>
            <select value={recordForm.status} onChange={(e) => setRecordForm({ ...recordForm, status: e.target.value })}>
              <option value="completed">Completed</option>
              <option value="enrolled">Enrolled</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <Button variant="neutral" type="button" onClick={() => setShowRecordModal(false)}>Cancel</Button>
            <Button variant="secondary" type="submit" loading={savingRecord}>Log Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TrainingCompletion;
