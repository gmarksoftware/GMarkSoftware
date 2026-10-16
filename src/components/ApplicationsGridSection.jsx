import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetUrl } from '../utils/asset';
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
  X
} from 'lucide-react';

export const APPLICATIONS = [
  {
    id: 'cmms',
    name: 'CMMS',
    category: 'Enterprise Operations',
    tagline: 'Man, Machine, Method & Material orchestration',
    image: getAssetUrl('/4M.png'),
    fallbackIcon: Settings,
    badge: 'Smart Maintenance',
    accent: '#3b82f6',
    description: 'Industrial-grade maintenance operations suite synchronizing workforce, asset telemetry, digital SOPs, and spare inventory.',
    features: ['Preventive maintenance scheduling', 'MTBF & MTTR telemetry', 'Real-time spare parts inventory', 'Operator skill matrix']
  },
  {
    id: 'gram-unnati',
    name: 'GramUnnati',
    category: 'Agritech Supply Chain',
    tagline: 'Agricultural e-commerce & rural empowerment marketplace',
    image: getAssetUrl('/Final Logo-09.jpg.jpeg'),
    fallbackIcon: Sprout,
    badge: 'Agri-Commerce',
    accent: '#16a34a',
    description: 'All-in-one digital marketplace connecting farmers, rural micro-enterprises, and Women Self-Help Groups with verified sellers, fair pricing, and live shipment tracking.',
    features: ['Buyer & Seller Mobile Apps', 'Master Catalog with variants & combos', 'Verified seller KYC pipeline', 'T+1 direct bank settlements']
  },
  {
    id: 'g-nova-iot',
    name: 'G-Nova IoT',
    category: 'Industrial Automation',
    tagline: 'G-Nova visualization & 4M facility telemetry',
    image: getAssetUrl('/G-Nova IOT logo 02.jpg'),
    imageClassName: 'scale-[1.5] object-contain',
    fallbackIcon: Cpu,
    badge: 'Hardware & G-Nova',
    accent: '#8b5cf6',
    description: 'Sub-second G-Nova visualization, predictive fault alarms, and complete 4M (Man, Machine, Material, Method) asset governance.',
    features: ['< 500ms telemetry latency', '4M asset governance framework', 'Pre-engineered G-Nova templates', 'Multi-tenant hierarchy & alerts']
  },
  {
    id: 'erp',
    name: 'ERP',
    category: 'Enterprise Operations',
    tagline: 'Enterprise Resource Planning & Automation',
    image: getAssetUrl('/ERP Logo.png'),
    imageClassName: 'p-1.5 sm:p-2 scale-[0.86]',
    fallbackIcon: Layers,
    badge: 'Core ERP',
    accent: '#2563eb',
    description: 'Unified enterprise resource planning system managing production schedules, procurement, and financial operations.',
    features: ['Supply chain visibility', 'Automated purchase orders', 'Finance & billing integration', 'Resource allocation']
  },
  {
    id: 'g-track',
    name: 'G Track',
    category: 'Field Force & Telemetry',
    tagline: 'Field force management, geo-attendance & order booking',
    image: getAssetUrl('/G Track logo.png'),
    imageClassName: 'p-1.5 sm:p-2 scale-[0.86]',
    fallbackIcon: Truck,
    badge: 'Live Tracking',
    accent: '#10b981',
    description: 'All-in-one employee tracking and field operations platform. Real-time GPS telemetry, geo-fenced attendance, client visits, and on-field digital order booking.',
    features: ['Real-time location & breadcrumb trails', 'Geo-verified mobile attendance', 'On-field order booking & catalog', 'Beat planning & productivity reports']
  },
  {
    id: 'shg-app',
    name: 'SHG App',
    category: 'Rural Logistics & Delivery',
    tagline: 'Self-Help Group Operations, Pickup & Delivery Management',
    image: getAssetUrl('/SHG Delivary and Transporter Logo 01.jpg'),
    fallbackIcon: Sprout,
    badge: 'Gkart SHG',
    accent: '#16a34a',
    description: 'Gkart provides Self-Help Group (SHG) delivery partners with a mobile application to receive assigned logistics orders, manage doorstep pickups, coordinate with GHub, and earn per-order commissions.',
    features: ['Real-time batch & hub transfers', 'Mobile pickup with QR & weight verification', 'Doorstep delivery with 4-digit OTP handover', 'Instant per-order earnings ledger (₹15/order)']
  },
  {
    id: 'transporter-app',
    name: 'Transporter App',
    category: 'Middle-Mile & Fleet Logistics',
    tagline: 'Transporter Operations, Shipment Movement & Delivery Management',
    image: getAssetUrl('/SHG Delivary and Transporter Logo.jpg'),
    fallbackIcon: Truck,
    badge: 'Gship Fleet',
    accent: '#0284c7',
    description: 'Gship provides transporters with a mobile application to manage assigned logistics tasks, perform pickup and delivery operations, update order statuses, and report damage or exceptions with GHub.',
    features: ['Assigned shipment & cluster dispatch', 'SHG node pickup with QR batch scan', 'Warehouse hub intake & transit routing', 'Damage & operational exception reporting']
  },
  {
    id: 'task-management',
    name: 'Task Management',
    category: 'Enterprise Productivity',
    tagline: 'All-in-one collaborative workspace & agile project governance',
    image: getAssetUrl('/Task Management & Team Collaboration Logo 01.jpg'),
    fallbackIcon: Users,
    badge: 'SynkroBoard',
    accent: '#F97316',
    description: 'Collaborative project and workspace management platform with interactive Kanban, RACI matrix, Gantt timelines, absence-aware scheduling, and live WebSocket sync.',
    features: ['Multi-View Project Visualization (Kanban/Gantt/RACI)', 'Automated Leave & Absence Scheduling Sync', 'Contextual Real-Time WebSocket Team Chat', 'Role-Based Dashboards & RBAC Governance']
  }
];

export default function ApplicationsGridSection({ onOpenExpertModal, onSelectApp }) {
  const [selectedApp, setSelectedApp] = useState(null);

  const handleAppClick = (app) => {
    if (onSelectApp) {
      onSelectApp(app);
    } else {
      setSelectedApp(app);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#e8e8e8] pt-2 sm:pt-4 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-12 flex flex-col justify-center items-center font-['Inter',sans-serif]">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Section Heading with Lora font style */}
        <h2
          className="text-balance text-slate-900 text-center mb-6 sm:mb-12 md:mb-14 -translate-y-6 sm:-translate-y-24 md:-translate-y-28"
          style={{ 
            fontFamily: "'Lora', serif",
            fontSize: 'clamp(1.5rem, 3.52vw, 2.99rem)',
            lineHeight: '1.15',
            letterSpacing: '0',
            fontWeight: 600,
            display: 'inline-block'
          }}
        >
          <span>Integrated Applications </span>
          <span className="relative inline-block whitespace-nowrap">
            <span className="relative z-10 text-slate-900 font-semibold">
              & Platforms
            </span>
            {/* Hand-drawn marker brush stroke highlight matching hero */}
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

        {/* App Tiles Grid (Exact Odoo Style) */}
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 sm:gap-x-12 gap-y-6 sm:gap-y-10 md:gap-x-14 md:gap-y-12 w-full max-w-3xl justify-items-center -translate-y-2 sm:-translate-y-10 md:-translate-y-12"
        >
          {APPLICATIONS.map((app, idx) => {
            const FallbackIcon = app.fallbackIcon;
            return (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
                onClick={() => handleAppClick(app)}
                className="group flex flex-col items-center cursor-pointer w-28 sm:w-32"
              >
                {/* Odoo Style White Rounded Icon Card */}
                <div className="w-[88px] h-[88px] sm:w-[96px] sm:h-[96px] rounded-[22px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] group-hover:-translate-y-1.5 transition-all duration-300 flex items-center justify-center p-3.5 relative overflow-hidden">
                  {app.image ? (
                    <img
                      src={app.image}
                      alt={app.name}
                      className={`w-full h-full object-contain rounded-xl ${app.imageClassName || ''}`}
                    />
                  ) : (
                    <div 
                      className="w-full h-full rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: app.accent }}
                    >
                      <FallbackIcon className="w-9 h-9 text-white" />
                    </div>
                  )}
                </div>

                {/* App Name Only (Exact Odoo Typography, No Subtext) */}
                <span className="mt-3 text-[14px] sm:text-[15px] font-semibold text-[#1e293b] text-center leading-tight tracking-normal group-hover:text-black transition-colors">
                  {app.name}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Interactive App Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-neutral-200 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
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
                      style={{ backgroundColor: selectedApp.accent }}
                    >
                      <selectedApp.fallbackIcon className="w-7 h-7 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-neutral-900">{selectedApp.name}</h3>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: selectedApp.accent }}
                    >
                      {selectedApp.badge}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-medium">{selectedApp.category}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-700 leading-relaxed mb-5">
                {selectedApp.description}
              </p>

              {/* Key Features */}
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

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedApp(null);
                    onOpenExpertModal();
                  }}
                  style={{ backgroundColor: '#7B5872', boxShadow: '0 4px 14px rgba(123, 88, 114, 0.35)' }}
                  className="flex-1 py-3 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all text-center cursor-pointer"
                >
                  Request Platform Demo
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
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
