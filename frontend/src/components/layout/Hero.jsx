import { ParticleWave } from '@/components/ui/particle-wave';

export default function Hero({ onCTA }) {
  return (
    <header 
      id="home" 
      className="relative min-h-screen lg:h-screen lg:min-h-0 flex flex-col justify-center pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-20 lg:pb-8 overflow-hidden bg-transparent snap-section"
    >
      {/* 3D Particle Wave Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <ParticleWave className="w-full h-full opacity-80" opacity={0.9} baseColor="#DCEAFE" accentColor="#38BDF8" />
      </div>

      {/* Futuristic dark overlay gradients to fade into ambient bg and ensure readability */}
      <div className="absolute inset-0 pointer-events-none z-1 bg-linear-to-b from-[#05070D]/10 via-[#05070D]/70 to-[#05070D]" />
      <div className="absolute inset-0 pointer-events-none z-2 bg-[radial-gradient(circle_at_70%_30%,rgba(56,189,248,0.04),transparent_70%)]" />

      <div className="relative z-10 w-full px-6 md:px-8 pb-28 lg:pb-0">
        <div className="max-w-4xl space-y-8 md:space-y-10 lg:pt-20">
          <h1 id="hero-heading" className="font-display-lg text-4xl sm:text-6xl md:text-7xl font-light leading-[1.15] text-text-primary tracking-tight animate-slideInFromLeft">
            The New Standard <br/>
            of Digital <br className="hidden sm:block"/> <span className="text-text-primary">Industry</span>
          </h1>

          <p className="font-sans text-base sm:text-lg md:text-[1.2rem] text-text-secondary max-w-xl leading-relaxed animate-slideInFromLeft delay-150">
            Use Accurate Data to Get a <span className="text-accent-red font-normal">360-Degree</span> View of Your Business. Accelerate decisions with industrial-grade intelligence.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 mt-16 sm:mt-0 animate-slideInFromLeft delay-300">
            <button 
              onClick={onCTA}
              className="w-[170px] h-[48px] sm:w-[200px] sm:h-[56px] flex items-center justify-center bg-transparent text-accent-red border border-accent-red font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-accent-red/15 hover:bg-white/10 hover:border-white/50 hover:text-white hover:scale-[1.03] hover:shadow-xl hover:shadow-white/5 transition-all duration-300 cursor-pointer"
            >
              Learn More
            </button>
          </div>

          {/* Scroll to Explore Indicator */}
          <div 
            className="absolute bottom-0 left-6 lg:relative lg:bottom-auto lg:left-auto flex flex-col items-start pt-8 lg:pt-6 lg:mt-6 animate-slideInFromLeft delay-500 cursor-pointer group w-fit" 
            onClick={() => {
              const el = document.getElementById('systems-spotlight');
              if (el) {
                const offset = 90;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = el.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
              }
            }}
          >
            <div className="w-[2px] h-12 bg-linear-to-b from-border-color to-accent-red/50 mb-3" />
            <div className="flex items-center gap-2 text-text-secondary group-hover:text-accent-red transition-colors duration-300">
              <span className="material-symbols-outlined text-base animate-bounce">arrow_downward</span>
              <span className="text-xs font-mono uppercase tracking-[0.25em]">Scroll to Explore</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

