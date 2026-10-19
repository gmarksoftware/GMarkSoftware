import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ShoppingCart, 
  FileText, 
  Truck, 
  Receipt, 
  Wallet, 
  Building2, 
  PackageCheck, 
  CheckCheck, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  FileSpreadsheet, 
  Layers,
  Clock,
  Database
} from 'lucide-react';
import ErpModuleNavRibbon from './ErpModuleNavRibbon';

export default function SalesPurchaseOrdersPage({ app, onBack, onOpenExpertModal, onSelectApp }) {
  const [activeStepSales, setActiveStepSales] = useState(0);
  const [activeStepProcure, setActiveStepProcure] = useState(0);

  const metricPills = [
    { label: 'SO & PO Orchestration', sub: 'Bi-Directional Order Sync', icon: ShoppingCart },
    { label: 'Contract Price Lock', sub: 'Zero Slippage Guarantee', icon: ShieldCheck },
    { label: 'Partial GRN Tracking', sub: 'Inward Quality & Quantity QC', icon: PackageCheck },
    { label: 'Bulk Excel Schedules', sub: 'One-Click Procurement Ingest', icon: FileSpreadsheet }
  ];

  const salesSteps = [
    {
      num: '1',
      title: 'Customer Account & Credit Master Setup',
      tag: 'Account Master',
      desc: 'Create and verify customer profile with state code, GSTIN, billing/shipping addresses, and credit terms in Account Master.',
      desc2: 'Master record populates customer search indexes and establishes state identification for automated GST calculation.',
      status: 'ACCOUNT_MASTER_ACTIVE',
      icon: Building2
    },
    {
      num: '2',
      title: 'Sales Order (SO) Creation & Price Lock',
      tag: 'Demand Booking',
      desc: 'Record buyer requirements including product SKUs, ordered quantities, unit rates, item-level discounts, and delivery deadlines.',
      desc2: 'System reserves stock allocation in warehouse bins, locks contract prices, and triggers internal dispatch work-order queues.',
      status: 'SALES_ORDER_CONFIRMED',
      icon: ShoppingCart
    },
    {
      num: '3',
      title: 'Sales Delivery Challan & Dispatch',
      tag: 'Fulfillment & Logistics',
      desc: 'Generate delivery challan linked directly to the approved Sales Order, verifying dispatch lot quantities and package numbers.',
      desc2: 'Deducts live inventory from warehouse bins and generates transport proof documentation for carrier handover.',
      status: 'CHALLAN_DISPATCHED',
      icon: Truck
    },
    {
      num: '4',
      title: 'Sales Invoice (SI) & Auto-GST Calculation',
      tag: 'Billing Engine',
      desc: 'Convert dispatched challan into a compliant Sales Invoice. Engine splits taxes into CGST+SGST (intra-state) or IGST (inter-state).',
      desc2: 'Locks immutable financial values, posts receivable debits, and generates print-ready tax invoices with HSN summaries.',
      status: 'SALES_INVOICE_POSTED',
      icon: Receipt
    },
    {
      num: '5',
      title: 'Customer Receipt & Bill-by-Bill Settlement',
      tag: 'Accounts Receivable',
      desc: 'Record customer payment via Bank Transfer, Cash, or Cheque with receipt voucher generation.',
      desc2: 'Settlement engine reconciles payment against outstanding invoice bills and posts credit to customer ledger.',
      status: 'RECEIPT_SETTLED',
      icon: Wallet
    }
  ];

  const procurementSteps = [
    {
      num: '1',
      title: 'Supplier Onboarding & HSN Mapping',
      tag: 'Vendor Master',
      desc: 'Onboard vendor with PAN, MSME certification, GSTIN, payment terms, and mapped supply categories in Master records.',
      desc2: 'Associates vendor state with tax calculation rules and binds valid banking details for automated payout verification.',
      status: 'SUPPLIER_MASTER_LINKED',
      icon: Building2
    },
    {
      num: '2',
      title: 'Purchase Order (PO) Generation & Authorization',
      tag: 'Procurement Order',
      desc: 'Draft formal Purchase Order specifying raw material / product quantities, agreed purchase rates, and delivery schedules.',
      desc2: 'Supports multi-tier managerial approval and structured Excel bulk import for large procurement schedules.',
      status: 'PURCHASE_ORDER_ISSUED',
      icon: FileText
    },
    {
      num: '3',
      title: 'Goods Receipt Note (GRN) Ingest & Quality QC',
      tag: 'Gate Inward & Inspection',
      desc: 'Warehouse gate officer records physical material inward against PO line-items with gross/tare weights and QC inspection.',
      desc2: 'Tracks partial receipts with remaining quantity balances (e.g. PO: 10 units, GRN: 5 units, Remaining: 5 units).',
      status: 'GRN_VERIFIED_QTY',
      icon: PackageCheck
    },
    {
      num: '4',
      title: 'Purchase Invoice (PI) & Landed Cost Entry',
      tag: 'Accounts Payable',
      desc: 'Record vendor tax invoice against accepted GRN items, capturing input tax credit (ITC) eligibility and freight expenses.',
      desc2: 'Matches PO rates against vendor bill with tolerance verification and posts liability credit to supplier ledger.',
      status: 'PURCHASE_INVOICE_LOCKED',
      icon: Receipt
    },
    {
      num: '5',
      title: 'Supplier Payment Voucher & Account Clearance',
      tag: 'Disbursement & Ledger',
      desc: 'Execute payment voucher debiting supplier payable account and crediting bank/cash contra account.',
      desc2: 'Clears vendor aging liabilities and updates real-time financial balance sheets and audit trail reports.',
      status: 'PAYMENT_CLEARED',
      icon: CheckCheck
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
              <ShoppingCart size={13} style={{ color: '#64748B' }} />
              <span>CORE ERP & FINANCE • ORDER MANAGEMENT MODULE</span>
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
            <span>Sales & </span>
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 font-semibold" style={{ color: '#FC787D' }}>
                Purchase Orders
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
            <span>Lifecycle</span>
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
            End-to-end commercial order lifecycle from customer quote and Sales Order to delivery challan and tax invoice, seamlessly paired with supplier procurement, bulk Excel import, and gate inward GRN inspection.
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
              <span>Request SO & PO Lifecycle Demo</span>
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
      {/* 2. PHASE 1: SALES & DISTRIBUTION CYCLE (WHITE CURVED CARD ON GREY BG) */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          padding: '2.5rem 0 3rem',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%'
        }}
      >
        <div 
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1040px',
            marginLeft: 'auto',
            marginRight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
          }}
        >
          <div 
            className="absolute -top-4 sm:-top-6 md:-top-8 -bottom-4 sm:-bottom-6 md:-bottom-8 right-0 left-0 bg-white rounded-l-[24px] sm:rounded-l-[90px] md:rounded-l-[150px] lg:rounded-l-[180px] border-l border-y border-slate-300/70 shadow-[0_12px_44px_rgba(0,0,0,0.04)] pointer-events-none z-0"
            style={{ right: 0 }}
          />

          <div 
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              alignItems: 'flex-start'
            }}
            className="gap-6 sm:gap-8 lg:gap-10 py-5 sm:py-8 pl-4 sm:pl-14 md:pl-20 pr-3.5 sm:pr-6 md:pr-8"
          >
            {/* Left Info */}
            <div className="w-full lg:max-w-[370px] flex flex-col gap-[0.85rem] shrink-0">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '500', color: '#7B5872', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                <Sparkles size={14} style={{ color: '#7B5872' }} />
                <span>PHASE 1: SALES CYCLE</span>
              </span>
              
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.07rem)', fontWeight: 600, color: '#0F172A', lineHeight: '1.25', margin: 0 }}>
                Customer Orders, Challans & Invoices
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
                {[
                  'Customer master setup with state & payment credit limits',
                  'Sales Order (SO) booking with price lock & item discounts',
                  'Delivery Challan dispatch with live bin deductions',
                  'Automated GST Tax Invoice & financial debit ledger posting',
                  'Receipt voucher reconciliation & bill-by-bill settlement'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5' }}>
                    <span style={{ color: '#7B5872', marginTop: '2px' }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Interactive Steps */}
            <div className="relative w-full lg:max-w-[530px] shrink-0 min-w-0">
              <div className="absolute left-[16px] sm:left-[20px] top-[20px] bottom-[20px] w-[2px] bg-slate-300 pointer-events-none" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {salesSteps.map((step, index) => {
                  const isActive = activeStepSales === index;
                  const IconComp = step.icon;

                  return (
                    <motion.div
                      key={step.num}
                      style={{ position: 'relative', display: 'flex', cursor: 'pointer', alignItems: 'flex-start' }}
                      className="gap-2.5 sm:gap-4"
                      onClick={() => setActiveStepSales(prev => prev === index ? -1 : index)}
                    >
                      <div
                        className="w-[34px] h-[34px] sm:w-[42px] sm:h-[42px] text-xs sm:text-sm font-medium"
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isActive ? '#0F172A' : '#94A3B8',
                          backgroundColor: isActive ? '#0F172A' : '#FFFFFF',
                          color: isActive ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <span>{step.num}</span>
                      </div>

                      <div
                        className="flex-1 min-w-0 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-200"
                        style={{
                          border: `1.5px solid ${isActive ? '#0F172A' : '#CBD5E1'}`,
                          backgroundColor: '#F8FAFC',
                          boxShadow: isActive ? '0 8px 24px -4px rgba(15, 23, 42, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" style={{ backgroundColor: isActive ? '#0F172A' : '#F1F5F9', color: isActive ? '#FFFFFF' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <IconComp size={15} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <span style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500', display: 'block' }}>
                                {step.tag}
                              </span>
                              <h3 style={{ fontSize: 'clamp(0.85rem, 2.2vw, 0.98rem)', fontWeight: 500, color: '#0F172A', margin: 0, lineHeight: '1.3' }}>
                                {step.title}
                              </h3>
                            </div>
                          </div>

                          <div 
                            className="w-6 h-6 sm:w-[26px] sm:h-[26px]"
                            style={{ 
                              borderRadius: '50%', 
                              backgroundColor: '#FFFFFF', 
                              border: '1px solid #E2E8F0',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: '#64748B',
                              transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.25s ease',
                              flexShrink: 0
                            }}
                          >
                            <ChevronDown size={13} />
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ paddingTop: '0.75rem', marginTop: '0.7rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.55', margin: 0 }}>
                                  {step.desc}
                                </p>
                                <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                                  {step.desc2}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginTop: '0.4rem', paddingTop: '0.45rem', borderTop: '1px dashed #CBD5E1' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Document State:</span>
                                  <code style={{ fontSize: '0.7rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '4px', color: '#0F172A', fontWeight: '500' }}>
                                    {step.status}
                                  </code>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PHASE 2: PROCUREMENT & GRN CYCLE (WHITE CURVED CARD - LEFT) */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          padding: '2.5rem 0 3.5rem',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%'
        }}
      >
        <div 
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1040px',
            marginRight: 'auto',
            marginLeft: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}
        >
          <div 
            className="absolute -top-4 sm:-top-6 md:-top-8 -bottom-4 sm:-bottom-6 md:-bottom-8 left-0 right-0 bg-white rounded-r-[24px] sm:rounded-r-[90px] md:rounded-r-[150px] lg:rounded-r-[180px] border-r border-y border-slate-300/70 shadow-[0_12px_44px_rgba(0,0,0,0.04)] pointer-events-none z-0"
            style={{ left: 0 }}
          />

          <div 
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}
            className="gap-6 sm:gap-8 lg:gap-10 py-5 sm:py-8 pr-4 sm:pr-14 md:pr-20 pl-3.5 sm:pl-6 md:pl-8"
          >
            {/* Left Steps */}
            <div className="relative w-full lg:max-w-[540px] shrink-0 min-w-0 order-1">
              <div className="absolute left-[16px] sm:left-[20px] top-[20px] bottom-[20px] w-[2px] bg-slate-300 pointer-events-none" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {procurementSteps.map((step, index) => {
                  const isActive = activeStepProcure === index;
                  const IconComp = step.icon;

                  return (
                    <motion.div
                      key={step.num}
                      style={{ position: 'relative', display: 'flex', cursor: 'pointer', alignItems: 'flex-start' }}
                      className="gap-2.5 sm:gap-4"
                      onClick={() => setActiveStepProcure(prev => prev === index ? -1 : index)}
                    >
                      <div
                        className="w-[34px] h-[34px] sm:w-[42px] sm:h-[42px] text-xs sm:text-sm font-medium"
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isActive ? '#0F172A' : '#94A3B8',
                          backgroundColor: isActive ? '#0F172A' : '#FFFFFF',
                          color: isActive ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <span>{step.num}</span>
                      </div>

                      <div
                        className="flex-1 min-w-0 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-200"
                        style={{
                          border: `1.5px solid ${isActive ? '#0F172A' : '#CBD5E1'}`,
                          backgroundColor: '#F8FAFC',
                          boxShadow: isActive ? '0 8px 24px -4px rgba(15, 23, 42, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" style={{ backgroundColor: isActive ? '#0F172A' : '#F1F5F9', color: isActive ? '#FFFFFF' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <IconComp size={15} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <span style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500', display: 'block' }}>
                                {step.tag}
                              </span>
                              <h3 style={{ fontSize: 'clamp(0.85rem, 2.2vw, 0.98rem)', fontWeight: 500, color: '#0F172A', margin: 0, lineHeight: '1.3' }}>
                                {step.title}
                              </h3>
                            </div>
                          </div>

                          <div 
                            className="w-6 h-6 sm:w-[26px] sm:h-[26px]"
                            style={{ 
                              borderRadius: '50%', 
                              backgroundColor: '#FFFFFF', 
                              border: '1px solid #E2E8F0',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: '#64748B',
                              transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.25s ease',
                              flexShrink: 0
                            }}
                          >
                            <ChevronDown size={13} />
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ paddingTop: '0.75rem', marginTop: '0.7rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.55', margin: 0 }}>
                                  {step.desc}
                                </p>
                                <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                                  {step.desc2}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginTop: '0.4rem', paddingTop: '0.45rem', borderTop: '1px dashed #CBD5E1' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Document State:</span>
                                  <code style={{ fontSize: '0.7rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '4px', color: '#0F172A', fontWeight: '500' }}>
                                    {step.status}
                                  </code>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Info */}
            <div className="w-full lg:max-w-[380px] flex flex-col gap-[0.85rem] shrink-0 order-2">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '500', color: '#7B5872', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                <Sparkles size={14} style={{ color: '#7B5872' }} />
                <span>PHASE 2: PROCUREMENT & GRN</span>
              </span>
              
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.07rem)', fontWeight: 600, color: '#0F172A', lineHeight: '1.25', margin: 0 }}>
                Purchase Orders, GRNs & Inward Stock
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
                {[
                  'Verified vendor onboarding with statutory HSN/GSTIN mapping',
                  'Purchase Order (PO) issuance with bulk Excel import',
                  'Goods Receipt Note (GRN) with gross/tare weights & quality QC',
                  'Purchase Invoice (PI) verification against accepted quantities',
                  'Supplier disbursement payment vouchers with ledger credit'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5' }}>
                    <span style={{ color: '#7B5872', marginTop: '2px' }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BOTTOM CTA */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#FFFFFF', color: '#0F172A', padding: '4rem 1.5rem', textAlign: 'center', borderTop: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h3 style={{ fontFamily: "'Lora', serif", fontSize: '1.75rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.75rem' }}>
            Scale Your Commercial Trade Operations
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            Unify customer orders and supplier procurement with automated document state flows.
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
              <span>Schedule Order Engine Consultation</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={onBack}
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '9999px',
                fontSize: '0.88rem',
                fontWeight: '500',
                backgroundColor: '#F1F5F9',
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
