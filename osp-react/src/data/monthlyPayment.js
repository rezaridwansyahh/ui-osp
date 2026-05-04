export const MEMBERS_PAYMENT = [
  { id: 'M001', name: 'Andi Saputra', type: 'EFT', status: 'ACTIVE', keyfob: 'KF-001', email: 'andi@email.com', signup: '2022-01-07', monthlyAmount: 475000, lastPayment: 'Apr 2026' },
  { id: 'M002', name: 'Budi Santoso', type: 'EFT', status: 'ACTIVE', keyfob: 'KF-002', email: 'budi@email.com', signup: '2022-06-15', monthlyAmount: 475000, lastPayment: 'Mar 2026' },
  { id: 'M003', name: 'Citra Dewi', type: 'PIF', status: 'FREEZE', keyfob: 'KF-003', email: 'citra@email.com', signup: '2023-03-01', monthlyAmount: 350000, lastPayment: 'Jan 2026' },
  { id: 'M004', name: 'Dian Rahayu', type: 'EFT', status: 'ACTIVE', keyfob: 'KF-004', email: 'dian@email.com', signup: '2023-08-20', monthlyAmount: 475000, lastPayment: 'Apr 2026' },
  { id: 'M005', name: 'Eko Prasetyo', type: 'PIF', status: 'EXPIRED', keyfob: 'KF-005', email: 'eko@email.com', signup: '2022-04-10', monthlyAmount: 200000, lastPayment: 'Dec 2025' },
  { id: 'M006', name: 'Fajar Nugroho', type: 'EFT', status: 'ACTIVE', keyfob: 'KF-006', email: 'fajar@email.com', signup: '2024-01-05', monthlyAmount: 475000, lastPayment: 'Apr 2026' },
];

export const PAYMENT_GYMS = ['AF Kemang', 'AF Senayan', 'AF Menteng', 'AF Kelapa Gading'];

export const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'];

// Generate daftar bulan dari tanggal signup sampai sekarang
export function generateMonths(signupDate) {
  const months = [];
  const start = new Date(signupDate);
  const now = new Date();
  const d = new Date(start.getFullYear(), start.getMonth(), 1);
  while (d <= now) {
    months.push({
      key: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    });
    d.setMonth(d.getMonth() + 1);
  }
  return months;
}
