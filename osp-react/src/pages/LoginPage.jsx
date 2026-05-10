import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect ke halaman sebelumnya kalau ada, atau ke home
  const redirectTo = location.state?.from?.pathname || '/';

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim() || !form.password.trim()) {
      setError('Semua field wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(form.username, form.password);

      if (!result.success) {
        setError(result.error);
        return;
      }

      navigate(redirectTo, { replace: true });
    } catch {
      setError('Gagal terhubung ke server. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Logo mobile (hidden di desktop karena udah ada di panel kiri) */}
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
          <span className="text-white font-bold text-lg">O</span>
        </div>
        <span className="text-gray-900 font-bold text-xl tracking-tight">OSP</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Masukkan credential kamu untuk mengakses dashboard.
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <InputField
          id="login-username"
          label="Username"
          type="text"
          icon={User}
          placeholder="Masukkan username"
          value={form.username}
          onChange={(v) => updateField('username', v)}
          autoComplete="username"
          autoFocus
        />

        <InputField
          id="login-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon={Lock}
          placeholder="••••••••"
          value={form.password}
          onChange={(v) => updateField('password', v)}
          autoComplete="current-password"
          suffix={
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((p) => !p)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Spinner />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Belum punya akun?{' '}
        <Link
          to="/register"
          className="font-semibold text-violet-600 hover:text-violet-700 transition-colors"
        >
          Daftar sekarang
        </Link>
      </p>
    </AuthLayout>
  );
}

// ──────────────────────────────────────────────
// Sub-components (cuma dipake di file ini)
// ──────────────────────────────────────────────

function InputField({ id, label, icon: Icon, suffix, onChange, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
        <input
          id={id}
          className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-gray-300"
          onChange={(e) => onChange(e.target.value)}
          {...inputProps}
        />
        {suffix && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
    </div>
  );
}

function ErrorAlert({ message }) {
  return (
    <div className="mt-5 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
      {message}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
