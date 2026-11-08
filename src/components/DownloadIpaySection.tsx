import React, { useState } from 'react';
import contentData from '../data/contentData.json';
import { getQrCodeUrl } from '../utils/qrGenerator';
import { 
  Apple, 
  Smartphone, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Percent, 
  CreditCard,
  QrCode,
  Check
} from 'lucide-react';

export const DownloadIpaySection: React.FC = () => {
  const { downloadIpay } = contentData;
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopy = (url: string, platform: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(platform);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const featureIcons = [
    <Zap key="1" className="w-6 h-6 text-[#0072CE]" />,
    <Percent key="2" className="w-6 h-6 text-emerald-600" />,
    <ShieldCheck key="3" className="w-6 h-6 text-[#003B70]" />,
    <CreditCard key="4" className="w-6 h-6 text-amber-600" />
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-[#0072CE] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block">
          {downloadIpay.title}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {downloadIpay.subtitle}
        </h2>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {downloadIpay.description}
        </p>
      </div>

      {/* 2 Download Cards for iOS and Android */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* iOS Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-[#0072CE]/60 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-sm">
                  <Apple className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Apple iOS</h3>
                  <p className="text-xs text-slate-500">iPhone / iPad</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">
                App Store
              </span>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="w-44 h-44 bg-white p-2.5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-center">
                <img
                  src={getQrCodeUrl(downloadIpay.ios.url, 200)}
                  alt="QR tải App VietinBank iPay cho iPhone"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 mt-2.5 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-[#0072CE]" />
                Quét mã để tải trên iPhone
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-6">
            <a
              href={downloadIpay.ios.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Apple className="w-4 h-4" />
              <span>{downloadIpay.ios.badge}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            
            <button
              onClick={() => handleCopy(downloadIpay.ios.url, 'ios')}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink === 'ios' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Đã sao chép liên kết App Store</span>
                </>
              ) : (
                <span>Sao chép liên kết tải iOS</span>
              )}
            </button>
          </div>
        </div>

        {/* Android Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-[#0072CE]/60 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Google Android</h3>
                  <p className="text-xs text-slate-500">Samsung, Xiaomi, Oppo...</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                Google Play
              </span>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="w-44 h-44 bg-white p-2.5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-center">
                <img
                  src={getQrCodeUrl(downloadIpay.android.url, 200)}
                  alt="QR tải App VietinBank iPay cho Android"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 mt-2.5 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                Quét mã để tải trên Android
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-6">
            <a
              href={downloadIpay.android.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloadIpay.android.badge}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <button
              onClick={() => handleCopy(downloadIpay.android.url, 'android')}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink === 'android' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Đã sao chép liên kết Google Play</span>
                </>
              ) : (
                <span>Sao chép liên kết tải Android</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Highlights / Features grid */}
      <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-6">
        <div className="text-center">
          <h3 className="font-extrabold text-lg text-slate-900">
            Lợi ích vượt trội khi sử dụng VietinBank iPay
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Mở tài khoản thanh toán số đẹp trực tuyến chỉ trong 1 phút bằng CCCD gắn chip
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {downloadIpay.features.map((f, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                {featureIcons[i % featureIcons.length]}
              </div>
              <h4 className="font-bold text-sm text-slate-900">{f.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
