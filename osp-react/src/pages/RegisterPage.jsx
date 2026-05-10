import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';

export default function RegisterPage() {
  return (
    <AuthLayout>
      {/* Logo mobile */}
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
          <span className="text-white font-bold text-lg">O</span>
        </div>
        <span className="text-gray-900 font-bold text-xl tracking-tight">OSP</span>
      </div>

      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-5 bg-violet-50 rounded-2xl flex items-center justify-center">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Registrasi via Admin</h2>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
          Untuk mendapatkan akun, silakan hubungi administrator sistem.
          Akun akan dibuat dan credential dikirim langsung ke kamu.
        </p>
      </div>

      <Link
        to="/login"
        className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-sm active:scale-[0.98]"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Login
      </Link>
    </AuthLayout>
  );
}
