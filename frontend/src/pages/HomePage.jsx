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
    <div className="w-full max-w-full flex flex-col bg-white text-slate-900 overflow-x-hidden" style={{ backgroundColor: '#ffffff' }}>
      {/* 1st Page: Hero Section */}
      <Hero
        title="The New Standard of"
        highlightText="Digital Industry"
        subtitle="Use Accurate Data to Get a 360-Degree View of Your Business. Accelerate decisions with industrial-grade intelligence."
        ctaLabel="Learn More"
        ctaHref="#applications-section"
        onCtaClick={scrollToApplications}
        secondaryCtaLabel="Explore what we can build for you"
        secondaryCtaHref="#applications-section"
        onSecondaryCtaClick={onOpenExpertModal || scrollToApplications}
        showMarquee={true}
      />

      {/* 2nd Page: Applications & Platforms Grid (Odoo Style) */}
      <section
        id="applications-section"
        className="w-full min-h-0 bg-white flex flex-col items-center justify-center overflow-x-hidden"
        style={{ backgroundColor: '#ffffff' }}
      >
        <ApplicationsGridSection
          onOpenExpertModal={onOpenExpertModal}
          onSelectApp={onSelectApp}
        />
      </section>

      {/* 3rd Page: Data Vision / Higher Grounds Section */}
      <section
        id="data-vision-section"
        className="w-full min-h-0 bg-white flex flex-col items-center overflow-x-hidden"
        style={{ backgroundColor: '#ffffff' }}
      >
        <DataVisionSection />
      </section>

      {/* 4th Page: Builders Community Orbit Hero */}
      <section
        id="community-section"
        className="w-full min-h-0 py-8 sm:py-10 lg:py-14 flex flex-col overflow-hidden bg-white"
        style={{ backgroundColor: '#ffffff' }}
      >
        <CommunityOrbitDemo />
      </section>
    </div>
  );
}

