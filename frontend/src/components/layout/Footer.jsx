import Logo from './Logo';
import { WavePath } from '@/components/ui/wave-path';

export default function Footer({ onViewChange, currentView, onSelectSolution }) {
  const handleScrollToSection = (id) => {
    if (onViewChange) {
      onViewChange('home');
    }
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 90;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const hideContactCards = currentView === 'support' || currentView === 'contact';

  return (
    <footer className="relative border-t border-border-color bg-transparent backdrop-blur-md pt-12 pb-0 lg:pt-16 lg:pb-0 z-10 snap-footer">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Column 1: Logo & Contact Info */}
          <div className="md:col-span-5 space-y-6">
            <Logo />
            {!hideContactCards && (
              <div className="space-y-4 max-w-[280px]">
                <div className="space-y-1">
                  <p className="text-xs text-text-secondary leading-relaxed font-sans">
                    G Mark Software Pvt. Ltd.<br />
                    Moshi, Pune,<br />
                    Maharashtra, India - 412105
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-accent-red">Direct Contact</h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans">
                    <strong>Phone:</strong> +91-9657363967<br />
                    <strong>Email:</strong> gmarksoftware@gmail.com
                  </p>
                </div>
              </div>
            )}
            {/* Social Icons using Material Symbols */}
            <div className="flex gap-4">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded bg-white/5 flex items-center justify-center text-text-secondary hover:bg-accent-red hover:text-on-primary-fixed hover:-translate-y-0.5 hover:shadow-md hover:shadow-accent-red/20 transition-all duration-300"
                aria-label="Public Site"
              >
                <span className="material-symbols-outlined text-lg">public</span>
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded bg-white/5 flex items-center justify-center text-text-secondary hover:bg-accent-red hover:text-on-primary-fixed hover:-translate-y-0.5 hover:shadow-md hover:shadow-accent-red/20 transition-all duration-300"
                aria-label="Share"
              >
                <span className="material-symbols-outlined text-lg">share</span>
              </a>

            </div>
          </div>

          {/* Column 2: Solutions */}
          <div className="md:col-span-3 md:col-start-7 space-y-6">
            <h4 className="text-xs font-mono font-bold text-accent-red uppercase tracking-[0.2em]">Solutions</h4>
            <ul className="flex flex-col gap-3 text-sm text-text-secondary font-sans list-none p-0">
              <li>
                <a 
                  href="#systems-spotlight" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (onSelectSolution) {
                      onSelectSolution(1);
                    } else {
                      handleScrollToSection('systems-spotlight'); 
                    }
                  }} 
                  className="hover:text-accent-red transition-colors duration-200"
                >
                  GramUnnati
                </a>
              </li>
              <li>
                <a 
                  href="#systems-spotlight" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (onSelectSolution) {
                      onSelectSolution(2);
                    } else {
                      handleScrollToSection('systems-spotlight'); 
                    }
                  }} 
                  className="hover:text-accent-red transition-colors duration-200"
                >
                  IoT
                </a>
              </li>
              <li>
                <a 
                  href="#systems-spotlight" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (onSelectSolution) {
                      onSelectSolution(0);
                    } else {
                      handleScrollToSection('systems-spotlight'); 
                    }
                  }} 
                  className="hover:text-accent-red transition-colors duration-200"
                >
                  CMMS
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="md:col-span-3 md:col-start-10 space-y-6">
            <h4 className="text-xs font-mono font-bold text-accent-red uppercase tracking-[0.25em]">Company</h4>
            <ul className="flex flex-col gap-3 text-sm text-text-secondary font-sans list-none p-0">
              <li>
                <a 
                  href="#contact" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (onViewChange) {
                      onViewChange('contact');
                    }
                  }} 
                  className="hover:text-accent-red transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="#privacy" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (onViewChange) {
                      onViewChange('privacy');
                    }
                  }} 
                  className="hover:text-accent-red transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Animated wave separator line */}
        <WavePath className="mt-4 mb-2 text-accent-red/25 w-full" />

        {/* Copyright section */}
        <p className="text-[11px] text-text-muted font-sans m-0 pb-2">
          © {new Date().getFullYear()} by G Mark Software Pvt. Ltd. All Rights Reserved.
        </p>

      </div>
    </footer>
  );
}
