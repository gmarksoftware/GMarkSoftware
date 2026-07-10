import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gramUnnatiLogoImg from '@/assets/gramunnati.png';
import logo4MImg from '@/assets/4M.png';

// Custom SVG IoT Logo in Dark Theme
const IoTLogo = ({ size = "w-[160px] h-[160px]" }) => (
  <div className={`bg-[#05070D] border border-white/10 p-4 rounded-3xl flex items-center justify-center shadow-xl ${size} select-none`}>
    <svg className="w-full h-full text-accent-blue" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-iot" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="iotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      
      <g transform="translate(0, -10)">
        {/* Outer rotating/dashed telemetries */}
        <circle cx="100" cy="100" r="75" stroke="#38BDF8" strokeWidth="4" strokeDasharray="16 12" opacity="0.3" />
        <circle cx="100" cy="100" r="55" stroke="#0EA5E9" strokeWidth="3" strokeDasharray="8 6" opacity="0.6" />
        
        {/* Central Node */}
        <circle cx="100" cy="100" r="22" fill="url(#iotGrad)" />
        
        {/* Core Wifi Waves */}
        <path d="M 85,90 C 90,85 110,85 115,90" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M 77,82 C 87,72 113,72 123,82" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M 69,74 C 84,59 116,59 131,74" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

        {/* Connected outer nodes */}
        <circle cx="50" cy="65" r="10" fill="#05070D" stroke="url(#iotGrad)" strokeWidth="3" />
        <line x1="100" y1="100" x2="50" y2="65" stroke="url(#iotGrad)" strokeWidth="3" opacity="0.7" />
        
        <circle cx="150" cy="65" r="10" fill="#05070D" stroke="url(#iotGrad)" strokeWidth="3" />
        <line x1="100" y1="100" x2="150" y2="65" stroke="url(#iotGrad)" strokeWidth="3" opacity="0.7" />

        <circle cx="100" cy="155" r="10" fill="#05070D" stroke="url(#iotGrad)" strokeWidth="3" />
        <line x1="100" y1="100" x2="100" y2="155" stroke="url(#iotGrad)" strokeWidth="3" opacity="0.7" />
      </g>
    </svg>
  </div>
);


// Slide interface definition
interface Slide {
  id: number;
  type: 'maintenance' | 'agriculture' | 'iot';
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

export default function HeroCarousel({ 
  onCTA,
  activeSlideIndex,
  onChangeSlide
}: { 
  onCTA: (view?: string) => void; 
  activeSlideIndex?: number;
  onChangeSlide?: (idx: number) => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0); // Starts at 0
  const [direction, setDirection] = useState(1); // 1 = Next (R-to-L), -1 = Prev (L-to-R)
  const [isPlaying, setIsPlaying] = useState(true);
  const autoplayRef = useRef<number | null>(null);

  const slides: Slide[] = [
    {
      id: 1,
      type: 'maintenance',
      badge: 'CMMS PLATFORM',
      titleFirstLine: 'Smart Maintenance',
      titleAccentLine: 'Management System',
      accentClass: 'text-accent-red text-shadow-[0_0_12px_rgba(255,90,95,0.35)]',
      description: '4M is a CMMS software which streamlines maintenance operations providing comprehensive connectivity for maintenance activities.',
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
    },
    {
      id: 3,
      type: 'iot',
      badge: 'INDUSTRIAL TELEMETRY',
      titleFirstLine: 'Smart Industrial IoT',
      titleAccentLine: 'Telemetry & Networks',
      accentClass: 'text-accent-red text-shadow-[0_0_12px_rgba(255,90,95,0.35)]',
      description: 'G Mark\'s IoT platforms offer real-time telemetry, remote monitoring, and seamless sensor integration to transform physical industrial workflows into intelligent digital systems.',
      primaryBtnText: 'Learn More',
      btnClass: 'bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/50 hover:-translate-y-0.5',
    }
  ];

  // Sync with activeSlideIndex prop from parent
  useEffect(() => {
    if (activeSlideIndex !== undefined && activeSlideIndex >= 0 && activeSlideIndex < slides.length) {
      if (activeSlideIndex !== currentSlide) {
        setDirection(activeSlideIndex > currentSlide ? 1 : -1);
        setCurrentSlide(activeSlideIndex);
      }
    }
  }, [activeSlideIndex]);

  // Autoplay Effect (cycles every 6 seconds, resets when slide changes to prevent jumpiness)
  useEffect(() => {
    if (isPlaying) {
      autoplayRef.current = window.setInterval(() => {
        setDirection(1);
        const nextSlide = (currentSlide + 1) % slides.length;
        setCurrentSlide(nextSlide);
        if (onChangeSlide) {
          onChangeSlide(nextSlide);
        }
      }, 6000);
    }
    return () => {
      if (autoplayRef.current) {
        window.clearInterval(autoplayRef.current);
      }
    };
  }, [isPlaying, currentSlide]);

  const handleNext = () => {
    setDirection(1);
    const nextSlide = (currentSlide + 1) % slides.length;
    setCurrentSlide(nextSlide);
    if (onChangeSlide) {
      onChangeSlide(nextSlide);
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
    setCurrentSlide(prevSlide);
    if (onChangeSlide) {
      onChangeSlide(prevSlide);
    }
  };

  const slide = slides[currentSlide];
  return (
    <motion.section
      id="systems-spotlight"
      className="relative min-h-[580px] lg:min-h-screen flex items-center overflow-hidden bg-transparent w-full border-t border-b border-border-color snap-section"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Subtle overlay gradients */}
      <div className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.03),transparent_65%)]" />

      {/* Main Slide Track */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-8 w-full py-6 md:py-16">
        <div className="relative w-full min-h-[640px] lg:min-h-[600px]">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? '30%' : '-30%',
                  opacity: 0,
                }),
                center: {
                  x: 0,
                  opacity: 1,
                },
                exit: (dir: number) => ({
                  x: dir > 0 ? '-30%' : '30%',
                  opacity: 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 1.2 },
                opacity: { type: 'tween', ease: 'easeInOut', duration: 1.0 }
              }}
              style={{
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d'
              }}
              className="w-full relative min-h-[640px] lg:min-h-[600px] flex items-center justify-center"
            >
              {slide.type === 'agriculture' ? (
                // GramUnnati Custom Slide (Centered Layout, Dark Mode, No Mockup)
                <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-6 py-6 lg:py-12 relative -translate-y-4">
                  {/* Logo on top */}
                  <div className="bg-white p-4 rounded-3xl flex items-center justify-center shadow-xl w-[160px] h-[160px] mb-8 animate-slideInFromLeft">
                    <img
                      src={gramUnnatiLogoImg}
                      alt="GramUnnati Logo Icon"
                      className="w-full h-full object-contain rounded-2xl"
                    />
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-sm border text-accent-red bg-accent-red/10 border-accent-red/20 mb-6">
                    LIVE PRECISION DATA
                  </span>
                  
                  <h1 className="font-display-lg text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] text-text-primary tracking-tight">
                    Smart Agricultural <br/>
                    <span className="text-accent-red text-shadow-[0_0_12px_rgba(255,90,95,0.35)]">Management System</span>
                  </h1>

                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mt-6 text-text-primary">
                    Gramin Udyog Se Global Bazaar Tak
                  </h2>

                  <p className="text-lg text-text-secondary leading-relaxed mt-4 max-w-2xl mx-auto">
                    A Digital Marketplace to Empower Rural Women, Farmers, and Rural Entrepreneurs. GramUnnati empowers farmers and businesses to track, manage, and optimize agricultural operations.
                  </p>

                  <button
                    onClick={() => onCTA('gramunnati')}
                    className="mt-6 w-[200px] h-[56px] flex items-center justify-center bg-transparent text-accent-red border border-accent-red font-bold text-base rounded-xl shadow-lg shadow-accent-red/15 hover:bg-white/10 hover:border-white/50 hover:text-white hover:scale-[1.03] hover:shadow-xl hover:shadow-white/5 transition-all duration-300 cursor-pointer border-solid"
                  >
                    Learn More
                  </button>
                </div>
              ) : slide.type === 'iot' ? (
                // IoT Custom Slide (Centered Layout, Dark Mode, No Mockup)
                <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-6 py-6 lg:py-12 relative -translate-y-4">
                  {/* Logo on top */}
                  <IoTLogo size="w-[160px] h-[160px] mb-8 animate-slideInFromLeft" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-sm border text-accent-red bg-accent-red/10 border-accent-red/20 mb-6">
                    INDUSTRIAL TELEMETRY
                  </span>
                  
                  <h1 className="font-display-lg text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] text-text-primary tracking-tight">
                    Smart Industrial IoT <br/>
                    <span className="text-accent-red text-shadow-[0_0_12px_rgba(255,90,95,0.35)]">Telemetry & Networks</span>
                  </h1>

                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mt-6 text-text-primary">
                    IoT Platform
                  </h2>

                  <p className="text-lg text-text-secondary leading-relaxed mt-4 max-w-2xl mx-auto">
                    G Mark's IoT platforms offer real-time telemetry, remote monitoring, and seamless sensor integration to transform physical industrial workflows into intelligent digital systems.
                  </p>

                  <button
                    onClick={() => onCTA('iot')}
                    className="mt-6 w-[200px] h-[56px] flex items-center justify-center bg-transparent text-accent-red border border-accent-red font-bold text-base rounded-xl shadow-lg shadow-accent-red/15 hover:bg-white/10 hover:border-white/50 hover:text-white hover:scale-[1.03] hover:shadow-xl hover:shadow-white/5 transition-all duration-300 cursor-pointer border-solid"
                  >
                    Learn More
                  </button>
                </div>
              ) : (
                // 4M Custom Slide (Centered Layout, Dark Mode, No Mockup)
                <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-6 py-6 lg:py-12 relative -translate-y-4">
                  {/* Logo on top */}
                  <div className="bg-white p-4 rounded-3xl flex items-center justify-center shadow-xl w-[160px] h-[160px] mb-8 animate-slideInFromLeft">
                    <img
                      src={logo4MImg}
                      alt="4M Logo Icon"
                      className="w-full h-full object-contain rounded-2xl"
                    />
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-sm border text-accent-red bg-accent-red/10 border-accent-red/20 mb-6">
                    CMMS PLATFORM
                  </span>
                  
                  <h1 className="font-display-lg text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] text-text-primary tracking-tight">
                    Smart Maintenance <br/>
                    <span className="text-accent-red text-shadow-[0_0_12px_rgba(255,90,95,0.35)]">Management System</span>
                  </h1>

                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mt-6 text-text-primary">
                    4M Maintenance Platform
                  </h2>

                  <p className="text-lg text-text-secondary leading-relaxed mt-4 max-w-2xl mx-auto">
                    4M is a CMMS software which streamlines maintenance operations providing comprehensive connectivity for maintenance activities.
                  </p>

                  <button
                    onClick={() => onCTA('cmms')}
                    className="mt-6 w-[200px] h-[56px] flex items-center justify-center bg-transparent text-accent-red border border-accent-red font-bold text-base rounded-xl shadow-lg shadow-accent-red/15 hover:bg-white/10 hover:border-white/50 hover:text-white hover:scale-[1.03] hover:shadow-xl hover:shadow-white/5 transition-all duration-300 cursor-pointer border-solid"
                  >
                    Learn More
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
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
        {slides.map((_, index) => {
          const isActive = index === currentSlide;
          return (
            <button
              key={index}
              onClick={() => {
                if (index === currentSlide) return;
                const dir = index > currentSlide ? 1 : -1;
                setDirection(dir);
                setCurrentSlide(index);
                if (onChangeSlide) {
                  onChangeSlide(index);
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${isActive
                  ? 'w-8 bg-accent-red'
                  : 'w-2 bg-text-muted/40 hover:bg-text-muted/70'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          );
        })}
      </div>
    </motion.section>
  );
}
