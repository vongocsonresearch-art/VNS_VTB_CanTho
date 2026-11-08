import React from 'react';
import { 
  PhoneCall, 
  UserCheck, 
  X, 
  CheckCircle
} from 'lucide-react';
import contentData from '../data/contentData.json';

interface ConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsultantModal: React.FC<ConsultantModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const { brand } = contentData;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header */}
        <div className="bg-linear-to-r from-[#005596] to-sky-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-8 h-8 text-amber-300" />
          </div>
          <h3 className="text-xl font-extrabold text-center">Chuyên Viên Tư Vấn Tại Quầy</h3>
          <p className="text-xs text-blue-200 text-center mt-1">Đồng hành & hỗ trợ trực tiếp Quý khách hàng</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <h4 className="text-2xl font-black text-slate-900">{brand.advisor.name}</h4>
            <p className="text-xs font-semibold text-[#005596] uppercase tracking-wider">{brand.advisor.title}</p>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Hỗ trợ cài đặt & xác thực sinh trắc học thẻ CCCD</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tư vấn lãi suất gửi tiết kiệm ưu đãi & mở thẻ</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dự toán hồ sơ vay vốn, tính lịch trả nợ giảm dần</span>
            </div>
          </div>

          {/* Direct call action */}
          <div className="space-y-2 pt-1">
            <a
              href={`tel:${brand.advisor.phone.replace(/[^\d]/g, '')}`}
              className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Gọi trực tiếp: {brand.advisor.displayPhone}</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
