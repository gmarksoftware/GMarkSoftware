import { ParticleWave } from '@/components/ui/particle-wave';

export default function Hero({ onCTA }) {
  return (
    <header 
      id="home" 
      className="relative min-h-screen flex items-start pt-48 sm:pt-56 md:pt-64 overflow-hidden bg-transparent snap-section"
    >
      {/* 3D Particle Wave Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <ParticleWave className="w-full h-full opacity-80" opacity={0.9} baseColor="#DCEAFE" accentColor="#38BDF8" />
      </div>

      {/* Futuristic dark overlay gradients to fade into ambient bg and ensure readability */}
      <div className="absolute inset-0 pointer-events-none z-1 bg-linear-to-b from-[#05070D]/10 via-[#05070D]/70 to-[#05070D]" />
      <div className="absolute inset-0 pointer-events-none z-2 bg-[radial-gradient(circle_at_70%_30%,rgba(56,189,248,0.04),transparent_70%)]" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-8 w-full pb-16">
        <div className="max-w-4xl space-y-8 md:space-y-10">
          <h1 id="hero-heading" className="font-display-lg text-5xl sm:text-6xl md:text-7xl font-light leading-[1.15] text-text-primary tracking-tight animate-slideInFromLeft">
            The New Standard <br/>
            of Digital <br/>
            <span className="text-text-primary">Industry</span>
          </h1>

          <p className="font-sans text-lg md:text-[1.2rem] text-text-secondary max-w-xl leading-relaxed animate-slideInFromLeft delay-150">
            Use Accurate Data to Get a <span className="text-accent-red font-normal">360-Degree</span> View of Your Business. Accelerate decisions with industrial-grade intelligence.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 animate-slideInFromLeft delay-300">
            <button 
              onClick={onCTA}
              className="w-[200px] h-[56px] flex items-center justify-center bg-transparent text-accent-red border border-accent-red font-bold text-base rounded-xl shadow-lg shadow-accent-red/15 hover:bg-white/10 hover:border-white/50 hover:text-white hover:scale-[1.03] hover:shadow-xl hover:shadow-white/5 transition-all duration-300 cursor-pointer"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

