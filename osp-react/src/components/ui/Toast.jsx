const TOAST_STYLES = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-slate-800',
};

export default function Toast({ message, type = 'success' }) {
  if (!message) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-lg text-white text-sm font-medium shadow-lg animate-[fadeIn_0.2s_ease] ${TOAST_STYLES[type] || TOAST_STYLES.info}`}
    >
      {message}
    </div>
  );
}
