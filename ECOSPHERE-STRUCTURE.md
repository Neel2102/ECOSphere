# EcoSphere - Project Structure

Complete file skeleton for the EcoSphere ESG Management Platform
(React + Express + PostgreSQL). Created in Phase 1; backend files are
implemented in Phase 2, frontend files in Phase 3.

Every stub file contains a header comment stating its purpose and its
owner (Dhrumil / Neel / Kavya / Yagna). See TEAM-WORKFLOW.md for the
branch plan, file ownership and git commands.

Modules (from the EcoSphere spec):
- Dashboard: executive overview (E/S/G/overall scores, trends, ranking)
- Environmental: emission factors, product ESG profiles, carbon transactions, goals
- Social: CSR activities, employee participation, diversity dashboard
- Governance: policies, acknowledgements, audits, compliance issues
- Gamification: challenges, participation, badges, rewards, leaderboard
- Reports: E/S/G/summary reports + custom report builder (PDF/Excel/CSV)
- Settings: departments, categories, ESG configuration, notification settings

## Full tree (node_modules, .pgdev, .claude excluded)

```
+-- Backend
|   +-- scripts
|   |   +-- seed-admin.js
|   |   \-- seed-demo.js
|   +-- src
|   |   +-- config
|   |   |   +-- db.js
|   |   |   +-- env.js
|   |   |   +-- mailer.js
|   |   |   \-- schema.sql
|   |   +-- controllers
|   |   |   +-- auditController.js
|   |   |   +-- authController.js
|   |   |   +-- badgeController.js
|   |   |   +-- carbonTransactionController.js
|   |   |   +-- categoryController.js
|   |   |   +-- challengeController.js
|   |   |   +-- challengeParticipationController.js
|   |   |   +-- complianceIssueController.js
|   |   |   +-- csrActivityController.js
|   |   |   +-- dashboardController.js
|   |   |   +-- departmentController.js
|   |   |   +-- emissionFactorController.js
|   |   |   +-- employeeParticipationController.js
|   |   |   +-- environmentalGoalController.js
|   |   |   +-- esgPolicyController.js
|   |   |   +-- esgSettingsController.js
|   |   |   +-- leaderboardController.js
|   |   |   +-- notificationController.js
|   |   |   +-- policyAcknowledgementController.js
|   |   |   +-- productEsgProfileController.js
|   |   |   +-- profileController.js
|   |   |   +-- reportController.js
|   |   |   +-- rewardController.js
|   |   |   +-- rewardRedemptionController.js
|   |   |   +-- scoreController.js
|   |   |   \-- userController.js
|   |   +-- middlewares
|   |   |   +-- authMiddleware.js
|   |   |   +-- errorMiddleware.js
|   |   |   +-- evidenceUploadMiddleware.js
|   |   |   +-- roleMiddleware.js
|   |   |   \-- uploadMiddleware.js
|   |   +-- models
|   |   |   +-- auditModel.js
|   |   |   +-- badgeModel.js
|   |   |   +-- carbonTransactionModel.js
|   |   |   +-- categoryModel.js
|   |   |   +-- challengeModel.js
|   |   |   +-- challengeParticipationModel.js
|   |   |   +-- complianceIssueModel.js
|   |   |   +-- csrActivityModel.js
|   |   |   +-- departmentModel.js
|   |   |   +-- departmentScoreModel.js
|   |   |   +-- emissionFactorModel.js
|   |   |   +-- employeeParticipationModel.js
|   |   |   +-- environmentalGoalModel.js
|   |   |   +-- esgPolicyModel.js
|   |   |   +-- esgSettingsModel.js
|   |   |   +-- notificationModel.js
|   |   |   +-- policyAcknowledgementModel.js
|   |   |   +-- productEsgProfileModel.js
|   |   |   +-- rewardModel.js
|   |   |   +-- rewardRedemptionModel.js
|   |   |   \-- userModel.js
|   |   +-- routes
|   |   |   +-- authRoutes.js
|   |   |   +-- dashboardRoutes.js
|   |   |   +-- environmentalRoutes.js
|   |   |   +-- gamificationRoutes.js
|   |   |   +-- governanceRoutes.js
|   |   |   +-- notificationRoutes.js
|   |   |   +-- profileRoutes.js
|   |   |   +-- reportRoutes.js
|   |   |   +-- settingsRoutes.js
|   |   |   +-- socialRoutes.js
|   |   |   \-- userRoutes.js
|   |   +-- uploads
|   |   |   \-- profile-images
|   |   |       +-- .gitkeep
|   |   |       +-- user-2-1783803400360-ae870b8b.png
|   |   |       \-- user-3-1783803280672-a9a4d8a9.jpg
|   |   +-- utils
|   |   |   +-- apiError.js
|   |   |   +-- badgeEngine.js
|   |   |   +-- emailTemplates.js
|   |   |   +-- emissionCalculator.js
|   |   |   +-- notificationService.js
|   |   |   +-- otpGenerator.js
|   |   |   +-- reportBuilder.js
|   |   |   +-- scoreCalculator.js
|   |   |   +-- sendEmail.js
|   |   |   \-- tokenGenerator.js
|   |   +-- validators
|   |   |   +-- authValidators.js
|   |   |   +-- environmentalValidators.js
|   |   |   +-- gamificationValidators.js
|   |   |   +-- governanceValidators.js
|   |   |   +-- profileValidators.js
|   |   |   +-- settingsValidators.js
|   |   |   +-- socialValidators.js
|   |   |   \-- validate.js
|   |   +-- app.js
|   |   \-- server.js
|   +-- .env
|   +-- .env.example
|   +-- .gitignore
|   +-- package.json
|   \-- package-lock.json
+-- Frontend
|   +-- public
|   |   +-- fonts
|   |   |   \-- README.md
|   |   +-- favicon.svg
|   |   \-- icons.svg
|   +-- src
|   |   +-- assets
|   |   |   +-- hero.png
|   |   |   \-- vite.svg
|   |   +-- components
|   |   |   +-- common
|   |   |   |   +-- Badge
|   |   |   |   |   \-- Badge.jsx
|   |   |   |   +-- BarChart
|   |   |   |   |   \-- BarChart.jsx
|   |   |   |   +-- Button
|   |   |   |   |   \-- Button.jsx
|   |   |   |   +-- Card
|   |   |   |   |   \-- Card.jsx
|   |   |   |   +-- EmptyState
|   |   |   |   |   \-- EmptyState.jsx
|   |   |   |   +-- FileUpload
|   |   |   |   |   \-- FileUpload.jsx
|   |   |   |   +-- Icon
|   |   |   |   |   \-- Icon.jsx
|   |   |   |   +-- Input
|   |   |   |   |   \-- Input.jsx
|   |   |   |   +-- LineChart
|   |   |   |   |   \-- LineChart.jsx
|   |   |   |   +-- Modal
|   |   |   |   |   \-- Modal.jsx
|   |   |   |   +-- OtpInput
|   |   |   |   |   \-- OtpInput.jsx
|   |   |   |   +-- Pagination
|   |   |   |   |   \-- Pagination.jsx
|   |   |   |   +-- Popup
|   |   |   |   |   \-- Popup.jsx
|   |   |   |   +-- ProgressBar
|   |   |   |   |   \-- ProgressBar.jsx
|   |   |   |   +-- Select
|   |   |   |   |   \-- Select.jsx
|   |   |   |   +-- SkeletonLoader
|   |   |   |   |   \-- SkeletonLoader.jsx
|   |   |   |   +-- StatCard
|   |   |   |   |   \-- StatCard.jsx
|   |   |   |   +-- Table
|   |   |   |   |   \-- Table.jsx
|   |   |   |   \-- Tabs
|   |   |   |       \-- Tabs.jsx
|   |   |   \-- layout
|   |   |       +-- AuthLayout.jsx
|   |   |       +-- Header.jsx
|   |   |       +-- MainLayout.jsx
|   |   |       +-- NotificationsPanel.jsx
|   |   |       \-- Sidebar.jsx
|   |   +-- context
|   |   |   +-- AuthContext.jsx
|   |   |   \-- NotificationContext.jsx
|   |   +-- pages
|   |   |   +-- auth
|   |   |   |   +-- EmailVerification.jsx
|   |   |   |   +-- ForgotPassword.jsx
|   |   |   |   +-- Login.jsx
|   |   |   |   +-- OtpVerification.jsx
|   |   |   |   +-- ResetPassword.jsx
|   |   |   |   \-- Signup.jsx
|   |   |   +-- dashboard
|   |   |   |   +-- Customers.jsx
|   |   |   |   +-- DashboardHome.jsx
|   |   |   |   +-- Inventory.jsx
|   |   |   |   +-- Invoicing.jsx
|   |   |   |   +-- Profile.jsx
|   |   |   |   +-- Reports.jsx
|   |   |   |   \-- SalesOrders.jsx
|   |   |   +-- environmental
|   |   |   |   +-- CarbonTransactions.jsx
|   |   |   |   +-- EmissionFactors.jsx
|   |   |   |   +-- Environmental.jsx
|   |   |   |   +-- EnvironmentalGoals.jsx
|   |   |   |   \-- ProductEsgProfiles.jsx
|   |   |   +-- gamification
|   |   |   |   +-- Badges.jsx
|   |   |   |   +-- ChallengeParticipation.jsx
|   |   |   |   +-- Challenges.jsx
|   |   |   |   +-- Gamification.jsx
|   |   |   |   +-- Leaderboard.jsx
|   |   |   |   \-- Rewards.jsx
|   |   |   +-- governance
|   |   |   |   +-- Audits.jsx
|   |   |   |   +-- ComplianceIssues.jsx
|   |   |   |   +-- Governance.jsx
|   |   |   |   +-- Policies.jsx
|   |   |   |   \-- PolicyAcknowledgements.jsx
|   |   |   +-- reports
|   |   |   |   +-- CustomReportBuilder.jsx
|   |   |   |   +-- EnvironmentalReport.jsx
|   |   |   |   +-- EsgSummaryReport.jsx
|   |   |   |   +-- GovernanceReport.jsx
|   |   |   |   +-- Reports.jsx
|   |   |   |   \-- SocialReport.jsx
|   |   |   +-- settings
|   |   |   |   +-- Categories.jsx
|   |   |   |   +-- Departments.jsx
|   |   |   |   +-- EsgConfiguration.jsx
|   |   |   |   +-- NotificationSettings.jsx
|   |   |   |   \-- Settings.jsx
|   |   |   \-- social
|   |   |       +-- CsrActivities.jsx
|   |   |       +-- DiversityDashboard.jsx
|   |   |       +-- EmployeeParticipation.jsx
|   |   |       \-- Social.jsx
|   |   +-- routes
|   |   |   +-- AppRoutes.jsx
|   |   |   +-- PrivateRoute.jsx
|   |   |   \-- RoleBasedRoute.jsx
|   |   +-- services
|   |   |   +-- api.js
|   |   |   +-- authService.js
|   |   |   +-- dashboardService.js
|   |   |   +-- environmentalService.js
|   |   |   +-- gamificationService.js
|   |   |   +-- governanceService.js
|   |   |   +-- notificationService.js
|   |   |   +-- reportService.js
|   |   |   +-- settingsService.js
|   |   |   +-- socialService.js
|   |   |   \-- userService.js
|   |   +-- styles
|   |   |   +-- auth
|   |   |   |   +-- auth-layout.css
|   |   |   |   +-- email-verification.css
|   |   |   |   +-- forgot-password.css
|   |   |   |   +-- login.css
|   |   |   |   +-- otp-verification.css
|   |   |   |   +-- reset-password.css
|   |   |   |   \-- signup.css
|   |   |   +-- common
|   |   |   |   +-- badge.css
|   |   |   |   +-- bar-chart.css
|   |   |   |   +-- button.css
|   |   |   |   +-- card.css
|   |   |   |   +-- empty-state.css
|   |   |   |   +-- file-upload.css
|   |   |   |   +-- input.css
|   |   |   |   +-- line-chart.css
|   |   |   |   +-- modal.css
|   |   |   |   +-- otp-input.css
|   |   |   |   +-- pagination.css
|   |   |   |   +-- popup.css
|   |   |   |   +-- progress-bar.css
|   |   |   |   +-- select.css
|   |   |   |   +-- skeleton-loader.css
|   |   |   |   +-- stat-card.css
|   |   |   |   +-- table.css
|   |   |   |   \-- tabs.css
|   |   |   +-- dashboard
|   |   |   |   +-- customers.css
|   |   |   |   +-- dashboard-home.css
|   |   |   |   +-- header.css
|   |   |   |   +-- inventory.css
|   |   |   |   +-- invoicing.css
|   |   |   |   +-- main-layout.css
|   |   |   |   +-- notifications-panel.css
|   |   |   |   +-- profile.css
|   |   |   |   +-- reports.css
|   |   |   |   +-- sales-orders.css
|   |   |   |   \-- sidebar.css
|   |   |   +-- environmental
|   |   |   |   +-- carbon-transactions.css
|   |   |   |   +-- emission-factors.css
|   |   |   |   +-- environmental.css
|   |   |   |   +-- environmental-goals.css
|   |   |   |   \-- product-esg-profiles.css
|   |   |   +-- gamification
|   |   |   |   +-- badges.css
|   |   |   |   +-- challenge-participation.css
|   |   |   |   +-- challenges.css
|   |   |   |   +-- gamification.css
|   |   |   |   +-- leaderboard.css
|   |   |   |   \-- rewards.css
|   |   |   +-- governance
|   |   |   |   +-- audits.css
|   |   |   |   +-- compliance-issues.css
|   |   |   |   +-- governance.css
|   |   |   |   +-- policies.css
|   |   |   |   \-- policy-acknowledgements.css
|   |   |   +-- reports
|   |   |   |   +-- custom-report-builder.css
|   |   |   |   +-- environmental-report.css
|   |   |   |   +-- esg-summary-report.css
|   |   |   |   +-- governance-report.css
|   |   |   |   +-- reports.css
|   |   |   |   \-- social-report.css
|   |   |   +-- settings
|   |   |   |   +-- categories.css
|   |   |   |   +-- departments.css
|   |   |   |   +-- esg-configuration.css
|   |   |   |   +-- notification-settings.css
|   |   |   |   \-- settings.css
|   |   |   +-- social
|   |   |   |   +-- csr-activities.css
|   |   |   |   +-- diversity-dashboard.css
|   |   |   |   +-- employee-participation.css
|   |   |   |   \-- social.css
|   |   |   \-- global.css
|   |   +-- App.jsx
|   |   \-- main.jsx
|   +-- .env
|   +-- .env.example
|   +-- .gitignore
|   +-- eslint.config.js
|   +-- index.html
|   +-- package.json
|   +-- package-lock.json
|   +-- README.md
|   \-- vite.config.js
+-- .gitignore
\-- README.md
```

Note: pages/dashboard/SalesOrders.jsx, Inventory.jsx, Invoicing.jsx,
Customers.jsx and Reports.jsx (+ their CSS) are leftovers from the earlier
scaffold and will be removed when the sidebar is rewired to the ESG modules
in Phase 3.
