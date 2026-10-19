import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight,
  Database,
  Server,
  Activity,
  FileCheck,
  Building2,
  Workflow,
  Lock,
  Code2
} from 'lucide-react';
import CategoryModuleNavRibbon from './CategoryModuleNavRibbon';

export default function UniversalModuleDetailPage({ module, onBack, onOpenExpertModal, onSelectApp }) {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  if (!module) return null;

  const isTechnology = module.navigationOrigin === 'technology';
  const parentSectionLabel = isTechnology ? 'Technology' : 'Solutions';

  return (
    <div style={{ backgroundColor: '#e8e8e8', minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      {/* ========================================================================= */}
      {/* 1. HERO HEADER */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#FFFFFF', 
          textAlign: 'center', 
          paddingTop: 'clamp(1.25rem, 2.5vw, 2rem)', 
          paddingBottom: 'clamp(2.5rem, 4vw, 3.75rem)', 
          paddingLeft: '1.5rem', 
          paddingRight: '1.5rem',
          borderRadius: '0 0 1.5rem 1.5rem',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
          position: 'relative'
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Eyebrow Category & Badge Pill */}
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.76rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: '#F8FAFC',
              color: '#475569',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748B' }}></span>
              {module.category} • {module.badge || 'ENTERPRISE MODULE'}
            </span>
          </div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ 
              fontFamily: "'Lora', serif", 
              fontSize: 'clamp(2rem, 4vw, 3.87rem)', 
              fontWeight: 600, 
              color: '#0F172A', 
              letterSpacing: '-0.01em',
              lineHeight: 1.18,
              marginBottom: '1rem'
            }}
          >
            {module.name}
          </motion.h1>

          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            color: '#4B5563',
            maxWidth: '820px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.65
          }}>
            {module.description || module.tagline}
          </p>

          {/* Metric Bar */}
          {module.metrics && module.metrics.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem',
              maxWidth: '960px',
              margin: '0 auto 2.5rem'
            }}>
              {module.metrics.map((m, idx) => (
                <div key={idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1rem', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>{m.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#7B5872', marginTop: '0.25rem' }}>{m.val}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{m.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                backgroundColor: '#7B5872',
                color: '#FFFFFF',
                padding: '0.8rem 1.85rem',
                borderRadius: '9999px',
                fontWeight: 500,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(123, 88, 114, 0.35)'
              }}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onBack}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#334155',
                padding: '0.8rem 1.5rem',
                borderRadius: '9999px',
                fontWeight: 500,
                fontSize: '0.95rem',
                border: '1px solid #CBD5E1',
                cursor: 'pointer'
              }}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Explore Sibling Modules
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE ARCHITECTURE PILLARS */}
      {/* ========================================================================= */}
      {module.pillars && module.pillars.length > 0 && (
        <section style={{ maxWidth: '1240px', margin: '-2.5rem auto 3.5rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '2rem',
            padding: '2.5rem',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ maxWidth: '800px', marginBottom: '2rem' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#7B5872',
                letterSpacing: '0.05em'
              }}>
                Strategic Capabilities & System Architecture
              </span>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.75rem', fontWeight: 600, color: '#111827', margin: '0.5rem 0 0.75rem' }}>
                Key Technical & Operational Pillars
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                Engineered for enterprise reliability, continuous data integrity, and seamless operational scalability.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem'
            }}>
              {module.pillars.map((pillar, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: '1.25rem',
                    padding: '1.75rem',
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        color: '#4B5563'
                      }}>
                        {pillar.badge || `Pillar ${idx + 1}`}
                      </span>
                      <CheckCircle2 size={16} color="#7B5872" />
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                      {pillar.title}
                    </h3>

                    <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. END-TO-END OPERATIONAL / TECHNICAL PIPELINE */}
      {/* ========================================================================= */}
      {module.workflow && module.workflow.length > 0 && (
        <section style={{ maxWidth: '1240px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '2rem',
            padding: '2.5rem',
            border: '1px solid #E5E7EB',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
          }}>
            <div style={{ maxWidth: '800px', marginBottom: '2rem' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#7B5872',
                letterSpacing: '0.05em'
              }}>
                Execution Sequence
              </span>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.75rem', fontWeight: 600, color: '#111827', margin: '0.5rem 0 0.75rem' }}>
                Operational & Data Flow Pipeline
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                Sequential data processing steps that guarantee speed, audit traceability, and zero operational bottlenecks.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '1.25rem'
            }}>
              {module.workflow.map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#7B5872',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>0{item.step || idx + 1}</span>
                    <Workflow size={18} opacity={0.3} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.5rem' }}>
                    {item.title}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. TECHNICAL SPECIFICATIONS & COMPLIANCE TABLE */}
      {/* ========================================================================= */}
      {module.technicalSpecs && module.technicalSpecs.length > 0 && (
        <section style={{ maxWidth: '1240px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '2rem',
            padding: '2.5rem',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: '1.5rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Technical Specifications & Compliance Standards
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
                  Architectural parameters, protocol definitions, and security compliance baselines.
                </p>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#F3F4F6',
                borderRadius: '9999px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#4B5563'
              }}>
                <ShieldCheck size={14} color="#059669" />
                <span>Production Verified Specifications</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid #E5E7EB' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1.25rem', width: '35%' }}>Specification Parameter</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Engineering Standard & Implementation</th>
                  </tr>
                </thead>
                <tbody>
                  {module.technicalSpecs.map((spec, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < module.technicalSpecs.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#111827', backgroundColor: '#FAFAFA' }}>
                        {spec.label}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#374151', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. BOTTOM CTA BANNER */}
      {/* ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{
          backgroundColor: '#0F172A',
          borderRadius: '2rem',
          padding: '3.25rem 2rem',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.25)'
        }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
            Ready to Deploy {module.name}?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Connect with our platform specialists to evaluate integration requirements, live telemetry setups, or customized enterprise deployments.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                backgroundColor: '#7B5872',
                color: '#FFFFFF',
                fontWeight: 600,
                padding: '0.85rem 2rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 4px 16px rgba(123, 88, 114, 0.35)'
              }}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Consult a Specialist
            </button>
            <button
              onClick={onBack}
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                fontWeight: 500,
                padding: '0.85rem 1.75rem',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Return to {parentSectionLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
