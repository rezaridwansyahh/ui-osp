import { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  XCircle,
  ChevronRight,
  Calendar,
  Clock,
  Banknote,
  Tag,
  Hash,
  CreditCard,
  CheckCircle,
  Slash,
  FastForward,
  AlertTriangle,
  Percent,
  ArrowRight,
  ArrowLeft,
  Wallet,
} from 'lucide-react';
import {
  MEMBERS_PAYMENT,
  PAYMENT_GYMS,
  PAYMENT_METHODS,
  generateMonths,
} from '../data/monthlyPayment';
import { useShowToast } from '../contexts/ToastContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/helpers';
import { getAvatarColor, getInitials } from '../utils/helpers';

export default function MonthlyPaymentPage() {
  const showToast = useShowToast();

  const [selectedGym, setSelectedGym] = useState('AF Kemang');
  const [selectedMember, setSelectedMember] = useState(null);
  const [monthStatuses, setMonthStatuses] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [memberSearchOpen, setMemberSearchOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Ringkasan: jumlah bulan collect/waived dan subtotal dari status per bulan
  const stats = useMemo(() => {
    if (!selectedMember) {
      return {
        collectMonths: 0,
        waivedMonths: 0,
        subtotal: 0,
        amount: 0,
      };
    }
    const collectMonths = Object.values(monthStatuses).filter(
      (s) => s === 'collect'
    ).length;
    const waivedMonths = Object.values(monthStatuses).filter(
      (s) => s === 'waived'
    ).length;
    const amount = selectedMember.monthlyAmount;
    const subtotal = collectMonths * amount;
    return { collectMonths, waivedMonths, subtotal, amount };
  }, [selectedMember, monthStatuses]);

  // 24 bulan terakhir antara signup dan sekarang (grid step 1, sama kayak HTML)
  const recentMonths = useMemo(() => {
    if (!selectedMember) return [];
    const months = generateMonths(selectedMember.signup);
    return months.slice(-24);
  }, [selectedMember]);

  // Daftar anggota di modal sesuai keyword (nama atau ID)
  const filteredModalMembers = useMemo(() => {
    const q = memberSearchQuery.trim().toLowerCase();
    if (!q) return MEMBERS_PAYMENT;
    return MEMBERS_PAYMENT.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
    );
  }, [memberSearchQuery]);

  const openMemberSearch = () => {
    setMemberSearchQuery('');
    setMemberSearchOpen(true);
    setTimeout(() => document.getElementById('mp-modal-member-search')?.focus(), 100);
  };

  const closeMemberSearch = () => setMemberSearchOpen(false);

  const selectMember = (m) => {
    const months = generateMonths(m.signup);
    const initial = {};
    months.forEach((mo) => {
      initial[mo.key] = 'notcol';
    });
    setSelectedMember(m);
    setMonthStatuses(initial);
    setCurrentStep(1);
    closeMemberSearch();
  };

  const clearMember = () => {
    setSelectedMember(null);
    setMonthStatuses({});
    setCurrentStep(1);
    setPaymentMethod('Cash');
  };

  const setMonthStatus = (key, status) => {
    setMonthStatuses((prev) => ({ ...prev, [key]: status }));
  };

  const processPayment = () => {
    setPayModalOpen(false);
    showToast('Payment processed successfully!', 'success');
    clearMember();
  };

  // Baris info di kartu anggota (ikon violet per field)
  const memberInfoRows = selectedMember
    ? [
        {
          icon: Calendar,
          label: 'Signup Date',
          value: new Date(selectedMember.signup).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        },
        {
          icon: Clock,
          label: 'Last Payment',
          value: selectedMember.lastPayment,
        },
        {
          icon: Banknote,
          label: 'Monthly Amount',
          value: formatCurrency(selectedMember.monthlyAmount),
        },
        {
          icon: Tag,
          label: 'Membership Type',
          value: selectedMember.type,
        },
        {
          icon: Hash,
          label: 'Member ID',
          value: selectedMember.id,
        },
        {
          icon: CreditCard,
          label: 'KeyFob',
          value: selectedMember.keyfob,
        },
      ]
    : [];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Toolbar: pilih cabang gym + buka modal cari member */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-violet-600" />
              </div>
              <select
                value={selectedGym}
                onChange={(e) => setSelectedGym(e.target.value)}
                className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none cursor-pointer"
              >
                {PAYMENT_GYMS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-px h-6 bg-gray-200 hidden sm:block" />
            <button
              type="button"
              onClick={openMemberSearch}
              className="relative flex-1 min-w-[200px] max-w-md cursor-pointer text-left w-full"
            >
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                readOnly
                value={
                  selectedMember
                    ? `${selectedMember.name} (${selectedMember.id})`
                    : ''
                }
                placeholder="Search member..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:border-violet-300 transition-colors outline-none pointer-events-none"
              />
            </button>
          </div>
          <button
            type="button"
            onClick={clearMember}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <XCircle className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Area konten: kosong jika belum pilih member; kalau sudah, step 1/2 + panel kanan */}
      {!selectedMember ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-base font-bold text-gray-400">No Member Selected</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Select a gym and search for a member to view payment details.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 min-w-0">
            {currentStep === 1 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Prior & Current Months
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Select payment status for each month
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {recentMonths.length} months
                  </span>
                </div>
                <div className="space-y-2">
                  {recentMonths.map((mo) => {
                    const st = monthStatuses[mo.key] || 'notcol';
                    return (
                      <div
                        key={mo.key}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <p className="text-sm font-semibold text-gray-700 w-24 flex-shrink-0">
                          {mo.label}
                        </p>
                        <div className="flex gap-1.5 flex-1">
                          <button
                            type="button"
                            onClick={() => setMonthStatus(mo.key, 'collect')}
                            className={`month-btn flex-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-300 transition-all ${
                              st === 'collect' ? 'active-collect' : ''
                            }`}
                          >
                            Collect
                          </button>
                          <button
                            type="button"
                            onClick={() => setMonthStatus(mo.key, 'waived')}
                            className={`month-btn flex-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-amber-300 transition-all ${
                              st === 'waived' ? 'active-waived' : ''
                            }`}
                          >
                            Waived
                          </button>
                          <button
                            type="button"
                            onClick={() => setMonthStatus(mo.key, 'notcol')}
                            className={`month-btn flex-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 transition-all ${
                              st === 'notcol' ? 'active-notcol' : ''
                            }`}
                          >
                            Not Collected
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    disabled={stats.collectMonths === 0}
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">
                    Payment Summary
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      {
                        label: `${stats.collectMonths} paid month(s)`,
                        value: formatCurrency(stats.subtotal),
                        icon: CheckCircle,
                        color: 'text-emerald-500',
                      },
                      {
                        label: 'Current month',
                        value: formatCurrency(
                          stats.collectMonths > 0 ? selectedMember.monthlyAmount : 0
                        ),
                        icon: Calendar,
                        color: 'text-blue-500',
                      },
                      {
                        label: `${stats.waivedMonths} waived month(s)`,
                        value: formatCurrency(0),
                        icon: Slash,
                        color: 'text-amber-500',
                      },
                      {
                        label: '0 advance month(s)',
                        value: formatCurrency(0),
                        icon: FastForward,
                        color: 'text-violet-500',
                      },
                      {
                        label: 'Late Fee',
                        value: formatCurrency(0),
                        icon: AlertTriangle,
                        color: 'text-red-500',
                      },
                      {
                        label: 'Discount',
                        value: formatCurrency(0),
                        icon: Percent,
                        color: 'text-sky-500',
                      },
                    ].map((row) => {
                      const RowIcon = row.icon;
                      return (
                      <div
                        key={row.label}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-2.5">
                          <RowIcon
                            className={`w-4 h-4 ${row.color} flex-shrink-0`}
                          />
                          <span className="text-sm text-gray-700">{row.label}</span>
                        </div>
                        <span className="text-sm font-bold font-mono text-gray-900">
                          {row.value}
                        </span>
                      </div>
                    );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Payment Change
                      </label>
                      <div className="px-3 py-2.5 bg-gray-50 rounded-lg text-sm font-bold font-mono text-gray-900">
                        {formatCurrency(0)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Sales Name
                      </label>
                      <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none">
                        <option>{`OSP Kemang - ${selectedGym}`}</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Select Payment Method
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {PAYMENT_METHODS.map((p) => (
                          <label
                            key={p}
                            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:border-violet-300 has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50 transition-all"
                          >
                            <input
                              type="radio"
                              name="payMethod"
                              value={p}
                              checked={paymentMethod === p}
                              onChange={() => setPaymentMethod(p)}
                              className="accent-violet-600 w-3.5 h-3.5"
                            />
                            <span className="text-xs font-semibold text-gray-700">
                              {p}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="md"
                    className="rounded-xl border-gray-200 font-semibold text-gray-600"
                    onClick={() => setCurrentStep(1)}
                    icon={ArrowLeft}
                  >
                    Back
                  </Button>
                  <Button
                    variant="success"
                    size="md"
                    className="rounded-xl"
                    onClick={() => setPayModalOpen(true)}
                    icon={Wallet}
                  >
                    Pay
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Panel kanan sticky: profil member + ringkasan running total */}
          <div className="lg:w-[340px] flex-shrink-0">
            <div className="lg:sticky lg:top-0 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    name={selectedMember.name}
                    size="lg"
                    className="rounded-xl shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {selectedMember.name}
                    </h3>
                    <p className="text-xs text-gray-400">{selectedGym}</p>
                  </div>
                  <Badge status={selectedMember.status} />
                </div>
                <div className="space-y-2.5">
                  {memberInfoRows.map(({ icon: IconCmp, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg"
                    >
                      <div className="w-7 h-7 bg-white rounded-md shadow-sm flex items-center justify-center flex-shrink-0">
                        <IconCmp className="w-3.5 h-3.5 text-violet-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider">
                          {label}
                        </p>
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Summary
                  </p>
                  <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                    Step {currentStep}/2
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Collect</span>
                    <span className="font-semibold text-gray-900">
                      {stats.collectMonths} month(s)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Waived</span>
                    <span className="font-semibold text-gray-900">
                      {stats.waivedMonths} month(s)
                    </span>
                  </div>
                  <div className="my-2 border-t border-gray-100" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold font-mono text-gray-900">
                      {formatCurrency(stats.subtotal)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <p className="text-xs text-gray-400 font-semibold uppercase">
                      Total
                    </p>
                    <p
                      className={`text-xl font-bold font-mono ${
                        stats.subtotal > 0 ? 'text-violet-700' : 'text-gray-300'
                      }`}
                    >
                      {formatCurrency(stats.subtotal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pencarian member (daftar + filter live) */}
      <div
        className={`modal-overlay-mp fixed inset-0 bg-black/40 z-[999] flex items-center justify-center p-4 ${
          memberSearchOpen ? 'open' : ''
        }`}
        role="presentation"
        aria-hidden={!memberSearchOpen}
      >
        <div
          className="modal-box-mp bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Member search"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b border-gray-100">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="mp-modal-member-search"
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Search by member ID or name..."
                className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 min-h-0">
            {filteredModalMembers.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                No members found.
              </div>
            ) : (
              filteredModalMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectMember(m)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-violet-50/60 transition-colors group w-full text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
                      m.name
                    )} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-[11px] font-bold text-white">
                      {getInitials(m.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                        {m.name}
                      </p>
                      <Badge status={m.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {m.id} · {m.type} · {formatCurrency(m.monthlyAmount)}/mo
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-400 flex-shrink-0" />
                </button>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-100 flex justify-end">
            <Button
              variant="outline"
              size="md"
              className="rounded-xl border-gray-200 font-semibold text-gray-600"
              onClick={closeMemberSearch}
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Modal konfirmasi pembayaran sebelum proses */}
      <div
        className={`modal-overlay-mp fixed inset-0 bg-black/40 z-[999] flex items-center justify-center p-4 ${
          payModalOpen ? 'open' : ''
        }`}
        role="presentation"
        aria-hidden={!payModalOpen}
      >
        <div
          className="modal-box-mp bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm payment"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Confirm Payment</h3>
          <p className="text-sm text-gray-500 mt-1">
            Process payment for the selected months?
          </p>
          <div className="mt-4 text-left">
            <div className="space-y-2 mb-3">
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Months to collect</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.collectMonths}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Monthly Amount</span>
                <span className="text-sm font-bold font-mono text-gray-900">
                  {formatCurrency(stats.amount)}
                </span>
              </div>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-700">Total</span>
              <span className="text-lg font-bold font-mono text-emerald-700">
                {formatCurrency(stats.subtotal)}
              </span>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <Button
              variant="outline"
              size="md"
              className="flex-1 rounded-xl border-gray-200 font-semibold text-gray-600"
              onClick={() => setPayModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              size="md"
              className="flex-1 rounded-xl"
              onClick={processPayment}
            >
              Confirm & Pay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
