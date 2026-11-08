import React from 'react';
import { Phone } from 'lucide-react';
import contentData from '../data/contentData.json';

interface FooterProps {
  onSelectTab: (tabId: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  const { brand } = contentData;

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={brand.logo}
                alt="VietinBank"
                className="h-9 w-auto brightness-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/giadinhbanker/anh-super-app-bac-phu-tho/main/Logo%20VietinBank.png';
                }}
              />
              <div>
                <p className="text-white font-extrabold text-sm">{brand.fullName}</p>
                <p className="text-slate-400 text-xs italic">{brand.slogan}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Hệ thống tương tác hỗ trợ khách hàng đa kênh tại quầy giao dịch VietinBank. Cung cấp tiện ích giải đáp iPay, dự toán tài chính, điểm giao dịch và ưu đãi độc quyền.
            </p>
          </div>

          {/* Col 2: Fast Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Tính Năng Chính</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab('faq')} className="hover:text-white transition-colors cursor-pointer">
                  1. Giải đáp thắc mắc iPay
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('download-ipay')} className="hover:text-white transition-colors cursor-pointer">
                  2. Tải App VietinBank iPay
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('game')} className="hover:text-white transition-colors cursor-pointer">
                  3. Mini Game Nhận Quà
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('savings')} className="hover:text-white transition-colors cursor-pointer">
                  4. Tính lãi suất tiền gửi
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('loan')} className="hover:text-white transition-colors cursor-pointer">
                  5. Lịch trả nợ khoản vay
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('featured')} className="hover:text-white transition-colors cursor-pointer">
                  6. Sản phẩm dịch vụ nổi bật
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('branches')} className="hover:text-white transition-colors cursor-pointer">
                  7. Mạng lưới điểm giao dịch
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Counter Officer Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Liên Hệ Quầy Giao Dịch</h4>
            <div className="space-y-2 text-xs">
              <p>
                Cán bộ tư vấn: <strong className="text-white">{brand.advisor.name}</strong>
              </p>
              <p>
                Hotline hỗ trợ: <strong className="text-amber-400">{brand.advisor.displayPhone}</strong>
              </p>
              <p>
                Tổng đài 24/7: <strong className="text-white">{brand.hotline}</strong>
              </p>
              <div className="pt-2">
                <a
                  href={`tel:${brand.advisor.phone.replace(/[^\d]/g, '')}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#005596] hover:bg-blue-600 text-white font-bold transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Gọi hỗ trợ trực tiếp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Ngân hàng TMCP Công Thương Việt Nam (VietinBank). Bản quyền thuộc về VietinBank.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Bảo mật dữ liệu</span>
            <span>•</span>
            <span>Điều khoản sử dụng</span>
            <span>•</span>
            <span>Quy định NHNN 2345/QĐ-NHNN</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
