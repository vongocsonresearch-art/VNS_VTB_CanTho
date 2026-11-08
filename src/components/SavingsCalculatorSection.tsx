import React, { useState, useMemo } from 'react';
import contentData from '../data/contentData.json';
import { 
  PiggyBank, 
  Coins, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  ExternalLink, 
  Video, 
  Sparkles,
  Check,
  Percent
} from 'lucide-react';

export const SavingsCalculatorSection: React.FC = () => {
  const { savingsCalculator } = contentData;

  // Form State
  const [depositAmount, setDepositAmount] = useState<number>(savingsCalculator.defaultAmount);
  const [amountInputStr, setAmountInputStr] = useState<string>(savingsCalculator.defaultAmount.toLocaleString('vi-VN'));
  const [selectedTermMonths, setSelectedTermMonths] = useState<number>(savingsCalculator.defaultTerm);
  const [interestRate, setInterestRate] = useState<number>(savingsCalculator.defaultRate);

  // Errors state per PDF 2 rules
  const [amountError, setAmountError] = useState<string | null>(null);
  const [termError, setTermError] = useState<string | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);

  // Quick Amount presets
  const quickAmounts = [
    { label: '20 Triệu', value: 20000000 },
    { label: '50 Triệu', value: 50000000 },
    { label: '100 Triệu', value: 100000000 },
    { label: '200 Triệu', value: 200000000 },
    { label: '500 Triệu', value: 500000000 },
    { label: '1 Tỷ', value: 1000000000 }
  ];

  // Handle Amount Text Input with formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, ''); // Clean non-digits per PDF 2 rule: "Không cho phép nhập ký tự chữ"
    if (!rawVal) {
      setDepositAmount(0);
      setAmountInputStr('');
      setAmountError(savingsCalculator.errors.invalidAmount);
      return;
    }
    const num = parseInt(rawVal, 10);
    setDepositAmount(num);
    setAmountInputStr(num.toLocaleString('vi-VN'));

    if (num < savingsCalculator.minAmount) {
      setAmountError(savingsCalculator.errors.invalidAmount);
    } else {
      setAmountError(null);
    }
  };

  const handleSelectQuickAmount = (val: number) => {
    setDepositAmount(val);
    setAmountInputStr(val.toLocaleString('vi-VN'));
    setAmountError(null);
  };

  // Handle Term Selection
  const handleTermChange = (months: number) => {
    setSelectedTermMonths(months);
    setTermError(null);
    // Auto lookup benchmark rate from table
    const found = savingsCalculator.terms.find(t => t.months === months);
    if (found) {
      setInterestRate(found.rate);
      setRateError(null);
    }
  };

  // Handle Custom Rate Input
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val) || val < 0 || val > 20) {
      setRateError(savingsCalculator.errors.invalidRate);
    } else {
      setRateError(null);
      setInterestRate(val);
    }
  };

  // Calculations: Lãi = (Số tiền * Lãi suất % * Số tháng) / 12 (hoặc Số ngày thực tế * 365)
  const calculationResults = useMemo(() => {
    if (depositAmount <= 0 || interestRate <= 0 || !selectedTermMonths) {
      return { interest: 0, total: 0 };
    }
    // Tiền gửi thông thường trả lãi sau
    const interest = Math.round((depositAmount * (interestRate / 100) * selectedTermMonths) / 12);
    const total = depositAmount + interest;
    return { interest, total };
  }, [depositAmount, interestRate, selectedTermMonths]);

  // Comparison across other terms
  const comparisonList = useMemo(() => {
    if (depositAmount <= 0) return [];
    return savingsCalculator.terms.map(t => {
      const projectedInterest = Math.round((depositAmount * (t.rate / 100) * t.months) / 12);
      return {
        ...t,
        projectedInterest,
        projectedTotal: depositAmount + projectedInterest
      };
    });
  }, [depositAmount, savingsCalculator.terms]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-[#0072CE] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block">
          Tiết kiệm thông minh
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {savingsCalculator.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          {savingsCalculator.subtitle} - Tính toán minh bạch, chính xác từng ngày
        </p>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Parameters (Left Column - 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#0072CE]" />
              <span>Thông tin khoản tiền gửi</span>
            </h3>
            <span className="text-[11px] text-slate-500">Đơn vị: VNĐ</span>
          </div>

          {/* Field 1: Deposit Amount */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Số tiền gửi (bắt buộc nhập) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={amountInputStr}
                onChange={handleAmountChange}
                placeholder="Ví dụ: 100,000,000"
                className={`w-full text-base sm:text-lg font-bold text-slate-900 px-4 py-3 rounded-xl border transition-all outline-hidden pr-16 ${
                  amountError 
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/30' 
                    : 'border-slate-300 focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                VND
              </span>
            </div>

            {/* Error / Warning if invalid */}
            {amountError && (
              <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{amountError}</span>
              </p>
            )}

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickAmounts.map(qa => (
                <button
                  key={qa.value}
                  type="button"
                  onClick={() => handleSelectQuickAmount(qa.value)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    depositAmount === qa.value
                      ? 'bg-[#003B70] text-white border-[#003B70]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field 2: Term Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Kỳ hạn gửi (bắt buộc chọn) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {savingsCalculator.terms.map(t => (
                <button
                  key={t.months}
                  type="button"
                  onClick={() => handleTermChange(t.months)}
                  className={`py-2 px-1 text-center rounded-xl border transition-all cursor-pointer ${
                    selectedTermMonths === t.months
                      ? 'bg-gradient-to-b from-[#003B70] to-[#005596] text-white border-transparent shadow-xs font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 font-medium'
                  }`}
                >
                  <div className="text-xs">{t.label}</div>
                  <div className={`text-[10px] mt-0.5 ${selectedTermMonths === t.months ? 'text-cyan-200' : 'text-[#0072CE]'}`}>
                    {t.rate}%/năm
                  </div>
                </button>
              ))}
            </div>
            {termError && (
              <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{termError}</span>
              </p>
            )}
          </div>

          {/* Field 3: Interest Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Lãi suất áp dụng (%/năm) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-600 font-medium">
                Biểu lãi suất niêm yết VietinBank
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0"
                max="20"
                value={interestRate}
                onChange={handleRateChange}
                className={`w-full text-base font-bold text-slate-900 px-4 py-2.5 rounded-xl border transition-all outline-hidden pr-20 ${
                  rateError 
                    ? 'border-rose-400 bg-rose-50/30' 
                    : 'border-slate-300 focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                %/năm
              </span>
            </div>
            {rateError && (
              <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{rateError}</span>
              </p>
            )}
          </div>

          {/* Note on Online iPay Savings Bonus */}
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/80 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-800 leading-relaxed">
              <strong>Mẹo gia tăng lợi nhuận:</strong> Gửi tiết kiệm trực tuyến qua <strong>VietinBank iPay</strong> được cộng thêm tới <strong>0.2% - 0.4%/năm</strong> so với gửi tại quầy!
            </p>
          </div>
        </div>

        {/* Calculation Result Summary (Right Column - 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-[#003B70] via-[#005596] to-blue-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

            <div className="space-y-1 border-b border-white/15 pb-4">
              <span className="text-xs font-semibold text-cyan-200 tracking-wider uppercase">
                Kết Quả Dự Tính
              </span>
              <h3 className="text-lg font-bold text-white">
                Tiền gửi tiết kiệm trả lãi sau
              </h3>
            </div>

            <div className="space-y-4">
              {/* Principal */}
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-xs text-blue-100">Tiền gửi gốc:</span>
                <div className="text-xl font-extrabold text-white mt-0.5">
                  {depositAmount.toLocaleString('vi-VN')} <span className="text-xs font-medium text-blue-200">VND</span>
                </div>
              </div>

              {/* Interest */}
              <div className="bg-gradient-to-r from-amber-400/20 to-amber-500/20 border border-amber-300/40 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-xs font-semibold text-amber-200">Tiền lãi dự tính nhận được:</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-0.5">
                  +{calculationResults.interest.toLocaleString('vi-VN')} <span className="text-xs font-bold text-amber-200">VND</span>
                </div>
                <span className="text-[11px] text-blue-100 block mt-1">
                  Kỳ hạn {selectedTermMonths} tháng ({interestRate}%/năm)
                </span>
              </div>

              {/* Total Maturity */}
              <div className="bg-white/15 rounded-2xl p-4 backdrop-blur-xs border border-white/20">
                <span className="text-xs font-semibold text-cyan-200">Tổng tiền nhận được khi đáo hạn:</span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {calculationResults.total.toLocaleString('vi-VN')} <span className="text-xs font-medium text-blue-200">VND</span>
                </div>
                <span className="text-[11px] text-blue-200 block mt-0.5">
                  (Bao gồm toàn bộ Gốc + Tiền lãi)
                </span>
              </div>
            </div>

            {/* Video Tutorial Link from PDF 2 */}
            {savingsCalculator.videoGuide && (
              <a
                href={savingsCalculator.videoGuide.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <Video className="w-4 h-4 text-rose-300" />
                <span>Xem Video hướng dẫn gửi tiết kiệm</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Across Terms Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-extrabold text-base text-slate-900">
              Bảng so sánh tiền lãi theo các kỳ hạn khác nhau
            </h4>
            <p className="text-xs text-slate-500">
              Với số tiền gửi <strong className="text-slate-800">{depositAmount.toLocaleString('vi-VN')} VND</strong>
            </p>
          </div>
          <span className="text-xs text-[#0072CE] font-semibold bg-blue-50 px-2.5 py-1 rounded-lg">
            Cập nhật lãi suất niêm yết
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Kỳ hạn</th>
                <th className="py-2.5 px-3 font-semibold">Lãi suất niêm yết</th>
                <th className="py-2.5 px-3 font-semibold">Tiền lãi dự tính</th>
                <th className="py-2.5 px-3 font-semibold">Tổng tiền khi đáo hạn</th>
                <th className="py-2.5 px-3 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonList.map((row) => {
                const isSelected = row.months === selectedTermMonths;
                return (
                  <tr 
                    key={row.months}
                    className={`hover:bg-blue-50/40 transition-colors ${isSelected ? 'bg-blue-50/70 font-semibold text-[#003B70]' : 'text-slate-700'}`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]"></span>}
                        <span>{row.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#0072CE] font-bold">
                      {row.rate}%/năm
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-700">
                      +{row.projectedInterest.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="py-3 px-3 text-slate-900 font-bold">
                      {row.projectedTotal.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleTermChange(row.months)}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#003B70] text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Đang chọn' : 'Chọn kỳ này'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
