"use client"

import React, { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ENTERPRISE_EASING } from "@/components/ui/scroll-reveal"
import { ArrowRight, Settings, Package, Wifi, BarChart3, Users } from "lucide-react"
import { getAssetUrl } from "@/utils/asset"
import { MarqueeDemo } from "@/components/ui/demo"

// Silky smooth, slow deceleration curve for luxurious enterprise feel
const SMOOTH_SLOW_EASING = [0.16, 1, 0.3, 1] as const;

// Floating Feature Badges on Left and Right orbital paths (matching reference screenshot)
const FLOATING_CARDS_LEFT = [
  {
    id: 'erp',
    title: 'ERP & Finance',
    subtitle: 'Business Operations',
    top: '10%',
    left: 'clamp(0.75rem, 4vw, 3.8rem)',
    iconBg: '#F7F1F6',
    iconColor: '#714B67',
    iconType: 'chart',
    floatDelay: 0,
    floatDuration: 5.2,
  },
  {
    id: 'cmms',
    title: 'Industrial Maintenance',
    subtitle: 'Asset Management',
    top: '40%',
    left: 'clamp(0.5rem, 2.5vw, 2.6rem)',
    iconBg: '#F7F1F6',
    iconColor: '#714B67',
    iconType: 'gear',
    floatDelay: 0.6,
    floatDuration: 5.8,
  },
  {
    id: 'logistics',
    title: 'Field Logistics',
    subtitle: 'Track & Manage',
    top: '70%',
    left: 'clamp(1.5rem, 4.8vw, 4.8rem)',
    iconBg: '#F7F1F6',
    iconColor: '#714B67',
    iconType: 'box',
    floatDelay: 1.2,
    floatDuration: 5.0,
  },
];

const FLOATING_CARDS_RIGHT = [
  {
    id: 'telemetry',
    title: 'IoT Telemetry',
    subtitle: 'Live Monitoring',
    top: '12%',
    right: 'clamp(1rem, 4vw, 3.8rem)',
    iconBg: '#E6F8F0',
    iconColor: '#10B981',
    iconType: 'wifi',
    floatDelay: 0.3,
    floatDuration: 5.4,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    subtitle: 'Data Insights',
    top: '42%',
    right: 'clamp(0.5rem, 2.2vw, 2.4rem)',
    iconBg: '#EEF4FF',
    iconColor: '#2563EB',
    iconType: 'analytics',
    floatDelay: 0.9,
    floatDuration: 6.0,
  },
  {
    id: 'operations',
    title: 'Operations',
    subtitle: 'Unified Platform',
    top: '70%',
    right: 'clamp(1.5rem, 4.8vw, 4.8rem)',
    iconBg: '#E6F8F0',
    iconColor: '#10B981',
    iconType: 'users',
    floatDelay: 1.5,
    floatDuration: 5.5,
  },
];

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

export function Hero({
  title = "All your enterprise software",
  highlightText = "on one platform.",
  subtitle = "Simple, efficient, yet fully integrated. Run your entire operations with proprietary applications for ERP & Finance, 4M Industrial Maintenance, G-Nova IoT Telemetry, and Field Logistics.",
  ctaLabel = "Explore Solutions",
  ctaHref = "#value-proposition-section",
  onCtaClick,
  secondaryCtaLabel = "Schedule a Demo",
  secondaryCtaHref = "#value-proposition-section",
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

  const renderCardIcon = (type: string, color: string) => {
    switch (type) {
      case 'chart':
        return (
          <svg className="w-5 h-5" style={{ color }} viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="12" width="4" height="9" rx="1.5" />
            <rect x="10" y="7" width="4" height="14" rx="1.5" />
            <rect x="17" y="3" width="4" height="18" rx="1.5" />
          </svg>
        );
      case 'gear':
        return <Settings className="w-5 h-5" style={{ color }} />;
      case 'box':
        return <Package className="w-5 h-5" style={{ color }} />;
      case 'wifi':
        return <Wifi className="w-5 h-5" style={{ color }} />;
      case 'analytics':
        return <BarChart3 className="w-5 h-5" style={{ color }} />;
      case 'users':
        return <Users className="w-5 h-5" style={{ color }} />;
      default:
        return null;
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full bg-white text-center"
      style={{
        backgroundColor: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* ========================================================================= */}
      {/* 1. HERO BANNER: EXACT 1:1 REPLICA OF THE REFERENCE SCREENSHOT              */}
      {/* ========================================================================= */}
      <div 
        className="relative w-full overflow-hidden text-center pt-8 sm:pt-12 lg:pt-14 pb-8 sm:pb-10"
        style={{
          background: 'radial-gradient(circle at 0% 100%, #ECE4F2 0%, rgba(246, 240, 251, 0.75) 30%, rgba(255, 255, 255, 0) 65%), radial-gradient(circle at 100% 0%, #ECE4F2 0%, rgba(246, 240, 251, 0.75) 30%, rgba(255, 255, 255, 0) 65%), #FFFFFF'
        }}
      >
        {/* LEFT WING: BOTTOM-LEFT ABSTRACT WAVES, ORBITAL RINGS & PURPLE ACCENT DOTS */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-[30vw] max-w-[380px] min-w-[160px] sm:min-w-[220px] pointer-events-none select-none overflow-hidden z-[1] opacity-50 sm:opacity-100 transition-opacity" 
          aria-hidden="true"
        >
          <svg 
            className="w-full h-full"
            viewBox="0 0 340 480"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMinYMax meet"
          >
            {/* Layered Bottom-Left Lavender Arcs (Concentric Waves) */}
            <circle 
              cx="0" 
              cy="480" 
              r="380" 
              fill="url(#blGrad1)" 
              stroke="#D8C7DD" 
              strokeWidth="1.15" 
            />
            <circle 
              cx="0" 
              cy="480" 
              r="250" 
              fill="url(#blGrad2)" 
              stroke="#CEBCCD" 
              strokeWidth="1.25" 
            />
            <circle 
              cx="0" 
              cy="480" 
              r="135" 
              fill="url(#blGrad3)" 
              stroke="#C4ADC2" 
              strokeWidth="1.25" 
            />

            {/* Orbital Paths (Left) - Gentle curves framing left cards */}
            <path 
              d="M 60 -10 C 145 100, 205 180, 205 240 C 205 300, 150 380, 80 490" 
              stroke="#CFBDCE" 
              strokeWidth="1.35" 
            />
            <path 
              d="M 10 -10 C 75 90, 125 180, 125 240 C 125 300, 85 390, 15 490" 
              stroke="#DCCCDC" 
              strokeWidth="1.2" 
            />
            <path 
              d="M -30 20 C 25 110, 65 190, 65 250 C 65 310, 35 390, -30 470" 
              stroke="#E6DAE6" 
              strokeWidth="1.1" 
            />

            {/* Purple Accent Dots (Solid Plum #714B67 Matching Reference) */}
            <circle cx="55" cy="105" r="4" fill="#714B67" />
            <circle cx="28" cy="175" r="3.5" fill="#714B67" />
            <circle cx="205" cy="240" r="4.5" fill="#714B67" />
            <circle cx="95" cy="295" r="4" fill="#714B67" />
            <circle cx="145" cy="385" r="3.5" fill="#714B67" />
            <circle cx="50" cy="445" r="3" fill="#714B67" />

            <defs>
              <radialGradient id="blGrad1" cx="0" cy="480" r="380" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ECE4F1" stopOpacity="0.8" />
                <stop offset="65%" stopColor="#F5EEF7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FAF6FB" stopOpacity="0.05" />
              </radialGradient>
              <radialGradient id="blGrad2" cx="0" cy="480" r="250" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E3D7EA" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#EFE5F3" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FAF6FB" stopOpacity="0.1" />
              </radialGradient>
              <radialGradient id="blGrad3" cx="0" cy="480" r="135" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#D9C7E2" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#E5D6ED" stopOpacity="0.65" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* RIGHT WING: TOP-RIGHT ABSTRACT WAVES, ORBITAL RINGS & PURPLE ACCENT DOTS */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-[30vw] max-w-[380px] min-w-[160px] sm:min-w-[220px] pointer-events-none select-none overflow-hidden z-[1] opacity-50 sm:opacity-100 transition-opacity" 
          aria-hidden="true"
        >
          <svg 
            className="w-full h-full"
            viewBox="0 0 340 480"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMaxYMin meet"
          >
            {/* Layered Top-Right Lavender Arcs (Concentric Waves) */}
            <circle 
              cx="340" 
              cy="0" 
              r="380" 
              fill="url(#trGrad1)" 
              stroke="#D8C7DD" 
              strokeWidth="1.15" 
            />
            <circle 
              cx="340" 
              cy="0" 
              r="250" 
              fill="url(#trGrad2)" 
              stroke="#CEBCCD" 
              strokeWidth="1.25" 
            />
            <circle 
              cx="340" 
              cy="0" 
              r="135" 
              fill="url(#trGrad3)" 
              stroke="#C4ADC2" 
              strokeWidth="1.25" 
            />

            {/* Orbital Paths (Right) - Gentle curves framing right cards */}
            <path 
              d="M 280 -10 C 195 100, 135 180, 135 240 C 135 300, 190 380, 260 490" 
              stroke="#CFBDCE" 
              strokeWidth="1.35" 
            />
            <path 
              d="M 330 -10 C 265 90, 215 180, 215 240 C 215 300, 255 390, 325 490" 
              stroke="#DCCCDC" 
              strokeWidth="1.2" 
            />
            <path 
              d="M 370 20 C 315 110, 275 190, 275 250 C 275 310, 305 390, 370 470" 
              stroke="#E6DAE6" 
              strokeWidth="1.1" 
            />

            {/* Purple Accent Dots (Solid Plum #714B67 Matching Reference) */}
            <circle cx="145" cy="90" r="4" fill="#714B67" />
            <circle cx="135" cy="240" r="4.5" fill="#714B67" />
            <circle cx="165" cy="305" r="4" fill="#714B67" />
            <circle cx="312" cy="190" r="3.5" fill="#714B67" />
            <circle cx="235" cy="390" r="3.5" fill="#714B67" />
            <circle cx="290" cy="445" r="3" fill="#714B67" />

            <defs>
              <radialGradient id="trGrad1" cx="340" cy="0" r="380" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ECE4F1" stopOpacity="0.8" />
                <stop offset="65%" stopColor="#F5EEF7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FAF6FB" stopOpacity="0.05" />
              </radialGradient>
              <radialGradient id="trGrad2" cx="340" cy="0" r="250" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E3D7EA" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#EFE5F3" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FAF6FB" stopOpacity="0.1" />
              </radialGradient>
              <radialGradient id="trGrad3" cx="340" cy="0" r="135" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#D9C7E2" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#E5D6ED" stopOpacity="0.65" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* HERO STAGE WITH FLOATING FEATURE CARDS ON LEFT & RIGHT */}
        <div className="relative w-full max-w-[1240px] mx-auto min-h-[350px] sm:min-h-[370px] lg:min-h-[390px] flex items-center justify-center px-4">
          
          {/* LEFT FLOATING CARDS */}
          {FLOATING_CARDS_LEFT.map((card) => (
            <motion.div
              key={card.id}
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              animate={
                prefersReduced
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      scale: 1,
                      y: [0, -5, 0],
                    }
              }
              transition={{
                opacity: { duration: 0.7, delay: 0.15 },
                scale: { duration: 0.7, delay: 0.15 },
                y: prefersReduced
                  ? undefined
                  : {
                      repeat: Infinity,
                      duration: card.floatDuration,
                      ease: "easeInOut",
                      delay: card.floatDelay,
                    },
              }}
              whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2 } }}
              onClick={() => handleAppClick({ id: card.id, name: card.title })}
              className="hidden lg:flex absolute items-center gap-2.5 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] border border-slate-100/90 hover:border-purple-200 hover:shadow-md transition-all duration-300 cursor-pointer z-20 group scale-[0.88] xl:scale-100"
              style={{
                top: card.top,
                left: card.left,
                transformOrigin: 'left center',
              }}
            >
              <div 
                className="w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: card.iconBg }}
              >
                {renderCardIcon(card.iconType, card.iconColor)}
              </div>
              <div className="text-left select-none pr-1">
                <div className="text-[12.5px] font-bold text-slate-800 tracking-tight leading-snug group-hover:text-[#714B67] transition-colors whitespace-nowrap">
                  {card.title}
                </div>
                <div className="text-[10px] font-medium text-slate-400 leading-snug whitespace-nowrap">
                  {card.subtitle}
                </div>
              </div>
            </motion.div>
          ))}

          {/* RIGHT FLOATING CARDS */}
          {FLOATING_CARDS_RIGHT.map((card) => (
            <motion.div
              key={card.id}
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              animate={
                prefersReduced
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      scale: 1,
                      y: [0, 5, 0],
                    }
              }
              transition={{
                opacity: { duration: 0.7, delay: 0.2 },
                scale: { duration: 0.7, delay: 0.2 },
                y: prefersReduced
                  ? undefined
                  : {
                      repeat: Infinity,
                      duration: card.floatDuration,
                      ease: "easeInOut",
                      delay: card.floatDelay,
                    },
              }}
              whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2 } }}
              onClick={() => handleAppClick({ id: card.id, name: card.title })}
              className="hidden lg:flex absolute items-center gap-2.5 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] border border-slate-100/90 hover:border-emerald-200 hover:shadow-md transition-all duration-300 cursor-pointer z-20 group scale-[0.88] xl:scale-100"
              style={{
                top: card.top,
                right: card.right,
                transformOrigin: 'right center',
              }}
            >
              <div 
                className="w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: card.iconBg }}
              >
                {renderCardIcon(card.iconType, card.iconColor)}
              </div>
              <div className="text-left select-none pr-1">
                <div className="text-[12.5px] font-bold text-slate-800 tracking-tight leading-snug group-hover:text-[#714B67] transition-colors whitespace-nowrap">
                  {card.title}
                </div>
                <div className="text-[10px] font-medium text-slate-400 leading-snug whitespace-nowrap">
                  {card.subtitle}
                </div>
              </div>
            </motion.div>
          ))}

          {/* CENTERED HERO HEADLINE, SUBTITLE & ACTION BUTTONS */}
          <div className="relative z-10 w-full max-w-2xl lg:max-w-[680px] mx-auto px-4 flex flex-col items-center">

            {/* Headline: Clean 2-Line Heading (Matching Reference Screenshot) */}
            <motion.h1
              initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: SMOOTH_SLOW_EASING }}
              className="text-center font-extrabold tracking-tight select-none w-full"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="block text-slate-900 text-[23px] sm:text-[34px] md:text-[40px] lg:text-[44px] leading-[1.15] sm:whitespace-nowrap">
                {title || "All your enterprise software"}
              </span>
              <span 
                className="block text-[23px] sm:text-[34px] md:text-[40px] lg:text-[44px] leading-[1.15] mt-1 font-extrabold"
                style={{ color: '#714B67' }}
              >
                {highlightText || "on one platform."}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.div
              initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: SMOOTH_SLOW_EASING }}
              className="px-2 mt-3 sm:mt-3.5 mb-4 sm:mb-5 w-full max-w-xl mx-auto text-center"
            >
              <p 
                className="text-xs sm:text-[13px] md:text-[14px] text-slate-500 leading-relaxed font-normal"
                style={{ color: '#64748B' }}
              >
                {subtitle}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: SMOOTH_SLOW_EASING }}
              className="relative flex flex-col items-center justify-center z-20 w-full"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 w-full max-w-sm sm:max-w-none mx-auto">
                
                {/* Primary Button: Odoo Plum #714B67 */}
                {ctaLabel && (
                  <a
                    href={ctaHref}
                    onClick={onCtaClick}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-7 sm:py-2.5 text-[14px] sm:text-[14.5px] font-bold text-white rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:bg-[#5E3E55] active:scale-[0.98] select-none text-center w-full sm:w-auto"
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
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-7 sm:py-2.5 text-[14px] sm:text-[14.5px] font-semibold rounded-xl transition-all duration-200 cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] select-none text-center w-full sm:w-auto shadow-2xs"
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

        </div>

        {/* ENTERPRISE GRADE TECH LOGOS (FULL SCREEN WIDTH) */}
        {showMarquee && (
          <motion.div
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: SMOOTH_SLOW_EASING }}
            className="relative z-20 w-full max-w-full overflow-hidden mt-4 sm:mt-5 mb-1 px-0"
          >
            <MarqueeDemo title="Enterprise Grade • Built With Resilient Technologies" />
          </motion.div>
        )}

        {/* PROPRIETARY PRODUCT SUITE BADGE (MATCHING EXACT REFERENCE BOTTOM ANCHOR) */}
        <div className="relative z-20 flex items-center justify-center mt-3 sm:mt-4">
          <span 
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-2xs select-none"
            style={{
              backgroundColor: '#FAF5F9',
              color: '#714B67',
              border: '1px solid #E8DAE4'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#714B67]" />
            Proprietary Product Suite
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FULL-WIDTH PROPRIETARY SOFTWARE ECOSYSTEM SHOWCASE SECTION            */}
      {/* ========================================================================= */}
      <motion.div
        initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.0, delay: 0.15, ease: SMOOTH_SLOW_EASING }}
        className="w-full bg-[#FAFAFC]/60 pt-8 sm:pt-10 pb-16 sm:pb-20 relative overflow-hidden"
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
          
          {/* Centered Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
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
    </section>
  )
}

export default Hero
