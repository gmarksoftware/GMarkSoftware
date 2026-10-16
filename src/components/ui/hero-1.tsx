"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { MarqueeDemo } from "@/components/ui/demo"

export function Hero({
  title = "The New Standard of",
  highlightText = "Digital Industry",
  subtitle = "Use Accurate Data to Get a 360-Degree View of Your Business. Accelerate decisions with industrial-grade intelligence.",
  ctaLabel = "Learn More",
  ctaHref = "#",
  onCtaClick,
  showMarquee = true,
}) {
  return (
    <section
      id="hero"
      className="relative mx-auto w-full overflow-x-clip bg-white px-6 md:px-8 text-center flex flex-col justify-between items-center pt-32 md:pt-40 pb-10"
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Grid BG */}
      <div
        className="absolute -z-10 inset-0 opacity-80 h-[650px] w-full 
        bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] 
        bg-[size:6rem_5rem] 
        [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"
      />

      {/* Horizon Curvature Arc in Grey (#e8e8e8) */}
      <div
        className="absolute left-1/2 top-[calc(100%-110px)] sm:top-[calc(100%-130px)] md:top-[calc(100%-150px)] lg:top-[calc(100%-170px)] 
        h-[480px] w-[700px] md:h-[550px] md:w-[1100px] lg:h-[750px] lg:w-[140%] 
        -translate-x-1/2 rounded-[100%] border-t border-slate-300/40 bg-[#e8e8e8] 
        animate-fade-up shadow-[0_-20px_50px_rgba(0,0,0,0.06)] pointer-events-none z-0"
        style={{
          backgroundColor: '#e8e8e8'
        }}
      />

      {/* Centered Content Container */}
      <div 
        className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center text-center my-auto pt-4 w-full translate-y-20 sm:translate-y-14 md:translate-y-20 lg:translate-y-28 xl:translate-y-32"
      >
        {/* 1. Upper-left caption: Built for real-world operations */}
        <div className="hidden lg:flex absolute -left-16 xl:-left-48 2xl:-left-64 -top-2 xl:-top-3 flex-col items-start z-20 pointer-events-none select-none">
          <svg
            className="w-10 h-10 pointer-events-none overflow-visible mb-1 ml-6"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 32 34 C 28 20, 20 12, 8 6"
              stroke="#7B5872"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 8 18 L 8 6 L 20 6"
              stroke="#7B5872"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span 
            className="font-semibold text-[16px] xl:text-[18.5px] leading-tight -rotate-3 whitespace-nowrap"
            style={{ fontFamily: "'Lora', serif", color: '#7B5872' }}
          >
            Built for real-world operations
          </span>
        </div>

        {/* 4. Mid-Right near blue underline: From machines to meaningful insights. (Arrow pointing left targeting 'Industry') */}
        <div className="hidden lg:flex absolute -right-36 xl:-right-60 2xl:-right-72 top-1/2 -translate-y-8 items-center z-20 pointer-events-none select-none">
          <svg
            className="w-10 h-7 xl:w-12 xl:h-8 pointer-events-none overflow-visible mr-1.5"
            viewBox="0 0 50 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 46 20 C 32 20, 18 16, 6 12"
              stroke="#7B5872"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 16 6 L 6 12 L 16 18"
              stroke="#7B5872"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span 
            className="font-semibold text-[16px] xl:text-[18.5px] leading-tight rotate-2 whitespace-nowrap"
            style={{ fontFamily: "'Lora', serif", color: '#7B5872' }}
          >
            From machines to meaningful insights.
          </span>
        </div>

        {/* Title with Highlighted Underline */}
        <h1
          className="hero-heading-mobile animate-fade-in text-balance font-bold sm:font-semibold text-slate-900"
          style={{ 
            fontFamily: "'Lora', serif",
            fontSize: 'clamp(2.42rem, 4.84vw, 3.96rem)',
            lineHeight: '1.15',
            letterSpacing: '0',
            paddingTop: '0.5rem',
            paddingBottom: '0.75rem',
            display: 'inline-block',
            fontWeight: 700,
            color: '#0F172A'
          }}
        >
          <span className="block sm:inline font-bold sm:font-semibold" style={{ color: '#0F172A' }}>The New Standard</span>
          <span className="hidden sm:inline"> </span>
          <br className="hidden sm:inline" />
          <span className="inline font-bold sm:font-semibold" style={{ color: '#0F172A' }}>of </span>
          <span className="relative inline-block whitespace-nowrap">
            <span className="relative z-10 font-bold sm:font-semibold" style={{ color: '#FC787D' }}>
              {highlightText || "Digital Industry"}
            </span>
            {/* Hand-drawn marker brush stroke highlight */}
            <svg
              className="hero-underline-mobile absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4.5 pointer-events-none z-0 overflow-visible"
              viewBox="0 0 260 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M 4,14 Q 130,5 256,12 Q 130,20 6,17"
                fill="#00A3FF"
              />
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="animate-fade-in text-balance text-gray-600 font-normal"
            style={{
              fontSize: 'clamp(0.92rem, 1.58vw, 1.1rem)',
              lineHeight: '1.65',
              maxWidth: '760px',
              marginTop: '1.25rem',
              marginBottom: '2rem',
              color: '#475569'
            }}
          >
            {subtitle}
          </p>
        )}

        {/* CTA Button Wrapper with caption positioned below */}
        <div className="relative flex flex-col justify-center items-center z-20 w-full mb-8">
          {ctaLabel && (
            <Button
              asChild
              className="w-fit min-w-40 sm:min-w-48 px-9 py-3.5 h-12 rounded-full text-white hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md font-medium text-base font-geist tracking-tight cursor-pointer"
              style={{ 
                backgroundColor: '#7B5872', 
                borderRadius: '9999px',
                boxShadow: '0 4px 16px rgba(123, 88, 114, 0.35)'
              }}
              onClick={onCtaClick}
            >
              <a href={ctaHref} onClick={onCtaClick}>{ctaLabel}</a>
            </Button>
          )}

          {/* 3. Below CTA button: Explore what we can build for you */}
          <div className="hidden md:flex items-center justify-center mt-5 z-20 pointer-events-none select-none -translate-x-32 md:-translate-x-44 lg:-translate-x-56 xl:-translate-x-60">
            <span 
              className="font-semibold text-[15px] lg:text-[17.5px] leading-tight -rotate-1 whitespace-nowrap"
              style={{ fontFamily: "'Lora', serif", color: '#7B5872' }}
            >
              Explore what we can build for you
            </span>
            <svg
              className="w-9 h-9 pointer-events-none overflow-visible ml-2 -mt-4"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 6 28 C 10 18, 18 10, 26 6"
                stroke="#7B5872"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 14 6 L 26 6 L 26 18"
                stroke="#7B5872"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* 6. Lower-right area: Technology that works beyond the screen. (Moved lower) */}
        <div className="hidden lg:flex absolute -right-24 lg:-right-40 xl:-right-60 2xl:-right-72 -bottom-20 lg:-bottom-24 xl:-bottom-32 flex-col items-start z-20 pointer-events-none select-none">
          <span 
            className="font-semibold text-[16px] xl:text-[18.5px] leading-tight rotate-2 whitespace-nowrap mb-1"
            style={{ fontFamily: "'Lora', serif", color: '#7B5872' }}
          >
            Technology that works beyond the screen.
          </span>
          <svg
            className="w-10 h-12 pointer-events-none overflow-visible ml-6"
            viewBox="0 0 40 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 24 4 C 24 20, 20 32, 10 42"
              stroke="#7B5872"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 8 30 L 10 42 L 22 38"
              stroke="#7B5872"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* Sliding Marquee Inside Hero */}
      {showMarquee && (
        <div className="relative z-20 w-full max-w-6xl mx-auto mt-auto translate-y-12 sm:translate-y-16 md:translate-y-20 pb-2">
          <MarqueeDemo />
        </div>
      )}

      {/* Bottom Fade Overlay transitioning to grey */}
      <div
        className="animate-fade-up relative opacity-0 [perspective:2000px] 
        after:absolute after:inset-0 after:z-50 
        after:[background:linear-gradient(to_top,#e8e8e8_10%,transparent)]"
      />
    </section>
  )
}
