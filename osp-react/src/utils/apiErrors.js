/**
 * true kalau error axios menandakan endpoint-nya belum ada di server ini
 * (404 route gak ketemu, atau 405 method gak diterima — biasanya karena
 * cuma route GET dengan path serupa yang ke-match). Dipakai buat nampilin
 * pesan "fitur belum aktif" alih-alih error mentah, buat endpoint yang
 * sudah didokumentasikan tapi belum ke-deploy ke dev.osp.id.
 */
export function isEndpointMissing(err) {
  const status = err?.response?.status;
  return status === 404 || status === 405;
}
