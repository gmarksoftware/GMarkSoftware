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
        <div className="w-6 h-6 rounded-full bg-[#FFF1F2] border border-[#FED7D9] mb-5 sm:mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Heading & Category */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Category Tag */}
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-[#FC787D] uppercase mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#FC787D]" />
              <span>NEXT GENERATION TRANSFORMATION</span>
            </div>

            {/* Main Headline */}
            <h2 
              className="text-neutral-950 font-extrabold tracking-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: 'clamp(1.89rem, 3.34vw, 2.73rem)',
                lineHeight: '1.15',
                letterSpacing: '-0.025em'
              }}
            >
              Are You Ready to{' '}
              <span className="underline decoration-[2.5px] decoration-[#FC787D] underline-offset-[6px]">
                Accelerate
              </span>{' '}
              Your Business?
            </h2>

            {/* Bottom accent dash */}
            <div className="w-12 h-1 bg-[#FC787D] mt-5 sm:mt-6 rounded-full" />
          </div>

          {/* Right Column: Paragraph & CTA Button */}
          <div className="lg:col-span-5 flex flex-col items-start justify-center gap-6 lg:pl-4">
            <p className="text-neutral-600 text-[13.5px] sm:text-[15px] leading-relaxed">
              In our pursuit of industry transformation, we envision a future where digitalization drives efficiency and innovation. By leveraging advanced data analysis, we empower businesses to make informed decisions and unlock new opportunities.
            </p>

            <button
              onClick={onOpenExpertModal}
              className="bg-[#FC787D] hover:bg-[#E86368] text-white text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase px-7 py-3.5 rounded-md flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
