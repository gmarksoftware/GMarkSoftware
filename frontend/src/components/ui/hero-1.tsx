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
    top: '12%',
    left: 'clamp(0.75rem, 3.2vw, 3.5rem)',
    iconBg: '#FEF2F2',
    iconColor: '#EF3A3E',
    iconType: 'chart',
    floatDelay: 0,
    floatDuration: 5.2,
    rotate: 0,
  },
  {
    id: 'cmms',
    title: 'Industrial Maintenance',
    subtitle: 'Asset Management',
    top: '41%',
    left: 'clamp(0.5rem, 2vw, 2rem)',
    iconBg: '#FEF2F2',
    iconColor: '#EF3A3E',
    iconType: 'gear',
    floatDelay: 0.6,
    floatDuration: 5.8,
    rotate: 0,
  },
  {
    id: 'logistics',
    title: 'Field Logistics',
    subtitle: 'Track & Manage',
    top: '70%',
    left: 'clamp(1rem, 3.8vw, 4rem)',
    iconBg: '#FEF2F2',
    iconColor: '#EF3A3E',
    iconType: 'box',
    floatDelay: 1.2,
    floatDuration: 5.0,
    rotate: 0,
  },
];

const FLOATING_CARDS_RIGHT = [
  {
    id: 'telemetry',
    title: 'IoT Telemetry',
    subtitle: 'Live Monitoring',
    top: '12%',
    right: 'clamp(0.75rem, 3.2vw, 3.5rem)',
    iconBg: '#E8F8F0',
    iconColor: '#10B981',
    iconType: 'wifi',
    floatDelay: 0.3,
    floatDuration: 5.4,
    rotate: 0,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    subtitle: 'Data Insights',
    top: '41%',
    right: 'clamp(0.5rem, 2vw, 2rem)',
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    iconType: 'analytics',
    floatDelay: 0.9,
    floatDuration: 6.0,
    rotate: 0,
  },
  {
    id: 'operations',
    title: 'Operations',
    subtitle: 'Unified Platform',
    top: '70%',
    right: 'clamp(1rem, 3.8vw, 4rem)',
    iconBg: '#E8F8F0',
    iconColor: '#10B981',
    iconType: 'users',
    floatDelay: 1.5,
    floatDuration: 5.5,
    rotate: 0,
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
  title = "All your enterprise",
  highlightText = "software on one platform.",
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
  title?: React.ReactNode
  highlightText?: React.ReactNode
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
          <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ color }} viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="12" width="4" height="9" rx="1.5" />
            <rect x="10" y="7" width="4" height="14" rx="1.5" />
            <rect x="17" y="3" width="4" height="18" rx="1.5" />
          </svg>
        );
      case 'gear':
        return <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ color }} />;
      case 'box':
        return <Package className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ color }} />;
      case 'wifi':
        return <Wifi className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ color }} />;
      case 'analytics':
        return <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ color }} />;
      case 'users':
        return <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ color }} />;
      default:
        return null;
    }
  };

  const renderActionButtons = (isMobile: boolean = false) => (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center gap-2.5 sm:gap-3.5 w-full ${isMobile ? 'max-w-sm' : 'max-w-none'} mx-auto`}>
      {/* Primary Button: Coral Pink #FC787D */}
      {ctaLabel && (
        <a
          href={ctaHref}
          onClick={onCtaClick}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-7 sm:py-2.5 text-[14px] sm:text-[14.5px] font-bold text-white rounded-md transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-[#FC787D]/20 hover:bg-[#e66368] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] select-none text-center w-full sm:w-auto"
          style={{
            backgroundColor: '#FC787D',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-4 h-4 ml-0.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      )}

      {/* Secondary Button */}
      {secondaryCtaLabel && (
        <button
          type="button"
          onClick={onSecondaryCtaClick || onCtaClick}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-7 sm:py-2.5 text-[14px] sm:text-[14.5px] font-semibold rounded-md transition-all duration-200 cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] select-none text-center w-full sm:w-auto shadow-2xs"
          style={{
            color: '#FC787D',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          <span>{secondaryCtaLabel}</span>
        </button>
      )}
    </div>
  );

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
      {/* Scoped CSS animations for hero background layers */}
      <style>{`
        /* Layer 1: Ambient Drifting Lavender Gradient */
        .hero-bg-gradient-layer {
          will-change: transform, opacity;
          animation: heroBgGradientDrift 30s ease-in-out infinite alternate;
        }
        @keyframes heroBgGradientDrift {
          0% {
            transform: scale(1) translate3d(0, 0, 0);
            opacity: 0.92;
          }
          50% {
            transform: scale(1.03) translate3d(8px, -6px, 0);
            opacity: 1;
          }
          100% {
            transform: scale(0.98) translate3d(-6px, 5px, 0);
            opacity: 0.94;
          }
        }

        /* Layer 2: Concentric Circular Waves */
        .hero-waves-left {
          transform-box: view-box;
          transform-origin: 0px 0px;
          will-change: transform;
          animation: heroWavesLeftDrift 32s ease-in-out infinite alternate;
        }
        @keyframes heroWavesLeftDrift {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(8px, -10px, 0) scale(1.025);
          }
          100% {
            transform: translate3d(-6px, 6px, 0) scale(0.985);
          }
        }

        .hero-waves-right {
          transform-box: view-box;
          transform-origin: 340px 0px;
          will-change: transform;
          animation: heroWavesRightDrift 36s ease-in-out infinite alternate;
        }
        @keyframes heroWavesRightDrift {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-10px, 8px, 0) scale(1.025);
          }
          100% {
            transform: translate3d(6px, -6px, 0) scale(0.985);
          }
        }

        /* Layer 3: Orbital Curves */
        .hero-orbital-l1 {
          transform-box: view-box;
          transform-origin: 0px 240px;
          will-change: transform;
          animation: heroOrbitalL1 26s ease-in-out infinite alternate;
        }
        @keyframes heroOrbitalL1 {
          0% {
            transform: rotate(0deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotate(1.6deg) translate3d(5px, -3px, 0);
          }
          100% {
            transform: rotate(-1.4deg) translate3d(-4px, 4px, 0);
          }
        }

        .hero-orbital-l2 {
          transform-box: view-box;
          transform-origin: 0px 240px;
          will-change: transform;
          animation: heroOrbitalL2 34s ease-in-out infinite alternate;
        }
        @keyframes heroOrbitalL2 {
          0% {
            transform: rotate(0deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotate(-1.8deg) translate3d(-5px, 6px, 0);
          }
          100% {
            transform: rotate(1.2deg) translate3d(4px, -5px, 0);
          }
        }

        .hero-orbital-l3 {
          transform-box: view-box;
          transform-origin: 0px 240px;
          will-change: transform;
          animation: heroOrbitalL3 22s ease-in-out infinite alternate;
        }
        @keyframes heroOrbitalL3 {
          0% {
            transform: rotate(0deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotate(1.2deg) translate3d(4px, -4px, 0);
          }
          100% {
            transform: rotate(-0.8deg) translate3d(-3px, 3px, 0);
          }
        }

        .hero-orbital-r1 {
          transform-box: view-box;
          transform-origin: 340px 240px;
          will-change: transform;
          animation: heroOrbitalR1 28s ease-in-out infinite alternate;
        }
        @keyframes heroOrbitalR1 {
          0% {
            transform: rotate(0deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotate(-1.6deg) translate3d(-5px, -4px, 0);
          }
          100% {
            transform: rotate(1.4deg) translate3d(4px, 5px, 0);
          }
        }

        .hero-orbital-r2 {
          transform-box: view-box;
          transform-origin: 340px 240px;
          will-change: transform;
          animation: heroOrbitalR2 38s ease-in-out infinite alternate;
        }
        @keyframes heroOrbitalR2 {
          0% {
            transform: rotate(0deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotate(1.7deg) translate3d(5px, 6px, 0);
          }
          100% {
            transform: rotate(-1.3deg) translate3d(-4px, -5px, 0);
          }
        }

        .hero-orbital-r3 {
          transform-box: view-box;
          transform-origin: 340px 240px;
          will-change: transform;
          animation: heroOrbitalR3 24s ease-in-out infinite alternate;
        }
        @keyframes heroOrbitalR3 {
          0% {
            transform: rotate(0deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotate(-1.1deg) translate3d(-4px, -5px, 0);
          }
          100% {
            transform: rotate(0.9deg) translate3d(3px, 4px, 0);
          }
        }

        /* Dynamic Mobile Web Background Motion (< lg / max-width: 1023px) */
        @media (max-width: 1023px) {
          .hero-bg-gradient-layer {
            animation: heroMobileGradientFlow 12s ease-in-out infinite alternate !important;
          }
          .hero-waves-left {
            transform-origin: 0px 0px;
            animation: heroMobileWavesLeft 9s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate !important;
          }
          .hero-waves-right {
            transform-origin: 340px 0px;
            animation: heroMobileWavesRight 10s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate !important;
          }
          .hero-orbital-l1 {
            transform-origin: 40px 200px;
            animation: heroMobileOrbitalL1 7.5s ease-in-out infinite alternate !important;
          }
          .hero-orbital-r1 {
            transform-origin: 300px 200px;
            animation: heroMobileOrbitalR1 8s ease-in-out infinite alternate !important;
          }
          .hero-orbital-l2 {
            transform-origin: 0px 240px;
            animation: heroMobileOrbitalL2 11s ease-in-out infinite alternate !important;
          }
          .hero-orbital-r2 {
            transform-origin: 340px 240px;
            animation: heroMobileOrbitalR2 11.5s ease-in-out infinite alternate !important;
          }
          .hero-orbital-l3 {
            transform-origin: 0px 240px;
            animation: heroMobileOrbitalL3 13s ease-in-out infinite alternate !important;
          }
          .hero-orbital-r3 {
            transform-origin: 340px 240px;
            animation: heroMobileOrbitalR3 13.5s ease-in-out infinite alternate !important;
          }
        }

        @keyframes heroMobileGradientFlow {
          0% {
            transform: scale(1) translate3d(0, 0, 0);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.08) translate3d(6px, 12px, 0);
            opacity: 1;
          }
          100% {
            transform: scale(0.96) translate3d(-6px, -8px, 0);
            opacity: 0.88;
          }
        }

        @keyframes heroMobileWavesLeft {
          0% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
          50% {
            transform: translate3d(12px, -15px, 0) scale(1.05) rotate(1.5deg);
          }
          100% {
            transform: translate3d(-8px, 10px, 0) scale(0.96) rotate(-1.2deg);
          }
        }

        @keyframes heroMobileWavesRight {
          0% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
          50% {
            transform: translate3d(-14px, 12px, 0) scale(1.06) rotate(-1.6deg);
          }
          100% {
            transform: translate3d(10px, -12px, 0) scale(0.97) rotate(1.2deg);
          }
        }

        @keyframes heroMobileOrbitalL1 {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(14px, -18px, 0) rotate(3deg);
          }
          100% {
            transform: translate3d(-10px, 10px, 0) rotate(-2.5deg);
          }
        }

        @keyframes heroMobileOrbitalR1 {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(-15px, 15px, 0) rotate(-3.2deg);
          }
          100% {
            transform: translate3d(10px, -14px, 0) rotate(2.4deg);
          }
        }

        @keyframes heroMobileOrbitalL2 {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(8px, -12px, 0) rotate(1.8deg);
          }
          100% {
            transform: translate3d(-8px, 10px, 0) rotate(-1.6deg);
          }
        }

        @keyframes heroMobileOrbitalR2 {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(-10px, 10px, 0) rotate(-2deg);
          }
          100% {
            transform: translate3d(8px, -8px, 0) rotate(1.5deg);
          }
        }

        @keyframes heroMobileOrbitalL3 {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(6px, -8px, 0) rotate(1.2deg);
          }
          100% {
            transform: translate3d(-6px, 8px, 0) rotate(-1deg);
          }
        }

        @keyframes heroMobileOrbitalR3 {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(-8px, 8px, 0) rotate(-1.4deg);
          }
          100% {
            transform: translate3d(6px, -6px, 0) rotate(1.1deg);
          }
        }

        /* Accessibility: prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .hero-bg-gradient-layer,
          .hero-waves-left,
          .hero-waves-right,
          .hero-orbital-l1,
          .hero-orbital-l2,
          .hero-orbital-l3,
          .hero-orbital-r1,
          .hero-orbital-r2,
          .hero-orbital-r3 {
            animation: none !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>

      <div
        className="relative w-full overflow-hidden text-center pt-14 sm:pt-16 lg:pt-20 pb-2 sm:pb-4 lg:pb-6 bg-gradient-to-b from-[#FEF2F2] via-[#FFF1F1] to-white min-h-[100svh] lg:min-h-screen flex flex-col justify-between"
        style={{
          background: 'linear-gradient(to bottom, #FEF2F2 0%, #FEF5F5 25%, #FFF8F8 50%, #FFFAFA 70%, #FFFDFD 85%, #FFFFFF 95%, #FFFFFF 100%)'
        }}
      >
        {/* LAYER 1: AMBIENT DRIFTING LAVENDER GRADIENT (EXTENDED JUST BELOW TECH LOGOS) */}
        <div
          className="hero-bg-gradient-layer absolute inset-0 pointer-events-none select-none z-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(254, 226, 226, 0.45) 0%, rgba(254, 242, 242, 0.3) 50%, rgba(255, 250, 250, 0.15) 80%, transparent 92%), radial-gradient(ellipse 85% 60% at 50% 0%, rgba(239, 58, 62, 0.12) 0%, transparent 85%)',
            maskImage: 'linear-gradient(to bottom, black 0%, black 75%, transparent 92%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 75%, transparent 92%)',
          }}
          aria-hidden="true"
        />

        {/* LEFT WING: TOP-LEFT ABSTRACT WAVES, ORBITAL RINGS & RED ACCENT DOTS */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[45vw] sm:w-[35vw] lg:w-[30vw] max-w-[380px] min-w-[180px] sm:min-w-[220px] pointer-events-none select-none overflow-hidden z-[1] opacity-80 sm:opacity-90 lg:opacity-100 transition-opacity"
          style={{
            maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 90%)',
          }}
          aria-hidden="true"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 340 480"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMinYMin meet"
          >
            {/* Layer 2: Layered Top-Left Lavender Arcs (Concentric Waves) */}
            <g className="hero-waves-left">
              <circle
                cx="0"
                cy="0"
                r="380"
                fill="url(#blGrad1)"
                stroke="rgba(239, 58, 62, 0.18)"
                strokeWidth="1.15"
              />
              <circle
                cx="0"
                cy="0"
                r="250"
                fill="url(#blGrad2)"
                stroke="rgba(239, 58, 62, 0.18)"
                strokeWidth="1.25"
              />
              <circle
                cx="0"
                cy="0"
                r="135"
                fill="url(#blGrad3)"
                stroke="rgba(239, 58, 62, 0.20)"
                strokeWidth="1.25"
              />
            </g>

            {/* Layer 3: Orbital Paths (Left) - Gentle curves framing left cards */}
            {/* Layer 3 & 4: Orbital Paths and Curve-Aligned Center Dots (Left) */}
            <g className="hero-orbital-l1">
              <path
                d="M 60 -10 C 145 100, 205 180, 205 240 C 205 300, 150 380, 80 490"
                stroke="rgba(239, 58, 62, 0.22)"
                strokeWidth="1.25"
              />
              {/* Clean solid center dots locked precisely onto the curve */}
              <circle cx="135.0" cy="90.0" r="3.2" fill="#EF3A3E" />
              <circle cx="184.3" cy="168.8" r="3.2" fill="#EF3A3E" />
              <circle cx="205.0" cy="240.0" r="3.2" fill="#EF3A3E" />
              <circle cx="186.9" cy="310.0" r="3.2" fill="#EF3A3E" />
              <circle cx="146.4" cy="385.0" r="3.2" fill="#EF3A3E" />
              <circle cx="102.4" cy="455.0" r="2.8" fill="#EF3A3E" opacity="0.7" />
            </g>
            <path
              className="hero-orbital-l2"
              d="M 10 -10 C 75 90, 125 180, 125 240 C 125 300, 85 390, 15 490"
              stroke="rgba(239, 58, 62, 0.16)"
              strokeWidth="1.15"
            />
            <path
              className="hero-orbital-l3"
              d="M -30 20 C 25 110, 65 190, 65 250 C 65 310, 35 390, -30 470"
              stroke="rgba(239, 58, 62, 0.12)"
              strokeWidth="1.0"
            />

            <defs>
              <radialGradient id="blGrad1" cx="0" cy="0" r="380" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FEE2E2" stopOpacity="0.3" />
                <stop offset="65%" stopColor="#FEF2F2" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#FFF5F5" stopOpacity="0.0" />
              </radialGradient>
              <radialGradient id="blGrad2" cx="0" cy="0" r="250" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FECACA" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#FEE2E2" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FFF5F5" stopOpacity="0.0" />
              </radialGradient>
              <radialGradient id="blGrad3" cx="0" cy="0" r="135" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FCA5A5" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#FEE2E2" stopOpacity="0.15" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* RIGHT WING: TOP-RIGHT ABSTRACT WAVES, ORBITAL RINGS & RED ACCENT DOTS */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[45vw] sm:w-[35vw] lg:w-[30vw] max-w-[380px] min-w-[180px] sm:min-w-[220px] pointer-events-none select-none overflow-hidden z-[1] opacity-80 sm:opacity-90 lg:opacity-100 transition-opacity"
          style={{
            maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 90%)',
          }}
          aria-hidden="true"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 340 480"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMaxYMin meet"
          >
            {/* Layer 2: Layered Top-Right Lavender Arcs (Concentric Waves) */}
            <g className="hero-waves-right">
              <circle
                cx="340"
                cy="0"
                r="380"
                fill="url(#trGrad1)"
                stroke="rgba(239, 58, 62, 0.18)"
                strokeWidth="1.15"
              />
              <circle
                cx="340"
                cy="0"
                r="250"
                fill="url(#trGrad2)"
                stroke="rgba(239, 58, 62, 0.18)"
                strokeWidth="1.25"
              />
              <circle
                cx="340"
                cy="0"
                r="135"
                fill="url(#trGrad3)"
                stroke="rgba(239, 58, 62, 0.20)"
                strokeWidth="1.25"
              />
            </g>

            {/* Layer 3: Orbital Paths (Right) - Curved network lines passing beside cards */}
            {/* Layer 3 & 4: Orbital Paths and Curve-Aligned Center Dots (Right) */}
            <g className="hero-orbital-r1">
              <path
                d="M 280 -10 C 195 100, 135 180, 135 240 C 135 300, 190 380, 260 490"
                stroke="rgba(239, 58, 62, 0.22)"
                strokeWidth="1.25"
              />
              {/* Clean solid center dots locked precisely onto the curve */}
              <circle cx="205.0" cy="90.0" r="3.2" fill="#EF3A3E" />
              <circle cx="155.7" cy="168.8" r="3.2" fill="#EF3A3E" />
              <circle cx="135.0" cy="240.0" r="3.2" fill="#EF3A3E" />
              <circle cx="153.1" cy="310.0" r="3.2" fill="#EF3A3E" />
              <circle cx="193.6" cy="385.0" r="3.2" fill="#EF3A3E" />
              <circle cx="237.6" cy="455.0" r="2.8" fill="#EF3A3E" opacity="0.7" />
            </g>
            <path
              className="hero-orbital-r2"
              d="M 330 -10 C 265 90, 215 180, 215 240 C 215 300, 255 390, 325 490"
              stroke="rgba(239, 58, 62, 0.16)"
              strokeWidth="1.15"
            />
            <path
              className="hero-orbital-r3"
              d="M 370 20 C 315 110, 275 190, 275 250 C 275 310, 305 390, 370 470"
              stroke="rgba(239, 58, 62, 0.12)"
              strokeWidth="1.0"
            />

            <defs>
              <radialGradient id="trGrad1" cx="340" cy="0" r="380" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FEE2E2" stopOpacity="0.3" />
                <stop offset="65%" stopColor="#FEF2F2" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#FFF5F5" stopOpacity="0.0" />
              </radialGradient>
              <radialGradient id="trGrad2" cx="340" cy="0" r="250" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FECACA" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#FEE2E2" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FFF5F5" stopOpacity="0.0" />
              </radialGradient>
              <radialGradient id="trGrad3" cx="340" cy="0" r="135" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FCA5A5" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#FEE2E2" stopOpacity="0.15" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* HERO STAGE WITH FLOATING FEATURE CARDS ON LEFT & RIGHT */}
        <div className="relative w-full max-w-[1240px] xl:max-w-[1360px] 2xl:max-w-[1460px] mx-auto flex-1 flex flex-col items-center justify-center px-2 sm:px-4">

          {/* LEFT FLOATING CARDS */}
          {FLOATING_CARDS_LEFT.map((card) => (
            <div
              key={card.id}
              className="hidden lg:inline-flex w-fit absolute z-20 scale-[0.80] xl:scale-[0.88] 2xl:scale-[0.96]"
              style={{
                top: card.top,
                left: card.left,
                transformOrigin: 'left center',
              }}
            >
              <motion.div
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.94 }}
                animate={
                  prefersReduced
                    ? { opacity: 1 }
                    : {
                      opacity: 1,
                      scale: 1,
                      y: [0, -7, 0],
                    }
                }
                whileHover={
                  prefersReduced
                    ? undefined
                    : {
                      y: -4,
                      scale: 1.03,
                      boxShadow: "0 20px 30px -10px rgba(239, 58, 62, 0.16)",
                      transition: { duration: 0.25, ease: "easeOut" },
                    }
                }
                transition={{
                  opacity: { duration: 0.8, delay: 0.15 },
                  scale: { duration: 0.8, delay: 0.15 },
                  y: prefersReduced
                    ? undefined
                    : {
                      repeat: Infinity,
                      duration: card.floatDuration,
                      ease: "easeInOut",
                      delay: card.floatDelay,
                    },
                }}
                className="group inline-flex w-fit items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-100 hover:border-[#EF3A3E]/35 hover:bg-white transition-colors duration-300 pointer-events-auto cursor-pointer select-none"
              >
                <div
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: card.iconBg }}
                >
                  {renderCardIcon(card.iconType, card.iconColor)}
                </div>
                <div className="text-left select-none whitespace-nowrap">
                  <div className="text-[12px] sm:text-[12.5px] font-bold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                    {card.title}
                  </div>
                  <div className="text-[9.5px] sm:text-[10px] font-medium text-slate-400 leading-tight whitespace-nowrap mt-0.5">
                    {card.subtitle}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}

          {/* RIGHT FLOATING CARDS */}
          {FLOATING_CARDS_RIGHT.map((card) => (
            <div
              key={card.id}
              className="hidden lg:inline-flex w-fit absolute z-20 scale-[0.80] xl:scale-[0.88] 2xl:scale-[0.96]"
              style={{
                top: card.top,
                right: card.right,
                transformOrigin: 'right center',
              }}
            >
              <motion.div
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.94 }}
                animate={
                  prefersReduced
                    ? { opacity: 1 }
                    : {
                      opacity: 1,
                      scale: 1,
                      y: [0, 7, 0],
                    }
                }
                whileHover={
                  prefersReduced
                    ? undefined
                    : {
                      y: -4,
                      scale: 1.03,
                      boxShadow: "0 20px 30px -10px rgba(239, 58, 62, 0.16)",
                      transition: { duration: 0.25, ease: "easeOut" },
                    }
                }
                transition={{
                  opacity: { duration: 0.8, delay: 0.2 },
                  scale: { duration: 0.8, delay: 0.2 },
                  y: prefersReduced
                    ? undefined
                    : {
                      repeat: Infinity,
                      duration: card.floatDuration,
                      ease: "easeInOut",
                      delay: card.floatDelay,
                    },
                }}
                className="group inline-flex w-fit items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-100 hover:border-[#EF3A3E]/35 hover:bg-white transition-colors duration-300 pointer-events-auto cursor-pointer select-none"
              >
                <div
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: card.iconBg }}
                >
                  {renderCardIcon(card.iconType, card.iconColor)}
                </div>
                <div className="text-left select-none whitespace-nowrap">
                  <div className="text-[12px] sm:text-[12.5px] font-bold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                    {card.title}
                  </div>
                  <div className="text-[9.5px] sm:text-[10px] font-medium text-slate-400 leading-tight whitespace-nowrap mt-0.5">
                    {card.subtitle}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}

          {/* CENTERED HERO HEADLINE, SUBTITLE & ACTION BUTTONS */}
          <div className="relative z-10 w-full max-w-2xl lg:max-w-[760px] xl:max-w-[860px] 2xl:max-w-[940px] mx-auto px-3 sm:px-4 flex flex-col items-center justify-center my-auto pt-1 pb-2 sm:py-2">

            {/* Headline: Clean 2-Line Heading matching Reference Image 1 */}
            <h1
              className="text-center font-extrabold tracking-tight select-none w-full"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="block text-slate-900 text-[32px] xs:text-[36px] sm:text-[40px] md:text-[44px] lg:text-[48px] xl:text-[54px] 2xl:text-[60px] leading-[1.12]">
                {title || "All your enterprise"}
              </span>
              <span
                className="block text-[32px] xs:text-[36px] sm:text-[40px] md:text-[44px] lg:text-[48px] xl:text-[54px] 2xl:text-[60px] leading-[1.12] mt-1.5 sm:mt-2 font-extrabold"
                style={{ color: '#FC787D' }}
              >
                {(highlightText || "software on one platform.").trim()}
              </span>
            </h1>

            {/* Subtitle: 3-line balanced layout without hyphenation break */}
            <div className="px-2 mt-3.5 sm:mt-4 mb-0 w-full max-w-[340px] xs:max-w-md sm:max-w-xl lg:max-w-[660px] xl:max-w-[670px] mx-auto text-center">
              <p
                className="text-[14px] xs:text-[14.5px] sm:text-[15px] lg:text-[15.5px] text-slate-600 leading-relaxed font-normal"
                style={{ color: '#64748B' }}
              >
                {subtitle}
              </p>
            </div>

            {/* ACTION BUTTONS: Desktop (lg+) horizontal, Mobile (<lg) stacked with perfectly managed gaps */}
            <div className="hidden lg:flex flex-row items-center justify-center z-20 w-full mt-6 sm:mt-7 mb-0">
              {renderActionButtons(false)}
            </div>
            <div className="lg:hidden flex flex-col items-center justify-center z-20 w-full max-w-sm mx-auto px-2 mt-6 xs:mt-7 sm:mt-8 mb-2">
              {renderActionButtons(true)}
            </div>

          </div>

        </div>

        {/* MOBILE ACTION BUTTONS: Positioned down at the red line, just over the technologies marquee */}
        

        {/* ENTERPRISE GRADE TECH LOGOS (FULL SCREEN WIDTH) */}
        {showMarquee && (
          <motion.div
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: SMOOTH_SLOW_EASING }}
            className="relative z-20 w-full max-w-full overflow-hidden pt-1 pb-4 sm:pb-6 lg:pb-8 px-0"
          >
            <MarqueeDemo title="Enterprise Grade • Built With Resilient Technologies" />
          </motion.div>
        )}

        {/* BOTTOM SEAMLESS BLEND: Ultra-soft feathered gradient that seamlessly blends hero banner into the white section below */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 pointer-events-none z-[3] select-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 35%, rgba(255, 255, 255, 0.85) 70%, #FFFFFF 100%)'
          }}
          aria-hidden="true"
        />
      </div>
    </section>
  )
}

export { HERO_APPS } from '@/components/SoftwareProductsSection';
export default Hero;
