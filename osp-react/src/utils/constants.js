import {
  Home,
  Store,
  Package,
  BarChart3,
  FileText,
  IdCard,
  Users,
  Wallet,
  Receipt,
  FileBarChart,
  UserPlus,
} from 'lucide-react';

// Satu sumber mapping icon buat SIDEBAR_NAV — dipakai Sidebar.jsx, TopNav.jsx,
// BottomDock.jsx, dan tile launcher di HomePage, biar gak didefinisiin ulang
// di tiap tempat.
export const NAV_ICON_MAP = {
  Home,
  Store,
  Package,
  BarChart3,
  FileText,
  IdCard,
  Users,
  Wallet,
  Receipt,
  FileBarChart,
  UserPlus,
};

export const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  EXPIRED: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  FREEZE: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  DEFAULTED: 'bg-red-50 text-red-700 ring-red-600/20',
  SUCCESS: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  PENDING: 'bg-amber-50 text-amber-600 ring-amber-100',
  VOID: 'bg-red-50 text-red-500 ring-red-100',
  // Casing asli dari GET /api/report-recurring (recurringStatus) — beda dari
  // SUCCESS di atas yang dipakai status transaksi POS.
  Success: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  Failed: 'bg-red-50 text-red-500 ring-red-100',
};

export const STATUS_DOT_COLORS = {
  ACTIVE: 'bg-emerald-500',
  EXPIRED: 'bg-orange-500',
  FREEZE: 'bg-sky-500',
  DEFAULTED: 'bg-red-500',
};

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
      { label: 'Card Verify Submission', path: '/card-verify', icon: 'IdCard' },
      { label: 'Members', path: '/members', icon: 'Users' },
      { label: 'Monthly Payment', path: '/monthly-payment', icon: 'Wallet' },
    ],
  },
  {
    label: 'Package & Product',
    icon: 'Package',
    children: [
      { label: 'Product', path: '/product', icon: 'Package' },
    ],
  },
  {
    label: 'Point of Sales',
    icon: 'BarChart3',
    children: [
      { label: 'Daily Sales Report', path: '/daily-transaction', icon: 'Receipt' },
      { label: 'OSP Report', path: '/osp-report', icon: 'FileBarChart' },
      { label: 'Pending Membership', path: '/pending-membership', icon: 'UserPlus' },
    ],
  },
];

export const BREADCRUMBS = {
  '/': [{ label: 'Home' }],
  '/members': [{ label: 'Home', path: '/' }, { label: 'Members' }],
  '/card-verify': [{ label: 'Home', path: '/' }, { label: 'Card Verify Submission' }],
  '/monthly-payment': [{ label: 'Home', path: '/' }, { label: 'Monthly Payment' }],
  '/product': [{ label: 'Home', path: '/' }, { label: 'Package & Product' }, { label: 'Product' }],
  '/daily-transaction': [{ label: 'Home', path: '/' }, { label: 'Point of Sales' }, { label: 'Daily Sales Report' }],
  '/osp-report': [{ label: 'Home', path: '/' }, { label: 'Point of Sales' }, { label: 'OSP Report' }],
  '/pending-membership': [{ label: 'Home', path: '/' }, { label: 'Point of Sales' }, { label: 'Pending Membership' }],
};
