export default function Hero({ onCTA }) {
  return (
    <header 
      id="home" 
      className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-transparent"
    >
      {/* Decorative radial gradients */}
      <div className="absolute inset-0 pointer-events-none z-2 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.04),transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full py-16">
        <div className="max-w-4xl space-y-6 md:space-y-8 animate-fadeIn">
          <h1 className="font-display-lg text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] text-text-primary tracking-tight">
            The New Standard <br/>
            <span className="text-text-primary">of Digital Industry</span>
          </h1>

          <p className="font-sans text-base md:text-lg text-text-secondary max-w-2xl leading-relaxed">
            Use Accurate Data to Get a <span className="text-accent-red font-semibold">360-Degree</span> View of Your Business. Accelerate decisions with industrial-grade intelligence.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={onCTA}
              className="bg-accent-red text-on-primary-fixed hover:bg-accent-red-hover px-8 py-4 font-bold text-base rounded shadow-lg shadow-accent-red/25 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

