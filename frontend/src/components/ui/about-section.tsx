"use client";

import React, { useRef } from "react";
import type { Variants } from "framer-motion";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { ArrowRight } from "lucide-react";
import { getAssetUrl } from "@/utils/asset";
import logoBlack from "@/assets/G Mark-black.png";

export function AboutSection3({ onCollaborateClick }: { onCollaborateClick?: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const revealVariants: Variants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: Math.min(i * 0.03, 0.25),
        duration: 0.35,
        ease: "easeOut",
      },
    }),
    hidden: {
      filter: "blur(4px)",
      y: -8,
      opacity: 0,
    },
  };
  const scaleVariants: Variants = {
    visible: () => ({
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: 0.05,
        duration: 0.35,
        ease: "easeOut",
      },
    }),
    hidden: {
      filter: "blur(4px)",
      opacity: 0,
    },
  };

  return (
    <section 
      className="relative w-full pt-2 sm:pt-4 pb-12 sm:pb-16 px-3 sm:px-6 md:px-10 overflow-hidden" 
      style={{
        background: 'linear-gradient(135deg, #FDFBFE 0%, #F6EFF9 22%, #EEF6FF 48%, #F5EEFC 74%, #FFFFFF 100%)',
        backgroundSize: '200% 200%',
        animation: 'aboutGradientShift 24s ease infinite',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
      ref={heroRef}
    >
      {/* ========================================================================= */}
      {/* 1. MODERN TECHNOLOGY BACKGROUND: GRADIENT BLOBS, DOT MATRIX & ABSTRACT WAVES */}
      {/* ========================================================================= */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
        aria-hidden="true"
      >
        {/* Subtle Technology Dot Matrix Grid */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(252, 120, 125, 0.13) 1.25px, transparent 1.25px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 85% 70% at 50% 42%, black 28%, transparent 88%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 42%, black 28%, transparent 88%)',
            opacity: 0.65
          }}
        />

        {/* Floating Gradient Orb 1: Top-Left (Lavender / Light Purple) */}
        <div
          className="about-floating-orb absolute -top-28 -left-20 w-[440px] sm:w-[560px] h-[440px] sm:h-[560px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(192, 132, 252, 0.16) 0%, rgba(233, 213, 255, 0.08) 45%, transparent 70%)',
            filter: 'blur(65px)',
            animation: 'aboutOrbFloat1 16s ease-in-out infinite alternate',
            willChange: 'transform'
          }}
        />

        {/* Floating Gradient Orb 2: Top-Right (Pale Blue / Sky Cyan) */}
        <div
          className="about-floating-orb absolute -top-24 -right-24 w-[460px] sm:w-[580px] h-[460px] sm:h-[580px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(186, 230, 253, 0.08) 50%, transparent 70%)',
            filter: 'blur(70px)',
            animation: 'aboutOrbFloat2 19s ease-in-out infinite alternate',
            willChange: 'transform'
          }}
        />

        {/* Floating Gradient Orb 3: Mid-Left (Soft Odoo Plum & Lavender) */}
        <div
          className="about-floating-orb absolute top-1/2 -left-32 w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(252, 120, 125, 0.11) 0%, rgba(244, 114, 182, 0.06) 50%, transparent 70%)',
            filter: 'blur(70px)',
            animation: 'aboutOrbFloat3 17s ease-in-out infinite alternate',
            willChange: 'transform'
          }}
        />

        {/* Floating Gradient Orb 4: Bottom-Right (Soft Violet / Indigo) */}
        <div
          className="about-floating-orb absolute -bottom-20 right-10 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(129, 140, 248, 0.12) 0%, rgba(196, 181, 253, 0.07) 50%, transparent 70%)',
            filter: 'blur(65px)',
            animation: 'aboutOrbFloat4 21s ease-in-out infinite alternate',
            willChange: 'transform'
          }}
        />

        {/* Diffuse Center Backlight directly behind Hero Photo */}
        <div
          className="absolute top-[22%] left-1/2 -translate-x-1/2 w-[80%] max-w-[1100px] h-[380px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(224, 231, 255, 0.45) 0%, rgba(243, 232, 255, 0.3) 45%, transparent 75%)',
            filter: 'blur(50px)'
          }}
        />

        {/* Subtle Decorative Geometric Circles (Modern Tech accents) */}
        <div 
          className="about-floating-wave absolute top-12 right-[8%] w-32 h-32 rounded-full border border-red-200/40 pointer-events-none hidden md:block"
          style={{ animation: 'aboutWaveMotion1 14s ease-in-out infinite' }}
        />
        <div 
          className="about-floating-wave absolute top-16 right-[9.5%] w-24 h-24 rounded-full border border-sky-200/35 pointer-events-none hidden md:block"
          style={{ animation: 'aboutWaveMotion2 16s ease-in-out infinite' }}
        />
        <div 
          className="about-floating-wave absolute bottom-24 left-[5%] w-28 h-28 rounded-full border border-indigo-200/35 pointer-events-none hidden md:block"
          style={{ animation: 'aboutWaveMotion1 15s ease-in-out infinite' }}
        />

        {/* Elegant Animated Vector Waves (Upper & Lower Flank Ribbons) */}
        <svg
          viewBox="0 0 1440 600"
          className="about-floating-wave absolute top-0 left-0 w-full h-[400px] sm:h-[500px] object-cover pointer-events-none opacity-45 sm:opacity-60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animation: 'aboutWaveMotion1 16s ease-in-out infinite alternate' }}
        >
          <defs>
            <linearGradient id="about-wave-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FC787D" stopOpacity="0.4" />
              <stop offset="35%" stopColor="#A855F7" stopOpacity="0.32" />
              <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="about-wave-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#C084FC" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#FC787D" stopOpacity="0.38" />
            </linearGradient>
          </defs>

          {/* Flowing Wave Curve 1 */}
          <path
            d="M -100 120 C 260 40, 520 220, 880 110 C 1180 20, 1380 180, 1540 130"
            stroke="url(#about-wave-grad-1)"
            strokeWidth="1.75"
          />

          {/* Flowing Wave Curve 2 (Dashed Tech Line) */}
          <path
            d="M -80 150 C 300 70, 560 250, 920 140 C 1220 50, 1420 200, 1560 160"
            stroke="url(#about-wave-grad-1)"
            strokeWidth="1.25"
            strokeDasharray="5 7"
            opacity="0.65"
          />

          {/* Lower Gentle Swell Curve */}
          <path
            d="M -50 380 C 340 440, 680 320, 1020 400 C 1260 450, 1420 370, 1520 390"
            stroke="url(#about-wave-grad-2)"
            strokeWidth="1.5"
            opacity="0.55"
          />
        </svg>

        {/* Ambient Top Light Beam Accent */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-[700px] h-[240px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 65% 50% at 50% 0%, rgba(255, 255, 255, 0.95) 0%, rgba(243, 232, 255, 0.35) 50%, transparent 80%)'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1536px] mx-auto">
        <div className="relative max-w-5xl xl:max-w-[1040px] mx-auto">
          {/* Header Bar: WHO WE ARE badge + Social Media Icons */}
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-3 w-full mb-3 sm:mb-3.5 px-1 z-20">
            <div className="flex items-center gap-2">
              <div 
                style={{
                  padding: '5px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid #FED7D9',
                  borderRadius: '100px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  boxShadow: '0 2px 10px rgba(252, 120, 125, 0.05)'
                }}
              >
                <span style={{ color: '#FC787D' }} className="animate-spin text-sm leading-none">✱</span>
                <TimelineContent
                  as="span"
                  animationNum={0}
                  timelineRef={heroRef}
                  customVariants={revealVariants}
                  className="text-xs font-bold tracking-wider uppercase"
                  style={{ color: '#FC787D', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  WHO WE ARE
                </TimelineContent>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <TimelineContent
                as="a"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 border border-slate-200/90 bg-white/95 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1877F2]/10 hover:border-[#1877F2]/40 hover:scale-105 transition-all shadow-xs backdrop-blur-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </TimelineContent>
              <TimelineContent
                as="a"
                animationNum={1}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 border border-slate-200/90 bg-white/95 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#E1306C]/10 hover:border-[#E1306C]/40 hover:scale-105 transition-all shadow-xs backdrop-blur-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="ig-official-color" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="25%" stopColor="#e6683c" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="75%" stopColor="#cc2366" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#ig-official-color)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </TimelineContent>
              <TimelineContent
                as="a"
                animationNum={2}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href="https://www.linkedin.com/company/g-mark-software/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 border border-slate-200/90 bg-white/95 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/40 hover:scale-105 transition-all shadow-xs backdrop-blur-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#0A66C2" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </TimelineContent>
              <TimelineContent
                as="a"
                animationNum={3}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 border border-slate-200/90 bg-white/95 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FF0000]/10 hover:border-[#FF0000]/40 hover:scale-105 transition-all shadow-xs backdrop-blur-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </TimelineContent>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. REDESIGNED IMAGE BORDER: ORGANIC ASYMMETRIC SHAPE & GRADIENT OUTLINE */}
          {/* ========================================================================= */}
          <TimelineContent
            as="figure"
            animationNum={4}
            timelineRef={heroRef}
            customVariants={scaleVariants}
            className="relative w-full group"
          >
            {/* Outer Elegant Gradient Border Wrapper with Soft Glow */}
            <div 
              className="about-image-wrapper relative w-full p-[1.75px] sm:p-[2px] transition-all duration-500 ease-out"
              style={{
                background: 'linear-gradient(135deg, rgba(233, 213, 255, 0.95) 0%, rgba(192, 132, 252, 0.85) 22%, rgba(165, 180, 252, 0.8) 45%, rgba(125, 211, 252, 0.9) 70%, rgba(244, 114, 182, 0.65) 88%, rgba(233, 213, 255, 0.95) 100%)',
                backgroundSize: '250% 250%',
                animation: 'aboutBorderShift 12s ease-in-out infinite',
                boxShadow: '0 16px 40px -10px rgba(252, 120, 125, 0.14), 0 0 30px -4px rgba(147, 197, 253, 0.38), 0 0 16px -2px rgba(192, 132, 252, 0.26)'
              }}
            >
              {/* Inner Clipped Container with Matching Organic Radii */}
              <div className="about-image-inner relative w-full overflow-hidden bg-slate-900/5">
                {/* Original team photograph preserved with 100% quality and content */}
                <img
                  src={getAssetUrl("/group.jpeg")}
                  alt="G-Mark Team"
                  className="w-full h-[190px] xs:h-[230px] sm:h-[280px] md:h-[320px] lg:h-[350px] object-cover object-[center_42%] transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                  loading="eager"
                />

                {/* Ambient glass sheen edge for seamless blending */}
                <div 
                  className="absolute inset-0 pointer-events-none rounded-[inherit]"
                  style={{
                    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.45)'
                  }}
                />
              </div>
            </div>
          </TimelineContent>

          {/* Stats Bar */}
          <div className="flex flex-wrap lg:flex-nowrap justify-between items-center gap-y-3 gap-x-6 mt-3 sm:mt-3.5 px-1 text-sm">
            <TimelineContent
              as="div"
              animationNum={5}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex flex-wrap gap-2.5 sm:gap-4 items-center"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 sm:text-base text-xs font-sans">
                <span className="font-extrabold" style={{ color: '#FC787D' }}>99.98%</span>
                <span className="text-slate-600 font-medium">platform availability</span>
                <span className="text-slate-300 hidden sm:inline">|</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 sm:text-base text-xs font-sans">
                <span className="font-extrabold" style={{ color: '#FC787D' }}>50Hz</span>
                <span className="text-slate-600 font-medium">telemetry acquisition</span>
              </div>
            </TimelineContent>

            <div className="flex items-center gap-3 sm:gap-5 ml-auto text-right">
              <TimelineContent
                as="div"
                animationNum={6}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="flex items-center gap-1.5 leading-none"
              >
                <span className="font-extrabold text-base sm:text-lg lg:text-xl" style={{ color: '#FC787D' }}>100+</span>
                <span className="text-slate-900 font-bold uppercase tracking-tight text-xs sm:text-sm">DEPLOYMENTS</span>
                <span className="text-slate-300 inline">|</span>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={7}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="flex items-center gap-1.5 sm:text-sm text-xs text-slate-600 font-medium"
              >
                <span className="font-extrabold" style={{ color: '#FC787D' }}>42%</span>
                <span>downtime reduction</span>
              </TimelineContent>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8 mt-6 max-w-5xl xl:max-w-[1040px] mx-auto">
          <div className="md:col-span-2">
            <h1 
              className="text-slate-900 mb-8 font-extrabold tracking-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: 'clamp(2.35rem, 4.2vw, 3.5rem)',
                lineHeight: '1.16',
                letterSpacing: '-0.025em',
                color: '#1E293B'
              }}
            >
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.04}
                staggerFrom="first"
                reverse={true}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 24,
                  delay: 0.05,
                }}
              >
                Engineering Intelligent Systems
              </VerticalCutReveal>{' '}
              <span style={{ color: '#FC787D' }}>
                <VerticalCutReveal
                  splitBy="words"
                  staggerDuration={0.04}
                  staggerFrom="first"
                  reverse={true}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 24,
                    delay: 0.18,
                  }}
                >
                  for the Real World.
                </VerticalCutReveal>
              </span>
            </h1>

            <TimelineContent
              as="div"
              animationNum={9}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="grid md:grid-cols-2 gap-8 text-slate-600"
            >
              <TimelineContent
                as="div"
                animationNum={10}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="sm:text-base text-xs"
              >
                <p className="leading-relaxed text-slate-600 text-justify">
                  <strong className="text-slate-900 font-semibold">G Mark Software Private Limited</strong> is a premier enterprise IT and industrial software provider, specializing in digital platforms, 4M CMMS, smart agriculture e-commerce, and industrial IoT telemetry networks.
                </p>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={11}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="sm:text-base text-xs"
              >
                <p className="leading-relaxed text-slate-600 text-justify">
                  We engineer high-availability platforms designed for mission-critical resilience, rapid deployment cycles, and real-time streaming analytics to optimize industrial and agricultural operations.
                </p>
              </TimelineContent>
            </TimelineContent>
          </div>

          <div className="md:col-span-1 flex flex-col justify-between h-full">
            <div className="flex flex-col items-center text-center">
              <TimelineContent
                as="div"
                animationNum={12}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="mb-1.5"
              >
                <img
                  src={logoBlack}
                  alt="G Mark Software Pvt. Ltd"
                  className="h-6 sm:h-7.5 w-auto object-contain mx-auto"
                  style={{ maxHeight: '28px' }}
                />
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={13}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-slate-500 text-sm sm:text-base font-medium"
              >
                Enterprise IT &amp; Industrial IoT Solutions
              </TimelineContent>
            </div>

            <div className="flex flex-col items-center text-center mt-8 sm:mt-auto pt-6 sm:pt-8">
              <TimelineContent
                as="div"
                animationNum={14}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="mb-6 w-full"
              >
                <p className="text-slate-900 font-bold text-lg sm:text-xl md:text-2xl leading-snug">
                  Ready to engineer intelligent systems for your enterprise?
                </p>
              </TimelineContent>

              <TimelineContent
                as="button"
                animationNum={15}
                timelineRef={heroRef}
                customVariants={revealVariants}
                onClick={onCollaborateClick}
                className="inline-flex items-center justify-center gap-2 text-white font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] select-none text-center min-w-[240px] sm:min-w-[280px] px-8 py-3.5 rounded-lg mx-auto"
                style={{
                  backgroundColor: '#FC787D',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '15px',
                  boxShadow: '0 2px 6px rgba(252, 120, 125, 0.25)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E86368')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FC787D')}
              >
                <span>LET'S COLLABORATE</span>
                <ArrowRight className="w-4 h-4 ml-0.5 inline-block" />
              </TimelineContent>
            </div>
          </div>
        </div>
      </div>

      {/* Component Styles & GPU-accelerated Keyframe Animations */}
      <style>{`
        /* Asymmetric Organic Rounded Corners */
        .about-image-wrapper {
          border-radius: 24px 12px 30px 16px;
        }
        @media (min-width: 640px) {
          .about-image-wrapper {
            border-radius: 30px 14px 38px 18px;
          }
        }
        @media (min-width: 1024px) {
          .about-image-wrapper {
            border-radius: 38px 16px 46px 20px;
          }
        }

        .about-image-inner {
          border-radius: 22px 10px 28px 14px;
        }
        @media (min-width: 640px) {
          .about-image-inner {
            border-radius: 28px 12px 36px 16px;
          }
        }
        @media (min-width: 1024px) {
          .about-image-inner {
            border-radius: 36px 14px 44px 18px;
          }
        }

        @keyframes aboutGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes aboutBorderShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes aboutOrbFloat1 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(32px, -24px, 0) scale(1.08); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes aboutOrbFloat2 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-34px, 26px, 0) scale(1.06); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes aboutOrbFloat3 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(26px, 22px, 0) scale(0.96); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes aboutOrbFloat4 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-24px, -20px, 0) scale(1.05); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes aboutWaveMotion1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.6deg); }
        }

        @keyframes aboutWaveMotion2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(8px) rotate(-0.5deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-floating-orb,
          .about-floating-wave,
          .about-image-wrapper {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

export default AboutSection3;
