/**
 * Deretan nomor halaman buat pagination bergaya "1 … 4 5 6 … 20".
 * page & totalPages 0-indexed (gaya Spring Pageable). Balikin array berisi
 * angka 0-indexed + string '...' buat gap.
 */
export function getPageWindow(page, totalPages, delta = 2) {
  const range = [];
  const left = Math.max(0, page - delta);
  const right = Math.min(totalPages - 1, page + delta);

  if (left > 0) {
    range.push(0);
    if (left > 1) range.push('...');
  }
  for (let i = left; i <= right; i++) range.push(i);
  if (right < totalPages - 1) {
    if (right < totalPages - 2) range.push('...');
    range.push(totalPages - 1);
  }
  return range;
}
