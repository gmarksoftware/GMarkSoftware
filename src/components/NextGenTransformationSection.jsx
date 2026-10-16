import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function NextGenTransformationSection({ onOpenExpertModal }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full bg-[#fdfdfd] border border-neutral-200/90 rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-6 sm:p-10 md:p-12 lg:p-16 overflow-hidden"
      >
        {/* Top-left subtle decorative circle */}
        <div className="w-6 h-6 rounded-full bg-neutral-200/80 border border-neutral-300/70 mb-5 sm:mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Heading & Category */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Category Tag */}
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
              <span>NEXT GENERATION TRANSFORMATION</span>
            </div>

            {/* Main Headline */}
            <h2 
              className="text-neutral-950"
              style={{
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(1.89rem, 3.34vw, 2.73rem)',
                lineHeight: '1.15',
                letterSpacing: '0',
                fontWeight: 600
              }}
            >
              Are You Ready to{' '}
              <span className="underline decoration-[2.5px] decoration-neutral-950 underline-offset-[6px]">
                Accelerate
              </span>{' '}
              Your Business?
            </h2>

            {/* Bottom accent dash */}
            <div className="w-12 h-0.5 bg-neutral-950 mt-5 sm:mt-6 rounded-full" />
          </div>

          {/* Right Column: Paragraph & CTA Button */}
          <div className="lg:col-span-5 flex flex-col items-start justify-center gap-6 lg:pl-4">
            <p className="text-neutral-600 text-[13.5px] sm:text-[15px] leading-relaxed">
              In our pursuit of industry transformation, we envision a future where digitalization drives efficiency and innovation. By leveraging advanced data analysis, we empower businesses to make informed decisions and unlock new opportunities.
            </p>

            <button
              onClick={onOpenExpertModal}
              className="bg-black hover:bg-neutral-900 text-white text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase px-7 py-3.5 rounded-full flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <span>GET STARTED</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
