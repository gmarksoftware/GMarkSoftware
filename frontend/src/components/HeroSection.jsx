import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle, Radio, Sparkles } from 'lucide-react';
import HeroTechnologyVisual from './HeroTechnologyVisual';

export default function HeroSection({ onOpenExpertModal, onExploreSolutions }) {
  return (
    <section 
      id="hero"
      style={{
        position: 'relative',
        paddingTop: '8.5rem',
        paddingBottom: '5rem',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden'
      }}
    >
      {/* Subtle background ambient technical gradient */}
      <div 
        style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(235, 243, 252, 0.75) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="container-enterprise" style={{ position: 'relative', zIndex: 1 }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '3.5rem',
            alignItems: 'center'
          }}
          className="hero-grid"
        >
          {/* LEFT COLUMN: Dominant Enterprise Value Proposition */}
          <div style={{ maxWidth: '640px' }}>
            
            {/* Eyebrow badge */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div 
                className="eyebrow-tag"
                style={{
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '24px',
                  display: 'inline-flex'
                }}
              >
                <span 
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#0B3A70'
                  }}
                  className="animate-ping-subtle"
                />
                SMART TECHNOLOGY FOR REAL-WORLD OPERATIONS
              </div>
            </div>

            {/* Main Headline */}
            <h1 
              className="hero-headline"
              style={{
                marginBottom: '1.75rem',
                color: '#0F172A'
              }}
            >
              Intelligent Systems.<br />
              <span style={{ color: '#0B3A70' }}>Built for Smarter Operations.</span>
            </h1>

            {/* Supporting Paragraph */}
            <p 
              className="body-large"
              style={{
                marginBottom: '2.5rem',
                color: '#475569',
                maxWidth: '560px',
                fontSize: '1.15rem',
                lineHeight: '1.75'
              }}
            >
              Connect assets, machines, operations, and data through intelligent systems designed to improve visibility, efficiency, and control.
            </p>

            {/* CTAs */}
            <div 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '3rem'
              }}
            >
              <button 
                onClick={onExploreSolutions}
                className="btn-primary"
                style={{
                  padding: '0.95rem 1.85rem',
                  fontSize: '1rem'
                }}
              >
                Explore Our Solutions
                <ArrowRight size={18} />
              </button>

              <button 
                onClick={onOpenExpertModal}
                className="btn-secondary"
                style={{
                  padding: '0.95rem 1.75rem',
                  fontSize: '1rem'
                }}
              >
                Talk to an Expert
              </button>
            </div>

            {/* Micro Trust Proofs */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.75rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #F1F5F9',
                fontSize: '0.85rem',
                color: '#64748B',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <CheckCircle size={16} style={{ color: '#0B3A70' }} />
                <span>Industrial Edge & Cloud</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <CheckCircle size={16} style={{ color: '#16A34A' }} />
                <span>Precision Telemetry</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <CheckCircle size={16} style={{ color: '#0B3A70' }} />
                <span>Enterprise CMMS</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Custom Enterprise Technology Visualization */}
          <div>
            <HeroTechnologyVisual />
          </div>

        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .hero-grid {
            grid-template-columns: 1.1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
