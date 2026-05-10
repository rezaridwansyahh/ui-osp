import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MembersPage from './pages/MembersPage';
import ProductPage from './pages/ProductPage';
import CardVerifyPage from './pages/CardVerifyPage';
import DailyTransactionPage from './pages/DailyTransactionPage';
import MonthlyPaymentPage from './pages/MonthlyPaymentPage';

export default function App() {
  return (
    <Routes>
      {/* Halaman publik: login & register */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Semua halaman di bawah ini butuh autentikasi */}
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
        <Route path="/daily-transaction" element={<DailyTransactionPage />} />
        <Route path="/monthly-payment" element={<MonthlyPaymentPage />} />
      </Route>
    </Routes>
  );
}
