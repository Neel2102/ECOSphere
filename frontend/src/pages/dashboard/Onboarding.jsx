import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import settingsService from '../../services/settingsService';
import userService from '../../services/userService';
import environmentalService from '../../services/environmentalService';
import socialService from '../../services/socialService';
import governanceService from '../../services/governanceService';
import gamificationService from '../../services/gamificationService';
import dashboardService from '../../services/dashboardService';
import Card from '../../components/common/Card/Card';
import Table from '../../components/common/Table/Table';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import Popup from '../../components/common/Popup/Popup';
import '../../styles/dashboard/onboarding.css';

/*
 * Guided onboarding — every step performs REAL API calls, so walking
 * through it sets up (and demonstrates) the entire EcoSphere flow:
 * the admin builds the organization, employees participate and earn.
 */

const ORG_STEPS = [
  { id: 1, title: 'Create Department', desc: 'Create the departments that own ESG performance.' },
  { id: 2, title: 'Add Employees', desc: 'Onboard managers and employees into their departments.' },
  { id: 3, title: 'Create Emission Factors', desc: 'Define the carbon coefficients used in auto-calculation.' },
  { id: 4, title: 'Create Goals', desc: 'Set measurable environmental targets per department.' },
  { id: 5, title: 'Create Policies', desc: 'Publish the governance policies employees must acknowledge.' },
  { id: 6, title: 'Create CSR Activity', desc: 'Open social activities employees can join for points.' },
  { id: 7, title: 'Approve Participation', desc: 'Review submitted proofs and approve or reject them.' },
  { id: 8, title: 'Dashboard & Reports', desc: 'Scores update live — generate and export reports.' },
];

const EMP_STEPS = [
  { id: 1, title: 'Join a CSR Activity', desc: 'Pick an open activity and register your participation.' },
  { id: 2, title: 'Upload Proof', desc: 'Attach evidence so your manager can approve it.' },
  { id: 3, title: 'Earn XP', desc: 'Once approved, points land in your balance.' },
  { id: 4, title: 'Unlock Badges', desc: 'Badges unlock automatically as your XP grows.' },
  { id: 5, title: 'Redeem a Reward', desc: 'Spend earned points on rewards from the catalog.' },
  { id: 6, title: 'See It on the Dashboard', desc: 'Your activity feeds the organization ESG scores.' },
];

const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

const SOURCE_OPTIONS = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'fleet', label: 'Fleet' },
  { value: 'expense', label: 'Expense' },
];

// Per-step action helper: runs an API call, shows its error inline.
function useAction() {
  const [error, setError] = useState('');
  const run = async (fn, after) => {
    setError('');
    try {
      await fn();
      after?.();
    } catch (err) {
      setError(err.message || 'Action failed.');
    }
  };
  return { error, run };
}

function StepError({ message }) {
  if (!message) return null;
  return <div className="onboarding-error" role="alert">⚠️ {message}</div>;
}

function ScoreRow({ scores }) {
  const items = [
    { label: 'Environmental', value: scores?.environmental, cls: 'env' },
    { label: 'Social', value: scores?.social, cls: 'soc' },
    { label: 'Governance', value: scores?.governance, cls: 'gov' },
    { label: 'Overall ESG', value: scores?.total, cls: 'all' },
  ];
  return (
    <div className="onboarding-score-row">
      {items.map((s) => (
        <div key={s.label} className={`onboarding-score onboarding-score--${s.cls}`}>
          <span className="onboarding-score__label">{s.label}</span>
          <span className="onboarding-score__value">{s.value ?? '…'} <small>/ 100</small></span>
        </div>
      ))}
    </div>
  );
}

/* ============================ ORG STEPS ============================ */

function StepDepartments({ departments, refetchDepts }) {
  const { error, run } = useAction();
  const [form, setForm] = useState({ name: '', code: '' });
  const columns = [
    { key: 'name', title: 'Department' },
    { key: 'code', title: 'Code' },
    { key: 'member_count', title: 'Members' },
    { key: 'status', title: 'Status', render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'neutral'}>{r.status}</Badge> },
  ];
  return (
    <div>
      <StepError message={error} />
      <form
        className="onboarding-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => settingsService.createDepartment({ name: form.name.trim(), code: form.code.trim().toUpperCase() }),
            () => { setForm({ name: '', code: '' }); refetchDepts(); }
          );
        }}
      >
        <div className="onboarding-form-row">
          <Input label="Department name" placeholder="e.g. Manufacturing" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Code" placeholder="e.g. MFG" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        </div>
        <Button type="submit">Create department</Button>
      </form>
      <div className="onboarding-table-card">
        <div className="onboarding-table-title">Departments ({departments.length})</div>
        <Table columns={columns} data={departments} rowKey="id" />
      </div>
    </div>
  );
}

function StepEmployees({ deptOptions, isAdmin }) {
  const { error, run } = useAction();
  const empty = { fullName: '', email: '', phone: '', role: 'employee', departmentId: '', gender: '', password: '' };
  const [form, setForm] = useState(empty);
  const { data, refetch } = useApi(() => userService.listUsers(), []);
  const users = data || [];
  const columns = [
    { key: 'fullName', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Role', render: (r) => <Badge variant={r.role === 'admin' ? 'danger' : r.role === 'manager' ? 'info' : 'success'}>{r.role}</Badge> },
    { key: 'departmentName', title: 'Department', render: (r) => r.departmentName || '—' },
  ];
  return (
    <div>
      <StepError message={error} />
      {isAdmin ? (
        <form
          className="onboarding-form"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () => userService.createUser({ ...form, departmentId: form.departmentId || null, gender: form.gender || null }),
              () => { setForm(empty); refetch(); }
            );
          }}
        >
          <div className="onboarding-form-row">
            <Input label="Full name" placeholder="e.g. Aditi Rao" value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            <Input label="Email" type="email" placeholder="name@company.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="onboarding-form-row">
            <Input label="Phone" prefix="+91" maxLength={10} placeholder="10-digit number" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} required />
            <Input label="Temporary password" type="password" placeholder="Min 8 chars, letter + number" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="onboarding-form-row onboarding-form-row--3">
            <Select label="Role" options={[{ value: 'employee', label: 'Employee' }, { value: 'manager', label: 'Department Manager' }]}
              value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
            <Select label="Department" placeholder="Assign department" options={deptOptions}
              value={form.departmentId} onChange={(v) => setForm({ ...form, departmentId: v })} />
            <Select label="Gender" placeholder="Optional" options={GENDER_OPTIONS}
              value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} />
          </div>
          <Button type="submit">Add team member</Button>
        </form>
      ) : (
        <div className="onboarding-note">Only the organization admin can onboard new accounts.</div>
      )}
      <div className="onboarding-table-card">
        <div className="onboarding-table-title">Team ({users.length})</div>
        <Table columns={columns} data={users} rowKey="id" />
      </div>
    </div>
  );
}

function StepFactors() {
  const { error, run } = useAction();
  const empty = { name: '', source_type: 'fleet', unit: '', factor_value: '' };
  const [form, setForm] = useState(empty);
  const { data, refetch } = useApi(() => environmentalService.listEmissionFactors(), []);
  const factors = data?.items || [];
  const columns = [
    { key: 'name', title: 'Factor' },
    { key: 'source_type', title: 'Source' },
    { key: 'factor_value', title: 'kg CO2 / unit', render: (r) => `${r.factor_value} / ${r.unit}` },
    { key: 'status', title: 'Status', render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'neutral'}>{r.status}</Badge> },
  ];
  return (
    <div>
      <StepError message={error} />
      <form
        className="onboarding-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => environmentalService.createEmissionFactor({ ...form, factor_value: Number(form.factor_value) }),
            () => { setForm(empty); refetch(); }
          );
        }}
      >
        <div className="onboarding-form-row">
          <Input label="Factor name" placeholder="e.g. Diesel (fleet)" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Select label="Source type" options={SOURCE_OPTIONS} value={form.source_type}
            onChange={(v) => setForm({ ...form, source_type: v })} />
        </div>
        <div className="onboarding-form-row">
          <Input label="Unit" placeholder="e.g. litre, kWh, km" value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
          <Input label="kg CO2 per unit" type="number" step="0.0001" min="0" placeholder="e.g. 2.68" value={form.factor_value}
            onChange={(e) => setForm({ ...form, factor_value: e.target.value })} required />
        </div>
        <Button type="submit">Create emission factor</Button>
      </form>
      <div className="onboarding-table-card">
        <div className="onboarding-table-title">Emission factors ({factors.length})</div>
        <Table columns={columns} data={factors} rowKey="id" />
      </div>
    </div>
  );
}

function StepGoals({ deptOptions }) {
  const { error, run } = useAction();
  const empty = { name: '', department_id: '', target_co2: '', current_co2: '', deadline: '' };
  const [form, setForm] = useState(empty);
  const { data, refetch } = useApi(() => environmentalService.listGoals(), []);
  const goals = data?.items || [];
  const columns = [
    { key: 'name', title: 'Goal' },
    { key: 'department_name', title: 'Department', render: (r) => r.department_name || '—' },
    { key: 'target_co2', title: 'Target / Current (t)', render: (r) => `${r.target_co2} / ${r.current_co2}` },
    { key: 'progress', title: 'Progress', render: (r) => `${r.progress ?? 0}%` },
    { key: 'deadline', title: 'Deadline', render: (r) => new Date(r.deadline).toLocaleDateString() },
  ];
  return (
    <div>
      <StepError message={error} />
      <form
        className="onboarding-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => environmentalService.createGoal({
              name: form.name.trim(),
              department_id: form.department_id || null,
              target_co2: Number(form.target_co2),
              current_co2: Number(form.current_co2 || 0),
              deadline: form.deadline,
            }),
            () => { setForm(empty); refetch(); }
          );
        }}
      >
        <Input label="Goal" placeholder="e.g. Reduce fleet emissions" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <div className="onboarding-form-row onboarding-form-row--3">
          <Select label="Department" placeholder="Owning department" options={deptOptions}
            value={form.department_id} onChange={(v) => setForm({ ...form, department_id: v })} />
          <Input label="Target CO2 (t)" type="number" min="0" step="0.01" value={form.target_co2}
            onChange={(e) => setForm({ ...form, target_co2: e.target.value })} required />
          <Input label="Current CO2 (t)" type="number" min="0" step="0.01" value={form.current_co2}
            onChange={(e) => setForm({ ...form, current_co2: e.target.value })} />
        </div>
        <Input label="Deadline" type="date" value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
        <Button type="submit">Create goal</Button>
      </form>
      <div className="onboarding-table-card">
        <div className="onboarding-table-title">Environmental goals ({goals.length})</div>
        <Table columns={columns} data={goals} rowKey="id" />
      </div>
    </div>
  );
}

function StepPolicies() {
  const { error, run } = useAction();
  const empty = { title: '', version: '1.0', effective_date: '', description: '' };
  const [form, setForm] = useState(empty);
  const { data, refetch } = useApi(() => governanceService.listPolicies(), []);
  const policies = data?.items || [];
  const columns = [
    { key: 'title', title: 'Policy' },
    { key: 'version', title: 'Version' },
    { key: 'acknowledged_count', title: 'Acknowledged', render: (r) => `${r.acknowledged_count ?? 0} / ${r.employee_total ?? 0}` },
    { key: 'status', title: 'Status', render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'neutral'}>{r.status}</Badge> },
  ];
  return (
    <div>
      <StepError message={error} />
      <form
        className="onboarding-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => governanceService.createPolicy({ ...form, status: 'active', effective_date: form.effective_date || null }),
            () => { setForm(empty); refetch(); }
          );
        }}
      >
        <Input label="Policy title" placeholder="e.g. Anti-Corruption Policy" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <div className="onboarding-form-row">
          <Input label="Version" value={form.version}
            onChange={(e) => setForm({ ...form, version: e.target.value })} />
          <Input label="Effective date" type="date" value={form.effective_date}
            onChange={(e) => setForm({ ...form, effective_date: e.target.value })} />
        </div>
        <Input label="Summary" placeholder="What this policy covers" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Button type="submit">Publish policy</Button>
      </form>
      <div className="onboarding-table-card">
        <div className="onboarding-table-title">Policies ({policies.length})</div>
        <Table columns={columns} data={policies} rowKey="id" />
      </div>
    </div>
  );
}

function StepActivities() {
  const { error, run } = useAction();
  const empty = { title: '', category_id: '', activity_date: '', points: '', evidence_required: true };
  const [form, setForm] = useState(empty);
  const { data, refetch } = useApi(() => socialService.listActivities(), []);
  const { data: catData } = useApi(() => settingsService.listCategories({ type: 'csr_activity' }), []);
  const activities = data?.items || [];
  const categories = (catData?.items || []).map((c) => ({ value: c.id, label: c.name }));
  const columns = [
    { key: 'title', title: 'Activity' },
    { key: 'category_name', title: 'Category', render: (r) => r.category_name || '—' },
    { key: 'points', title: 'Points' },
    { key: 'joined_count', title: 'Joined' },
    { key: 'evidence_required', title: 'Evidence', render: (r) => (r.evidence_required ? 'Required' : 'Optional') },
  ];
  return (
    <div>
      <StepError message={error} />
      <form
        className="onboarding-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => socialService.createActivity({
              title: form.title.trim(),
              category_id: form.category_id || null,
              activity_date: form.activity_date || null,
              points: Number(form.points || 0),
              evidence_required: form.evidence_required,
              status: 'open',
            }),
            () => { setForm(empty); refetch(); }
          );
        }}
      >
        <Input label="Activity title" placeholder="e.g. Tree Plantation Drive" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <div className="onboarding-form-row onboarding-form-row--3">
          <Select label="Category" placeholder="Optional" options={categories}
            value={form.category_id} onChange={(v) => setForm({ ...form, category_id: v })} />
          <Input label="Date" type="date" value={form.activity_date}
            onChange={(e) => setForm({ ...form, activity_date: e.target.value })} />
          <Input label="Points" type="number" min="0" placeholder="e.g. 50" value={form.points}
            onChange={(e) => setForm({ ...form, points: e.target.value })} required />
        </div>
        <label className="onboarding-check">
          <input type="checkbox" checked={form.evidence_required}
            onChange={(e) => setForm({ ...form, evidence_required: e.target.checked })} />
          Proof required before approval
        </label>
        <Button type="submit">Create CSR activity</Button>
      </form>
      <div className="onboarding-table-card">
        <div className="onboarding-table-title">CSR activities ({activities.length})</div>
        <Table columns={columns} data={activities} rowKey="id" />
      </div>
    </div>
  );
}

function StepApprovals() {
  const { error, run } = useAction();
  const { data, refetch } = useApi(() => socialService.listParticipations({ approval_status: 'pending' }), []);
  const pending = data?.items || [];
  const columns = [
    { key: 'employee_name', title: 'Employee' },
    { key: 'activity_title', title: 'Activity' },
    {
      key: 'proof_path', title: 'Proof',
      render: (r) => r.proof_path
        ? <a href={`http://localhost:5000/${r.proof_path}`} target="_blank" rel="noreferrer">View proof</a>
        : <span className="u-text-soft">not uploaded</span>,
    },
    { key: 'activity_points', title: 'Points' },
    {
      key: 'actions', title: '', align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button size="sm" onClick={() => run(() => socialService.approveParticipation(r.id, {}), refetch)}>Approve</Button>
          <Button size="sm" variant="danger" onClick={() => run(() => socialService.rejectParticipation(r.id), refetch)}>Reject</Button>
        </div>
      ),
    },
  ];
  return (
    <div>
      <StepError message={error} />
      <div className="onboarding-table-card">
        <div className="onboarding-table-title">Pending approvals ({pending.length})</div>
        <Table
          columns={columns}
          data={pending}
          rowKey="id"
          empty={<div className="onboarding-note">No pending participations — once employees join and upload proof, approvals appear here.</div>}
        />
      </div>
      <div className="onboarding-actions-row">
        <Button variant="secondary" onClick={refetch} iconLeft={<Icon name="activity" size={15} />}>Refresh queue</Button>
      </div>
    </div>
  );
}

function StepReports({ finish, onFinish }) {
  const { data } = useApi(() => dashboardService.getOverview(), []);
  return (
    <div>
      <ScoreRow scores={data?.scores} />
      <p className="onboarding-note">
        Every approval, emission and acknowledgement you just created feeds these scores.
        Open Reports to filter by department, date, employee or module and export as PDF, Excel or CSV.
      </p>
      <div className="onboarding-actions-row">
        <Button onClick={() => finish('/dashboard/reports')} iconLeft={<Icon name="reports" size={15} />}>Open Reports</Button>
        <Button variant="secondary" onClick={() => finish('/dashboard')}>Open Dashboard</Button>
        <Button variant="secondary" onClick={onFinish}>Finish onboarding</Button>
      </div>
    </div>
  );
}

/* ========================== EMPLOYEE STEPS ========================== */

function StepJoin() {
  const { error, run } = useAction();
  const { data, refetch } = useApi(() => socialService.listActivities({ status: 'open' }), []);
  const activities = data?.items || [];
  return (
    <div>
      <StepError message={error} />
      <div className="onboarding-activity-grid">
        {activities.map((a) => (
          <div key={a.id} className="onboarding-activity">
            <div className="onboarding-activity__title">{a.title}</div>
            <div className="onboarding-activity__meta">
              +{a.points} pts · {a.joined_count} joined{a.evidence_required ? ' · proof required' : ''}
            </div>
            {a.joined_by_me ? (
              <Badge variant="success">Joined</Badge>
            ) : (
              <Button size="sm" onClick={() => run(() => socialService.joinActivity(a.id), refetch)}>Join</Button>
            )}
          </div>
        ))}
        {activities.length === 0 && (
          <div className="onboarding-note">No open activities yet — ask your admin to create one.</div>
        )}
      </div>
    </div>
  );
}

function StepProof() {
  const { error, run } = useAction();
  const { data, refetch } = useApi(() => socialService.listParticipations(), []);
  const mine = data?.items || [];
  const handleFile = (participationId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('proof', file);
    run(() => socialService.uploadProof(participationId, formData), refetch);
  };
  const columns = [
    { key: 'activity_title', title: 'Activity' },
    { key: 'approval_status', title: 'Status', render: (r) => <Badge variant={r.approval_status === 'approved' ? 'success' : r.approval_status === 'rejected' ? 'danger' : 'warning'}>{r.approval_status}</Badge> },
    {
      key: 'proof_path', title: 'Proof',
      render: (r) => r.proof_path ? (
        <span className="u-text-soft">uploaded ✓</span>
      ) : (
        <label className="onboarding-file-btn">
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" hidden
            onChange={(e) => handleFile(r.id, e.target.files?.[0])} />
          <Icon name="camera" size={14} /> Upload proof
        </label>
      ),
    },
  ];
  return (
    <div>
      <StepError message={error} />
      <div className="onboarding-table-card">
        <div className="onboarding-table-title">My participations</div>
        <Table columns={columns} data={mine} rowKey="id"
          empty={<div className="onboarding-note">Join an activity first (previous step).</div>} />
      </div>
    </div>
  );
}

function StepXp() {
  const { data, refetch } = useApi(() => gamificationService.getMyXp(), []);
  const { data: partData, refetch: refetchParts } = useApi(() => socialService.listParticipations(), []);
  const summary = data?.summary;
  const mine = partData?.items || [];
  return (
    <div>
      <div className="onboarding-score-row">
        <div className="onboarding-score onboarding-score--all">
          <span className="onboarding-score__label">Points earned</span>
          <span className="onboarding-score__value">{summary?.earned ?? '…'}</span>
        </div>
        <div className="onboarding-score onboarding-score--soc">
          <span className="onboarding-score__label">Balance</span>
          <span className="onboarding-score__value">{summary?.balance ?? '…'}</span>
        </div>
        <div className="onboarding-score onboarding-score--gam">
          <span className="onboarding-score__label">Challenges done</span>
          <span className="onboarding-score__value">{summary?.challenges_completed ?? '…'}</span>
        </div>
      </div>
      <div className="onboarding-table-card">
        <div className="onboarding-table-title">Approval status</div>
        <Table
          columns={[
            { key: 'activity_title', title: 'Activity' },
            { key: 'approval_status', title: 'Status', render: (r) => <Badge variant={r.approval_status === 'approved' ? 'success' : r.approval_status === 'rejected' ? 'danger' : 'warning'}>{r.approval_status}</Badge> },
            { key: 'points_earned', title: 'Points earned' },
          ]}
          data={mine}
          rowKey="id"
        />
      </div>
      <div className="onboarding-actions-row">
        <Button variant="secondary" onClick={() => { refetch(); refetchParts(); }}>Check again</Button>
      </div>
    </div>
  );
}

function StepBadges() {
  const { data } = useApi(() => gamificationService.listBadges(), []);
  const badges = data?.items || [];
  return (
    <div className="onboarding-badge-grid">
      {badges.map((b) => (
        <div key={b.id} className={`onboarding-badge${b.earned_by_me ? ' is-earned' : ''}`}>
          <span className="onboarding-badge__icon"><Icon name="trophy" size={22} /></span>
          <span className="onboarding-badge__name">{b.name}</span>
          <span className="onboarding-badge__rule">
            {b.unlock_rule_type === 'xp' ? `${b.unlock_rule_value} XP` : `${b.unlock_rule_value} challenge${b.unlock_rule_value > 1 ? 's' : ''}`}
          </span>
          {b.earned_by_me && <Badge variant="success">Earned</Badge>}
        </div>
      ))}
      {badges.length === 0 && <div className="onboarding-note">No badges configured yet.</div>}
    </div>
  );
}

function StepRedeem() {
  const { error, run } = useAction();
  const { data: xpData, refetch: refetchXp } = useApi(() => gamificationService.getMyXp(), []);
  const { data, refetch } = useApi(() => gamificationService.listRewards({ status: 'active' }), []);
  const balance = xpData?.summary?.balance ?? 0;
  const rewards = data?.items || [];
  return (
    <div>
      <StepError message={error} />
      <p className="onboarding-note">Your balance: <strong>{balance} points</strong></p>
      <div className="onboarding-activity-grid">
        {rewards.map((r) => (
          <div key={r.id} className="onboarding-activity">
            <div className="onboarding-activity__title">{r.name}</div>
            <div className="onboarding-activity__meta">{r.points_required} pts · {r.stock} in stock</div>
            <Button
              size="sm"
              disabled={balance < r.points_required || r.stock === 0}
              onClick={() => run(() => gamificationService.redeemReward(r.id), () => { refetch(); refetchXp(); })}
            >
              {r.stock === 0 ? 'Out of stock' : balance < r.points_required ? 'Not enough points' : 'Redeem'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepEmployeeDone({ finish, onFinish }) {
  const { data } = useApi(() => dashboardService.getOverview(), []);
  return (
    <div>
      <ScoreRow scores={data?.scores} />
      <p className="onboarding-note">
        Your participation just moved these numbers. Keep joining activities and challenges to climb the leaderboard.
      </p>
      <div className="onboarding-actions-row">
        <Button onClick={() => finish('/dashboard')}>Open Dashboard</Button>
        <Button variant="secondary" onClick={onFinish}>Finish onboarding</Button>
      </div>
    </div>
  );
}

/* ============================== SHELL ============================== */

function Onboarding({ onComplete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOrg = user?.role === 'admin' || user?.role === 'manager';
  const isAdmin = user?.role === 'admin';
  const steps = isOrg ? ORG_STEPS : EMP_STEPS;

  const [currentStep, setCurrentStep] = useState(1);
  const [donePopup, setDonePopup] = useState(false);

  // Marks onboarding complete (unlocks the main app shell) before leaving.
  const finish = (path) => {
    onComplete?.();
    navigate(path);
  };

  const { data: deptData, refetch: refetchDepts } = useApi(() => settingsService.listDepartments(), []);
  const departments = deptData?.items || [];
  const deptOptions = departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }));

  const stepContent = () => {
    if (isOrg) {
      switch (currentStep) {
        case 1: return <StepDepartments departments={departments} refetchDepts={refetchDepts} />;
        case 2: return <StepEmployees deptOptions={deptOptions} isAdmin={isAdmin} />;
        case 3: return <StepFactors />;
        case 4: return <StepGoals deptOptions={deptOptions} />;
        case 5: return <StepPolicies />;
        case 6: return <StepActivities />;
        case 7: return <StepApprovals />;
        default: return <StepReports finish={finish} onFinish={() => setDonePopup(true)} />;
      }
    }
    switch (currentStep) {
      case 1: return <StepJoin />;
      case 2: return <StepProof />;
      case 3: return <StepXp />;
      case 4: return <StepBadges />;
      case 5: return <StepRedeem />;
      default: return <StepEmployeeDone finish={finish} onFinish={() => setDonePopup(true)} />;
    }
  };

  return (
    <div className="onboarding-page">
      {/* Step checklist */}
      <Card flat className="onboarding-steps-card">
        <div className="onboarding-steps-title">{isOrg ? 'Organization Setup' : 'Employee Journey'}</div>
        <ul className="onboarding-step-list">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <li
                key={step.id}
                className={`onboarding-step-item${isActive ? ' is-active' : ''}${isCompleted ? ' is-completed' : ''}`}
                onClick={() => setCurrentStep(step.id)}
              >
                <span className="onboarding-step-icon">
                  {isCompleted ? <Icon name="check" size={10} strokeWidth={3} /> : step.id}
                </span>
                <span>{step.title}</span>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Step content */}
      <Card flat padding="none" className="onboarding-content-card">
        <div className="onboarding-content-header">
          <div className="onboarding-content-title-row">
            <h3 className="onboarding-content-title">
              Step {currentStep}: {steps[currentStep - 1].title}
            </h3>
            <Badge variant={isOrg ? 'info' : 'success'}>
              {isOrg ? (isAdmin ? 'Organization Admin' : 'Department Manager') : 'Employee'}
            </Badge>
          </div>
          <p className="onboarding-content-desc">{steps[currentStep - 1].desc}</p>
        </div>

        <div className="onboarding-content-body">{stepContent()}</div>

        <div className="onboarding-footer">
          <div className="onboarding-progress-label">Step {currentStep} of {steps.length}</div>
          <div className="onboarding-actions">
            {currentStep > 1 && (
              <Button variant="secondary" onClick={() => setCurrentStep((s) => s - 1)}>Previous</Button>
            )}
            {currentStep < steps.length && (
              <Button onClick={() => setCurrentStep((s) => s + 1)}>Next step</Button>
            )}
          </div>
        </div>
      </Card>

      <Popup
        open={donePopup}
        variant="success"
        icon="check"
        title="You're all set!"
        message="EcoSphere is configured and live. Everything you created is real data — see it on the dashboard."
        confirmLabel="Go to Dashboard"
        onConfirm={() => { setDonePopup(false); finish('/dashboard'); }}
        onCancel={() => setDonePopup(false)}
      />
    </div>
  );
}

export default Onboarding;
