import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Phone, MapPin, Globe, ArrowUpRight } from 'lucide-react';
import logoWhiteImg from '../assets/G Mark-white.png';
import { ENTERPRISE_EASING } from './ui/scroll-reveal';

export default function Footer({ onSelectTab, onNavigate, onOpenExpertModal }) {
  const prefersReduced = useReducedMotion();
  const handleNav = (tabId, sectionId) => {
    if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    
    if (onSelectTab && tabId) {
      onSelectTab(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onNavigate && tabId) {
      onNavigate(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContactAction = () => {
    if (onOpenExpertModal) {
      onOpenExpertModal();
    } else {
      handleNav('help');
    }
  };

  return (
    <footer className="w-full relative bg-black text-white pt-7 sm:pt-8 md:pt-9 pb-5 sm:pb-6 overflow-hidden flex flex-col items-center justify-center font-['Inter',sans-serif]">
      {/* Background Subtle Micro Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Centered Main Container */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10 flex flex-col">
        <motion.div 
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: ENTERPRISE_EASING }}
          className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-5 lg:gap-8 pb-5 sm:pb-6 border-b border-neutral-800"
        >
          
          {/* Col 1: Brand & Contact Info */}
          <div className="md:col-span-5 flex flex-col gap-3 sm:gap-3.5">
            <div className="flex items-center gap-3">
              <img
                src={logoWhiteImg}
                alt="G-Mark Software Logo"
                className="h-6 sm:h-7 w-auto object-contain cursor-pointer transition-opacity hover:opacity-85"
                onClick={() => handleNav('home')}
              />
            </div>

            <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed max-w-sm font-normal">
              Delivering high-performance industrial telemetry, 4M maintenance solutions, and intelligent IoT architectures to empower modern manufacturing.
            </p>

            {/* Direct Contact Info */}
            <div className="flex flex-col gap-2 pt-0.5 sm:pt-1 text-xs text-neutral-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                <span className="leading-snug break-words">G Mark Software Pvt. Ltd., Moshi, Pune, Maharashtra, India - 412105</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                <a href="tel:+919657363967" className="hover:text-white transition-colors font-medium text-neutral-200">
                  +91-9657363967
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                <a href="mailto:gmarksoftware@gmail.com" className="hover:text-white transition-colors font-medium text-neutral-200">
                  gmarksoftware@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Solutions */}
          <div className="md:col-span-3 flex flex-col gap-2.5 sm:gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              Solutions
            </h4>
            <ul className="flex flex-col gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-[13px] text-neutral-400">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home', 'applications-section')}
                  className="hover:text-white hover:translate-x-0.5 transition-all text-left cursor-pointer py-0.5 md:py-0 min-h-[26px] md:min-h-0 flex items-center"
                >
                  4M Maintenance CMMS
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home', 'applications-section')}
                  className="hover:text-white hover:translate-x-0.5 transition-all text-left cursor-pointer py-0.5 md:py-0 min-h-[26px] md:min-h-0 flex items-center"
                >
                  Industrial IoT Telemetry
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home', 'applications-section')}
                  className="hover:text-white hover:translate-x-0.5 transition-all text-left cursor-pointer py-0.5 md:py-0 min-h-[26px] md:min-h-0 flex items-center"
                >
                  GramUnnati Smart Agri-Tech
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home', 'data-vision-section')}
                  className="hover:text-white hover:translate-x-0.5 transition-all text-left cursor-pointer py-0.5 md:py-0 min-h-[26px] md:min-h-0 flex items-center"
                >
                  Cloud Edge Ecosystem
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Company Navigation */}
          <div className="md:col-span-2 flex flex-col gap-2.5 sm:gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              Company
            </h4>
            <ul className="flex flex-col gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-[13px] text-neutral-400">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="hover:text-white hover:translate-x-0.5 transition-all text-left cursor-pointer py-0.5 md:py-0 min-h-[26px] md:min-h-0 flex items-center"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('about')}
                  className="hover:text-white hover:translate-x-0.5 transition-all text-left cursor-pointer py-0.5 md:py-0 min-h-[26px] md:min-h-0 flex items-center"
                >
                  About G-Mark
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home', 'transformation-section')}
                  className="hover:text-white hover:translate-x-0.5 transition-all text-left cursor-pointer py-0.5 min-h-[26px] flex items-center"
                >
                  Workflow Blueprint
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home', 'community-section')}
                  className="hover:text-white hover:translate-x-0.5 transition-all text-left cursor-pointer py-0.5 min-h-[26px] flex items-center"
                >
                  Case Studies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('help')}
                  className="hover:text-white hover:translate-x-0.5 transition-all text-left cursor-pointer py-0.5 min-h-[26px] flex items-center"
                >
                  Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleContactAction}
                  className="hover:text-white hover:translate-x-0.5 transition-all text-left cursor-pointer py-0.5 min-h-[26px] flex items-center"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Action & Standards */}
          <div className="md:col-span-2 flex flex-col gap-2.5 sm:gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              Connect
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Partner with us to build robust industrial IoT & automation architectures.
            </p>
            <div>
              <button
                type="button"
                onClick={handleContactAction}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer min-h-[32px]"
              >
                <span>Get in Touch</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar: Copyright and Legal */}
        <motion.div 
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.15, ease: ENTERPRISE_EASING }}
          className="w-full pt-4 sm:pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400"
        >
          <p className="text-center sm:text-left">© {new Date().getFullYear()} G Mark Software Pvt. Ltd. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1.5 sm:gap-6">
            <button
              type="button"
              onClick={() => handleNav('help')}
              className="hover:text-white transition-colors cursor-pointer py-0.5"
            >
              Privacy Policy
            </button>
            <span className="text-neutral-700">•</span>
            <button
              type="button"
              onClick={() => handleNav('help')}
              className="hover:text-white transition-colors cursor-pointer py-0.5"
            >
              Terms of Service
            </button>
            <span className="text-neutral-700">•</span>
            <span className="inline-flex items-center gap-1.5 text-neutral-300 bg-neutral-900 px-2.5 py-1 rounded-full border border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-[11px] text-neutral-200">Telemetry Systems Live</span>
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
