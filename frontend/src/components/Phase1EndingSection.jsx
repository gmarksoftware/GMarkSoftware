import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, Server, Cpu, Sprout, Wrench } from 'lucide-react';

export default function Phase1EndingSection({ onOpenExpertModal, onDiscoverSolutions }) {
  return (
    <section 
      id="vision"
      style={{
        position: 'relative',
        backgroundColor: '#FAFCFE',
        borderTop: '1px solid #E2E8F0',
        padding: '7rem 0 6rem',
        overflow: 'hidden'
      }}
      className="bg-tech-grid"
    >
      {/* Subtle blue technical background glow & pattern */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(235, 243, 252, 0.8) 0%, rgba(250, 252, 254, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="container-enterprise" style={{ position: 'relative', zIndex: 1 }}>
        <div 
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D0E2F7',
            borderRadius: '24px',
            padding: '4rem 3rem',
            boxShadow: '0 20px 45px -10px rgba(11, 58, 112, 0.08), 0 4px 16px -2px rgba(15, 23, 42, 0.03)'
          }}
        >
          {/* Small Label */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span 
              className="eyebrow-tag"
              style={{
                backgroundColor: '#EBF3FC',
                color: '#0B3A70',
                padding: '0.35rem 0.9rem',
                borderRadius: '20px',
                border: '1px solid #D0E2F7'
              }}
            >
              ONE CONNECTED VISION
            </span>
          </div>

          {/* Large Heading */}
          <h2 
            className="section-headline"
            style={{
              fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
              marginBottom: '1.5rem',
              color: '#0F172A',
              letterSpacing: '-0.03em'
            }}
          >
            Technology That Works With the Real World.
          </h2>

          {/* Supporting Text */}
          <p 
            className="body-large"
            style={{
              fontSize: '1.15rem',
              lineHeight: '1.75',
              color: '#475569',
              maxWidth: '680px',
              margin: '0 auto 2.5rem'
            }}
          >
            From industrial assets to agricultural operations, our systems connect technology with the people and processes that keep businesses moving.
          </p>

          {/* CTA */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <button 
              onClick={onDiscoverSolutions}
              className="btn-primary"
              style={{
                padding: '1rem 2.25rem',
                fontSize: '1.05rem',
                borderRadius: '8px'
              }}
            >
              Discover Our Solutions
              <ArrowRight size={18} />
            </button>

            <button 
              onClick={onOpenExpertModal}
              className="btn-secondary"
              style={{
                padding: '1rem 2rem',
                fontSize: '1.05rem',
                borderRadius: '8px'
              }}
            >
              Talk to an Expert
            </button>
          </div>

          {/* Trust Footnote & Compliance Badges */}
          <div style={{
            borderTop: '1px solid #F1F5F9',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            fontSize: '0.8rem',
            color: '#64748B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} style={{ color: '#0B3A70' }} />
              <span>Enterprise Grade Reliability</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={16} style={{ color: '#0B3A70' }} />
              <span>Hardware Agnostic Telemetry</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sprout size={16} style={{ color: '#16A34A' }} />
              <span>Sustainable Resource Efficiency</span>
            </div>
          </div>

        </div>

        {/* Minimal Enterprise Bottom Bar */}
        <div style={{
          marginTop: '4rem',
          paddingTop: '2rem',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748B'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '22px', height: '22px', backgroundColor: '#0B3A70', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '0.7rem' }}>M</span>
            </div>
            <span style={{ fontWeight: '700', color: '#0F172A' }}>G Mark Intelligent Systems</span>
            <span>•</span>
            <span>Enterprise Operations Platform</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            <span>TRUST • ENGINEERING • INTELLIGENCE • RELIABILITY</span>
            <span>© {new Date().getFullYear()} G Mark</span>
          </div>
        </div>

      </div>
    </section>
  );
}
