import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Wallet, 
  Scale, 
  Receipt, 
  FileText, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  Database, 
  CheckCheck, 
  ChevronDown, 
  FileSpreadsheet,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import ErpModuleNavRibbon from './ErpModuleNavRibbon';

export default function DoubleEntryAccountingPage({ app, onBack, onOpenExpertModal, onSelectApp }) {
  const [activeVoucherTab, setActiveVoucherTab] = useState(0);

  const metricPills = [
    { label: '< 15ms Query Speed', sub: 'PostgreSQL Ledger Index', icon: Database },
    { label: '100% Debit/Credit Match', sub: 'Zero-Tolerance Engine', icon: Scale },
    { label: '4 Statutory Vouchers', sub: 'Receipt, Payment, Journal, Contra', icon: Receipt },
    { label: 'Full Audit Integrity', sub: 'Immutable Ledger Hashes', icon: ShieldCheck }
  ];

  const vouchers = [
    {
      id: 'receipt',
      title: 'Receipt Voucher',
      badge: 'Cash Inflow',
      desc: 'Records incoming payments from customers, trade debtors, or miscellaneous non-operating revenue sources.',
      debitCreditRule: 'Debit: Bank or Cash Account  →  Credit: Customer / Debtor Ledger Account',
      capabilities: [
        'Automatic bill-by-bill invoice adjustment and settlement matching',
        'Customer advance payment ledger holding with unadjusted balance alerts',
        'Multi-mode collection tracking (RTGS/NEFT, UPI, Cheque clearance, Cash)',
        'Automated receipt voucher numbering sequence with branch prefix'
      ],
      sampleEntry: {
        particulars: 'Received from Gramin FPO Producer Ltd against Inv #INV-2026-089',
        debit: 'State Bank of India (Current A/c): ₹1,85,400',
        credit: 'Gramin FPO Producer Ltd (Customer Ledger): ₹1,85,400'
      }
    },
    {
      id: 'payment',
      title: 'Payment Voucher',
      badge: 'Cash Outflow',
      desc: 'Records outgoing disbursements to suppliers, vendor invoices, operational expenses, and company payroll.',
      debitCreditRule: 'Debit: Supplier / Expense Ledger Account  →  Credit: Bank or Cash Account',
      capabilities: [
        'Strict due-date verification against verified Goods Receipt Note (GRN) invoices',
        'TDS (Tax Deducted at Source) calculation and deduction posting',
        'Multi-signatory approval threshold for high-value financial payouts',
        'Direct bank reconciliation ledger export with UTR confirmation'
      ],
      sampleEntry: {
        particulars: 'Disbursed to AgroSpares Hub against Purchase Inv #PI-4412',
        debit: 'AgroSpares Hub (Vendor Payable): ₹82,600',
        credit: 'HDFC Bank (Operating A/c): ₹82,600'
      }
    },
    {
      id: 'journal',
      title: 'Journal Voucher',
      badge: 'Book Adjustments',
      desc: 'Enforces non-cash statutory accounting entries, depreciation allocations, provisions, and inter-ledger account transfers.',
      debitCreditRule: 'Debit: Target Expense / Asset Ledger A/c  →  Credit: Source Provision / Equity A/c',
      capabilities: [
        'Strict double-entry balancing verification: Total Debits must equal Total Credits before lock',
        'Month-end and year-end depreciation schedule amortization',
        'Bad debt provisioning and inter-departmental cost allocations',
        'Tax credit reversal and GST input tax credit (ITC) adjustments'
      ],
      sampleEntry: {
        particulars: 'Machinery Depreciation Allocation (March Period)',
        debit: 'Depreciation Expense A/c: ₹24,000',
        credit: 'Accumulated Depreciation - Plant & Machinery: ₹24,000'
      }
    },
    {
      id: 'contra',
      title: 'Contra Voucher',
      badge: 'Internal Transfers',
      desc: 'Documents internal monetary fund movements between corporate bank accounts, branch registers, and petty cash lockers.',
      debitCreditRule: 'Debit: Receiving Bank or Cash Register  →  Credit: Disbursing Bank or Cash Register',
      capabilities: [
        'Zero statutory tax liability impact — internal capital transfers only',
        'Bank-to-cash ATM withdrawals and daily cash-in-transit deposit logging',
        'Petty cash fund replenishment against verified expense vouchers',
        'Automated counter-entry generation across participating branch accounts'
      ],
      sampleEntry: {
        particulars: 'Cash Withdrawal from SBI Current for Factory Petty Cash Float',
        debit: 'Factory Petty Cash Locker: ₹25,000',
        credit: 'SBI Current Account: ₹25,000'
      }
    }
  ];

  const ledgerHierarchy = [
    {
      type: 'Assets Master',
      groups: ['Current Assets (Cash, Bank, Debtors)', 'Fixed Assets (Machinery, Vehicles)', 'Inventories & Warehouse Bins']
    },
    {
      type: 'Liabilities Master',
      groups: ['Current Liabilities (Creditors, Payables)', 'Statutory Tax Dues (GST, TDS)', 'Capital & Long-Term Loans']
    },
    {
      type: 'Income Master',
      groups: ['Direct Sales & Commercial Revenue', 'Consulting & Professional Services', 'Miscellaneous Non-Operating Gains']
    },
    {
      type: 'Expense Master',
      groups: ['Cost of Goods Sold (Procurement)', 'Factory Direct Wages & Power', 'Administrative & Fleet Logistics']
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
              <Wallet size={13} style={{ color: '#64748B' }} />
              <span>CORE ERP & FINANCE • STATUTORY ACCOUNTING MODULE</span>
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
            <span>Double-Entry </span>
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 font-semibold" style={{ color: '#FC787D' }}>
                Accounting
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
            <span>& Financial Ledgers</span>
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
            Compliant double-entry financial core with receipt, payment, journal, and contra vouchers. Automated Debit/Credit validation, bill-by-bill reconciliation, real-time Chart of Accounts, and immutable transaction audit trails.
          </p>

          {/* Action Buttons */}
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
              <span>Request Accounting Module Demo</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Metric Highlights Ribbon */}
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
      {/* 2. THE 4 STATUTORY ACCOUNTING VOUCHERS */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#e8e8e8', padding: '3.5rem 0 4.5rem' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#7B5872', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              VOUCHER DISPATCH & TRANSACTION INTEGRITY
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
              Statutory Double-Entry Voucher Engine
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.94rem', maxWidth: '680px', margin: '0.5rem auto 0', lineHeight: '1.6' }}>
              Every monetary transaction within G Mark ERP is backed by an immutable statutory voucher adhering strictly to double-entry debit and credit rules.
            </p>
          </div>

          {/* 4 Voucher Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.25rem' }}>
            {vouchers.map((v, idx) => (
              <div 
                key={v.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0F172A', margin: 0 }}>
                    {v.title}
                  </h3>
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '100px', backgroundColor: '#F1F5F9', color: '#334155', fontWeight: '600', border: '1px solid #E2E8F0' }}>
                    {v.badge}
                  </span>
                </div>

                <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: '1.55' }}>
                  {v.desc}
                </p>

                {/* Debit / Credit Rule Box */}
                <div style={{ backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '10px', padding: '0.75rem', fontSize: '0.75rem', color: '#0F172A', fontWeight: '500', lineHeight: '1.4' }}>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px' }}>Posting Rule</span>
                  {v.debitCreditRule}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.25rem' }}>
                  {v.capabilities.map((cap, cIdx) => (
                    <div key={cIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.78rem', color: '#475569', lineHeight: '1.45' }}>
                      <Check size={14} style={{ color: '#7B5872', flexShrink: 0, marginTop: '2px' }} />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CHART OF ACCOUNTS & GENERAL LEDGER STRUCTURE */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '4rem 0 4.5rem', borderTop: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#7B5872', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              GENERAL LEDGER ARCHITECTURE
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.4rem, 3.5vw, 2.1rem)', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
              Chart of Accounts & Multi-Level Taxonomy
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.92rem', maxWidth: '680px', margin: '0.5rem auto 0', lineHeight: '1.6' }}>
              Standardized accounting groups ensuring clean trial balances, balance sheet audits, and automated tax filing schedules.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
            {ledgerHierarchy.map((lh, idx) => (
              <div 
                key={idx}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '1.25rem'
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0F172A', margin: '0 0 0.65rem' }}>
                  {lh.type}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {lh.groups.map((grp, gIdx) => (
                    <div key={gIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#7B5872' }} />
                      <span>{grp}</span>
                    </div>
                  ))}
                </div>
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
            Integrate Double-Entry Precision into Your Ledger
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            Experience error-free vouchers, automated reconciliations, and instant trial balance verification.
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
              <span>Schedule Accounting Consultation</span>
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
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
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
