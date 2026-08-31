import { useState, useMemo } from 'react';
import { AlertTriangle, Info, Building2, FileX, Printer, X, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import { useShowToast } from '../contexts/ToastContext';
import { fetchPendingMembershipByGym } from '../services/memberService';
import { formatCurrency, formatIDR } from '../utils/helpers';

const PAGE_SIZE = 10;

const formatDate = (d) => {
  if (!d) return '-';
  return String(d).replace('T', ' ').slice(0, 19);
};

export default function PendingMembershipPage() {
  const showToast = useShowToast();
  const { user } = useAuth();
  const gymList = user?.gymList ?? [];

  const [selectedGymId, setSelectedGymId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberResults, setMemberResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberSearched, setMemberSearched] = useState(false);

  const [pendingList, setPendingList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);

  const [tableSearch, setTableSearch] = useState('');
  const [page, setPage] = useState(1);

  const selectedGym = gymList.find((g) => String(g.id) === String(selectedGymId));
  const gymSelected = !!selectedGym;

  async function handleGymChange(val) {
    setSelectedGymId(val);
    setMemberName('');
    setMemberResults([]);
    setSelectedMember(null);
    setMemberSearched(false);
    setTableSearch('');
    setPage(1);
    setPendingList([]);
    setListError(null);

    if (!val) return;

    // Load pending membership list
    setListLoading(true);
    try {
      const data = await fetchPendingMembershipByGym(val);
      const items = Array.isArray(data) ? data : (data?.data ?? data?.content ?? []);
      setPendingList(items);
    } catch (err) {
      setListError(err.response?.data?.message || err.message || 'Gagal memuat data.');
    } finally {
      setListLoading(false);
    }
  }

  function handleMemberSearch() {
    if (!gymSelected) return;
    setMemberLoading(true);
    setMemberSearched(true);
    setSelectedMember(null);

    // Search member from pending list by name — filter lokal, gak ada I/O
    const q = memberName.trim().toLowerCase();
    const found = pendingList.filter((m) =>
      !q || (m.name ?? '').toLowerCase().includes(q)
    );
    setMemberResults(found);
    setMemberLoading(false);
  }

  // Parse additionalInformation JSON
  function getPackages(member) {
    if (!member) return [];
    try {
      const info = member.additionalInformation;
      if (!info || info === 'null') return [];
      const parsed = JSON.parse(info);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  const packages = getPackages(selectedMember);
  const totalAmount = packages.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const filteredList = useMemo(() => {
    const q = tableSearch.toLowerCase();
    return pendingList.filter((r) =>
      !q ||
      (r.name ?? '').toLowerCase().includes(q) ||
      (r.email ?? '').toLowerCase().includes(q) ||
      (r.gymName ?? '').toLowerCase().includes(q)
    );
  }, [pendingList, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const paged = filteredList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleExportCSV() {
  const headers = ['DSP ID', 'Merchant', 'Name', 'Email', 'Key', 'Type', 'Created Time'];
  const rows = filteredList.map((r) => [r.id, r.gymName ?? '-', r.name ?? '-', r.email ?? '-', r.keyfob ?? '-', r.membershipType ?? '-', formatDate(r.createdDate)]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pending Membership');
  XLSX.writeFile(workbook, 'pending_membership.xlsx');

  showToast('XLSX exported', 'success');
}

  return (
    <div className="p-4 lg:p-6 space-y-6">

      {/* ── Pending Member (top card) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-violet-600 px-5 py-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-white flex-shrink-0" />
          <span className="text-white text-sm font-semibold">Gym Selection Required</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Gym selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Select Gym Location <span className="text-red-500">*</span>
              </label>
              <select value={selectedGymId} onChange={(e) => handleGymChange(e.target.value)}
                disabled={gymList.length === 0}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400 disabled:bg-gray-50 disabled:text-gray-400">
                <option value="">
                  {gymList.length === 0 ? '-- No Gym Assigned --' : '-- Please Select a Gym --'}
                </option>
                {gymList.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            {gymSelected && (
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Selected Gym Address</label>
                <p className="text-sm text-gray-700 py-2">{selectedGym.address ?? selectedGym.gymAddress ?? '-'}</p>
              </div>
            )}
          </div>

          {!gymSelected && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                {gymList.length === 0
                  ? 'No gym is assigned to your account. Contact your administrator to get gym access before managing pending members.'
                  : 'Please select a gym first before proceeding with pending member management.'}
              </p>
            </div>
          )}

          {/* Name search */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Name</label>
            <input type="text" value={memberName}
              onChange={(e) => { setMemberName(e.target.value); setMemberSearched(false); setSelectedMember(null); }}
              disabled={!gymSelected}
              placeholder={gymSelected ? 'Enter member name...' : ''}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400 disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>

          <button onClick={handleMemberSearch} disabled={!gymSelected || memberLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {memberLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Search
          </button>

          {/* Member search results */}
          {memberSearched && memberResults.length > 0 && !selectedMember && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">Select Member</div>
              {memberResults.map((m) => (
                <button key={m.id} onClick={() => setSelectedMember(m)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-violet-50 border-t border-gray-100 transition-colors">
                  <span className="font-medium text-slate-800">{m.name}</span>
                  <span className="text-gray-400 ml-2 text-xs">{m.email}</span>
                </button>
              ))}
            </div>
          )}

          {memberSearched && memberResults.length === 0 && (
            <p className="text-sm text-gray-400">No members found.</p>
          )}

          {/* Total & packages */}
          <div>
            <p className="text-lg font-bold text-slate-800 mb-3">
              Total : {selectedMember ? formatIDR(totalAmount) : (gymSelected ? formatCurrency(0) : '')}
            </p>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    {['Name', 'Price', 'Discount', 'Type'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {packages.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">Please choose the member first.</td></tr>
                  ) : packages.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{p.description ?? '-'}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{formatIDR(p.amount)}</td>
                      {/* Gak ada field discount per-package di additionalInformation — jangan dikarang jadi Rp 0 */}
                      <td className="px-4 py-3 font-mono text-slate-400">-</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-xs font-bold">{p.type ?? '-'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pending Membership Lists ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-slate-800">Pending Membership Lists</h2>
        </div>

        {!gymSelected ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Building2 className="w-12 h-12 text-gray-300" />
            <p className="font-medium text-sm">Please select a gym location first</p>
            <p className="text-xs text-gray-400">Choose a gym from the dropdown above to see pending members</p>
          </div>
        ) : listLoading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        ) : listError ? (
          <div className="flex items-center gap-2 m-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            <X className="w-4 h-4 flex-shrink-0" /> {listError}
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button onClick={handleExportCSV} className="px-3 py-1.5 text-xs font-bold text-white bg-violet-600 rounded hover:bg-violet-700">CSV</button>
                <button onClick={handleExportCSV} className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700">Excel</button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-gray-500 rounded hover:bg-gray-600">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Search:</span>
                <input type="text" value={tableSearch}
                  onChange={(e) => { setTableSearch(e.target.value); setPage(1); }}
                  className="px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:border-violet-400 w-40" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    {['DSP ID', 'Merchant', 'Name', 'Email', 'Key', 'Status', 'Created Time'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paged.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                      <FileX className="w-8 h-8 mx-auto mb-2 text-gray-300" /> No pending members found.
                    </td></tr>
                  ) : paged.map((r) => (
                    <tr key={r.id} className="hover:bg-violet-50/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedMember(r)}>
                      <td className="px-4 py-3 font-mono text-xs text-violet-600 font-bold">{r.id}</td>
                      <td className="px-4 py-3 text-gray-700">{r.gymName ?? '-'}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{r.name ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{r.email ?? '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.keyfob ?? '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : r.status === 'CANCEL' ? 'bg-red-50 text-red-600' : 'bg-violet-50 text-violet-700'}`}>
                          {r.status ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(r.createdDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Total: <span className="font-bold text-slate-700">{filteredList.length}</span> records</span>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-2 py-1 text-xs font-semibold text-gray-500 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">Prev</button>
                <span className="px-3 py-1 text-xs font-bold text-violet-600 bg-violet-50 rounded">{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-2 py-1 text-xs font-semibold text-gray-500 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}