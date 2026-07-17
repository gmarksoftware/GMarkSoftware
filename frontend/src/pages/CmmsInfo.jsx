import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/layout/Logo';
import logo4MImg from '@/assets/4M.png';
import cmmsImg from '@/assets/4M CMMS.webp';
import cmmsM from '@/assets/4M M.webp';
import manImg from '@/assets/4m_man.png';
import machineImg from '@/assets/4m_machine.png';
import methodImg from '@/assets/4m_method.png';
import materialImg from '@/assets/4m_material.png';
import { Users, Settings, ClipboardList, Package } from 'lucide-react';

export default function CmmsInfo({ onViewChange }) {
  const cmmsBenefits = [
    { name: "Reduced Equipment Downtime", icon: "arrow_downward" },
    { name: "Improved Asset Reliability", icon: "verified" },
    { name: "Better Workforce Management", icon: "groups" },
    { name: "Optimized Inventory Control", icon: "inventory" },
    { name: "Preventive Maintenance Planning", icon: "calendar_today" },
    { name: "Real-Time Monitoring & Reporting", icon: "monitoring" },
    { name: "Increased Operational Efficiency", icon: "trending_up", highlight: true }
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

                {/* Middle: CMMS Showcase Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-2xl select-none pointer-events-none shadow-lg">
                  <div className="bg-white p-1 rounded-lg flex items-center justify-center shadow-md w-8 h-8 shrink-0">
                    <img src={logo4MImg} alt="4M CMMS Logo" className="w-full h-full object-contain rounded-md" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-white font-bold text-xs sm:text-sm tracking-wide leading-tight">4M CMMS Platform</span>
                    <span className="text-[8px] sm:text-[9px] text-white/60 uppercase tracking-widest font-mono font-semibold">Smart Maintenance Through 4M</span>
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
              src={cmmsM} 
              alt="4M CMMS Platform Showcase Mobile" 
              className="block md:hidden w-full h-full object-cover object-center mx-auto transition-transform duration-500 group-hover:scale-[1.005]" 
            />

            {/* Desktop Showcase Image (Visible on md and larger screens) */}
            <img 
              src={cmmsImg} 
              alt="4M CMMS Platform Showcase Desktop" 
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
              @keyframes floatUp {
                0% { transform: translateY(30px); opacity: 0; }
                15% { opacity: 0.8; }
                85% { opacity: 0.8; }
                100% { transform: translateY(-70px); opacity: 0; }
              }
              @keyframes floatGently {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-12px) rotate(1.5deg); }
              }
              .animate-scanline {
                animation: scanline 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              }
              .animate-float-gently-1 { animation: floatGently 6s ease-in-out infinite; }
              .animate-float-gently-2 { animation: floatGently 8s ease-in-out infinite 1.5s; }
              .animate-float-gently-3 { animation: floatGently 7s ease-in-out infinite 3s; }
              .animate-float-gently-4 { animation: floatGently 9s ease-in-out infinite 0.5s; }
              .animate-float-gently-5 { animation: floatGently 7.5s ease-in-out infinite 2s; }
              .animate-float-gently-6 { animation: floatGently 8.5s ease-in-out infinite 4s; }
              
              .animate-float-1 { animation: floatUp 8s ease-in-out infinite; }
              .animate-float-2 { animation: floatUp 10s ease-in-out infinite 2s; }
              .animate-float-3 { animation: floatUp 9s ease-in-out infinite 4.5s; }
              
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

              .float-card {
                will-change: transform;
                backdrop-filter: none !important;
                background-color: rgba(5, 7, 13, 0.9) !important;
                box-shadow: none !important;
              }
              @media (min-width: 768px) {
                .float-card {
                  backdrop-filter: blur(4px) !important;
                  background-color: rgba(5, 7, 13, 0.65) !important;
                  box-shadow: 0 0 20px rgba(6, 182, 212, 0.15) !important;
                }
              }
            `}} />

            {/* Ambient High-Tech Telemetry Overlay (4M Theme) */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              {/* Scanline Sweep */}
              <div className="absolute left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-cyan-500/20 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-scanline" />

              {/* Floating Glowing Blueish Icon Cards in the Left Blank Space */}
              
              {/* Card 1: Robotic Arm (Machine) */}
              <div className="float-card absolute left-[34%] md:left-[8%] top-[47%] md:top-[41%] flex flex-col items-center justify-center p-2.5 md:p-4 rounded-2xl border border-cyan-500/20 animate-float-gently-1 w-20 h-20 md:w-32 md:h-32">
                <svg viewBox="0 0 100 100" className="w-10 h-10 md:w-16 md:h-16 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 20,80 L 80,80 M 35,80 L 35,70 L 65,70 L 65,80" />
                  <path d="M 50,70 L 40,45" />
                  <circle cx="50" cy="70" r="3.5" fill="currentColor" />
                  <circle cx="40" cy="45" r="3.5" fill="currentColor" />
                  <path d="M 40,45 L 65,30" />
                  <circle cx="65" cy="30" r="3" fill="currentColor" />
                  <path d="M 65,30 L 75,30" />
                  <path d="M 75,22 C 78,25 78,35 75,38" />
                </svg>
                <span className="text-[8px] md:text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase mt-1.5 md:mt-2">Machine</span>
              </div>

              {/* Card 7: Connected Worker (Man) */}
              <div className="float-card absolute left-[6%] md:left-[27%] top-[27%] md:top-[19%] flex flex-col items-center justify-center p-2.5 md:p-4 rounded-2xl border border-cyan-500/20 animate-float-gently-3 w-20 h-20 md:w-32 md:h-32">
                <svg viewBox="0 0 100 100" className="w-10 h-10 md:w-16 md:h-16 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="50" cy="35" r="12" />
                  <path d="M 25,75 C 25,58 35,52 50,52 C 65,52 75,58 75,75" />
                  <circle cx="28" cy="68" r="2.5" fill="currentColor" />
                  <circle cx="72" cy="68" r="2.5" fill="currentColor" />
                  <line x1="50" y1="35" x2="28" y2="68" opacity="0.4" />
                  <line x1="50" y1="35" x2="72" y2="68" opacity="0.4" />
                </svg>
                <span className="text-[8px] md:text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase mt-1.5 md:mt-2">Man</span>
              </div>

              {/* Card 2: AI Chip (Method) */}
              <div className="float-card absolute left-[10%] md:left-[27%] top-[41%] md:top-[36%] flex flex-col items-center justify-center p-2.5 md:p-4 rounded-2xl border border-cyan-500/20 animate-float-gently-2 w-20 h-20 md:w-32 md:h-32">
                <svg viewBox="0 0 100 100" className="w-10 h-10 md:w-16 md:h-16 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="30" y="30" width="40" height="40" rx="4" />
                  <path d="M 20,40 L 30,40 M 20,50 L 30,50 M 20,60 L 30,60" />
                  <path d="M 70,40 L 80,40 M 70,50 L 80,50 M 70,60 L 80,60" />
                  <path d="M 40,20 L 40,30 M 50,20 L 50,30 M 60,20 L 60,30" />
                  <path d="M 40,70 L 40,80 M 50,70 L 50,80 M 60,70 L 60,80" />
                  <text x="50" y="57" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="sans-serif" fontSize="16" fontWeight="bold">AI</text>
                </svg>
                <span className="text-[8px] md:text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase mt-1.5 md:mt-2">Method</span>
              </div>

              {/* Card 3: 4.0 Gear (CMMS 4.0) */}
              <div className="float-card absolute left-[8%] md:left-[6%] top-[75%] md:top-[68%] flex flex-col items-center justify-center p-2.5 md:p-4 rounded-2xl border border-cyan-500/20 animate-float-gently-3 w-20 h-20 md:w-32 md:h-32">
                <svg viewBox="0 0 100 100" className="w-10 h-10 md:w-16 md:h-16 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="50" cy="50" r="28" />
                  <path d="M 50,15 L 50,22 M 50,78 L 50,85 M 15,50 L 22,50 M 78,50 L 85,50" />
                  <path d="M 25,25 L 30,30 M 70,70 L 75,75 M 25,75 L 30,70 M 70,25 L 75,30" />
                  <path d="M 38,18 L 41,24 M 62,18 L 59,24 M 38,82 L 41,76 M 62,82 L 59,76" />
                  <path d="M 18,38 L 24,41 M 18,62 L 24,59 M 82,38 L 76,41 M 82,62 L 76,59" />
                  <circle cx="50" cy="50" r="16" fill="black" opacity="0.3" />
                  <text x="50" y="56" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="sans-serif" fontSize="12" fontWeight="extrabold">4.0</text>
                </svg>
                <span className="text-[8px] md:text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase mt-1.5 md:mt-2">CMMS 4.0</span>
              </div>

              {/* Card 4: Cloud Data Sync (Material) */}
              <div className="float-card absolute left-[30%] md:left-[25%] top-[64%] md:top-[63%] flex flex-col items-center justify-center p-2.5 md:p-4 rounded-2xl border border-cyan-500/20 animate-float-gently-4 w-20 h-20 md:w-32 md:h-32">
                <svg viewBox="0 0 100 100" className="w-10 h-10 md:w-16 md:h-16 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 25,65 A 15,15 0 0 1 35,38 A 20,20 0 0 1 70,42 A 15,15 0 0 1 75,65 Z" />
                  <path d="M 45,48 L 45,68 M 45,48 L 41,53 M 45,48 L 49,53" />
                  <path d="M 55,68 L 55,48 M 55,68 L 51,63 M 55,68 L 59,63" />
                </svg>
                <span className="text-[8px] md:text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase mt-1.5 md:mt-2">Material</span>
              </div>

              {/* Card 5: Shield with Lock (Security) */}
              <div className="float-card absolute left-[30%] md:left-[16%] top-[32%] md:top-[24%] flex flex-col items-center justify-center p-2 md:p-3 rounded-xl border border-cyan-500/10 animate-float-gently-5 w-[76px] h-[76px] md:w-28 md:h-28">
                <svg viewBox="0 0 100 100" className="w-9 h-9 md:w-14 md:h-14 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 50,15 C 65,15 78,22 78,35 C 78,60 62,75 50,85 Z" />
                  <rect x="40" y="46" width="20" height="14" rx="2" fill="currentColor" opacity="0.3" />
                  <path d="M 45,46 L 45,40 C 45,35 55,35 55,40 L 55,46" />
                </svg>
                <span className="text-[7px] md:text-[9px] text-cyan-400/60 font-mono tracking-widest uppercase mt-1 md:mt-1.5">Security</span>
              </div>

              {/* Card 6: Analytics Chart */}
              <div className="float-card absolute left-[4%] md:left-[16%] top-[56%] md:top-[56%] flex flex-col items-center justify-center p-2 md:p-3 rounded-xl border border-cyan-500/10 animate-float-gently-6 w-[76px] h-[76px] md:w-28 md:h-28">
                <svg viewBox="0 0 100 100" className="w-9 h-9 md:w-14 md:h-14 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="25" y="55" width="8" height="25" rx="1" fill="currentColor" opacity="0.3" />
                  <rect x="40" y="45" width="8" height="35" rx="1" fill="currentColor" opacity="0.3" />
                  <rect x="55" y="35" width="8" height="45" rx="1" fill="currentColor" opacity="0.3" />
                  <rect x="70" y="25" width="8" height="55" rx="1" fill="currentColor" opacity="0.3" />
                  <path d="M 20,65 L 35,55 L 50,42 L 65,48 L 80,28" strokeWidth="3" />
                  <circle cx="80" cy="28" r="4" fill="currentColor" />
                </svg>
                <span className="text-[7px] md:text-[9px] text-cyan-400/60 font-mono tracking-widest uppercase mt-1 md:mt-1.5">Analytics</span>
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
          
          {/* Intro Section & Back Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
            <motion.div 
              className="max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold font-title text-white">
                <span className="text-accent-red">four</span> critical elements of operations:
              </h2>
            </motion.div>

            {/* Back button removed in favor of swipe-back gesture */}
          </div>

        {/* Content Panels: The 4 Ms */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Card 1: Man */}
          <motion.div 
            variants={itemVariants} 
            className="glass-panel shine-sweep rounded-2xl border border-white/5 hover:border-accent-red/30 transition-all duration-300 relative group flex flex-col overflow-hidden bg-gradient-to-br from-white/[0.01] to-[#0A0C12] hover:shadow-[0_0_30px_rgba(255,90,95,0.03)]"
          >
            <div className="absolute top-0 left-0 w-[2px] h-full bg-accent-red/20 group-hover:bg-accent-red group-hover:shadow-[0_0_8px_#FF5A5F] transition-all duration-300 z-30" />
            
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <img src={manImg} alt="Man" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
                <div className="w-14 h-14 rounded-full bg-[#0d111b] border-2 border-accent-red/30 flex items-center justify-center text-accent-red shadow-[0_0_15px_rgba(255,90,95,0.25)] group-hover:shadow-[0_0_25px_rgba(255,90,95,0.45)] group-hover:border-accent-red transition-all duration-300">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-6 pt-10 flex flex-col justify-between flex-1 relative z-10">
              <div>
                <h3 className="text-xl font-bold font-title text-white mb-2">Man</h3>
                <div className="w-8 h-[2px] bg-accent-red mb-4" />
                <p className="text-sm text-text-secondary leading-relaxed font-sans">
                  Manage workforce performance, technician assignments, skill tracking, attendance, and maintenance responsibilities to improve productivity and accountability.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Machine */}
          <motion.div 
            variants={itemVariants} 
            className="glass-panel shine-sweep rounded-2xl border border-white/5 hover:border-accent-red/30 transition-all duration-300 relative group flex flex-col overflow-hidden bg-gradient-to-br from-white/[0.01] to-[#0A0C12] hover:shadow-[0_0_30px_rgba(255,90,95,0.03)]"
          >
            <div className="absolute top-0 left-0 w-[2px] h-full bg-accent-red/20 group-hover:bg-accent-red group-hover:shadow-[0_0_8px_#FF5A5F] transition-all duration-300 z-30" />
            
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <img src={machineImg} alt="Machine" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
                <div className="w-14 h-14 rounded-full bg-[#0d111b] border-2 border-accent-red/30 flex items-center justify-center text-accent-red shadow-[0_0_15px_rgba(255,90,95,0.25)] group-hover:shadow-[0_0_25px_rgba(255,90,95,0.45)] group-hover:border-accent-red transition-all duration-300">
                  <Settings className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-6 pt-10 flex flex-col justify-between flex-1 relative z-10">
              <div>
                <h3 className="text-xl font-bold font-title text-white mb-2">Machine</h3>
                <div className="w-8 h-[2px] bg-accent-red mb-4" />
                <p className="text-sm text-text-secondary leading-relaxed font-sans">
                  Monitor equipment health, schedule preventive maintenance, reduce downtime, track breakdowns, and extend asset life.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Method */}
          <motion.div 
            variants={itemVariants} 
            className="glass-panel shine-sweep rounded-2xl border border-white/5 hover:border-accent-red/30 transition-all duration-300 relative group flex flex-col overflow-hidden bg-gradient-to-br from-white/[0.01] to-[#0A0C12] hover:shadow-[0_0_30px_rgba(255,90,95,0.03)]"
          >
            <div className="absolute top-0 left-0 w-[2px] h-full bg-accent-red/20 group-hover:bg-accent-red group-hover:shadow-[0_0_8px_#FF5A5F] transition-all duration-300 z-30" />
            
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <img src={methodImg} alt="Method" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
                <div className="w-14 h-14 rounded-full bg-[#0d111b] border-2 border-accent-red/30 flex items-center justify-center text-accent-red shadow-[0_0_15px_rgba(255,90,95,0.25)] group-hover:shadow-[0_0_25px_rgba(255,90,95,0.45)] group-hover:border-accent-red transition-all duration-300">
                  <ClipboardList className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-6 pt-10 flex flex-col justify-between flex-1 relative z-10">
              <div>
                <h3 className="text-xl font-bold font-title text-white mb-2">Method</h3>
                <div className="w-8 h-[2px] bg-accent-red mb-4" />
                <p className="text-sm text-text-secondary leading-relaxed font-sans">
                  Standardize maintenance procedures, work orders, inspection checklists, SOPs, and compliance processes for consistent operations.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Material */}
          <motion.div 
            variants={itemVariants} 
            className="glass-panel shine-sweep rounded-2xl border border-white/5 hover:border-accent-red/30 transition-all duration-300 relative group flex flex-col overflow-hidden bg-gradient-to-br from-white/[0.01] to-[#0A0C12] hover:shadow-[0_0_30px_rgba(255,90,95,0.03)]"
          >
            <div className="absolute top-0 left-0 w-[2px] h-full bg-accent-red/20 group-hover:bg-accent-red group-hover:shadow-[0_0_8px_#FF5A5F] transition-all duration-300 z-30" />
            
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <img src={materialImg} alt="Material" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
                <div className="w-14 h-14 rounded-full bg-[#0d111b] border-2 border-accent-red/30 flex items-center justify-center text-accent-red shadow-[0_0_15px_rgba(255,90,95,0.25)] group-hover:shadow-[0_0_25px_rgba(255,90,95,0.45)] group-hover:border-accent-red transition-all duration-300">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-6 pt-10 flex flex-col justify-between flex-1 relative z-10">
              <div>
                <h3 className="text-xl font-bold font-title text-white mb-2">Material</h3>
                <div className="w-8 h-[2px] bg-accent-red mb-4" />
                <p className="text-sm text-text-secondary leading-relaxed font-sans">
                  Track spare parts inventory, material consumption, stock levels, procurement, and availability to prevent maintenance delays.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Key Benefits Banner */}
        <motion.div 
          className="glass-panel shine-sweep p-8 rounded-2xl border border-white/5 hover:border-accent-red/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,90,95,0.02)] relative overflow-hidden bg-gradient-to-br from-white/[0.01] to-[#0A0C12]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="absolute top-0 left-0 w-[2px] h-full bg-accent-red/20 group-hover:bg-accent-red group-hover:shadow-[0_0_8px_#FF5A5F] transition-all duration-300" />
          
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-white">Key Benefits</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cmmsBenefits.map((ind, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 hover:scale-[1.02] group hover:shadow-[0_0_25px_rgba(255,90,95,0.05)] ${
                  ind.highlight 
                    ? 'bg-accent-red/10 border-accent-red/20 hover:border-accent-red/40 hover:bg-accent-red/15' 
                    : 'bg-gradient-to-br from-white/[0.02] to-transparent border-white/5 hover:border-accent-red/30 hover:bg-white/[0.04]'
                } ${idx === 6 ? 'sm:col-span-2 lg:col-span-2' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl bg-accent-red/5 border border-accent-red/10 flex items-center justify-center text-accent-red shadow-[0_0_12px_rgba(255,90,95,0.05)] group-hover:scale-110 group-hover:bg-accent-red/10 group-hover:border-accent-red/30 transition-all duration-300 shrink-0">
                  <span className="material-symbols-outlined text-xl">{ind.icon}</span>
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
