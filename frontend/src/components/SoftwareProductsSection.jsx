import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getAssetUrl } from '@/utils/asset';

const SMOOTH_SLOW_EASING = [0.16, 1, 0.3, 1];

export const HERO_APPS = [
  {
    id: 'erp',
    name: 'Opstream ERP',
    subtitle: 'Enterprise resource planning & finance core.',
    image: getAssetUrl('/ERP Logo.png'),
    brandColor: '#0F766E',
    waveLight: 'rgba(15, 118, 110, 0.08)',
    waveDark: 'rgba(15, 118, 110, 0.16)'
  },
  {
    id: 'cmms',
    name: '4M Smart CMMS',
    subtitle: 'Industrial maintenance & asset operations.',
    image: getAssetUrl('/4m-clean.png'),
    brandColor: '#059669',
    waveLight: 'rgba(5, 150, 105, 0.08)',
    waveDark: 'rgba(5, 150, 105, 0.16)'
  },
  {
    id: 'g-nova-iot',
    name: 'G-Nova IoT',
    subtitle: 'Edge telemetry & smart sensor cockpit.',
    image: getAssetUrl('/g-nova-clean.png'),
    brandColor: '#3B82F6',
    waveLight: 'rgba(59, 130, 246, 0.08)',
    waveDark: 'rgba(59, 130, 246, 0.16)'
  },
  {
    id: 'g-track',
    name: 'G Track',
    subtitle: 'Real-time GPS tracking & field workforce.',
    image: getAssetUrl('/G Track logo.png'),
    brandColor: '#16A34A',
    waveLight: 'rgba(22, 163, 74, 0.08)',
    waveDark: 'rgba(22, 163, 74, 0.16)'
  },
  {
    id: 'gram-unnati',
    name: 'GramUnnati',
    subtitle: 'Agricultural e-commerce & rural empowerment.',
    image: getAssetUrl('/gramunnati-clean.png'),
    brandColor: '#15803D',
    waveLight: 'rgba(21, 128, 61, 0.08)',
    waveDark: 'rgba(21, 128, 61, 0.16)'
  },
  {
    id: 'task-management',
    name: 'SynkroBoard',
    subtitle: 'Task management & agile team collaboration.',
    image: getAssetUrl('/SynkroBoard.png'),
    brandColor: '#F59E0B',
    waveLight: 'rgba(245, 158, 11, 0.05)',
    waveDark: 'rgba(245, 158, 11, 0.10)'
  },
  {
    id: 'transporter-app',
    name: 'GShip Fleet',
    subtitle: 'Transport & fleet management platform.',
    image: getAssetUrl('/transporter-clean.png'),
    brandColor: '#0284C7',
    waveLight: 'rgba(2, 132, 199, 0.08)',
    waveDark: 'rgba(2, 132, 199, 0.16)'
  },
  {
    id: 'shg-app',
    name: 'GKart SHG',
    subtitle: 'Rural self-help group delivery network.',
    image: getAssetUrl('/shg-clean.png'),
    brandColor: '#10B981',
    waveLight: 'rgba(16, 185, 129, 0.08)',
    waveDark: 'rgba(16, 185, 129, 0.16)'
  }
];

export default function SoftwareProductsSection({ onSelectApp }) {
  const prefersReduced = useReducedMotion();
  const [activeAppId, setActiveAppId] = useState(null);

  const handleAppClick = (app) => {
    if (onSelectApp) {
      onSelectApp(app);
      return;
    }
    const section = document.getElementById('value-proposition-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#FAF8FC]/40 py-12 sm:py-16 relative overflow-hidden">
      {/* Subtle ambient radial background glow */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(252, 120, 125, 0.06) 0%, rgba(255, 255, 255, 0) 75%)'
        }}
        aria-hidden="true"
      />

      {/* Decorative framing curves & node dots on left and right sides */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none -z-10" 
        viewBox="0 0 1440 600" 
        fill="none" 
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* Left Side Curved Lines */}
        <path 
          d="M -40 50 C 130 90, 160 260, 40 420" 
          stroke="rgba(252, 120, 125, 0.28)" 
          strokeWidth="1.2" 
          fill="none" 
        />
        <path 
          d="M -10 10 C 200 60, 230 280, 80 460" 
          stroke="rgba(252, 120, 125, 0.20)" 
          strokeWidth="1.2" 
          fill="none" 
        />
        {/* Left Side Pink Dots */}
        <circle cx="58" cy="170" r="3.5" fill="#FC787D" />
        <circle cx="98" cy="290" r="3.5" fill="#FC787D" />

        {/* Right Side Curved Lines */}
        <path 
          d="M 1480 50 C 1310 90, 1280 260, 1400 420" 
          stroke="rgba(252, 120, 125, 0.28)" 
          strokeWidth="1.2" 
          fill="none" 
        />
        <path 
          d="M 1450 10 C 1240 60, 1210 280, 1360 460" 
          stroke="rgba(252, 120, 125, 0.20)" 
          strokeWidth="1.2" 
          fill="none" 
        />
        {/* Right Side Pink Dots */}
        <circle cx="1378" cy="150" r="3.5" fill="#FC787D" />
        <circle cx="1342" cy="300" r="3.5" fill="#FC787D" />
      </svg>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Centered Section Header with 4-square Grid Pill Badge */}
        <motion.div 
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.85, ease: SMOOTH_SLOW_EASING }}
          className="text-center max-w-2xl mx-auto mb-8 sm:mb-10"
        >
          <div className="flex items-center justify-center mb-2.5 sm:mb-3">
            <span 
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full select-none"
              style={{
                backgroundColor: '#FFF1F2',
                color: '#FC787D',
                border: '1px solid #FED7D9'
              }}
            >
              {/* 4-Square Grid Icon */}
              <svg className="w-3 h-3 text-[#FC787D]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1.5" y="1.5" width="4.2" height="4.2" rx="1.2" />
                <rect x="8.3" y="1.5" width="4.2" height="4.2" rx="1.2" />
                <rect x="1.5" y="8.3" width="4.2" height="4.2" rx="1.2" />
                <rect x="8.3" y="8.3" width="4.2" height="4.2" rx="1.2" />
              </svg>
              OUR PRODUCT SUITE
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0F172A] tracking-tight">
            Explore Our <span className="text-[#FC787D]">Software Products</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal max-w-xl mx-auto">
            Eight specialized enterprise applications engineered to run your entire operations.
          </p>
        </motion.div>

        {/* 4-Column x 2-Row Compact Grid of Apps */}
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5"
          onMouseLeave={() => setActiveAppId(null)}
        >
          {HERO_APPS.map((app, index) => {
            const isActive = activeAppId === app.id;

            return (
              <motion.div
                key={app.id}
                initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ 
                  duration: 0.85, 
                  delay: (index % 4) * 0.06, 
                  ease: SMOOTH_SLOW_EASING 
                }}
                onClick={() => handleAppClick(app)}
                onMouseEnter={() => setActiveAppId(app.id)}
                onMouseLeave={() => setActiveAppId(null)}
                role="button"
                tabIndex={0}
                className={`group relative bg-white rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ease-out cursor-pointer overflow-hidden text-center focus-visible:outline-2 focus-visible:outline-[#FC787D] ${
                  isActive
                    ? 'border-[1.5px] border-[#FC787D] shadow-[0_12px_28px_-6px_rgba(252,120,125,0.22)] -translate-y-1'
                    : 'border border-slate-200/70 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(252,120,125,0.22)] hover:border-[#FC787D] hover:border-[1.5px] hover:-translate-y-1'
                }`}
                style={{
                  height: '155px'
                }}
              >
                {/* Hover / Active Soft Coral-Pink Gradient Wash */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 pointer-events-none rounded-2xl ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F6 50%, #FFE8EA 100%)'
                  }}
                  aria-hidden="true"
                />

                {/* Default State: Soft Brand Accent Corner Waves in Bottom-Right */}
                <div className={`absolute inset-0 overflow-hidden rounded-2xl pointer-events-none transition-opacity duration-300 ${
                  isActive ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
                }`}>
                  <svg 
                    className="absolute -bottom-1 -right-1 w-32 h-24 pointer-events-none" 
                    viewBox="0 0 160 120" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Outer gentle wave */}
                    <path 
                      d="M 40 120 C 68 80, 102 55, 160 28 L 160 120 Z" 
                      fill={app.waveLight} 
                    />
                    {/* Inner subtle wave */}
                    <path 
                      d="M 80 120 C 102 90, 128 75, 160 58 L 160 120 Z" 
                      fill={app.waveDark} 
                    />
                  </svg>
                </div>

                {/* Hover / Active State: Coral-Pink Ambient Waves at Bottom */}
                <div className={`absolute inset-0 overflow-hidden rounded-2xl pointer-events-none transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <svg 
                    className="absolute bottom-0 inset-x-0 w-full h-18 pointer-events-none" 
                    viewBox="0 0 280 90" 
                    fill="none" 
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Left rising wave */}
                    <path 
                      d="M 0 52 C 45 38, 85 52, 130 74 C 160 88, 220 90, 280 62 L 280 90 L 0 90 Z" 
                      fill="rgba(252, 120, 125, 0.12)" 
                    />
                    {/* Right rising wave */}
                    <path 
                      d="M 0 74 C 60 70, 120 84, 180 62 C 220 48, 255 56, 280 48 L 280 90 L 0 90 Z" 
                      fill="rgba(252, 120, 125, 0.18)" 
                    />
                  </svg>
                </div>

                {/* Centered Logo Stage (Transitions upwards on hover/active) */}
                <div className={`w-full flex items-center justify-center relative z-10 px-4 transition-transform duration-300 ease-out pointer-events-none ${
                  isActive ? '-translate-y-9' : 'group-hover:-translate-y-9'
                }`}>
                  <img 
                    src={app.image} 
                    alt={app.name} 
                    className="h-10 sm:h-11 w-auto max-w-[78%] object-contain select-none transition-transform duration-300 ease-out group-hover:scale-90 filter drop-shadow-xs" 
                    loading="lazy"
                  />
                </div>

                {/* Hover / Active Reveal Card Panel (Divider + Title + Subtitle + Pink Circle Arrow Button) */}
                <div className={`absolute bottom-2 sm:bottom-2.5 inset-x-0 flex flex-col items-center justify-center px-3 z-20 transition-all duration-300 ease-out pointer-events-none ${
                  isActive 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                }`}>
                  {/* Subtle hairline glow divider */}
                  <div className="w-14 h-[1px] bg-gradient-to-r from-transparent via-[#FC787D]/40 to-transparent mb-1" />

                  {/* App Title in Bold Coral-Pink */}
                  <h3 className="text-[13px] sm:text-[14px] font-bold text-[#FC787D] tracking-tight leading-none">
                    {app.name}
                  </h3>

                  {/* App Subtitle / Tagline */}
                  <p className="text-[10px] sm:text-[10.5px] text-slate-500 font-normal leading-tight mt-0.5 max-w-[190px] line-clamp-1">
                    {app.subtitle}
                  </p>

                  {/* Action Circular Pink Button with Arrow */}
                  <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full bg-[#FC787D] text-white flex items-center justify-center shadow-xs shadow-[#FC787D]/35 mt-1 transition-transform duration-200 group-hover:scale-105">
                    <ArrowRight className="w-3 h-3 text-white stroke-[2.5]" />
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
