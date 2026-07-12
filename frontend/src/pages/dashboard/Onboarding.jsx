import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card/Card';
import Table from '../../components/common/Table/Table';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import Popup from '../../components/common/Popup/Popup';
import '../../styles/dashboard/onboarding.css';

// Organization setup steps (Admin / Manager)
const ORG_STEPS = [
  { id: 1, title: 'Create Department', desc: 'Create departments to categorize sustainability teams.' },
  { id: 2, title: 'Add Employees', desc: 'Add employees and assign them to departments.' },
  { id: 3, title: 'Create Emission Factors', desc: 'Define carbon coefficients for energy and waste.' },
  { id: 4, title: 'Create Goals', desc: 'Establish environmental ESG targets.' },
  { id: 5, title: 'Create Policies', desc: 'Draft and publish compliance policies.' },
  { id: 6, title: 'Create CSR Activity', desc: 'Create social volunteer opportunities.' },
  { id: 7, title: 'Manager Approves', desc: 'Approve or reject submitted activity proofs.' },
  { id: 8, title: 'Reports Generate', desc: 'Export certified ESG audits and analytics.' },
];

// Employee individual steps
const EMP_STEPS = [
  { id: 1, title: 'Employee Participates', desc: 'Register employee participation in activities.' },
  { id: 2, title: 'Employee Uploads Proof', desc: 'Submit completion proofs for validation.' },
  { id: 3, title: 'Employee Gets XP', desc: 'Distribute XP points for successful completions.' },
  { id: 4, title: 'Badge Unlock', desc: 'Award automated milestone achievement badges.' },
  { id: 5, title: 'Reward Redeem', desc: 'Allow employees to redeem points for eco-rewards.' },
  { id: 6, title: 'Dashboard Updates', desc: 'Verify real-time ESG metrics dashboard changes.' },
];

function Onboarding({ onComplete }) {
  const { user } = useAuth();
  const isOrg = user?.role === 'admin' || user?.role === 'manager';
  const steps = isOrg ? ORG_STEPS : EMP_STEPS;

  const [currentStep, setCurrentStep] = useState(1);
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Flow State
  const [departments, setDepartments] = useState([
    { id: '1', name: 'Executive Operations', code: 'EXEC' },
  ]);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');

  const [employees, setEmployees] = useState([
    { id: '101', name: 'John Doe', email: 'john.doe@company.com', dept: 'Executive Operations', xp: 50 },
  ]);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Executive Operations');

  const [factors, setFactors] = useState([
    { id: 'F-1', name: 'Standard Petrol Fuel', category: 'Scope 1', value: 2.31, unit: 'kg CO2/L' },
  ]);
  const [newFactorName, setNewFactorName] = useState('');
  const [newFactorCategory, setNewFactorCategory] = useState('Scope 1');
  const [newFactorValue, setNewFactorValue] = useState('');
  const [newFactorUnit, setNewFactorUnit] = useState('kg CO2/kWh');

  const [goals, setGoals] = useState([
    { id: 'G-1', name: 'Zero Direct Coal Consumption', target: '2026', value: '100% reduction' },
  ]);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalValue, setNewGoalValue] = useState('');

  const [policies, setPolicies] = useState([
    { id: 'P-1', title: 'Corporate Travel Minimization', category: 'Environmental', status: 'Published' },
  ]);
  const [newPolicyTitle, setNewPolicyTitle] = useState('');
  const [newPolicyCategory, setNewPolicyCategory] = useState('Environmental');
  const [newPolicyContent, setNewPolicyContent] = useState('');

  const [activities, setActivities] = useState([
    { id: 'A-1', name: 'Office E-Waste Sorting', date: '2026-07-15', xp: 100 },
    { id: 'A-2', name: 'Tree Planting Campaign', date: '2026-07-28', xp: 150 },
  ]);
  const [newActName, setNewActName] = useState('');
  const [newActDate, setNewActDate] = useState('');
  const [newActXp, setNewActXp] = useState('');

  const [registrations, setRegistrations] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedAct, setSelectedAct] = useState('');

  const [proofs, setProofs] = useState([]);
  const [selectedReg, setSelectedReg] = useState('');
  const [proofDesc, setProofDesc] = useState('');

  const [approvals, setApprovals] = useState([
    // Mock prepopulated approval for organization flow
    {
      id: 'PR-MOCK',
      regId: 'R-MOCK',
      employeeName: 'Alice Green',
      activityName: 'Tree Planting Drive',
      description: 'Planted 5 oak trees behind the primary warehouse.',
      fileName: 'evidence.jpg',
      status: 'Pending',
    }
  ]);
  
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState('Eco Thermos');
  const [selectedRedeemEmp, setSelectedRedeemEmp] = useState('');

  const [reports, setReports] = useState([
    { id: 'REP-01', name: 'Q1 Emissions Breakdown', format: 'PDF', date: '2026-04-01' },
  ]);
  const [reportType, setReportType] = useState('Carbon Footprint Summary');

  // Next and Prev functions
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form Submissions
  const handleCreateDept = (e) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptCode.trim()) return;
    const newDept = {
      id: String(departments.length + 1),
      name: newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase(),
    };
    setDepartments([...departments, newDept]);
    setNewDeptName('');
    setNewDeptCode('');
    nextStep();
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpEmail.trim()) return;
    const newEmp = {
      id: String(100 + employees.length + 1),
      name: newEmpName.trim(),
      email: newEmpEmail.trim(),
      dept: newEmpDept,
      xp: 0,
    };
    setEmployees([...employees, newEmp]);
    setNewEmpName('');
    setNewEmpEmail('');
    nextStep();
  };

  const handleCreateFactor = (e) => {
    e.preventDefault();
    const val = parseFloat(newFactorValue);
    if (!newFactorName.trim() || Number.isNaN(val)) return;
    const newF = {
      id: `F-${factors.length + 1}`,
      name: newFactorName.trim(),
      category: newFactorCategory,
      value: val,
      unit: newFactorUnit,
    };
    setFactors([...factors, newF]);
    setNewFactorName('');
    setNewFactorValue('');
    nextStep();
  };

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newGoalName.trim() || !newGoalTarget.trim()) return;
    const newG = {
      id: `G-${goals.length + 1}`,
      name: newGoalName.trim(),
      target: newGoalTarget.trim(),
      value: newGoalValue.trim() || '25% reduction',
    };
    setGoals([...goals, newG]);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalValue('');
    nextStep();
  };

  const handleCreatePolicy = (e) => {
    e.preventDefault();
    if (!newPolicyTitle.trim()) return;
    const newP = {
      id: `P-${policies.length + 1}`,
      title: newPolicyTitle.trim(),
      category: newPolicyCategory,
      status: 'Published',
    };
    setPolicies([...policies, newP]);
    setNewPolicyTitle('');
    setNewPolicyContent('');
    nextStep();
  };

  const handleCreateActivity = (e) => {
    e.preventDefault();
    const points = parseInt(newActXp, 10);
    if (!newActName.trim() || Number.isNaN(points)) return;
    const newA = {
      id: `A-${activities.length + 1}`,
      name: newActName.trim(),
      date: newActDate || '2026-07-28',
      xp: points,
    };
    setActivities([...activities, newA]);
    setNewActName('');
    setNewActDate('');
    setNewActXp('');
    nextStep();
  };

  const handleEmployeeParticipate = (e) => {
    e.preventDefault();
    const empName = user?.fullName || 'Alice Green';
    const empId = user?.id || '102';
    const actId = selectedAct || activities[0].id;
    const act = activities.find((a) => a.id === actId);
    if (!act) return;

    const newReg = {
      id: `R-${registrations.length + 1}`,
      employeeName: empName,
      employeeId: empId,
      activityName: act.name,
      activityId: act.id,
      xpReward: act.xp,
      status: 'Registered',
    };
    setRegistrations([...registrations, newReg]);
    nextStep();
  };

  const handleUploadProof = (e) => {
    e.preventDefault();
    const reg = registrations[0] || {
      id: 'R-SIM',
      employeeName: user?.fullName || 'Alice Green',
      activityName: 'Tree Planting Campaign',
      xpReward: 150,
    };

    const newProof = {
      id: `PR-${proofs.length + 1}`,
      regId: reg.id,
      employeeName: reg.employeeName,
      activityName: reg.activityName,
      description: proofDesc || 'Planted trees and submitted photo evidence.',
      fileName: 'proof.jpg',
      status: 'Pending',
    };
    setProofs([...proofs, newProof]);
    setProofDesc('');
    nextStep();
  };

  const handleFastApproval = () => {
    // Award XP
    const empName = user?.fullName || 'Alice Green';
    const earnedXp = 150;
    
    // Create updated list
    const updatedEmployees = employees.map((emp) => {
      if (emp.name === empName) {
        return { ...emp, xp: emp.xp + earnedXp };
      }
      return emp;
    });
    
    // Add employee if not exists
    const empExists = updatedEmployees.some((emp) => emp.name === empName);
    if (!empExists) {
      updatedEmployees.push({
        id: '102',
        name: empName,
        email: user?.email || 'alice@ecosphere.com',
        dept: 'Sustainability Division',
        xp: earnedXp,
      });
    }

    setEmployees(updatedEmployees);
    nextStep();
  };

  const handleManagerApprove = (proofId) => {
    // Remove from approvals queue
    setApprovals(approvals.filter((a) => a.id !== proofId));
    nextStep();
  };

  const handleTriggerBadgeUnlock = () => {
    setShowBadgePopup(true);
  };

  const handleCloseBadgePopup = () => {
    setShowBadgePopup(false);
    nextStep();
  };

  const handleRedeemReward = (e) => {
    e.preventDefault();
    const empName = user?.fullName || 'Alice Green';
    const cost = selectedReward === 'Eco Thermos' ? 100 : 150;

    const newRedemption = {
      id: `RED-${redeemedRewards.length + 1}`,
      employeeName: empName,
      reward: selectedReward,
      cost,
      status: 'Redeemed',
    };
    setRedeemedRewards([...redeemedRewards, newRedemption]);
    nextStep();
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    const newReport = {
      id: `REP-${String(reports.length + 1).padStart(2, '0')}`,
      name: reportType,
      format: 'PDF',
      date: new Date().toISOString().split('T')[0],
    };
    setReports([newReport, ...reports]);
    setShowSuccessPopup(true);
  };

  // Memoized tables columns
  const deptColumns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Department Name' },
    { key: 'code', title: 'Department Code' },
  ];

  const empColumns = [
    { key: 'id', title: 'Employee ID' },
    { key: 'name', title: 'Full Name' },
    { key: 'email', title: 'Email Address' },
    { key: 'dept', title: 'Department' },
    { key: 'xp', title: 'Current XP' },
  ];

  const factorColumns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Factor Name' },
    { key: 'category', title: 'Scope Category' },
    {
      key: 'value',
      title: 'Factor Value',
      render: (row) => `${row.value} ${row.unit}`,
    },
  ];

  const goalColumns = [
    { key: 'id', title: 'Goal ID' },
    { key: 'name', title: 'Goal Description' },
    { key: 'target', title: 'Target Year' },
    { key: 'value', title: 'Target Metric' },
  ];

  const policyColumns = [
    { key: 'id', title: 'Policy ID' },
    { key: 'title', title: 'Policy Title' },
    { key: 'category', title: 'Category' },
    {
      key: 'status',
      title: 'Status',
      render: (row) => <Badge variant="success">{row.status}</Badge>,
    },
  ];

  const actColumns = [
    { key: 'id', title: 'Activity ID' },
    { key: 'name', title: 'Activity Title' },
    { key: 'date', title: 'Date Scheduled' },
    { key: 'xp', title: 'XP Points' },
  ];

  const regColumns = [
    { key: 'id', title: 'Reg ID' },
    { key: 'employeeName', title: 'Employee' },
    { key: 'activityName', title: 'Activity' },
    {
      key: 'status',
      title: 'Status',
      render: (row) => <Badge variant="info">{row.status}</Badge>,
    },
  ];

  const approvalColumns = [
    { key: 'id', title: 'Proof ID' },
    { key: 'employeeName', title: 'Employee Name' },
    { key: 'activityName', title: 'CSR Activity' },
    { key: 'description', title: 'Proof Description' },
    {
      key: 'actions',
      title: 'Action',
      align: 'right',
      render: (row) => (
        <Button variant="success" size="sm" onClick={() => handleManagerApprove(row.id)}>
          Approve Proof
        </Button>
      ),
    },
  ];

  const rewardColumns = [
    { key: 'id', title: 'Redeem ID' },
    { key: 'employeeName', title: 'Employee' },
    { key: 'reward', title: 'Eco Reward' },
    { key: 'cost', title: 'XP Spent' },
    {
      key: 'status',
      title: 'Status',
      render: (row) => <Badge variant="success">{row.status}</Badge>,
    },
  ];

  const reportColumns = [
    { key: 'id', title: 'Report ID' },
    { key: 'name', title: 'Report Name' },
    { key: 'format', title: 'Format' },
    { key: 'date', title: 'Date Generated' },
  ];

  return (
    <div className="onboarding-page">
      {/* Sidebar Checklist */}
      <Card flat className="onboarding-steps-card">
        <div className="onboarding-steps-title">{isOrg ? 'Organization Setup' : 'Employee Setup'}</div>
        <ul className="onboarding-step-list">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <li
                key={step.id}
                className={`onboarding-step-item${isActive ? ' is-active' : ''}${
                  isCompleted ? ' is-completed' : ''
                }`}
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

      {/* Interactive Main Area */}
      <Card flat padding="none" className="onboarding-content-card">
        <div className="onboarding-content-header">
          <div className="onboarding-content-title-row">
            <h3 className="onboarding-content-title">
              Step {currentStep}: {steps[currentStep - 1].title}
            </h3>
            <Badge variant="success">
              {isOrg ? 'Organization Setup' : 'Employee Session'}
            </Badge>
          </div>
          <p className="onboarding-content-desc">{steps[currentStep - 1].desc}</p>
        </div>

        <div className="onboarding-content-body">
          {/* ORG FLOW - STEP 1: Create Department */}
          {isOrg && currentStep === 1 && (
            <div>
              <form onSubmit={handleCreateDept} className="onboarding-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input
                    label="Department Name"
                    placeholder="e.g. Sustainability Division"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    required
                  />
                  <Input
                    label="Department Code"
                    placeholder="e.g. SUST"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="indigo">
                  Create Department
                </Button>
              </form>

              <div className="onboarding-table-card">
                <div className="onboarding-table-title">Registered Departments</div>
                <Table columns={deptColumns} data={departments} rowKey="id" />
              </div>
            </div>
          )}

          {/* ORG FLOW - STEP 2: Add Employees */}
          {isOrg && currentStep === 2 && (
            <div>
              <form onSubmit={handleAddEmployee} className="onboarding-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input
                    label="Employee Name"
                    placeholder="e.g. Alice Green"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    placeholder="e.g. alice@ecosphere.com"
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    required
                  />
                </div>
                <Select
                  label="Assign Department"
                  options={departments.map((d) => ({ value: d.name, label: `${d.name} (${d.code})` }))}
                  value={newEmpDept}
                  onChange={setNewEmpDept}
                />
                <Button type="submit" variant="indigo">
                  Add Employee
                </Button>
              </form>

              <div className="onboarding-table-card">
                <div className="onboarding-table-title">Employee Roster</div>
                <Table columns={empColumns} data={employees} rowKey="id" />
              </div>
            </div>
          )}

          {/* ORG FLOW - STEP 3: Create Emission Factors */}
          {isOrg && currentStep === 3 && (
            <div>
              <form onSubmit={handleCreateFactor} className="onboarding-form">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <Input
                    label="Factor Name"
                    placeholder="e.g. Electricity Grid (Regional)"
                    value={newFactorName}
                    onChange={(e) => setNewFactorName(e.target.value)}
                    required
                  />
                  <Input
                    label="Factor Value"
                    type="number"
                    step="0.001"
                    placeholder="e.g. 0.47"
                    value={newFactorValue}
                    onChange={(e) => setNewFactorValue(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Select
                    label="ESG Scope"
                    options={[
                      { value: 'Scope 1', label: 'Scope 1 (Direct)' },
                      { value: 'Scope 2', label: 'Scope 2 (Indirect energy)' },
                      { value: 'Scope 3', label: 'Scope 3 (Supply chain & travel)' },
                    ]}
                    value={newFactorCategory}
                    onChange={setNewFactorCategory}
                  />
                  <Input
                    label="Measurement Unit"
                    placeholder="e.g. kg CO2/kWh"
                    value={newFactorUnit}
                    onChange={(e) => setNewFactorUnit(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="indigo">
                  Create Emission Factor
                </Button>
              </form>

              <div className="onboarding-table-card">
                <div className="onboarding-table-title">Emission Factors Database</div>
                <Table columns={factorColumns} data={factors} rowKey="id" />
              </div>
            </div>
          )}

          {/* ORG FLOW - STEP 4: Create Goals */}
          {isOrg && currentStep === 4 && (
            <div>
              <form onSubmit={handleCreateGoal} className="onboarding-form">
                <Input
                  label="Goal Description"
                  placeholder="e.g. Reduce scope 2 electricity carbon intensity"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  required
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input
                    label="Target Year"
                    placeholder="e.g. 2026"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    required
                  />
                  <Input
                    label="Metric / Value target"
                    placeholder="e.g. 25% intensity reduction"
                    value={newGoalValue}
                    onChange={(e) => setNewGoalValue(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="indigo">
                  Create ESG Goal
                </Button>
              </form>

              <div className="onboarding-table-card">
                <div className="onboarding-table-title">Organizational ESG Targets</div>
                <Table columns={goalColumns} data={goals} rowKey="id" />
              </div>
            </div>
          )}

          {/* ORG FLOW - STEP 5: Create Policies */}
          {isOrg && currentStep === 5 && (
            <div>
              <form onSubmit={handleCreatePolicy} className="onboarding-form">
                <Input
                  label="Policy Title"
                  placeholder="e.g. Corporate Plastic-Free Directive"
                  value={newPolicyTitle}
                  onChange={(e) => setNewPolicyTitle(e.target.value)}
                  required
                />
                <Select
                  label="Category"
                  options={[
                    { value: 'Environmental', label: 'Environmental' },
                    { value: 'Social', label: 'Social' },
                    { value: 'Governance', label: 'Governance' },
                  ]}
                  value={newPolicyCategory}
                  onChange={setNewPolicyCategory}
                />
                <Input
                  label="Policy Scope details"
                  placeholder="Define limits, applications and instructions..."
                  value={newPolicyContent}
                  onChange={(e) => setNewPolicyContent(e.target.value)}
                />
                <Button type="submit" variant="indigo">
                  Publish Policy
                </Button>
              </form>

              <div className="onboarding-table-card">
                <div className="onboarding-table-title">Corporate ESG Policies</div>
                <Table columns={policyColumns} data={policies} rowKey="id" />
              </div>
            </div>
          )}

          {/* ORG FLOW - STEP 6: Create CSR Activity */}
          {isOrg && currentStep === 6 && (
            <div>
              <form onSubmit={handleCreateActivity} className="onboarding-form">
                <Input
                  label="CSR Activity Title"
                  placeholder="e.g. Tree Planting Campaign"
                  value={newActName}
                  onChange={(e) => setNewActName(e.target.value)}
                  required
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input
                    label="Date Scheduled"
                    type="date"
                    value={newActDate}
                    onChange={(e) => setNewActDate(e.target.value)}
                  />
                  <Input
                    label="XP Reward Value"
                    type="number"
                    placeholder="e.g. 150"
                    value={newActXp}
                    onChange={(e) => setNewActXp(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="indigo">
                  Create Activity
                </Button>
              </form>

              <div className="onboarding-table-card">
                <div className="onboarding-table-title">Upcoming CSR Campaigns</div>
                <Table columns={actColumns} data={activities} rowKey="id" />
              </div>
            </div>
          )}

          {/* ORG FLOW - STEP 7: Manager Approves */}
          {isOrg && currentStep === 7 && (
            <div>
              <div className="onboarding-table-card">
                <div className="onboarding-table-title">Pending Approvals Queue</div>
                <Table columns={approvalColumns} data={approvals} rowKey="id" />
              </div>
            </div>
          )}

          {/* ORG FLOW - STEP 8: Reports Generate */}
          {isOrg && currentStep === 8 && (
            <div>
              <form onSubmit={handleGenerateReport} className="onboarding-form">
                <Select
                  label="Select Report Template"
                  options={[
                    { value: 'Carbon Footprint Summary', label: 'Carbon Footprint Summary (Scope 1, 2, 3)' },
                    { value: 'CSR Participation Report', label: 'CSR Volunteer & Engagement Metrics' },
                    { value: 'Governance Compliance Audit', label: 'Governance & Policy Acknowledgment Audit' },
                  ]}
                  value={reportType}
                  onChange={setReportType}
                />
                <Button type="submit" variant="indigo">
                  Generate ESG Report
                </Button>
              </form>

              <div className="onboarding-table-card">
                <div className="onboarding-table-title">Certified Reports Log</div>
                <Table columns={reportColumns} data={reports} rowKey="id" />
              </div>
            </div>
          )}

          {/* EMPLOYEE FLOW - STEP 1: Employee Participates */}
          {!isOrg && currentStep === 1 && (
            <div>
              <form onSubmit={handleEmployeeParticipate} className="onboarding-form">
                <Input
                  label="Employee Name"
                  value={user?.fullName || 'Alice Green'}
                  disabled
                />
                <Select
                  label="Select CSR Activity to Register"
                  options={activities.map((a) => ({ value: a.id, label: `${a.name} (+${a.xp} XP)` }))}
                  value={selectedAct}
                  onChange={setSelectedAct}
                />
                <Button type="submit" variant="indigo">
                  Register Participation
                </Button>
              </form>

              <div className="onboarding-table-card">
                <div className="onboarding-table-title">Activity Registrations</div>
                <Table columns={regColumns} data={registrations} rowKey="id" />
              </div>
            </div>
          )}

          {/* EMPLOYEE FLOW - STEP 2: Employee Uploads Proof */}
          {!isOrg && currentStep === 2 && (
            <div>
              <form onSubmit={handleUploadProof} className="onboarding-form">
                <Input
                  label="Registration"
                  value={`${user?.fullName || 'Alice Green'} — Tree Planting Campaign`}
                  disabled
                />
                <Input
                  label="Describe your action / proof details"
                  placeholder="e.g. Planted 5 trees behind main office and composted organic soil."
                  value={proofDesc}
                  onChange={(e) => setProofDesc(e.target.value)}
                  required
                />
                <div
                  style={{
                    padding: '24px',
                    border: '1px dashed var(--color-text-faint)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    background: 'var(--color-surface-soft)',
                  }}
                >
                  <Icon name="camera" size={24} style={{ color: 'var(--color-text-soft)', marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Drag & drop evidence files here</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-soft)', marginTop: '4px' }}>
                    Supported formats: PNG, JPG, PDF (max 5MB)
                  </div>
                </div>
                <Button type="submit" variant="indigo">
                  Submit Activity Proof
                </Button>
              </form>
            </div>
          )}

          {/* EMPLOYEE FLOW - STEP 3: Employee Gets XP */}
          {!isOrg && currentStep === 3 && (
            <div>
              <div style={{ padding: '24px', background: 'var(--color-surface-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-dim)', textAlign: 'center', marginBottom: '24px' }}>
                <Icon name="activity" size={32} style={{ color: 'var(--color-warning)', marginBottom: '12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-heading)' }}>Evidence Review Status</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-soft)', marginTop: '4px', marginBottom: '16px' }}>
                  Your proof has been successfully submitted to your manager.
                </p>
                <Button variant="success" onClick={handleFastApproval}>
                  Simulate Manager Approval
                </Button>
              </div>

              <div className="onboarding-table-card">
                <div className="onboarding-table-title">Employee Roster (XP Leaderboard)</div>
                <Table columns={empColumns} data={employees} rowKey="id" />
              </div>
            </div>
          )}

          {/* EMPLOYEE FLOW - STEP 4: Badge Unlock */}
          {!isOrg && currentStep === 4 && (
            <div>
              <div className="onboarding-badge-display">
                <div className="onboarding-badge-icon">
                  <Icon name="trophy" size={48} />
                </div>
                <div className="onboarding-badge-name">Green Champion Badge</div>
                <div className="onboarding-badge-text">
                  Awarded to employees upon earning their first 100 XP from CSR volunteer campaigns.
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Button variant="indigo" onClick={handleTriggerBadgeUnlock}>
                  Simulate Badge Unlock Dialog
                </Button>
              </div>
            </div>
          )}

          {/* EMPLOYEE FLOW - STEP 5: Reward Redeem */}
          {!isOrg && currentStep === 5 && (
            <div>
              <form onSubmit={handleRedeemReward} className="onboarding-form">
                <Input
                  label="Employee Profile"
                  value={`${user?.fullName || 'Alice Green'} (${employees.find(e => e.name === (user?.fullName || 'Alice Green'))?.xp || 150} XP available)`}
                  disabled
                />
                <Select
                  label="Choose Eco-Friendly Reward"
                  options={[
                    { value: 'Eco Thermos', label: 'Stainless Steel Eco Thermos (100 XP)' },
                    { value: 'Bamboo Utensils Set', label: 'Reusable Bamboo Utensils Set (150 XP)' },
                  ]}
                  value={selectedReward}
                  onChange={setSelectedReward}
                />
                <Button type="submit" variant="indigo">
                  Redeem Points
                </Button>
              </form>

              <div className="onboarding-table-card">
                <div className="onboarding-table-title">Redemption Logs</div>
                <Table columns={rewardColumns} data={redeemedRewards} rowKey="id" />
              </div>
            </div>
          )}

          {/* EMPLOYEE FLOW - STEP 6: Dashboard Updates */}
          {!isOrg && currentStep === 6 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: 'var(--color-success-soft)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 'bold' }}>Environmental Health</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0' }}>85 / 100</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-soft)' }}>+5% from last period</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--color-secondary-soft)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-secondary-dark)', fontWeight: 'bold' }}>Social Impact</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0' }}>92 / 100</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-soft)' }}>100% engagement in CSR</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--color-warning-soft)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-warning)', fontWeight: 'bold' }}>Governance Rating</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '4px 0' }}>88 / 100</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-soft)' }}>All policies acknowledged</div>
                </div>
              </div>

              <div style={{ padding: '24px', background: 'var(--color-surface-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-dim)' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px' }}>Carbon Emissions Goal Progress</div>
                <div style={{ height: '8px', background: 'var(--color-surface-dim)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '45%', height: '100%', background: 'var(--color-indigo)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px', color: 'var(--color-text-soft)' }}>
                  <span>Current: 45% reduction</span>
                  <span>Target: 100% (2030)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Controls */}
        <div className="onboarding-footer">
          <div style={{ fontSize: '13px', color: 'var(--color-text-soft)' }}>
            Stage {currentStep} of {steps.length}
          </div>
          <div className="onboarding-actions">
            {currentStep > 1 && (
              <Button variant="secondary" onClick={prevStep}>
                Previous Step
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button variant="indigo" onClick={nextStep}>
                Skip Step
              </Button>
            ) : (
              <Button variant="success" onClick={() => setShowSuccessPopup(true)}>
                Finish Onboarding
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Popups / Modals */}
      <Popup
        open={showBadgePopup}
        variant="info"
        icon="trophy"
        title="Badge Unlocked!"
        message={`Congratulations! ${user?.fullName || 'Alice Green'} has earned the 'Green Champion' badge for completing the CSR activity!`}
        confirmLabel="Continue Onboarding"
        onConfirm={handleCloseBadgePopup}
        onCancel={handleCloseBadgePopup}
      />

      <Popup
        open={showSuccessPopup}
        variant="success"
        icon="check"
        title="Onboarding Completed Successfully!"
        message="You have successfully walked through all setup stages. You will now be redirected to the EcoSphere portal."
        confirmLabel="Enter Dashboard"
        onConfirm={() => {
          setShowSuccessPopup(false);
          onComplete?.();
        }}
        onCancel={() => setShowSuccessPopup(false)}
      />
    </div>
  );
}

export default Onboarding;
