import { Loader2, Search } from 'lucide-react';

// Filter bar bersama buat report berbasis order (DailySalesReport & OspReport):
// pilih gym + rentang tanggal + tombol Search. Fully controlled — parent yang
// pegang state-nya, jadi tiap halaman bebas nentuin default sendiri.
export default function ReportFilterBar({
  gymId,
  onGymIdChange,
  gymList = [],
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onSearch,
  loading = false,
}) {
  const labelCls =
    'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5';
  const inputCls =
    'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-violet-400';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Gym</label>
          <select
            value={gymId}
            onChange={(e) => onGymIdChange(Number(e.target.value))}
            className={inputCls}
          >
            <option value={-1}>All</option>
            {gymList.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {gymList.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">No gym assigned to your account.</p>
          )}
        </div>
        <div>
          <label className={labelCls}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onSearch}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </div>
    </div>
  );
}
