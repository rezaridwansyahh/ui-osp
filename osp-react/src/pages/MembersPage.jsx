import { useState, useMemo, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  Download,
  SlidersHorizontal,
  Eye,
  Hash,
  Mail,
  CreditCard,
  Calendar,
  Receipt,
  Users,
  UserCheck,
  UserX,
  Snowflake,
  RefreshCw,
  Pencil,
  Phone,
  Save,
} from 'lucide-react';
import {
  fetchAllCustomersCached,
  mapApiCustomer,
  updateMember,
  clearCustomersCache,
  MEMBER_STATUS_TO_CODE,
} from '../services/memberService';
import { useShowToast } from '../contexts/ToastContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import Pagination from '../components/ui/Pagination';
import StatCard from '../components/ui/StatCard';
import SlidePanel from '../components/ui/SlidePanel';
import FilterPanel, { FilterField } from '../components/ui/FilterPanel';
import { STATUS_DOT_COLORS } from '../utils/constants';
import { getAvatarColor, getInitials } from '../utils/helpers';
import { isEndpointMissing } from '../utils/apiErrors';

const PAGE_SIZE = 8;

const STATUS_OPTIONS = ['ACTIVE', 'DEFAULTED', 'EXPIRED', 'FREEZE'];

const emptyFilterDraft = () => ({
  from: '',
  to: '',
  nameId: '',
  status: '',
});

export default function MembersPage() {
  const showToast = useShowToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [liteMode, setLiteMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  const [filterDraft, setFilterDraft] = useState(emptyFilterDraft);
  const [appliedFilter, setAppliedFilter] = useState(emptyFilterDraft);

  const [sortConfig, setSortConfig] = useState(null);

  const loadMembers = useCallback(async (force = false) => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAllCustomersCached({ force });
      setMembers((Array.isArray(data) ? data : []).map(mapApiCustomer));
    } catch (err) {
      console.error('Gagal fetch customers:', err);
      setLoadError('Gagal memuat member dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch on mount — sinkronisasi state dengan server, bukan derived value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMembers();
  }, [loadMembers]);

  const stats = useMemo(() => {
    // Angka kartu ringkasan selalu dari data penuh members (kayak HTML aslinya)
    const total = members.length;
    const active = members.filter((m) => m.status === 'ACTIVE').length;
    const problem = members.filter(
      (m) => m.status === 'DEFAULTED' || m.status === 'EXPIRED'
    ).length;
    const freeze = members.filter((m) => m.status === 'FREEZE').length;
    return { total, active, problem, freeze };
  }, [members]);

  // Gabungin live search + filter panel yang udah di-apply
  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return members.filter((m) => {
      if (q) {
        const matchSearch =
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.keyfob.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }
      if (appliedFilter.from && m.register < appliedFilter.from) return false;
      if (appliedFilter.to && m.register > appliedFilter.to) return false;
      const nid = appliedFilter.nameId.trim().toLowerCase();
      if (
        nid &&
        !m.name.toLowerCase().includes(nid) &&
        !m.id.toLowerCase().includes(nid)
      ) {
        return false;
      }
      if (appliedFilter.status && m.status !== appliedFilter.status) return false;
      return true;
    });
  }, [members, searchQuery, appliedFilter]);

  const sortedMembers = useMemo(() => {
    // Sort ID / Member kalo user klik ▼ (siklus asc → desc → off)
    const list = [...filteredMembers];
    if (!sortConfig) return list;
    list.sort((a, b) => {
      const av = sortConfig.key === 'id' ? a.id : a.name;
      const bv = sortConfig.key === 'id' ? b.id : b.name;
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortConfig.asc ? cmp : -cmp;
    });
    return list;
  }, [filteredMembers, sortConfig]);

  // Reset ke halaman 1 kalo query search atau filter apply berubah — diadaptasi
  // saat render (bukan effect), sesuai pola resmi React utk "adjusting state
  // when a prop changes": https://react.dev/learn/you-might-not-need-an-effect
  const [prevFilterKey, setPrevFilterKey] = useState({ searchQuery, appliedFilter });
  if (prevFilterKey.searchQuery !== searchQuery || prevFilterKey.appliedFilter !== appliedFilter) {
    setPrevFilterKey({ searchQuery, appliedFilter });
    setCurrentPage(1);
  }

  const totalFiltered = sortedMembers.length;
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE) || 1;
  // Derived, bukan disimpan sebagai state — otomatis gak pernah kebablasan
  // kalo hasil filter susut, tanpa perlu effect terpisah buat clamp.
  const safePage = Math.min(currentPage, totalPages);
  const pageSlice = useMemo(() => {
    // Pagination: potong list yang udah di-sort
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedMembers.slice(start, start + PAGE_SIZE);
  }, [sortedMembers, safePage]);

  const showRangeText =
    totalFiltered > 0
      ? `${(safePage - 1) * PAGE_SIZE + 1}-${Math.min(
          safePage * PAGE_SIZE,
          totalFiltered
        )}`
      : '0';

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, asc: true };
      if (prev.asc) return { key, asc: false };
      return null;
    });
  };

  const handleApplyFilter = () => {
    setAppliedFilter({ ...filterDraft });
    setFilterOpen(false);
  };

  const handleResetFilter = () => {
    const empty = emptyFilterDraft();
    setFilterDraft(empty);
    setAppliedFilter(empty);
  };

  // '-' dari mapApiCustomer artinya "gak ada nilai" — di form edit tampilin kosong.
  const unDash = (v) => (v == null || v === '-' ? '' : String(v));

  const startEdit = () => {
    if (!selectedMember) return;
    setEditForm({
      email: unDash(selectedMember.email),
      keyfob: unDash(selectedMember.keyfob),
      phone: unDash(selectedMember.phone),
      status: selectedMember.status ?? '',
    });
    setEditError(null);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditForm(null);
    setEditError(null);
  };

  const closeMemberPanel = () => {
    setSelectedMember(null);
    cancelEdit();
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedMember || !editForm) return;

    // Kirim HANYA field yang berubah — PUT /customers/{id} cuma update field
    // yang ada di body, sisanya dibiarkan apa adanya di server.
    const patch = {};
    if (editForm.email.trim() !== unDash(selectedMember.email)) {
      patch.email = editForm.email.trim();
    }
    if (editForm.keyfob.trim() !== unDash(selectedMember.keyfob)) {
      patch.keyfob = editForm.keyfob.trim();
    }
    if (editForm.phone.trim() !== unDash(selectedMember.phone)) {
      patch.phoneNumber = editForm.phone.trim();
    }
    if (editForm.status && editForm.status !== (selectedMember.status ?? '')) {
      const code = MEMBER_STATUS_TO_CODE[editForm.status];
      if (code != null) patch.status = code;
    }

    if (Object.keys(patch).length === 0) {
      cancelEdit();
      return;
    }

    setSavingEdit(true);
    setEditError(null);
    try {
      await updateMember(selectedMember.id, patch);

      // Update lokal biar gak perlu re-fetch /customers (bisa >140s).
      const patched = {
        ...selectedMember,
        email: 'email' in patch ? patch.email || '-' : selectedMember.email,
        keyfob: 'keyfob' in patch ? patch.keyfob || '-' : selectedMember.keyfob,
        phone: 'phoneNumber' in patch ? patch.phoneNumber || '-' : selectedMember.phone,
        status: 'status' in patch ? editForm.status : selectedMember.status,
      };
      setMembers((prev) => prev.map((m) => (m.id === patched.id ? patched : m)));
      setSelectedMember(patched);
      clearCustomersCache(); // cache jangan nyajiin data lama pas balik ke halaman
      showToast('Perubahan member tersimpan.', 'success');
      cancelEdit();
    } catch (err) {
      console.error('Gagal update member:', err);
      setEditError(
        isEndpointMissing(err)
          ? 'Endpoint edit member (PUT /customers/{id}) belum aktif di server ini — menunggu deploy dari tim backend.'
          : err.response?.data?.responseMessage || err.message || 'Gagal menyimpan perubahan.'
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleExport = () => {
  const headers = liteMode
    ? ['#', 'ID', 'Member', 'Email', 'KeyFob', 'Register', 'Status']
    : [
        '#',
        'ID',
        'Member',
        'Email',
        'KeyFob',
        'Register',
        'Bill Info',
        'Status',
      ];
  const rows = sortedMembers.map((m, i) => {
    const row = [
      String(i + 1),
      m.id,
      m.name,
      m.email,
      m.keyfob,
      m.register,
    ];
    if (!liteMode) row.push(m.bill);
    row.push(m.status);
    return row;
  });

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
  XLSX.writeFile(workbook, 'members_export.xlsx');

  showToast?.('Downloaded members_export.xlsx', 'success');
};

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none bg-white';

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Ringkasan statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Members"
          value={stats.total}
          icon={Users}
          color="text-slate-700"
          bgColor="bg-slate-100"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={UserCheck}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Defaulted / Expired"
          value={stats.problem}
          icon={UserX}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          label="Freeze"
          value={stats.freeze}
          icon={Snowflake}
          color="text-sky-600"
          bgColor="bg-sky-50"
        />
      </div>

      {/* Toolbar + filter collapsible */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-gray-900 mr-1">Members</h2>
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
              {totalFiltered}
            </span>
            <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExport}
              className="!gap-1.5 !font-semibold !bg-gray-50 hover:!bg-gray-100 !shadow-none active:!scale-100 [&_svg]:!w-3.5 [&_svg]:!h-3.5"
            >
              Export
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => loadMembers(true)}
              disabled={loading}
              aria-label="Refresh members"
            />
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                filterOpen
                  ? 'bg-violet-50 text-violet-600 border-violet-200'
                  : 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setFilterOpen((o) => !o)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
            </button>
            <label className="inline-flex items-center gap-2 cursor-pointer ml-1">
              <span className="text-xs font-medium text-gray-500">Lite</span>
              <div className="relative w-9 h-5">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={liteMode}
                  onChange={(e) => setLiteMode(e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-300 peer-checked:bg-violet-600 rounded-full transition-colors"></div>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4"></div>
              </div>
            </label>
          </div>
          <div className="sm:ml-auto w-full sm:w-64">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search members..."
            />
          </div>
        </div>

        <FilterPanel
          isOpen={filterOpen}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        >
          <FilterField label="Register From">
            <input
              type="date"
              className={inputClass}
              value={filterDraft.from}
              onChange={(e) =>
                setFilterDraft((d) => ({ ...d, from: e.target.value }))
              }
            />
          </FilterField>
          <FilterField label="Register To">
            <input
              type="date"
              className={inputClass}
              value={filterDraft.to}
              onChange={(e) =>
                setFilterDraft((d) => ({ ...d, to: e.target.value }))
              }
            />
          </FilterField>
          <FilterField label="Name / ID">
            <input
              type="text"
              placeholder="Search..."
              className={inputClass}
              value={filterDraft.nameId}
              onChange={(e) =>
                setFilterDraft((d) => ({ ...d, nameId: e.target.value }))
              }
            />
          </FilterField>
          <FilterField label="Status">
            <select
              className={inputClass}
              value={filterDraft.status}
              onChange={(e) =>
                setFilterDraft((d) => ({ ...d, status: e.target.value }))
              }
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FilterField>
        </FilterPanel>
      </div>

      {loadError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {loadError}
        </div>
      )}

      {/* Tabel + pagination */}
      {loading ? (
        <div className="text-center text-sm text-gray-500 py-12">Memuat member...</div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-12">
                  #
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  ID{' '}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 ml-0.5"
                    onClick={() => toggleSort('id')}
                  >
                    ▼
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Member{' '}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 ml-0.5"
                    onClick={() => toggleSort('name')}
                  >
                    ▼
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  KeyFob
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Register
                </th>
                {!liteMode && (
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Bill Info
                  </th>
                )}
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageSlice.map((m, i) => {
                const globalIdx = (safePage - 1) * PAGE_SIZE + i + 1;
                return (
                  <tr
                    key={m.id}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedMember(m)}
                  >
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {globalIdx}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {m.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.name} size="sm" />
                        <span className="font-semibold text-gray-900 text-sm">
                          {m.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{m.email}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {m.keyfob}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {m.register}
                    </td>
                    {!liteMode && (
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                        {m.bill}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <Badge status={m.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors"
                        title="View detail"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(m);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 gap-2">
          <p className="text-xs text-gray-500">
            Showing {showRangeText} of {totalFiltered} members
          </p>
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      )}

      <SlidePanel
        isOpen={!!selectedMember}
        onClose={closeMemberPanel}
        title={editMode ? 'Edit Member' : 'Member Detail'}
      >
        {selectedMember && editMode && editForm && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <p className="text-xs text-gray-400">
              Nama, paket, dan tanggal membership tidak bisa diubah dari sini —
              <code className="mx-1">GET /customers</code> hanya mengembalikan nama
              gabungan, bukan first/last name terpisah.
            </p>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Name
              </label>
              <p className="text-sm font-bold text-gray-900">{selectedMember.name}</p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
                placeholder="—"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                KeyFob
              </label>
              <input
                type="text"
                value={editForm.keyfob}
                onChange={(e) => setEditForm((f) => ({ ...f, keyfob: e.target.value }))}
                className={inputClass}
                placeholder="—"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputClass}
                placeholder="—"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Membership Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                className={inputClass}
              >
                <option value="">— pilih —</option>
                {Object.keys(MEMBER_STATUS_TO_CODE).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {editError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {editError}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="submit" variant="primary" size="md" icon={Save} disabled={savingEdit}>
                {savingEdit ? 'Menyimpan...' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={cancelEdit}
                disabled={savingEdit}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {selectedMember && !editMode && (
          <>
            <div className="mb-4 flex justify-end">
              <Button type="button" variant="outline" size="sm" icon={Pencil} onClick={startEdit}>
                Edit
              </Button>
            </div>
            <div className="text-center mb-6">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarColor(
                  selectedMember.name
                )} flex items-center justify-center mx-auto shadow-lg`}
              >
                <span className="text-2xl font-bold text-white">
                  {getInitials(selectedMember.name)}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mt-4">
                {selectedMember.name}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedMember.email}
              </p>
              <div className="mt-3 flex justify-center">
                <Badge status={selectedMember.status} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                  <Hash className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    Member ID
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedMember.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    Email
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedMember.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    Phone
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedMember.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    KeyFob
                  </p>
                  <p className="text-sm font-bold font-mono text-gray-900">
                    {selectedMember.keyfob}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    Register Date
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedMember.register}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-4 h-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    Bill Info
                  </p>
                  <p className="text-sm font-bold font-mono text-gray-900">
                    {selectedMember.bill}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      STATUS_DOT_COLORS[selectedMember.status] ?? 'bg-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    Status
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedMember.status}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </SlidePanel>
    </div>
  );
}