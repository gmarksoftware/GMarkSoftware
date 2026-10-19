import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, BarChart3, Layers, Headphones } from 'lucide-react';

const VISION_FEATURES = [
  {
    id: 'data-privacy',
    title: 'Data Privacy',
    category: 'Security & Compliance',
    tag: 'Security & Compliance',
    icon: ShieldCheck,
    iconColor: '#10b981',
    iconBg: '#ecfdf5',
    iconBorder: '#a7f3d0',
    description:
      'At our company, we prioritize data privacy by implementing robust security measures. We use encryption, access controls, and regular audits to ensure your confidential information remains safe and secure at all times.'
  },
  {
    id: 'detailed-insights',
    title: 'Detailed Insights',
    category: 'Telemetry & Analytics',
    tag: 'Telemetry & Analytics',
    icon: BarChart3,
    iconColor: '#0284c7',
    iconBg: '#f0f9ff',
    iconBorder: '#bae6fd',
    description:
      'Gain detailed insights into your industry to empower data-driven decisions and minimize errors, ensuring your business stays ahead of curve with real-time telemetry.'
  },
  {
    id: 'versatility',
    title: 'Versatility in Application',
    category: 'Ecosystem & Workflows',
    tag: 'Ecosystem & Workflows',
    icon: Layers,
    iconColor: '#f97316',
    iconBg: '#fff7ed',
    iconBorder: '#fed7aa',
    description:
      'Our platform allows easy integration with other applications, streamlining processes and enhancing productivity for a more efficient workflow across diverse sectors.'
  },
  {
    id: 'customer-experience',
    title: 'Full Customer Experience',
    category: 'Attentive 24/7 Support',
    tag: '24/7 Support',
    icon: Headphones,
    iconColor: '#e11d48',
    iconBg: '#fff1f2',
    iconBorder: '#fecdd3',
    description:
      "Our after-sales support is quick and attentive, guaranteeing a smooth customer experience. Your satisfaction is our top priority, and we're here to assist you through every upgrade cycle."
  }
];

export default function DataVisionSection() {
  return (
    <div 
      className="relative w-full bg-[#e8e8e8] flex flex-col items-center text-center font-['Inter',sans-serif] overflow-hidden"
      style={{ backgroundColor: '#e8e8e8' }}
    >
      {/* White Curved Background Canvas */}
      <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
        {/* Large, Smooth Rounded Curve Top SVG: sweeps up from left edge and flattens across center & right */}
        <div className="w-full h-16 sm:h-24 md:h-32 lg:h-36 shrink-0 leading-none">
          <svg
            viewBox="0 0 1440 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full block"
            preserveAspectRatio="none"
          >
            {/* Solid White Fill */}
            <path
              d="M 0,160 C 0,65 140,0 360,0 L 1440,0 L 1440,160 L 0,160 Z"
              fill="#ffffff"
            />
            {/* Subtle hairline edge along the curve and horizontal line */}
            <path
              d="M 0,160 C 0,65 140,0 360,0 L 1440,0"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.2"
              strokeOpacity="0.45"
            />
          </svg>
        </div>

        {/* Solid White Base filling the rest of the section seamlessly */}
        <div className="flex-1 w-full bg-white" />
      </div>

      {/* Content Container (Layered above the background) */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-12 sm:pb-20 md:pb-28 lg:pb-32 px-4 sm:px-10 md:px-16">
        
        {/* Eyebrow Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/90 mb-3.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5c6c]" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">
            Data Vision & Intelligence
          </span>
        </div>

        {/* Main Headline */}
        <div className="relative mb-3 sm:mb-6 max-w-full sm:max-w-4xl w-full mx-auto">
          <h2
            className="data-vision-headline-mobile text-slate-900 tracking-tight text-center"
            style={{
              fontFamily: "'Lora', serif",
              fontSize: 'clamp(1.55rem, 3.8vw, 3rem)',
              lineHeight: '1.2',
              letterSpacing: '-0.01em',
              fontWeight: 700,
            }}
          >
            <span className="block font-bold sm:font-semibold">
              Let Your Data Take Your Business to
            </span>
            <span className="text-[#ff5c6c] block mt-1 font-bold sm:font-semibold">
              Higher Grounds
            </span>
          </h2>
        </div>

        {/* Subtitle / Paragraph */}
        <div className="w-full max-w-xl sm:max-w-3xl lg:max-w-4xl mx-auto text-slate-600 font-normal text-[14px] sm:text-[15.5px] lg:text-[16.5px] leading-relaxed sm:leading-[1.75] mb-8 sm:mb-12 md:mb-16 px-2 sm:px-0">
          <p className="text-center text-balance">
            We aim to deliver intuitive high-tech platforms that enable industries to effortlessly shift from the physical world to the digital age.
          </p>
          <p className="text-center text-balance mt-2 sm:mt-2 text-slate-500 text-[13.5px] sm:text-[15px]">
            Recognizing the obstacles that come with this change, our cutting solutions are crafted to streamline the transition, boost efficiency, and promote growth.
          </p>
        </div>

        {/* 4 Feature Items: Classic Elevated Cards on Mobile, 2 Columns on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-x-12 lg:gap-x-16 md:gap-y-10 lg:gap-y-12 w-full max-w-full md:max-w-none mx-auto text-left">
          {VISION_FEATURES.map((item) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={item.id} 
                className="flex flex-col md:flex-row items-start gap-0 md:gap-5 p-4 sm:p-5 md:p-0 bg-white md:bg-transparent rounded-2xl md:rounded-none border border-slate-200/90 md:border-0 shadow-[0_4px_16px_rgba(0,0,0,0.03)] md:shadow-none transition-all"
              >
                {/* Card Header on Mobile / Side-by-Side Icon on Desktop */}
                <div className="flex items-center md:items-start gap-3.5 md:gap-5 w-full md:w-auto">
                  {/* Clean Feature Icon */}
                  <div 
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs border"
                    style={{
                      backgroundColor: item.iconBg,
                      borderColor: item.iconBorder,
                    }}
                  >
                    <IconComponent 
                      className="w-5 h-5 sm:w-6 sm:h-6" 
                      style={{ color: item.iconColor }} 
                      strokeWidth={2.2}
                    />
                  </div>

                  {/* Title & Tag on Mobile (Header Row) */}
                  <div className="flex-1 min-w-0 md:hidden">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <h3 className="text-slate-900 font-bold text-[15px] sm:text-[16px] tracking-tight leading-snug">
                        {item.title}
                      </h3>
                      <span 
                        className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                        style={{ 
                          backgroundColor: item.iconBg, 
                          color: item.iconColor,
                          border: `1px solid ${item.iconBorder}` 
                        }}
                      >
                        {item.tag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hairline Divider inside mobile card */}
                <div className="h-[1px] w-full bg-slate-100/90 my-3 block md:hidden" />

                {/* Description & Desktop Title */}
                <div className="flex-1 w-full">
                  <div className="hidden md:flex items-center justify-between gap-3 mb-1">
                    <h3 className="text-slate-900 font-semibold text-[17px] sm:text-[18px] tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    <span 
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                      style={{ 
                        backgroundColor: item.iconBg, 
                        color: item.iconColor,
                        border: `1px solid ${item.iconBorder}` 
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[13.5px] sm:text-[14px] leading-relaxed mt-0 md:mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}


