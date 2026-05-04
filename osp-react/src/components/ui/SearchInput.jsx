import { Search } from 'lucide-react';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  readOnly = false,
  onClick,
}) {
  return (
    <div className={`relative ${className}`} onClick={onClick}>
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all ${readOnly ? 'cursor-pointer hover:border-violet-300' : ''}`}
      />
    </div>
  );
}
