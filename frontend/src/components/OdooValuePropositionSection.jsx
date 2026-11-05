import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Settings, 
  Cpu, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  Clock, 
  Check 
} from 'lucide-react';

const VALUE_TABS = [
  {
    id: 'erp-finance',
    name: 'ERP & Financial Engine',
    shortLabel: 'ERP & Finance',
    icon: Layers,
    accent: '#2563EB',
    badge: 'Statutory Core',
    headline: 'Unified Multi-Tenant Core with Double-Entry Compliance',
    description: 'Eliminate duplicate data entry across branches. Inward purchase GRNs immediately reserve stock in multi-warehouse ledgers, while sales dispatches auto-generate GST E-Way invoices and balance dual-entry financial books.',
    metrics: [
      { label: 'Debit = Credit Match', val: '100.0%', sub: 'Zero ledger variance' },
      { label: 'Query Engine', val: '< 50ms', sub: 'PostgreSQL 16 & Prisma' },
      { label: 'Tax Accuracy', val: '100%', sub: 'CGST, SGST & IGST rules' }
    ],
    features: [
      'Luca Pacioli compliant double-entry bookkeeping',
      'Automated intra/inter-state GST calculation & E-Way bills',
      'Multi-warehouse Available-to-Promise (ATP) stock control',
      'Real-time consolidated branch Profit & Loss statements'
    ],
    preview: {
      type: 'erp',
      title: 'Enterprise Ledger & Tax Engine',
      status: 'Active • Real-Time Sync',
      rows: [
        { desc: 'Sales Invoice #GMS-2026-894', acc: 'Accounts Receivable', amt: '₹ 1,48,500.00', status: 'Balanced' },
        { desc: 'CGST 9% + SGST 9% Inward', acc: 'Tax Payable Ledger', amt: '₹ 22,652.54', status: 'Verified' },
        { desc: 'Multi-Warehouse STO Dispatch', acc: 'Depot Stock Transit', amt: '₹ 86,200.00', status: 'Reserved' }
      ]
    }
  },
  {
    id: 'industrial-cmms',
    name: '4M Smart CMMS',
    shortLabel: '4M CMMS',
    icon: Settings,
    accent: '#3B82F6',
    badge: 'ISO 55001',
    headline: 'Man, Machine, Material & Method Industrial Maintenance',
    description: 'Transition from reactive firefighting to scheduled reliability. Automatically schedule preventive maintenance tasks based on motor run-hours, log technician skill certifications, and enforce digital SOP checklists with mandatory photo proof.',
    metrics: [
      { label: 'Downtime Drop', val: '- 42%', sub: 'Predictive & PM scheduling' },
      { label: 'MTTR Stopwatch', val: '- 38%', sub: 'Faster mean repair time' },
      { label: 'Digital Checklists', val: '100%', sub: 'Zero paper shop floor' }
    ],
    features: [
      'Automated PM work order dispatch by runtime hours',
      'Real-time MTBF and MTTR calculation engine',
      'Pareto 80/20 breakdown loss-tree analysis',
      'MRO spare parts tracking with automated min-max reorders'
    ],
    preview: {
      type: 'cmms',
      title: 'Plant Reliability & Asset Monitor',
      status: 'Live Plant Telemetry',
      rows: [
        { desc: 'Line 2 Booster Pump #04', acc: 'Vibration: 1.18 mm/s', amt: 'MTBF: 1,420 Hrs', status: 'Optimal' },
        { desc: 'Hydraulic Press 500T', acc: 'PM Overhaul in 14 Hrs', amt: 'Spares Staged', status: 'Scheduled' },
        { desc: 'Technician Shift Matrix', acc: '6 Certified Operators', amt: 'Skill Level 4', status: 'Active' }
      ]
    }
  },
  {
    id: 'iot-telemetry',
    name: 'G-Nova IoT Engine',
    shortLabel: 'G-Nova IoT',
    icon: Cpu,
    accent: '#8B5CF6',
    badge: '50Hz Sub-Second',
    headline: 'Sub-Second 50Hz Telemetry & SCADA Visualization',
    description: 'Connect shop-floor PLCs, municipal water booster stations, and fire hydrant lines into a real-time SCADA cockpit. Ingest 50 samples per second to catch transient voltage spikes and trigger dry-run motor isolations within 200ms.',
    metrics: [
      { label: 'Stream Ingestion', val: '50 Hz', sub: 'Sub-second edge capture' },
      { label: 'Dry-Run Protection', val: '< 200ms', sub: 'Auto pump shutoff relay' },
      { label: 'Network SLA', val: '99.99%', sub: 'MQTT v5.0 with TLS 1.3' }
    ],
    features: [
      'Interactive SVG SCADA equipment mimic diagrams',
      'Transient inrush current profiling and FFT harmonics',
      'Terrace booster multi-pump cascade with VFD regulation',
      'NFPA-compliant 24/7 fire ring-main pressure watchdog'
    ],
    preview: {
      type: 'iot',
      title: 'Industrial Sensor Stream Cockpit',
      status: 'Sub-50ms Pipeline',
      rows: [
        { desc: 'Booster Ring Pressure', acc: 'Set: 3.5 Bar | Actual: 3.48 Bar', amt: 'PID Active', status: 'Holding' },
        { desc: 'Pump 1 Motor Voltage', acc: '415V Phase-to-Phase @ 50Hz', amt: 'Current: 14.2A', status: 'Normal' },
        { desc: 'Fire Main Hydrant Loop', acc: 'Pressure: 7.4 Bar (NBC Code)', amt: 'Zero Leaks', status: 'Secure' }
      ]
    }
  },
  {
    id: 'field-fleet',
    name: 'G Track & Field Fleet',
    shortLabel: 'Field & Fleet',
    icon: Truck,
    accent: '#10B981',
    badge: 'Live Telemetry',
    headline: 'Real-Time GPS Telemetry, Geo-Attendance & Logistics',
    description: 'Empower your mobile field force, transporter fleet, and rural self-help groups. Track real-time breadcrumb routes, enforce geo-verified biometric attendance, and take customer sales orders on the spot with instant cloud sync.',
    metrics: [
      { label: 'GPS Precision', val: '< 3 Meters', sub: 'Real-time breadcrumbs' },
      { label: 'Geo-Attendance', val: '100%', sub: 'Zero fake field check-ins' },
      { label: 'Delivery Handover', val: 'OTP Gated', sub: 'Instant bank settlement' }
    ],
    features: [
      'Live employee tracking & intelligent beat route planning',
      'On-field digital order booking with offline catalog',
      'Transporter middle-mile cluster dispatch with QR scans',
      'Rural SHG doorstep delivery app with 4-digit OTP handover'
    ],
    preview: {
      type: 'fleet',
      title: 'Field Operations & Dispatch Hub',
      status: '1,420 Active Nodes',
      rows: [
        { desc: 'Pune Cluster Delivery #104', acc: 'Transporter: MH-12-FC-4821', amt: '8 Consignments', status: 'In Transit' },
        { desc: 'Field Executive Beat 4', acc: 'Client Visit #6 Completed', amt: 'Order: ₹ 42,000', status: 'Booked' },
        { desc: 'Rural SHG Delivery Node', acc: 'Doorstep OTP Verification', amt: 'T+1 Bank Payout', status: 'Settled' }
      ]
    }
  }
];

export default function OdooValuePropositionSection({ onOpenExpertModal, onSelectApp }) {
  const [activeTabId, setActiveTabId] = useState('erp-finance');
  const activeTab = VALUE_TABS.find(t => t.id === activeTabId) || VALUE_TABS[0];

  return (
    <section 
      className="w-full bg-[#F8FAFC] pt-8 sm:pt-10 lg:pt-12 pb-18 sm:pb-24"
      style={{
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading: Authentic Odoo Style with Smooth Slow Slide Up */}
        <motion.div 
          initial={{ opacity: 0, y: 55 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-6 sm:mb-16"
        >
          
          <h2 
            className="text-[22px] xs:text-[25px] sm:text-4xl lg:text-[2.65rem] font-extrabold text-slate-900 tracking-tight leading-tight"
            style={{ color: '#1E293B' }}
          >
            Everything you need with{' '}
            <span style={{ color: '#FC787D' }}>top-notch user experience.</span>
          </h2>
          <p 
            className="mt-2.5 sm:mt-4 text-[13px] xs:text-[14px] sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto"
            style={{ color: '#4B5563' }}
          >
            Our family of apps work seamlessly together — giving you the ability to automate and track everything you do — centralized, online, and accessible from anywhere on any device.
          </p>
        </motion.div>

        {/* Interactive Odoo Tab Selector with Smooth Slow Slide Up */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.95, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-4 sm:flex sm:flex-wrap items-center justify-center gap-1 sm:gap-3 mb-6 sm:mb-10 w-full max-w-full sm:max-w-4xl mx-auto px-0"
        >
          {VALUE_TABS.map((tab) => {
            const isActive = activeTabId === tab.id;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 px-1 xs:px-1.5 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[9.5px] xs:text-[10.5px] sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none truncate ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                style={isActive ? { backgroundColor: '#FC787D' } : undefined}
              >
                <TabIcon 
                  className={`w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-white' : ''}`}
                  style={!isActive ? { color: tab.accent } : undefined} 
                />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content: Odoo Split Layout with Interactive Preview (Smooth Slow Slide Up) */}
        <motion.div 
          initial={{ opacity: 0, y: 65 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md p-4 xs:p-5 sm:p-10 lg:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Description & Capabilities */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
                <span 
                  className="text-[9.5px] xs:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${activeTab.accent}15`,
                    color: activeTab.accent
                  }}
                >
                  {activeTab.badge}
                </span>
                <span className="text-[11px] xs:text-xs font-semibold text-slate-400">
                  {activeTab.name}
                </span>
              </div>

              <h3 className="text-[17px] xs:text-[18px] sm:text-2xl lg:text-3xl font-bold sm:font-extrabold text-slate-900 tracking-tight leading-snug mb-2.5 sm:mb-4">
                {activeTab.headline}
              </h3>

              <p className="text-[12.5px] xs:text-[13px] sm:text-base text-slate-600 leading-relaxed mb-4 sm:mb-6">
                {activeTab.description}
              </p>

              {/* Key Features List */}
              <div className="space-y-2 sm:space-y-2.5 mb-5 sm:mb-8">
                {activeTab.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 sm:gap-2.5 text-[11.5px] xs:text-[12px] sm:text-sm text-slate-700 font-medium">
                    <span 
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${activeTab.accent}15` }}
                    >
                      <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" style={{ color: activeTab.accent }} />
                    </span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectApp) {
                      onSelectApp({ id: activeTab.id, name: activeTab.name });
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold text-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                  style={{ backgroundColor: '#FC787D' }}
                >
                  <span>Explore {activeTab.shortLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onOpenExpertModal}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition-all cursor-pointer text-slate-700 bg-white"
                >
                  <span>Request Live Demo</span>
                </button>
              </div>
            </div>

            {/* Right Column: Authentic Odoo-style Enterprise Dashboard Preview Card */}
            <div className="lg:col-span-6">
              <div className="bg-[#F8FAFC] rounded-xl sm:rounded-2xl border border-slate-200 p-3.5 sm:p-6 shadow-xs">
                
                {/* Mockup Window Header */}
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 mb-3 sm:mb-4 border-b border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-[11px] font-mono text-slate-500 font-medium truncate max-w-[140px] xs:max-w-none">
                      gmark.enterprise/{activeTab.id}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {activeTab.preview.status}
                  </span>
                </div>

                {/* Live Metrics Header */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-3.5 sm:mb-5">
                  {activeTab.metrics.map((m, idx) => (
                    <div key={idx} className="bg-white p-2 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200/80 text-center sm:text-left">
                      <span className="text-[10px] text-slate-400 font-medium block truncate">
                        {m.label}
                      </span>
                      <span 
                        className="text-xs xs:text-sm sm:text-lg font-extrabold block truncate mt-0.5"
                        style={{ color: '#1E293B' }}
                      >
                        {m.val}
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-medium block truncate mt-0.5">
                        {m.sub}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Interactive Simulated Operational Table */}
                <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200/80 p-2.5 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800">
                      {activeTab.preview.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Sub-Second Feed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeTab.preview.rows.map((row, rIdx) => (
                      <div 
                        key={rIdx} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-slate-50/80 border border-slate-100 text-[10.5px] sm:text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 block truncate">
                            {row.desc}
                          </span>
                          <span className="text-[10.5px] text-slate-500 block truncate">
                            {row.acc}
                          </span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <span className="font-mono font-semibold text-slate-700">
                            {row.amt}
                          </span>
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${activeTab.accent}15`,
                              color: activeTab.accent
                            }}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-note */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Zero integration delay across all enterprise tables</span>
                  <span className="font-semibold text-slate-700">PostgreSQL 16 &amp; Redis</span>
                </div>

              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
