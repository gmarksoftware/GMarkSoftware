"use client"

import React, { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ENTERPRISE_EASING } from "@/components/ui/scroll-reveal"
import { ArrowRight } from "lucide-react"
import { getAssetUrl } from "@/utils/asset"

// Silky smooth, slow deceleration curve for luxurious enterprise feel
const SMOOTH_SLOW_EASING = [0.16, 1, 0.3, 1] as const;

// Odoo-style proprietary apps showcase - BIG LOGO & SOFTWARE NAME ONLY
const HERO_APPS = [
  {
    id: 'erp',
    name: 'Opstream ERP',
    image: getAssetUrl('/ERP Logo.png'),
    brandColor: '#0F766E',
    glowColor: 'rgba(15, 118, 110, 0.12)'
  },
  {
    id: 'cmms',
    name: '4M Smart CMMS',
    image: getAssetUrl('/4m-clean.png'),
    brandColor: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.12)'
  },
  {
    id: 'g-nova-iot',
    name: 'G-Nova IoT',
    image: getAssetUrl('/g-nova-clean.png'),
    brandColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.12)'
  },
  {
    id: 'g-track',
    name: 'G Track',
    image: getAssetUrl('/G Track logo.png'),
    brandColor: '#16A34A',
    glowColor: 'rgba(22, 163, 74, 0.12)'
  },
  {
    id: 'gram-unnati',
    name: 'GramUnnati',
    image: getAssetUrl('/gramunnati-clean.png'),
    brandColor: '#15803D',
    glowColor: 'rgba(21, 128, 61, 0.12)'
  },
  {
    id: 'task-management',
    name: 'SynkroBoard',
    image: getAssetUrl('/SynkroBoard.png'),
    brandColor: '#EA580C',
    glowColor: 'rgba(234, 88, 12, 0.12)'
  },
  {
    id: 'transporter-app',
    name: 'GShip Fleet',
    image: getAssetUrl('/transporter-clean.png'),
    brandColor: '#0284C7',
    glowColor: 'rgba(2, 132, 199, 0.12)'
  },
  {
    id: 'shg-app',
    name: 'GKart SHG',
    image: getAssetUrl('/shg-clean.png'),
    brandColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.12)'
  }
];

// =============================================================================
// FLOWING DATA RAYS (Left & Right Flank Animated Enterprise Beams)
// =============================================================================
function FlowingDataRaysLeft({ prefersReduced }: { prefersReduced: boolean | null }) {
  return (
    <div 
      className="absolute left-0 top-16 sm:top-20 bottom-12 w-64 md:w-80 lg:w-[420px] pointer-events-none overflow-hidden select-none z-0 hidden md:block"
      aria-hidden="true"
    >
      <svg 
        viewBox="0 0 420 500" 
        className="w-full h-full" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ray-grad-left-plum" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#714B67" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#714B67" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#714B67" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="ray-grad-left-teal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#0D9488" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="pulse-beam-plum" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#714B67" stopOpacity="0" />
            <stop offset="50%" stopColor="#714B67" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#714B67" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pulse-beam-teal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0" />
            <stop offset="50%" stopColor="#0D9488" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ray 1: Top Curve */}
        <path
          d="M 0 110 C 160 110, 260 210, 420 220"
          stroke="url(#ray-grad-left-plum)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        {!prefersReduced && (
          <motion.path
            d="M 0 110 C 160 110, 260 210, 420 220"
            stroke="url(#pulse-beam-plum)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ strokeDashoffset: 500, strokeDasharray: "70 430" }}
            animate={{ strokeDashoffset: -500 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 0.5 }}
          />
        )}

        {/* Ray 2: Middle Arc */}
        <path
          d="M 0 240 C 150 240, 270 250, 420 255"
          stroke="url(#ray-grad-left-teal)"
          strokeWidth="1.5"
        />
        {!prefersReduced && (
          <motion.path
            d="M 0 240 C 150 240, 270 250, 420 255"
            stroke="url(#pulse-beam-teal)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ strokeDashoffset: 450, strokeDasharray: "60 390" }}
            animate={{ strokeDashoffset: -450 }}
            transition={{ duration: 8.5, repeat: Infinity, ease: "linear", delay: 2 }}
          />
        )}

        {/* Ray 3: Bottom Upward Arc */}
        <path
          d="M 0 380 C 170 380, 280 290, 420 280"
          stroke="url(#ray-grad-left-plum)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        {!prefersReduced && (
          <motion.path
            d="M 0 380 C 170 380, 280 290, 420 280"
            stroke="url(#pulse-beam-plum)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ strokeDashoffset: 500, strokeDasharray: "80 420" }}
            animate={{ strokeDashoffset: -500 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 3.5 }}
          />
        )}

        {/* Ray 4: Upper diagonal stream */}
        <path
          d="M 20 60 C 180 120, 290 230, 420 235"
          stroke="url(#ray-grad-left-teal)"
          strokeWidth="1.25"
          strokeDasharray="3 5"
          opacity="0.5"
        />

        {/* Glowing Network Telemetry Nodes on Left */}
        <g>
          <circle cx="90" cy="110" r="3.5" fill="#714B67" />
          <circle cx="90" cy="110" r="8" fill="#714B67" opacity="0.18" className="animate-pulse" />
          <text x="105" y="114" fill="#714B67" fontSize="10" fontWeight="700" letterSpacing="0.06em" opacity="0.8">
            50Hz TELEMETRY
          </text>

          <circle cx="130" cy="240" r="3.5" fill="#0D9488" />
          <circle cx="130" cy="240" r="8" fill="#0D9488" opacity="0.18" className="animate-pulse" />
          <text x="145" y="244" fill="#0D9488" fontSize="10" fontWeight="700" letterSpacing="0.06em" opacity="0.8">
            MQTT v5 BROKER
          </text>

          <circle cx="120" cy="355" r="3" fill="#714B67" opacity="0.7" />
          <text x="135" y="359" fill="#714B67" fontSize="9.5" fontWeight="700" letterSpacing="0.06em" opacity="0.65">
            PRISMA RELATIONAL
          </text>
        </g>
      </svg>
    </div>
  );
}

function FlowingDataRaysRight({ prefersReduced }: { prefersReduced: boolean | null }) {
  return (
    <div 
      className="absolute right-0 top-16 sm:top-20 bottom-12 w-64 md:w-80 lg:w-[420px] pointer-events-none overflow-hidden select-none z-0 hidden md:block"
      aria-hidden="true"
    >
      <svg 
        viewBox="0 0 420 500" 
        className="w-full h-full" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ray-grad-right-plum" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#714B67" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#714B67" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#714B67" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="ray-grad-right-teal" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#0D9488" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="pulse-beam-right-plum" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#714B67" stopOpacity="0" />
            <stop offset="50%" stopColor="#714B67" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#714B67" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pulse-beam-right-teal" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0" />
            <stop offset="50%" stopColor="#0D9488" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ray 1: Top Curve from Right */}
        <path
          d="M 420 110 C 260 110, 160 210, 0 220"
          stroke="url(#ray-grad-right-plum)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        {!prefersReduced && (
          <motion.path
            d="M 420 110 C 260 110, 160 210, 0 220"
            stroke="url(#pulse-beam-right-plum)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ strokeDashoffset: -500, strokeDasharray: "70 430" }}
            animate={{ strokeDashoffset: 500 }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "linear", delay: 1 }}
          />
        )}

        {/* Ray 2: Middle Arc from Right */}
        <path
          d="M 420 240 C 270 240, 150 250, 0 255"
          stroke="url(#ray-grad-right-teal)"
          strokeWidth="1.5"
        />
        {!prefersReduced && (
          <motion.path
            d="M 420 240 C 270 240, 150 250, 0 255"
            stroke="url(#pulse-beam-right-teal)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ strokeDashoffset: -450, strokeDasharray: "60 390" }}
            animate={{ strokeDashoffset: 450 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 2.5 }}
          />
        )}

        {/* Ray 3: Bottom Upward Arc from Right */}
        <path
          d="M 420 380 C 250 380, 140 290, 0 280"
          stroke="url(#ray-grad-right-plum)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        {!prefersReduced && (
          <motion.path
            d="M 420 380 C 250 380, 140 290, 0 280"
            stroke="url(#pulse-beam-right-plum)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ strokeDashoffset: -500, strokeDasharray: "80 420" }}
            animate={{ strokeDashoffset: 500 }}
            transition={{ duration: 9.5, repeat: Infinity, ease: "linear", delay: 4 }}
          />
        )}

        {/* Ray 4: Upper diagonal stream from Right */}
        <path
          d="M 400 60 C 240 120, 130 230, 0 235"
          stroke="url(#ray-grad-right-teal)"
          strokeWidth="1.25"
          strokeDasharray="3 5"
          opacity="0.5"
        />

        {/* Glowing Network Telemetry Nodes on Right */}
        <g>
          <circle cx="330" cy="110" r="3.5" fill="#714B67" />
          <circle cx="330" cy="110" r="8" fill="#714B67" opacity="0.18" className="animate-pulse" />
          <text x="230" y="114" fill="#714B67" fontSize="10" fontWeight="700" letterSpacing="0.06em" opacity="0.8">
            SUB-SECOND SYNC
          </text>

          <circle cx="290" cy="240" r="3.5" fill="#0D9488" />
          <circle cx="290" cy="240" r="8" fill="#0D9488" opacity="0.18" className="animate-pulse" />
          <text x="175" y="244" fill="#0D9488" fontSize="10" fontWeight="700" letterSpacing="0.06em" opacity="0.8">
            POSTGRESQL 16 CLOUD
          </text>

          <circle cx="300" cy="355" r="3" fill="#714B67" opacity="0.7" />
          <text x="205" y="359" fill="#714B67" fontSize="9.5" fontWeight="700" letterSpacing="0.06em" opacity="0.65">
            MULTI-TENANT RBAC
          </text>
        </g>
      </svg>
    </div>
  );
}

export function Hero({
  title = "All your enterprise software",
  highlightText = "on one platform.",
  subtitle = "Run your entire operations with proprietary applications for ERP & Finance, 4M Industrial Maintenance, G-Nova IoT Telemetry, and Field Logistics.",
  ctaLabel = "Explore All Applications",
  ctaHref = "#applications-section",
  onCtaClick,
  secondaryCtaLabel = "Schedule a Demo",
  secondaryCtaHref = "#applications-section",
  onSecondaryCtaClick,
  onSelectApp,
  showMarquee = true,
}: {
  title?: string
  highlightText?: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: (e?: any) => void
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  onSecondaryCtaClick?: (e?: any) => void
  onSelectApp?: (app: any) => void
  showMarquee?: boolean
}) {
  const prefersReduced = useReducedMotion();
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const handleAppClick = (app: any) => {
    if (onSelectApp) {
      onSelectApp(app);
    } else if (onCtaClick) {
      onCtaClick();
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-white text-center pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 lg:pb-20"
      style={{
        backgroundColor: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* Subtle Odoo ambient background glow */}
      <div
        className="absolute inset-0 -z-10 w-full h-[680px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -15%, rgba(113, 75, 103, 0.09) 0%, rgba(255, 255, 255, 0) 70%)'
        }}
        aria-hidden="true"
      />

      {/* Flowing Data Rays Background Animation (Left & Right Flanks) */}
      <FlowingDataRaysLeft prefersReduced={prefersReduced} />
      <FlowingDataRaysRight prefersReduced={prefersReduced} />

      {/* Main Centered Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">

        {/* 1. Main Headline: Smooth Slow Slide Up from Bottom (y: 50 -> 0, duration: 1.1s) */}
        <motion.h1
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.1, ease: SMOOTH_SLOW_EASING }}
          className="text-slate-900 tracking-tight text-center max-w-4xl mx-auto font-extrabold"
          style={{
            fontSize: 'clamp(2.35rem, 4.8vw, 4.15rem)',
            lineHeight: '1.16',
            color: '#1E293B',
          }}
        >
          <span>{title || "All your enterprise software"} </span>
          <span 
            className="block sm:inline"
            style={{ color: '#714B67' }}
          >
            {highlightText || "on one platform."}
          </span>
        </motion.h1>

        {/* 2. Subtitle: Smooth Slow Slide Up from Bottom (y: 45 -> 0, duration: 1.1s, delay: 0.25s) */}
        <motion.div
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.25, ease: SMOOTH_SLOW_EASING }}
          className="px-3 sm:px-0 mt-5 sm:mt-6 mb-7 sm:mb-8 w-full max-w-3xl mx-auto text-center"
        >
          <p 
            className="text-base sm:text-lg lg:text-[1.2rem] text-slate-600 leading-relaxed font-normal"
            style={{ color: '#4B5563' }}
          >
            <strong className="text-slate-800 font-semibold">Simple, efficient, yet fully integrated.</strong>{' '}
            {subtitle || "Run your entire business with proprietary applications for ERP & Finance, 4M Industrial Maintenance, G-Nova IoT Telemetry, and Field Logistics."}
          </p>
        </motion.div>

        {/* 3. Action Buttons: Smooth Slow Slide Up from Bottom (y: 40 -> 0, duration: 1.05s, delay: 0.4s) */}
        <motion.div 
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.05, delay: 0.4, ease: SMOOTH_SLOW_EASING }}
          className="relative flex flex-col items-center justify-center z-20 w-full mb-8 sm:mb-10"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-sm sm:max-w-none mx-auto">
            
            {/* Primary Button: Odoo Plum #714B67 */}
            {ctaLabel && (
              <a
                href={ctaHref}
                onClick={onCtaClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-[15px] sm:text-[16px] font-bold text-white rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:bg-[#5E3E55] active:scale-[0.98] select-none text-center w-full sm:w-auto"
                style={{
                  backgroundColor: '#714B67',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </a>
            )}

            {/* Secondary Button: Clean white with subtle border & Odoo text */}
            {secondaryCtaLabel && (
              <button
                type="button"
                onClick={onSecondaryCtaClick || onCtaClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-[15px] sm:text-[16px] font-semibold rounded-lg transition-all duration-200 cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] select-none text-center w-full sm:w-auto shadow-2xs"
                style={{
                  color: '#714B67',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                <span>{secondaryCtaLabel}</span>
              </button>
            )}

          </div>
        </motion.div>

      </div>

      {/* ========================================================================= */}
      {/* 4. FULL-WIDTH PROPRIETARY SOFTWARE ECOSYSTEM SHOWCASE SECTION            */}
      {/* ========================================================================= */}
      <motion.div
        initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 55 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.1, delay: 0.2, ease: SMOOTH_SLOW_EASING }}
        className="w-full bg-[#FAFAFC] border-y border-slate-200/80 py-16 sm:py-20 mt-6 sm:mt-8 relative overflow-hidden"
      >
        {/* Subtle ambient radial background glow */}
        <div 
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(113, 75, 103, 0.05) 0%, rgba(250, 250, 252, 0) 80%)'
          }}
          aria-hidden="true"
        />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Centered Distinctive Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span 
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3"
              style={{
                backgroundColor: '#F9F5F8',
                color: '#714B67',
                border: '1px solid #E3D4DF'
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#714B67]" />
              Proprietary Product Suite
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore Our Software Products
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">
              Eight specialized enterprise applications engineered to run your entire operations.
            </p>
          </div>

          {/* Full-Width 4-Column Grid: Seamless Sculpted Pods */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
            {HERO_APPS.map((app, index) => (
              <motion.div
                key={app.id}
                initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ 
                  duration: 0.95, 
                  delay: (index % 4) * 0.08, 
                  ease: SMOOTH_SLOW_EASING 
                }}
                onClick={() => handleAppClick(app)}
                role="button"
                tabIndex={0}
                className="group relative bg-white rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-between border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.12)] hover:-translate-y-2 transition-all duration-300 ease-out cursor-pointer overflow-hidden text-center focus-visible:outline-2 focus-visible:outline-[#714B67]"
                style={{
                  minHeight: '210px'
                }}
              >
                {/* Subtle Dynamic Ambient Color Aura (Blooms smoothly on hover using product's own brand color) */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, ${app.glowColor} 0%, rgba(255, 255, 255, 0) 70%)`
                  }}
                  aria-hidden="true"
                />

                {/* Big High-Resolution Logo Stage */}
                <div className="w-full h-24 sm:h-28 flex items-center justify-center relative z-10 my-auto">
                  <img 
                    src={app.image} 
                    alt={app.name} 
                    className="max-h-18 sm:max-h-22 w-auto max-w-[85%] object-contain pointer-events-none select-none transition-transform duration-300 ease-out group-hover:scale-108 filter drop-shadow-xs" 
                    loading="lazy"
                  />
                </div>

                {/* Integrated Software Title (No dividing line, fluid one-piece pod) */}
                <div className="w-full relative z-10 pt-3">
                  <h3 className="text-[15px] sm:text-base font-bold text-slate-800 tracking-tight group-hover:text-[#714B67] transition-colors leading-snug">
                    {app.name}
                  </h3>
                  {/* Sleek explore cue that smoothly fades & slides in on hover */}
                  <div className="h-4 flex items-center justify-center mt-1 overflow-hidden">
                    <span className="text-[11.5px] font-semibold text-[#714B67] inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                      <span>Explore platform</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </motion.div>

      {/* 5. Enterprise Platform Integrations & Technology Strip */}
      {showMarquee && (
        <motion.div
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.05, delay: 0.15, ease: SMOOTH_SLOW_EASING }}
          className="relative z-20 w-full max-w-5xl mx-auto mt-12 sm:mt-14 px-4"
        >
          <div className="pt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 text-center">
              Enterprise Grade • Built With Resilient Technologies
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                <span className="font-extrabold text-slate-800">NEXT.js</span> App Engine
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                <span className="font-extrabold text-slate-800">PostgreSQL</span> 16
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                <span className="font-extrabold text-slate-800">TimescaleDB</span> 50Hz
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                <span className="font-extrabold text-slate-800">AWS</span> Cloud Native
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                <span className="font-extrabold text-slate-800">MQTT v5</span> Telemetry
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                <span className="font-extrabold text-slate-800">TailwindCSS</span>
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  )
}

export default Hero
