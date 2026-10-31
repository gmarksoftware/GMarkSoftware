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
    image: getAssetUrl('/SynkroBoard.png'),
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
  const [activeCategory, setActiveCategory] = useState('all');
  const prefersReduced = useReducedMotion();

  // Combine applications with ERP modules for comprehensive showcase
  const ALL_APPS_COMBINED = [
    ...APPLICATIONS,
    ...ERP_MODULES.filter(m => !APPLICATIONS.some(a => a.id === m.id))
  ];

  const CATEGORIES = [
    { id: 'all', label: 'All Applications' },
    { id: 'ERP & Finance', label: 'ERP & Finance' },
    { id: 'Operations & IoT', label: 'Industrial & IoT' },
    { id: 'Field & Fleet', label: 'Field & Fleet' },
    { id: 'Agri & Rural', label: 'Agri & Rural' },
    { id: 'Core Platforms', label: 'Collaboration' }
  ];

  const filteredApps = activeCategory === 'all'
    ? ALL_APPS_COMBINED
    : ALL_APPS_COMBINED.filter(app => app.category === activeCategory);

  const handleAppClick = (app) => {
    if (onSelectApp) {
      onSelectApp(app);
    } else {
      setSelectedApp(app);
    }
  };

  return (
    <div 
      className="w-full flex flex-col items-center bg-white py-16 sm:py-20 lg:py-24"
      style={{
        backgroundColor: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Section Heading: Authentic Odoo Style with Smooth Slow Slide Up */}
        <motion.div 
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 55 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.05, ease: ENTERPRISE_EASING }}
          className="text-center mb-8 sm:mb-10 max-w-2xl mx-auto flex flex-col items-center"
        >
          <span 
            className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3 inline-block"
            style={{
              backgroundColor: '#F9F5F8',
              color: '#714B67',
              border: '1px solid #E3D4DF'
            }}
          >
            Modular &amp; Fully Integrated
          </span>
          <h2 
            className="text-3xl sm:text-4xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight text-center"
            style={{ color: '#1E293B' }}
          >
            Integrated Applications{' '}
            <span style={{ color: '#714B67' }}>&amp; Platforms</span>
          </h2>
          <p 
            className="mt-3 text-sm sm:text-base text-slate-600 font-normal max-w-lg mx-auto leading-relaxed"
            style={{ color: '#4B5563' }}
          >
            Seamlessly connected proprietary software products sharing a single relational database, eliminating duplicate data entry and manual sync.
          </p>
        </motion.div>

        {/* Odoo Category Filter Tabs with Smooth Slow Slide Up */}
        <motion.div 
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.95, delay: 0.15, ease: ENTERPRISE_EASING }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10 sm:mb-12 max-w-4xl mx-auto"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                }`}
                style={isActive ? { backgroundColor: '#714B67' } : undefined}
              >
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Responsive Grid of Odoo Application Cards: Smooth Slow Slide Up from Bottom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full max-w-6xl mx-auto">
          {filteredApps.map((app, index) => {
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
                initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 55 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ 
                  duration: 0.95, 
                  delay: (index % 3) * 0.12, 
                  ease: ENTERPRISE_EASING 
                }}
                className="group flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#714B67]/40 hover:shadow-lg transition-all duration-300 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-[#714B67]"
                title={`${app.name} — Click to explore`}
              >
                <div>
                  {/* Top Header with Squircle Icon & Category Pill */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div 
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center p-2.5 transition-transform duration-300 group-hover:scale-105 shrink-0"
                      style={{ 
                        backgroundColor: `${app.accent || '#714B67'}12`,
                        border: `1px solid ${app.accent || '#714B67'}25`
                      }}
                    >
                      {app.image ? (
                        <img
                          src={app.image}
                          alt={app.name}
                          className="w-full h-full object-contain pointer-events-none select-none"
                          loading="lazy"
                        />
                      ) : (
                        <FallbackIcon 
                          className="w-7 h-7" 
                          style={{ color: app.accent || '#714B67' }} 
                        />
                      )}
                    </div>

                    {app.badge && (
                      <span 
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0"
                        style={{
                          backgroundColor: `${app.accent || '#714B67'}15`,
                          color: app.accent || '#714B67'
                        }}
                      >
                        {app.badge}
                      </span>
                    )}
                  </div>

                  {/* App Name & Category */}
                  <div className="mb-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#714B67] transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      {app.category}
                    </p>
                  </div>

                  {/* Tagline / Description */}
                  <p className="text-xs sm:text-[13px] text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {app.tagline || app.description}
                  </p>

                  {/* Key Capabilities */}
                  {app.features && app.features.length > 0 && (
                    <div className="space-y-1.5 pt-3 border-t border-slate-100 mb-4">
                      {app.features.slice(0, 2).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span 
                    className="text-xs font-bold flex items-center gap-1 group-hover:gap-1.5 transition-all"
                    style={{ color: '#714B67' }}
                  >
                    Explore Module
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600">
                    Production Ready
                  </span>
                </div>
              </motion.div>
            );
          })}
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
