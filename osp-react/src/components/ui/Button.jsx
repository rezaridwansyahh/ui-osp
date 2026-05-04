const VARIANTS = {
  primary: 'text-white bg-violet-600 hover:bg-violet-700 shadow-sm',
  success: 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm',
  danger: 'text-white bg-red-500 hover:bg-red-600 shadow-sm',
  secondary: 'text-gray-600 bg-gray-100 hover:bg-gray-200',
  outline: 'text-gray-600 border border-gray-200 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center gap-2 font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
