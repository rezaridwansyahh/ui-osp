import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RequireOSPAdmin from './components/auth/RequireOSPAdmin';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MembersPage from './pages/MembersPage';
import ProductPage from './pages/ProductPage';
import CardVerifyPage from './pages/CardVerifyPage';
import DailySalesReportPage from './pages/DailySalesReportPage';
import MonthlyPaymentPage from './pages/MonthlyPaymentPage';
import OspReportPage from './pages/OspReportPage';
import PendingMembershipPage from './pages/PendingMembershipPage';
import ThemeAdminPanel from './pages/ThemeAdminPanel';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/card-verify" element={<CardVerifyPage />} />
        <Route path="/daily-transaction" element={<DailySalesReportPage />} />
        <Route path="/monthly-payment" element={<MonthlyPaymentPage />} />
        <Route path="/osp-report" element={<OspReportPage />} />
        <Route path="/pending-membership" element={<PendingMembershipPage />} />
        <Route
          path="/admin/theme"
          element={
            <RequireOSPAdmin>
              <ThemeAdminPanel />
            </RequireOSPAdmin>
          }
        />
      </Route>
    </Routes>
  );
}