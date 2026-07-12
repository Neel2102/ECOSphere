# Kavya - branch `social-governance`

Social module (CSR activities, employee participation, diversity dashboard) and Governance module (policies, acknowledgements, audits, compliance issues), plus evidence/proof upload.

Work ONLY in the files below (each stub's first line also names you as owner).
Push to branch `social-governance` - see ../TEAM-WORKFLOW.md for the git commands.

## Backend files (Phase 2)

- `Backend/src/models/csrActivityModel.js` - CSR Activity data access
- `Backend/src/models/employeeParticipationModel.js` - Employee Participation (CSR) data access
- `Backend/src/models/esgPolicyModel.js` - ESG Policy master data access
- `Backend/src/models/policyAcknowledgementModel.js` - Policy Acknowledgement data access
- `Backend/src/models/auditModel.js` - Governance Audit data access
- `Backend/src/models/complianceIssueModel.js` - Compliance Issue data access
- `Backend/src/controllers/csrActivityController.js` - CSR Activity CRUD
- `Backend/src/controllers/employeeParticipationController.js` - Join CSR activity, proof upload, approve/reject
- `Backend/src/controllers/esgPolicyController.js` - ESG Policy CRUD
- `Backend/src/controllers/policyAcknowledgementController.js` - Acknowledge policy + reminders listing
- `Backend/src/controllers/auditController.js` - Audit CRUD
- `Backend/src/controllers/complianceIssueController.js` - Compliance Issue CRUD + overdue flagging
- `Backend/src/routes/socialRoutes.js` - CSR activities, participation, diversity metrics
- `Backend/src/routes/governanceRoutes.js` - Policies, acknowledgements, audits, compliance issues
- `Backend/src/middlewares/evidenceUploadMiddleware.js` - Proof/evidence file upload for CSR + challenges
- `Backend/src/validators/socialValidators.js` - Social module validation
- `Backend/src/validators/governanceValidators.js` - Governance module validation

## Frontend files (Phase 3)

- `Frontend/src/services/socialService.js` - Social module API calls
- `Frontend/src/services/governanceService.js` - Governance module API calls
- `Frontend/src/components/common/FileUpload/FileUpload.jsx` - Proof/evidence file picker with validation
- `Frontend/src/components/common/Pagination/Pagination.jsx` - Table pagination controls
- `Frontend/src/pages/social/Social.jsx` - Social module shell with sub-tabs
- `Frontend/src/pages/social/CsrActivities.jsx` - CSR Activities tab - activity cards + join
- `Frontend/src/pages/social/EmployeeParticipation.jsx` - Employee Participation tab - approval queue
- `Frontend/src/pages/social/DiversityDashboard.jsx` - Diversity Dashboard tab - metrics
- `Frontend/src/pages/governance/Governance.jsx` - Governance module shell with sub-tabs
- `Frontend/src/pages/governance/Policies.jsx` - Policies tab - CRUD table
- `Frontend/src/pages/governance/PolicyAcknowledgements.jsx` - Policy Acknowledgements tab - status per employee
- `Frontend/src/pages/governance/Audits.jsx` - Audits tab - CRUD table + findings
- `Frontend/src/pages/governance/ComplianceIssues.jsx` - Compliance Issues tab - severity/owner/due date/status
- `Frontend/src/styles/common/file-upload.css` - FileUpload component styles
- `Frontend/src/styles/common/pagination.css` - Pagination component styles
- `Frontend/src/styles/social/social.css` - Social shell styles
- `Frontend/src/styles/social/csr-activities.css` - CSR Activities page styles
- `Frontend/src/styles/social/employee-participation.css` - Employee Participation page styles
- `Frontend/src/styles/social/diversity-dashboard.css` - Diversity Dashboard page styles
- `Frontend/src/styles/governance/governance.css` - Governance shell styles
- `Frontend/src/styles/governance/policies.css` - Policies page styles
- `Frontend/src/styles/governance/policy-acknowledgements.css` - Policy Acknowledgements page styles
- `Frontend/src/styles/governance/audits.css` - Audits page styles
- `Frontend/src/styles/governance/compliance-issues.css` - Compliance Issues page styles

## Your git commands

```bash
git checkout social-governance
git pull origin main
# edit your files, then:
git add .
git commit -m "feat(social-governance): describe your change"
git push origin social-governance
```
