import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/layout/Logo';
import gramUnnatiLogoImg from '@/assets/gramunnati.png';
import visionImg from '@/assets/gramunnati_vision.png';
import missionImg from '@/assets/gramunnati_mission.png';
import aboutImg from '@/assets/gramunnati_about.png';
import gramUnnatiImg from '@/assets/Gramunnati1.png';
import gramUnnatiM from '@/assets/gramunnati_m.webp';


export default function GramUnnatiInfo({ onViewChange }) {
  const platformBenefits = [
    { name: "Higher Income", icon: "payments" },
    { name: "Fair Prices", icon: "balance" },
    { name: "Direct Access", icon: "storefront" },
    { name: "Financial Inclusion", icon: "currency_exchange" },
    { name: "Sustainable", icon: "spa" },
    { name: "Employment", icon: "groups_3" },
    { name: "Atmanirbhar", icon: "flag", highlight: true }
  ];

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
            <div className="absolute top-0 left-0 right-0 z-30 bg-linear-to-b from-black/80 via-black/30 to-transparent pt-6 sm:pt-8 pb-20 px-6 md:px-12">
              <div className="relative flex items-center justify-between w-full">
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange('home');
                  }}
                  className="no-underline shrink-0 focus:outline-none"
                >
                  <Logo />
                </a>

                {/* Middle: GramUnnati Showcase Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-2xl select-none pointer-events-none shadow-lg">
                  <div className="bg-white p-1 rounded-lg flex items-center justify-center shadow-md w-8 h-8 shrink-0">
                    <img src={gramUnnatiLogoImg} alt="GramUnnati Logo" className="w-full h-full object-contain rounded-md" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-white font-bold text-xs sm:text-sm tracking-wide leading-tight">GramUnnati</span>
                    <span className="text-[8px] sm:text-[9px] text-white/60 uppercase tracking-widest font-mono font-semibold">Empowering Rural India. Enriching Lives.</span>
                  </div>
                </div>

                {/* Back button for mobile viewports (opposite right corner) */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewChange('home');
                  }}
                  className="flex sm:hidden items-center justify-center border border-white/20 hover:border-white/40 bg-black/40 hover:bg-black/60 backdrop-blur-sm p-2 rounded-full transition-all duration-300 w-10 h-10 cursor-pointer text-white drop-shadow-md z-40"
                  aria-label="Back to Home"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
              </div>
            </div>


            {/* Mobile Showcase Image (Only visible on screens smaller than md) */}
            <img 
              src={gramUnnatiM} 
              alt="GramUnnati Showcase Mobile" 
              className="block md:hidden w-full h-full object-cover object-center mx-auto transition-transform duration-500 group-hover:scale-[1.005]" 
            />

            {/* Desktop Showcase Image (Visible on md and larger screens) */}
            <img 
              src={gramUnnatiImg} 
              alt="GramUnnati Showcase Desktop" 
              className="hidden md:block w-full h-full object-cover object-center mx-auto transition-transform duration-500 group-hover:scale-[1.005]" 
            />

            {/* Custom Telemetry and HUD Animations */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes scanline {
                0% { top: -10%; opacity: 0; }
                5% { opacity: 0.3; }
                95% { opacity: 0.3; }
                100% { top: 110%; opacity: 0; }
              }
              .animate-scanline {
                animation: scanline 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              }
              
              .shine-sweep {
                position: relative;
                overflow: hidden;
              }
              .shine-sweep::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -60%;
                width: 30%;
                height: 200%;
                background: linear-gradient(
                  to right,
                  rgba(255, 255, 255, 0) 0%,
                  rgba(255, 255, 255, 0.08) 50%,
                  rgba(255, 255, 255, 0) 100%
                );
                transform: rotate(25deg);
                transition: all 0.75s ease;
              }
              .shine-sweep:hover::after {
                left: 120%;
              }
            `}} />

            {/* Ambient High-Tech Telemetry Overlay (GramUnnati Theme) */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              {/* Scanline Sweep */}
              <div className="absolute left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-emerald-500/20 to-transparent shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-scanline" />
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

            {/* Back button removed in favor of swipe-back gesture */}
          </div>

          {/* Content Panels */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
          {/* Panel 1: Our Vision */}
          <motion.div variants={itemVariants} className="glass-panel shine-sweep p-6 rounded-2xl border border-white/5 hover:border-accent-red/30 transition-all duration-300 relative group flex flex-col justify-between hover:shadow-[0_0_30px_rgba(255,90,95,0.03)] bg-gradient-to-br from-white/[0.01] to-[#0A0C12]">
            <div className="absolute top-0 left-0 w-[2px] h-full bg-accent-red/20 group-hover:bg-accent-red group-hover:shadow-[0_0_8px_#FF5A5F] transition-all duration-300" />
            <div>
              <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 border border-white/10 group-hover:border-accent-red/30 transition-all duration-300">
                <img src={visionImg} alt="Our Vision" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="text-xl font-bold font-title text-white mb-4">Our Vision</h3>
              <p className="text-sm text-text-secondary leading-relaxed font-sans">
                To create an <strong className="text-white font-semibold">Atmanirbhar</strong> and <strong className="text-white font-semibold">Prosperous</strong> rural Bharat where each family can earn a living with <strong className="text-accent-red font-semibold">Dignity</strong> in their own village, ensuring there is no need to migrate.
              </p>
            </div>
          </motion.div>

          {/* Panel 2: Our Mission */}
          <motion.div variants={itemVariants} className="glass-panel shine-sweep p-6 rounded-2xl border border-white/5 hover:border-accent-red/30 transition-all duration-300 relative group flex flex-col justify-between hover:shadow-[0_0_30px_rgba(255,90,95,0.03)] bg-gradient-to-br from-white/[0.01] to-[#0A0C12]">
            <div className="absolute top-0 left-0 w-[2px] h-full bg-accent-red/20 group-hover:bg-accent-red group-hover:shadow-[0_0_8px_#FF5A5F] transition-all duration-300" />
            <div>
              <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 border border-white/10 group-hover:border-accent-red/30 transition-all duration-300">
                <img src={missionImg} alt="Our Mission" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="text-xl font-bold font-title text-white mb-4">Our Mission</h3>
              <p className="text-sm text-text-secondary leading-relaxed font-sans">
                Creating a <strong className="text-white font-semibold">Digital marketplace</strong> to bring together Rural Entrepreneurs, women's self-help groups (SHGs), and Rural Entrepreneurs to deliver their products directly to Consumers — thereby creating fair prices, sustainable income, and local employment.
              </p>
            </div>
          </motion.div>

          {/* Panel 3: About Us */}
          <motion.div variants={itemVariants} className="glass-panel shine-sweep p-6 rounded-2xl border border-white/5 hover:border-accent-red/30 transition-all duration-300 relative group flex flex-col justify-between hover:shadow-[0_0_30px_rgba(255,90,95,0.03)] bg-gradient-to-br from-white/[0.01] to-[#0A0C12]">
            <div className="absolute top-0 left-0 w-[2px] h-full bg-accent-red/20 group-hover:bg-accent-red group-hover:shadow-[0_0_8px_#FF5A5F] transition-all duration-300" />
            <div>
              <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 border border-white/10 group-hover:border-accent-red/30 transition-all duration-300">
                <img src={aboutImg} alt="About Us" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="text-xl font-bold font-title text-white mb-4">About Us</h3>
              <ul className="space-y-3.5 text-sm text-text-secondary font-sans list-none p-0">
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-accent-red mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12.5 2.5 2.5 5-5" />
                  </svg>
                  <span>E-commerce marketplace for SHG and rural products.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-accent-red mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12.5 2.5 2.5 5-5" />
                  </svg>
                  <span>Provide logistics, branding, and digital promotion support.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-accent-red mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12.5 2.5 2.5 5-5" />
                  </svg>
                  <span>Training on quality, pricing, and packaging.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-accent-red mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12.5 2.5 2.5 5-5" />
                  </svg>
                  <span>Direct payment and transparent system with higher profits.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>



        {/* Third Row: Key Benefits Banner */}
        <motion.div 
          className="glass-panel shine-sweep p-8 rounded-2xl border border-white/5 hover:border-accent-red/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,90,95,0.02)] relative overflow-hidden bg-gradient-to-br from-white/[0.01] to-[#0A0C12]"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="absolute top-0 left-0 w-[2px] h-full bg-accent-red/20 group-hover:bg-accent-red group-hover:shadow-[0_0_8px_#FF5A5F] transition-all duration-300" />
          
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-white">Key Platform Benefits</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 text-center">
            {platformBenefits.map((ind, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-xl border flex flex-col items-center justify-center gap-3 text-center transition-all duration-300 hover:scale-[1.03] group hover:shadow-[0_0_25px_rgba(255,90,95,0.05)] ${
                  ind.highlight 
                    ? 'bg-accent-red/10 border-accent-red/20 hover:border-accent-red/40 hover:bg-accent-red/15' 
                    : 'bg-gradient-to-br from-white/[0.02] to-transparent border-white/5 hover:border-accent-red/30 hover:bg-white/[0.04]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-red/5 border border-accent-red/10 flex items-center justify-center text-accent-red shadow-[0_0_15px_rgba(255,90,95,0.05)] group-hover:scale-110 group-hover:bg-accent-red/10 group-hover:border-accent-red/30 transition-all duration-300">
                  <span className="material-symbols-outlined text-2xl">{ind.icon}</span>
                </div>
                <span className="text-xs font-bold text-white leading-tight font-sans">{ind.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>



    </div>
  );
}
