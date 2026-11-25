import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ENTERPRISE_EASING } from './ui/scroll-reveal';
import { 
  ShieldCheck, 
  BarChart3, 
  Layers, 
  Headphones, 
  CheckCircle2, 
  Lock, 
  Activity, 
  Sparkles, 
  ArrowUpRight,
  Zap,
  Shield,
  ChevronRight
} from 'lucide-react';

const VISION_FEATURES = [
  {
    id: 'data-privacy',
    title: 'Data Privacy',
    category: 'Security & Compliance',
    tag: 'Security & Compliance',
    icon: ShieldCheck,
    iconColor: '#10b981',
    iconBg: '#ecfdf5',
    iconBorder: '#a7f3d0',
    description:
      'At our company, we prioritize data privacy by implementing robust security measures. We use encryption, access controls, and regular audits to ensure your confidential information remains safe and secure at all times.',
    mockup: {
      badge: 'Zero-Trust Security Protocol',
      headline: 'AES-256 Data Privacy Active',
      status: '100% Encrypted & Audited',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      metricLabel: 'Cryptographic Strength',
      metricValue: '256-bit SHA-3',
      points: [
        'End-to-end cryptographic cipher verification',
        'Role-based granular access control enforced',
        'Continuous automated audit trails streaming'
      ],
      footerAction: 'View Security Audit Log'
    }
  },
  {
    id: 'detailed-insights',
    title: 'Detailed Insights',
    category: 'Telemetry & Analytics',
    tag: 'Telemetry & Analytics',
    icon: BarChart3,
    iconColor: '#0284c7',
    iconBg: '#f0f9ff',
    iconBorder: '#bae6fd',
    description:
      'Gain detailed insights into your industry to empower data-driven decisions and minimize errors, ensuring your business stays ahead of curve with real-time telemetry.',
    mockup: {
      badge: 'Real-Time Telemetry Engine',
      headline: 'Predictive Anomaly Detection',
      status: 'Sub-Second Ingestion',
      statusColor: 'text-sky-700 bg-sky-50 border-sky-200',
      metricLabel: 'Decision Velocity',
      metricValue: '+28.4% Uplift',
      points: [
        'Zero false-positive alerts in current cycle',
        'Continuous 60 FPS edge device telemetry stream',
        'Automated executive insights & metric reports'
      ],
      footerAction: 'Inspect Telemetry Stream'
    }
  },
  {
    id: 'versatility',
    title: 'Versatility in Application',
    category: 'Ecosystem & Workflows',
    tag: 'Ecosystem & Workflows',
    icon: Layers,
    iconColor: '#f97316',
    iconBg: '#fff7ed',
    iconBorder: '#fed7aa',
    description:
      'Our platform allows easy integration with other applications, streamlining processes and enhancing productivity for a more efficient workflow across diverse sectors.',
    mockup: {
      badge: 'Enterprise Workflow Connector',
      headline: '8 Core Platforms Synchronized',
      status: 'Universal Webhook Bus',
      statusColor: 'text-amber-700 bg-amber-50 border-amber-200',
      metricLabel: 'API Compatibility',
      metricValue: '100% RESTful',
      points: [
        'Bidirectional SAP & legacy ERP data bridge',
        'Standardized Modbus & IoT sensor ingest pipeline',
        'Cross-sector custom webhook automations'
      ],
      footerAction: 'Explore Integration Hub'
    }
  },
  {
    id: 'customer-experience',
    title: 'Full Customer Experience',
    category: 'Attentive 24/7 Support',
    tag: '24/7 Support',
    icon: Headphones,
    iconColor: '#e11d48',
    iconBg: '#fff1f2',
    iconBorder: '#fecdd3',
    description:
      "Our after-sales support is quick and attentive, guaranteeing a smooth customer experience. Your satisfaction is our top priority, and we're here to assist you through every upgrade cycle.",
    mockup: {
      badge: 'Enterprise Service Level (SLA)',
      headline: 'Attentive 24/7 Engineering Support',
      status: 'Live Engineers Online',
      statusColor: 'text-rose-700 bg-rose-50 border-rose-200',
      metricLabel: 'Average Response Time',
      metricValue: '< 45 Seconds',
      points: [
        'Dedicated enterprise technical account manager',
        'Proactive upgrade cycle assistance & staging',
        '99.8% Verified customer satisfaction index'
      ],
      footerAction: 'Connect with Specialist'
    }
  }
];

// Subcomponent: Live Operational Telemetry Stream Card
function TelemetryDashboardCard({ isMobile = false }) {
  return (
    <div className={`w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-lg sm:shadow-2xl ring-1 ring-slate-900/5 ${isMobile ? 'p-3.5 sm:p-5' : 'p-3.5 sm:p-5 lg:p-6'} relative transition-all duration-300`}>
      
      {/* Window Bar with Browser Controls */}
      <div className="flex items-center justify-between pb-3 sm:pb-3.5 mb-3.5 sm:mb-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="ml-2 text-[10.5px] sm:text-[11px] font-semibold text-slate-400 hidden xs:inline-block sm:inline-block">
            gmark.cloud/data-vision
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9.5px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Live Telemetry
          </span>
        </div>
      </div>

      {/* Dashboard Metrics Header */}
      <div className="mb-3.5 sm:mb-4">
        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
          <div>
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider">
              Operational Telemetry Stream
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-400">Industrial IoT &amp; Enterprise Pipeline</p>
          </div>
          <span className="text-[9.5px] sm:text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0">
            60 FPS Sync
          </span>
        </div>

        {/* 3 Metric Cards - Fluid Mobile Grid & Centered Alignment */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 text-center sm:text-left flex flex-col justify-center">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium block mb-0.5 truncate">Throughput</span>
            <span className="text-[12px] sm:text-sm font-extrabold text-slate-800 truncate">2.4M/s</span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 text-center sm:text-left flex flex-col justify-center">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium block mb-0.5 truncate">Reliability</span>
            <span className="text-[12px] sm:text-sm font-extrabold text-emerald-600 truncate">99.98%</span>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 text-center sm:text-left flex flex-col justify-center">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium block mb-0.5 truncate">Cipher</span>
            <span className="text-[12px] sm:text-sm font-extrabold text-slate-800 truncate">AES-256</span>
          </div>
        </div>
      </div>

      {/* Visual Area Telemetry Curve Graph */}
      <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#FC787D]" />
            Data Decision Index
          </span>
          <span className="text-[10px] sm:text-[10.5px] font-bold text-emerald-600">+18.4% Efficiency</span>
        </div>
        
        <div className="w-full h-16 sm:h-20 overflow-hidden">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id={isMobile ? "areaGradientMobile" : "areaGradientOdoo"} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FC787D" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#FC787D" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 55 Q 35 48, 70 35 T 140 38 T 210 20 T 280 12 L 300 15 L 300 70 L 0 70 Z"
              fill={`url(#${isMobile ? "areaGradientMobile" : "areaGradientOdoo"})`}
            />
            <path
              d="M 0 55 Q 35 48, 70 35 T 140 38 T 210 20 T 280 12 L 300 15"
              stroke="#FC787D"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="210" cy="20" r="3.5" fill="#FC787D" />
            <circle cx="280" cy="12" r="4.5" fill="#ffffff" stroke="#FC787D" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* Operational Pipeline Stream Rows */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between p-2 rounded-lg sm:rounded-xl bg-white border border-slate-100 text-[10.5px] sm:text-[11px]">
          <div className="flex items-center gap-2 truncate mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="font-semibold text-slate-800 truncate">CMMS Preventive Maintenance</span>
          </div>
          <span className="text-[9.5px] sm:text-[10px] font-bold text-emerald-600 shrink-0">Optimal (0 Latency)</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg sm:rounded-xl bg-white border border-slate-100 text-[10.5px] sm:text-[11px]">
          <div className="flex items-center gap-2 truncate mr-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
            <span className="font-semibold text-slate-800 truncate">G-Nova IoT Booster Stream</span>
          </div>
          <span className="text-[9.5px] sm:text-[10px] font-bold text-sky-600 shrink-0">Active &amp; Telemetric</span>
        </div>
      </div>

    </div>
  );
}

// Subcomponent: Zero-Trust Security / Active Feature Mockup Card
function SecurityFeatureCard({ activeFeature, isMobile = false }) {
  const ActiveIcon = activeFeature.icon;
  return (
    <div
      className={`w-full bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl ring-1 ring-slate-900/5 ${isMobile ? 'p-4 sm:p-5' : 'p-3.5 sm:p-5'} transition-all duration-300`}
    >
      {/* Floating Card Header */}
      <div className="flex items-center justify-between pb-2 sm:pb-2.5 mb-2.5 sm:mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: activeFeature.iconBg }}
          >
            <ActiveIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: activeFeature.iconColor }} />
          </div>
          <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-800 truncate">
            {activeFeature.mockup.badge}
          </span>
        </div>
        <span className={`text-[9px] sm:text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${activeFeature.mockup.statusColor}`}>
          {activeFeature.mockup.status}
        </span>
      </div>

      {/* Headline & Metric */}
      <div className="mb-2.5 sm:mb-3">
        <span className="text-[9.5px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
          {activeFeature.mockup.metricLabel}
        </span>
        <div className="flex items-baseline justify-between mt-0.5">
          <span className="text-sm sm:text-base lg:text-lg font-bold text-slate-900">
            {activeFeature.mockup.headline}
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-[#FC787D]">
            {activeFeature.mockup.metricValue}
          </span>
        </div>
      </div>

      {/* Verified Checklist Points */}
      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-3.5">
        {activeFeature.mockup.points.map((pt, idx) => (
          <div key={idx} className="flex items-start gap-2 text-[10.5px] sm:text-[11px] text-slate-600 leading-tight">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>{pt}</span>
          </div>
        ))}
      </div>

      {/* Card Footer Action */}
      <div className="pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] sm:text-[10.5px] font-bold text-slate-700">
          {activeFeature.mockup.footerAction}
        </span>
        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </span>
      </div>
    </div>
  );
}

export default function DataVisionSection() {
  const [activeFeatureId, setActiveFeatureId] = useState('data-privacy');
  const prefersReduced = useReducedMotion();
  const activeFeature = VISION_FEATURES.find((f) => f.id === activeFeatureId) || VISION_FEATURES[0];

  return (
    <section 
      id="data-vision-section"
      className="relative w-full bg-white py-14 sm:py-18 lg:py-20 overflow-hidden"
      style={{ 
        backgroundColor: '#FFFFFF',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* Subtle Background Radial Ambient Glows matching Official Theme */}
      <div 
        className="absolute top-1/4 right-0 w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full blur-3xl pointer-events-none -z-10" 
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(252, 120, 125, 0.04) 0%, transparent 80%)'
        }}
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-10 left-0 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full blur-3xl pointer-events-none -z-10" 
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(15, 118, 110, 0.03) 0%, transparent 80%)'
        }}
        aria-hidden="true"
      />

      {/* Main Section Content Wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* PART 1: THE ASYMMETRIC TWO-COLUMN SPLIT SHOWCASE                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-14 xl:gap-20 items-center">
          
          {/* LEFT COLUMN: Fluid Typography, High-Impact Heading (Smooth Slow Slide Up from Bottom) */}
          <motion.div 
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 55 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.05, ease: ENTERPRISE_EASING }}
            className="lg:col-span-5 xl:col-span-6 flex flex-col justify-center text-left"
          >
            
            

            {/* Authentic Enterprise Official Headline */}
            <h2
              className="text-slate-900 tracking-tight text-3xl sm:text-4xl md:text-[42px] lg:text-[46px] font-extrabold leading-[1.2] sm:leading-[1.18]"
              style={{
                color: '#0F172A',
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}
            >
              Let Your Data Take Your Business to{' '}
              <span style={{ color: '#FC787D' }}>Higher Grounds.</span>
            </h2>

            {/* Subtitle / Paragraphs (100% Exact Content Preserved) */}
            <div className="text-slate-600 font-normal text-[14px] sm:text-[15.5px] leading-relaxed mt-4 sm:mt-6 mb-6 sm:mb-8 space-y-2.5 sm:space-y-3.5 max-w-xl">
              <p className="leading-relaxed">
                We aim to deliver intuitive high-tech platforms that enable industries to effortlessly shift from the physical world to the digital age.
              </p>
              <p className="text-slate-500 leading-relaxed text-[13.5px] sm:text-[14.5px]">
                Recognizing the obstacles that come with this change, our cutting solutions are crafted to streamline the transition, boost efficiency, and promote growth.
              </p>
            </div>

            {/* Quick Authority & Trust Metric Bar - Mobile Touch-Friendly Badge Formatting */}
            <div className="pt-4 sm:pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-2 sm:gap-x-8 text-slate-700 text-xs sm:text-[13px] font-semibold mb-6 sm:mb-8 lg:mb-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:p-0 rounded-lg bg-slate-100/70 sm:bg-transparent border border-slate-200/60 sm:border-0 shadow-2xs sm:shadow-none">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>99.98% Telemetry Uptime</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:p-0 rounded-lg bg-slate-100/70 sm:bg-transparent border border-slate-200/60 sm:border-0 shadow-2xs sm:shadow-none">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>Zero Data Leakage</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:p-0 rounded-lg bg-slate-100/70 sm:bg-transparent border border-slate-200/60 sm:border-0 shadow-2xs sm:shadow-none">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>Enterprise SLA</span>
              </div>
            </div>

          </motion.div>

          {/* RIGHT COLUMN: Responsive Presentation (Smooth Slow Slide Up from Bottom) */}
          <motion.div 
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 65 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.1, delay: 0.15, ease: ENTERPRISE_EASING }}
            className="lg:col-span-7 xl:col-span-6 relative w-full pt-1 sm:pt-4 lg:pt-0"
          >
            {/* =================================================================== */}
            {/* A. MOBILE / TABLET OPTIMIZED INTERACTIVE SHOWCASE VIEW (<lg)        */}
            {/* =================================================================== */}
            <div className="block lg:hidden w-full max-w-lg mx-auto">
              
              {/* 1. Mobile Header & Feature Navigation */}
              <div className="w-full flex flex-col items-center mb-3.5">
                
                {/* Zero-Trust Security Element (Centered, balanced & prominently visible) */}
                <div className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white border border-slate-200/90 shadow-xs text-xs font-bold text-slate-900 select-none">
                  <Lock className="w-3.5 h-3.5 text-[#FC787D]" />
                  <span>Zero-Trust Security</span>
                </div>

                {/* Touch-friendly Pillar Filter Chips (Quick feature preview on mobile) */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full py-2.5 px-1 mt-1">
                  {VISION_FEATURES.map((feat) => {
                    const isSelected = activeFeatureId === feat.id;
                    const IconComp = feat.icon;
                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => setActiveFeatureId(feat.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 transition-all border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs scale-[1.02]'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <IconComp className="w-3 h-3" style={{ color: isSelected ? '#ffffff' : feat.iconColor }} />
                        <span>{feat.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Interactive Active Card Container: Zero Trust Security Showcase */}
              <div className="w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`mobile-security-${activeFeature.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="w-full"
                  >
                    <SecurityFeatureCard activeFeature={activeFeature} isMobile={true} />
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

            {/* =================================================================== */}
            {/* B. DESKTOP MULTI-LAYERED FLOATING UI MOCKUP (PRESERVED 100%) (>=lg)  */}
            {/* =================================================================== */}
            <div className="hidden lg:block relative w-full">
              <div className="relative w-full flex flex-col items-center justify-center">

                {/* LAYER 1: BASE MAIN DASHBOARD CARD */}
                <div className="w-full max-w-[520px]">
                  <TelemetryDashboardCard isMobile={false} />
                </div>

                {/* LAYER 2: OVERLAPPING FLOATING CARD */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature.id}
                    initial={{ opacity: 0, y: 15, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="w-full lg:max-w-[350px] xl:max-w-[380px] z-20 lg:absolute lg:-bottom-8 lg:-right-3 xl:-bottom-10 xl:-right-6"
                  >
                    <SecurityFeatureCard activeFeature={activeFeature} isMobile={false} />
                  </motion.div>
                </AnimatePresence>

                {/* LAYER 3: FLOATING ACCENT MICRO-BADGES (Desktop Depth) */}
                <div className="flex absolute -top-4 left-0 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl px-3.5 py-1.5 shadow-xl ring-1 ring-slate-900/5 items-center gap-2 z-30 pointer-events-none">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] font-bold text-slate-800">100% Data Privacy Verified</span>
                </div>

                <div className="flex absolute top-1/2 -left-6 bg-slate-900 text-white rounded-2xl px-3.5 py-2 shadow-2xl ring-1 ring-white/10 items-center gap-2 z-30 pointer-events-none">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10.5px] font-bold">Industrial-Grade Engine</span>
                </div>

              </div>
            </div>

          </motion.div>

        </div>

        {/* ========================================================================= */}
        {/* PART 2: THE 4 CORE FEATURES STRUCTURED MICRO-GRID SHOWCASE                 */}
        {/* ========================================================================= */}
        <div className="hidden md:block mt-6 sm:mt-8 lg:mt-10">
          
          {/* Section Divider Bar */}
          <motion.div 
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: ENTERPRISE_EASING }}
            className="flex items-center gap-3 sm:gap-4 mb-3.5 sm:mb-4"
          >
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Core Architectural Pillars
            </span>
            <div className="h-px flex-1 bg-slate-200/80" />
          </motion.div>

          {/* 4 Feature Cards Grid: 4 Columns on Desktop, 2 on Tablet, 1 on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {VISION_FEATURES.map((item, index) => {
              const isActive = activeFeatureId === item.id;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => setActiveFeatureId(item.id)}
                  initial={prefersReduced ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 55, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ 
                    duration: 0.95, 
                    delay: index * 0.12, 
                    ease: ENTERPRISE_EASING 
                  }}
                  className={`group relative rounded-2xl p-4 sm:p-4.5 border transition-all duration-300 cursor-pointer flex flex-col justify-between select-none ${
                    isActive
                      ? 'bg-white border-[#FC787D]/40 ring-2 ring-[#FC787D]/15 shadow-lg -translate-y-1'
                      : 'bg-white border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-slate-300/90'
                  }`}
                >
                  <div>
                    {/* Top Row: Category Tag Badge */}
                    <div className="mb-2.5 sm:mb-3">
                      <span 
                        className="inline-block text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs"
                        style={{ 
                          backgroundColor: item.iconBg, 
                          color: item.iconColor,
                          borderColor: item.iconBorder
                        }}
                      >
                        {item.tag}
                      </span>
                    </div>

                    {/* Feature Title (100% Exact Text) */}
                    <h3 className="text-slate-900 font-bold text-[14.5px] sm:text-[15.5px] tracking-tight leading-snug mb-1.5 group-hover:text-[#FC787D] transition-colors">
                      {item.title}
                    </h3>

                    {/* Feature Description (100% Exact Text) */}
                    <p className="text-slate-600 text-[11px] sm:text-[11.5px] leading-relaxed mb-3 sm:mb-3.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Interactive Status Indicator at Bottom of Card */}
                  <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10.5px] sm:text-[11px] font-semibold">
                    <span className={`flex items-center gap-1.5 transition-colors ${
                      isActive ? 'text-[#FC787D] font-bold' : 'text-slate-400 group-hover:text-slate-700'
                    }`}>
                      {isActive ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FC787D] animate-pulse" />
                          <span>Active in Showcase</span>
                        </>
                      ) : (
                        <span>Inspect in Showcase</span>
                      )}
                    </span>
                    <span 
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isActive 
                          ? 'text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-400 group-hover:bg-[#FC787D] group-hover:text-white'
                      }`}
                      style={isActive ? { backgroundColor: '#FC787D' } : undefined}
                    >
                      <ArrowUpRight className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isActive ? 'translate-x-0.5 -translate-y-0.5' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                      }`} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
