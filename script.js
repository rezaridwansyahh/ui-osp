/* ============================================================
   OSP UI - Shared JavaScript Utilities
   ============================================================ */

// ── Sidebar accordion (menu toggle) ──────────────────────────
function initSidebar() {
  document.querySelectorAll('[data-menu-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-menu-toggle');
      const sub = document.getElementById(targetId);
      if (!sub) return;
      const isOpen = sub.classList.contains('open');

      // Tutup semua submenu
      document.querySelectorAll('.menu-sub').forEach(s => s.classList.remove('open'));
      document.querySelectorAll('[data-menu-toggle]').forEach(b => b.classList.remove('open'));

      // Toggle yang diklik
      if (!isOpen) {
        sub.classList.add('open');
        btn.classList.add('open');
      }
    });
  });

  // Auto-open parent dari sub-link yang aktif
  document.querySelectorAll('.menu-sub-link.active').forEach(link => {
    const sub = link.closest('.menu-sub');
    if (sub) {
      sub.classList.add('open');
      const toggle = document.querySelector(`[data-menu-toggle="${sub.id}"]`);
      if (toggle) toggle.classList.add('open');
    }
  });
}

// ── Toggle sidebar mobile ────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !overlay) return;

  const isHidden = sidebar.classList.contains('-translate-x-full');

  if (isHidden) {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
  } else {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  }
}

// Auto-close sidebar saat resize ke desktop
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) {
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.classList.add('hidden');
  } else {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');
  }
});

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
  if (typeof lucide !== 'undefined') lucide.createIcons();
});
