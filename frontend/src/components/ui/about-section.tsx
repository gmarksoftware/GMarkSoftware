"use client";

import React, { useRef } from "react";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { ArrowRight } from "lucide-react";
import { getAssetUrl } from "@/utils/asset";

export function AboutSection3({ onCollaborateClick }: { onCollaborateClick?: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const revealVariants = {
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
  const scaleVariants = {
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
    <section className="w-full pt-1 sm:pt-2 pb-6 sm:pb-8 px-3 sm:px-6 md:px-10 bg-[#f9f9f9]" ref={heroRef}>
      <div className="w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1536px] mx-auto">
        <div className="relative">
          {/* Header with social icons positioned neatly inside top-left and top-right SVG notch */}
          <div className="flex justify-between items-center w-[84%] sm:w-[83%] md:w-[82%] absolute top-2.5 sm:top-3.5 md:top-4 lg:top-5 left-3 sm:left-4 md:left-6 z-20">
            <div className="flex items-center gap-2">
              <span className="text-red-500 animate-spin text-base sm:text-lg">✱</span>
              <TimelineContent
                as="span"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-xs sm:text-sm font-semibold tracking-wider text-gray-700 uppercase"
              >
                WHO WE ARE
              </TimelineContent>
            </div>
            <div className="flex gap-2 sm:gap-3 md:gap-4">
              <TimelineContent
                as="a"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-200 bg-gray-100/90 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors shadow-xs text-blue-600"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
                className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-200 bg-gray-100/90 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors shadow-xs text-pink-600"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
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
                className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-200 bg-gray-100/90 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors shadow-xs text-blue-700"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
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
                className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-200 bg-gray-100/90 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors shadow-xs text-red-600"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </TimelineContent>
            </div>
          </div>

          <TimelineContent
            as="figure"
            animationNum={4}
            timelineRef={heroRef}
            customVariants={scaleVariants}
            className="relative group w-full"
          >
            <svg
              className="w-full h-auto block overflow-visible"
              width="100%"
              height="100%"
              viewBox="0 0 100 40"
            >
              <defs>
                <clipPath
                  id="clip-inverted"
                  clipPathUnits="objectBoundingBox"
                >
                  <path
                    d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z"
                    fill="#D9D9D9"
                  />
                </clipPath>
              </defs>
              <image
                clipPath="url(#clip-inverted)"
                preserveAspectRatio="xMidYMid slice"
                width="100%"
                height="100%"
                href={getAssetUrl("/group.jpeg")}
              />
              <path
                d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z"
                transform="scale(100, 40)"
                fill="none"
                stroke="#000000"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </TimelineContent>

          {/* Stats Bar */}
          <div className="flex flex-wrap lg:justify-start justify-between items-center pt-3 pb-1 text-sm">
            <TimelineContent
              as="div"
              animationNum={5}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex flex-wrap gap-2 sm:gap-4 items-center"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 sm:text-base text-xs">
                <span className="text-red-500 font-bold">99.98%</span>
                <span className="text-gray-600 font-medium">platform availability</span>
                <span className="text-gray-300 hidden sm:inline">|</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 sm:text-base text-xs">
                <span className="text-red-500 font-bold">50Hz</span>
                <span className="text-gray-600 font-medium">telemetry acquisition</span>
              </div>
            </TimelineContent>
            <div className="lg:absolute right-1 sm:right-2 md:right-3 bottom-6 sm:bottom-8 md:bottom-10 lg:bottom-12 flex lg:flex-col flex-row-reverse lg:gap-0 gap-4 items-end text-right z-20">
              <TimelineContent
                as="div"
                animationNum={6}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="flex lg:text-3xl sm:text-2xl text-xl items-baseline gap-1.5 sm:gap-2 leading-none"
              >
                <span className="text-red-500 font-bold">100+</span>
                <span className="text-gray-700 font-semibold uppercase tracking-tight">DEPLOYMENTS</span>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={7}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="flex items-center gap-1.5 mt-1 sm:text-sm text-xs text-gray-600 font-medium"
              >
                <span className="text-red-500 font-bold">42%</span>
                <span>downtime reduction</span>
                <span className="text-gray-300 lg:hidden block">|</span>
              </TimelineContent>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8 mt-6">
          <div className="md:col-span-2">
            <h1 
              className="text-gray-900 mb-8"
              style={{
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(2.24rem, 4.14vw, 3.39rem)',
                lineHeight: '1.15',
                letterSpacing: '0',
                fontWeight: 600
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
                Engineering Intelligent Systems for the Real World.
              </VerticalCutReveal>
            </h1>

            <TimelineContent
              as="div"
              animationNum={9}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="grid md:grid-cols-2 gap-8 text-gray-600"
            >
              <TimelineContent
                as="div"
                animationNum={10}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="sm:text-base text-xs"
              >
                <p className="leading-[1.8] sm:leading-[1.9] text-justify">
                  <strong className="text-gray-900 font-semibold">G Mark Software Private Limited</strong> is a premier enterprise IT and industrial software provider, specializing in digital platforms, 4M CMMS, smart agriculture e-commerce, and industrial IoT telemetry networks.
                </p>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={11}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="sm:text-base text-xs"
              >
                <p className="leading-[1.8] sm:leading-[1.9] text-justify">
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
                className="text-red-500 text-2xl sm:text-3xl font-bold mb-1.5"
              >
                G MARK
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={13}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-gray-600 text-sm sm:text-base font-medium"
              >
                Enterprise IT & Industrial IoT Solutions
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
                <p className="text-gray-900 font-bold text-lg sm:text-xl md:text-2xl leading-snug">
                  Ready to engineer intelligent systems for your enterprise?
                </p>
              </TimelineContent>

              <TimelineContent
                as="button"
                animationNum={15}
                timelineRef={heroRef}
                customVariants={revealVariants}
                onClick={onCollaborateClick}
                className="bg-neutral-900 hover:bg-neutral-950 shadow-xl shadow-neutral-900/25 border border-neutral-700 flex items-center justify-center min-w-[260px] sm:min-w-[300px] px-10 py-4 sm:px-12 sm:py-4.5 rounded-full cursor-pointer font-bold text-[10px] sm:text-[11px] tracking-[0.22em] uppercase hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out text-white gap-3 hover:gap-4 mx-auto whitespace-nowrap"
              >
                <span>LET'S COLLABORATE</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline-block" />
              </TimelineContent>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection3;
