import React from 'react';
import contentData from '../data/contentData.json';
import { TabType } from '../types';
import { 
  HelpCircle, 
  Smartphone, 
  Gamepad2, 
  PiggyBank, 
  Calculator, 
  Sparkles, 
  MapPin 
} from 'lucide-react';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const { navigation } = contentData;

  const renderIcon = (iconName: string, active: boolean) => {
    const size = 18;
    const className = active ? 'text-white' : 'text-[#005596] group-hover:text-[#003B70]';
    switch (iconName) {
      case 'HelpCircle': return <HelpCircle size={size} className={className} />;
      case 'Smartphone': return <Smartphone size={size} className={className} />;
      case 'Gamepad2': return <Gamepad2 size={size} className={className} />;
      case 'PiggyBank': return <PiggyBank size={size} className={className} />;
      case 'Calculator': return <Calculator size={size} className={className} />;
      case 'Sparkles': return <Sparkles size={size} className={active ? 'text-amber-300' : 'text-amber-500'} />;
      case 'MapPin': return <MapPin size={size} className={className} />;
      default: return <HelpCircle size={size} className={className} />;
    }
  };

  return (
    <div className="w-full bg-slate-100/90 border-b border-slate-200/80 py-2.5 px-3 sm:px-6 sticky top-20 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        {/* Horizontal scroll container with scroll snap for touch kiosks and mobile */}
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5" aria-label="Tabs điều hướng">
          {navigation.map((item) => {
            const isActive = activeTab === item.id;
            const isFeatured = item.isHighlighted;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as TabType)}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 select-none cursor-pointer group shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#003B70] to-[#005596] text-white shadow-md shadow-blue-900/15 font-semibold'
                    : isFeatured
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950 border border-amber-300/80 hover:bg-amber-100 shadow-xs'
                    : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/70 shadow-2xs'
                }`}
              >
                {renderIcon(item.icon, isActive)}
                <span>{item.label}</span>

                {/* Highlight Badge if item is "Sản phẩm dịch vụ nổi bật" */}
                {isFeatured && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-amber-400 text-slate-900' : 'bg-red-500 text-white animate-pulse'
                  }`}>
                    Hot
                  </span>
                )}

                {item.id === 'game' && !isActive && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                    Tặng Quà
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
