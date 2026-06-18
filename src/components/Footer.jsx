import Logo from './Logo';

export default function Footer({ onViewChange }) {
  const handleScrollToSection = (id) => {
    if (onViewChange) {
      onViewChange('home');
    }
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
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

  return (
    <footer className="relative border-t border-border-color bg-transparent backdrop-blur-md py-16 lg:py-24 z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Footer 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Logo & Contact Info */}
          <div className="space-y-6">
            <Logo showText={true} />
            <p className="text-sm text-text-secondary leading-relaxed font-sans">
              +91-9657363967<br />
              gmarksoftware@gmail.com<br />
              Moshi, Pune, Maharashtra - 412105
            </p>
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
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()} 
                className="w-9 h-9 rounded bg-white/5 flex items-center justify-center text-text-secondary hover:bg-accent-red hover:text-on-primary-fixed hover:-translate-y-0.5 hover:shadow-md hover:shadow-accent-red/20 transition-all duration-300"
                aria-label="Contact Support"
              >
                <span className="material-symbols-outlined text-lg">contact_support</span>
              </a>
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-6">
            <h4 className="text-xs font-mono font-bold text-accent-red uppercase tracking-[0.2em]">Solutions</h4>
            <ul className="flex flex-col gap-3 text-sm text-text-secondary font-sans list-none p-0">
              <li>
                <a href="#solutions" onClick={(e) => { e.preventDefault(); handleScrollToSection('solutions'); }} className="hover:text-accent-red transition-colors duration-200">
                  Digital Twins
                </a>
              </li>
              <li>
                <a href="#solutions" onClick={(e) => { e.preventDefault(); handleScrollToSection('solutions'); }} className="hover:text-accent-red transition-colors duration-200">
                  Edge Computing
                </a>
              </li>
              <li>
                <a href="#solutions" onClick={(e) => { e.preventDefault(); handleScrollToSection('solutions'); }} className="hover:text-accent-red transition-colors duration-200">
                  Predictive AI
                </a>
              </li>
              <li>
                <a href="#solutions" onClick={(e) => { e.preventDefault(); handleScrollToSection('solutions'); }} className="hover:text-accent-red transition-colors duration-200">
                  IIoT Platforms
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-6">
            <h4 className="text-xs font-mono font-bold text-accent-red uppercase tracking-[0.2em]">Company</h4>
            <ul className="flex flex-col gap-3 text-sm text-text-secondary font-sans list-none p-0">
              <li>
                <a href="#privacy-policy" onClick={(e) => { e.preventDefault(); handleScrollToSection('features'); }} className="hover:text-accent-red transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#support" onClick={(e) => { e.preventDefault(); if (onViewChange) onViewChange('support'); }} className="hover:text-accent-red transition-colors duration-200">
                  Support
                </a>
              </li>
              <li>
                <a href="#vision" onClick={(e) => { e.preventDefault(); handleScrollToSection('features'); }} className="hover:text-accent-red transition-colors duration-200">
                  Vision
                </a>
              </li>
              <li>
                <a href="#programs" onClick={(e) => { e.preventDefault(); handleScrollToSection('solutions'); }} className="hover:text-accent-red transition-colors duration-200">
                  Programs
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-6">
            <h4 className="text-xs font-mono font-bold text-accent-red uppercase tracking-[0.2em]">Newsletter</h4>
            <p className="text-sm text-text-secondary leading-relaxed font-sans">
              Stay updated with our latest industry insights.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-bg-secondary border border-border-color px-4 py-2.5 w-full focus:border-accent-red focus:bg-bg-tertiary outline-none text-text-primary text-sm rounded-l transition-all duration-200"
                required
              />
              <button 
                type="submit" 
                className="bg-accent-red text-on-primary-fixed hover:bg-accent-red-hover px-4 rounded-r font-bold transition-all duration-300 flex items-center justify-center cursor-pointer"
                aria-label="Subscribe"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </form>
            <p className="text-[11px] text-text-muted pt-4 font-sans">
              © {new Date().getFullYear()} by G Mark Software Pvt. Ltd. All Rights Reserved.
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}
