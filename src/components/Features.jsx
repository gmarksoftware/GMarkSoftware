import { useEffect, useRef } from 'react';
import { Component as GlobeComponent } from './ui/globe';

export default function Features({ onCTA }) {
  const velocityCanvasRef = useRef(null);

  // Velocity Particle Animation
  useEffect(() => {
    const canvas = velocityCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();

    // Create stream particles moving horizontally
    const density = 40;
    for (let i = 0; i < density; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 4 + 2,
        opacity: Math.random() * 0.15 + 0.05
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(249, 90, 90, ${p.opacity})`;
        ctx.lineWidth = 1;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.length, p.y);
        ctx.stroke();

        // Move particle
        p.x += p.speed;
        
        // Reset if offscreen
        if (p.x - p.length > canvas.width) {
          p.x = 0;
          p.y = Math.random() * canvas.height;
          p.speed = Math.random() * 4 + 2;
          p.opacity = Math.random() * 0.15 + 0.05;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const services = [
    {
      num: '01',
      title: 'Custom Software Development',
      desc: 'Web, Mobile, and Enterprise Applications. We build tailor-made platforms designed for high throughput.',
      icon: 'code'
    },
    {
      num: '02',
      title: 'Cloud Solutions',
      desc: 'AWS, Azure, and Google Cloud setups. Fully optimized for cost, scalability, and security.',
      icon: 'cloud'
    },
    {
      num: '03',
      title: 'Artificial Intelligence',
      desc: 'Machine learning models, workflows automation, and deep industrial analytics.',
      icon: 'psychology'
    },
    {
      num: '04',
      title: 'IoT Development',
      desc: 'Industrial telemetry monitoring, smart hardware sync, and edge analytics data hubs.',
      icon: 'settings_remote'
    },
    {
      num: '05',
      title: 'UI/UX Design',
      desc: 'Modern interface blueprints engineered for maximum velocity, clarity, and visual impact.',
      icon: 'draw'
    },
    {
      num: '06',
      title: 'IT Consulting',
      desc: 'Enterprise technology roadmap planning, system architecture audits, and digital scale strategies.',
      icon: 'insights'
    }
  ];

  return (
    <>
      {/* Higher Grounds Bento Section */}
      <section id="features" className="relative border-t border-border-color bg-transparent py-24 lg:py-32 overflow-hidden">
        <div className="mesh-bg" />
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Copy block */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 flex flex-col gap-6">
              <GlobeComponent />
              <span className="text-xs font-mono font-bold text-accent-red uppercase tracking-[0.2em] bg-accent-red/10 border border-accent-red/20 px-3 py-1 rounded-sm self-start">
                Capabilities
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold font-title leading-[1.15] text-text-primary tracking-tight">
                Let Your Data Take Your Business to <span className="text-accent-red italic text-shadow-red">Higher Grounds</span>
              </h2>
              <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-xl">
                We aim to deliver intuitive high-tech platforms that enable industries to effortlessly shift from the physical world to the digital age. Recognizing the obstacles that come with this change, our cutting solutions are crafted to streamline the transition, boost efficiency, and promote growth.
              </p>
              <div className="flex items-center gap-4 text-accent-red pt-4 border-t border-border-color/30">
                <span className="font-extrabold tracking-tighter text-3xl font-mono">G_</span>
                <span className="font-mono text-xs font-bold tracking-widest text-text-muted uppercase">
                  Transforming Assets Into Intelligence
                </span>
              </div>
            </div>

            {/* Right Bento Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Column 1: Card 1 & Card 3 */}
              <div className="flex flex-col gap-8">
                {/* Data Privacy Card */}
                <div className="relative group p-8 rounded-xl bg-bg-secondary/40 border border-border-color backdrop-blur-md hover:border-accent-blue/40 hover:shadow-2xl hover:shadow-accent-blue-glow/15 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-blue/0 group-hover:bg-accent-blue transition-all duration-300" />
                  <div className="w-12 h-12 rounded bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue mb-6 transition-all duration-300 group-hover:scale-105 group-hover:bg-accent-blue group-hover:text-[#05070D]">
                    <span className="material-symbols-outlined text-2xl">lock</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">Data Privacy</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    At our company, we prioritize data privacy by implementing robust security measures. We use encryption, access controls, and regular audits to ensure your confidential information remains safe and secure at all times.
                  </p>
                </div>

                {/* Versatility in Application Card */}
                <div className="relative group p-8 rounded-xl bg-bg-secondary/40 border border-border-color backdrop-blur-md hover:border-accent-blue/40 hover:shadow-2xl hover:shadow-accent-blue-glow/15 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-blue/0 group-hover:bg-accent-blue transition-all duration-300" />
                  <div className="w-12 h-12 rounded bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue mb-6 transition-all duration-300 group-hover:scale-105 group-hover:bg-accent-blue group-hover:text-[#05070D]">
                    <span className="material-symbols-outlined text-2xl">grid_view</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">Versatility in Application</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Our platform's allows easy integration with other applications, streamlining processes and enhancing productivity for a more efficient workflow across diverse sectors.
                  </p>
                </div>
              </div>

              {/* Column 2: Card 2 & Card 4 (Shifted down on md screen) */}
              <div className="flex flex-col gap-8 md:mt-12">
                {/* Detailed Insights Card */}
                <div className="relative group p-8 rounded-xl bg-bg-secondary/40 border border-border-color backdrop-blur-md hover:border-accent-blue/40 hover:shadow-2xl hover:shadow-accent-blue-glow/15 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-blue/0 group-hover:bg-accent-blue transition-all duration-300" />
                  <div className="w-12 h-12 rounded bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue mb-6 transition-all duration-300 group-hover:scale-105 group-hover:bg-accent-blue group-hover:text-[#05070D]">
                    <span className="material-symbols-outlined text-2xl">analytics</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">Detailed Insights</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Gain detailed insights into your industry to empower data-driven decisions and minimize errors, ensuring your business stays ahead of curve with real-time telemetry.
                  </p>
                </div>

                {/* Full Customer Experience Card */}
                <div className="relative group p-8 rounded-xl bg-bg-secondary/40 border border-border-color backdrop-blur-md hover:border-accent-blue/40 hover:shadow-2xl hover:shadow-accent-blue-glow/15 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-blue/0 group-hover:bg-accent-blue transition-all duration-300" />
                  <div className="w-12 h-12 rounded bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue mb-6 transition-all duration-300 group-hover:scale-105 group-hover:bg-accent-blue group-hover:text-[#05070D]">
                    <span className="material-symbols-outlined text-2xl">support_agent</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">Full Customer Experience</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Our after-sales support is quick and attentive, guaranteeing a smooth customer experience. Your satisfaction is our top priority, and we're here to assist you through every upgrade cycle.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Services Grid Section */}
      <section id="solutions" className="py-24 border-t border-border-color bg-bg-secondary/30 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <div className="max-w-[700px] mb-16">
            <span className="text-xs font-mono font-bold text-accent-red uppercase tracking-[0.2em] bg-accent-red/10 border border-accent-red/20 px-3 py-1 rounded-sm inline-block mb-3">
              Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-title leading-tight text-text-primary tracking-tight mb-4">
              End-to-End IT Solutions
            </h2>
            <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
              We combine deep technical expertise with industry standards to deliver high-quality, scalable applications, custom telemetry syncs, and intelligent automations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((item) => (
              <article
                key={item.num}
                className="relative group p-8 bg-bg-secondary rounded-xl border border-border-color hover:border-accent-red/35 hover:bg-bg-tertiary/60 transition-all duration-300 overflow-hidden shadow-lg hover:-translate-y-1"
              >
                <div className="absolute bottom-0 left-0 h-[3px] bg-accent-red w-0 group-hover:w-full transition-all duration-300" />
                <div className="flex justify-between items-start mb-6">
                  <div className="w-11 h-11 rounded bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red group-hover:bg-accent-red group-hover:text-on-primary-fixed transition-colors duration-300">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-accent-red/60">{item.num}</span>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Unprecedented Velocity Section */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden bg-surface-container-lowest border-t border-b border-border-color">
        {/* Dynamic Velocity Particle Stream */}
        <canvas ref={velocityCanvasRef} className="absolute inset-0 pointer-events-none opacity-40" />

        <div className="absolute inset-0 bg-linear-to-t from-[#121414] via-transparent to-[#121414] opacity-90 z-2" />
        
        <div className="relative z-10 text-center max-w-4xl px-margin-x space-y-8">
          <h2 className="font-display-lg text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-text-primary tracking-tight">
            Unprecedented <span className="text-accent-red text-shadow-red italic">Velocity.</span><br/>
            Impeccable Reliability.
          </h2>
          <p className="font-sans text-base md:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed opacity-90">
            We envision a future where digitalization drives efficiency and innovation. By leveraging advanced data analysis and cutting-edge solutions, we empower businesses to make informed decisions.
          </p>
          <button 
            onClick={onCTA}
            className="bg-accent-red text-on-primary-fixed hover:bg-accent-red-hover px-10 py-5 font-bold uppercase tracking-widest text-xs rounded shadow-lg shadow-accent-red/25 transition-all duration-300 hover:scale-105 cursor-pointer inline-block"
          >
            Discover Our Vision
          </button>
        </div>
      </section>

      {/* Metrics Row Section */}
      <section className="py-20 bg-bg-secondary/40 border-b border-border-color">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h3 className="text-center font-mono text-xs font-bold text-accent-red uppercase tracking-[0.25em] mb-12">
            We Take Pride In Our Numbers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center items-center">
            
            <div className="space-y-2">
              <div className="text-5xl font-extrabold text-accent-red font-title tracking-tight leading-none">15</div>
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Years Experience</div>
            </div>

            <div className="space-y-2 border-l border-border-color/30">
              <div className="text-5xl font-extrabold text-accent-red font-title tracking-tight leading-none">10K</div>
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Partners</div>
            </div>

            <div className="space-y-2 border-l border-border-color/30">
              <div className="text-5xl font-extrabold text-accent-red font-title tracking-tight leading-none">25M</div>
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Installed</div>
            </div>

            <div className="space-y-2 border-l border-border-color/30">
              <div className="text-5xl font-extrabold text-accent-red font-title tracking-tight leading-none">22</div>
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Countries</div>
            </div>

            <div className="space-y-2 border-l border-border-color/30">
              <div className="text-5xl font-extrabold text-accent-red font-title tracking-tight leading-none">5</div>
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Awards</div>
            </div>

          </div>
        </div>
      </section>

      {/* Accelerated CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <div className="glass-panel p-8 md:p-16 rounded-xl overflow-hidden relative group">
            {/* Ambient Background Gradient for Glow */}
            <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-accent-red/10 blur-[120px] rounded-full group-hover:bg-accent-red/15 transition-all duration-500" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold font-title leading-tight text-text-primary tracking-tight">
                  Are You Ready to <span className="text-accent-red italic text-shadow-red">Accelerate</span> Your Business?
                </h2>
                <div className="w-20 h-1 bg-accent-red rounded-full" />
              </div>
              <div className="space-y-6">
                <p className="text-text-secondary text-base leading-relaxed">
                  In our pursuit of industry transformation, we envision a future where digitalization drives efficiency and innovation. By leveraging advanced data analysis, we empower businesses to make informed decisions and unlock new opportunities.
                </p>
                <button 
                  onClick={onCTA}
                  className="bg-accent-red text-on-primary-fixed hover:bg-accent-red-hover px-10 py-4 font-bold text-sm uppercase rounded shadow-lg shadow-accent-red/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer inline-block"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
