/* ============================================================
   OSP Home Dashboard - ApexCharts
   ============================================================ */

// ── Opsi dasar buat konsistensi semua chart ──
const fontFamily = 'IBM Plex Sans, sans-serif';
const baseChartOpts = {
  chart: { fontFamily, toolbar: { show: false } },
  tooltip: { style: { fontSize: '12px' } },
};

// ── Helper: bikin sparkline mini di stat card ──
function createSparkline(selector, data, color) {
  new ApexCharts(document.querySelector(selector), {
    ...baseChartOpts,
    chart: {
      type: 'area',
      height: 50,
      width: 90,
      sparkline: { enabled: true },
      fontFamily,
    },
    series: [{ data }],
    stroke: { width: 2, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] },
    },
    colors: [color],
    tooltip: {
      fixed: { enabled: false },
      x: { show: false },
      y: { title: { formatter: () => '' } },
      marker: { show: false },
    },
  }).render();
}

// ── 4 Sparkline di stat cards ──
createSparkline('#sparkNew',       [18, 22, 30, 25, 38, 35, 28, 40, 33, 37, 42, 45], '#3b82f6');
createSparkline('#sparkActive',    [820, 860, 890, 920, 950, 970, 990, 1010, 1020, 1035, 1048, 1054], '#10b981');
createSparkline('#sparkDefaulted', [4200, 4250, 4300, 4350, 4380, 4420, 4460, 4490, 4520, 4540, 4560, 4579], '#ef4444');
createSparkline('#sparkFreeze',    [70, 65, 60, 72, 68, 55, 58, 62, 50, 48, 55, 52], '#f59e0b');

// ── Area Chart: New Members Trend (12 bulan terakhir) ──
new ApexCharts(document.querySelector('#chartMemberTrend'), {
  ...baseChartOpts,
  chart: {
    type: 'area',
    height: 300,
    fontFamily,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  series: [{
    name: 'New Members',
    data: [18, 22, 30, 25, 38, 35, 28, 40, 33, 37, 42, 45],
  }],
  xaxis: {
    categories: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
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
    gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 100] },
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
    y: { formatter: val => val + ' members' },
  },
}).render();

// ── Donut Chart: Member Status ──
new ApexCharts(document.querySelector('#chartMemberStatus'), {
  ...baseChartOpts,
  chart: {
    type: 'donut',
    height: 300,
    fontFamily,
  },
  series: [1054, 4579, 52],
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
            formatter: w => w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString(),
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
    y: { formatter: val => val.toLocaleString() + ' members' },
  },
}).render();

// ── Bar Chart: Payment Type (EFT vs PIF) ──
new ApexCharts(document.querySelector('#chartPaymentType'), {
  ...baseChartOpts,
  chart: {
    type: 'bar',
    height: 300,
    fontFamily,
    toolbar: { show: false },
  },
  series: [{
    name: 'Members',
    data: [992, 226],
  }],
  xaxis: {
    categories: ['EFT Members', 'PIF Members'],
    labels: { style: { fontSize: '12px', colors: '#64748b', fontWeight: 600 } },
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
    gradient: { shade: 'light', type: 'vertical', shadeIntensity: 0.2, opacityFrom: 1, opacityTo: 0.85 },
  },
  dataLabels: {
    enabled: true,
    offsetY: -20,
    style: { fontSize: '13px', fontWeight: 700, colors: ['#334155'] },
  },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  legend: { show: false },
  tooltip: {
    y: { formatter: val => val.toLocaleString() + ' members' },
  },
}).render();

// ── Radial Bar: Gender Distribution ──
const totalGender = 719 + 499;
const malePct = Math.round((719 / totalGender) * 100);
const femalePct = Math.round((499 / totalGender) * 100);

new ApexCharts(document.querySelector('#chartGender'), {
  ...baseChartOpts,
  chart: {
    type: 'radialBar',
    height: 300,
    fontFamily,
  },
  series: [malePct, femalePct],
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
}).render();
