import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  ExternalLink, 
  Clock, 
  Building2, 
  Navigation, 
  Search
} from 'lucide-react';
import contentData from '../data/contentData.json';
import { BranchItem, LocationItem } from '../types';
import { isBranchOpenNow } from '../utils/formatters';

export const BranchesSection: React.FC = () => {
  const { branches, brand } = contentData;
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches.selectedDefault || 'kcn-trang-bang');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentBranch = (branches.branchesList as BranchItem[]).find((b) => b.id === selectedBranchId) || branches.branchesList[0];
  const openStatus = isBranchOpenNow();

  const filteredLocations = currentBranch.locations.filter((loc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return loc.name.toLowerCase().includes(q) || loc.address.toLowerCase().includes(q) || loc.phone.includes(q);
  });

  return (
    <div className="py-8 px-4 sm:px-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-[#005596] border border-blue-200">
          <MapPin className="w-3.5 h-3.5" />
          Cấu phần 7: Mạng lưới điểm giao dịch
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          {branches.title}
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          {branches.subtitle}
        </p>
      </div>

      {/* Working Hours Card (From PDF 4) */}
      <div className="bg-linear-to-r from-blue-900 via-[#005596] to-sky-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
            <Clock className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold">Thời gian giao dịch tại quầy</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                openStatus.isOpen ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-400 text-amber-950'
              }`}>
                {openStatus.statusText}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">
              {brand.businessHours.weekday}
            </p>
            <p className="text-xs text-blue-200 mt-0.5">
              {brand.businessHours.weekend}
            </p>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-3.5 px-5 backdrop-blur-xs text-center shrink-0 border border-white/15">
          <p className="text-xs text-blue-200 font-medium">Tổng đài hỗ trợ 24/7</p>
          <a
            href="tel:1900558868"
            className="text-lg sm:text-xl font-black text-amber-300 hover:text-white transition-colors"
          >
            {brand.hotline}
          </a>
        </div>
      </div>

      {/* Branch Selector Tabs (From PDF 4: KCN Trảng Bàng, Bắc Đà Nẵng, Hội An...) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {branches.branchesList.map((branch) => {
              const isSelected = selectedBranchId === branch.id;
              return (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#005596] text-white shadow-lg shadow-blue-900/20'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{branch.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {branch.province}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên PGD, đường phố..."
              className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-[#005596] focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* List of Sub-offices for selected branch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLocations.map((office: LocationItem, index: number) => (
            <div
              key={office.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Office photo */}
                <div className="relative aspect-16/9 bg-slate-100 overflow-hidden group">
                  <img
                    src={office.image}
                    alt={office.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/giadinhbanker/File_anh/refs/heads/main/Hoi-so.jfif';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-[#005596] text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                      #{index + 1}
                    </span>
                    {office.isHeadquarters && (
                      <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                        Hội sở Chi nhánh
                      </span>
                    )}
                  </div>
                </div>

                {/* Info block */}
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                    {office.name}
                  </h3>

                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{office.address}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#005596] shrink-0" />
                      <span className="font-semibold text-slate-800">
                        Số điện thoại: <strong>{office.phone}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons (Direct Google Maps navigation & Phone call as required by PDF 4) */}
              <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex flex-wrap gap-2.5">
                <a
                  href={office.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005596] font-bold text-xs sm:text-sm transition-colors cursor-pointer border border-blue-200"
                >
                  <Navigation className="w-4 h-4 text-[#005596]" />
                  <span>Chỉ đường Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>

                <a
                  href={`tel:${office.phone.replace(/[^\d]/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#005596] hover:bg-[#004175] text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Gọi ngay</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
