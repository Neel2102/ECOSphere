import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import MainLayout from '../components/layout/MainLayout';

// Auth
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import EmailVerification from '../pages/auth/EmailVerification';
import ForgotPassword from '../pages/auth/ForgotPassword';
import OtpVerification from '../pages/auth/OtpVerification';
import ResetPassword from '../pages/auth/ResetPassword';

// Dashboard
import DashboardHome from '../pages/dashboard/DashboardHome';
import Profile from '../pages/dashboard/Profile';
import Inventory from '../pages/dashboard/Inventory';
import Invoicing from '../pages/dashboard/Invoicing';
import Customers from '../pages/dashboard/Customers';
import SalesOrders from '../pages/dashboard/SalesOrders';

// Environmental
import Environmental from '../pages/environmental/Environmental';
import EmissionFactors from '../pages/environmental/EmissionFactors';
import ProductEsgProfiles from '../pages/environmental/ProductEsgProfiles';
import CarbonTransactions from '../pages/environmental/CarbonTransactions';
import EnvironmentalGoals from '../pages/environmental/EnvironmentalGoals';
import EnvironmentalDashboard from '../pages/environmental/EnvironmentalDashboard';

// Social
import Social from '../pages/social/Social';
import CsrActivities from '../pages/social/CsrActivities';
import EmployeeParticipation from '../pages/social/EmployeeParticipation';
import DiversityDashboard from '../pages/social/DiversityDashboard';
import TrainingCompletion from '../pages/social/TrainingCompletion';


// Governance
import Governance from '../pages/governance/Governance';
import Policies from '../pages/governance/Policies';
import PolicyAcknowledgements from '../pages/governance/PolicyAcknowledgements';
import Audits from '../pages/governance/Audits';
import ComplianceIssues from '../pages/governance/ComplianceIssues';

// Gamification
import Gamification from '../pages/gamification/Gamification';
import Challenges from '../pages/gamification/Challenges';
import ChallengeParticipation from '../pages/gamification/ChallengeParticipation';
import Badges from '../pages/gamification/Badges';
import Rewards from '../pages/gamification/Rewards';
import Leaderboard from '../pages/gamification/Leaderboard';

// Reports & Settings
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected ESG routes under shared layout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="invoicing" element={<Invoicing />} />
        <Route path="customers" element={<Customers />} />
        <Route path="sales" element={<SalesOrders />} />

        {/* Environmental */}
        <Route path="environmental" element={<Environmental />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EnvironmentalDashboard />} />
          <Route path="emission-factors" element={<EmissionFactors />} />
          <Route path="product-profiles" element={<ProductEsgProfiles />} />
          <Route path="carbon-transactions" element={<CarbonTransactions />} />
          <Route path="goals" element={<EnvironmentalGoals />} />
        </Route>

        {/* Social */}
        <Route path="social" element={<Social />}>
          <Route index element={<Navigate to="activities" replace />} />
          <Route path="activities" element={<CsrActivities />} />
          <Route path="participation" element={<EmployeeParticipation />} />
          <Route path="diversity" element={<DiversityDashboard />} />
          <Route path="training" element={<TrainingCompletion />} />
        </Route>

        {/* Governance */}
        <Route path="governance" element={<Governance />}>
          <Route index element={<Navigate to="policies" replace />} />
          <Route path="policies" element={<Policies />} />
          <Route path="acknowledgements" element={<PolicyAcknowledgements />} />
          <Route path="audits" element={<Audits />} />
          <Route path="issues" element={<ComplianceIssues />} />
        </Route>

        {/* Gamification */}
        <Route path="gamification" element={<Gamification />}>
          <Route index element={<Navigate to="challenges" replace />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="participation" element={<ChallengeParticipation />} />
          <Route path="badges" element={<Badges />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>

        {/* Reports */}
        <Route
          path="reports"
          element={
            <RoleBasedRoute roles={['admin', 'manager']}>
              <Reports />
            </RoleBasedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="settings"
          element={
            <RoleBasedRoute roles={['admin', 'manager']}>
              <Settings />
            </RoleBasedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
