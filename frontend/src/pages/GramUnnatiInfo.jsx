import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gramUnnatiLogoImg from '@/assets/gramunnati.png';
import gramunnati from '@/assets/Gramunnati1.png';
import gramunnatiM from '@/assets/gramunnati_m.webp';


export default function GramUnnatiInfo({ onViewChange }) {
  const [mobileLoaded, setMobileLoaded] = useState(false);
  const [desktopLoaded, setDesktopLoaded] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="relative min-h-screen md:h-screen md:overflow-y-auto overflow-x-hidden bg-bg-primary text-text-primary select-text scroll-smooth md:snap-y md:snap-mandatory">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(255,90,95,0.05), transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 10% 80%, rgba(156,204,60,0.03), transparent 50%)' }} />

      <div className="w-full h-screen relative z-10 md:snap-start shrink-0">
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="w-full h-full overflow-hidden shadow-2xl border-b border-white/10 bg-[#05070D] group relative"
          >
            {/* Header Overlay (Positioned absolutely on top of the image) */}
            <div className="absolute top-0 left-0 right-0 z-30 bg-linear-to-b from-black/80 via-black/30 to-transparent pt-6 sm:pt-10 pb-20 px-6 md:px-8">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-start sm:items-center gap-5 pr-24 sm:pr-0 sm:-ml-8">
                  <div className="bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-lg w-[70px] h-[70px] shrink-0">
                    <img src={gramUnnatiLogoImg} alt="GramUnnati Logo" className="w-full h-full object-contain rounded-xl" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-3xl font-extrabold font-title tracking-tight leading-tight sm:leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">GramUnnati</h1>
                    <p className="text-xs sm:text-xs text-white/90 mt-1.5 uppercase font-mono tracking-wider sm:tracking-widest font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">Empowering Rural India. Enriching Lives.</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening the lightbox when clicking the back button
                  onViewChange('home');
                  setTimeout(() => {
                    const el = document.getElementById('systems-spotlight');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="absolute top-6 right-6 sm:top-10 sm:right-8 lg:right-12 flex items-center justify-center gap-1 sm:gap-1.5 border border-white/20 hover:border-white/40 bg-black/40 hover:bg-black/60 backdrop-blur-sm px-2 py-0.5 sm:px-5 sm:py-2.5 rounded-md sm:rounded-xl text-[9px] sm:text-sm font-semibold transition-all duration-300 w-fit cursor-pointer text-white drop-shadow-md z-40"
              >
                <span className="material-symbols-outlined text-xs sm:text-base">arrow_back</span>
                <span className="hidden sm:inline">Back to Home</span>
              </button>
            </div>


            {/* Smooth Skeleton / Loading Spinner */}
            <div className={`absolute inset-0 z-10 bg-[#05070D] flex items-center justify-center transition-opacity duration-700 pointer-events-none ${
              (mobileLoaded || desktopLoaded) ? 'opacity-0' : 'opacity-100'
            }`}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <p className="text-emerald-500/80 font-mono text-xs tracking-widest uppercase">Initializing Digital Farm Grid...</p>
              </div>
            </div>

            {/* Mobile Showcase Image (Only visible on screens smaller than md) */}
            <img 
              src={gramunnatiM} 
              alt="GramUnnati Platform Showcase Mobile" 
              decoding="async"
              onLoad={() => setMobileLoaded(true)}
              className={`block md:hidden w-full h-full object-cover object-center mx-auto transition-all duration-700 group-hover:scale-[1.005] ${
                mobileLoaded ? 'opacity-100' : 'opacity-0 scale-[1.02]'
              }`} 
            />

            {/* Desktop Showcase Image (Visible on md and larger screens) */}
            <img 
              src={gramunnati} 
              alt="GramUnnati Platform Showcase Desktop" 
              decoding="async"
              onLoad={() => setDesktopLoaded(true)}
              className={`hidden md:block w-full h-full object-cover object-center mx-auto transition-all duration-[1.2s] cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-[1.015] ${
                desktopLoaded ? 'opacity-100' : 'opacity-0 scale-[1.02]'
              }`} 
            />

            {/* Custom Telemetry and HUD Animations */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes scanline {
                0% { top: -10%; opacity: 0; }
                5% { opacity: 0.4; }
                95% { opacity: 0.4; }
                100% { top: 110%; opacity: 0; }
              }
              @keyframes floatUp {
                0% { transform: translateY(40px); opacity: 0; }
                15% { opacity: 0.8; }
                85% { opacity: 0.8; }
                100% { transform: translateY(-80px); opacity: 0; }
              }
              @keyframes pulseSlow {
                0%, 100% { transform: scale(1); opacity: 0.3; }
                50% { transform: scale(1.15); opacity: 0.7; }
              }
              @keyframes spinClockwise {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes spinCounterClockwise {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(-360deg); }
              }
              .animate-scanline {
                animation: scanline 9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              }
              .animate-float-1 { animation: floatUp 8s ease-in-out infinite; }
              .animate-float-2 { animation: floatUp 10s ease-in-out infinite 2s; }
              .animate-float-3 { animation: floatUp 9s ease-in-out infinite 4.5s; }
              .animate-float-4 { animation: floatUp 11s ease-in-out infinite 1s; }
              .animate-float-5 { animation: floatUp 9.5s ease-in-out infinite 3.5s; }
              
              .animate-spin-slow {
                animation: spinClockwise 45s linear infinite;
              }
              .animate-spin-reverse {
                animation: spinCounterClockwise 30s linear infinite;
              }
            `}} />

            {/* Ambient Agricultural Grid & Telemetry Overlay */}
            <div className={`absolute inset-0 z-20 pointer-events-none overflow-hidden transition-opacity duration-1000 ${
              (mobileLoaded || desktopLoaded) ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Scanline Sweep */}
              <div className="absolute left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-emerald-500/20 to-transparent shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-scanline" />

              {/* Glowing Concentric Farm Drone Radar (Weather/Soil mapping scanner overlaying the rural landscape) */}
              <div className="hidden md:flex absolute left-[8%] md:left-[16%] top-[30%] md:top-[38%] -translate-y-1/2 items-center justify-center w-48 h-48 md:w-72 md:h-72">
                <div className="absolute w-full h-full border border-emerald-500/10 rounded-full animate-spin-slow" style={{ borderStyle: 'dashed' }} />
                <div className="absolute w-[80%] h-[80%] border border-emerald-500/15 rounded-full animate-spin-reverse" style={{ borderStyle: 'dotted' }} />
                <div className="absolute w-[60%] h-[60%] border border-emerald-500/20 rounded-full animate-ping [animation-duration:6s]" />
                <div className="absolute w-[30%] h-[30%] bg-emerald-500/5 rounded-full border border-emerald-500/30 animate-pulse" />
              </div>

              {/* Glowing Concentric Cargo Logistics Radar (on the right road) */}
              <div className="hidden md:flex absolute right-[5%] md:right-[15%] top-[55%] md:top-[60%] -translate-y-1/2 items-center justify-center w-40 h-40 md:w-64 md:h-64">
                <div className="absolute w-full h-full border border-amber-500/10 rounded-full animate-spin-slow" style={{ borderStyle: 'dashed' }} />
                <div className="absolute w-[80%] h-[80%] border border-amber-500/15 rounded-full animate-spin-reverse" style={{ borderStyle: 'dotted' }} />
                <div className="absolute w-[50%] h-[50%] border border-amber-500/20 rounded-full animate-ping [animation-duration:4s]" />
              </div>



              {/* Pulsing Hotspot Nodes over critical farm/vehicle coordinates */}
              {/* Tractor Node */}
              <div className="absolute left-[9%] md:left-[11%] top-[62%] md:top-[65%] w-1.5 md:w-3.5 h-1.5 md:h-3.5 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.9)]">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              </div>
              {/* Rural House Node */}
              <div className="absolute left-[26%] md:left-[30.5%] top-[56%] md:top-[59%] w-1 md:w-2.5 h-1 md:h-2.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping [animation-duration:2.5s]" />
              </div>
              {/* Grains Basket Node */}
              <div className="absolute left-[44%] md:left-[45.5%] top-[76%] md:top-[80%] w-1 md:w-2.5 h-1 md:h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping [animation-duration:3s]" />
              </div>
              {/* Milk Can Node */}
              <div className="absolute left-[59%] md:left-[62.8%] top-[73%] md:top-[77%] w-1 md:w-2.5 h-1 md:h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping [animation-duration:2.8s]" />
              </div>
              {/* Logistics Truck Node */}
              <div className="absolute right-[14%] md:right-[18.2%] top-[65%] md:top-[68%] w-1.5 md:w-3.5 h-1.5 md:h-3.5 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.9)]">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
              </div>
            </div>

          </motion.div>
        </div>

        <div className="w-full min-h-screen md:snap-start relative z-10 shrink-0">
          <motion.div 
            id="details-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-6 md:px-8 pt-10 pb-24 space-y-16"
          >
          {/* Header Navigation */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
            <motion.div 
              className="max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-lg text-text-secondary leading-relaxed font-sans">
                Smart solutions for smarter villages.<br />
                <span className="text-white font-semibold">Empowering growth, one community at a time.</span>
              </p>
            </motion.div>

            <button 
              onClick={() => {
                onViewChange('home');
                setTimeout(() => {
                  const el = document.getElementById('systems-spotlight');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="flex items-center justify-center gap-1.5 border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 w-fit cursor-pointer text-white shrink-0 self-end md:self-auto"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">arrow_back</span>
              <span className="hidden sm:inline">Back to Home</span>
            </button>
          </div>

          {/* Content Panels */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
          {/* Panel 1: Our Vision */}
          <motion.div variants={itemVariants} className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-accent-red/20 transition-all duration-300 relative group flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent-red/20 group-hover:bg-accent-red transition-all duration-300" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red mb-6">
                <span className="material-symbols-outlined text-2xl">visibility</span>
              </div>
              <h3 className="text-xl font-bold font-title text-white mb-4">Our Vision</h3>
              <p className="text-sm text-text-secondary leading-relaxed font-sans">
                To create an <strong className="text-white font-semibold">Atmanirbhar</strong> and <strong className="text-white font-semibold">Prosperous</strong> rural Bharat where each family can earn a living with <strong className="text-accent-red font-semibold">Dignity</strong> in their own village, ensuring there is no need to migrate.
              </p>
            </div>
          </motion.div>

          {/* Panel 2: Our Mission */}
          <motion.div variants={itemVariants} className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-accent-red/20 transition-all duration-300 relative group flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent-red/20 group-hover:bg-accent-red transition-all duration-300" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red mb-6">
                <span className="material-symbols-outlined text-2xl">track_changes</span>
              </div>
              <h3 className="text-xl font-bold font-title text-white mb-4">Our Mission</h3>
              <p className="text-sm text-text-secondary leading-relaxed font-sans">
                Creating a <strong className="text-white font-semibold">Digital marketplace</strong> to bring together Rural Entrepreneurs, women's self-help groups (SHGs), and Rural Entrepreneurs to deliver their products directly to Consumers — thereby creating fair prices, sustainable income, and local employment.
              </p>
            </div>
          </motion.div>

          {/* Panel 3: About Us */}
          <motion.div variants={itemVariants} className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-accent-red/20 transition-all duration-300 relative group flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent-red/20 group-hover:bg-accent-red transition-all duration-300" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red mb-6">
                <span className="material-symbols-outlined text-2xl">info</span>
              </div>
              <h3 className="text-xl font-bold font-title text-white mb-4">About Us</h3>
              <ul className="space-y-3.5 text-sm text-text-secondary font-sans list-none p-0">
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-accent-red text-base mt-0.5">check_circle</span>
                  <span>E-commerce marketplace for SHG and rural products.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-accent-red text-base mt-0.5">check_circle</span>
                  <span>Provide logistics, branding, and digital promotion support.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-accent-red text-base mt-0.5">check_circle</span>
                  <span>Training on quality, pricing, and packaging.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-accent-red text-base mt-0.5">check_circle</span>
                  <span>Direct payment and transparent system with higher profits.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>



        {/* Third Row: Key Benefits Banner */}
        <motion.div 
          className="glass-panel p-8 rounded-2xl border border-white/5 relative overflow-hidden"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-accent-red" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-accent-red mb-6">Key Platform Benefits</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 text-center">
            
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-accent-red">payments</span>
              <span className="text-xs font-bold text-white leading-tight">Higher Income</span>
            </div>

            <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-accent-red">balance</span>
              <span className="text-xs font-bold text-white leading-tight">Fair Prices</span>
            </div>

            <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-accent-red">storefront</span>
              <span className="text-xs font-bold text-white leading-tight">Direct Access</span>
            </div>

            <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-accent-red">currency_exchange</span>
              <span className="text-xs font-bold text-white leading-tight">Financial Inclusion</span>
            </div>

            <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-accent-red">spa</span>
              <span className="text-xs font-bold text-white leading-tight">Sustainable</span>
            </div>

            <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-accent-red">groups_3</span>
              <span className="text-xs font-bold text-white leading-tight">Employment</span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 bg-accent-red/10 border border-accent-red/20 rounded-xl flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-accent-red">flag</span>
              <span className="text-xs font-bold text-white leading-tight">Atmanirbhar</span>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </div>



    </div>
  );
}
