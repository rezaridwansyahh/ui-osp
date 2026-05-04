import { X } from 'lucide-react';

export default function SlidePanel({ isOpen, onClose, title, children }) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`slide-overlay fixed inset-0 bg-black/40 z-[998] ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`slide-panel fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[999] shadow-2xl flex flex-col ${isOpen ? 'open' : ''}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
