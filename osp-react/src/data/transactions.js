export const TRANSACTIONS = [
  { id: 'T001', date: '2024-07-01', invoice: 'INV-20240701-001', member: 'Andi Saputra', total: 350000, status: 'SUCCESS', channel: 'CREDIT', updatedBy: 'system', gym: 'AF Kemang' },
  { id: 'T002', date: '2024-07-01', invoice: 'INV-20240701-002', member: 'Budi Santoso', total: 350000, status: 'SUCCESS', channel: 'DEBIT', updatedBy: 'system', gym: 'AF Kemang' },
  { id: 'T003', date: '2024-07-02', invoice: 'INV-20240702-001', member: 'Citra Dewi', total: 3500000, status: 'PENDING', channel: 'BANK_TRANSFER', updatedBy: 'admin', gym: 'AF Senayan' },
  { id: 'T004', date: '2024-07-02', invoice: 'INV-20240702-002', member: 'Dian Rahayu', total: 350000, status: 'SUCCESS', channel: 'CASH', updatedBy: 'system', gym: 'AF Kemang' },
  { id: 'T005', date: '2024-07-03', invoice: 'INV-20240703-001', member: 'Eko Prasetyo', total: 500000, status: 'VOID', channel: 'CREDIT', updatedBy: 'admin', gym: 'AF Menteng' },
  { id: 'T006', date: '2024-07-03', invoice: 'INV-20240703-002', member: 'Fajar Nugroho', total: 350000, status: 'SUCCESS', channel: 'OVO', updatedBy: 'system', gym: 'AF Kemang' },
  { id: 'T007', date: '2024-07-04', invoice: 'INV-20240704-001', member: 'Gita Lestari', total: 1500000, status: 'SUCCESS', channel: 'VIRTUAL_ACCOUNT', updatedBy: 'system', gym: 'AF Senayan' },
  { id: 'T008', date: '2024-07-04', invoice: 'INV-20240704-002', member: 'Hendra Wijaya', total: 350000, status: 'PENDING', channel: 'BANK_TRANSFER_OSP', updatedBy: 'admin', gym: 'AF Kemang' },
  { id: 'T009', date: '2024-07-05', invoice: 'INV-20240705-001', member: 'Indah Pertiwi', total: 50000, status: 'SUCCESS', channel: 'CASH', updatedBy: 'system', gym: 'AF Kemang' },
  { id: 'T010', date: '2024-07-05', invoice: 'INV-20240705-002', member: 'Joko Susanto', total: 100000, status: 'VOID', channel: 'DEBIT', updatedBy: 'admin', gym: 'AF Menteng' },
];

export const TRANSACTION_CHANNELS = ['CREDIT', 'DEBIT', 'CASH', 'OVO', 'BANK_TRANSFER'];
export const TRANSACTION_STATUSES = ['SUCCESS', 'PENDING', 'VOID'];
export const GYMS = ['AF Kemang', 'AF Senayan', 'AF Menteng'];
