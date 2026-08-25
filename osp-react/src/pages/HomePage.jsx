import { useCallback, useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserX,
  Snowflake,
  Info,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { fetchAllCustomersCached, mapApiCustomer } from '../services/memberService';

// Sama kayak home-charts.js — font buat semua chart
const fontFamily = 'IBM Plex Sans, sans-serif';

const baseChartOpts = {
  chart: { fontFamily, toolbar: { show: false } },
  tooltip: { style: { fontSize: '12px' } },
};

// Pattern banner — persis inline style di home.html
const bannerPatternStyle = {
  backgroundImage:
    "url('data:image/svg+xml,<svg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;><g fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;><g fill=&quot;%23ffffff&quot; fill-opacity=&quot;1&quot;><path d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/></g></g></svg>')",
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Bikin opsi + series sparkline buat kartu statistik (copy dari home-charts.js)
function getSparklineConfig(data, color) {
  return {
    options: {
      ...baseChartOpts,
      chart: {
        type: 'area',
        height: 50,
        width: 90,
        sparkline: { enabled: true },
        fontFamily,
      },
      stroke: { width: 2, curve: 'smooth' },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 100],
        },
      },
      colors: [color],
      tooltip: {
        fixed: { enabled: false },
        x: { show: false },
        y: { title: { formatter: () => '' } },
        marker: { show: false },
      },
    },
    series: [{ data }],
  };
}

// Konfigurasi chart buat trend member baru (categories dinamis dari data real)
function buildMemberTrendOptions(categories) {
  return {
    ...baseChartOpts,
    chart: {
      type: 'area',
      height: 300,
      fontFamily,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    xaxis: {
      categories,
      labels: { style: { fontSize: '11px', colors: '#94a3b8' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: '11px', colors: '#94a3b8' } },
    },
    stroke: { width: 3, curve: 'smooth' },
    colors: ['#7148FC'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    markers: {
      size: 4,
      colors: ['#7148FC'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: { sizeOffset: 3 },
    },
    tooltip: {
      y: { formatter: (val) => val + ' members' },
    },
  };
}

// Konfigurasi donut buat status member
const memberStatusOptions = {
  ...baseChartOpts,
  chart: {
    type: 'donut',
    height: 300,
    fontFamily,
  },
  labels: ['Active', 'Defaulted', 'Freeze'],
  colors: ['#10b981', '#ef4444', '#f59e0b'],
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: { fontSize: '13px', fontWeight: 600, color: '#334155' },
          value: { fontSize: '22px', fontWeight: 700, color: '#1e293b' },
          total: {
            show: true,
            label: 'Total',
            fontSize: '12px',
            color: '#94a3b8',
            formatter: (w) =>
              w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString(),
          },
        },
      },
    },
  },
  stroke: { width: 3, colors: ['#fff'] },
  dataLabels: { enabled: false },
  legend: {
    position: 'bottom',
    fontSize: '12px',
    labels: { colors: '#64748b' },
    markers: { width: 10, height: 10, radius: 3 },
  },
  tooltip: {
    y: { formatter: (val) => val.toLocaleString() + ' members' },
  },
};

// Konfigurasi bar buat distribusi membershipType (categories dinamis — bisa apa
// aja tergantung nilai asli dari backend, gak diasumsikan cuma EFT/PIF)
function buildMembershipTypeOptions(categories) {
  return {
    ...baseChartOpts,
    chart: {
      type: 'bar',
      height: 300,
      fontFamily,
      toolbar: { show: false },
    },
    xaxis: {
      categories,
      labels: {
        style: { fontSize: '12px', colors: '#64748b', fontWeight: 600 },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: '11px', colors: '#94a3b8' } },
    },
    colors: ['#7148FC'],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '50%',
        distributed: true,
        dataLabels: { position: 'top' },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.2,
        opacityFrom: 1,
        opacityTo: 0.85,
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: { fontSize: '13px', fontWeight: 700, colors: ['#334155'] },
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val) => val.toLocaleString() + ' members' },
    },
  };
}

function SparkStatChart({ data, color }) {
  const { options, series } = getSparklineConfig(data, color);
  return <Chart options={options} series={series} type="area" height={50} width={90} />;
}

// Format tanggal login jadi "13 May, 14:16"
function formatLoginTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  const day = d.getDate();
  const month = MONTH_LABELS[d.getMonth()];
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month}, ${hours}:${minutes}`;
}

function WelcomeBanner({ user, hasGymAccess }) {
  const displayName = user?.name || user?.username || 'Guest';
  const userId = user?.id || '-';
  const role = user?.role || 'USER';
  const gymName = hasGymAccess
    ? user?.gymName || user?.gymList?.[0]?.name || '-'
    : 'No gym assigned';
  const loginTime = formatLoginTime(new Date());

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 lg:p-8 mb-5 shadow-lg">
      <div className="absolute inset-0 opacity-[0.07]" style={bannerPatternStyle} />
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-violet-500/20 to-violet-700/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-red-500/15 to-orange-500/15 rounded-full blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
            <LayoutDashboard className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-violet-300 font-medium mb-1">Dashboard Overview</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-violet-400 to-violet-200 bg-clip-text text-transparent">
                {displayName}
              </span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <InfoBubble label="User ID" value={userId} />
          <InfoBubble label="Access Type" value={role} withDot />
          <InfoBubble label="Gym Access" value={gymName} warn={!hasGymAccess} />
          <InfoBubble label="Login Time" value={loginTime} />
        </div>
      </div>
    </div>
  );
}

function InfoBubble({ label, value, withDot = false, warn = false }) {
  return (
    <div
      className={
        warn
          ? 'bg-amber-500/10 backdrop-blur-sm border border-amber-400/30 rounded-xl px-4 py-3'
          : 'bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3'
      }
    >
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
      <p
        className={
          warn
            ? 'text-amber-300 font-bold text-sm mt-0.5 flex items-center gap-1.5'
            : 'text-white font-bold text-sm mt-0.5 flex items-center gap-1.5'
        }
      >
        {withDot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        {value}
      </p>
    </div>
  );
}

// Skeleton placeholder — dipakai selagi fetch customers masih jalan, biar
// area statistik/chart aja yang "loading", bukan seluruh halaman.
function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse ${className}`}>
      <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
      <div className="h-7 w-16 bg-gray-100 rounded" />
    </div>
  );
}

// Grid 4 kartu statistik. Cuma "New Members" yang punya sparkline + delta
// real (dihitung dari data 12 bulan terakhir) — Total Active/Defaulted/Freeze
// cuma snapshot saat ini, gak ada data historis buat bikin trend/delta yang
// jujur, jadi sengaja gak dipasangin angka persentase palsu.
function StatCardsSection({ stats, newMembersTrend, newMembersDelta }) {
  const cards = [
    {
      title: 'New Members',
      value: stats.newThisMonth.toLocaleString('id-ID'),
      delta: newMembersDelta,
      valueClass: 'text-2xl font-bold text-violet-500 mt-1',
      Icon: Users,
      sparkData: newMembersTrend,
      sparkColor: '#7148FC',
    },
    {
      title: 'Total Active',
      value: stats.active.toLocaleString('id-ID'),
      delta: null,
      valueClass: 'text-2xl font-bold text-emerald-500 mt-1',
      Icon: UserCheck,
    },
    {
      title: 'Defaulted',
      value: stats.defaulted.toLocaleString('id-ID'),
      delta: null,
      valueClass: 'text-2xl font-bold text-red-500 mt-1',
      Icon: UserX,
    },
    {
      title: 'Freeze',
      value: stats.freeze.toLocaleString('id-ID'),
      delta: null,
      valueClass: 'text-2xl font-bold text-amber-500 mt-1',
      Icon: Snowflake,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      {cards.map(({ title, value, delta, valueClass, sparkData, sparkColor, Icon }) => (
        <div
          key={title}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
        >
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              <Icon className="sr-only" aria-hidden />
              {title}
            </p>
            <p className={valueClass}>{value}</p>
            {delta && <p className="text-xs text-gray-400 font-medium mt-1">{delta}</p>}
          </div>
          {sparkData && (
            <div className="flex-shrink-0">
              <SparkStatChart data={sparkData} color={sparkColor} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Section chart baris pertama: trend + donut — semua dari data real
function ChartsRowTrendAndStatus({ stats, trendCategories, trendData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">New Members Trend</h3>
        <p className="text-xs text-gray-400 mb-3">Jumlah pendaftaran member baru per bulan</p>
        <div>
          <Chart
            options={buildMemberTrendOptions(trendCategories)}
            series={[{ name: 'New Members', data: trendData }]}
            type="area"
            height={300}
          />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Member Status</h3>
        <p className="text-xs text-gray-400 mb-3">Distribusi status seluruh member</p>
        <div>
          <Chart
            options={memberStatusOptions}
            series={[stats.active, stats.defaulted, stats.freeze]}
            type="donut"
            height={300}
          />
        </div>
      </div>
    </div>
  );
}

// Section chart baris kedua: membership type (real) + gender (belum ada field)
function ChartsRowMembershipAndGender({ membershipCategories, membershipData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Membership Type</h3>
        <p className="text-xs text-gray-400 mb-3">Distribusi tipe membership member</p>
        <div>
          {membershipCategories.length > 0 ? (
            <Chart
              options={buildMembershipTypeOptions(membershipCategories)}
              series={[{ name: 'Members', data: membershipData }]}
              type="bar"
              height={300}
            />
          ) : (
            <EmptyChartNote text="Tidak ada data membershipType pada member yang dimuat." />
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Gender Distribution</h3>
        <p className="text-xs text-gray-400 mb-3">Proporsi gender dari total member aktif</p>
        <EmptyChartNote text="Belum ada field gender di response GET /customers — chart ini belum bisa ditampilkan dengan data real." />
      </div>
    </div>
  );
}

function EmptyChartNote({ text }) {
  return (
    <div className="h-[300px] flex flex-col items-center justify-center text-center px-6">
      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-3">
        <Info className="w-5 h-5 text-amber-600" />
      </div>
      <p className="text-xs text-amber-700 max-w-xs">{text}</p>
    </div>
  );
}

export default function HomePage() {
  const { user, hasGymAccess } = useAuth();

  const [customers, setCustomers] = useState(null); // null = belum loaded
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAllCustomersCached();
      setCustomers((Array.isArray(data) ? data : []).map(mapApiCustomer));
    } catch (err) {
      console.error('Gagal fetch customers buat dashboard:', err);
      setLoadError('Gagal memuat data dashboard dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch on mount — sinkronisasi state dengan server, bukan derived value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
  }, [loadDashboardData]);

  const stats = useMemo(() => {
    if (!customers) return null;
    const active = customers.filter((m) => m.status === 'ACTIVE').length;
    const defaulted = customers.filter((m) => m.status === 'DEFAULTED').length;
    const freeze = customers.filter((m) => m.status === 'FREEZE').length;
    const now = new Date();
    const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const newThisMonth = customers.filter(
      (m) => m.register !== '-' && m.register.startsWith(thisMonthPrefix)
    ).length;
    return { active, defaulted, freeze, newThisMonth };
  }, [customers]);

  // 12 bulan terakhir: jumlah member baru per bulan, dihitung dari createdDate asli.
  const memberTrend = useMemo(() => {
    if (!customers) return null;
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: MONTH_LABELS[d.getMonth()],
      });
    }
    const data = months.map(
      ({ key }) => customers.filter((m) => m.register !== '-' && m.register.startsWith(key)).length
    );
    return { categories: months.map((m) => m.label), data };
  }, [customers]);

  // Delta bulan ini vs bulan lalu — dihitung real dari memberTrend, bukan dikarang.
  const newMembersDelta = useMemo(() => {
    if (!memberTrend || memberTrend.data.length < 2) return null;
    const thisMonth = memberTrend.data[memberTrend.data.length - 1];
    const lastMonth = memberTrend.data[memberTrend.data.length - 2];
    if (lastMonth === 0) return null;
    const pct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    return `${pct >= 0 ? '+' : ''}${pct}% vs bulan lalu`;
  }, [memberTrend]);

  // Distribusi membershipType — dikelompokkan apa adanya dari nilai real,
  // gak diasumsikan cuma EFT/PIF. Dibatasi 6 kategori terbanyak biar chart gak sesak.
  const membershipBreakdown = useMemo(() => {
    if (!customers) return { categories: [], data: [] };
    const counts = new Map();
    customers.forEach((m) => {
      const key = m.membershipType || 'Tidak diketahui';
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    return { categories: entries.map(([k]) => k), data: entries.map(([, v]) => v) };
  }, [customers]);

  return (
    <div className="p-4 lg:p-6">
      <WelcomeBanner user={user} hasGymAccess={hasGymAccess} />

      {loadError && (
        <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <button
            onClick={loadDashboardData}
            className="text-xs font-semibold text-red-700 hover:text-red-800 underline shrink-0"
          >
            Coba lagi
          </button>
        </div>
      )}

      {loading && !customers ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <CardSkeleton className="lg:col-span-2 h-[300px]" />
            <CardSkeleton className="h-[300px]" />
          </div>
        </>
      ) : stats ? (
        <>
          <StatCardsSection
            stats={stats}
            newMembersTrend={memberTrend.data}
            newMembersDelta={newMembersDelta}
          />
          <ChartsRowTrendAndStatus
            stats={stats}
            trendCategories={memberTrend.categories}
            trendData={memberTrend.data}
          />
          <ChartsRowMembershipAndGender
            membershipCategories={membershipBreakdown.categories}
            membershipData={membershipBreakdown.data}
          />
        </>
      ) : null}
    </div>
  );
}
