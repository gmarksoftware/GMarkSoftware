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
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* ========================================================================= */}
      {/* 1. HERO HEADER */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#FFFFFF', 
          textAlign: 'center', 
          paddingTop: 'clamp(1.5rem, 3vw, 2.5rem)', 
          paddingBottom: 'clamp(2.5rem, 4vw, 4rem)', 
          paddingLeft: '1.5rem', 
          paddingRight: '1.5rem', 
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #F1F5F9'
        }}
      >
        {/* Ambient top radial gradient glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-red-100/40 via-rose-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-0" 
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
            backgroundSize: '4rem 4rem'
          }}
        />

        <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          {/* Eyebrow Badge */}
          <div style={{ marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 14px', 
              borderRadius: '9999px', 
              backgroundColor: '#FFF1F2', 
              color: '#FC787D', 
              fontSize: '0.76rem', 
              fontWeight: '600', 
              letterSpacing: '0.06em', 
              textTransform: 'uppercase',
              border: '1px solid #FED7D9',
              boxShadow: '0 1px 3px rgba(252, 120, 125, 0.04)'
            }}>
              <Receipt size={13} style={{ color: '#FC787D' }} />
              <span>CORE ERP &amp; FINANCE • STATUTORY TAX ENGINE</span>
            </span>
          </div>

          <h1 
            className="text-balance text-slate-900 font-extrabold tracking-tight"
            style={{ 
              fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: 'clamp(2rem, 4.5vw, 3.87rem)',
              lineHeight: '1.15',
              letterSpacing: '-0.025em',
              paddingTop: '0.25rem',
              paddingBottom: '0.75rem'
            }}
          >
            <span>GST &amp; </span>
            <span className="text-[#FC787D]">
              E-Way Invoicing
            </span>
            <br className="hidden sm:inline" />
            <span> Engine</span>
          </h1>

          <p 
            className="text-balance text-slate-600 font-normal"
            style={{ 
              fontSize: 'clamp(0.95rem, 1.6vw, 1.125rem)', 
              lineHeight: '1.65', 
              maxWidth: '760px',
              margin: '1.25rem auto 2.25rem'
            }}
          >
            Automated statutory tax compliance with state-based CGST, SGST, and IGST computation. Comprehensive HSN &amp; SAC directories, digital E-Way Bill generation, and immutable invoice locking for complete audit readiness.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginBottom: '3.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '600',
                backgroundColor: '#FC787D',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(252, 120, 125, 0.25)'
              }}
              className="hover:bg-[#E86368] active:scale-[0.98] transition-all"
            >
              <span>Request GST &amp; E-Way Demo</span>
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
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '0.95rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#FFF1F2', color: '#FC787D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconC size={16} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0F172A', lineHeight: 1.15 }}>
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
      <section style={{ backgroundColor: '#F8FAFC', padding: '3.5rem 0 4.5rem', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#FC787D', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              AUTOMATED STATUTORY COMPUTATION
            </span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 700, color: '#0F172A', marginTop: '4px', letterSpacing: '-0.02em' }}>
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
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.75rem',
                borderTop: '5px solid #FC787D',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FC787D', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  INTRA-STATE TRANSACTION
                </span>
                <span style={{ fontSize: '0.74rem', padding: '3px 9px', borderRadius: '9999px', backgroundColor: '#FFF1F2', color: '#FC787D', fontWeight: '600', border: '1px solid #FED7D9' }}>
                  Same State (e.g. 27-MH)
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A', margin: '0 0 0.5rem' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FC787D', marginBottom: '4px', fontWeight: '600' }}>
                  <span>Central GST (9%):</span>
                  <span>+ ₹9,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FC787D', marginBottom: '6px', fontWeight: '600' }}>
                  <span>State GST (9%):</span>
                  <span>+ ₹9,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '6px', fontWeight: '700', color: '#0F172A' }}>
                  <span>Total Invoice Amount:</span>
                  <span>₹1,18,000</span>
                </div>
              </div>
            </div>

            {/* Inter-State Card */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.75rem',
                borderTop: '5px solid #16A34A',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A', margin: '0 0 0.5rem' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', marginBottom: '6px', fontWeight: '600' }}>
                  <span>Integrated GST (18%):</span>
                  <span>+ ₹18,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '6px', fontWeight: '700', color: '#0F172A' }}>
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
      <section style={{ backgroundColor: '#FFFFFF', padding: '4rem 0 4.5rem' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#FC787D', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              LOGISTICS COMPLIANCE &amp; GATE PASS
            </span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: 'clamp(1.4rem, 3.5vw, 2.1rem)', fontWeight: 700, color: '#0F172A', marginTop: '4px', letterSpacing: '-0.02em' }}>
              Automated E-Way Bill Dispatch Workflow
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
            {eWaySteps.map((step) => (
              <div 
                key={step.step}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FC787D', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700' }}>
                  {step.step}
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.55', margin: 0 }}>
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
      <section style={{ maxWidth: '1240px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{
          backgroundColor: '#0F172A',
          borderRadius: '2rem',
          padding: '3.5rem 2rem',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.25)'
        }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Automate Your Statutory Tax Invoicing
          </h3>
          <p style={{ fontSize: '0.98rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', marginBottom: '1.75rem', maxWidth: '620px', margin: '0 auto 1.75rem' }}>
            Deploy G Mark ERP's statutory tax calculation and automated E-Way generation today.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '600',
                backgroundColor: '#FC787D',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 16px rgba(252, 120, 125, 0.35)'
              }}
              className="hover:bg-[#E86368] active:scale-[0.98] transition-all"
            >
              <span>Schedule Tax Engine Consultation</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={onBack}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              className="hover:bg-white/10 active:scale-[0.98] transition-all"
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
