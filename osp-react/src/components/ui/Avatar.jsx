import { getAvatarColor, getInitials } from '../../utils/helpers';

const SIZES = {
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export default function Avatar({ name, size = 'md', className = '' }) {
  const gradient = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center flex-shrink-0 ${SIZES[size]} ${className}`}
    >
      <span className="font-bold text-white">{initials}</span>
    </div>
  );
}
