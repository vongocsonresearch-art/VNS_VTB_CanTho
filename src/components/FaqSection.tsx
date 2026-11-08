import React, { useState } from 'react';
import { 
  KeyRound, 
  CreditCard, 
  ShieldCheck, 
  Fingerprint, 
  ArrowLeft, 
  Youtube, 
  PhoneCall, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  Smile, 
  MessageSquareWarning, 
  HeartHandshake,
  ZoomIn,
  X
} from 'lucide-react';
import contentData from '../data/contentData.json';
import { FaqItem } from '../types';

interface FaqSectionProps {
  onBackToMainMenu?: () => void;
  onOpenAdvisorModal?: () => void;
}

const iconComponentMap: Record<string, React.ReactNode> = {
  'forgot-password': <KeyRound className="w-6 h-6 text-[#005596]" />,
  'close-card': <CreditCard className="w-6 h-6 text-emerald-600" />,
  'cccd-verification': <ShieldCheck className="w-6 h-6 text-indigo-600" />,
  'biometric-update': <Fingerprint className="w-6 h-6 text-rose-600" />
};

export const FaqSection: React.FC<FaqSectionProps> = ({ onBackToMainMenu, onOpenAdvisorModal }) => {
  const { faq, brand, messages } = contentData;
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'none' | 'good' | 'bad' | 'ended'>('none');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const activeTopic = (faq.items as FaqItem[]).find((t) => t.id === selectedTopicId);

  const handleSelectTopic = (id: string) => {
    setSelectedTopicId(id);
    setFeedbackStatus('none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetToTopicMenu = () => {
    setSelectedTopicId(null);
    setFeedbackStatus('none');
  };

  const handleEndConversation = () => {
    setFeedbackStatus('ended');
  };

  return (
    <div className="py-8 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Lightbox for zooming step images */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 z-10 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedImage}
              alt="Minh họa chi tiết"
              className="max-h-[85vh] w-auto mx-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Main View: Topic List */}
      {!activeTopic ? (
        <div className="space-y-6">
          {/* Header question */}
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-[#005596]">
              <HelpCircle className="w-3.5 h-3.5" />
              Cấu phần 1: Trợ lý giải đáp tại quầy
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {messages.faqQuestion}
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
              {faq.subtitle}
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
            {faq.items.map((topic, index) => (
              <div
                key={topic.id}
                onClick={() => handleSelectTopic(topic.id)}
                className="group relative bg-white border border-slate-200 hover:border-[#005596] rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-125 transition-transform duration-500 -z-0" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {iconComponentMap[topic.id] || <HelpCircle className="w-6 h-6 text-[#005596]" />}
                    </div>
                    <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-[#005596] transition-colors">
                      Bước {topic.steps.length}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#005596] transition-colors flex items-center gap-2">
                      <span>{index + 1}. {topic.title}</span>
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-[#005596]">
                  <span>Xem hướng dẫn ({topic.steps.length} bước)</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-[#005596] group-hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Help Box */}
          <div className="bg-linear-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#005596] text-white flex items-center justify-center shrink-0">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Quý khách cần hỗ trợ thêm vấn đề khác?</p>
                <p className="text-xs text-slate-600">
                  Cán bộ trực tiếp tại quầy: <strong className="text-[#005596]">{brand.advisor.name}</strong> luôn sẵn sàng trợ giúp.
                </p>
              </div>
            </div>
            <a
              href={`tel:${brand.advisor.phone.replace(/[^\d]/g, '')}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#005596] hover:bg-[#004175] text-white text-sm font-bold shadow-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Gọi ngay: {brand.advisor.displayPhone}</span>
            </a>
          </div>
        </div>
      ) : (
        /* Detailed Step-by-Step Guide View */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Navigation bar inside topic */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200">
            <button
              onClick={handleResetToTopicMenu}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#005596] hover:text-[#004175] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại danh mục câu hỏi</span>
            </button>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Tổng số {activeTopic.steps.length} bước thực hiện
            </span>
          </div>

          {/* Topic Title Header */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                {iconComponentMap[activeTopic.id] || <HelpCircle className="w-6 h-6 text-[#005596]" />}
              </div>
              <div>
                <span className="text-xs font-bold text-[#005596] uppercase tracking-wider">Hướng dẫn chi tiết</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{activeTopic.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{activeTopic.description}</p>
              </div>
            </div>

            {activeTopic.videoUrl && (
              <a
                href={activeTopic.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer"
              >
                <Youtube className="w-5 h-5 text-white" />
                <span>Xem Video YouTube</span>
              </a>
            )}
          </div>

          {/* Step list with illustrated images */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-6 bg-[#005596] rounded-full inline-block" />
              Các bước thực hiện
            </h3>

            <div className="grid grid-cols-1 gap-6">
              {activeTopic.steps.map((step) => (
                <div
                  key={step.step}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start"
                >
                  {/* Step Image */}
                  <div 
                    onClick={() => setZoomedImage(step.image)}
                    className="relative group w-full md:w-64 lg:w-72 shrink-0 aspect-4/3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 cursor-zoom-in"
                  >
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/giadinhbanker/anh-super-app-bac-phu-tho/main/1.1.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[1px]">
                      <ZoomIn className="w-4 h-4" />
                      <span>Nhấn để phóng to</span>
                    </div>
                  </div>

                  {/* Step Description */}
                  <div className="space-y-3 flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-[#005596] text-xs font-bold">
                      <span>{step.title}</span>
                    </div>

                    <p className="text-base text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                      {step.content}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Thực hiện đúng theo màn hình điện thoại của bạn</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* YouTube Video Banner at the end */}
          {activeTopic.videoUrl && (
            <div className="bg-linear-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Youtube className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Xem video thao tác thực tế</h4>
                  <p className="text-xs text-slate-600">
                    Theo dõi video trực quan từng thao tác vuốt, nhập liệu và xác thực khuôn mặt trên YouTube.
                  </p>
                </div>
              </div>
              <a
                href={activeTopic.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <Youtube className="w-5 h-5" />
                <span>Mở App YouTube xem Video</span>
              </a>
            </div>
          )}

          {/* Customer Satisfaction Question Section (Required by PDF 1) */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {feedbackStatus === 'none' && (
              <div className="text-center space-y-4">
                <h4 className="text-xl font-extrabold text-white">
                  {messages.feedbackQuestion}
                </h4>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Hãy cho chúng tôi biết kết quả thao tác của Quý khách để được hỗ trợ chu đáo nhất.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setFeedbackStatus('good')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all cursor-pointer shadow-lg hover:scale-102"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Đã ổn</span>
                  </button>

                  <button
                    onClick={() => setFeedbackStatus('bad')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-all cursor-pointer shadow-lg hover:scale-102"
                  >
                    <MessageSquareWarning className="w-5 h-5" />
                    <span>Chưa ổn</span>
                  </button>
                </div>
              </div>
            )}

            {/* When Good: prompt to return to main menu or end chat */}
            {feedbackStatus === 'good' && (
              <div className="text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-emerald-300">
                  {messages.feedbackSuccess}
                </h4>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    onClick={handleResetToTopicMenu}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005596] hover:bg-blue-600 text-white font-bold text-sm cursor-pointer shadow-md transition-all"
                  >
                    <span>Quay lại menu chính</span>
                  </button>
                  <button
                    onClick={handleEndConversation}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm cursor-pointer transition-all"
                  >
                    <span>Kết thúc cuộc trò chuyện</span>
                  </button>
                </div>
              </div>
            )}

            {/* When Bad: show contact Tran Hoang Trung */}
            {feedbackStatus === 'bad' && (
              <div className="space-y-4 animate-in zoom-in-95 duration-200 bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-bold text-white text-base">Thông tin hỗ trợ trực tiếp</h5>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {messages.feedbackNeedHelp}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={`tel:${brand.advisor.phone.replace(/[^\d]/g, '')}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md cursor-pointer transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Gọi {brand.advisor.name} ({brand.advisor.displayPhone})</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetToTopicMenu}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer transition-all"
                    >
                      <span>Quay lại menu chính</span>
                    </button>
                    <button
                      onClick={handleEndConversation}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold cursor-pointer transition-all"
                    >
                      <span>Kết thúc cuộc trò chuyện</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* When Ended Chat */}
            {feedbackStatus === 'ended' && (
              <div className="text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto">
                  <HeartHandshake className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-blue-200">
                  {messages.endConversation}
                </h4>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      handleResetToTopicMenu();
                      if (onBackToMainMenu) onBackToMainMenu();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005596] hover:bg-blue-600 text-white font-bold text-sm cursor-pointer shadow-md transition-all"
                  >
                    <span>Quay lại trang chủ quầy giao dịch</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
