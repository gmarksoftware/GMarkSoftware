import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/layout/Logo';
import iot from '@/assets/IOT.webp';
import iotM from '@/assets/IOT M.webp';
import iotMonitoring from '@/assets/iot_monitoring.png';
import iotDevice from '@/assets/iot_device.png';
import iotPredictive from '@/assets/iot_predictive.png';
import iotAnalytics from '@/assets/iot_analytics.png';
import iotAlerts from '@/assets/iot_alerts.png';
import iotSecure from '@/assets/iot_secure.png';

export default function IotInfo({ onViewChange }) {

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

  const features = [
    {
      title: "Real-Time Monitoring",
      description: "Track machine performance, production status, energy consumption, and equipment health from anywhere.",
      image: iotMonitoring
    },
    {
      title: "Remote Device Management",
      description: "Monitor and control connected assets remotely, reducing downtime and operational costs.",
      image: iotDevice
    },
    {
      title: "Predictive Maintenance",
      description: "Detect potential failures before they occur using sensor data and intelligent analytics.",
      image: iotPredictive
    },
    {
      title: "Data Analytics & Insights",
      description: "Transform operational data into actionable insights through dashboards, reports, and performance metrics.",
      image: iotAnalytics
    },
    {
      title: "Smart Alerts & Notifications",
      description: "Receive instant alerts for equipment faults, abnormal conditions, and critical events.",
      image: iotAlerts
    },
    {
      title: "Secure Connectivity",
      description: "Ensure reliable and secure communication between devices, machines, and cloud platforms.",
      image: iotSecure
    }
  ];

  const benefits = [
    "Reduced Downtime",
    "Increased Productivity",
    "Lower Maintenance Costs",
    "Improved Asset Performance",
    "Real-Time Visibility",
    "Faster Decision Making",
    "Enhanced Operational Efficiency"
  ];

  const industries = [
    { name: "Manufacturing", icon: "precision_manufacturing" },
    { name: "Automotive", icon: "directions_car" },
    { name: "Energy & Utilities", icon: "bolt" },
    { name: "Logistics & Warehousing", icon: "warehouse" },
    { name: "Smart Buildings", icon: "domain" },
    { name: "Process Industries", icon: "factory" }
  ];

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

                {/* Middle: IoT Showcase Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-2xl select-none pointer-events-none shadow-lg">
                  <div className="bg-[#05070D] p-1 rounded-lg flex items-center justify-center shadow-md w-8 h-8 border border-accent-blue/20 shrink-0">
                    <svg className="w-full h-full text-accent-blue" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="iotGradInfoSmall" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38BDF8" />
                          <stop offset="100%" stopColor="#0EA5E9" />
                        </linearGradient>
                      </defs>
                      <g transform="translate(0, -10)">
                        <circle cx="100" cy="100" r="75" stroke="#38BDF8" strokeWidth="4" strokeDasharray="16 12" opacity="0.3" />
                        <circle cx="100" cy="100" r="55" stroke="#0EA5E9" strokeWidth="3" strokeDasharray="8 6" opacity="0.6" />
                        <circle cx="100" cy="100" r="22" fill="url(#iotGradInfoSmall)" />
                        <path d="M 85,90 C 90,85 110,85 115,90" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 77,82 C 87,72 113,72 123,82" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 69,74 C 84,59 116,59 131,74" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                      </g>
                    </svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-white font-bold text-xs sm:text-sm tracking-wide leading-tight">Smart Industrial IoT Platform</span>
                    <span className="text-[8px] sm:text-[9px] text-white/60 uppercase tracking-widest font-mono font-semibold">Connect. Monitor. Optimize.</span>
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
              src={iotM} 
              alt="Smart Industrial IoT Platform Showcase Mobile" 
              className="block md:hidden w-full h-full object-cover object-center mx-auto transition-transform duration-500 group-hover:scale-[1.005]" 
            />

            {/* Desktop Showcase Image (Visible on md and larger screens) */}
            <img 
              src={iot} 
              alt="Smart Industrial IoT Platform Showcase Desktop" 
              className="hidden md:block w-full h-full object-cover object-center mx-auto transition-transform duration-[1.5s] cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-[1.015]" 
            />

            {/* Custom Telemetry and HUD Animations */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes scanline {
                0% { top: -10%; opacity: 0; }
                5% { opacity: 0.6; }
                95% { opacity: 0.6; }
                100% { top: 110%; opacity: 0; }
              }
              @keyframes floatUp {
                0% { transform: translateY(40px); opacity: 0; }
                15% { opacity: 0.7; }
                85% { opacity: 0.7; }
                100% { transform: translateY(-80px); opacity: 0; }
              }
              .animate-scanline {
                animation: scanline 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              }
              .animate-float-1 { animation: floatUp 7s ease-in-out infinite; }
              .animate-float-2 { animation: floatUp 9s ease-in-out infinite 2s; }
              .animate-float-3 { animation: floatUp 8s ease-in-out infinite 4.5s; }
              .animate-float-4 { animation: floatUp 10s ease-in-out infinite 1s; }
              .animate-float-5 { animation: floatUp 8.5s ease-in-out infinite 3.5s; }
              
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

            {/* Ambient High-Tech Telemetry Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              {/* Scanline Sweep (All screens) */}
              <div className="absolute left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-cyan-500/30 to-transparent shadow-[0_0_8px_rgba(6,182,212,0.4)] animate-scanline" />

              {/* Glowing Concentric HUD Radar over the circuit board graphic */}
              <div className="hidden md:flex absolute right-[5%] md:right-[22%] top-[55%] md:top-[50%] -translate-y-1/2 items-center justify-center w-52 h-52 md:w-80 md:h-80">
                <div className="absolute w-full h-full border border-cyan-500/10 rounded-full animate-[spin_40s_linear_infinite]" style={{ borderStyle: 'dashed' }} />
                <div className="absolute w-[80%] h-[80%] border border-cyan-500/15 rounded-full animate-[spin_20s_linear_infinite_reverse]" style={{ borderStyle: 'dotted' }} />
                <div className="absolute w-[60%] h-[60%] border border-cyan-500/20 rounded-full animate-ping [animation-duration:5s]" />
                <div className="absolute w-[30%] h-[30%] bg-cyan-500/5 rounded-full border border-cyan-500/35 animate-pulse" />
              </div>


              {/* Pulsing Hotspot Nodes over critical circuit endpoints */}
              <div className="absolute right-[7.2%] md:right-[22.2%] top-[54.8%] md:top-[49.8%] w-1.5 md:w-3 h-1.5 md:h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.8)]">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
              </div>
              <div className="absolute right-[2%] md:right-[12.8%] top-[51.2%] md:top-[46.2%] w-1 md:w-2 h-1 md:h-2 bg-cyan-400/80 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400/80 opacity-75 animate-ping [animation-duration:2.5s]" />
              </div>
              <div className="absolute right-[15.4%] md:right-[33.4%] top-[59.6%] md:top-[54.6%] w-1 md:w-2 h-1 md:h-2 bg-cyan-400/80 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400/80 opacity-75 animate-ping [animation-duration:3s]" />
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
              <p className="text-lg text-text-secondary leading-relaxed font-sans">
                Our <strong className="text-white font-semibold">Industrial IoT Platform</strong> connects machines, sensors, and equipment into a single intelligent ecosystem, enabling real-time monitoring and data-driven decision making.
              </p>
            </motion.div>

            {/* Back button removed in favor of swipe-back gesture */}
          </div>

        {/* Key Features Header */}
        <div className="space-y-2 border-l-2 border-accent-red pl-4">
          <h2 className="text-2xl font-bold font-title text-white">Key Features</h2>
          <p className="text-sm text-text-muted">Transform physical operations into intelligent digital systems</p>
        </div>

        {/* Key Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants} 
              className="glass-panel shine-sweep p-6 rounded-2xl border border-white/5 hover:border-accent-red/30 transition-all duration-300 relative group flex flex-col justify-between hover:shadow-[0_0_30px_rgba(255,90,95,0.03)] bg-gradient-to-br from-white/[0.01] to-[#0A0C12]"
            >
              <div className="absolute top-0 left-0 w-[2px] h-full bg-accent-red/20 group-hover:bg-accent-red group-hover:shadow-[0_0_8px_#FF5A5F] transition-all duration-300" />
              <div>
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 border border-white/10 group-hover:border-accent-red/30 transition-all duration-300">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="text-lg font-bold font-title text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-sans">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Row: Benefits & Industries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Business Benefits */}
          <motion.div 
            className="lg:col-span-6 glass-panel shine-sweep p-8 rounded-2xl border border-white/5 hover:border-accent-red/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,90,95,0.02)] relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white/[0.01] to-[#0A0C12]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-red/5 blur-2xl rounded-full" />
            <div>
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-white">Business Benefits</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] rounded-xl flex items-center gap-3 transition-all duration-300 hover:scale-[1.02] group">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-300">
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>
                    <span className="text-xs font-bold text-white leading-tight font-sans">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Industries We Serve */}
          <motion.div 
            className="lg:col-span-6 glass-panel shine-sweep p-8 rounded-2xl border border-white/5 hover:border-accent-red/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,90,95,0.02)] relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white/[0.01] to-[#0A0C12]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-red/5 blur-2xl rounded-full" />
            <div>
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-white">Industries We Serve</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {industries.map((ind, idx) => (
                  <div key={idx} className="p-5 bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 hover:border-accent-red/30 hover:bg-white/[0.04] rounded-xl flex flex-col items-center justify-center gap-3 text-center transition-all duration-300 hover:scale-[1.03] group hover:shadow-[0_0_25px_rgba(255,90,95,0.05)]">
                    <div className="w-12 h-12 rounded-2xl bg-accent-red/5 border border-accent-red/10 flex items-center justify-center text-accent-red shadow-[0_0_15px_rgba(255,90,95,0.05)] group-hover:scale-110 group-hover:bg-accent-red/10 group-hover:border-accent-red/30 transition-all duration-300">
                      <span className="material-symbols-outlined text-2xl">{ind.icon}</span>
                    </div>
                    <span className="text-xs font-bold text-white leading-tight font-sans">{ind.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Banner */}
        <motion.div 
          className="relative p-8 rounded-2xl overflow-hidden text-center max-w-4xl mx-auto space-y-4 group border border-white/5 hover:border-accent-red/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,90,95,0.08)] bg-gradient-to-r from-accent-red/10 via-[#0B0D14]/90 to-accent-red/10 backdrop-blur-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {/* Animated red line glow */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-red to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-48 h-[20px] bg-accent-red/30 blur-[15px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <h3 className="text-xl sm:text-2xl font-bold font-title text-white tracking-wide">Empowering Industries with Connected Intelligence</h3>
          <p className="text-sm text-text-secondary leading-relaxed font-sans max-w-2xl mx-auto">
            Transform traditional operations into smart, connected, and efficient digital ecosystems through Industrial IoT.
          </p>
        </motion.div>
        </motion.div>
    </div>



    </div>
  );
}
