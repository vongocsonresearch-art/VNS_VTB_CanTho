import React, { useState } from 'react';
import { 
  Gift, 
  Star, 
  Heart, 
  PhoneCall, 
  X, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  ZoomIn
} from 'lucide-react';
import contentData from '../data/contentData.json';
import { ProductItem } from '../types';

interface FeaturedProductsSectionProps {
  onOpenAdvisorModal?: () => void;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({ onOpenAdvisorModal }) => {
  const { featuredProducts, brand, messages } = contentData;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [interestedProduct, setInterestedProduct] = useState<ProductItem | null>(null);
  const [zoomedPoster, setZoomedPoster] = useState<string | null>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  const filteredItems = (featuredProducts.items as ProductItem[]).filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handlePrevCarousel = () => {
    setActiveCarouselIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNextCarousel = () => {
    setActiveCarouselIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="py-8 px-4 sm:px-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Lightbox for zooming poster */}
      {zoomedPoster && (
        <div 
          onClick={() => setZoomedPoster(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[92vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomedPoster(null)}
              className="absolute top-4 right-4 z-10 bg-slate-900/80 hover:bg-slate-900 text-white p-2.5 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedPoster}
              alt="Poster phóng to"
              className="max-h-[85vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Title Header with Gradient Accent & Thin Red Border (Design requirements from PDF 5) */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-linear-to-r from-blue-50 via-sky-50 to-indigo-50 border-2 border-red-500/30 shadow-md text-center space-y-3 overflow-hidden">
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-sm">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{featuredProducts.badge}</span>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-[#005596] shadow-xs">
          <Gift className="w-3.5 h-3.5 text-amber-500" />
          Cấu phần 6: Danh mục sản phẩm dịch vụ nổi bật
        </span>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          {featuredProducts.title}
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base font-medium">
          {featuredProducts.description}
        </p>

        {/* View Switcher */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <button
            onClick={() => setViewMode('carousel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'carousel'
                ? 'bg-[#005596] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chế độ Carousel (Vuốt trượt)
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#005596] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Dạng lưới toàn bộ
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {featuredProducts.categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setActiveCarouselIndex(0);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#005596] text-white shadow-md shadow-blue-900/20 scale-102'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* CAROUSEL MODE */}
      {viewMode === 'carousel' && filteredItems.length > 0 && (
        <div className="relative bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl overflow-hidden">
          <div className="absolute top-1/2 -translate-y-1/2 left-3 z-10">
            <button
              onClick={handlePrevCarousel}
              className="p-3 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl border border-slate-200 cursor-pointer transition-transform hover:scale-110"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-3 z-10">
            <button
              onClick={handleNextCarousel}
              className="p-3 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl border border-slate-200 cursor-pointer transition-transform hover:scale-110"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {(() => {
            const item = filteredItems[activeCarouselIndex] || filteredItems[0];
            return (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-4xl mx-auto">
                <div 
                  onClick={() => setZoomedPoster(item.image)}
                  className="md:col-span-6 relative aspect-4/3 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden cursor-zoom-in group shadow-md"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/giadinhbanker/anh-super-app-bac-phu-tho/main/Ch%E1%BA%A1m%20POS%20r%C3%BAt%20ti%E1%BB%81n.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[1px]">
                    <ZoomIn className="w-4 h-4" />
                    <span>Phóng to xem rõ chi tiết</span>
                  </div>
                  <div className="absolute top-3 left-3 bg-[#005596] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                    {item.categoryLabel}
                  </div>
                </div>

                <div className="md:col-span-6 space-y-5">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      {item.categoryLabel}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                      {item.title}
                    </h2>
                  </div>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="space-y-2 pt-1">
                    {item.highlights.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => setInterestedProduct(item)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base shadow-lg shadow-red-600/30 transition-all cursor-pointer transform hover:scale-102"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                      <span>Tôi quan tâm</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-center gap-2 pt-6">
            {filteredItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCarouselIndex(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  activeCarouselIndex === idx ? 'w-8 bg-[#005596]' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* GRID MODE */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div 
                onClick={() => setZoomedPoster(item.image)}
                className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-zoom-in group"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#005596] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {item.categoryLabel}
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    {item.categoryLabel}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.summary}</p>
                </div>

                <button
                  onClick={() => setInterestedProduct(item)}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>Tôi quan tâm</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pop-up modal khi khách bấm "Tôi quan tâm" (Required by PDF 5) */}
      {interestedProduct && (
        <div 
          onClick={() => setInterestedProduct(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Heart className="w-7 h-7 fill-current" />
              </div>
              <button
                onClick={() => setInterestedProduct(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                Yêu cầu tư vấn sản phẩm
              </span>
              <h4 className="text-xl font-extrabold text-slate-900">
                {interestedProduct.title}
              </h4>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                {messages.interestedProduct}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`tel:${brand.advisor.phone.replace(/[^\d]/g, '')}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#005596] hover:bg-[#004175] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Gọi Chuyên viên Trung ({brand.advisor.displayPhone})</span>
              </a>

              <button
                onClick={() => setInterestedProduct(null)}
                className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
