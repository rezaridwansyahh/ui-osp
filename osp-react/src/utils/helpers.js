// Warna avatar gradient berdasarkan nama
const AVATAR_COLORS = [
  'from-violet-500 to-violet-700',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-purple-500 to-indigo-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-amber-500 to-orange-500',
  'from-lime-500 to-green-500',
];

// Hash nama buat dapetin warna avatar yang konsisten
export function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Ambil inisial dari nama (maks 2 huruf)
export function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

// Format bytes ke format yang readable
export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// Format angka ke format currency Indonesia
export function formatCurrency(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

// Format angka ke format IDR (lebih simple)
export function formatIDR(amount) {
  return 'IDR ' + amount.toLocaleString();
}

// Export data tabel ke CSV lalu download
export function exportTableToCSV(headers, rows, filename = 'export.csv') {
  const headerLine = headers.map((h) => `"${h}"`).join(',');
  const dataLines = rows.map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  );
  const csv = [headerLine, ...dataLines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
