import React, { useState } from 'react';
import { 
  Smartphone, 
  Apple, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Gift, 
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';
import contentData from '../data/contentData.json';

export const DownloadAppSection: React.FC = () => {
  const { downloadIpay } = contentData;
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android'>('ios');
  const [copiedLink, setCopiedLink] = useState(false);

  const currentPlatform = activePlatform === 'ios' ? downloadIpay.ios : downloadIpay.android;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentPlatform.url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // High-reliability QR Code generator
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentPlatform.url)}&bgcolor=ffffff&color=005596&qzone=2`;

  return (
    <div className="py-8 px-4 sm:px-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-[#005596]">
          <Smartphone className="w-3.5 h-3.5" />
          Cấu phần 2: Tải App Ngân Hàng Số
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          {downloadIpay.title}
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          {downloadIpay.description}
        </p>
      </div>

      {/* Main Download Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Platform Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-2">
          <button
            onClick={() => setActivePlatform('ios')}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activePlatform === 'ios'
                ? 'bg-white text-slate-900 shadow-md border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Apple className="w-5 h-5 text-slate-900" />
            <span>iPhone / iPad (App Store)</span>
          </button>
          <button
            onClick={() => setActivePlatform('android')}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activePlatform === 'android'
                ? 'bg-white text-emerald-800 shadow-md border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
              G
            </div>
            <span>Android (Google Play)</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* QR Code Presentation Box */}
          <div className="md:col-span-5 flex flex-col items-center text-center space-y-4">
            <div className="relative p-4 bg-white rounded-2xl border-2 border-dashed border-[#005596]/40 shadow-inner group">
              <img
                src={qrCodeUrl}
                alt={`Mã QR tải ứng dụng cho ${currentPlatform.name}`}
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center">
                  <img
                    src="./assets/Logo_VietinBank.png"
                    alt="VietinBank"
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/giadinhbanker/anh-super-app-bac-phu-tho/main/Logo%20VietinBank.png';
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">
                Quét mã QR bằng Camera điện thoại
              </p>
              <p className="text-xs text-slate-500">
                Tự động điều hướng đến kho ứng dụng chính thức
              </p>
            </div>
          </div>

          {/* Link details & Actions */}
          <div className="md:col-span-7 space-y-5">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#005596] border border-blue-200">
                {currentPlatform.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {currentPlatform.name}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ứng dụng VietinBank iPay hoàn toàn bảo mật và miễn phí cài đặt. Đăng nhập dễ dàng bằng số điện thoại hoặc tài khoản quầy vừa mở.
              </p>
            </div>

            {/* Direct buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={currentPlatform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#005596] hover:bg-[#004175] text-white font-bold text-sm shadow-lg shadow-blue-900/20 transition-all cursor-pointer"
              >
                <span>{currentPlatform.badge}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all cursor-pointer border border-slate-200"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Đã sao chép link!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>Sao chép link tải</span>
                  </>
                )}
              </button>
            </div>

            {/* Official App verification badge */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-800 leading-snug">
                <strong>An toàn tuyệt đối:</strong> Ứng dụng chính chủ do Ngân hàng TMCP Công Thương Việt Nam phát hành.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {downloadIpay.features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#005596] flex items-center justify-center">
                {index === 0 ? <Zap className="w-5 h-5" /> :
                 index === 1 ? <Gift className="w-5 h-5" /> :
                 index === 2 ? <ShieldCheck className="w-5 h-5" /> :
                 <CheckCircle className="w-5 h-5" />}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{feature.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
