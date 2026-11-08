import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TabType } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { FaqSection } from './components/FaqSection';
import { DownloadIpaySection } from './components/DownloadIpaySection';
import { FlappyGameSection } from './components/FlappyGameSection';
import { SavingsCalculatorSection } from './components/SavingsCalculatorSection';
import { LoanRepaymentSection } from './components/LoanRepaymentSection';
import { FeaturedProductsSection } from './components/FeaturedProductsSection';
import { BranchesSection } from './components/BranchesSection';
import { AdvisorModal } from './components/AdvisorModal';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('faq');
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState<boolean>(false);
  const mainContentRef = useRef<HTMLElement | null>(null);

  // GSAP animation on tab change
  useEffect(() => {
    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        { opacity: 0.6, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#005596] selection:text-white">
      {/* Sticky Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAdvisorModal={() => setIsAdvisorModalOpen(true)}
      />

      {/* Sticky Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Tab Container */}
      <main ref={mainContentRef} className="flex-1 w-full">
        {activeTab === 'faq' && (
          <FaqSection onBackToMainMenu={() => handleSelectTab('faq')} />
        )}
        {activeTab === 'download-ipay' && <DownloadIpaySection />}
        {activeTab === 'game' && (
          <FlappyGameSection onBackToHome={() => handleSelectTab('faq')} />
        )}
        {activeTab === 'savings' && <SavingsCalculatorSection />}
        {activeTab === 'loan' && <LoanRepaymentSection />}
        {activeTab === 'featured' && (
          <FeaturedProductsSection onOpenAdvisorModal={() => setIsAdvisorModalOpen(true)} />
        )}
        {activeTab === 'branches' && <BranchesSection />}
      </main>

      {/* Direct Officer Advisor Modal */}
      <AdvisorModal
        isOpen={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
      />

      {/* Footer */}
      <Footer onSelectTab={handleSelectTab} />
    </div>
  );
}
