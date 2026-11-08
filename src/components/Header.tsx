import React, { useState, useEffect } from 'react';
import contentData from '../data/contentData.json';
import { TabType } from '../types';
import { Phone, Clock, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAdvisorModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, onOpenAdvisorModal }) => {
  const { brand } = contentData;
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' - ' + now.toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Bank Title */}
          <div 
            onClick={() => onSelectTab('faq')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="h-12 w-auto flex items-center justify-center p-1 bg-white rounded-lg shadow-xs group-hover:scale-102 transition-transform">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://raw.githubusercontent.com/giadinhbanker/anh-super-app-bac-phu-tho/main/Logo%20VietinBank.png';
                }}
              />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#003B70]">
                  {brand.name}
                </span>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#0072CE] border border-blue-200/60">
                  Kiosk Quầy Giao Dịch
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {brand.slogan} • Quầy giao dịch số thông minh
              </p>
            </div>
          </div>

          {/* Center Info - Clock & Status */}
          <div className="hidden lg:flex flex-col items-center justify-center text-xs text-slate-600 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Clock className="w-3.5 h-3.5 text-[#0072CE]" />
              <span>{time || 'Đang đồng bộ giờ...'}</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Hệ thống phục vụ khách hàng trực tuyến 24/7</span>
            </div>
          </div>

          {/* Right Action - Advisor Contact & Hotline */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onOpenAdvisorModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#003B70] to-[#0072CE] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md hover:brightness-105 active:scale-97 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 animate-bounce" />
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-blue-100 font-normal leading-tight">Cần hỗ trợ tại quầy?</div>
                <div className="font-bold text-xs">{brand.advisor.name}</div>
              </div>
              <span className="sm:hidden font-bold">Hỗ trợ</span>
            </button>
            <a
              href={`tel:${brand.advisor.phone}`}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Gọi hotline tư vấn"
            >
              <Phone className="w-4 h-4 text-rose-600" />
              <span className="hidden md:inline font-mono">{brand.advisor.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
