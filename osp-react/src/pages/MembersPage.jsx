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
  Building2,
  ChevronLeft,
  History,
  Tag,
  CalendarClock,
} from 'lucide-react';
import {
  fetchMemberViewLight,
  mapMemberViewLight,
  fetchMemberCounts,
  updateMember,
  clearCustomersCache,
  MEMBER_STATUS_TO_CODE,
  MEMBER_VIEW_LIGHT_STATUS_OPTIONS,
} from '../services/memberService';
import { fetchReportRecurring, mapRecurringRow } from '../services/reportRecurringService';
import { useAuth } from '../hooks/useAuth';
import { useShowToast } from '../contexts/ToastContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import ReportPagination from '../components/ui/ReportPagination';
import StatCard from '../components/ui/StatCard';
import SlidePanel from '../components/ui/SlidePanel';
import FilterPanel, { FilterField } from '../components/ui/FilterPanel';
import { getAvatarColor, getInitials } from '../utils/helpers';
import { isEndpointMissing } from '../utils/apiErrors';

const PAGE_SIZE = 10;

const emptyFilterDraft = () => ({
  id: '',
  email: '',
  membershipType: '',
  status: '',
});

// Step 1 dari flow mentor: pilih gym dulu sebelum lihat member-nya. Sumber
// gymList dari user yang login (lihat AuthContext) — bukan /master/gyms atau
// /api/gyms, biar konsisten sama pola yang udah dipakai OspReportPage/
// DailySalesReportPage/PendingMembershipPage dan otomatis respect akses user.
function GymPicker({ gymList, onSelect }) {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-900">Pilih Gym</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Pilih gym buat lihat daftar member-nya.
        </p>
      </div>

      {gymList.length === 0 ? (
        <div className="text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-10">
          Tidak ada gym yang di-assign ke akun ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {gymList.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelect(g)}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-violet-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{g.name}</p>
                <p className="text-xs text-gray-400">Gym ID: {g.id}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Section baru di detail member: riwayat recurring billing (poin ke-3 dari
// mentor). WAJIB pakai gymName (bukan gymId) karena kolom gym_id di tabel
// report_recurring selalu null — lihat catatan di api_docs_v2.md § 4.
function RecurringHistorySection({ gymName, memberId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetchReportRecurring({ gymName, memberId, size: 6, sort: 'createdDate,desc' })
      .then((res) => {
        if (!active) return;
        setRows((res.content ?? []).map(mapRecurringRow));
      })
      .catch((err) => {
        if (!active) return;
        setError(
          isEndpointMissing(err)
            ? 'Endpoint report recurring belum aktif di server ini.'
            : 'Gagal memuat riwayat recurring.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [gymName, memberId]);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-violet-500" />
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Riwayat Recurring Billing
        </h3>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400 py-4 text-center">Memuat riwayat...</p>
      ) : error ? (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-3">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-4 text-center">
          Belum ada riwayat recurring buat member ini.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">{r.periode}</p>
                <p className="text-[11px] text-gray-400 truncate">
                  {r.createdDate} &middot; {r.bank} {r.cardType !== '-' ? `(${r.cardType})` : ''}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold font-mono text-gray-900">{r.amountDisplay}</p>
                <Badge status={r.status} className="mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MembersPage() {
  const { user } = useAuth();
  const showToast = useShowToast();

  const gymList = useMemo(() => user?.gymList ?? [], [user]);
  const [selectedGym, setSelectedGym] = useState(null); // { id, name }

  // Auto-skip gym picker kalau user cuma punya 1 gym.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!selectedGym && gymList.length === 1) setSelectedGym(gymList[0]);
  }, [gymList, selectedGym]);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [counts, setCounts] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filterOpen, setFilterOpen] = useState(false);
  const [liteMode, setLiteMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  const [filterDraft, setFilterDraft] = useState(emptyFilterDraft);
  const [appliedFilter, setAppliedFilter] = useState(emptyFilterDraft);

  const [sortConfig, setSortConfig] = useState(null); // { key: 'id' | 'name', asc }

  // Field Java yang dipakai param `sort` — lihat Pagination § api_docs_v2.md
  const sortParam = sortConfig
    ? `${sortConfig.key === 'id' ? 'id' : 'memberName'},${sortConfig.asc ? 'asc' : 'desc'}`
    : undefined;

  const buildSearchParams = useCallback(
    (targetPage) => {
      const q = searchQuery.trim();
      const params = {
        gymId: selectedGym.id,
        page: targetPage,
        size: PAGE_SIZE,
        sort: sortParam,
      };
      // Search box: angka -> filter id (exact), selain itu -> filter name (partial)
      if (q) {
        if (/^\d+$/.test(q)) params.id = Number(q);
        else params.name = q;
      }
      if (appliedFilter.id) params.id = Number(appliedFilter.id);
      if (appliedFilter.email) params.email = appliedFilter.email;
      if (appliedFilter.membershipType) params.membershipType = appliedFilter.membershipType;
      if (appliedFilter.status) params.membershipStatus = appliedFilter.status;
      return params;
    },
    [selectedGym, searchQuery, appliedFilter, sortParam]
  );

  const loadMembers = useCallback(
    async (targetPage = 0) => {
      if (!selectedGym) return;
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetchMemberViewLight(buildSearchParams(targetPage));
        setMembers((res.content ?? []).map(mapMemberViewLight));
        setTotalPages(res.totalPages ?? 0);
        setTotalElements(res.totalElements ?? 0);
        setPage(targetPage);
      } catch (err) {
        console.error('Gagal fetch member-view-light:', err);
        setLoadError(
          isEndpointMissing(err)
            ? 'Endpoint /api/member-view-light belum aktif di server ini.'
            : 'Gagal memuat member dari server.'
        );
        setMembers([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedGym, buildSearchParams]
  );

  // Reload dari halaman 1 tiap kali gym/search/filter/sort berubah
  useEffect(() => {
    if (!selectedGym) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMembers(0);
  }, [selectedGym, searchQuery, appliedFilter, sortParam]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stat cards: dihitung real dari server (5 request ringan size:1), bukan
  // dari data halaman yang lagi kebuka — gak mungkin lagi hitung di client
  // karena cuma 1 page yang ke-load.
  useEffect(() => {
    if (!selectedGym) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCounts(null);
      return;
    }
    let active = true;
    fetchMemberCounts(selectedGym.id)
      .then((c) => active && setCounts(c))
      .catch(() => active && setCounts(null));
    return () => {
      active = false;
    };
  }, [selectedGym]);

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    loadMembers(newPage);
  };

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

  const switchGym = () => {
    setSelectedGym(null);
    setMembers([]);
    setSearchQuery('');
    setFilterDraft(emptyFilterDraft());
    setAppliedFilter(emptyFilterDraft());
    setSortConfig(null);
  };

  // '-' dari mapper artinya "gak ada nilai" — di form edit tampilin kosong.
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
    // yang ada di body, sisanya dibiarkan apa adanya di server. Endpoint ini
    // masih yang legacy (/customers/{id}) — member-view-light sendiri
    // read-only, tapi id-nya sama (personalDetailId) jadi edit tetap jalan.
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

      const patched = {
        ...selectedMember,
        email: 'email' in patch ? patch.email || '-' : selectedMember.email,
        keyfob: 'keyfob' in patch ? patch.keyfob || '-' : selectedMember.keyfob,
        phone: 'phoneNumber' in patch ? patch.phoneNumber || '-' : selectedMember.phone,
        status: 'status' in patch ? editForm.status : selectedMember.status,
      };
      setMembers((prev) => prev.map((m) => (m.id === patched.id ? patched : m)));
      setSelectedMember(patched);
      clearCustomersCache(); // /customers dipakai HomePage — jangan nyajiin data lama
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

  // Export cuma nyakup halaman yang lagi dibuka — data lengkap gak ada lagi
  // di memory client karena pagination-nya beneran server-side sekarang.
  const handleExport = () => {
    const headers = liteMode
      ? ['#', 'ID', 'Member', 'Email', 'KeyFob', 'Register', 'Status']
      : ['#', 'ID', 'Member', 'Email', 'KeyFob', 'Register', 'Payment Value', 'Status'];
    const rows = members.map((m, i) => {
      const row = [String(page * PAGE_SIZE + i + 1), m.id, m.name, m.email, m.keyfob, m.register];
      if (!liteMode) row.push(m.bill);
      row.push(m.status);
      return row;
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    XLSX.writeFile(workbook, `members_export_page${page + 1}.xlsx`);

    showToast?.('Downloaded members_export page ini.', 'success');
  };

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none bg-white';

  // Step 1: belum pilih gym -> tampilin picker aja
  if (!selectedGym) {
    return <GymPicker gymList={gymList} onSelect={setSelectedGym} />;
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header gym aktif + ganti gym */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {gymList.length > 1 && (
            <button
              type="button"
              onClick={switchGym}
              className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700 font-semibold"
            >
              <ChevronLeft className="w-4 h-4" /> Ganti Gym
            </button>
          )}
          <span className="text-gray-300">/</span>
          <span className="inline-flex items-center gap-1.5 text-gray-700 font-semibold">
            <Building2 className="w-4 h-4 text-violet-500" />
            {selectedGym.name}
          </span>
        </div>
      </div>

      {/* Ringkasan statistik — real count dari server, bukan dari 1 halaman yang ke-load */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Members"
          value={counts ? counts.total : '-'}
          icon={Users}
          color="text-slate-700"
          bgColor="bg-slate-100"
        />
        <StatCard
          label="Active"
          value={counts ? counts.active : '-'}
          icon={UserCheck}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Defaulted / Expired"
          value={counts ? counts.problem : '-'}
          icon={UserX}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          label="Freeze"
          value={counts ? counts.freeze : '-'}
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
              {totalElements}
            </span>
            <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExport}
              title="Export data di halaman ini"
              className="!gap-1.5 !font-semibold !bg-gray-50 hover:!bg-gray-100 !shadow-none active:!scale-100 [&_svg]:!w-3.5 [&_svg]:!h-3.5"
            >
              Export
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => loadMembers(page)}
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
              placeholder="Search by name or ID..."
            />
          </div>
        </div>

        <FilterPanel isOpen={filterOpen} onApply={handleApplyFilter} onReset={handleResetFilter}>
          <FilterField label="Member ID">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Exact ID..."
              className={inputClass}
              value={filterDraft.id}
              onChange={(e) => setFilterDraft((d) => ({ ...d, id: e.target.value }))}
            />
          </FilterField>
          <FilterField label="Email">
            <input
              type="text"
              placeholder="Search..."
              className={inputClass}
              value={filterDraft.email}
              onChange={(e) => setFilterDraft((d) => ({ ...d, email: e.target.value }))}
            />
          </FilterField>
          <FilterField label="Membership Type">
            <input
              type="text"
              placeholder="EFT, PIF, ..."
              className={inputClass}
              value={filterDraft.membershipType}
              onChange={(e) => setFilterDraft((d) => ({ ...d, membershipType: e.target.value }))}
            />
          </FilterField>
          <FilterField label="Status">
            <select
              className={inputClass}
              value={filterDraft.status}
              onChange={(e) => setFilterDraft((d) => ({ ...d, status: e.target.value }))}
            >
              <option value="">All Status</option>
              {MEMBER_VIEW_LIGHT_STATUS_OPTIONS.map((s) => (
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
      {loading && members.length === 0 ? (
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
                      Payment Value
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={liteMode ? 7 : 8}
                      className="px-4 py-12 text-center text-sm text-gray-400"
                    >
                      Tidak ada member yang cocok.
                    </td>
                  </tr>
                ) : (
                  members.map((m, i) => {
                    const globalIdx = page * PAGE_SIZE + i + 1;
                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                        onClick={() => setSelectedMember(m)}
                      >
                        <td className="px-4 py-3 text-gray-400 text-xs">{globalIdx}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={m.name} size="sm" />
                            <span className="font-semibold text-gray-900 text-sm">{m.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{m.email}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.keyfob}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{m.register}</td>
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
                  })
                )}
              </tbody>
            </table>
          </div>
          <ReportPagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            loading={loading}
            onPageChange={handlePageChange}
          />
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
              Nama, paket, dan tanggal membership tidak bisa diubah dari sini — data
              member cuma nyimpen nama gabungan, bukan first/last name terpisah.
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
              <h2 className="text-lg font-bold text-gray-900 mt-4">{selectedMember.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{selectedMember.email}</p>
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
                  <p className="text-sm font-bold text-gray-900">{selectedMember.id}</p>
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
                  <p className="text-sm font-bold text-gray-900">{selectedMember.email}</p>
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
                  <p className="text-sm font-bold text-gray-900">{selectedMember.phone}</p>
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
                  <p className="text-sm font-bold text-gray-900">{selectedMember.register}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    Membership Type
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedMember.membershipType || '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-4 h-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    Payment Value
                  </p>
                  <p className="text-sm font-bold font-mono text-gray-900">
                    {selectedMember.bill}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                  <CalendarClock className="w-4 h-4 text-cyan-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    Next Billing Date
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedMember.nextBillingDate}
                  </p>
                </div>
              </div>
            </div>

            <RecurringHistorySection
              gymName={selectedMember.gymName}
              memberId={Number(selectedMember.id)}
            />
          </>
        )}
      </SlidePanel>
    </div>
  );
}
