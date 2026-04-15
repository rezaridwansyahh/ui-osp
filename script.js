/* ============================================================
   OSP UI - Shared JavaScript Utilities
   ============================================================ */

// ── Sidebar accordion ──────────────────────────────────────
function initSidebar() {
  document.querySelectorAll('.nav-item[data-toggle]').forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.toggle;
      const sub = document.getElementById(targetId);
      const isOpen = sub.classList.contains('open');
      // Close all
      document.querySelectorAll('.nav-sub').forEach(s => s.classList.remove('open'));
      document.querySelectorAll('.nav-item[data-toggle]').forEach(i => i.classList.remove('open'));
      // Toggle clicked
      if (!isOpen) {
        sub.classList.add('open');
        item.classList.add('open');
      }
    });
  });

  // Auto-open parent of active sub-item
  document.querySelectorAll('.nav-sub-item.active').forEach(item => {
    const sub = item.closest('.nav-sub');
    if (sub) {
      sub.classList.add('open');
      const parentToggle = document.querySelector(`[data-toggle="${sub.id}"]`);
      if (parentToggle) parentToggle.classList.add('open');
    }
  });
}

// ── Toast notification ─────────────────────────────────────
function showToast(msg, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── Modal helpers ───────────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('hidden'); document.body.style.overflow = ''; }
}
// Close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
    document.body.style.overflow = '';
  }
});

// ── Filter panel toggle ─────────────────────────────────────
function toggleFilter(id) {
  const panel = document.getElementById(id);
  if (panel) panel.classList.toggle('open');
}

// ── Generic table search ────────────────────────────────────
function tableSearch(inputId, tableId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    let count = 0;
    rows.forEach(row => {
      const match = row.textContent.toLowerCase().includes(q);
      row.style.display = match ? '' : 'none';
      if (match) count++;
    });
    const footer = document.getElementById(tableId + '-count');
    if (footer) footer.textContent = count;
  });
}

// ── Sort table column ───────────────────────────────────────
function sortTable(tableId, colIndex, btn) {
  const table = document.getElementById(tableId);
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const asc = btn.dataset.asc !== 'true';
  btn.dataset.asc = asc;
  btn.textContent = asc ? '▲' : '▼';
  rows.sort((a, b) => {
    const aVal = a.cells[colIndex]?.textContent.trim() || '';
    const bVal = b.cells[colIndex]?.textContent.trim() || '';
    return asc ? aVal.localeCompare(bVal, undefined, {numeric:true}) : bVal.localeCompare(aVal, undefined, {numeric:true});
  });
  rows.forEach(r => tbody.appendChild(r));
}

// ── CSV export (download) ───────────────────────────────────
function exportCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = Array.from(table.querySelectorAll('tr'));
  const csv = rows.map(row =>
    Array.from(row.querySelectorAll('th,td'))
      .map(cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`)
      .join(',')
  ).join('\n');
  const blob = new Blob([csv], {type: 'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename || 'export.csv';
  a.click();
  showToast('Downloaded ' + (filename || 'export.csv'), 'success');
}

// ── On DOM ready ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
});