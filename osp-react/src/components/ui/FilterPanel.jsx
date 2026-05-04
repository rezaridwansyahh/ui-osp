import Button from './Button';

export default function FilterPanel({ isOpen, children, onApply, onReset }) {
  return (
    <div className={`filter-container ${isOpen ? 'open' : ''}`}>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {children}
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={onReset}>
            Reset
          </Button>
          <Button variant="primary" size="sm" onClick={onApply}>
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  );
}

// Reusable filter field wrapper
export function FilterField({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
