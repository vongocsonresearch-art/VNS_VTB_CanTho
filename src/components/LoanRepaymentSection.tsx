import React, { useState, useMemo } from 'react';
import contentData from '../data/contentData.json';
import { RepaymentPeriod } from '../types';
import { 
  Calculator, 
  Calendar, 
  Receipt, 
  FileSpreadsheet, 
  TrendingDown, 
  ChevronRight, 
  X, 
  Download, 
  Printer, 
  AlertCircle,
  Building,
  CheckCircle2
} from 'lucide-react';

export const LoanRepaymentSection: React.FC = () => {
  const { loanCalculator } = contentData;

  // Form inputs
  const [assetValue, setAssetValue] = useState<number>(loanCalculator.defaultAssetValue);
  const [assetValueStr, setAssetValueStr] = useState<string>(loanCalculator.defaultAssetValue.toLocaleString('vi-VN'));

  const [loanAmount, setLoanAmount] = useState<number>(loanCalculator.defaultLoanAmount);
  const [loanAmountStr, setLoanAmountStr] = useState<string>(loanCalculator.defaultLoanAmount.toLocaleString('vi-VN'));

  const [tenorMonths, setTenorMonths] = useState<number>(loanCalculator.defaultTenorMonths);
  const [interestRateYear, setInterestRateYear] = useState<number>(loanCalculator.defaultInterestRate);

  // Disbursement date (defaults to today / future date in format YYYY-MM-DD)
  const [disbursementDate, setDisbursementDate] = useState<string>('2026-10-24');
  const [repaymentCycleId, setRepaymentCycleId] = useState<string>('monthly'); // monthly, quarterly, semiAnnual, yearly
  const [repaymentDay, setRepaymentDay] = useState<number>(25); // day of month (e.g. 25)
  const [roundingMode, setRoundingMode] = useState<'exact' | 'thousand'>('thousand'); // to 1 VND or to 1,000 VND

  // Modal view for detailed table
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // Quick loan amount buttons
  const quickLoanAmounts = [
    { label: '300 Triệu', value: 300000000 },
    { label: '500 Triệu', value: 500000000 },
    { label: '1 Tỷ', value: 1000000000 },
    { label: '2 Tỷ', value: 2000000000 },
    { label: '5 Tỷ', value: 5000000000 }
  ];

  // Handlers for inputs
  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setLoanAmount(0);
      setLoanAmountStr('');
      return;
    }
    const val = parseInt(raw, 10);
    setLoanAmount(val);
    setLoanAmountStr(val.toLocaleString('vi-VN'));
  };

  const handleAssetValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setAssetValue(0);
      setAssetValueStr('');
      return;
    }
    const val = parseInt(raw, 10);
    setAssetValue(val);
    setAssetValueStr(val.toLocaleString('vi-VN'));
  };

  // Business calculations following PDF 3 exact formulas:
  // Chu kỳ: Hàng tháng (/12), Hàng quý (/4), 6 tháng (/2), Hàng năm (/1)
  // Gốc trả mỗi kỳ = Số tiền vay / Tổng số kỳ trả nợ
  // Lãi kỳ = Dư nợ đầu kỳ * Lãi suất kỳ
  // Tổng tiền trả kỳ = Gốc + Lãi
  // Dư nợ cuối kỳ = Dư nợ đầu kỳ - Gốc kỳ
  // Sai lệch do làm tròn được điều chỉnh vào kỳ trả nợ cuối cùng
  const scheduleData = useMemo(() => {
    if (loanAmount <= 0 || tenorMonths <= 0 || interestRateYear <= 0) {
      return {
        periods: [] as RepaymentPeriod[],
        totalPrincipal: 0,
        totalInterest: 0,
        totalPayment: 0,
        firstPeriodPayment: 0,
        lastPeriodPayment: 0,
        totalPeriods: 0
      };
    }

    const cycle = loanCalculator.repaymentCycles.find(c => c.id === repaymentCycleId) || loanCalculator.repaymentCycles[0];
    const cycleMonths = 12 / cycle.divisor; // 1 for monthly, 3 for quarterly, 6 for semi-annual, 12 for yearly
    const totalPeriods = Math.max(1, Math.round(tenorMonths / cycleMonths));
    const cycleInterestRate = (interestRateYear / 100) / cycle.divisor;

    const roundFn = (val: number) => {
      if (roundingMode === 'thousand') {
        return Math.round(val / 1000) * 1000;
      }
      return Math.round(val);
    };

    // Standard principal per period
    const rawPrincipalPerPeriod = loanAmount / totalPeriods;
    const basePrincipal = roundFn(rawPrincipalPerPeriod);

    let currentBalance = loanAmount;
    let accumulatedPrincipal = 0;
    let totalInterest = 0;
    const periods: RepaymentPeriod[] = [];

    // Base date parsing
    const disbDateObj = new Date(disbursementDate);

    for (let i = 1; i <= totalPeriods; i++) {
      const beginningBalance = currentBalance;
      
      // Determine principal for this period (adjust discrepancy on final period)
      let principalThisPeriod = basePrincipal;
      if (i === totalPeriods) {
        // Last period adjusts the difference
        principalThisPeriod = loanAmount - accumulatedPrincipal;
      } else {
        if (accumulatedPrincipal + principalThisPeriod > loanAmount) {
          principalThisPeriod = loanAmount - accumulatedPrincipal;
        }
      }
      accumulatedPrincipal += principalThisPeriod;

      // Calculate interest on beginning balance
      const rawInterest = beginningBalance * cycleInterestRate;
      const interestThisPeriod = roundFn(rawInterest);
      totalInterest += interestThisPeriod;

      const totalPaymentThisPeriod = principalThisPeriod + interestThisPeriod;
      const endingBalance = Math.max(0, beginningBalance - principalThisPeriod);
      currentBalance = endingBalance;

      // Generate repayment date
      // Example from PDF 3: Disbursement 10/01/2026, monthly cycle, repayment day 25 -> 25/02/2026, 25/03/2026...
      const nextMonthIndex = disbDateObj.getMonth() + (i * cycleMonths);
      const paymentDateObj = new Date(disbDateObj.getFullYear(), nextMonthIndex, repaymentDay);
      const dateFormatted = paymentDateObj.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      periods.push({
        periodNumber: i,
        paymentDate: dateFormatted,
        beginningBalance,
        principal: principalThisPeriod,
        interest: interestThisPeriod,
        totalPayment: totalPaymentThisPeriod,
        endingBalance
      });
    }

    const firstPeriodPayment = periods[0]?.totalPayment || 0;
    const lastPeriodPayment = periods[periods.length - 1]?.totalPayment || 0;
    const totalPrincipal = loanAmount;
    const grandTotal = totalPrincipal + totalInterest;

    return {
      periods,
      totalPrincipal,
      totalInterest,
      totalPayment: grandTotal,
      firstPeriodPayment,
      lastPeriodPayment,
      totalPeriods
    };
  }, [loanAmount, tenorMonths, interestRateYear, disbursementDate, repaymentCycleId, repaymentDay, roundingMode, loanCalculator.repaymentCycles]);

  // Export to CSV helper
  const exportToCSV = () => {
    if (!scheduleData.periods.length) return;
    const headers = ['Kỳ', 'Ngày trả nợ', 'Dư nợ đầu kỳ (VND)', 'Gốc phải trả (VND)', 'Lãi phải trả (VND)', 'Tổng trả kỳ (VND)', 'Dư nợ còn lại (VND)'];
    const rows = scheduleData.periods.map(p => [
      p.periodNumber,
      p.paymentDate,
      p.beginningBalance,
      p.principal,
      p.interest,
      p.totalPayment,
      p.endingBalance
    ]);
    const summaryRow = ['TỔNG CỘNG', '', '', scheduleData.totalPrincipal, scheduleData.totalInterest, scheduleData.totalPayment, 0];
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(r => r.join(',')), summaryRow.join(',')].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Lich_tra_no_VietinBank_${loanAmount}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-[#0072CE] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block">
          Giải pháp vay vốn ưu đãi
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {loanCalculator.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          {loanCalculator.subtitle} - Lãi giảm dần theo thời gian, tối ưu tổng chi phí lãi vay
        </p>
      </div>

      {/* Input Parameters Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#0072CE]" />
            <span>Bước 1: Nhập thông tin khoản vay</span>
          </h3>
          <span className="text-xs text-[#0072CE] font-semibold bg-blue-50 px-2.5 py-1 rounded-md">
            Lãi tính trên dư nợ giảm dần
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Field: Property / Collateral Value */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Giá trị bất động sản / Tài sản bảo đảm (tham khảo)
            </label>
            <div className="relative">
              <input
                type="text"
                value={assetValueStr}
                onChange={handleAssetValueChange}
                placeholder="2,000,000,000"
                className="w-full text-sm sm:text-base font-bold text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100 transition-all outline-hidden pr-16"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                VND
              </span>
            </div>
            {assetValue > 0 && loanAmount > 0 && (
              <span className="text-[11px] text-slate-500">
                Tỷ lệ vay / tài sản: <strong className="text-[#0072CE]">{Math.round((loanAmount / assetValue) * 100)}%</strong> (Hỗ trợ tối đa 85%)
              </span>
            )}
          </div>

          {/* Field: Loan Amount (INPUT FIELD ONLY per PDF 3 STRICT RULE: "phần số tiền vay thiết kế lại, không để dạng kéo thả, mà để dạng nhập") */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Số tiền vay (bắt buộc nhập) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={loanAmountStr}
                onChange={handleLoanAmountChange}
                placeholder="1,000,000,000"
                className="w-full text-base sm:text-lg font-black text-[#003B70] px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100 transition-all outline-hidden pr-16"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                VND
              </span>
            </div>
            {/* Quick shortcuts */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickLoanAmounts.map(q => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => {
                    setLoanAmount(q.value);
                    setLoanAmountStr(q.value.toLocaleString('vi-VN'));
                  }}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    loanAmount === q.value
                      ? 'bg-[#003B70] text-white border-[#003B70]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field: Tenor in months */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Thời gian vay (Tháng) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="420"
                value={tenorMonths}
                onChange={(e) => setTenorMonths(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-sm font-bold text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                = {(tenorMonths / 12).toFixed(1)} năm
              </span>
            </div>
            <div className="flex gap-1.5 pt-0.5">
              {[12, 24, 36, 60, 120, 240].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTenorMonths(m)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border cursor-pointer ${
                    tenorMonths === m
                      ? 'bg-[#0072CE] text-white border-[#0072CE]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m < 12 ? `${m}T` : `${m / 12} năm`}
                </button>
              ))}
            </div>
          </div>

          {/* Field: Interest Rate (%/year) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Lãi suất (%/Năm) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={interestRateYear}
                onChange={(e) => setInterestRateYear(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-bold text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100 outline-hidden pr-16"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                %/Năm
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Lãi suất kỳ tương ứng: <strong>{(interestRateYear / (repaymentCycleId === 'monthly' ? 12 : repaymentCycleId === 'quarterly' ? 4 : repaymentCycleId === 'semiAnnual' ? 2 : 1)).toFixed(3)}%/kỳ</strong>
            </span>
          </div>

          {/* Field: Disbursement Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Ngày giải ngân
            </label>
            <div className="relative">
              <input
                type="date"
                value={disbursementDate}
                onChange={(e) => setDisbursementDate(e.target.value)}
                className="w-full text-sm font-semibold text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>
          </div>

          {/* Field: Repayment Cycle (Hằng tháng, Hằng quý, 6 tháng, Hằng năm) per PDF 3 */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Chu kỳ trả nợ
            </label>
            <select
              value={repaymentCycleId}
              onChange={(e) => setRepaymentCycleId(e.target.value)}
              className="w-full text-sm font-semibold text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100 outline-hidden bg-white"
            >
              {loanCalculator.repaymentCycles.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Quy đổi lãi suất: Năm / {c.divisor})
                </option>
              ))}
            </select>
          </div>

          {/* Field: Repayment day of month */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Ngày trả nợ định kỳ hằng tháng/kỳ
            </label>
            <select
              value={repaymentDay}
              onChange={(e) => setRepaymentDay(parseInt(e.target.value, 10))}
              className="w-full text-sm font-semibold text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100 outline-hidden bg-white"
            >
              {[5, 10, 15, 20, 25, 28].map(d => (
                <option key={d} value={d}>
                  Ngày {d} hằng kỳ {d === 25 ? '(Khuyên dùng)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Field: Rounding rule per PDF 3 */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Quy tắc làm tròn số
            </label>
            <select
              value={roundingMode}
              onChange={(e) => setRoundingMode(e.target.value as any)}
              className="w-full text-sm font-semibold text-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100 outline-hidden bg-white"
            >
              <option value="thousand">Làm tròn đến 1.000 đồng (chuẩn ngân hàng)</option>
              <option value="exact">Làm tròn đến đơn vị đồng</option>
            </select>
            <span className="text-[11px] text-slate-500 block">
              * Sai lệch do làm tròn được điều chỉnh vào kỳ trả nợ cuối cùng.
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards & "Xem chi tiết" CTA per PDF 3 */}
      <div className="bg-gradient-to-br from-[#003B70] via-[#005596] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-4">
          <div>
            <span className="text-xs font-semibold text-cyan-200 tracking-wider uppercase">
              Tổng quan kế hoạch trả nợ
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              Khoản vay {loanAmount.toLocaleString('vi-VN')} VND ({tenorMonths} tháng)
            </h3>
          </div>
          
          <button
            onClick={() => setShowDetailModal(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
          >
            <Receipt className="w-4 h-4" />
            <span>Xem chi tiết lịch trả nợ ({scheduleData.totalPeriods} kỳ)</span>
          </button>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xs border border-white/10">
            <span className="text-xs text-blue-200">Số tiền trả kỳ đầu (cao nhất):</span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
              {scheduleData.firstPeriodPayment.toLocaleString('vi-VN')} <span className="text-xs font-medium text-white">VND</span>
            </div>
            <p className="text-[11px] text-blue-200 mt-1">
              Gốc: {(scheduleData.periods[0]?.principal || 0).toLocaleString('vi-VN')} + Lãi: {(scheduleData.periods[0]?.interest || 0).toLocaleString('vi-VN')}
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xs border border-white/10">
            <span className="text-xs text-blue-200">Số tiền trả kỳ cuối:</span>
            <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-1">
              {scheduleData.lastPeriodPayment.toLocaleString('vi-VN')} <span className="text-xs font-medium text-white">VND</span>
            </div>
            <p className="text-[11px] text-blue-200 mt-1">
              (Số tiền giảm dần theo thời gian)
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xs border border-white/10">
            <span className="text-xs text-blue-200">Tổng lãi phải trả cả kỳ:</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {scheduleData.totalInterest.toLocaleString('vi-VN')} <span className="text-xs font-medium text-white">VND</span>
            </div>
            <p className="text-[11px] text-emerald-300 mt-1">
              Tiết kiệm hơn so với trả góp đều
            </p>
          </div>

          <div className="bg-white/15 rounded-2xl p-4 backdrop-blur-xs border border-white/20">
            <span className="text-xs text-blue-200">Tổng gốc + Lãi đã trả:</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {scheduleData.totalPayment.toLocaleString('vi-VN')} <span className="text-xs font-medium text-white">VND</span>
            </div>
            <p className="text-[11px] text-blue-200 mt-1">
              (Gốc: {loanAmount.toLocaleString('vi-VN')})
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: BẢNG TÍNH LỊCH TRẢ NỢ VỚI DƯ NỢ GIẢM DẦN per PDF 3 */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  <span>Bảng tính lịch trả nợ với dư nợ giảm dần</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Khoản vay: {loanAmount.toLocaleString('vi-VN')} VND • Lãi suất: {interestRateYear}%/năm • Tổng {scheduleData.totalPeriods} kỳ
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportToCSV}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  title="Xuất bảng tính CSV"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Xuất CSV</span>
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Table Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-300 shadow-2xs">
                  <tr>
                    <th className="py-2.5 px-2.5 text-center">Kỳ</th>
                    <th className="py-2.5 px-3">Kỳ trả nợ</th>
                    <th className="py-2.5 px-3 text-right">Số gốc còn lại</th>
                    <th className="py-2.5 px-3 text-right">Gốc</th>
                    <th className="py-2.5 px-3 text-right">Lãi</th>
                    <th className="py-2.5 px-3 text-right font-black text-[#003B70]">Tổng gốc + Lãi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Row 0: Initial Disbursement per Screenshot in PDF 3 */}
                  <tr className="bg-slate-50/60 font-semibold text-slate-600">
                    <td className="py-2 px-2.5 text-center">0</td>
                    <td className="py-2 px-3">{new Date(disbursementDate).toLocaleDateString('vi-VN')} (Giải ngân)</td>
                    <td className="py-2 px-3 text-right">{loanAmount.toLocaleString('vi-VN')}</td>
                    <td className="py-2 px-3 text-right">-</td>
                    <td className="py-2 px-3 text-right">-</td>
                    <td className="py-2 px-3 text-right font-mono">-</td>
                  </tr>

                  {scheduleData.periods.map((p) => (
                    <tr key={p.periodNumber} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2 px-2.5 text-center font-medium text-slate-600">{p.periodNumber}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">{p.paymentDate}</td>
                      <td className="py-2 px-3 text-right text-slate-600">{p.beginningBalance.toLocaleString('vi-VN')}</td>
                      <td className="py-2 px-3 text-right font-medium text-slate-900">{p.principal.toLocaleString('vi-VN')}</td>
                      <td className="py-2 px-3 text-right text-amber-700 font-medium">{p.interest.toLocaleString('vi-VN')}</td>
                      <td className="py-2 px-3 text-right font-bold text-[#003B70]">{p.totalPayment.toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
                {/* Total Row per PDF 3 screenshot */}
                <tfoot className="sticky bottom-0 bg-[#003B70] text-white font-extrabold text-xs">
                  <tr>
                    <td colSpan={2} className="py-3 px-3 uppercase tracking-wider text-center">TỔNG CỘNG</td>
                    <td className="py-3 px-3 text-right text-blue-200">-</td>
                    <td className="py-3 px-3 text-right">{scheduleData.totalPrincipal.toLocaleString('vi-VN')}</td>
                    <td className="py-3 px-3 text-right text-amber-300">{scheduleData.totalInterest.toLocaleString('vi-VN')}</td>
                    <td className="py-3 px-3 text-right text-amber-300 font-black">{scheduleData.totalPayment.toLocaleString('vi-VN')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <span className="italic">
                * Bảng tính mang tính chất tham khảo. Lịch trả nợ chính xác theo hợp đồng tín dụng ký kết tại VietinBank.
              </span>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors cursor-pointer"
              >
                Đóng bảng tính
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
