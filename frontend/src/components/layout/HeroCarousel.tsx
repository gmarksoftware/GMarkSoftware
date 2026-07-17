import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo4MImg from '@/assets/4M.png';
import gramUnnatiLogoImg from '@/assets/gramunnati.png';

// Custom SVG IoT Logo in Dark Theme
const IoTLogo = ({ size = "w-[160px] h-[160px]" }) => (
  <div className={`bg-[#05070D] border border-white/10 p-2.5 sm:p-4 rounded-3xl flex items-center justify-center shadow-xl ${size} select-none`}>
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
      className="relative h-[720px] xs:h-[680px] lg:h-screen min-h-[500px] flex items-center overflow-hidden bg-transparent w-full border-t border-b border-border-color snap-section"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: 'transform, opacity' }}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Subtle overlay gradients */}
      <div className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.03),transparent_65%)]" />

      {/* Main Slide Track */}
      <div className="relative z-10 w-full px-0 py-0 transition-all duration-300">
        <div className="relative w-full h-[720px] xs:h-[680px] lg:h-screen transition-all duration-300">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? '100%' : '-100%',
                }),
                center: {
                  x: 0,
                },
                exit: (dir: number) => ({
                  x: dir > 0 ? '-100%' : '100%',
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.8 },
              }}
              style={{
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d'
              }}
              className="absolute inset-0 w-full h-full flex items-center justify-center"
            >
              {slide.type === 'agriculture' ? (
                // GramUnnati Custom Slide (Centered Layout, Dark Mode, No Background Image)
                <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-6 py-6 lg:py-12 relative -translate-y-4">
                  {/* Logo on top */}
                  <div className="bg-white p-2.5 sm:p-4 rounded-3xl flex items-center justify-center shadow-xl w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] mb-4 sm:mb-8 animate-slideInFromLeft">
                    <img
                      src={gramUnnatiLogoImg}
                      alt="GramUnnati Logo Icon"
                      className="w-full h-full object-contain rounded-xl sm:rounded-2xl"
                    />
                  </div>

                  <span className="text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-sm border text-accent-red bg-accent-red/10 border-accent-red/20 mb-3 sm:mb-6">
                    LIVE PRECISION DATA
                  </span>
                  
                  <h1 className="font-display-lg text-2xl xs:text-3xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.15] sm:leading-[1.1] text-text-primary tracking-tight">
                    Smart Agricultural <br className="hidden sm:inline" />
                    <span className="text-accent-red text-shadow-[0_0_12px_rgba(255,90,95,0.35)]">Management System</span>
                  </h1>

                  <h2 className="text-base xs:text-lg sm:text-2xl lg:text-4xl font-extrabold tracking-tight leading-tight mt-3 sm:mt-6 text-text-primary">
                    Gramin Udyog Se Global Bazaar Tak
                  </h2>

                  <p className="text-xs xs:text-sm sm:text-lg text-text-secondary leading-relaxed mt-3 sm:mt-4 max-w-2xl mx-auto font-medium">
                    A Digital Marketplace to Empower Rural Women, Farmers, and Rural Entrepreneurs. GramUnnati empowers farmers and businesses to track, manage, and optimize agricultural operations.
                  </p>

                  <button
                    onClick={() => onCTA('gramunnati')}
                    className="mt-4 sm:mt-6 w-[180px] sm:w-[200px] h-[48px] sm:h-[56px] flex items-center justify-center bg-transparent text-accent-red border border-accent-red font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-accent-red/15 hover:bg-white/10 hover:border-white/50 hover:text-white hover:scale-[1.03] hover:shadow-xl hover:shadow-white/5 transition-all duration-300 cursor-pointer border-solid"
                  >
                    Learn More
                  </button>
                </div>
              ) : slide.type === 'iot' ? (
                // IoT Custom Slide (Centered Layout, Dark Mode, No Background Image)
                <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-6 py-6 lg:py-12 relative -translate-y-4">
                  {/* Logo on top */}
                  <IoTLogo size="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] mb-4 sm:mb-8" />
                  
                  <span className="text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-sm border text-accent-red bg-accent-red/10 border-accent-red/20 mb-3 sm:mb-6">
                    INDUSTRIAL TELEMETRY
                  </span>
                  
                  <h1 className="font-display-lg text-2xl xs:text-3xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.15] sm:leading-[1.1] text-text-primary tracking-tight">
                    Smart Industrial IoT <br className="hidden sm:inline" />
                    <span className="text-accent-red text-shadow-[0_0_12px_rgba(255,90,95,0.35)]">Telemetry & Networks</span>
                  </h1>

                  <h2 className="text-base xs:text-lg sm:text-2xl lg:text-4xl font-extrabold tracking-tight leading-tight mt-3 sm:mt-6 text-text-primary">
                    IoT Platform
                  </h2>

                  <p className="text-xs xs:text-sm sm:text-lg text-text-secondary leading-relaxed mt-3 sm:mt-4 max-w-2xl mx-auto font-medium">
                    G Mark's IoT platforms offer real-time telemetry, remote monitoring, and seamless sensor integration to transform physical industrial workflows into intelligent digital systems.
                  </p>

                  <button
                    onClick={() => onCTA('iot')}
                    className="mt-4 sm:mt-6 w-[180px] sm:w-[200px] h-[48px] sm:h-[56px] flex items-center justify-center bg-transparent text-accent-red border border-accent-red font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-accent-red/15 hover:bg-white/10 hover:border-white/50 hover:text-white hover:scale-[1.03] hover:shadow-xl hover:shadow-white/5 transition-all duration-300 cursor-pointer border-solid"
                  >
                    Learn More
                  </button>
                </div>
              ) : (
                // 4M Custom Slide (Centered Layout, Dark Mode, No Background Image)
                <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-6 py-6 lg:py-12 relative -translate-y-4">
                  {/* Logo on top */}
                  <div className="bg-white p-2.5 sm:p-4 rounded-3xl flex items-center justify-center shadow-xl w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] mb-4 sm:mb-8 animate-slideInFromLeft">
                    <img
                      src={logo4MImg}
                      alt="4M Logo Icon"
                      className="w-full h-full object-contain rounded-xl sm:rounded-2xl"
                    />
                  </div>

                  <span className="text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-sm border text-accent-red bg-accent-red/10 border-accent-red/20 mb-3 sm:mb-6">
                    CMMS PLATFORM
                  </span>
                  
                  <h1 className="font-display-lg text-2xl xs:text-3xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.15] sm:leading-[1.1] text-text-primary tracking-tight">
                    Smart Maintenance <br className="hidden sm:inline" />
                    <span className="text-accent-red text-shadow-[0_0_12px_rgba(255,90,95,0.35)]">Management System</span>
                  </h1>

                  <h2 className="text-base xs:text-lg sm:text-2xl lg:text-4xl font-extrabold tracking-tight leading-tight mt-3 sm:mt-6 text-text-primary">
                    4M Maintenance Platform
                  </h2>

                  <p className="text-xs xs:text-sm sm:text-lg text-text-secondary leading-relaxed mt-3 sm:mt-4 max-w-2xl mx-auto font-medium">
                    4M is a CMMS software which streamlines maintenance operations providing comprehensive connectivity for maintenance activities.
                  </p>

                  <button
                    onClick={() => onCTA('cmms')}
                    className="mt-4 sm:mt-6 w-[180px] sm:w-[200px] h-[48px] sm:h-[56px] flex items-center justify-center bg-transparent text-accent-red border border-accent-red font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-accent-red/15 hover:bg-white/10 hover:border-white/50 hover:text-white hover:scale-[1.03] hover:shadow-xl hover:shadow-white/5 transition-all duration-300 cursor-pointer border-solid"
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
        className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-border-color bg-bg-secondary/40 backdrop-blur-md flex items-center justify-center text-text-secondary hover:text-white hover:border-white/20 transition-all duration-300 cursor-pointer z-20 group hover:bg-bg-secondary/80"
        aria-label="Previous Slide"
      >
        <span className="material-symbols-outlined text-lg sm:text-xl group-hover:-translate-x-0.5 transition-transform duration-200">chevron_left</span>
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-border-color bg-bg-secondary/40 backdrop-blur-md flex items-center justify-center text-text-secondary hover:text-white hover:border-white/20 transition-all duration-300 cursor-pointer z-20 group hover:bg-bg-secondary/80"
        aria-label="Next Slide"
      >
        <span className="material-symbols-outlined text-lg sm:text-xl group-hover:translate-x-0.5 transition-transform duration-200">chevron_right</span>
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
              className={`h-1.5 rounded-full cursor-pointer relative overflow-hidden transition-all duration-300 ${
                isActive ? 'w-16 bg-white/10' : 'w-3 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {isActive && isPlaying && (
                <motion.div
                  key={currentSlide}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 6, ease: 'linear' }}
                  className="absolute top-0 left-0 bottom-0 bg-accent-red rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
