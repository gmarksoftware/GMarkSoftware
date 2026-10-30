import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { getAssetUrl } from '../utils/asset';
import { getModuleById } from '../data/modulesRegistry';
import { ENTERPRISE_EASING } from './ui/scroll-reveal';
import {
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  Activity,
  CheckCircle2,
  Cpu,
  Truck,
  Sprout,
  Users,
  Settings,
  ShieldCheck,
  BarChart3,
  Calendar,
  Package,
  Headphones,
  FileText,
  X,
  Wallet,
  Receipt,
  ShoppingCart
} from 'lucide-react';

export const ERP_MODULES = [
  {
    id: 'erp-core',
    name: 'Enterprise ERP Core',
    category: 'ERP & Finance',
    tagline: 'Centralized Multi-Tenant ERP Architecture & System Masters',
    image: getAssetUrl('/ERP Logo.png'),
    fallbackIcon: Layers,
    badge: 'ERP Core',
    accent: '#0D9488',
    description: 'Centralized enterprise resource planning backbone orchestrating multi-tenant database infrastructure, master data governance, role-based security, and cross-platform integrations.',
    features: ['Multi-tenant data isolation & Prisma ORM', 'Master Data Directory (Accounts, Groups, UOM, HSN)', 'Granular RBAC with JWT Bearer security', 'Unified GraphQL & RESTful Webhook bus']
  },
  {
    id: 'double-entry-accounting',
    name: 'Double-Entry Accounting',
    category: 'ERP & Finance',
    tagline: 'Compliant Multi-Voucher Double-Entry Ledger System',
    image: null,
    fallbackIcon: Wallet,
    badge: 'Accounting',
    accent: '#0D9488',
    description: 'Comprehensive financial accounting module enforcing double-entry validation across receipt, payment, journal, and contra vouchers with real-time audit trails and automated ledger balances.',
    features: ['Automated Debit/Credit ledger posting', '4 Statutory voucher types (Receipt, Payment, Journal, Contra)', 'Real-time Chart of Accounts & Trial Balance', 'Bill-by-bill invoice tagging & reconciliations']
  },
  {
    id: 'gst-eway-invoicing',
    name: 'GST & E-Way Invoicing',
    category: 'ERP & Finance',
    tagline: 'Statutory Tax Invoicing & Automated E-Way Ingestion',
    image: null,
    fallbackIcon: Receipt,
    badge: 'Tax & Invoicing',
    accent: '#2563EB',
    description: 'Automated tax computation engine supporting intra-state (CGST + SGST) and inter-state (IGST) statutory compliance, HSN code lookups, E-Way bill generation, and immutable digital invoices.',
    features: ['Automated intra-state vs inter-state tax logic', 'Statutory HSN/SAC tax code classification', 'Immutable digital tax invoice locking', 'E-Way bill number and transport verification']
  },
  {
    id: 'sales-purchase-orders',
    name: 'Sales & Purchase Orders',
    category: 'ERP & Finance',
    tagline: 'End-to-End SO & PO Procurement Lifecycle',
    image: null,
    fallbackIcon: ShoppingCart,
    badge: 'Commercial Orders',
    accent: '#EA580C',
    description: 'Complete commercial trade and procurement lifecycle management from customer quote, Sales Order, and Delivery Challan to supplier Purchase Order, Gate Inward, and GRN verification.',
    features: ['5-Step Sales & Distribution workflow', '5-Step Purchase Order & GRN lifecycle', 'Bulk Excel import for procurement schedules', 'Document state tracking (SO, Challan, SI, PO, GRN, PI)']
  },
  {
    id: 'multi-warehouse-inventory',
    name: 'Multi-Warehouse Inventory',
    category: 'ERP & Finance',
    tagline: 'Multi-Location Stock Telemetry & Bin Allocation',
    image: null,
    fallbackIcon: Package,
    badge: 'Inventory & Stock',
    accent: '#16A34A',
    description: 'Centralized inventory engine managing multiple warehouses, automated stock reservations upon SO creation, dispatch deductions, GRN inward additions, and safety stock reorder triggers.',
    features: ['Multi-warehouse & regional depot tracking', 'Real-time stock reservation & bin allocation', 'Automated stock deductions on dispatch challans', 'UOM conversions & safety stock threshold alerts']
  },
  {
    id: 'branch-ledger-cashflow',
    name: 'Branch Ledger & Cashflow',
    category: 'ERP & Finance',
    tagline: 'Multi-Branch Financial Consolidation & Cash Liquidity',
    image: null,
    fallbackIcon: BarChart3,
    badge: 'Cashflow & P&L',
    accent: '#8B5CF6',
    description: 'Multi-branch financial consolidation and cashflow management providing independent branch ledgers, centralized corporate balance sheets, daily liquidity monitoring, and Profit & Loss reporting.',
    features: ['Multi-branch ledger consolidation', 'Daily cashbook & bank account reconciliation', 'Cashflow liquidity & runway forecasting', 'Interactive Profit & Loss statement reporting']
  }
];

export const APPLICATIONS = [
  {
    id: 'cmms',
    name: 'CMMS',
    category: 'Operations & IoT',
    tagline: 'Man, Machine, Method & Material orchestration',
    image: getAssetUrl('/4m-clean.png'),
    fallbackIcon: Settings,
    badge: 'Smart Maintenance',
    accent: '#3B82F6',
    description: 'Industrial-grade maintenance operations suite synchronizing workforce, asset telemetry, digital SOPs, and spare inventory.',
    features: ['Preventive maintenance scheduling', 'MTBF & MTTR telemetry', 'Real-time spare parts inventory', 'Operator skill matrix']
  },
  {
    id: 'gram-unnati',
    name: 'GramUnnati',
    category: 'Agri & Rural',
    tagline: 'Agricultural e-commerce & rural empowerment marketplace',
    image: getAssetUrl('/gramunnati-clean.png'),
    fallbackIcon: Sprout,
    badge: 'Agri-Commerce',
    accent: '#16A34A',
    description: 'All-in-one digital marketplace connecting farmers, rural micro-enterprises, and Women Self-Help Groups with verified sellers, fair pricing, and live shipment tracking.',
    features: ['Buyer & Seller Mobile Apps', 'Master Catalog with variants & combos', 'Verified seller KYC pipeline', 'T+1 direct bank settlements']
  },
  {
    id: 'g-nova-iot',
    name: 'G-Nova IoT',
    category: 'Operations & IoT',
    tagline: 'G-Nova visualization & 4M facility telemetry',
    image: getAssetUrl('/g-nova-clean.png'),
    fallbackIcon: Cpu,
    badge: 'Hardware & IoT',
    accent: '#8B5CF6',
    description: 'Sub-second G-Nova visualization, predictive fault alarms, and complete 4M (Man, Machine, Material, Method) asset governance.',
    features: ['< 500ms telemetry latency', '4M asset governance framework', 'Pre-engineered G-Nova templates', 'Multi-tenant hierarchy & alerts']
  },
  {
    id: 'erp',
    name: 'ERP',
    category: 'ERP & Finance',
    tagline: 'Enterprise Resource Planning & Automation',
    image: getAssetUrl('/ERP Logo.png'),
    fallbackIcon: Layers,
    badge: 'Core ERP',
    accent: '#2563EB',
    description: 'Unified enterprise resource planning system managing production schedules, procurement, and financial operations.',
    features: ['Supply chain visibility', 'Automated purchase orders', 'Finance & billing integration', 'Resource allocation']
  },
  {
    id: 'g-track',
    name: 'G Track',
    category: 'Field & Fleet',
    tagline: 'Field force management, geo-attendance & order booking',
    image: getAssetUrl('/G Track logo.png'),
    fallbackIcon: Truck,
    badge: 'Live Tracking',
    accent: '#10B981',
    description: 'All-in-one employee tracking and field operations platform. Real-time GPS telemetry, geo-fenced attendance, client visits, and on-field digital order booking.',
    features: ['Real-time location & breadcrumb trails', 'Geo-verified mobile attendance', 'On-field order booking & catalog', 'Beat planning & productivity reports']
  },
  {
    id: 'shg-app',
    name: 'SHG App',
    category: 'Agri & Rural',
    tagline: 'Self-Help Group Operations, Pickup & Delivery Management',
    image: getAssetUrl('/shg-clean.png'),
    fallbackIcon: Sprout,
    badge: 'Gkart SHG',
    accent: '#16A34A',
    description: 'Gkart provides Self-Help Group (SHG) delivery partners with a mobile application to receive assigned logistics orders, manage doorstep pickups, coordinate with GHub, and earn per-order commissions.',
    features: ['Real-time batch & hub transfers', 'Mobile pickup with QR & weight verification', 'Doorstep delivery with 4-digit OTP handover', 'Instant per-order earnings ledger (₹15/order)']
  },
  {
    id: 'transporter-app',
    name: 'Transporter App',
    category: 'Field & Fleet',
    tagline: 'Transporter Operations, Shipment Movement & Delivery Management',
    image: getAssetUrl('/transporter-clean.png'),
    fallbackIcon: Truck,
    badge: 'Gship Fleet',
    accent: '#0284C7',
    description: 'Gship provides transporters with a mobile application to manage assigned logistics tasks, perform pickup and delivery operations, update order statuses, and report damage or exceptions with GHub.',
    features: ['Assigned shipment & cluster dispatch', 'SHG node pickup with QR batch scan', 'Warehouse hub intake & transit routing', 'Damage & operational exception reporting']
  },
  {
    id: 'task-management',
    name: 'Task Management',
    category: 'Core Platforms',
    tagline: 'All-in-one collaborative workspace & agile project governance',
    image: getAssetUrl('/synkroboard-clean.png'),
    fallbackIcon: Users,
    badge: 'SynkroBoard',
    accent: '#F97316',
    description: 'Collaborative project and workspace management platform with interactive Kanban, RACI matrix, Gantt timelines, absence-aware scheduling, and live WebSocket sync.',
    features: ['Multi-View Project Visualization (Kanban/Gantt/RACI)', 'Automated Leave & Absence Scheduling Sync', 'Contextual Real-Time WebSocket Team Chat', 'Role-Based Dashboards & RBAC Governance']
  }
];

export const SHOWCASE_APPS_24 = [...APPLICATIONS];
export const ALL_NAVIGABLE_APPS = [...APPLICATIONS];

export const findAppOrModule = (id) => {
  if (!id) return null;
  const lower = String(id).toLowerCase().trim();
  return (
    getModuleById(lower) ||
    APPLICATIONS.find(a => a.id === lower) ||
    ERP_MODULES.find(m => m.id === lower) ||
    APPLICATIONS.find(a => a.id.includes(lower)) ||
    null
  );
};

export default function ApplicationsGridSection({ onOpenExpertModal, onSelectApp }) {
  const [selectedApp, setSelectedApp] = useState(null);
  const prefersReduced = useReducedMotion();

  const handleAppClick = (app) => {
    if (onSelectApp) {
      onSelectApp(app);
    } else {
      setSelectedApp(app);
    }
  };

  return (
    <div className="w-full flex flex-col items-center bg-white">
      
      {/* ========================================================================= */}
      {/* 1. ELEGANT CONVEX DOME UPPER BOUNDARY                                     */}
      {/* ========================================================================= */}
      <div className="w-full overflow-hidden leading-none pointer-events-none select-none bg-white">
        <svg 
          className="w-full h-5 sm:h-6 md:h-8 lg:h-9 block text-[#F4F5F7]"
          viewBox="0 0 1440 90" 
          preserveAspectRatio="none" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M 0 90 C 380 0, 1060 0, 1440 90 L 1440 90 L 0 90 Z" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 2. LIGHT-GRAY CONTENT SECTION (#F4F5F7)                                   */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#F4F5F7] px-4 sm:px-6 lg:px-8 pt-0 pb-8 sm:pb-10 lg:pb-12 flex flex-col items-center">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          {/* Section Heading: "Integrated Applications & Platforms" with clean underlined accent style */}
          <motion.div 
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: ENTERPRISE_EASING }}
            className="text-center mb-5 sm:mb-6 lg:mb-7 max-w-xl mx-auto flex flex-col items-center"
          >
            <h2 
              className="text-balance text-slate-900 font-bold tracking-tight text-[1.55rem] sm:text-[1.85rem] lg:text-[2.15rem] leading-tight text-center"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Integrated Applications{' '}
              <span className="relative inline-block whitespace-nowrap">
                & Platforms
                {/* Curved blue accent underline */}
                <svg 
                  className="absolute -bottom-1 sm:-bottom-1.5 left-0 w-full h-2 sm:h-2.5 text-[#00A3E0] pointer-events-none" 
                  viewBox="0 0 160 12" 
                  fill="none" 
                  preserveAspectRatio="none" 
                  aria-hidden="true" 
                >
                  <path 
                    d="M 3 8 Q 80 2, 157 7" 
                    stroke="#00A3E0" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                </svg>
              </span>
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-[13px] text-slate-500 font-medium max-w-md mx-auto">
              Empower your enterprise with seamless connectivity across operations, commerce, finance, and IoT.
            </p>
          </motion.div>

          {/* ======================================================================= */}
          {/* 3. RESPONSIVE GRID (2 on mobile, 4 on desktops)                        */}
          {/* ======================================================================= */}
          <div 
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-5 sm:gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-7 lg:gap-y-8 justify-items-center w-full max-w-4xl mx-auto"
          >
            {APPLICATIONS.map((app, index) => {
              const FallbackIcon = app.fallbackIcon || Layers;
              return (
                <motion.div
                  key={app.id}
                  onClick={() => handleAppClick(app)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleAppClick(app);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  initial={prefersReduced ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.08 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: (index % 4) * 0.06 + Math.floor(index / 4) * 0.03, 
                    ease: ENTERPRISE_EASING 
                  }}
                  className="group flex flex-col items-center text-center cursor-pointer select-none w-full max-w-[130px] sm:max-w-[150px] lg:max-w-[165px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900 rounded-xl p-1 sm:p-1.5 bg-transparent"
                  title={`${app.name} — Click to explore`}
                >
                  {/* Logo Display Directly on Section Background (No cards, no white boxes, no shadows) */}
                  <div 
                    className="w-full h-10 sm:h-14 md:h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 bg-transparent px-2"
                  >
                    {app.isAccountingIcon ? (
                      /* Stylized Modern Odoo-Style Accounting Icon */
                      <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-11 sm:h-11">
                        <circle cx="28" cy="22" r="11" fill="#F59E0B" />
                        <circle cx="44" cy="48" r="11" fill="#0D9488" />
                        <rect 
                          x="18" 
                          y="48" 
                          width="46" 
                          height="12" 
                          rx="6" 
                          transform="rotate(-45 18 48)" 
                          fill="#714B67" 
                          fillOpacity="0.88" 
                        />
                      </svg>
                    ) : app.image ? (
                      <img
                        src={app.image}
                        alt={app.name}
                        className={`max-h-[36px] sm:max-h-[52px] md:max-h-[58px] max-w-[88px] sm:max-w-[115px] md:max-w-[125px] w-auto h-auto object-contain pointer-events-none select-none bg-transparent transition-transform duration-300 ${app.imageClassName || ''}`}
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <div 
                        className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center transition-transform duration-200"
                        style={{ backgroundColor: `${app.accent || '#0D9488'}15` }}
                      >
                        <FallbackIcon 
                          className="w-4 h-4 sm:w-6 sm:h-6" 
                          style={{ color: app.accent || '#0D9488' }} 
                        />
                      </div>
                    )}
                  </div>

                  {/* Centered Application Name Directly on Section Background */}
                  <span 
                    className="mt-2 text-[13px] sm:text-[14px] lg:text-[14.5px] font-bold text-slate-800 text-center leading-snug tracking-tight group-hover:text-sky-600 transition-colors w-full px-1"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {app.name}
                  </span>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE APP DETAIL MODAL (Preserved from existing application)     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* App Header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-white border border-neutral-200 shadow-md p-2 flex items-center justify-center overflow-hidden shrink-0">
                  {selectedApp.image ? (
                    <img src={selectedApp.image} alt={selectedApp.name} className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <div 
                      className="w-full h-full rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: selectedApp.accent || '#0D9488' }}
                    >
                      {React.createElement(selectedApp.fallbackIcon || Layers, { className: "w-7 h-7 text-white" })}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-neutral-900">{selectedApp.name}</h3>
                    {selectedApp.badge && (
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: selectedApp.accent || '#0D9488' }}
                      >
                        {selectedApp.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 font-medium">{selectedApp.category}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-700 leading-relaxed mb-5">
                {selectedApp.description || selectedApp.tagline}
              </p>

              {/* Key Features */}
              {selectedApp.features && selectedApp.features.length > 0 && (
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3">Key Capabilities</h4>
                  <div className="space-y-2">
                    {selectedApp.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-neutral-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedApp(null);
                    if (onOpenExpertModal) onOpenExpertModal();
                  }}
                  style={{ backgroundColor: '#714B67' }}
                  className="flex-1 py-3 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:opacity-95 active:scale-[0.98] transition-all text-center cursor-pointer shadow-sm"
                >
                  Request Platform Demo
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
