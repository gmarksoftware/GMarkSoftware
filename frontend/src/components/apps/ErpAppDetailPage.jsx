import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Globe, 
  Wallet, 
  Server,
  RefreshCw,
  Clock,
  Zap,
  Activity,
  LifeBuoy,
  Code2,
  Users,
  MapPin,
  Check,
  ArrowRight,
  Database,
  ChevronDown,
  Sparkles,
  PackageCheck,
  KeyRound,
  FileText,
  Building2,
  Receipt,
  ShoppingCart,
  Truck,
  TrendingUp,
  FileSpreadsheet,
  Cpu,
  BadgePercent,
  CheckCheck,
  SlidersHorizontal,
  FolderTree,
  Terminal,
  HelpCircle,
  Scale,
  BarChart3
} from 'lucide-react';
import { APPLICATIONS } from '../ApplicationsGridSection';
import { getAssetUrl } from '@/utils/asset';

export default function ErpAppDetailPage({ onBack, onOpenExpertModal, onSelectApp }) {
  const [activeStepSales, setActiveStepSales] = useState(0); // active accordion step for Sales Cycle
  const [activeStepProcure, setActiveStepProcure] = useState(0); // active accordion step for Procurement Cycle
  const [activeFinanceTab, setActiveFinanceTab] = useState(0); // active tab for Finance Vouchers

  const metricPills = [
    { label: '< 50ms Query Engine', sub: 'PostgreSQL & Prisma ORM', icon: Database },
    { label: '100% Tax Accuracy', sub: 'CGST, SGST & IGST Engine', icon: BadgePercent },
    { label: '3 Languages', sub: 'English, Marathi & Hindi', icon: Globe },
    { label: 'RBAC & Phone OTP', sub: 'JWT Bearer & AWS SNS', icon: ShieldCheck }
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
      desc2: 'System reserves stock allocation, locks contract prices, and triggers internal dispatch work-order queues.',
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

  const financeVouchers = [
    {
      title: 'Receipt Voucher',
      badge: 'Cash Inflow',
      desc: 'Records incoming funds from customers, debtors, or miscellaneous income.',
      flow: 'Debit: Bank/Cash A/c → Credit: Customer Ledger A/c',
      points: ['Bill-by-bill invoice tagging', 'Automatic settlement adjustment', 'Advance payment holding ledger']
    },
    {
      title: 'Payment Voucher',
      badge: 'Cash Outflow',
      desc: 'Records disbursements to suppliers, vendors, employee salaries, and operational costs.',
      flow: 'Debit: Supplier/Expense A/c → Credit: Bank/Cash A/c',
      points: ['Vendor invoice due-date matching', 'Tax deduction support', 'Audit-ready transaction records']
    },
    {
      title: 'Journal Voucher',
      badge: 'Book Adjustments',
      desc: 'Handles non-cash accounting adjustments, depreciation, provisions, and inter-ledger transfers.',
      flow: 'Debit: Target Ledger A/c → Credit: Source Ledger A/c',
      points: ['Double-entry debit/credit validation', 'Year-end provision entries', 'Cross-department cost allocation']
    },
    {
      title: 'Contra Voucher',
      badge: 'Internal Transfers',
      desc: 'Records internal monetary movements between company bank accounts and cash registers.',
      flow: 'Debit: Destination Bank/Cash → Credit: Source Bank/Cash',
      points: ['Zero tax impact transactions', 'Bank deposit & withdrawal tracking', 'Petty cash fund replenishment']
    }
  ];

  const masterCategories = [
    { title: 'Account Master', desc: 'Central directory for customers, vendors, banks, and party classifications with credit limits.' },
    { title: 'Product Master', desc: 'Complete catalog of SKUs, categories, base pricing, reorder levels, and HSN associations.' },
    { title: 'Unit Master (UOM)', desc: 'Standardized measurement units (kg, ton, quintal, bags, litres, pcs) for precise inventory.' },
    { title: 'HSN / SAC Master', desc: 'Pre-seeded statutory GST tax codes, standard tax rate percentages (5%, 12%, 18%, 28%).' },
    { title: 'Group & Category', desc: 'Multi-level taxonomy hierarchy for structured financial ledger groups and inventory classes.' },
    { title: 'Pincode & Locations', desc: 'State and postal database enabling auto-detection of intra-state vs inter-state tax rules.' }
  ];

  const rolesMatrix = [
    { role: 'Superadmin', desc: 'Highest administrative authority; manages system configurations, tenants, and global audits.', color: '#0F172A' },
    { role: 'Administrator', desc: 'Oversees daily business operations, master approvals, financial controls, and reports.', color: '#0B3A70' },
    { role: 'Seller', desc: 'Focuses on customer sales, quotations, Sales Orders, Challans, and billing invoices.', color: '#16A34A' },
    { role: 'Buyer', desc: 'Manages supplier relations, procurement contracts, Purchase Orders, and GRN verification.', color: '#D97706' },
    { role: 'Operator', desc: 'Executes rapid routine data entry, gate pass records, and daily voucher entries.', color: '#64748B' }
  ];

  const techStack = [
    { category: 'Frontend UI', items: ['React 19', 'Vite 7', 'Redux Toolkit / Saga', 'Tailwind CSS / Inter'] },
    { category: 'Backend API', items: ['NestJS 11', 'TypeScript 5.9', 'Swagger OpenAPI 3.0', 'JWT Bearer Auth'] },
    { category: 'Database & ORM', items: ['PostgreSQL 14+', 'Prisma 6.19 ORM', 'Redis & BullMQ Queues', 'Automated Migrations'] },
    { category: 'Localization & Cloud', items: ['i18next (EN, MR, HI)', 'AWS SNS SMS Gateways', 'Excel Import Engine', 'Secure File Storage'] }
  ];

  const connectedApps = [
    {
      name: 'CMMS',
      desc: 'Man, Machine, Method & Material maintenance orchestration',
      image: getAssetUrl('/4M.png'),
      badge: 'Operations'
    },
    {
      name: 'GramUnnati',
      desc: 'Digital agriculture marketplace & farmer trade advisory',
      image: getAssetUrl('/Final Logo-09.jpg.jpeg'),
      badge: 'Agritech'
    },
    {
      name: 'G-Nova IoT',
      desc: '50Hz telemetry ingestion & weighbridge automation',
      image: getAssetUrl('/G-Nova IOT logo 02.jpg'),
      badge: 'Hardware IoT'
    },
    {
      name: 'G Track',
      desc: 'Enterprise GPS fleet tracking & cold-chain telemetry',
      image: getAssetUrl('/G Track logo.png'),
      badge: 'Live Fleet'
    },
    {
      name: 'SHG App',
      desc: 'Rural logistics & self-help group dispatch network',
      image: getAssetUrl('/SHG Delivary and Transporter Logo 01.jpg'),
      badge: 'Village Network'
    },
    {
      name: 'Transporter App',
      desc: 'Middle-mile route logistics & cluster fleet tracking',
      image: getAssetUrl('/SHG Delivary and Transporter Logo.jpg'),
      badge: 'Logistics'
    },
    {
      name: 'Task Management',
      desc: 'Digital work orders & industrial shift collaboration',
      image: getAssetUrl('/Task Management & Team Collaboration Logo 01.jpg'),
      badge: 'Productivity'
    }
  ];

  return (
    <div style={{ backgroundColor: '#e8e8e8', minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ========================================================================= */}
      {/* 1. HERO HEADER (FIRST PAGE - WHITE WITH GREY CURVATURE ARC) */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#FFFFFF', 
          textAlign: 'center', 
          paddingTop: '2.5rem', 
          paddingBottom: '5rem', 
          paddingLeft: '1.5rem', 
          paddingRight: '1.5rem', 
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle top subtle grid background */}
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
          style={{
            backgroundColor: '#e8e8e8'
          }}
        />

        <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 10 }}>


          {/* Headline matching Lora handwriting font style and #00A3FF brush underline */}
          <div className="relative inline-block">
            <h1 
              className="text-balance text-slate-900"
              style={{ 
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(1.75rem, 4.5vw, 3.87rem)',
                lineHeight: '1.18',
                letterSpacing: '-0.01em',
                paddingTop: '0.25rem',
                paddingBottom: '0.75rem',
                display: 'inline-block',
                position: 'relative',
                zIndex: 1,
                fontWeight: 600
              }}
            >
              <span>Enterprise Resource </span>
              <br className="hidden sm:inline" />
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 font-semibold" style={{ color: '#FC787D' }}>
                  Planning
                </span>
                {/* Hand-drawn marker brush stroke highlight matching hero */}
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
              <span className="text-slate-900 font-semibold"> & Operations</span>
            </h1>

            {/* Floating App Logo Square Card with Hand-drawn Curved Arrow */}
            <div className="hidden sm:flex absolute -right-28 md:-right-36 lg:-right-44 bottom-1 md:bottom-2 items-end z-20 pointer-events-none">
              {/* Hand-drawn curved arrow pointing to the text */}
              <svg
                className="w-14 h-10 md:w-16 md:h-12 lg:w-20 lg:h-14 pointer-events-none overflow-visible -mr-1 mb-2"
                viewBox="0 0 80 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 76 38 C 55 46, 24 38, 8 14"
                  stroke="#7B5872"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 6 24 L 8 12 L 20 16"
                  stroke="#7B5872"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>

              {/* App Logo Square Card */}
              <div 
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '22px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={getAssetUrl("/ERP Logo.png")} 
                  alt="G Mark ERP Logo" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: 'scale(0.9)',
                    borderRadius: '12px'
                  }}
                />
              </div>
            </div>
          </div>

          <p 
            className="text-balance text-gray-600 font-normal"
            style={{ 
              fontSize: 'clamp(0.88rem, 1.58vw, 1.1rem)', 
              lineHeight: '1.65', 
              maxWidth: '760px',
              margin: '1.25rem auto 2.25rem',
              position: 'relative',
              zIndex: 1,
              fontWeight: 400
            }}
          >
            Unified business operations platform for agricultural trading, industrial manufacturing, and procurement. Seamlessly connect customers, suppliers, inventory, tax compliance, and double-entry financial ledgers in one real-time cloud system.
          </p>

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3.75rem', position: 'relative', zIndex: 1 }}>
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
              <span>Request ERP Platform Demo</span>
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
              position: 'relative',
              zIndex: 10,
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
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#EBF3FC', color: '#0B3A70', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconC size={16} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '400', color: '#0F172A', lineHeight: 1.15 }}>
                      {pill.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '400', marginTop: '2px' }}>
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
        id="sales-flow-section"
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
          {/* White Curved Background shape */}
          <div 
            className="absolute -top-4 sm:-top-6 md:-top-8 -bottom-4 sm:-bottom-6 md:-bottom-8 right-0 left-0 bg-white rounded-l-[24px] sm:rounded-l-[90px] md:rounded-l-[150px] lg:rounded-l-[180px] border-l border-y border-slate-300/70 shadow-[0_12px_44px_rgba(0,0,0,0.04)] pointer-events-none z-0"
            style={{ right: 0 }}
          />

          {/* Content inside white curved container */}
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
            
            {/* LEFT: Sales Cycle Info */}
            <div className="w-full lg:max-w-[370px] flex flex-col gap-[0.85rem] shrink-0">
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '500', color: '#0B3A70', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  <Sparkles size={14} style={{ color: '#0B3A70' }} />
                  <span>SALES & BILLING CYCLE</span>
                </span>
                
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.07rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', lineHeight: '1.25', marginTop: '2px', marginBottom: '0.75rem' }}>
                  Customer Orders, <br className="hidden sm:inline" />
                  Challans & Invoices
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#0B3A70', marginTop: '2px' }}>•</span>
                    <span>Creates Customer master & sets credit/payment terms</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#0B3A70', marginTop: '2px' }}>•</span>
                    <span>Books Sales Order (SO) with pricing & item discounts</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#0B3A70', marginTop: '2px' }}>•</span>
                    <span>Dispatches goods via Delivery Challan & updates stock</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#0B3A70', marginTop: '2px' }}>•</span>
                    <span>Auto-generates GST Tax Invoice & posts ledger debits</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#0B3A70', marginTop: '2px' }}>•</span>
                    <span>Reconciles customer receipt voucher & settles outstanding</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Sales Process Steps */}
            <div className="relative w-full lg:max-w-[530px] shrink-0 min-w-0">
              <div 
                className="absolute left-[16px] sm:left-[20px] top-[20px] bottom-[20px] w-[2px] bg-slate-300 pointer-events-none" 
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {salesSteps.map((step, index) => {
                  const isActive = activeStepSales === index;
                  const IconComp = step.icon;

                  return (
                    <motion.div
                      key={step.num}
                      style={{ position: 'relative', display: 'flex', cursor: 'pointer', alignItems: 'flex-start' }}
                      className="gap-2.5 sm:gap-4"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
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
                          flexShrink: 0,
                          transition: 'all 0.25s ease',
                          boxShadow: isActive ? '0 4px 12px rgba(15, 23, 42, 0.2)' : '0 2px 6px rgba(0,0,0,0.04)'
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
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" style={{ backgroundColor: isActive ? '#0F172A' : '#EBF3FC', color: isActive ? '#FFFFFF' : '#0B3A70', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <IconComp size={15} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <span style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500', display: 'block' }}>
                                {step.tag}
                              </span>
                              <h3 style={{ fontSize: 'clamp(0.85rem, 2.2vw, 0.98rem)', fontWeight: 500, color: '#0F172A', margin: 0, lineHeight: '1.3', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
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
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ paddingTop: '0.75rem', marginTop: '0.7rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.55', margin: 0, fontWeight: '400' }}>
                                  {step.desc}
                                </p>
                                <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.5', margin: 0, fontWeight: '400' }}>
                                  {step.desc2}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginTop: '0.4rem', paddingTop: '0.45rem', borderTop: '1px dashed #CBD5E1' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '400' }}>
                                    Document State:
                                  </span>
                                  <code style={{ fontSize: '0.7rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '4px', color: '#0F172A', fontWeight: '500', wordBreak: 'break-all' }}>
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
      {/* 3. PHASE 2: PROCUREMENT & GRN CYCLE (WHITE CURVED CARD ON GREY BG - LEFT) */}
      {/* ========================================================================= */}
      <section 
        id="purchase-flow-section"
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
          {/* White Curved Background shape */}
          <div 
            className="absolute -top-4 sm:-top-6 md:-top-8 -bottom-4 sm:-bottom-6 md:-bottom-8 left-0 right-0 bg-white rounded-r-[24px] sm:rounded-r-[90px] md:rounded-r-[150px] lg:rounded-r-[180px] border-r border-y border-slate-300/70 shadow-[0_12px_44px_rgba(0,0,0,0.04)] pointer-events-none z-0"
            style={{ left: 0 }}
          />

          {/* Content inside white curved container */}
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
            
            {/* LEFT: Purchase Process Steps */}
            <div className="relative w-full lg:max-w-[540px] shrink-0 min-w-0 order-1">
              <div 
                className="absolute left-[16px] sm:left-[20px] top-[20px] bottom-[20px] w-[2px] bg-slate-300 pointer-events-none" 
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {procurementSteps.map((step, index) => {
                  const isActive = activeStepProcure === index;
                  const IconComp = step.icon;

                  return (
                    <motion.div
                      key={step.num}
                      style={{ position: 'relative', display: 'flex', cursor: 'pointer', alignItems: 'flex-start' }}
                      className="gap-2.5 sm:gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
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
                          flexShrink: 0,
                          transition: 'all 0.25s ease',
                          boxShadow: isActive ? '0 4px 12px rgba(15, 23, 42, 0.2)' : '0 2px 6px rgba(0,0,0,0.04)'
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
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" style={{ backgroundColor: isActive ? '#0F172A' : '#EBF3FC', color: isActive ? '#FFFFFF' : '#0B3A70', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <IconComp size={15} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <span style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500', display: 'block' }}>
                                {step.tag}
                              </span>
                              <h3 style={{ fontSize: 'clamp(0.85rem, 2.2vw, 0.98rem)', fontWeight: 500, color: '#0F172A', margin: 0, lineHeight: '1.3', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
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
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ paddingTop: '0.75rem', marginTop: '0.7rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.55', margin: 0, fontWeight: '400' }}>
                                  {step.desc}
                                </p>
                                <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.5', margin: 0, fontWeight: '400' }}>
                                  {step.desc2}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginTop: '0.4rem', paddingTop: '0.45rem', borderTop: '1px dashed #CBD5E1' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '400' }}>
                                    Document State:
                                  </span>
                                  <code style={{ fontSize: '0.7rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '4px', color: '#0F172A', fontWeight: '500', wordBreak: 'break-all' }}>
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

            {/* RIGHT: Purchase Process Info */}
            <div className="w-full lg:max-w-[380px] flex flex-col gap-[0.85rem] shrink-0 order-2">
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '500', color: '#0B3A70', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  <Sparkles size={14} style={{ color: '#0B3A70' }} />
                  <span>PROCUREMENT & GRN LIFECYCLE</span>
                </span>
                
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.07rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', lineHeight: '1.25', marginTop: '2px', marginBottom: '0.75rem' }}>
                  Purchase Orders, <br className="hidden sm:inline" />
                  GRNs & Inward Stock
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#0B3A70', marginTop: '2px' }}>•</span>
                    <span>Onboards verified suppliers & associates HSN/SAC codes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#0B3A70', marginTop: '2px' }}>•</span>
                    <span>Issues official Purchase Orders with pricing and bulk Excel import</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#0B3A70', marginTop: '2px' }}>•</span>
                    <span>Generates Goods Receipt Notes (GRN) with strict quantity tracking</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#0B3A70', marginTop: '2px' }}>•</span>
                    <span>Verifies vendor Purchase Invoices against inward GRN logs</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#0B3A70', marginTop: '2px' }}>•</span>
                    <span>Executes disbursement payment vouchers & updates ledger credits</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DOUBLE-ENTRY FINANCE, VOUCHERS & GST RULES */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#e8e8e8', padding: '4rem 0 4.5rem', borderTop: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              FINANCIAL CORE & TAX ENGINE
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.16rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px', lineHeight: '1.25' }}>
              Double-Entry Accounting & Automated GST Engine
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.92rem', maxWidth: '680px', margin: '0.5rem auto 0', lineHeight: '1.6' }}>
              Complete financial control with multi-voucher journals, automated Debit/Credit postings, intra vs inter-state tax logic, and real-time ledger histories.
            </p>
          </div>

          {/* 4 Voucher Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            {financeVouchers.map((v, idx) => (
              <div 
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: '500', color: '#0F172A', margin: 0 }}>
                    {v.title}
                  </h3>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '100px', backgroundColor: '#EBF3FC', color: '#0B3A70', border: '1px solid #CBD5E1' }}>
                    {v.badge}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: '1.55' }}>
                  {v.desc}
                </p>

                <div style={{ backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '10px', padding: '0.65rem 0.75rem', fontSize: '0.75rem', color: '#0F172A', fontWeight: '500' }}>
                  {v.flow}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {v.points.map((pt, pIdx) => (
                    <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#64748B' }}>
                      <Check size={13} style={{ color: '#16A34A', flexShrink: 0 }} />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* GST Rules & State Logic Comparison Card - Extended to Left Edge */}
        <div 
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start'
          }}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: 'calc(50vw + 560px)',
              marginRight: 'auto',
              marginLeft: 0,
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              borderTop: '1px solid #CBD5E1',
              borderBottom: '1px solid #CBD5E1',
              borderRight: '1px solid #CBD5E1',
              borderLeft: 'none',
              borderTopRightRadius: '28px',
              borderBottomRightRadius: '28px',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
              paddingTop: '2rem',
              paddingBottom: '2rem',
              paddingRight: '1.25rem',
              paddingLeft: 'max(1.25rem, calc((100vw - 1120px) / 2 + 1.5rem))',
              boxSizing: 'border-box'
            }}
          >
            <div 
              style={{
                maxWidth: '1072px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '1.5rem',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#0B3A70', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '500' }}>
                  <Scale size={14} style={{ color: '#0B3A70' }} />
                  <span>STATE-BASED GST COMPUTATION</span>
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: '400', color: '#0F172A', margin: 0, marginBottom: '0.75rem' }}>
                  Automated Intra-State vs Inter-State Tax Rules
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  G Mark ERP automatically inspects company registration state vs customer/supplier state to apply compliant statutory tax schedules without manual calculation errors.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#0284C7' }}>Intra-State Transaction (Same State)</span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', padding: '2px 7px', borderRadius: '6px', fontWeight: '500' }}>CGST + SGST</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
                    GST is split equally: e.g. 18% tax = <strong style={{ color: '#0F172A' }}>CGST 9%</strong> (Central) + <strong style={{ color: '#0F172A' }}>SGST 9%</strong> (State).
                  </p>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#16A34A' }}>Inter-State Transaction (Different State)</span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '2px 7px', borderRadius: '6px', fontWeight: '500' }}>IGST</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
                    Full statutory tax applies as integrated tax: e.g. 18% tax = <strong style={{ color: '#0F172A' }}>IGST 18%</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. FINANCIAL REPORTING — PROFIT & LOSS REPORT */}
      {/* ========================================================================= */}
      <section 
        id="profit-loss-section"
        style={{ 
          backgroundColor: '#e8e8e8', 
          padding: '4.5rem 0 5rem', 
          borderTop: '1px solid #CBD5E1' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Content & Features */}
            <motion.div 
              className="lg:col-span-5 flex flex-col justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#0B3A70', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '500' }}>
                <BarChart3 size={15} style={{ color: '#0B3A70' }} />
                <span>FINANCIAL REPORTING</span>
              </div>

              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.3rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', lineHeight: '1.25', margin: '0 0 1rem' }}>
                Profit & Loss Report
              </h2>

              <p style={{ color: '#475569', fontSize: '0.96rem', lineHeight: '1.65', margin: '0 0 1.75rem' }}>
                The Profit & Loss Report displays the company's financial performance for a selected period. It provides a clear overview of revenue, expenditure, gross profit, and net profit.
              </p>

              {/* Key Features List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {[
                  'View total revenue, total expenditure, gross profit, and net profit.',
                  'Review detailed income and expenditure entries, including Sales, Purchase, Direct Expenses, and Closing Stock.',
                  'Select a financial year or customize the date range.',
                  'Use Expand All to view detailed account group information.',
                  'Export reports for accounting, financial review, and business analysis.'
                ].map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div 
                      style={{ 
                        width: '22px', 
                        height: '22px', 
                        borderRadius: '50%', 
                        backgroundColor: '#EBF3FC', 
                        color: '#0B3A70', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0,
                        marginTop: '2px',
                        border: '1px solid #CBD5E1'
                      }}
                    >
                      <Check size={13} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.55', fontWeight: '400' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Actual Screenshot Display */}
            <motion.div 
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div 
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 36px -6px rgba(15, 23, 42, 0.08), 0 4px 14px rgba(0, 0, 0, 0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Clean Enterprise Top Window Header Bar */}
                <div 
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                    padding: '9px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#CBD5E1' }} />
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#E2E8F0' }} />
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#E2E8F0' }} />
                  </div>
                  
                  <div 
                    style={{
                      fontSize: '0.72rem',
                      color: '#475569',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '2px 12px',
                      fontWeight: '400',
                      letterSpacing: '0.01em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>app.gmarkerp.com/reports/profit-loss</span>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: '500' }}>Live System</span>
                  </div>
                </div>

                {/* Screenshot Frame */}
                <div style={{ padding: '8px', backgroundColor: '#F8FAFC' }}>
                  <img 
                    src={getAssetUrl('/Screenshot 2026-10-13 105644.png')}
                    alt="G Mark ERP Profit & Loss Report"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Caption Bar */}
                <div 
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#FFFFFF',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#0F172A', fontWeight: '500' }}>
                    <TrendingUp size={14} style={{ color: '#0B3A70' }} />
                    Financial Reporting & Analysis
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Trading Account, Income & Expenditure Ledger
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MASTERS MODULE — YOUR ERP DATA FOUNDATION */}
      {/* ========================================================================= */}
      <section 
        id="masters-module-section"
        style={{ 
          backgroundColor: '#e8e8e8', 
          padding: '4.5rem 0 5rem', 
          borderTop: '1px solid #CBD5E1' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Actual Screenshot Display (Alternating order on desktop) */}
            <motion.div 
              className="lg:col-span-7 order-2 lg:order-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div 
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 36px -6px rgba(15, 23, 42, 0.08), 0 4px 14px rgba(0, 0, 0, 0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Clean Enterprise Top Window Header Bar */}
                <div 
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                    padding: '9px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#CBD5E1' }} />
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#E2E8F0' }} />
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#E2E8F0' }} />
                  </div>
                  
                  <div 
                    style={{
                      fontSize: '0.72rem',
                      color: '#475569',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '2px 12px',
                      fontWeight: '400',
                      letterSpacing: '0.01em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>app.gmarkerp.com/masters/group-master</span>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: '500' }}>Live System</span>
                  </div>
                </div>

                {/* Screenshot Frame */}
                <div style={{ padding: '8px', backgroundColor: '#F8FAFC' }}>
                  <img 
                    src={getAssetUrl('/Screenshot 2026-10-13 105712.png')}
                    alt="G Mark ERP Masters Module"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Caption Bar */}
                <div 
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#FFFFFF',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#0F172A', fontWeight: '500' }}>
                    <FolderTree size={14} style={{ color: '#0B3A70' }} />
                    ERP Master Directory & Data Foundation
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Centralized Data Governance & Categories
                  </span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Content & 6 Master Types (Alternating order on desktop) */}
            <motion.div 
              className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#0B3A70', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '500' }}>
                <Database size={15} style={{ color: '#0B3A70' }} />
                <span>SYSTEM MASTERS</span>
              </div>

              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.3rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', lineHeight: '1.25', margin: '0 0 1rem' }}>
                Masters — Your ERP Data Foundation
              </h2>

              <p style={{ color: '#475569', fontSize: '0.96rem', lineHeight: '1.65', margin: '0 0 1.5rem' }}>
                The Masters module is used to create and manage the fundamental data required for day-to-day ERP operations. It provides a centralized foundation for managing financial accounts, products, categories, units, and tax classifications.
              </p>

              {/* 6 Master Types Grid */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', 
                  gap: '0.75rem' 
                }}
              >
                {[
                  { title: 'Group Master', desc: 'Organizes financial accounts into meaningful groups.', icon: FolderTree },
                  { title: 'Account Master', desc: 'Manages customer, supplier, and other account details.', icon: Building2 },
                  { title: 'Unit Master', desc: 'Defines measurement units used for products.', icon: Scale },
                  { title: 'Category Master', desc: 'Organizes products into relevant categories.', icon: Layers },
                  { title: 'HSN Master', desc: 'Manages tax classification codes.', icon: BadgePercent },
                  { title: 'Product Master', desc: 'Stores product details, pricing, and related information.', icon: ShoppingCart }
                ].map((master, idx) => {
                  const IconComp = master.icon;
                  return (
                    <div 
                      key={idx}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '12px',
                        padding: '0.85rem 0.95rem',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: '#EBF3FC', color: '#0B3A70', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <IconComp size={13} />
                        </div>
                        <h4 style={{ fontSize: '0.86rem', fontWeight: '600', color: '#0F172A', margin: 0 }}>
                          {master.title}
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.45', margin: '2px 0 0', paddingLeft: '29px' }}>
                        {master.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. MASTER DATA DIRECTORY & ROLES MATRIX */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#e8e8e8', padding: '4rem 0 4.5rem', borderTop: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              SYSTEM MASTERS & SECURITY
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.07rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px', lineHeight: '1.25' }}>
              Master Data Hierarchy & Role-Based Access (RBAC)
            </h2>
          </div>

          {/* Master Directory Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem', marginBottom: '2.75rem' }}>
            {masterCategories.map((m, idx) => (
              <div 
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <FolderTree size={16} style={{ color: '#0B3A70' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '500', color: '#0F172A', margin: 0 }}>
                    {m.title}
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: '1.55' }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* User Roles & Permissions Matrix - Extended to Right Edge */}
        <div 
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: 'calc(50vw + 560px)',
              marginLeft: 'auto',
              marginRight: 0,
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #CBD5E1',
              borderBottom: '1px solid #CBD5E1',
              borderLeft: '1px solid #CBD5E1',
              borderRight: 'none',
              borderTopLeftRadius: '28px',
              borderBottomLeftRadius: '28px',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
              paddingTop: '2rem',
              paddingBottom: '2rem',
              paddingLeft: '1.25rem',
              paddingRight: 'max(1.25rem, calc((100vw - 1120px) / 2 + 1.5rem))',
              boxSizing: 'border-box'
            }}
          >
            <div 
              style={{
                maxWidth: '1072px',
                marginLeft: 'auto',
                marginRight: 0
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: '500', color: '#0F172A', margin: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: '#0B3A70' }} />
                <span>User Roles & Permission Boundaries</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.85rem' }}>
                {rolesMatrix.map((r, idx) => (
                  <div 
                    key={idx}
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '1rem',
                      borderLeft: `4px solid ${r.color}`
                    }}
                  >
                    <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#0F172A', marginBottom: '4px' }}>
                      {r.role}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: '1.45' }}>
                      {r.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. TECHNICAL ARCHITECTURE & DEVELOPER SUITE */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#e8e8e8', padding: '4rem 0 4.5rem', borderTop: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ARCHITECTURE & INFRASTRUCTURE
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.07rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px', lineHeight: '1.25' }}>
              Enterprise Full-Stack Technology Architecture
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {techStack.map((stack, idx) => (
              <div 
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <h3 style={{ fontSize: '0.9rem', fontWeight: '500', color: '#0B3A70', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, marginBottom: '0.75rem' }}>
                  {stack.category}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {stack.items.map((item, iIdx) => (
                    <div key={iIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#334155' }}>
                      <Code2 size={14} style={{ color: '#0F172A', flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Golden Rule Callout Banner */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #93C5FD',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              <Zap size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1E40AF', margin: 0, marginBottom: '4px' }}>
                The Golden Architectural Rule of G Mark ERP
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#1E3A8A', margin: 0, lineHeight: '1.6' }}>
                "Understand the business flow first → Understand the code → Make the smallest safe change → Test the complete affected downstream flow (Sales Order → Challan → Invoice → Receipt → Ledger)."
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CONNECTED GMU PLATFORM ECOSYSTEM */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#e8e8e8', padding: '4rem 0 4.5rem', borderTop: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              INTEGRATED ECOSYSTEM
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 1.98rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px', lineHeight: '1.25' }}>
              Connected Enterprise Platforms
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
            {[
              { id: 'g-nova-iot', name: 'G-Nova IoT', tag: 'G-Nova Telemetry & 4M ERP', image: getAssetUrl('/g-nova-clean.png') },
              { id: 'g-track', name: 'G Track', tag: 'Field Force & GPS Telemetry', image: getAssetUrl('/G Track logo.png') },
              { id: 'gram-unnati', name: 'GramUnnati', tag: 'Agri-Commerce Platform', image: getAssetUrl('/gramunnati-clean.png') },
              { id: 'task-management', name: 'SynkroBoard', tag: 'Task Management & Collaboration', image: getAssetUrl('/synkroboard-clean.png') }
            ].map((app, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  if (onSelectApp) {
                    const found = APPLICATIONS.find(a => a.id === app.id) || { id: app.id };
                    onSelectApp(found);
                  } else {
                    window.history.pushState({ page: 'app-detail', appId: app.id }, '', `/app/${app.id}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '14px',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease'
                }}
                className="hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                <div style={{ width: '56px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img 
                    src={app.image} 
                    alt={app.name} 
                    style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }} 
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0F172A', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {app.name}
                  </h3>
                  <p style={{ fontSize: '0.74rem', color: '#EA580C', fontWeight: '700', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {app.tag}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. BOTTOM CTA CALLOUT */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#FFFFFF', color: '#0F172A', padding: '4.5rem 1.5rem', textAlign: 'center', borderTop: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.5rem, 3.17vw, 2.24rem)', fontWeight: 600, letterSpacing: '0', margin: 0, marginBottom: '1rem', color: '#0F172A', lineHeight: '1.3' }}>
            <span>Transform Your Enterprise Operations with </span>
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 text-slate-900 font-normal">
                G Mark ERP
              </span>
              {/* Hand-drawn marker brush stroke highlight */}
              <svg
                className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2.5 sm:h-3.5 pointer-events-none z-0 overflow-visible"
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
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: '1.6', margin: 0, marginBottom: '2rem' }}>
            Schedule an interactive product consultation with our engineering and deployment team to evaluate tailored ERP integration for your supply chain.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: '500',
                backgroundColor: '#7B5872',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 10px rgba(123, 88, 114, 0.28)'
              }}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <span>Schedule Enterprise Consultation</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={onBack}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: '500',
                backgroundColor: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              className="hover:bg-slate-100 hover:text-slate-900 transition-colors"
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
