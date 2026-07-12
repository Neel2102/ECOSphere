# Yagna - branch `gamification-reports`

Gamification (challenges, participation, badges, rewards, redemption, leaderboard), ESG score engine, executive dashboard, and all reports incl. custom report builder.

Work ONLY in the files below (each stub's first line also names you as owner).
Push to branch `gamification-reports` - see ../TEAM-WORKFLOW.md for the git commands.

## Backend files (Phase 2)

- `Backend/src/models/challengeModel.js` - Challenge data access (lifecycle statuses)
- `Backend/src/models/challengeParticipationModel.js` - Challenge Participation data access
- `Backend/src/models/badgeModel.js` - Badge master + awarded badges data access
- `Backend/src/models/rewardModel.js` - Reward catalog data access
- `Backend/src/models/rewardRedemptionModel.js` - Reward Redemption data access
- `Backend/src/models/departmentScoreModel.js` - Department Score aggregation data access
- `Backend/src/controllers/challengeController.js` - Challenge CRUD + lifecycle transitions
- `Backend/src/controllers/challengeParticipationController.js` - Join challenge, progress, proof, approval, XP award
- `Backend/src/controllers/badgeController.js` - Badge CRUD + my-badges
- `Backend/src/controllers/rewardController.js` - Reward catalog CRUD
- `Backend/src/controllers/rewardRedemptionController.js` - Redeem reward (stock + points deduction)
- `Backend/src/controllers/leaderboardController.js` - Employee/department XP leaderboards
- `Backend/src/controllers/scoreController.js` - Department + overall ESG score endpoints
- `Backend/src/controllers/dashboardController.js` - Executive dashboard KPIs, trends, recent activity
- `Backend/src/controllers/reportController.js` - Env/Social/Gov/Summary reports + custom builder + export
- `Backend/src/routes/gamificationRoutes.js` - Challenges, participation, badges, rewards, leaderboard
- `Backend/src/routes/dashboardRoutes.js` - Dashboard KPI endpoints
- `Backend/src/routes/reportRoutes.js` - Report + export endpoints
- `Backend/src/validators/gamificationValidators.js` - Gamification module validation
- `Backend/src/utils/scoreCalculator.js` - Department E/S/G scores + weighted overall ESG score
- `Backend/src/utils/badgeEngine.js` - Badge auto-award rule evaluation (XP / challenge count)
- `Backend/src/utils/reportBuilder.js` - Report data assembly + PDF/Excel/CSV export

## Frontend files (Phase 3)

- `Frontend/src/services/gamificationService.js` - Gamification module API calls
- `Frontend/src/services/dashboardService.js` - Dashboard KPI API calls
- `Frontend/src/services/reportService.js` - Report + export API calls
- `Frontend/src/components/common/Tabs/Tabs.jsx` - Module sub-tab bar (wireframe tab rows)
- `Frontend/src/components/common/StatCard/StatCard.jsx` - KPI score tile (dashboard score cards)
- `Frontend/src/components/common/LineChart/LineChart.jsx` - SVG line chart (emissions trend)
- `Frontend/src/components/common/BarChart/BarChart.jsx` - SVG bar chart (department ESG ranking)
- `Frontend/src/pages/dashboard/DashboardHome.jsx` - Executive overview - score tiles, trend, ranking, activity, quick actions
- `Frontend/src/pages/gamification/Gamification.jsx` - Gamification module shell with sub-tabs
- `Frontend/src/pages/gamification/Challenges.jsx` - Challenges tab - lifecycle filters + challenge cards
- `Frontend/src/pages/gamification/ChallengeParticipation.jsx` - Challenge Participation tab - progress + approvals
- `Frontend/src/pages/gamification/Badges.jsx` - Badges tab - badge gallery + unlock rules
- `Frontend/src/pages/gamification/Rewards.jsx` - Rewards tab - catalog + redeem with points
- `Frontend/src/pages/gamification/Leaderboard.jsx` - Leaderboard tab - employee/department XP ranking
- `Frontend/src/pages/reports/Reports.jsx` - Reports module shell with sub-tabs
- `Frontend/src/pages/reports/EnvironmentalReport.jsx` - Environmental report with filters + export
- `Frontend/src/pages/reports/SocialReport.jsx` - Social report with filters + export
- `Frontend/src/pages/reports/GovernanceReport.jsx` - Governance report with filters + export
- `Frontend/src/pages/reports/EsgSummaryReport.jsx` - ESG summary report with filters + export
- `Frontend/src/pages/reports/CustomReportBuilder.jsx` - Custom report builder - combine filters, export PDF/Excel/CSV
- `Frontend/src/styles/common/tabs.css` - Tabs component styles
- `Frontend/src/styles/common/stat-card.css` - StatCard component styles
- `Frontend/src/styles/common/line-chart.css` - LineChart component styles
- `Frontend/src/styles/common/bar-chart.css` - BarChart component styles
- `Frontend/src/styles/gamification/gamification.css` - Gamification shell styles
- `Frontend/src/styles/gamification/challenges.css` - Challenges page styles
- `Frontend/src/styles/gamification/challenge-participation.css` - Challenge Participation page styles
- `Frontend/src/styles/gamification/badges.css` - Badges page styles
- `Frontend/src/styles/gamification/rewards.css` - Rewards page styles
- `Frontend/src/styles/gamification/leaderboard.css` - Leaderboard page styles
- `Frontend/src/styles/reports/reports.css` - Reports shell styles
- `Frontend/src/styles/reports/environmental-report.css` - Environmental report styles
- `Frontend/src/styles/reports/social-report.css` - Social report styles
- `Frontend/src/styles/reports/governance-report.css` - Governance report styles
- `Frontend/src/styles/reports/esg-summary-report.css` - ESG summary report styles
- `Frontend/src/styles/reports/custom-report-builder.css` - Custom report builder styles

## Your git commands

```bash
git checkout gamification-reports
git pull origin main
# edit your files, then:
git add .
git commit -m "feat(gamification-reports): describe your change"
git push origin gamification-reports
```
