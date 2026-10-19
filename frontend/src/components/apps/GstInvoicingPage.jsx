import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Receipt, 
  Scale, 
  BadgePercent, 
  ShieldCheck, 
  FileText, 
  Truck, 
  Building2, 
  Sparkles, 
  QrCode, 
  Lock, 
  CheckCircle2, 
  MapPin,
  FileCheck
} from 'lucide-react';
import ErpModuleNavRibbon from './ErpModuleNavRibbon';

export default function GstInvoicingPage({ app, onBack, onOpenExpertModal, onSelectApp }) {
  const metricPills = [
    { label: '100% Tax Accuracy', sub: 'CGST, SGST & IGST Engine', icon: BadgePercent },
    { label: 'E-Way Bill Ready', sub: 'Automated Transport Ingest', icon: Truck },
    { label: 'Pre-Seeded HSN Codes', sub: 'Complete Statutory Catalog', icon: FileText },
    { label: 'Immutable Lock', sub: 'Audit-Safe Invoicing Records', icon: Lock }
  ];

  const hsnTiers = [
    {
      rate: '0% Nil Rate',
      category: 'Exempt Agricultural Essentials',
      examples: 'Fresh unpolished grains, raw agricultural seeds, organic compost, direct farm produce without branding.',
      compliance: 'Statutory Section 11 Exemptions'
    },
    {
      rate: '5% Tier',
      category: 'Essential Supplies & Raw Materials',
      examples: 'Fertilizers, bio-pesticides, branded agricultural flour, pulses, cold storage handling charges.',
      compliance: 'Input Tax Credit (ITC) Eligible'
    },
    {
      rate: '12% Tier',
      category: 'Agricultural & Irrigation Machinery',
      examples: 'Drip irrigation components, submersible water pumps, tractor implements, processed packaging materials.',
      compliance: 'Standard ITC Verification'
    },
    {
      rate: '18% Tier',
      category: 'Industrial Spares & Standard Commercial',
      examples: 'Automotive components, industrial valves, telemetry gateways, commercial maintenance, consulting fees.',
      compliance: 'Standard Enterprise Rate'
    },
    {
      rate: '28% Tier',
      category: 'Specialized Industrial & Heavy Fleet',
      examples: 'Heavy commercial transport vehicles, specialized industrial air compressors, high-voltage switchgear.',
      compliance: 'Statutory Luxury / Cess Rules'
    }
  ];

  const eWaySteps = [
    {
      step: '1',
      title: 'Consignment Threshold Trigger',
      desc: 'System automatically flags dispatches exceeding ₹50,000 statutory consignment value requiring mandatory E-Way Bill documentation.'
    },
    {
      step: '2',
      title: 'Transporter ID & Vehicle Mapping',
      desc: 'Binds registered GSTIN Transporter ID, vehicle registration number, and GPS odometer reading to the approved delivery challan.'
    },
    {
      step: '3',
      title: '12-Digit E-Way Bill Generation',
      desc: 'Engine compiles Part-A (consignor/consignee, HSN codes, invoice value) and Part-B (vehicle & route data) into compliant digital slip.'
    },
    {
      step: '4',
      title: 'QR Code & Gate Pass Verification',
      desc: 'Generates print-ready tax invoice embedded with dynamic verification QR code for physical inspection at highway checkpoints.'
    }
  ];

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
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
            backgroundSize: '4rem 4rem'
          }}
        />

        {/* Horizon Curvature Arc in Grey (#e8e8e8) */}
        <div
          className="absolute left-1/2 top-[calc(100%-140px)] sm:top-[calc(100%-165px)] md:top-[calc(100%-190px)] lg:top-[calc(100%-210px)] 
          h-[480px] w-[700px] md:h-[550px] md:w-[1100px] lg:h-[750px] lg:w-[140%] 
          -translate-x-1/2 rounded-[100%] border-t border-slate-300/40 bg-[#e8e8e8] 
          shadow-[0_-20px_50px_rgba(0,0,0,0.06)] pointer-events-none z-0"
        />

        <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          {/* Eyebrow Badge */}
          <div style={{ marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '4px 12px', 
              borderRadius: '9999px', 
              backgroundColor: '#F8FAFC', 
              color: '#475569', 
              fontSize: '0.76rem', 
              fontWeight: '600', 
              letterSpacing: '0.06em', 
              textTransform: 'uppercase',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}>
              <Receipt size={13} style={{ color: '#64748B' }} />
              <span>CORE ERP & FINANCE • STATUTORY TAX ENGINE</span>
            </span>
          </div>

          <h1 
            className="text-balance text-slate-900"
            style={{ 
              fontFamily: "'Lora', serif",
              fontSize: 'clamp(1.75rem, 4.5vw, 3.87rem)',
              lineHeight: '1.18',
              letterSpacing: '-0.01em',
              paddingTop: '0.25rem',
              paddingBottom: '0.75rem',
              fontWeight: 600
            }}
          >
            <span>GST & </span>
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 font-semibold" style={{ color: '#FC787D' }}>
                E-Way Invoicing
              </span>
              <svg
                className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4.5 pointer-events-none z-0 overflow-visible"
                viewBox="0 0 260 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M 4,14 Q 130,5 256,12 Q 130,20 6,17"
                  fill="#00A3FF"
                />
              </svg>
            </span>
            <br className="hidden sm:inline" />
            <span>Engine</span>
          </h1>

          <p 
            className="text-balance text-gray-600 font-normal"
            style={{ 
              fontSize: 'clamp(0.92rem, 1.58vw, 1.1rem)', 
              lineHeight: '1.65', 
              maxWidth: '760px',
              margin: '1.25rem auto 2.25rem'
            }}
          >
            Automated statutory tax compliance with state-based CGST, SGST, and IGST computation. Comprehensive HSN & SAC directories, digital E-Way Bill generation, and immutable invoice locking for complete audit readiness.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                padding: '0.8rem 1.85rem',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                fontWeight: '500',
                backgroundColor: '#7B5872',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(123, 88, 114, 0.35)'
              }}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <span>Request GST & E-Way Demo</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
              gap: '0.85rem',
              maxWidth: '840px',
              margin: '0 auto',
              paddingTop: '0.5rem'
            }}
          >
            {metricPills.map((pill, idx) => {
              const IconC = pill.icon;
              return (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '16px',
                    padding: '0.95rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconC size={16} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#0F172A', lineHeight: 1.15 }}>
                      {pill.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                      {pill.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INTRA-STATE VS INTER-STATE TAX LOGIC CARD */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#e8e8e8', padding: '3.5rem 0 4.5rem' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#7B5872', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              AUTOMATED STATUTORY COMPUTATION
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
              State-Based Tax Rule Comparison
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.94rem', maxWidth: '680px', margin: '0.5rem auto 0', lineHeight: '1.6' }}>
              The system automatically compares the company's operating state code with the customer/supplier GSTIN state code to select statutory tax rules.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
            
            {/* Intra-State Card */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '16px',
                padding: '1.75rem',
                borderTop: '5px solid #7B5872',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#7B5872', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  INTRA-STATE TRANSACTION
                </span>
                <span style={{ fontSize: '0.74rem', padding: '3px 9px', borderRadius: '9999px', backgroundColor: '#F1F5F9', color: '#475569', fontWeight: '600', border: '1px solid #E2E8F0' }}>
                  Same State (e.g. 27-MH)
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#0F172A', margin: '0 0 0.5rem' }}>
                CGST 9% + SGST 9% Equal Split
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: '1.55', margin: '0 0 1rem' }}>
                When both supplier and buyer reside in the same state, total tax liability splits equally between Central GST and State GST.
              </p>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem', fontSize: '0.8rem', color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Taxable Base Value:</span>
                  <strong>₹1,00,000</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7B5872', marginBottom: '4px' }}>
                  <span>Central GST (9%):</span>
                  <span>+ ₹9,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7B5872', marginBottom: '6px' }}>
                  <span>State GST (9%):</span>
                  <span>+ ₹9,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: '6px', fontWeight: '700', color: '#0F172A' }}>
                  <span>Total Invoice Amount:</span>
                  <span>₹1,18,000</span>
                </div>
              </div>
            </div>

            {/* Inter-State Card */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '16px',
                padding: '1.75rem',
                borderTop: '5px solid #16A34A',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  INTER-STATE TRANSACTION
                </span>
                <span style={{ fontSize: '0.74rem', padding: '3px 9px', borderRadius: '9999px', backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: '600' }}>
                  Cross State (e.g. MH to GJ)
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#0F172A', margin: '0 0 0.5rem' }}>
                IGST 18% Integrated Statutory Tax
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: '1.55', margin: '0 0 1rem' }}>
                Cross-border movement triggers integrated GST without intra-state division, settling interstate commerce tax directly through central clearing.
              </p>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem', fontSize: '0.8rem', color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Taxable Base Value:</span>
                  <strong>₹1,00,000</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', marginBottom: '6px' }}>
                  <span>Integrated GST (18%):</span>
                  <span>+ ₹18,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: '6px', fontWeight: '700', color: '#0F172A' }}>
                  <span>Total Invoice Amount:</span>
                  <span>₹1,18,000</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. E-WAY BILL LIFECYCLE WORKFLOW */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '4rem 0 4.5rem', borderTop: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#7B5872', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              LOGISTICS COMPLIANCE & GATE PASS
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.4rem, 3.5vw, 2.1rem)', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
              Automated E-Way Bill Dispatch Workflow
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
            {eWaySteps.map((step) => (
              <div 
                key={step.step}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: '700' }}>
                  {step.step}
                </div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: '600', color: '#0F172A', margin: 0 }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BOTTOM CTA */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#e8e8e8', color: '#0F172A', padding: '4rem 1.5rem', textAlign: 'center', borderTop: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h3 style={{ fontFamily: "'Lora', serif", fontSize: '1.75rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.75rem' }}>
            Automate Your Statutory Tax Invoicing
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            Deploy G Mark ERP's statutory tax calculation and automated E-Way generation today.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '9999px',
                fontSize: '0.88rem',
                fontWeight: '500',
                backgroundColor: '#7B5872',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 16px rgba(123, 88, 114, 0.35)'
              }}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <span>Schedule Tax Engine Consultation</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={onBack}
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '9999px',
                fontSize: '0.88rem',
                fontWeight: '500',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Solutions</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
