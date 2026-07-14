import { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Navbar({ currentView, onViewChange, activeSection, onActiveSectionChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', id: 'home', type: 'view', target: 'home' },
    { label: 'Support', id: 'support', type: 'view', target: 'support' },
    { label: 'About G Mark', id: 'gmark', type: 'view', target: 'gmark' },
    { label: 'Contact', id: 'contact', type: 'view', target: 'contact' },
  ];

  const handleLinkClick = (item) => {
    setMobileMenuOpen(false);

    // Explicitly update the active section based on the clicked menu button
    if (onActiveSectionChange && item.id) {
      onActiveSectionChange(item.id);
    }

    if (item.type === 'view') {
      if (onViewChange) {
        onViewChange(item.target);
      }
      if (item.target === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (item.type === 'scroll') {
      if (onViewChange) {
        onViewChange('home');
      }
      // Delay slightly to let the view change and mount components
      setTimeout(() => {
        const element = document.getElementById(item.target);
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
    }
  };

  const handleMoreClick = () => {
    setMobileMenuOpen(false);
    if (onViewChange) {
      onViewChange('contact');
    }
  };

  // Determine active item styling
  const isItemActive = (item) => {
    if (currentView === item.id) {
      return true;
    }
    if (currentView === 'home') {
      if (item.id === 'support' || item.id === 'contact' || item.id === 'gmark') return false;
      if (item.id === 'home' && activeSection === 'home') return true;
      if (item.id === '4m-system' && activeSection === '4m-system') return true;
      if (item.id === 'solutions' && activeSection === 'solutions') return true;
    }
    return false;
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'opacity-0 pointer-events-none -translate-y-full'
        : 'h-[96px] bg-transparent opacity-100 translate-y-0'
        }`}>
        <nav className="w-full px-4 sm:px-6 md:px-8 h-full flex items-center justify-between" aria-label="Main Navigation">

          {/* Logo link */}
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleLinkClick({ id: 'home', type: 'view', target: 'home' }); }}
            className="no-underline shrink-0 animate-slideInFromLeft focus:outline-none focus-visible:outline-none"
          >
            <Logo compact={scrolled} />
          </a>

          {/* Desktop Links and Get Started CTA Grouped on Right */}
          <div className="hidden md:flex items-center gap-28 animate-slideInFromRight">
            <ul className="flex items-center gap-8 list-none m-0 p-0">
              {navItems.map((item) => (
                <li key={item.id} className="relative group">
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(item);
                    }}
                    className={`text-lg font-normal transition-colors duration-200 ${isItemActive(item) ? 'text-accent-red' : 'text-text-secondary hover:text-accent-red'
                      }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleMoreClick()}
              className="inline-flex items-center justify-center px-6 py-2 bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/50 text-[0.95rem] font-bold rounded shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Mobile elements (Get Started & Hamburger) */}
          <div className="flex md:hidden items-center gap-4 animate-slideInFromRight">
            <button
              onClick={() => handleMoreClick()}
              className="hidden sm:inline-flex items-center justify-center px-6 py-2 bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/50 text-sm font-bold rounded shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              Get Started
            </button>

            <button
              className="flex flex-col justify-center items-center gap-1.5 w-8 h-8 cursor-pointer relative z-50 bg-transparent border-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={`w-6 h-0.5 bg-text-primary rounded transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`} />
              <span className={`w-6 h-0.5 bg-text-primary rounded transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''
                }`} />
              <span className={`w-6 h-0.5 bg-text-primary rounded transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`} />
            </button>
          </div>

        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Drawer Sidebar */}
      <aside className={`fixed top-0 right-0 w-[42%] max-w-[170px] h-screen bg-transparent border-l border-transparent py-32 px-3 z-40 md:hidden flex flex-col justify-between transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <ul className="flex flex-col gap-6 list-none">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item);
                }}
                className={`text-sm font-semibold font-title block py-2 transition-colors duration-200 ${isItemActive(item) ? 'text-accent-red' : 'text-text-primary hover:text-accent-red'
                  }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div>
          <button
            onClick={() => handleMoreClick()}
            className="w-full bg-transparent text-white border border-white/30 py-2 rounded text-xs font-semibold hover:bg-white/10 hover:border-white/50 transition-colors duration-200 shadow-md"
          >
            Get Started
          </button>
        </div>
      </aside>
    </>
  );
}
