import React from 'react';
import HorizontalEcosystemVisual from './HorizontalEcosystemVisual';
import ThreeCoreSolutionsSection from './ThreeCoreSolutionsSection';

export default function TechnologyOverviewSection({ onOpenExpertModal }) {
  return (
    <section 
      id="technology"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '6rem 0 2rem',
        position: 'relative'
      }}
    >
      <div className="container-enterprise">
        
        {/* Section Introduction */}
        <div style={{ maxWidth: '820px', marginBottom: '1.5rem' }}>
          
          <div className="eyebrow-tag" style={{ marginBottom: '1rem' }}>
            OUR TECHNOLOGY
          </div>

          <h2 
            className="section-headline"
            style={{
              marginBottom: '1.5rem',
              color: '#0F172A'
            }}
          >
            Connecting the Physical World With Digital Intelligence.
          </h2>

          <p 
            className="body-large"
            style={{
              fontSize: '1.2rem',
              lineHeight: '1.75',
              color: '#475569'
            }}
          >
            We build intelligent systems that bring together machines, assets, people, networks, and data — giving organizations the visibility they need to operate smarter.
          </p>

        </div>

        {/* MAIN VISUAL: Horizontal Ecosystem Visualization */}
        <HorizontalEcosystemVisual />

        {/* THREE CORE SOLUTIONS: Large Editorial Panels */}
        <ThreeCoreSolutionsSection onOpenExpertModal={onOpenExpertModal} />

      </div>
    </section>
  );
}
