import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  TrendingUp, 
  Building2, 
  Wallet, 
  FileSpreadsheet, 
  Scale, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart, 
  Sparkles, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import ErpModuleNavRibbon from './ErpModuleNavRibbon';
import { getAssetUrl } from '../../utils/asset';

export default function BranchLedgerCashflowPage({ app, onBack, onOpenExpertModal, onSelectApp }) {
  const [selectedBranch, setSelectedBranch] = useState('all');

  const branches = [
    { id: 'all', name: 'Consolidated Enterprise (All Branches)', code: 'GRP-HQ', cashBalance: '₹ 84,25,000', receivables: '₹ 1,42,80,000', payables: '₹ 96,40,000', netOperating: '+ ₹ 46,40,000' },
    { id: 'pune', name: 'Pune Corporate Head Office', code: 'BR-PUN-01', cashBalance: '₹ 42,10,000', receivables: '₹ 68,50,000', payables: '₹ 41,20,000', netOperating: '+ ₹ 27,30,000' },
    { id: 'nashik', name: 'Nashik Regional Branch', code: 'BR-NSK-02', cashBalance: '₹ 18,75,000', receivables: '₹ 34,90,000', payables: '₹ 25,10,000', netOperating: '+ ₹ 9,80,000' },
    { id: 'nagpur', name: 'Nagpur Distribution Branch', code: 'BR-NGP-03', cashBalance: '₹ 14,30,000', receivables: '₹ 26,40,000', payables: '₹ 19,80,000', netOperating: '+ ₹ 6,60,000' },
    { id: 'aurangabad', name: 'Chhatrapati Sambhajinagar Node', code: 'BR-CSN-04', cashBalance: '₹ 9,10,000', receivables: '₹ 13,00,000', payables: '₹ 10,30,000', netOperating: '+ ₹ 2,70,000' }
  ];

  const agingBuckets = [
    { period: '0 - 30 Days (Current)', receivables: '₹ 82,40,000', payables: '₹ 58,10,000', risk: 'Healthy' },
    { period: '31 - 60 Days', receivables: '₹ 38,10,000', payables: '₹ 24,90,000', risk: 'Standard Follow-up' },
    { period: '61 - 90 Days', receivables: '₹ 14,80,000', payables: '₹ 9,80,000', risk: 'Escalation Notice' },
    { period: '90+ Days (Overdue)', receivables: '₹ 7,50,000', payables: '₹ 3,60,000', risk: 'Legal / Recovery Block' }
  ];

  const ledgerFeatures = [
    {
      title: 'Real-Time Consolidation & Elimination',
      desc: 'Automatic elimination of inter-branch contra transfers to present a true, uninflated Consolidated Balance Sheet and Profit & Loss statement to statutory auditors.',
      icon: Scale,
      tag: 'Statutory Roll-up'
    },
    {
      title: 'Automated Bank Reconciliation (BRS)',
      desc: 'Daily import and algorithmic matching of bank statements against recorded cashbook entries, highlighting unpresented cheques and direct ECS debits.',
      icon: Wallet,
      tag: 'Zero Discrepancy'
    },
    {
      title: 'Receivables & Payables Aging Engine',
      desc: 'Dynamic aging analysis with configurable credit limits and payment term enforcement that automatically freezes new dispatch orders for defaulting ledgers.',
      icon: Clock,
      tag: 'Working Capital'
    },
    {
      title: 'Cashflow Liquidity Projections',
      desc: 'Predictive 30-day liquidity forecasting by combining committed purchase order outflows, expected customer invoice collections, and statutory tax deadlines.',
      icon: TrendingUp,
      tag: 'Cash Runway'
    }
  ];

  const currentBranchData = branches.find(b => b.id === selectedBranch) || branches[0];

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
          {/* Eyebrow Badge */}
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.76rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: '#F8FAFC',
              color: '#475569',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}>
              <Building2 size={13} style={{ color: '#64748B' }} />
              <span>CORE ERP & FINANCE • BRANCH LEDGER MODULE</span>
            </span>
          </div>

          {/* Heading */}
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
            <span>Branch Ledger & </span>
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 font-semibold" style={{ color: '#FC787D' }}>
                Cashflow
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
          </h1>

          <p style={{
            fontSize: 'clamp(0.92rem, 1.58vw, 1.1rem)',
            color: '#4B5563',
            maxWidth: '820px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.65
          }}>
            Multi-branch distributed ledger accounting with instantaneous financial consolidation, daily bank reconciliation (BRS), 
            and real-time Profit & Loss reporting across your entire corporate hierarchy.
          </p>

          {/* Metric Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            maxWidth: '920px',
            margin: '0 auto 2.5rem'
          }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Consolidation Lag</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#16A34A', marginTop: '0.25rem' }}>0 Seconds</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Real-time GL posting</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Inter-Branch Transfers</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#7B5872', marginTop: '0.25rem' }}>Auto-Contra</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Zero double-counting</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Bank Reconciliations</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#D97706', marginTop: '0.25rem' }}>Daily BRS</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Cheque & ECS verification</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Statutory Reporting</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>P&L & Bal Sheet</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Schedule III Compliant</div>
            </div>
          </div>

          {/* Action Button */}
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
              <span>Schedule Financial System Demo</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. LIVE PROFIT & LOSS REPORT SHOWCASE (SCREENSHOT EMBED) */}
      {/* ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '-2.5rem auto 3.5rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '2rem',
          padding: '2.5rem',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#7B5872',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                marginBottom: '0.5rem'
              }}>
                <FileSpreadsheet size={14} />
                Live Financial Intelligence
              </div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.75rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                Profit & Loss Statement & Ledger Architecture
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem', marginTop: '0.25rem', margin: 0 }}>
                Real-time computation of Trading Accounts, Gross Margins, Indirect Overhead Allocations, and Net Operating Profit.
              </p>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '9999px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#065F46'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              Live System Screenshot
            </div>
          </div>

          {/* Screenshot Display Container */}
          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '1.25rem',
            border: '1px solid #E2E8F0',
            padding: '1rem',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
            marginBottom: '1.5rem'
          }}>
            <img 
              src={getAssetUrl('/Screenshot 2026-10-13 105644.png')}
              alt="G Mark ERP Profit & Loss Statement and Trading Account"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '0.75rem',
                border: '1px solid #CBD5E1'
              }}
              loading="lazy"
            />
          </div>

          {/* Annotation Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '0.75rem', padding: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827', marginBottom: '0.25rem' }}>Trading Account Precision</div>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                Directly cross-references Opening Stock, Purchase Accounts, and Direct Labor with Sales Revenue and Closing Inventory to isolate Gross Margin.
              </p>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '0.75rem', padding: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827', marginBottom: '0.25rem' }}>Overhead Ledger Partitioning</div>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                Separates Administrative, Logistics, Sales Commission, and Financial Borrowing costs into granular debit head classifications.
              </p>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '0.75rem', padding: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827', marginBottom: '0.25rem' }}>Auditor Drill-Down Drill-Through</div>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                Clicking any ledger sum reveals all underlying Journal, Payment, or Receipt vouchers with timestamped audit footprints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MULTI-BRANCH LEDGER SELECTOR & CASHFLOW COCKPIT */}
      {/* ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '2rem',
          padding: '2.5rem',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
        }}>
          <div style={{ maxWidth: '800px', marginBottom: '2rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#1E3A8A',
              letterSpacing: '0.05em'
            }}>
              Corporate Balance Sheet & Ledger Network
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.75rem', fontWeight: 600, color: '#111827', margin: '0.5rem 0 0.75rem' }}>
              Branch Financial Breakdown & Working Capital
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
              Select a branch below to inspect autonomous cash balance, outstanding debtors (AR), supplier liabilities (AP), and operational surplus.
            </p>
          </div>

          {/* Branch Pill Selector */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #E5E7EB'
          }}>
            {branches.map(branch => {
              const isSelected = selectedBranch === branch.id;
              return (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch.id)}
                  style={{
                    backgroundColor: isSelected ? '#1E3A8A' : '#F9FAFB',
                    color: isSelected ? '#FFFFFF' : '#374151',
                    border: isSelected ? '1px solid #1E3A8A' : '1px solid #E5E7EB',
                    borderRadius: '9999px',
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(30, 58, 138, 0.25)' : 'none'
                  }}
                >
                  {branch.name}
                </button>
              );
            })}
          </div>

          {/* Selected Branch Financial Snapshot */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Cash & Bank Balance</span>
                <Wallet size={18} style={{ color: '#1E3A8A' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>{currentBranchData.cashBalance}</div>
              <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.25rem', fontWeight: 600 }}>Reconciled to Date</div>
            </div>

            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Accounts Receivable (AR)</span>
                <ArrowDownRight size={18} style={{ color: '#059669' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>{currentBranchData.receivables}</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>Customer Invoices Pending</div>
            </div>

            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Accounts Payable (AP)</span>
                <ArrowUpRight size={18} style={{ color: '#DC2626' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#DC2626' }}>{currentBranchData.payables}</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>Vendor Invoices Due</div>
            </div>

            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Net Operating Surplus</span>
                <TrendingUp size={18} style={{ color: '#D97706' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706' }}>{currentBranchData.netOperating}</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>Positive Operating Cushion</div>
            </div>
          </div>

          {/* Receivables & Payables Aging Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Receivables & Payables Aging Schedule
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Statutory Credit Monitoring</span>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid #E5E7EB' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Aging Bucket</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Receivables (Debtors)</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Payables (Creditors)</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Risk & Dispatch Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agingBuckets.map((bucket, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < agingBuckets.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#111827' }}>
                        {bucket.period}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        {bucket.receivables}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 700, color: '#DC2626' }}>
                        {bucket.payables}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.6rem',
                          borderRadius: '0.375rem',
                          backgroundColor: 
                            idx === 0 ? '#ECFDF5' :
                            idx === 1 ? '#EFF6FF' :
                            idx === 2 ? '#FFFBEB' : '#FEF2F2',
                          color:
                            idx === 0 ? '#065F46' :
                            idx === 1 ? '#1E40AF' :
                            idx === 2 ? '#92400E' : '#991B1B'
                        }}>
                          {bucket.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FOUR PILLARS OF BRANCH FINANCIAL CONTROL */}
      {/* ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: '2rem', fontWeight: 600, color: '#111827', margin: '0 0 0.5rem' }}>
            Multi-Tier Financial Governance
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', maxWidth: '680px', margin: '0 auto' }}>
            Empower branch accountants with local billing independence while giving corporate CFOs instant centralized visibility.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {ledgerFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1.5rem',
                  padding: '2rem',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '0.75rem',
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1E3A8A'
                    }}>
                      <Icon size={24} />
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '9999px',
                      backgroundColor: '#F3F4F6',
                      color: '#374151'
                    }}>
                      {feat.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
                    {feat.title}
                  </h3>

                  <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BOTTOM CTA BANNER */}
      {/* ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{
          backgroundColor: '#0F172A',
          borderRadius: '2rem',
          padding: '3rem 2rem',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.25)'
        }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
            Consolidate Your Branch Accounts Without Lag
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Connect with our chartered enterprise ERP specialists to set up your chart of accounts, inter-branch contra rules, and automated P&L dashboards.
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
              Consult an ERP Architect
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
              Explore Other ERP Modules
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
