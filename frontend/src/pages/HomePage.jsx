import React from 'react';
import { Hero } from '@/components/ui/hero-1';
import OdooValuePropositionSection from '@/components/OdooValuePropositionSection';
import OdooComparisonSection from '@/components/OdooComparisonSection';
import DataVisionSection from '@/components/DataVisionSection';

export default function HomePage({ onOpenExpertModal, onNavigate, onSelectApp }) {
  const scrollToSolutions = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const section = document.getElementById('value-proposition-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="w-full max-w-full flex flex-col bg-white text-slate-900 overflow-x-hidden" 
      style={{ 
        backgroundColor: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* 1. Odoo-Style Hero Section with App Squircle Tiles */}
      <Hero
        title="All your enterprise software"
        highlightText="on one platform."
        subtitle="Simple, efficient, yet fully integrated. Run your entire operations with proprietary applications for ERP & Finance, 4M Industrial Maintenance, G-Nova IoT Telemetry, and Field Logistics."
        ctaLabel="Explore Solutions"
        ctaHref="#value-proposition-section"
        onCtaClick={scrollToSolutions}
        secondaryCtaLabel="Schedule a Demo"
        secondaryCtaHref="#value-proposition-section"
        onSecondaryCtaClick={onOpenExpertModal || scrollToSolutions}
        onSelectApp={onSelectApp}
        showMarquee={true}
      />

      {/* 3. Odoo-Style "A Unique Value Proposition" (Interactive 4-Pillar Tabs) */}
      <section
        id="value-proposition-section"
        className="w-full min-h-0 flex flex-col items-center overflow-x-hidden"
      >
        <OdooValuePropositionSection 
          onOpenExpertModal={onOpenExpertModal}
          onSelectApp={onSelectApp}
        />
      </section>

      {/* 4. Odoo-Style Telemetry & Enterprise Privacy Ingestion */}
      <section
        id="data-vision-section"
        className="w-full min-h-0 bg-white flex flex-col items-center overflow-x-hidden"
        style={{ backgroundColor: '#ffffff' }}
      >
        <DataVisionSection />
      </section>

      {/* 5. Odoo-Style "No More Integration Headaches" Comparison & Final CTA */}
      <section
        id="comparison-section"
        className="w-full min-h-0 flex flex-col items-center overflow-x-hidden bg-white"
        style={{ backgroundColor: '#ffffff' }}
      >
        <OdooComparisonSection 
          onOpenExpertModal={onOpenExpertModal}
          onExploreApps={scrollToSolutions}
        />
      </section>
    </div>
  );
}
