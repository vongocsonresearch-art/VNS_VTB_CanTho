import React from 'react';
import contentData from '../data/contentData.json';
import { Phone, User, Clock, ShieldCheck, X, MessageSquare, Building } from 'lucide-react';

interface AdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvisorModal: React.FC<AdvisorModalProps> = ({ isOpen, onClose }) => {
  const { brand } = contentData;

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-6 border border-slate-200 text-left relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#003B70] to-[#0072CE] text-white flex items-center justify-center shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0072CE]">
              Hỗ Trợ Trực Tiếp Tại Quầy
            </span>
            <h3 className="font-extrabold text-lg text-slate-900">
              {brand.advisor.title}
            </h3>
          </div>
        </div>

        {/* Advisor Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Họ và tên cán bộ:</span>
            <span className="font-extrabold text-sm text-slate-900">{brand.advisor.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Số điện thoại / Zalo:</span>
            <a 
              href={`tel:${brand.advisor.phone}`} 
              className="font-mono font-bold text-sm text-[#0072CE] hover:underline"
            >
              {brand.advisor.displayPhone}
            </a>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Tổng đài 24/7:</span>
            <span className="font-mono font-bold text-sm text-slate-800">{brand.hotline}</span>
          </div>
        </div>

        {/* Service Commitment */}
        <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Hỗ trợ mở tài khoản số đẹp, cài đặt sinh trắc học và xử lý giao dịch khẩn cấp.</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-[#0072CE] shrink-0 mt-0.5" />
            <span>Phục vụ trong giờ hành chính từ Thứ 2 đến Thứ 6.</span>
          </div>
        </div>

        {/* Action Call Button */}
        <div className="space-y-2 pt-2">
          <a
            href={`tel:${brand.advisor.phone}`}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#003B70] to-[#0072CE] hover:from-[#002850] hover:to-[#005596] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Phone className="w-4 h-4 animate-bounce" />
            <span>Gọi ngay: {brand.advisor.displayPhone}</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
