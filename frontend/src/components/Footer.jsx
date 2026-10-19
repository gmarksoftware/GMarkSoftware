import React from 'react';
import { Mail, Phone, MapPin, Globe, ArrowUpRight } from 'lucide-react';
import logoBlackImg from '../assets/G Mark-black.png';

export default function Footer({ onSelectTab, onNavigate, onOpenExpertModal }) {
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
    <footer className="w-full relative bg-white text-neutral-900 pt-10 sm:pt-14 md:pt-16 pb-10 sm:pb-12 overflow-hidden flex flex-col items-center justify-center font-['Inter',sans-serif]">
      {/* Background Subtle Micro Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Centered Main Container */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10 flex flex-col">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 pb-10 sm:pb-12 border-b border-neutral-200">
          
          {/* Col 1: Brand & Contact Info */}
          <div className="md:col-span-5 flex flex-col gap-4 sm:gap-5">
            <div className="flex items-center gap-3">
              <img
                src={logoBlackImg}
                alt="G-Mark Software Logo"
                className="h-9 sm:h-10 w-auto object-contain cursor-pointer"
                onClick={() => handleNav('home')}
              />
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-sm font-normal">
              Delivering high-performance industrial telemetry, 4M maintenance solutions, and intelligent IoT architectures to empower modern manufacturing.
            </p>

            {/* Direct Contact Info */}
            <div className="flex flex-col gap-2.5 pt-1 sm:pt-2 text-xs sm:text-sm text-neutral-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-neutral-800 shrink-0 mt-0.5" />
                <span className="leading-snug">G Mark Software Pvt. Ltd., Moshi, Pune, Maharashtra, India - 412105</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-neutral-800 shrink-0" />
                <a href="tel:+919657363967" className="hover:text-black transition-colors font-medium">
                  +91-9657363967
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-neutral-800 shrink-0" />
                <a href="mailto:gmarksoftware@gmail.com" className="hover:text-black transition-colors font-medium">
                  gmarksoftware@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Solutions */}
          <div className="md:col-span-3 flex flex-col gap-3.5 sm:gap-4">
            <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-[0.2em]">
              Solutions
            </h4>
            <ul className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5 text-xs sm:text-sm text-neutral-600">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home', 'applications-section')}
                  className="hover:text-black hover:translate-x-0.5 transition-all text-left cursor-pointer py-1 md:py-0 min-h-[30px] md:min-h-0 flex items-center"
                >
                  4M Maintenance CMMS
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home', 'applications-section')}
                  className="hover:text-black hover:translate-x-0.5 transition-all text-left cursor-pointer py-1 md:py-0 min-h-[30px] md:min-h-0 flex items-center"
                >
                  Industrial IoT Telemetry
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home', 'applications-section')}
                  className="hover:text-black hover:translate-x-0.5 transition-all text-left cursor-pointer py-1 md:py-0 min-h-[30px] md:min-h-0 flex items-center"
                >
                  GramUnnati Smart Agri-Tech
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home', 'data-vision-section')}
                  className="hover:text-black hover:translate-x-0.5 transition-all text-left cursor-pointer py-1 md:py-0 min-h-[30px] md:min-h-0 flex items-center"
                >
                  Cloud Edge Ecosystem
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Company Navigation */}
          <div className="md:col-span-2 flex flex-col gap-3.5 sm:gap-4">
            <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-[0.2em]">
              Company
            </h4>
            <ul className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5 text-xs sm:text-sm text-neutral-600">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="hover:text-black hover:translate-x-0.5 transition-all text-left cursor-pointer py-1 md:py-0 min-h-[30px] md:min-h-0 flex items-center"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('about')}
                  className="hover:text-black hover:translate-x-0.5 transition-all text-left cursor-pointer py-1 md:py-0 min-h-[30px] md:min-h-0 flex items-center"
                >
                  About G-Mark
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home', 'transformation-section')}
                  className="hover:text-black hover:translate-x-0.5 transition-all text-left cursor-pointer py-1 min-h-[30px] flex items-center"
                >
                  Workflow Blueprint
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home', 'community-section')}
                  className="hover:text-black hover:translate-x-0.5 transition-all text-left cursor-pointer py-1 min-h-[30px] flex items-center"
                >
                  Case Studies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('help')}
                  className="hover:text-black hover:translate-x-0.5 transition-all text-left cursor-pointer py-1 min-h-[30px] flex items-center"
                >
                  Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleContactAction}
                  className="hover:text-black hover:translate-x-0.5 transition-all text-left cursor-pointer py-1 min-h-[30px] flex items-center"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Action & Standards */}
          <div className="md:col-span-2 flex flex-col gap-3.5 sm:gap-4">
            <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-[0.2em]">
              Connect
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Partner with us to build robust industrial IoT & automation architectures.
            </p>
            <div>
              <button
                type="button"
                onClick={handleContactAction}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer min-h-[36px]"
              >
                <span>Get in Touch</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Legal */}
        <div className="w-full pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} G Mark Software Pvt. Ltd. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-6">
            <button
              type="button"
              onClick={() => handleNav('help')}
              className="hover:text-neutral-950 transition-colors cursor-pointer py-1"
            >
              Privacy Policy
            </button>
            <span className="text-neutral-300">•</span>
            <button
              type="button"
              onClick={() => handleNav('help')}
              className="hover:text-neutral-950 transition-colors cursor-pointer py-1"
            >
              Terms of Service
            </button>
            <span className="text-neutral-300">•</span>
            <span className="inline-flex items-center gap-1.5 text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-[11px] text-neutral-800">Telemetry Systems Live</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
