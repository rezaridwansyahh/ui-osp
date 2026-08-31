// Warna avatar gradient berdasarkan nama
const AVATAR_COLORS = [
  'from-violet-500 to-violet-700',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-violet-400 to-violet-600',
  'from-pink-500 to-rose-500',
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

// Format angka ke format currency Indonesia — satu-satunya format Rupiah
// yang dipakai di seluruh app, biar konsisten (dulu ada 4 gaya beda-beda:
// "IDR 1.234", "Rp 1.234", "Rp. 1.234", angka polos tanpa prefix).
export function formatCurrency(amount) {
  return 'Rp ' + (Number(amount) || 0).toLocaleString('id-ID');
}

// Rupiah tapi '-' kalau nilainya null/undefined (bukan 0). Dipakai di tabel
// report & pending membership, biar sel kosong gak kebaca "beneran Rp 0".
export function formatIDR(n) {
  return n == null ? '-' : formatCurrency(n);
}

// Tanggal hari ini dalam format yyyy-MM-dd (buat default filter date).
export function today() {
  return new Date().toISOString().slice(0, 10);
}
