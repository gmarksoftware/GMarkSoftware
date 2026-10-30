"use client"

import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { MarqueeDemo } from "@/components/ui/demo"
import { ENTERPRISE_EASING } from "@/components/ui/scroll-reveal"

export function Hero({
  title = "The New Standard of",
  highlightText = "Digital Industry",
  subtitle = "Use Accurate Data to Get a 360-Degree View of Your Business. Accelerate decisions with industrial-grade intelligence.",
  ctaLabel = "Learn More",
  ctaHref = "#applications-section",
  onCtaClick,
  secondaryCtaLabel = "Explore what we can build for you",
  secondaryCtaHref = "#applications-section",
  onSecondaryCtaClick,
  showMarquee = true,
}: {
  title?: string
  highlightText?: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: (e?: any) => void
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  onSecondaryCtaClick?: (e?: any) => void
  showMarquee?: boolean
}) {
  const prefersReduced = useReducedMotion()

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-white text-center pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12 lg:pb-14"
      style={{
        backgroundColor: '#ffffff'
      }}
    >
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 -z-10 h-[680px] w-full 
          bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] 
          bg-[size:6rem_5rem] 
          [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none opacity-60"
        aria-hidden="true"
      />

      {/* Main Centered Content Container (max-w-4xl to max-w-5xl) */}
      <div className="relative z-10 w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">

        {/* 1. Main Hero Heading: "The New Standard of Digital Industry" */}
        <motion.h1
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: ENTERPRISE_EASING }}
          className="font-bold text-slate-900 tracking-tight text-center max-w-3xl sm:max-w-4xl mx-auto px-2"
          style={{
            fontFamily: "'Kalam', cursive",
            fontSize: 'clamp(2.35rem, 5vw, 4.35rem)',
            lineHeight: '1.22',
            fontWeight: 700,
            color: '#111827',
          }}
        >
          <span className="block sm:inline font-bold" style={{ color: '#111827' }}>
            The New Standard of{' '}
          </span>
          <span className="relative inline-block whitespace-nowrap mt-1 sm:mt-0">
            <span className="relative z-10 px-2.5 sm:px-3 font-bold" style={{ color: '#111827' }}>
              {highlightText || "Digital Industry"}
            </span>
            {/* Thick rounded orange marker-style highlight behind text */}
            <span
              className="absolute -inset-x-1 sm:-inset-x-2 -inset-y-0.5 sm:-inset-y-1 z-0 pointer-events-none"
              style={{
                backgroundColor: '#FFA834',
                borderRadius: '18px 24px 16px 22px / 22px 16px 24px 18px',
                transform: 'rotate(-0.8deg)',
                opacity: 0.95
              }}
              aria-hidden="true"
            />
          </span>
        </motion.h1>

        {/* 2. Subtitle with bright cyan-blue hand-drawn underline */}
        <motion.div
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: ENTERPRISE_EASING }}
          className="font-bold text-slate-900 px-3 sm:px-0 mt-4 sm:mt-5 mb-6 sm:mb-8 w-full max-w-2xl sm:max-w-3xl mx-auto text-center"
          style={{
            fontFamily: "'Kalam', cursive",
            fontSize: 'clamp(1.15rem, 2.1vw, 1.65rem)',
            lineHeight: '1.45',
            color: '#18181B'
          }}
        >
          <p className="block">
            Use Accurate Data to Get a 360-Degree View of Your Business.
          </p>
          <p className="block mt-1 sm:mt-2">
            Accelerate decisions with{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">industrial-grade intelligence.</span>
              {/* Hand-drawn bright blue brush underline */}
              <svg
                className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full h-3 sm:h-4 pointer-events-none z-0 overflow-visible"
                viewBox="0 0 280 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M 3 13 Q 70 5 140 11 Q 210 16 277 9 Q 140 18 3 13"
                  fill="#00A3FF"
                />
              </svg>
            </span>
          </p>
        </motion.div>

        {/* 3. Action Buttons Section */}
        <motion.div 
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3, ease: ENTERPRISE_EASING }}
          className="relative flex flex-col items-center justify-center z-20 w-full"
        >
          {/* Primary & Secondary Buttons Container */}
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4.5 w-full max-w-sm sm:max-w-none mx-auto">
            
            {/* Primary Button ("Learn More"): Muted plum background, white text */}
            {ctaLabel && (
              <a
                href={ctaHref}
                onClick={onCtaClick}
                className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 sm:py-4 text-[15px] sm:text-[16px] font-semibold text-white rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:bg-[#5E3E55] active:scale-[0.98] select-none text-center w-full sm:w-auto"
                style={{
                  backgroundColor: '#714B67',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                {ctaLabel}
              </a>
            )}

            {/* Secondary Button ("Explore what we can build for you"): Soft light neutral */}
            {secondaryCtaLabel && (
              <a
                href={secondaryCtaHref}
                onClick={onSecondaryCtaClick || onCtaClick}
                className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 sm:py-4 text-[15px] sm:text-[16px] font-semibold rounded-xl transition-all duration-200 cursor-pointer border border-slate-200/80 hover:bg-slate-200/90 active:scale-[0.98] select-none text-center w-full sm:w-auto"
                style={{
                  backgroundColor: '#F1F5F9',
                  color: '#714B67',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                {secondaryCtaLabel}
              </a>
            )}

          </div>
        </motion.div>

      </div>

      {/* 4. Tech Stack Logo Bar: Dedicated compact top margin with scroll reveal */}
      {showMarquee && (
        <motion.div
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, delay: 0.1, ease: ENTERPRISE_EASING }}
          className="relative z-20 w-full max-w-5xl mx-auto mt-10 sm:mt-12 lg:mt-14 px-4"
        >
          <MarqueeDemo />
        </motion.div>
      )}
    </section>
  )
}

export default Hero
