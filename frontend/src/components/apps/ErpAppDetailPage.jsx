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
  BarChart3,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { APPLICATIONS } from '../ApplicationsGridSection';
import { getAssetUrl } from '@/utils/asset';

export default function ErpAppDetailPage({ app, onBack, onOpenExpertModal, onSelectApp }) {
  const [activeStepSales, setActiveStepSales] = useState(0); // active step for Sales Cycle
  const [activeStepProcure, setActiveStepProcure] = useState(0); // active step for Procurement Cycle

  const metricPills = [
    { label: '< 50ms Query Engine', sub: 'PostgreSQL & Prisma ORM', icon: Database, accent: '#0284c7' },
    { label: '100% Tax Accuracy', sub: 'CGST, SGST & IGST Engine', icon: BadgePercent, accent: '#16a34a' },
    { label: '3 Languages', sub: 'English, Marathi & Hindi', icon: Globe, accent: '#8b5cf6' },
    { label: 'RBAC & Phone OTP', sub: 'JWT Bearer & AWS SNS', icon: ShieldCheck, accent: '#ea580c' }
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
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Wallet,
      desc: 'Records incoming funds from customers, debtors, or miscellaneous income.',
      flow: 'Debit: Bank/Cash A/c → Credit: Customer Ledger A/c',
      points: ['Bill-by-bill invoice tagging', 'Automatic settlement adjustment', 'Advance payment holding ledger']
    },
    {
      title: 'Payment Voucher',
      badge: 'Cash Outflow',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: Receipt,
      desc: 'Records disbursements to suppliers, vendors, employee salaries, and operational costs.',
      flow: 'Debit: Supplier/Expense A/c → Credit: Bank/Cash A/c',
      points: ['Vendor invoice due-date matching', 'Tax deduction support', 'Audit-ready transaction records']
    },
    {
      title: 'Journal Voucher',
      badge: 'Book Adjustments',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: FileSpreadsheet,
      desc: 'Handles non-cash accounting adjustments, depreciation, provisions, and inter-ledger transfers.',
      flow: 'Debit: Target Ledger A/c → Credit: Source Ledger A/c',
      points: ['Double-entry debit/credit validation', 'Year-end provision entries', 'Cross-department cost allocation']
    },
    {
      title: 'Contra Voucher',
      badge: 'Internal Transfers',
      badgeColor: 'bg-red-50 text-red-600 border-red-200',
      icon: RefreshCw,
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
    { role: 'Superadmin', desc: 'Highest administrative authority; manages system configurations, tenants, and global audits.', color: '#0F172A', badge: 'Full Control' },
    { role: 'Administrator', desc: 'Oversees daily business operations, master approvals, financial controls, and reports.', color: '#0B3A70', badge: 'Ops Master' },
    { role: 'Seller', desc: 'Focuses on customer sales, quotations, Sales Orders, Challans, and billing invoices.', color: '#16A34A', badge: 'Sales Desk' },
    { role: 'Buyer', desc: 'Manages supplier relations, procurement contracts, Purchase Orders, and GRN verification.', color: '#D97706', badge: 'Procurement' },
    { role: 'Operator', desc: 'Executes rapid routine data entry, gate pass records, and daily voucher entries.', color: '#64748B', badge: 'Data Entry' }
  ];

  const techStack = [
    { category: 'Frontend UI', items: ['React 19', 'Vite 7', 'Redux Toolkit / Saga', 'Tailwind CSS / Inter'], icon: Laptop },
    { category: 'Backend API', items: ['NestJS 11', 'TypeScript 5.9', 'Swagger OpenAPI 3.0', 'JWT Bearer Auth'], icon: Server },
    { category: 'Database & ORM', items: ['PostgreSQL 14+', 'Prisma 6.19 ORM', 'Redis & BullMQ Queues', 'Automated Migrations'], icon: Database },
    { category: 'Localization & Cloud', items: ['i18next (EN, MR, HI)', 'AWS SNS SMS Gateways', 'Excel Import Engine', 'Secure File Storage'], icon: Globe }
  ];

  const connectedApps = [
    {
      id: 'g-nova-iot',
      name: 'G-Nova IoT',
      tag: 'G-Nova Telemetry & 4M ERP',
      image: getAssetUrl('/g-nova-clean.png'),
      badge: 'Hardware IoT'
    },
    {
      id: 'g-track',
      name: 'G Track',
      tag: 'Field Force & GPS Telemetry',
      image: getAssetUrl('/G Track logo.png'),
      badge: 'Live Fleet'
    },
    {
      id: 'gram-unnati',
      name: 'GramUnnati',
      tag: 'Agri-Commerce Platform',
      image: getAssetUrl('/gramunnati-clean.png'),
      badge: 'Agritech'
    },
    {
      id: 'task-management',
      name: 'SynkroBoard',
      tag: 'Task Management & Collaboration',
      image: getAssetUrl('/SynkroBoard.png'),
      badge: 'Productivity'
    }
  ];

  return (
    <div className="w-full bg-[#FCFCFD] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden selection:bg-red-100 selection:text-[#FC787D]">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (High-End SaaS Minimalist Atmosphere Inspired by Image 1)  */}
      {/* ========================================================================= */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-white via-[#FCFCFD] to-slate-50/70 border-b border-slate-100">
        
        {/* Soft Ambient Radial Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-red-100/40 via-rose-50/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -top-12 right-10 w-96 h-96 bg-sky-50/60 rounded-full blur-3xl pointer-events-none -z-10" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10"
          style={{
            backgroundImage: `radial-gradient(#0F172A 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Eyebrow Pill Tag */}
          <motion.div 
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1F2] border border-[#FED7D9] shadow-xs mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#FC787D] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-[#FC787D] uppercase tracking-widest">
              Enterprise Resource Planning &amp; Automation
            </span>
          </motion.div>

          {/* High-Impact Headline with Elegant Accent */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative inline-block mb-5 sm:mb-6"
          >
            <h1 
              className="text-slate-900 tracking-tight text-3xl sm:text-5xl lg:text-[62px] font-extrabold leading-[1.12]"
              style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.025em' }}
            >
              <span>Enterprise Resource </span>
              <br className="hidden sm:inline" />
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 font-extrabold" style={{ color: '#FC787D' }}>
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
                    fill="#FC787D"
                    fillOpacity="0.25"
                  />
                </svg>
              </span>
              <span className="text-slate-900"> &amp; Operations</span>
            </h1>

            {/* Playful Hand-drawn curved arrow & Floating App Logo Card */}
            <div className="hidden md:flex absolute -right-28 lg:-right-36 bottom-2 items-end z-20 pointer-events-none">
              <svg
                className="w-14 h-10 lg:w-16 lg:h-12 pointer-events-none overflow-visible -mr-1 mb-2 text-[#FC787D]"
                viewBox="0 0 80 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 76 38 C 55 46, 24 38, 8 14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 6 24 L 8 12 L 20 16"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>

              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white border border-slate-200/90 p-2.5 flex items-center justify-center shadow-xl ring-1 ring-slate-900/5 rotate-3">
                <img 
                  src={getAssetUrl("/ERP Logo.png")} 
                  alt="G Mark ERP Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </motion.div>

          {/* Subtitle / Paragraph (100% Exact Text Preserved) */}
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl mx-auto mb-8 font-normal text-balance"
          >
            Unified business operations platform for agricultural trading, industrial manufacturing, and procurement. Seamlessly connect customers, suppliers, inventory, tax compliance, and double-entry financial ledgers in one real-time cloud system.
          </motion.p>

          {/* Action Buttons (High-End SaaS Square-Curved Buttons) */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3.5 mb-14"
          >
            <button
              type="button"
              onClick={onOpenExpertModal}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-md text-sm font-semibold text-white bg-[#FC787D] hover:bg-[#E86368] shadow-lg shadow-[#FC787D]/20 hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              <span>Request ERP Platform Demo</span>
              <ArrowRight size={16} />
            </button>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back to Solutions</span>
              </button>
            )}
          </motion.div>

          {/* ================================================================= */}
          {/* FLOATING HERO DASHBOARD MOCKUP (Inspired by Image 1's Kanban hero) */}
          {/* ================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.35 }}
            className="w-full max-w-4xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-2xl ring-1 ring-slate-900/5 overflow-hidden text-left mb-12"
          >
            {/* macOS Browser Header Bar */}
            <div className="bg-slate-50/90 border-b border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400/90" />
                <span className="w-3 h-3 rounded-full bg-amber-400/90" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/90" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-slate-200/80 text-[11px] text-slate-500 font-mono">
                <span>app.gmarkerp.com/dashboard/operations</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live System</span>
              </div>
            </div>

            {/* Dashboard Inner Quick-Action Pipeline Preview */}
            <div className="p-4 sm:p-6 bg-gradient-to-b from-white to-slate-50/40">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Enterprise Operations Flow &amp; Financial Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dual-cycle orchestration: Sales Fulfillment + Procurement Inward
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#FC787D]/10 text-[#FC787D] border border-[#FC787D]/20">
                    Unified Cloud ERP
                  </span>
                </div>
              </div>

              {/* 5-Stage Visual Workflow Breadcrumb Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {[
                  { step: '01', title: 'Master Setup', sub: 'Accounts & Taxes', color: 'border-slate-200 bg-white' },
                  { step: '02', title: 'Order Booking', sub: 'SO / PO Lock', color: 'border-slate-200 bg-white' },
                  { step: '03', title: 'Warehouse Dispatch', sub: 'Challan / GRN', color: 'border-slate-200 bg-white' },
                  { step: '04', title: 'Tax Invoice', sub: 'Auto CGST/SGST/IGST', color: 'border-slate-200 bg-white' },
                  { step: '05', title: 'Settlement', sub: 'Receipt / Payment', color: 'border-red-200 bg-red-50/60' }
                ].map((s, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl border ${s.color} shadow-2xs text-left`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{s.step}</span>
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    </div>
                    <div className="font-bold text-slate-800 text-[11.5px] truncate">{s.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Metric Highlights Ribbon (100% Exact Metric Values & Text) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto"
          >
            {metricPills.map((pill, idx) => {
              const IconC = pill.icon;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl p-4 bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3.5 text-left"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: `${pill.accent}12`, borderColor: `${pill.accent}30`, color: pill.accent }}
                  >
                    <IconC size={18} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-[13px] font-bold text-slate-900 leading-tight">
                      {pill.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {pill.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PHASE 1: SALES & DISTRIBUTION CYCLE (Split Screen: Text Left, Mockup Right) */}
      {/* ========================================================================= */}
      <section id="sales-flow-section" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-start">
            
            {/* LEFT COLUMN: Sales Cycle Typography & Value Propositions */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 flex flex-col justify-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                <Sparkles size={14} className="text-[#0B3A70]" />
                <span>SALES &amp; BILLING CYCLE</span>
              </div>
              
              <h2 
                className="text-slate-900 tracking-tight text-2xl sm:text-4xl font-extrabold leading-tight mb-4"
                style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.025em' }}
              >
                Customer Orders, <br className="hidden sm:inline" />
                <span className="text-[#FC787D]">Challans &amp; Invoices</span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                Seamlessly guide demand from initial customer contract booking to final payment settlement with automated tax rules and ledger reconciliation.
              </p>

              {/* Verified Checklist Points (100% Exact Text) */}
              <div className="space-y-3 mb-8">
                {[
                  'Creates Customer master & sets credit/payment terms',
                  'Books Sales Order (SO) with pricing & item discounts',
                  'Dispatches goods via Delivery Challan & updates stock',
                  'Auto-generates GST Tax Invoice & posts ledger debits',
                  'Reconciles customer receipt voucher & settles outstanding'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={2.5} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Action Pill Badge */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">End-to-End Traceability</div>
                  <div className="text-[11px] text-slate-500">Every invoice references order origin &amp; challan IDs</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  5-Step Pipeline
                </span>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Interactive Floating Sales Step Card */}
            <motion.div 
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="lg:col-span-7"
            >
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl ring-1 ring-slate-900/5 p-5 sm:p-7 relative">
                
                {/* Header Bar */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Sales Execution Flow
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Click steps to inspect details</span>
                </div>

                {/* Connected Step Cards */}
                <div className="space-y-3 relative">
                  {salesSteps.map((step, index) => {
                    const isActive = activeStepSales === index;
                    const IconComp = step.icon;

                    return (
                      <div
                        key={step.num}
                        onClick={() => setActiveStepSales(prev => prev === index ? -1 : index)}
                        className={`rounded-2xl p-4 sm:p-4.5 border transition-all duration-200 cursor-pointer ${
                          isActive 
                            ? 'bg-slate-50/80 border-slate-300 ring-2 ring-slate-900/5 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {step.num}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                {step.tag}
                              </span>
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {step.title}
                              </h3>
                            </div>
                          </div>

                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border border-slate-200 bg-white text-slate-400 shrink-0 transition-transform duration-200 ${
                            isActive ? 'rotate-180 text-slate-900' : ''
                          }`}>
                            <ChevronDown size={14} />
                          </div>
                        </div>

                        {/* Expandable Accordion Body */}
                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3.5 mt-3 border-t border-slate-200/80 space-y-2 text-xs">
                                <p className="text-slate-700 leading-relaxed font-medium">
                                  {step.desc}
                                </p>
                                <p className="text-slate-500 leading-relaxed">
                                  {step.desc2}
                                </p>

                                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-dashed border-slate-200">
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    Document State:
                                  </span>
                                  <code className="text-[10px] font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800">
                                    {step.status}
                                  </code>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PHASE 2: PROCUREMENT & GRN CYCLE (Alternating: Mockup Left, Text Right) */}
      {/* ========================================================================= */}
      <section id="purchase-flow-section" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-start">
            
            {/* LEFT COLUMN: Interactive Floating Procurement Step Card (Swapped Order on Desktop) */}
            <motion.div 
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
              className="lg:col-span-7 order-2 lg:order-1"
            >
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl ring-1 ring-slate-900/5 p-5 sm:p-7 relative">
                
                {/* Header Bar */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Procurement &amp; Inward Flow
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Click steps to inspect details</span>
                </div>

                {/* Connected Step Cards */}
                <div className="space-y-3 relative">
                  {procurementSteps.map((step, index) => {
                    const isActive = activeStepProcure === index;
                    const IconComp = step.icon;

                    return (
                      <div
                        key={step.num}
                        onClick={() => setActiveStepProcure(prev => prev === index ? -1 : index)}
                        className={`rounded-2xl p-4 sm:p-4.5 border transition-all duration-200 cursor-pointer ${
                          isActive 
                            ? 'bg-slate-50/80 border-slate-300 ring-2 ring-slate-900/5 shadow-sm' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {step.num}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                {step.tag}
                              </span>
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {step.title}
                              </h3>
                            </div>
                          </div>

                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border border-slate-200 bg-white text-slate-400 shrink-0 transition-transform duration-200 ${
                            isActive ? 'rotate-180 text-slate-900' : ''
                          }`}>
                            <ChevronDown size={14} />
                          </div>
                        </div>

                        {/* Expandable Accordion Body */}
                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3.5 mt-3 border-t border-slate-200/80 space-y-2 text-xs">
                                <p className="text-slate-700 leading-relaxed font-medium">
                                  {step.desc}
                                </p>
                                <p className="text-slate-500 leading-relaxed">
                                  {step.desc2}
                                </p>

                                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-dashed border-slate-200">
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    Document State:
                                  </span>
                                  <code className="text-[10px] font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800">
                                    {step.status}
                                  </code>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

              </div>
            </motion.div>

            {/* RIGHT COLUMN: Procurement Cycle Typography & Value Propositions */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                <Sparkles size={14} className="text-amber-700" />
                <span>PROCUREMENT &amp; GRN LIFECYCLE</span>
              </div>
              
              <h2 
                className="text-slate-900 tracking-tight text-2xl sm:text-4xl font-extrabold leading-tight mb-4"
                style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.025em' }}
              >
                Purchase Orders, <br className="hidden sm:inline" />
                <span className="text-[#FC787D]">GRNs &amp; Inward Stock</span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                Control vendor relations, manage purchase contracts with structured bulk imports, inward goods receipt notes with weight QC, and automate payable disbursements.
              </p>

              {/* Verified Checklist Points (100% Exact Text) */}
              <div className="space-y-3 mb-8">
                {[
                  'Onboards verified suppliers & associates HSN/SAC codes',
                  'Issues official Purchase Orders with pricing and bulk Excel import',
                  'Generates Goods Receipt Notes (GRN) with strict quantity tracking',
                  'Verifies vendor Purchase Invoices against inward GRN logs',
                  'Executes disbursement payment vouchers & updates ledger credits'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={2.5} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Action Pill Badge */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Multi-Tier Approval Matrix</div>
                  <div className="text-[11px] text-slate-500">Supports managerial sign-offs before PO lock</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  QC &amp; Gate Pass
                </span>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FINANCIAL CORE & TAX ENGINE (Double-Entry Vouchers & State Tax Rules)   */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold text-[#0B3A70] uppercase tracking-widest block mb-2">
              FINANCIAL CORE &amp; TAX ENGINE
            </span>
            <h2 
              className="text-slate-900 tracking-tight text-2xl sm:text-4xl lg:text-[42px] font-extrabold leading-tight mb-4"
              style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.025em' }}
            >
              Double-Entry Accounting &amp; Automated GST Engine
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Complete financial control with multi-voucher journals, automated Debit/Credit postings, intra vs inter-state tax logic, and real-time ledger histories.
            </p>
          </div>

          {/* 4 Voucher Cards Grid (Matching Image 1's Card Grid standard) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {financeVouchers.map((v, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-base font-bold text-slate-900">
                      {v.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${v.badgeColor}`}>
                      {v.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {v.desc}
                  </p>

                  {/* Flow Diagram Box */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-800 font-bold mb-4 leading-snug">
                    {v.flow}
                  </div>

                  {/* Bullet Checklist */}
                  <div className="space-y-1.5">
                    {v.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check size={13} className="text-emerald-500 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* State-Based GST Computation Comparison (Ultra-Clean Split SaaS Card) */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/90 shadow-lg p-6 sm:p-8 lg:p-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#0B3A70] uppercase tracking-wider mb-3 shadow-2xs">
                  <Scale size={14} />
                  <span>STATE-BASED GST COMPUTATION</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mb-3">
                  Automated Intra-State vs Inter-State Tax Rules
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  G Mark ERP automatically inspects company registration state vs customer/supplier state to apply compliant statutory tax schedules without manual calculation errors.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Intra-State Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-700">Intra-State Transaction</span>
                    <span className="text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full">
                      CGST + SGST
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    GST is split equally: e.g. 18% tax = <strong className="text-slate-900">CGST 9%</strong> (Central) + <strong className="text-slate-900">SGST 9%</strong> (State).
                  </p>
                  <div className="text-[11px] text-slate-400 font-medium">Applied when Buyer &amp; Seller in same state</div>
                </div>

                {/* Inter-State Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-700">Inter-State Transaction</span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                      IGST
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Full statutory tax applies as integrated tax: e.g. 18% tax = <strong className="text-slate-900">IGST 18%</strong>.
                  </p>
                  <div className="text-[11px] text-slate-400 font-medium">Applied when crossing state boundaries</div>
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FINANCIAL REPORTING — PROFIT & LOSS REPORT (Split Screen)              */}
      {/* ========================================================================= */}
      <section id="profit-loss-section" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-center">
            
            {/* LEFT COLUMN: Content & Features */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 flex flex-col justify-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200/70 text-[#FC787D] text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                <BarChart3 size={15} className="text-[#0B3A70]" />
                <span>FINANCIAL REPORTING</span>
              </div>

              <h2 
                className="text-slate-900 tracking-tight text-2xl sm:text-4xl font-extrabold leading-tight mb-4"
                style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.025em' }}
              >
                Profit &amp; Loss Report
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                The Profit &amp; Loss Report displays the company's financial performance for a selected period. It provides a clear overview of revenue, expenditure, gross profit, and net profit.
              </p>

              {/* Key Features List (100% Exact Text) */}
              <div className="space-y-3">
                {[
                  'View total revenue, total expenditure, gross profit, and net profit.',
                  'Review detailed income and expenditure entries, including Sales, Purchase, Direct Expenses, and Closing Stock.',
                  'Select a financial year or customize the date range.',
                  'Use Expand All to view detailed account group information.',
                  'Export reports for accounting, financial review, and business analysis.'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-red-50 text-[#FC787D] border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={2.5} />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Actual Screenshot Display with macOS Browser Frame */}
            <motion.div 
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="lg:col-span-7"
            >
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl ring-1 ring-slate-900/5 overflow-hidden transition-all duration-300">
                
                {/* Clean macOS Top Window Header Bar */}
                <div className="bg-slate-50/90 border-b border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-slate-200/80 text-[11px] text-slate-500 font-mono">
                    <span>app.gmarkerp.com/reports/profit-loss</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Live System</span>
                  </div>
                </div>

                {/* Screenshot Frame */}
                <div className="p-2 sm:p-3 bg-slate-50/50">
                  <img 
                    src={getAssetUrl('/Screenshot 2026-10-13 105644.png')}
                    alt="G Mark ERP Profit &amp; Loss Report"
                    className="w-full h-auto rounded-xl border border-slate-200/80 shadow-xs"
                    loading="lazy"
                  />
                </div>

                {/* Caption Bar */}
                <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                    <TrendingUp size={14} className="text-[#0B3A70]" />
                    <span>Financial Reporting &amp; Analysis</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Trading Account, Income &amp; Expenditure Ledger
                  </span>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MASTERS MODULE — YOUR ERP DATA FOUNDATION (Alternating: Mockup Left)  */}
      {/* ========================================================================= */}
      <section id="masters-module-section" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-center">
            
            {/* LEFT COLUMN: Actual Screenshot Display with macOS Browser Frame */}
            <motion.div 
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
              className="lg:col-span-7 order-2 lg:order-1"
            >
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl ring-1 ring-slate-900/5 overflow-hidden transition-all duration-300">
                
                {/* Clean macOS Top Window Header Bar */}
                <div className="bg-slate-50/90 border-b border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-slate-200/80 text-[11px] text-slate-500 font-mono">
                    <span>app.gmarkerp.com/masters/group-master</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Live System</span>
                  </div>
                </div>

                {/* Screenshot Frame */}
                <div className="p-2 sm:p-3 bg-slate-50/50">
                  <img 
                    src={getAssetUrl('/Screenshot 2026-10-13 105712.png')}
                    alt="G Mark ERP Masters Module"
                    className="w-full h-auto rounded-xl border border-slate-200/80 shadow-xs"
                    loading="lazy"
                  />
                </div>

                {/* Caption Bar */}
                <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                    <FolderTree size={14} className="text-[#0B3A70]" />
                    <span>ERP Master Directory &amp; Data Foundation</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Centralized Data Governance &amp; Categories
                  </span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Content & 6 Master Types */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                <Database size={15} className="text-[#0B3A70]" />
                <span>SYSTEM MASTERS</span>
              </div>

              <h2 
                className="text-slate-900 tracking-tight text-2xl sm:text-4xl font-extrabold leading-tight mb-4"
                style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.025em' }}
              >
                Masters — Your ERP Data Foundation
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                The Masters module is used to create and manage the fundamental data required for day-to-day ERP operations. It provides a centralized foundation for managing financial accounts, products, categories, units, and tax classifications.
              </p>

              {/* 6 Master Types Grid (100% Exact Text) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                          <IconComp size={13} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {master.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
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
      {/* 7. MASTER DATA DIRECTORY & ROLES MATRIX                                   */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold text-[#0B3A70] uppercase tracking-widest block mb-2">
              SYSTEM MASTERS &amp; SECURITY
            </span>
            <h2 
              className="text-slate-900 tracking-tight text-2xl sm:text-4xl lg:text-[42px] font-extrabold leading-tight"
              style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.025em' }}
            >
              Master Data Hierarchy &amp; Role-Based Access (RBAC)
            </h2>
          </div>

          {/* Master Directory Grid (6 Categories) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-16">
            {masterCategories.map((m, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/60 text-[#0B3A70] flex items-center justify-center shrink-0">
                    <FolderTree size={16} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {m.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {m.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* User Roles & Permissions Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-white border border-slate-200/90 shadow-xl ring-1 ring-slate-900/5 p-6 sm:p-8"
          >
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Users size={16} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  User Roles &amp; Permission Boundaries
                </h3>
                <p className="text-xs text-slate-500">
                  Granular administrative segregation of duties across supply chain actors
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {rolesMatrix.map((r, idx) => (
                <div 
                  key={idx}
                  className="rounded-2xl p-4 bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between"
                  style={{ borderLeftWidth: '4px', borderLeftColor: r.color }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">{r.role}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                        {r.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {r.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. TECHNICAL ARCHITECTURE & DEVELOPER SUITE                              */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold text-[#0B3A70] uppercase tracking-widest block mb-2">
              ARCHITECTURE &amp; INFRASTRUCTURE
            </span>
            <h2 
              className="text-slate-900 tracking-tight text-2xl sm:text-4xl lg:text-[42px] font-extrabold leading-tight"
              style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.025em' }}
            >
              Enterprise Full-Stack Technology Architecture
            </h2>
          </div>

          {/* 4 Tech Stack Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
            {techStack.map((stack, idx) => {
              const IconC = stack.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/90 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#0B3A70] flex items-center justify-center shrink-0">
                      <IconC size={16} />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B3A70] uppercase tracking-wider">
                      {stack.category}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {stack.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-700 font-medium">
                        <Code2 size={13} className="text-slate-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Golden Rule Callout Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-50/80 via-sky-50/60 to-red-50/40 border border-blue-200/80 shadow-sm flex items-start gap-4 sm:gap-5"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-blue-950 mb-1.5">
                The Golden Architectural Rule of G Mark ERP
              </h4>
              <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                "Understand the business flow first → Understand the code → Make the smallest safe change → Test the complete affected downstream flow (Sales Order → Challan → Invoice → Receipt → Ledger)."
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CONNECTED GMU PLATFORM ECOSYSTEM (Inspired by Image 1: "One need, one app.") */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold text-[#0B3A70] uppercase tracking-widest block mb-2">
              INTEGRATED ECOSYSTEM
            </span>
            <h2 
              className="text-slate-900 tracking-tight text-2xl sm:text-4xl lg:text-[42px] font-extrabold leading-tight mb-3"
              style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.025em' }}
            >
              Connected Enterprise Platforms
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Unified cross-platform data pipeline with shared PostgreSQL &amp; Redis synchronization
            </p>
          </div>

          {/* 4 Ecosystem Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {connectedApps.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                onClick={() => {
                  if (onSelectApp) {
                    const found = APPLICATIONS.find(a => a.id === item.id) || { id: item.id };
                    onSelectApp(found);
                  } else {
                    window.history.pushState({ page: 'app-detail', appId: item.id }, '', `/app/${item.id}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="rounded-3xl p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-14 h-12 flex items-center justify-center shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#0B3A70] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] font-bold text-orange-600 truncate mt-0.5">
                    {item.tag}
                  </p>
                  <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                    {item.badge}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. BOTTOM CTA CALLOUT (Inspired by Image 1's "Unleash growth potential") */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white text-center relative overflow-hidden">
        
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-red-100/40 via-sky-50/40 to-rose-50/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto relative z-10">
          
          {/* Playful hand-drawn sunburst rays (Inspired by Image 1) */}
          <div className="flex justify-center mb-4">
            <svg className="w-12 h-8 text-amber-400" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 25 25 L 25 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 15 25 L 5 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 35 25 L 45 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 8 28 L 2 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M 42 28 L 48 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <h2 
            className="text-slate-900 tracking-tight text-3xl sm:text-5xl font-extrabold leading-tight mb-4"
            style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.025em' }}
          >
            <span>Transform Your Enterprise Operations with </span>
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 text-[#FC787D]">
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
                  fill="#FC787D"
                  fillOpacity="0.25"
                />
              </svg>
            </span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
            Schedule an interactive product consultation with our engineering and deployment team to evaluate tailored ERP integration for your supply chain.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onOpenExpertModal}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-md text-sm font-semibold text-white bg-[#FC787D] hover:bg-[#E86368] shadow-lg shadow-[#FC787D]/20 hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              <span>Schedule Enterprise Consultation</span>
              <ArrowRight size={16} />
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back to Solutions</span>
              </button>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
