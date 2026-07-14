import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Custom SVG Leaf/G logo for GramUnnati
const GramUnnatiLogo = () => (
  <div className="relative bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg w-[160px] h-[185px] mx-auto select-none">
    {/* Live Status Badge */}
    <div className="absolute top-3 right-3 flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 text-[7px] font-mono font-bold uppercase tracking-wider scale-95">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
      </span>
      Live
    </div>
    <svg className="w-[72px] h-[72px]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Right Leaf (Light Green) */}
      <path
        d="M 94,52 
           C 120,30 155,65 155,95 
           C 155,125 130,148 105,148 
           C 80,148 62,128 62,108 
           L 88,108 
           C 88,118 95,126 105,126 
           C 118,126 132,118 132,95 
           C 132,78 115,62 94,52 
           Z"
        fill="#9CCC3C"
      />
      {/* Left Leaf / G (Dark Green) */}
      <path
        d="M 106,52 
           C 80,30 45,65 45,95 
           C 45,125 70,148 95,148 
           C 120,148 138,128 138,108 
           L 112,108 
           C 112,118 105,126 95,126 
           C 82,126 68,118 68,95 
           C 68,78 85,62 106,52 
           Z"
        fill="#0F4626"
      />
    </svg>
    <span className="text-[18px] font-extrabold text-[#111827] tracking-tight leading-none mt-3">GramUnnati</span>
    <span className="text-[9px] text-[#6b7280] text-center leading-none mt-2 tracking-wide">Connecting Farmers to the Future</span>
  </div>
);

// Custom SVG high-tech 4M logo
const Logo4M = () => (
  <div className="bg-white p-2 rounded-lg flex items-center justify-center shadow-lg w-[80px] h-[80px] mx-auto select-none">
    <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Glow Filter */}
        <filter id="glow4m" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {/* Cyan Gradient */}
        <linearGradient id="cyanGrad4m" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00B0FF" />
        </linearGradient>
      </defs>

      {/* Orbital Intersecting Rings */}
      <circle cx="100" cy="100" r="74" stroke="#0f172a" strokeWidth="8" />
      <circle cx="100" cy="100" r="74" stroke="url(#cyanGrad4m)" strokeWidth="4" strokeDasharray="140 70" transform="rotate(45 100 100)" />
      <circle cx="100" cy="100" r="74" stroke="url(#cyanGrad4m)" strokeWidth="4" strokeDasharray="140 70" transform="rotate(225 100 100)" />

      {/* Inner White core */}
      <circle cx="100" cy="100" r="54" fill="#ffffff" />
      <circle cx="100" cy="100" r="54" stroke="#00E5FF" strokeWidth="2" opacity="0.2" />

      {/* Four Corner Glowing Nodes with Icons */}
      {/* Node 1: Top-Left (User Profile) */}
      <g transform="translate(50, 50)" filter="url(#glow4m)">
        <circle cx="0" cy="0" r="16" fill="#00e5ff" />
        <circle cx="0" cy="0" r="13" fill="#0f172a" />
        <circle cx="0" cy="-3" r="4" fill="#ffffff" />
        <path d="M-6 7 C-6 3, -3 2, 0 2 C3 2, 6 3, 6 7 Z" fill="#ffffff" />
      </g>

      {/* Node 2: Top-Right (Gear) */}
      <g transform="translate(150, 50)" filter="url(#glow4m)">
        <circle cx="0" cy="0" r="16" fill="#00e5ff" />
        <circle cx="0" cy="0" r="13" fill="#0f172a" />
        <circle cx="0" cy="0" r="3" stroke="#ffffff" strokeWidth="2" />
        <path d="M-1.5 -5.5 L1.5 -5.5 L2 -3.5 L3.5 -3.5 L5 -5 L6 -4 L5 -2.5 L5 -1 L6.5 0 L6.5 1.5 L5 2 L5 3.5 L6 5 L5 5.5 L3.5 5 L2 5 L1.5 6.5 L-1.5 6.5 L-2 5 L-3.5 5 L-5 6 L-5.5 5 L-5 3.5 L-5 2 L-6.5 1.5 L-6.5 0 L-5 -1.5 L-5 -3 L-6 -4.5 L-5 -5 L-3.5 -5 L-2 -5 Z" fill="#ffffff" />
      </g>

      {/* Node 3: Bottom-Left (Gear) */}
      <g transform="translate(50, 150)" filter="url(#glow4m)">
        <circle cx="0" cy="0" r="16" fill="#00e5ff" />
        <circle cx="0" cy="0" r="13" fill="#0f172a" />
        <circle cx="0" cy="0" r="3" stroke="#ffffff" strokeWidth="2" />
        <path d="M-1.5 -5.5 L1.5 -5.5 L2 -3.5 L3.5 -3.5 L5 -5 L6 -4 L5 -2.5 L5 -1 L6.5 0 L6.5 1.5 L5 2 L5 3.5 L6 5 L5 5.5 L3.5 5 L2 5 L1.5 6.5 L-1.5 6.5 L-2 5 L-3.5 5 L-5 6 L-5.5 5 L-5 3.5 L-5 2 L-6.5 1.5 L-6.5 0 L-5 -1.5 L-5 -3 L-6 -4.5 L-5 -5 L-3.5 -5 L-2 -5 Z" fill="#ffffff" />
      </g>

      {/* Node 4: Bottom-Right (Network Node) */}
      <g transform="translate(150, 150)" filter="url(#glow4m)">
        <circle cx="0" cy="0" r="16" fill="#00e5ff" />
        <circle cx="0" cy="0" r="13" fill="#0f172a" />
        <circle cx="0" cy="-5" r="2.5" fill="#ffffff" />
        <circle cx="-4" cy="4" r="2.5" fill="#ffffff" />
        <circle cx="4" cy="4" r="2.5" fill="#ffffff" />
        <path d="M0 -2.5 L0 1 M0 1 L-4 1 M0 1 L4 1" stroke="#ffffff" strokeWidth="1.5" />
      </g>

      {/* Centered 4M Text */}
      <g transform="translate(0, 4)">
        {/* Number 4 */}
        <text x="64" y="118" fill="#00E5FF" fontSize="72" fontWeight="900" fontFamily="sans-serif">4</text>
        {/* Letter M */}
        <text x="104" y="118" fill="#0f172a" fontSize="72" fontWeight="900" fontFamily="sans-serif">M</text>
      </g>
    </svg>
  </div>
);


// Mockup Components for GramUnnati (Agriculture Slide)
const AgricultureRightMockup = () => (
  <div className="relative w-full max-w-[480px] bg-bg-secondary/40 border border-border-color backdrop-blur-md rounded-2xl p-5 shadow-2xl grid grid-cols-2 gap-4">
    {/* Ambient card glow */}
    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,90,95,0.06), transparent 70%)' }} />

    {/* Soil Health Index (Full width) */}
    <div className="col-span-2 bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3 relative overflow-hidden">
      <div className="flex justify-between items-center text-text-secondary">
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Soil Health Index</span>
        <span className="material-symbols-outlined text-sm text-accent-red">trending_up</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-white leading-none font-title">84.2</span>
        <span className="text-sm font-semibold text-text-secondary">ph</span>
      </div>
      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div className="bg-linear-to-r from-accent-red to-accent-red-hover h-full rounded-full" style={{ width: '84.2%' }} />
      </div>
    </div>

    {/* Moisture */}
    <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-2">
      <div className="flex flex-col">
        <span className="text-[9px] font-mono text-text-secondary uppercase tracking-wider">Moisture</span>
        <span className="text-xl font-bold text-white mt-1">42%</span>
      </div>
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
        <span className="material-symbols-outlined text-base">water_drop</span>
      </div>
    </div>

    {/* Temp */}
    <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-2">
      <div className="flex flex-col">
        <span className="text-[9px] font-mono text-text-secondary uppercase tracking-wider">Temp</span>
        <span className="text-xl font-bold text-white mt-1">28°C</span>
      </div>
      <div className="w-8 h-8 rounded-lg bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red">
        <span className="material-symbols-outlined text-base">thermostat</span>
      </div>
    </div>

    {/* Yield Forecast */}
    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3">
      <span className="text-[9px] font-mono text-text-secondary uppercase tracking-wider">Yield Forecast</span>
      <div className="flex items-end justify-between h-12 pt-2 px-1">
        <div className="w-1.5 bg-accent-red/30 h-[40%] rounded-t-sm" />
        <div className="w-1.5 bg-accent-red/50 h-[65%] rounded-t-sm" />
        <div className="w-1.5 bg-accent-red/40 h-[50%] rounded-t-sm" />
        <div className="w-1.5 bg-accent-red h-[90%] rounded-t-sm shadow-[0_0_10px_rgba(255,90,95,0.3)]" />
        <div className="w-1.5 bg-accent-red/70 h-[75%] rounded-t-sm" />
      </div>
    </div>

    {/* Efficiency vs LY */}
    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-2">
      <span className="text-[9px] font-mono text-text-secondary uppercase tracking-wider">Efficiency vs LY</span>
      <span className="text-2xl font-extrabold text-accent-red tracking-tight mt-1">+12.4%</span>
      {/* Pagination indicators */}
      <div className="flex gap-1.5 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-accent-red" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
      </div>
    </div>
  </div>
);

// Mockup Components for 4M (Maintenance Slide)
const MaintenanceRightMockup = () => (
  <div className="relative w-full max-w-[500px]">
    {/* 4M Labels on top of computer */}
    <div className="text-left mb-5 select-none flex flex-col gap-1 items-start pl-1">
      <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-text-secondary uppercase">MAN,</span>
      <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-text-secondary uppercase">MACHINE,</span>
      <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-text-secondary uppercase">MATERIAL,</span>
      <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-text-secondary uppercase">MANAGEMENT</span>
    </div>
    {/* Monitor Stand and Frame */}
    <div className="relative w-full">
      <div className="rounded-2xl border-[6px] border-text-secondary/40 bg-transparent p-6 overflow-hidden aspect-16/10 flex items-center justify-center relative">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,90,95,0.04), transparent 70%)' }} />

        {/* Dashboard Screen Content */}
        <div className="grid grid-cols-3 gap-4 items-center justify-items-center w-full">
          {/* Line/Bar Chart Outline */}
          <div className="w-full flex items-center justify-center p-2">
            <svg className="w-full max-w-[120px] h-[100px] text-text-secondary/40" viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M10 10 L10 70 L90 70" />
              <rect x="22" y="50" width="10" height="20" fill="none" />
              <rect x="42" y="38" width="10" height="32" fill="none" />
              <rect x="62" y="25" width="10" height="45" fill="none" />
              <path d="M10 65 L27 55 L47 43 L67 30 L85 15" strokeWidth="1.8" />
              <circle cx="85" cy="15" r="2" fill="currentColor" />
            </svg>
          </div>

          {/* Pie Chart Outline */}
          <div className="w-full flex items-center justify-center p-2">
            <svg className="w-full max-w-[100px] h-[100px] text-text-secondary/40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="50" cy="50" r="40" />
              <path d="M50 10 L50 50 L90 50" />
              <path d="M50 50 L22 78" />
              <path d="M50 50 L78 78" />
            </svg>
          </div>

          {/* Document Preview Outline */}
          <div className="w-full flex items-center justify-center p-2">
            <svg className="w-full max-w-[100px] h-[110px] text-text-secondary/40" viewBox="0 0 100 110" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="25" y="20" width="55" height="75" strokeDasharray="3 3" />
              <rect x="15" y="10" width="55" height="75" fill="#05070D" />
              <line x1="23" y1="22" x2="48" y2="22" strokeDasharray="2 2" />
              <line x1="23" y1="32" x2="62" y2="32" strokeDasharray="2 2" />
              <line x1="23" y1="42" x2="52" y2="42" strokeDasharray="2 2" />
              <line x1="23" y1="52" x2="42" y2="52" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Monitor Stand */}
      <div className="w-20 h-10 border-x-[5px] border-b-[5px] border-text-secondary/40 mx-auto mt-[-5px]" />
      {/* Monitor Base */}
      <div className="w-44 h-1.5 bg-text-secondary/40 mx-auto rounded-full" />
    </div>
  </div>
);

// Slide interface definition
interface Slide {
  id: number;
  type: 'maintenance' | 'agriculture';
  badge?: string;
  titleFirstLine: string;
  titleAccentLine: string;
  accentClass: string;
  description: string;
  primaryBtnText: string;
  secondaryBtnText?: string;
  btnClass: string;
  stats?: { label: string; value: string }[];
}

export default function HeroCarousel({ onCTA }: { onCTA: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoplayRef = useRef<number | null>(null);
  const [activeLogisticsStep, setActiveLogisticsStep] = useState(0); // 0 = Transporter, 1 = GMU Hub, 2 = Delivery

  const slides: Slide[] = [
    {
      id: 1,
      type: 'maintenance',
      badge: 'CMMS PLATFORM',
      titleFirstLine: 'Smart Maintenance',
      titleAccentLine: 'Management System',
      accentClass: 'text-text-primary',
      description: '4M is a CMMS software which streamlines maintenance operations providing comprehensive connectivity for maintenance activities. It empowers teams and businesses to efficiently track, manage, and optimize their maintenance tasks, ensuring enhanced productivity and reduced downtime.',
      primaryBtnText: 'Learn More',
      btnClass: 'bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/50 hover:-translate-y-0.5',
    },
    {
      id: 2,
      type: 'agriculture',
      badge: 'LIVE PRECISION DATA',
      titleFirstLine: 'Smart Agricultural',
      titleAccentLine: 'Management System',
      accentClass: 'text-accent-red text-shadow-[0_0_12px_rgba(255,90,95,0.35)]',
      description: 'GramUnnati empowers farmers and businesses to efficiently track, manage, and optimize agricultural operations, ensuring enhanced productivity, telemetry monitoring, and sustainable growth.',
      primaryBtnText: 'Learn More',
      secondaryBtnText: 'View Dashboard',
      btnClass: 'bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/50 hover:-translate-y-0.5',
    }
  ];

  // Start Autoplay
  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return () => stopAutoplay();
  }, [isPlaying, currentSlide]);

  // Logistics flow tracker active step cycler (every 2.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLogisticsStep((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <motion.section
      id="systems-spotlight"
      className="relative py-20 lg:py-28 overflow-hidden bg-transparent w-full border-t border-b border-border-color"
      initial={{ opacity: 0, y: 120 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Subtle overlay gradients */}
      <div className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.03),transparent_65%)]" />

      {/* Main Slide Track */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-8 w-full py-16">
        <div className="relative w-full min-h-[500px] lg:min-h-[420px]">
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;

            return (
              <div
                key={slide.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full px-6 sm:px-10 lg:px-16 transition-all duration-1200 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive
                  ? 'opacity-100 translate-x-0 scale-100 relative z-10'
                  : 'opacity-0 translate-x-16 scale-95 absolute inset-0 pointer-events-none z-0'
                  }`}
              >
                {/* Left Column: Phone Mockup */}
                <div className="lg:col-span-4 flex justify-center items-center lg:border-r lg:border-border-color lg:px-6">
                  <div className="relative shrink-0">
                    {/* Phone Frame */}
                    <div className="relative w-[280px] h-[520px] rounded-[44px] border-8 border-text-secondary/40 bg-[#05070D] flex flex-col justify-between p-5.5 shadow-2xl overflow-hidden">
                      {/* Notch */}
                      <div className="w-24 h-5 bg-text-secondary/30 rounded-full mx-auto -mt-2 flex items-center justify-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <div className="w-10 h-1 rounded-full bg-white/20" />
                      </div>

                      {/* Screen Content based on type */}
                      {slide.type === 'maintenance' ? (
                        <div className="flex-1 flex flex-col justify-center items-center py-2">
                          <div className="bg-white p-2 rounded-xl flex items-center justify-center shadow-lg w-[150px] h-[150px] select-none mx-auto mb-3">
                            <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <filter id="glow4m-phone" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="4" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <linearGradient id="cyanGrad4m-phone" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#00E5FF" />
                                  <stop offset="100%" stopColor="#00B0FF" />
                                </linearGradient>
                              </defs>
                              <circle cx="100" cy="100" r="74" stroke="#0f172a" strokeWidth="8" />
                              <circle cx="100" cy="100" r="74" stroke="url(#cyanGrad4m-phone)" strokeWidth="4" strokeDasharray="140 70" transform="rotate(45 100 100)" />
                              <circle cx="100" cy="100" r="74" stroke="url(#cyanGrad4m-phone)" strokeWidth="4" strokeDasharray="140 70" transform="rotate(225 100 100)" />
                              <circle cx="100" cy="100" r="54" fill="#ffffff" />
                              <circle cx="100" cy="100" r="54" stroke="#00E5FF" strokeWidth="2" opacity="0.2" />
                              <g transform="translate(50, 50)" filter="url(#glow4m-phone)">
                                <circle cx="0" cy="0" r="16" fill="#00e5ff" />
                                <circle cx="0" cy="0" r="13" fill="#0f172a" />
                                <circle cx="0" cy="-3" r="4" fill="#ffffff" />
                                <path d="M-6 7 C-6 3, -3 2, 0 2 C3 2, 6 3, 6 7 Z" fill="#ffffff" />
                              </g>
                              <g transform="translate(150, 50)" filter="url(#glow4m-phone)">
                                <circle cx="0" cy="0" r="16" fill="#00e5ff" />
                                <circle cx="0" cy="0" r="13" fill="#0f172a" />
                                <circle cx="0" cy="0" r="3" stroke="#ffffff" strokeWidth="2" />
                                <path d="M-1.5 -5.5 L1.5 -5.5 L2 -3.5 L3.5 -3.5 L5 -5 L6 -4 L5 -2.5 L5 -1 L6.5 0 L6.5 1.5 L5 2 L5 3.5 L6 5 L5 5.5 L3.5 5 L2 5 L1.5 6.5 L-1.5 6.5 L-2 5 L-3.5 5 L-5 6 L-5.5 5 L-5 3.5 L-5 2 L-6.5 1.5 L-6.5 0 L-5 -1.5 L-5 -3 L-6 -4.5 L-5 -5 L-3.5 -5 L-2 -5 Z" fill="#ffffff" />
                              </g>
                              <g transform="translate(50, 150)" filter="url(#glow4m-phone)">
                                <circle cx="0" cy="0" r="16" fill="#00e5ff" />
                                <circle cx="0" cy="0" r="13" fill="#0f172a" />
                                <circle cx="0" cy="0" r="3" stroke="#ffffff" strokeWidth="2" />
                                <path d="M-1.5 -5.5 L1.5 -5.5 L2 -3.5 L3.5 -3.5 L5 -5 L6 -4 L5 -2.5 L5 -1 L6.5 0 L6.5 1.5 L5 2 L5 3.5 L6 5 L5 5.5 L3.5 5 L2 5 L1.5 6.5 L-1.5 6.5 L-2 5 L-3.5 5 L-5 6 L-5.5 5 L-5 3.5 L-5 2 L-6.5 1.5 L-6.5 0 L-5 -1.5 L-5 -3 L-6 -4.5 L-5 -5 L-3.5 -5 L-2 -5 Z" fill="#ffffff" />
                              </g>
                              <g transform="translate(150, 150)" filter="url(#glow4m-phone)">
                                <circle cx="0" cy="0" r="16" fill="#00e5ff" />
                                <circle cx="0" cy="0" r="13" fill="#0f172a" />
                                <circle cx="0" cy="-5" r="2.5" fill="#ffffff" />
                                <circle cx="-4" cy="4" r="2.5" fill="#ffffff" />
                                <circle cx="4" cy="4" r="2.5" fill="#ffffff" />
                                <path d="M0 -2.5 L0 1 M0 1 L-4 1 M0 1 L4 1" stroke="#ffffff" strokeWidth="1.5" />
                              </g>
                              <g transform="translate(0, 4)">
                                <text x="64" y="118" fill="#00E5FF" fontSize="72" fontWeight="900" fontFamily="sans-serif">4</text>
                                <text x="104" y="118" fill="#0f172a" fontSize="72" fontWeight="900" fontFamily="sans-serif">M</text>
                              </g>
                            </svg>
                          </div>

                          {/* 4M Change Management List */}
                          <div className="w-full px-2 flex flex-col gap-2.5 mt-5">
                            <span className="text-[11px] font-mono font-bold text-text-secondary uppercase tracking-widest text-center leading-none mb-1.5">Change Management</span>
                            <div className="flex flex-col gap-2 w-full">
                              {/* Planned Change */}
                              <div className={`flex items-center justify-between px-3.5 py-2 rounded-md transition-all duration-300 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400`}>
                                <span className="text-[11px] font-bold font-sans tracking-wide">Planned</span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400/80`}>1</span>
                              </div>
                              {/* Unplanned Change */}
                              <div className={`flex items-center justify-between px-3.5 py-2 rounded-md transition-all duration-300 bg-accent-red/10 border border-accent-red/20 text-accent-red`}>
                                <span className="text-[11px] font-bold font-sans tracking-wide">Unplanned</span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-accent-red/10 text-accent-red/80`}>2</span>
                              </div>
                              {/* Abnormal Change */}
                              <div className={`flex items-center justify-between px-3.5 py-2 rounded-md transition-all duration-300 bg-amber-500/10 border border-amber-500/20 text-amber-400`}>
                                <span className="text-[11px] font-bold font-sans tracking-wide">Abnormal</span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-amber-400/80`}>3</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col justify-center items-center w-full">
                          <GramUnnatiLogo />
                          {/* Live Logistics Flow Tracker */}
                          <div className="w-full px-2 mt-6 flex flex-col gap-2 select-none">
                            <span className="text-[9px] font-mono font-bold text-accent-red/90 uppercase tracking-widest text-center leading-none">
                              Live Logistics Flow
                            </span>
                            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-2.5 relative overflow-hidden w-full">
                              {/* Transporter Box */}
                              <div className="flex flex-col items-center justify-center">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-300 ${activeLogisticsStep === 0
                                  ? 'bg-accent-red/20 border-accent-red text-accent-red scale-110 shadow-[0_0_8px_rgba(255,90,95,0.35)]'
                                  : activeLogisticsStep > 0
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                    : 'bg-white/5 border-white/10 text-text-secondary'
                                  }`}>
                                  <span className={`material-symbols-outlined text-[14px] ${activeLogisticsStep === 0 ? 'animate-pulse' : ''}`}>local_shipping</span>
                                </div>
                                <span className="text-[8px] font-bold text-text-primary mt-1 uppercase tracking-wide">Transporter</span>
                                <span className={`text-[6.5px] font-mono mt-0.5 ${activeLogisticsStep === 0
                                  ? 'text-accent-red animate-pulse font-bold'
                                  : activeLogisticsStep > 0
                                    ? 'text-emerald-500 font-bold'
                                    : 'text-text-muted'
                                  }`}>
                                  {activeLogisticsStep === 0 ? 'IN TRANSIT' : activeLogisticsStep > 0 ? 'DEPARTED' : 'PENDING'}
                                </span>
                              </div>

                              {/* Animated Arrow 1 */}
                              <div className={`flex items-center justify-center transition-all duration-300 ${activeLogisticsStep === 0
                                ? 'text-accent-red animate-pulse scale-110'
                                : 'text-white/20'
                                }`}>
                                <span className="material-symbols-outlined text-[12px]">double_arrow</span>
                              </div>

                              {/* GMU Hub Box */}
                              <div className="flex flex-col items-center justify-center">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-300 ${activeLogisticsStep === 1
                                  ? 'bg-accent-red/20 border-accent-red text-accent-red scale-110 shadow-[0_0_8px_rgba(255,90,95,0.35)]'
                                  : activeLogisticsStep > 1
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                    : 'bg-white/5 border-white/10 text-text-secondary'
                                  }`}>
                                  <span className={`material-symbols-outlined text-[14px] ${activeLogisticsStep === 1 ? 'animate-pulse' : ''}`}>warehouse</span>
                                </div>
                                <span className="text-[8px] font-bold text-text-primary mt-1 uppercase tracking-wide">GMU Hub</span>
                                <span className={`text-[6.5px] font-mono mt-0.5 ${activeLogisticsStep === 1
                                  ? 'text-accent-red animate-pulse font-bold'
                                  : activeLogisticsStep > 1
                                    ? 'text-emerald-500 font-bold'
                                    : 'text-text-muted'
                                  }`}>
                                  {activeLogisticsStep === 1 ? 'PROCESSING' : activeLogisticsStep > 1 ? 'SORTED' : 'AWAITING'}
                                </span>
                              </div>

                              {/* Animated Arrow 2 */}
                              <div className={`flex items-center justify-center transition-all duration-300 ${activeLogisticsStep === 1
                                ? 'text-accent-red animate-pulse scale-110'
                                : 'text-white/20'
                                }`}>
                                <span className="material-symbols-outlined text-[12px]">double_arrow</span>
                              </div>

                              {/* Delivery Box */}
                              <div className="flex flex-col items-center justify-center">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-300 ${activeLogisticsStep === 2
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 scale-110 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                                  : 'bg-white/5 border-white/10 text-text-secondary'
                                  }`}>
                                  <span className={`material-symbols-outlined text-[14px] ${activeLogisticsStep === 2 ? 'animate-pulse' : ''}`}>check_circle</span>
                                </div>
                                <span className="text-[8px] font-bold text-text-primary mt-1 uppercase tracking-wide">Delivery</span>
                                <span className={`text-[6.5px] font-mono mt-0.5 ${activeLogisticsStep === 2
                                  ? 'text-emerald-500 animate-pulse font-bold'
                                  : 'text-text-muted'
                                  }`}>
                                  {activeLogisticsStep === 2 ? 'ARRIVED' : 'SHIPPED'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Home indicator */}
                      <div className="w-24 h-1.5 bg-white/20 rounded-full mx-auto mb-1" />
                    </div>
                  </div>
                </div>

                {/* Center Column: Text Content & Actions */}
                <div className="lg:col-span-4 flex flex-col gap-6 select-text text-left lg:border-r lg:border-border-color lg:px-6">
                  {slide.badge && (
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-sm self-start border ${slide.type === 'maintenance'
                      ? 'text-accent-red bg-accent-red/10 border-accent-red/20'
                      : 'text-accent-red bg-accent-red/10 border-accent-red/20'
                      }`}>
                      {slide.badge}
                    </span>
                  )}

                  <h1 className="font-display-lg text-4xl sm:text-5xl font-extrabold leading-[1.1] text-text-primary tracking-tight">
                    {slide.titleFirstLine} <br />
                    <span className={slide.accentClass}>{slide.titleAccentLine}</span>
                  </h1>

                  <p className="font-sans text-base text-text-secondary leading-relaxed max-w-xl">
                    {slide.description}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <button
                      onClick={onCTA}
                      className={`px-8 py-3.5 font-bold text-sm uppercase tracking-wider rounded shadow-lg transition-all duration-300 cursor-pointer ${slide.btnClass}`}
                    >
                      {slide.primaryBtnText}
                    </button>
                    {slide.secondaryBtnText && (
                      <button
                        onClick={onCTA}
                        className="border border-white/30 text-white hover:bg-white/10 px-8 py-3.5 font-bold text-sm uppercase tracking-wider rounded transition-all duration-300 cursor-pointer"
                      >
                        {slide.secondaryBtnText}
                      </button>
                    )}
                  </div>

                  {/* Optional Slide-specific stats */}
                  {slide.stats && (
                    <div className="flex gap-8 pt-4 mt-2 border-t border-border-color/30 w-fit">
                      {slide.stats.map((stat, i) => (
                        <div key={i} className={i > 0 ? 'border-l border-border-color/30 pl-8' : ''}>
                          <div className="text-2xl font-bold text-white font-title tracking-tight">{stat.value}</div>
                          <div className="text-[9px] text-text-muted uppercase font-mono tracking-wider">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Visual Mockups */}
                <div className="lg:col-span-4 flex justify-center items-center lg:px-6">
                  {slide.type === 'maintenance' ? (
                    <MaintenanceRightMockup />
                  ) : (
                    <AgricultureRightMockup />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-border-color bg-bg-secondary/40 backdrop-blur-md flex items-center justify-center text-text-secondary hover:text-white hover:border-white/20 transition-all duration-300 cursor-pointer z-20 group hover:bg-bg-secondary/80"
        aria-label="Previous Slide"
      >
        <span className="material-symbols-outlined text-xl group-hover:-translate-x-0.5 transition-transform duration-200">chevron_left</span>
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-border-color bg-bg-secondary/40 backdrop-blur-md flex items-center justify-center text-text-secondary hover:text-white hover:border-white/20 transition-all duration-300 cursor-pointer z-20 group hover:bg-bg-secondary/80"
        aria-label="Next Slide"
      >
        <span className="material-symbols-outlined text-xl group-hover:translate-x-0.5 transition-transform duration-200">chevron_right</span>
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide
              ? 'w-8 bg-accent-red'
              : 'w-2 bg-text-muted/40 hover:bg-text-muted/70'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </motion.section>
  );
}
