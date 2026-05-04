import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import MembersPage from './pages/MembersPage';
import ProductPage from './pages/ProductPage';
import CardVerifyPage from './pages/CardVerifyPage';
import DailyTransactionPage from './pages/DailyTransactionPage';
import MonthlyPaymentPage from './pages/MonthlyPaymentPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
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
