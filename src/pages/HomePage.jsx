import React from 'react';
import { Hero } from '@/components/ui/hero-1';
import ApplicationsGridSection from '@/components/ApplicationsGridSection';
import DataVisionSection from '@/components/DataVisionSection';
import CommunityOrbitDemo from '@/components/ui/builders-community-hero-demo';

export default function HomePage({ onOpenExpertModal, onNavigate, onSelectApp }) {
  const scrollToApplications = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const section = document.getElementById('applications-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#e8e8e8] text-slate-900" style={{ backgroundColor: '#e8e8e8' }}>
      {/* 1st Page: Hero Section */}
      <Hero 
        title="The New Standard of"
        highlightText="Digital Industry"
        subtitle="Use Accurate Data to Get a 360-Degree View of Your Business. Accelerate decisions with industrial-grade intelligence."
        ctaLabel="Learn More"
        ctaHref="#applications-section"
        onCtaClick={scrollToApplications}
        showMarquee={true}
      />
      
      {/* 2nd Page: Applications & Platforms Grid (Odoo Style) */}
      <section 
        id="applications-section" 
        className="w-full min-h-screen bg-[#e8e8e8] flex flex-col items-center justify-center"
        style={{ backgroundColor: '#e8e8e8' }}
      >
        <ApplicationsGridSection 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      </section>

      {/* 3rd Page: Data Vision / Higher Grounds Section */}
      <section 
        id="data-vision-section" 
        className="w-full min-h-screen bg-[#e8e8e8] flex flex-col items-center justify-center"
        style={{ backgroundColor: '#e8e8e8' }}
      >
        <DataVisionSection />
      </section>

      {/* 4th Page: Builders Community Orbit Hero */}
      <section 
        id="community-section" 
        className="w-full min-h-[72vh] md:min-h-screen flex flex-col overflow-hidden bg-white"
        style={{ backgroundColor: '#ffffff' }}
      >
        <CommunityOrbitDemo />
      </section>
    </div>
  );
}

