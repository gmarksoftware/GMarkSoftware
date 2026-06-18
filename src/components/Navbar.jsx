import { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Navbar({ currentView, onViewChange, activeSection }) {
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
    { label: '4M System', id: '4m-system', type: 'scroll', target: 'home' },
    { label: 'Support', id: 'support', type: 'view', target: 'support' },
    { label: 'Solutions', id: 'solutions', type: 'scroll', target: 'solutions' },
    { label: 'About G Mark', id: 'about', type: 'scroll', target: 'features' },
  ];

  const handleLinkClick = (item) => {
    setMobileMenuOpen(false);

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
    }
  };

  const handleMoreClick = () => {
    setMobileMenuOpen(false);
    if (onViewChange) {
      onViewChange('support');
    }
  };

  // Determine active item styling
  const isItemActive = (item) => {
    if (currentView === 'support') {
      return item.id === 'support';
    }
    if (currentView === 'home') {
      if (item.id === 'support') return false;
      if (item.id === 'home' && activeSection === 'home') return true;
      if (item.id === '4m-system' && activeSection === '4m-system') return true;
      if (item.id === 'solutions' && activeSection === 'solutions') return true;
      if (item.id === 'about' && activeSection === 'features') return true;
    }
    return false;
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
        ? 'h-[70px] bg-bg-primary/95 shadow-lg border-white/5 backdrop-blur-md'
        : 'h-[80px] bg-transparent border-transparent'
        }`}>
        <nav className="max-w-7xl mx-auto px-6 md:px-8 h-full flex items-center justify-between" aria-label="Main Navigation">

          {/* Logo link */}
          <a href="#home" onClick={(e) => { e.preventDefault(); handleLinkClick({ type: 'view', target: 'home' }); }} className="no-underline">
            <Logo />
          </a>

          {/* Desktop Links and Get Started CTA Grouped on Right */}
          <div className="hidden md:flex items-center gap-10">
            <ul className="flex items-center gap-8 list-none m-0 p-0">
              {navItems.map((item) => (
                <li key={item.id} className="relative group">
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(item);
                    }}
                    className={`text-[0.95rem] font-medium transition-colors duration-200 ${isItemActive(item) ? 'text-accent-red' : 'text-text-secondary hover:text-accent-red'
                      }`}
                  >
                    {item.label}
                  </a>
                  {isItemActive(item) && (
                    <span className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-accent-red rounded-full animate-fadeIn" />
                  )}
                </li>
              ))}
              <li className="relative">
                <a
                  href="#more"
                  onClick={(e) => { e.preventDefault(); handleMoreClick(); }}
                  className={`text-[0.95rem] font-medium transition-colors duration-200 ${currentView === 'support' ? 'text-accent-red' : 'text-text-secondary hover:text-accent-red'
                    }`}
                >
                  More
                </a>
              </li>
            </ul>

            <button
              onClick={() => handleMoreClick()}
              className="inline-flex items-center justify-center px-6 py-2 bg-accent-red text-on-primary-fixed hover:bg-accent-red-hover text-sm font-bold rounded shadow-md shadow-accent-red-glow transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Mobile elements (Get Started & Hamburger) */}
          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={() => handleMoreClick()}
              className="hidden sm:inline-flex items-center justify-center px-6 py-2 bg-accent-red text-on-primary-fixed hover:bg-accent-red-hover text-sm font-bold rounded shadow-md shadow-accent-red-glow transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
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
      <aside className={`fixed top-0 right-0 w-[80%] max-w-[320px] h-screen bg-bg-secondary border-l border-border-color py-32 px-8 z-40 md:hidden flex flex-col justify-between transition-transform duration-300 shadow-2xl ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
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
                className={`text-lg font-bold font-title block py-2 transition-colors duration-200 ${isItemActive(item) ? 'text-accent-red' : 'text-text-primary hover:text-accent-red'
                  }`}
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#more"
              onClick={(e) => { e.preventDefault(); handleMoreClick(); }}
              className={`text-lg font-bold font-title block py-2 transition-colors duration-200 ${currentView === 'support' ? 'text-accent-red' : 'text-text-primary hover:text-accent-red'
                }`}
            >
              More
            </a>
          </li>
        </ul>

        <div>
          <button
            onClick={() => handleMoreClick()}
            className="w-full bg-accent-red text-on-primary-fixed py-3 rounded font-bold hover:bg-accent-red-hover transition-colors duration-200 shadow-md shadow-accent-red-glow"
          >
            Get Started
          </button>
        </div>
      </aside>
    </>
  );
}
