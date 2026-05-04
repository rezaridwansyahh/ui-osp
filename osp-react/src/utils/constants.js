// Mapping status ke style Tailwind buat badge
export const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  EXPIRED: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  FREEZE: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  DEFAULTED: 'bg-red-50 text-red-700 ring-red-600/20',
  SUCCESS: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  PENDING: 'bg-amber-50 text-amber-600 ring-amber-100',
  VOID: 'bg-red-50 text-red-500 ring-red-100',
};

// Mapping status ke warna dot
export const STATUS_DOT_COLORS = {
  ACTIVE: 'bg-emerald-500',
  EXPIRED: 'bg-orange-500',
  FREEZE: 'bg-sky-500',
  DEFAULTED: 'bg-red-500',
};

// Konfigurasi navigasi sidebar
export const SIDEBAR_NAV = [
  {
    label: 'Home',
    icon: 'Home',
    path: '/',
  },
  {
    label: 'Manage Merchant',
    icon: 'Store',
    children: [
      { label: 'Card Verify Submission', path: '/card-verify' },
      { label: 'Members', path: '/members' },
      { label: 'Monthly Payment', path: '/monthly-payment' },
    ],
  },
  {
    label: 'Package & Product',
    icon: 'Package',
    children: [
      { label: 'Product', path: '/product' },
    ],
  },
  {
    label: 'Report',
    icon: 'BarChart3',
    children: [
      { label: 'Daily Transaction', path: '/daily-transaction' },
    ],
  },
];

// Konfigurasi breadcrumb per halaman
export const BREADCRUMBS = {
  '/': [{ label: 'Home' }],
  '/members': [
    { label: 'Home', path: '/' },
    { label: 'Members' },
  ],
  '/card-verify': [
    { label: 'Home', path: '/' },
    { label: 'Card Verify Submission' },
  ],
  '/monthly-payment': [
    { label: 'Home', path: '/' },
    { label: 'Monthly Payment' },
  ],
  '/product': [
    { label: 'Home', path: '/' },
    { label: 'Package & Product' },
    { label: 'Product' },
  ],
  '/daily-transaction': [
    { label: 'Home', path: '/' },
    { label: 'Report' },
    { label: 'Daily Transaction' },
  ],
};
