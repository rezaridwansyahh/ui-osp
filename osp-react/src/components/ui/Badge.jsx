import { STATUS_STYLES } from '../../utils/constants';

export default function Badge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-500';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full ring-1 ring-inset ${style} ${className}`}
    >
      {status}
    </span>
  );
}
