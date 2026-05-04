import Chart from 'react-apexcharts';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserX,
  Snowflake,
} from 'lucide-react';

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

const memberTrendSeries = [
  {
    name: 'New Members',
    data: [18, 22, 30, 25, 38, 35, 28, 40, 33, 37, 42, 45],
  },
];

// Konfigurasi chart buat trend member baru
const memberTrendOptions = {
  ...baseChartOpts,
  chart: {
    type: 'area',
    height: 300,
    fontFamily,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  xaxis: {
    categories: [
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
    ],
    labels: { style: { fontSize: '11px', colors: '#94a3b8' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { fontSize: '11px', colors: '#94a3b8' } },
  },
  stroke: { width: 3, curve: 'smooth' },
  colors: ['#3b82f6'],
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
    colors: ['#3b82f6'],
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: { sizeOffset: 3 },
  },
  tooltip: {
    y: { formatter: (val) => val + ' members' },
  },
};

const memberStatusSeries = [1054, 4579, 52];

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

const paymentTypeSeries = [
  {
    name: 'Members',
    data: [992, 226],
  },
];

// Konfigurasi bar buat tipe pembayaran
const paymentTypeOptions = {
  ...baseChartOpts,
  chart: {
    type: 'bar',
    height: 300,
    fontFamily,
    toolbar: { show: false },
  },
  xaxis: {
    categories: ['EFT Members', 'PIF Members'],
    labels: {
      style: { fontSize: '12px', colors: '#64748b', fontWeight: 600 },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { fontSize: '11px', colors: '#94a3b8' } },
  },
  colors: ['#8b5cf6'],
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

const totalGender = 719 + 499;
const malePct = Math.round((719 / totalGender) * 100);
const femalePct = Math.round((499 / totalGender) * 100);

const genderChartSeries = [malePct, femalePct];

// Konfigurasi radial bar buat distribusi gender
const genderChartOptions = {
  ...baseChartOpts,
  chart: {
    type: 'radialBar',
    height: 300,
    fontFamily,
  },
  labels: ['Male', 'Female'],
  colors: ['#3b82f6', '#f43f5e'],
  plotOptions: {
    radialBar: {
      hollow: { size: '40%' },
      track: { background: '#f1f5f9', strokeWidth: '100%' },
      dataLabels: {
        name: { fontSize: '13px', fontWeight: 600, color: '#64748b', offsetY: -10 },
        value: { fontSize: '20px', fontWeight: 700, color: '#1e293b' },
        total: {
          show: true,
          label: 'Total',
          fontSize: '12px',
          color: '#94a3b8',
          formatter: () => totalGender.toLocaleString(),
        },
      },
    },
  },
  stroke: { lineCap: 'round' },
  legend: {
    show: true,
    position: 'bottom',
    fontSize: '12px',
    labels: { colors: '#64748b' },
    markers: { width: 10, height: 10, radius: 3 },
    formatter: (label, opts) => {
      const vals = [719, 499];
      return label + ': ' + vals[opts.seriesIndex].toLocaleString();
    },
  },
};

const STAT_CARDS = [
  {
    title: 'New Members',
    value: '45',
    delta: '+12% vs last month',
    valueClass: 'text-2xl font-bold text-blue-500 mt-1',
    deltaClass: 'text-xs text-emerald-500 font-medium mt-1',
    sparkData: [18, 22, 30, 25, 38, 35, 28, 40, 33, 37, 42, 45],
    sparkColor: '#3b82f6',
    Icon: Users,
  },
  {
    title: 'Total Active',
    value: '1,054',
    delta: '+3.2% growth',
    valueClass: 'text-2xl font-bold text-emerald-500 mt-1',
    deltaClass: 'text-xs text-emerald-500 font-medium mt-1',
    sparkData: [820, 860, 890, 920, 950, 970, 990, 1010, 1020, 1035, 1048, 1054],
    sparkColor: '#10b981',
    Icon: UserCheck,
  },
  {
    title: 'Defaulted',
    value: '4,579',
    delta: '+1.8% increase',
    valueClass: 'text-2xl font-bold text-red-500 mt-1',
    deltaClass: 'text-xs text-red-400 font-medium mt-1',
    sparkData: [4200, 4250, 4300, 4350, 4380, 4420, 4460, 4490, 4520, 4540, 4560, 4579],
    sparkColor: '#ef4444',
    Icon: UserX,
  },
  {
    title: 'Freeze',
    value: '52',
    delta: '-5% decrease',
    valueClass: 'text-2xl font-bold text-amber-500 mt-1',
    deltaClass: 'text-xs text-amber-500 font-medium mt-1',
    sparkData: [70, 65, 60, 72, 68, 55, 58, 62, 50, 48, 55, 52],
    sparkColor: '#f59e0b',
    Icon: Snowflake,
  },
];

function SparkStatChart({ data, color }) {
  const { options, series } = getSparklineConfig(data, color);
  return <Chart options={options} series={series} type="area" height={50} width={90} />;
}

// Banner sambutan — kelas sama persis home.html
function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 lg:p-8 mb-5 shadow-lg">
      <div className="absolute inset-0 opacity-[0.07]" style={bannerPatternStyle} />
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-red-500/15 to-orange-500/15 rounded-full blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
            <LayoutDashboard className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">Dashboard Overview</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                osp_kemang
              </span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">User ID</p>
            <p className="text-white font-bold text-sm mt-0.5">803</p>
          </div>
          <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Access Type</p>
            <p className="text-white font-bold text-sm mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              MERCHANT
            </p>
          </div>
          <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Gym Access</p>
            <p className="text-white font-bold text-sm mt-0.5">AF Kemang</p>
          </div>
          <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Login Time</p>
            <p className="text-white font-bold text-sm mt-0.5">15 Apr, 04:42</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Grid 4 kartu statistik — struktur & kelas sama home.html (ikon sr-only biar aksesibel, tampilan tetap)
function StatCardsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      {STAT_CARDS.map(
        ({ title, value, delta, valueClass, deltaClass, sparkData, sparkColor, Icon }) => (
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
              <p className={deltaClass}>{delta}</p>
            </div>
            <div className="flex-shrink-0">
              <SparkStatChart data={sparkData} color={sparkColor} />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

// Section chart baris pertama: trend + donut
function ChartsRowTrendAndStatus() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">New Members Trend</h3>
        <p className="text-xs text-gray-400 mb-3">Jumlah pendaftaran member baru per bulan</p>
        <div>
          <Chart options={memberTrendOptions} series={memberTrendSeries} type="area" height={300} />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Member Status</h3>
        <p className="text-xs text-gray-400 mb-3">Distribusi status seluruh member</p>
        <div>
          <Chart options={memberStatusOptions} series={memberStatusSeries} type="donut" height={300} />
        </div>
      </div>
    </div>
  );
}

// Section chart baris kedua: payment + gender
function ChartsRowPaymentAndGender() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Payment Type</h3>
        <p className="text-xs text-gray-400 mb-3">Perbandingan member EFT vs PIF</p>
        <div>
          <Chart options={paymentTypeOptions} series={paymentTypeSeries} type="bar" height={300} />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Gender Distribution</h3>
        <p className="text-xs text-gray-400 mb-3">Proporsi gender dari total member aktif</p>
        <div>
          <Chart options={genderChartOptions} series={genderChartSeries} type="radialBar" height={300} />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="p-4 lg:p-6">
      <WelcomeBanner />
      <StatCardsSection />
      <ChartsRowTrendAndStatus />
      <ChartsRowPaymentAndGender />
    </div>
  );
}
