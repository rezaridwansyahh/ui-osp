import { Link } from 'react-router-dom';

// Layout wrapper buat halaman login & register — split panel: branding kiri + form kanan
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen font-sans">
      {/* Panel kiri: branding + gradient */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <PatternOverlay />
        <GlowEffects />

        <div className="relative z-10 p-10 xl:p-12">
          <Link to="/login" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">OSP</span>
          </Link>
        </div>

        <div className="relative z-10 p-10 xl:p-12 flex-1 flex flex-col justify-center">
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
            Manage your gym
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
              operations seamlessly
            </span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-sm">
            Platform manajemen member, pembayaran, dan operasional gym dalam satu dashboard terpadu.
          </p>

          <div className="mt-8 flex items-center gap-6">
            <StatBubble label="Members" value="5,600+" />
            <div className="w-px h-10 bg-slate-700" />
            <StatBubble label="Transactions" value="12K+" />
            <div className="w-px h-10 bg-slate-700" />
            <StatBubble label="Uptime" value="99.9%" />
          </div>
        </div>

        <div className="relative z-10 p-10 xl:p-12">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} OSP — Online Service Platform
          </p>
        </div>
      </div>

      {/* Panel kanan: form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

function StatBubble({ label, value }) {
  return (
    <div>
      <p className="text-white font-bold text-lg">{value}</p>
      <p className="text-slate-500 text-xs font-medium">{label}</p>
    </div>
  );
}

function PatternOverlay() {
  return (
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "url('data:image/svg+xml,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%23ffffff\" fill-opacity=\"1\"><path d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/></g></g></svg>')",
      }}
    />
  );
}

function GlowEffects() {
  return (
    <>
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-violet-600/20 to-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 rounded-full blur-3xl" />
    </>
  );
}
