import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import MainLayout from '../components/layout/MainLayout';

import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import EmailVerification from '../pages/auth/EmailVerification';
import ForgotPassword from '../pages/auth/ForgotPassword';
import OtpVerification from '../pages/auth/OtpVerification';
import ResetPassword from '../pages/auth/ResetPassword';

import DashboardHome from '../pages/dashboard/DashboardHome';
import SalesOrders from '../pages/dashboard/SalesOrders';
import Inventory from '../pages/dashboard/Inventory';
import Invoicing from '../pages/dashboard/Invoicing';
import Customers from '../pages/dashboard/Customers';
import Reports from '../pages/dashboard/Reports';
import Profile from '../pages/dashboard/Profile';

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Dashboard (nested under the shared layout) */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="sales-orders" element={<SalesOrders />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="invoicing" element={<Invoicing />} />
        <Route path="customers" element={<Customers />} />
        <Route
          path="reports"
          element={
            <RoleBasedRoute roles={['admin', 'manager']}>
              <Reports />
            </RoleBasedRoute>
          }
        />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
