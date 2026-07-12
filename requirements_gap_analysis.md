# EcoSphere ESG Management Platform: Requirements & Gap Analysis

This document evaluates the current implementation status of the EcoSphere platform against the specifications defined in the [EcoSphere ESG Management Platform.pdf](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/EcoSphere%20ESG%20Management%20Platform.pdf).

---

## 1. Executive Summary

The codebase has a comprehensive foundation, including a fully set up PostgreSQL database schema, user authentication, profile settings, dynamic department scoring (E/S/G weighting), in-app notifications, and custom report builders. Most of the core modules are implemented, but there are a few gaps in business-rule exposure, reporting UI, specialized dashboarding, and one entirely missing module (Training Completion).

---

## 2. Detailed Status by Module

### 🌿 Environmental Module
* **Requirements:** Carbon accounting, emission factors configuration, calculate carbon emissions, department carbon tracking, sustainability goals, and environmental dashboard.
* **Status:** **Partially Complete**
  * **Configure Emission Factors:** Fully implemented ([EmissionFactors.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/environmental/EmissionFactors.jsx)).
  * **Calculate Carbon Emissions:** Fully implemented in the backend ([emissionCalculator.js](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/backend/src/utils/emissionCalculator.js)). When enabled, CO₂ is automatically resolved from quantity × factor; otherwise, a manual log is accepted.
  * **Sustainability Goals:** Fully implemented ([EnvironmentalGoals.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/environmental/EnvironmentalGoals.jsx)).
  * **Department Carbon Tracking:** Calculated during scores aggregation ([scoreCalculator.js](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/backend/src/utils/scoreCalculator.js)) and logged under carbon transactions.
  * **⚠️ Gaps - Environmental Dashboard:** There is no dedicated **Environmental Dashboard** sub-page inside the Environmental module view. The view simply redirects to emission factors, profiles, transactions, and goals. 

### 👥 Social Module
* **Requirements:** CSR activities, employee participation, diversity metrics, and training completion.
* **Status:** **Partially Complete**
  * **CSR Activities & Employee Participation:** Fully implemented. Employees can join activities, upload evidence, and admins/managers can approve/reject submissions ([CsrActivities.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/social/CsrActivities.jsx), [EmployeeParticipation.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/social/EmployeeParticipation.jsx)).
  * **Diversity Metrics:** Fully implemented ([DiversityDashboard.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/social/DiversityDashboard.jsx)). It visualizes male/female/other/unspecified distribution at both corporate and departmental levels.
  * **🔴 Missing - Training Completion:** Completely missing from both frontend and backend. There is no database table for training records, no backend API endpoint, and no UI components.

### ⚖️ Governance Module
* **Requirements:** Policies, audits, compliance tracking, and governance reports.
* **Status:** **100% Complete**
  * **ESG Policies & Policy Acknowledgements:** Fully implemented ([Policies.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/governance/Policies.jsx), [PolicyAcknowledgements.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/governance/PolicyAcknowledgements.jsx)).
  * **Audits:** Fully implemented ([Audits.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/governance/Audits.jsx)).
  * **Compliance Issues:** Fully implemented ([ComplianceIssues.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/governance/ComplianceIssues.jsx)). Issues require an owner and a due date, and open overdue items are flagged.

### 🎮 Gamification Module
* **Requirements:** Challenges, badges, XP, rewards, and leaderboards.
* **Status:** **100% Complete**
  * **Challenges Lifecycle:** Fully implemented (Draft → Active → Under Review → Completed → Archived) ([Challenges.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/gamification/Challenges.jsx)).
  * **XP & Badges Auto-Award:** Auto-award logic is implemented in the backend ([badgeEngine.js](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/backend/src/utils/badgeEngine.js)) based on XP and challenge milestones.
  * **Rewards Catalog & Redemption:** Fully implemented ([Rewards.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/gamification/Rewards.jsx)) with stock checks and atomic decrement rules in [rewardRedemptionController.js](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/backend/src/controllers/rewardRedemptionController.js).
  * **Leaderboards:** Fully implemented ([Leaderboard.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/gamification/Leaderboard.jsx)).

---

## 3. Summary of Gaps & Missing Things

Here is the checklist of what needs to be added or fixed to achieve full specification compliance:

| Requirement / Component | Current Implementation Status | What is Missing / Gaps |
| :--- | :--- | :--- |
| **Social: Training Completion** | 🔴 Not Implemented | - Database table (e.g., `training_records` or similar)<br>- Backend API routes and controllers<br>- Frontend page/tab in the Social module showing completion statistics |
| **Environmental Dashboard** | ⚠️ Partially Implemented | - There is no specialized environmental overview/summary tab showing carbon emissions by source type, totals, or target progress visualizations within the Environmental module. |
| **Custom Report Builder (Filters)** | ⚠️ Partially Implemented | - The backend supports filtering custom queries by `Employee`, `Challenge`, and `Category`. However, the frontend Custom Report Builder UI ([CustomReportBuilder.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/reports/CustomReportBuilder.jsx)) only allows filtering by `Department`, `Date Range`, and `Module`. Selectors for **Employee**, **Challenge**, and **ESG Category** are missing from the UI. |
| **Settings: Configuration Toggles** | ⚠️ Partially Implemented | - The settings toggles for `Evidence Requirement` (requires evidence proof for CSR approval) and `Badge Auto-Award` are implemented in the database settings and enforced in the backend, but the checkboxes are **missing** from the ESG Configuration Settings UI ([EsgConfiguration.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/settings/EsgConfiguration.jsx)). Only "Auto Emission Calculation" is currently togglable. |
| **Overdue Compliance Auto-Flagging** | ⚠️ Manual Action Only | - While the `flagOverdue` feature is implemented and available via a manual button in the Compliance Issues UI, there is no automatic trigger (such as a daily cron job, backend scheduler, or server startup check) to automatically flag open compliance issues that pass their due dates and trigger the notification system. |

---

## 4. Next Steps & Recommendation

1. **Verify training requirements:** Clarify if a dedicated training tracker is expected, or if it should be modeled simply as a sub-type of policy/CSR. (A dedicated `training_courses` / `training_completions` schema is recommended for robust tracking).
2. **Expose missing UI controls:** Add checkboxes for `evidence_requirement` and `badge_auto_award` to the [EsgConfiguration.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/settings/EsgConfiguration.jsx) page.
3. **Enhance Custom Report Builder UI:** Add dropdown elements in [CustomReportBuilder.jsx](file:///c:/Users/neels/OneDrive/Desktop/ODOO/ECOSphere/frontend/src/pages/reports/CustomReportBuilder.jsx) to select Employees, Challenges, and Categories.
4. **Implement Environmental Dashboard tab:** Build a small dashboard page for the Environmental module to show aggregated operational carbon data (e.g., total emissions, source breakdowns, and target goal milestones).
5. **Set up auto-flagging scheduler:** Add a simple scheduler (e.g. using `node-cron` or checking on database connection startup) to run the `flagOverdue` logic automatically rather than relying purely on user click events.
