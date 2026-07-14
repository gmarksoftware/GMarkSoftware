import { useState, useEffect, useRef } from 'react';
import { Component as GlobeComponent } from '@/components/ui/globe';
import { ParticleWave } from '@/components/ui/particle-wave';
import { motion, useInView } from 'framer-motion';
import Footer from './Footer';

import step1 from '@/assets/step1.png';
import step2 from '@/assets/step2.png';
import step3 from '@/assets/step3.png';
import step4 from '@/assets/step4.png';
import step5 from '@/assets/step5.png';
import step6 from '@/assets/step6.png';

export default function Features({ onCTA, onViewChange, onSelectSolution }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });

  const cardVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: (customDelay) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
        delay: customDelay
      }
    })
  };

  const [activeStep, setActiveStep] = useState(-1);

  const phases = [
    {
      num: '1',
      title: 'Ideas & Capture',
      desc: 'Understand your vision, business goals, and project requirements through detailed discussions.',
      desc2: 'Gather key features, target audience, and project scope to build a strong foundation.',
      image: step1
    },
    {
      num: '2',
      title: 'Strategy & Planning',
      desc: 'Create a strategic roadmap with clear milestones, timelines, and technology selection.',
      desc2: 'Plan the project architecture and development approach for smooth execution.',
      image: step2
    },
    {
      num: '3',
      title: 'Blueprint & Design',
      desc: 'Design intuitive wireframes and modern UI/UX focused on user experience.',
      desc2: 'Create responsive layouts and interactive prototypes before development begins.',
      image: step3
    },
    {
      num: '4',
      title: 'Development Build',
      desc: 'Transform approved designs into a fast, secure, and scalable digital solution.',
      desc2: 'Develop the frontend, backend, APIs, and database with best coding practices.',
      image: step4
    },
    {
      num: '5',
      title: 'Testing & QA',
      desc: 'Perform comprehensive testing to ensure quality, security, and performance.',
      desc2: 'Fix bugs and verify seamless functionality across all devices and browsers.',
      image: step5
    },
    {
      num: '6',
      title: 'Launch Verification',
      desc: 'Deploy the application with final checks, optimization, and security validation.',
      desc2: 'Monitor performance, configure the live environment, and provide ongoing support.',
      image: step6
    }
  ];

  return (
    <>
      {/* Higher Grounds Bento Section */}
      <section ref={sectionRef} id="features" className="relative border-t border-border-color bg-transparent min-h-[580px] lg:min-h-screen flex items-center overflow-hidden snap-section">
        <div className="mesh-bg" />
        <div className="w-full px-6 md:px-8 relative z-10 py-6 lg:py-4 xl:py-8">

          {/* Section Heading at top */}
          <motion.div
            className="max-w-4xl mb-6 lg:mb-4 xl:mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl lg:text-4xl font-extrabold font-title leading-tight text-text-primary tracking-tight mb-4">
              Let Your Data Take Your Business to <span className="text-accent-red italic text-shadow-red">Higher Grounds</span>
            </h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-3xl">
              We aim to deliver intuitive high-tech platforms that enable industries to effortlessly shift from the physical world to the digital age. Recognizing the obstacles that come with this change, our cutting solutions are crafted to streamline the transition, boost efficiency, and promote growth.
            </p>
          </motion.div>

          {/* 3-Column Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4 xl:gap-6 items-stretch w-full">

            {/* Column 1: Resized Globe Card */}
            <motion.div
              className="flex flex-col h-full justify-stretch"
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0}
              variants={cardVariants}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <GlobeComponent className="h-full" />
            </motion.div>

            {/* Column 2: Data Privacy & Versatility in Application */}
            <div className="flex flex-col gap-6 lg:gap-4 xl:gap-8 justify-between h-full">
              {/* Data Privacy Card */}
              <motion.div
                className="relative group p-6 lg:p-4 xl:p-6 rounded-xl bg-linear-to-b from-bg-secondary/40 to-bg-secondary/20 hover:from-bg-tertiary/60 hover:to-bg-secondary/50 border border-border-color backdrop-blur-md hover:border-accent-red/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_25px_rgba(255,90,95,0.25)] transition-all duration-300 overflow-hidden flex-1 flex flex-col justify-center"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={0.2}
                variants={cardVariants}
                whileHover={{ scale: 1.03 }}
                style={{ willChange: 'transform, opacity' }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-red/0 group-hover:bg-accent-red transition-all duration-300" />
                <div className="w-10 h-10 rounded bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red mb-4 lg:mb-2 xl:mb-4 transition-all duration-300 group-hover:scale-105 group-hover:bg-accent-red group-hover:text-[#05070D] group-hover:-translate-y-1.5">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2 lg:mb-1 xl:mb-2">Data Privacy</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  At our company, we prioritize data privacy by implementing robust security measures. We use encryption, access controls, and regular audits to ensure your confidential information remains safe and secure at all times.
                </p>
              </motion.div>

              {/* Versatility in Application Card */}
              <motion.div
                className="relative group p-6 lg:p-4 xl:p-6 rounded-xl bg-linear-to-b from-bg-secondary/40 to-bg-secondary/20 hover:from-bg-tertiary/60 hover:to-bg-secondary/50 border border-border-color backdrop-blur-md hover:border-accent-red/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_25px_rgba(255,90,95,0.25)] transition-all duration-300 overflow-hidden flex-1 flex flex-col justify-center"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={0.6}
                variants={cardVariants}
                whileHover={{ scale: 1.03 }}
                style={{ willChange: 'transform, opacity' }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-red/0 group-hover:bg-accent-red transition-all duration-300" />
                <div className="w-10 h-10 rounded bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red mb-4 lg:mb-2 xl:mb-4 transition-all duration-300 group-hover:scale-105 group-hover:bg-accent-red group-hover:text-[#05070D] group-hover:-translate-y-1.5">
                  <span className="material-symbols-outlined text-xl">grid_view</span>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2 lg:mb-1 xl:mb-2">Versatility in Application</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Our platform's allows easy integration with other applications, streamlining processes and enhancing productivity for a more efficient workflow across diverse sectors.
                </p>
              </motion.div>
            </div>

            {/* Column 3: Detailed Insights & Full Customer Experience */}
            <div className="flex flex-col gap-6 lg:gap-4 xl:gap-8 justify-between h-full">
              {/* Detailed Insights Card */}
              <motion.div
                className="relative group p-6 lg:p-4 xl:p-6 rounded-xl bg-linear-to-b from-bg-secondary/40 to-bg-secondary/20 hover:from-bg-tertiary/60 hover:to-bg-secondary/50 border border-border-color backdrop-blur-md hover:border-accent-red/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_25px_rgba(255,90,95,0.25)] transition-all duration-300 overflow-hidden flex-1 flex flex-col justify-center"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={0.4}
                variants={cardVariants}
                whileHover={{ scale: 1.03 }}
                style={{ willChange: 'transform, opacity' }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-red/0 group-hover:bg-accent-red transition-all duration-300" />
                <div className="w-10 h-10 rounded bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red mb-4 lg:mb-2 xl:mb-4 transition-all duration-300 group-hover:scale-105 group-hover:bg-accent-red group-hover:text-[#05070D] group-hover:-translate-y-1.5">
                  <span className="material-symbols-outlined text-xl">analytics</span>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2 lg:mb-1 xl:mb-2">Detailed Insights</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Gain detailed insights into your industry to empower data-driven decisions and minimize errors, ensuring your business stays ahead of curve with real-time telemetry.
                </p>
              </motion.div>

              {/* Full Customer Experience Card */}
              <motion.div
                className="relative group p-6 lg:p-4 xl:p-6 rounded-xl bg-linear-to-b from-bg-secondary/40 to-bg-secondary/20 hover:from-bg-tertiary/60 hover:to-bg-secondary/50 border border-border-color backdrop-blur-md hover:border-accent-red/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_25px_rgba(255,90,95,0.25)] transition-all duration-300 overflow-hidden flex-1 flex flex-col justify-center"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={0.8}
                variants={cardVariants}
                whileHover={{ scale: 1.03 }}
                style={{ willChange: 'transform, opacity' }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-red/0 group-hover:bg-accent-red transition-all duration-300" />
                <div className="w-10 h-10 rounded bg-[#1A1D24]/10 border border-[#1A1D24]/20 flex items-center justify-center text-accent-red mb-4 lg:mb-2 xl:mb-4 transition-all duration-300 group-hover:scale-105 group-hover:bg-accent-red group-hover:text-[#05070D] group-hover:-translate-y-1.5">
                  <span className="material-symbols-outlined text-xl">support_agent</span>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2 lg:mb-1 xl:mb-2">Full Customer Experience</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Our after-sales support is quick and attentive, guaranteeing a smooth customer experience. Your satisfaction is our top priority, and we're here to assist you through every upgrade cycle.
                </p>
              </motion.div>
            </div>

          </div>

        </div>
      </section>

      {/* Mastery in Every Phase Section */}
      <section id="solutions" className="min-h-screen flex items-center border-t border-border-color bg-bg-secondary/30 relative snap-section py-20 lg:py-24">
        <div className="w-full px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Heading and Guarantee */}
            <motion.div 
              className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-32"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <span className="text-xs font-mono font-bold text-accent-red uppercase tracking-[0.25em] mb-3 block">
                  Workflow Blueprint
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-title leading-tight text-text-primary tracking-tight mb-4">
                  Mastery in Every Phase
                </h2>
                <p className="text-text-secondary leading-relaxed text-sm sm:text-base font-sans">
                  We follow a disciplined, telemetry-driven workflow to transition your industrial vision into an optimized digital platform.
                </p>
              </div>

              {/* Vertical Connector and Guarantee Card */}
              <div className="flex flex-col items-center lg:items-start mt-4">
                <div className="w-[2px] h-12 bg-linear-to-b from-border-color to-accent-red/50 mb-3" />
                <div className="flex items-center gap-2 text-accent-red mb-4">
                  <span className="material-symbols-outlined text-base animate-bounce">arrow_downward</span>
                </div>
                
                {/* Guarantee Card */}
                <div className="w-full glass-panel p-6 rounded-xl border border-accent-red/25 bg-accent-red/5 hover:bg-accent-red/10 transition-all duration-300 hover:shadow-xl hover:shadow-accent-red-glow/10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-red" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red group-hover:scale-105 transition-transform duration-300">
                      <span className="material-symbols-outlined text-xl">verified</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent-red mb-1">Our Guarantee</h4>
                      <p className="text-lg font-bold text-text-primary group-hover:text-accent-red transition-colors duration-200">
                        Fast-Track Delivery
                      </p>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed font-sans">
                        We commit to rapid iteration cycles, deploying production-ready milestones on schedule without compromising on security or scale.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Interactive Vertical Timeline */}
            <div className="lg:col-span-7 relative">
              {/* Vertical line through timeline dots */}
              <div className="absolute left-[21px] top-6 bottom-6 w-[2px] bg-border-color/50" />

              <div className="space-y-6">
                {phases.map((phase, index) => (
                  <motion.div
                    key={phase.num}
                    className="relative flex gap-6 group"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                    onMouseEnter={() => {
                      if (window.matchMedia('(hover: hover)').matches) {
                        setActiveStep(index);
                      }
                    }}
                    onClick={() => setActiveStep(prev => prev === index ? -1 : index)}
                  >
                    {/* Glowing dot on timeline */}
                    <div className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full bg-bg-primary border-2 transition-all duration-300 ${
                      activeStep === index 
                        ? 'border-accent-red shadow-md shadow-accent-red-glow/30' 
                        : 'border-border-color group-hover:border-accent-red/60 group-hover:shadow-md group-hover:shadow-accent-red-glow/20'
                    }`}>
                      <span className={`font-mono text-xs font-bold transition-colors duration-300 ${
                        activeStep === index 
                          ? 'text-accent-red' 
                          : 'text-text-secondary group-hover:text-accent-red'
                      }`}>
                        {phase.num}
                      </span>
                    </div>

                    {/* Phase Info Card */}
                    <div className={`flex-1 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      activeStep === index 
                        ? 'border-accent-red/60 bg-bg-secondary/60 shadow-lg shadow-accent-red-glow/20 scale-[1.02]' 
                        : 'border-border-color/10 bg-bg-secondary/40 hover:border-border-hover'
                    }`}>
                      <div className="flex justify-between items-start gap-4 mb-1.5">
                        <h3 className={`text-base font-bold transition-colors duration-300 ${
                          activeStep === index ? 'text-accent-red' : 'text-text-primary'
                        }`}>
                          {phase.title}
                        </h3>
                      </div>
                      
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={
                          activeStep === index 
                            ? { height: 'auto', opacity: 1 } 
                            : { height: 0, opacity: 0 }
                        }
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <motion.div
                          initial={{ y: 15, opacity: 0 }}
                          animate={
                            activeStep === index 
                              ? { y: 0, opacity: 1 } 
                              : { y: 15, opacity: 0 }
                          }
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="pt-2 border-t border-border-color/5 flex flex-col md:flex-row gap-4 items-center justify-between"
                        >
                          <div className="flex-1 space-y-1.5">
                            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
                              {phase.desc}
                            </p>
                            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
                              {phase.desc2}
                            </p>
                          </div>
                          {phase.image && (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 relative overflow-hidden select-none pointer-events-none">
                              <img 
                                src={phase.image} 
                                alt={phase.title} 
                                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]" 
                              />
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Combined Velocity and Metrics Section */}
      <section className="min-h-screen flex flex-col bg-transparent border-b border-border-color snap-section">
        {/* Unprecedented Velocity */}
        <motion.div
          className="relative flex-1 py-12 md:py-16 flex items-center justify-center overflow-hidden bg-surface-container-lowest border-t border-b border-border-color"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'transform, opacity' }}
        >
          {/* 3D Particle Wave Background */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <ParticleWave className="w-full h-full opacity-60" />
          </div>

          <div className="absolute inset-0 bg-linear-to-t from-[#121414] via-transparent to-[#121414] opacity-90 z-2" />

          <div className="relative z-10 text-center max-w-4xl px-margin-x space-y-6">
            <h2 className="font-display-lg text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-text-primary tracking-tight">
              Unprecedented <span className="text-accent-red text-shadow-red italic">Velocity.</span><br />
              Impeccable Reliability.
            </h2>
            <p className="font-sans text-base md:text-[1.05rem] text-text-secondary max-w-xl mx-auto leading-relaxed opacity-90">
              We envision a future where digitalization drives efficiency and innovation. By leveraging advanced data analysis and cutting-edge solutions, we empower businesses to make informed decisions.
            </p>
            <button
              onClick={onCTA}
              className="bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/50 px-8 py-3.5 font-bold uppercase tracking-widest text-xs rounded shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer inline-block"
            >
              Discover Our Vision
            </button>
          </div>
        </motion.div>

        {/* Metrics Row Section */}
        <motion.div
          className="py-12 md:py-16 bg-bg-secondary/40"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="w-full px-6 md:px-8">
            <h3 className="text-center font-mono text-xs font-bold text-accent-red uppercase tracking-[0.25em] mb-8">
              We Take Pride In Our Numbers
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center items-center">

              <div className="space-y-2">
                <div className="text-5xl font-extrabold text-accent-red font-title tracking-tight leading-none">15</div>
                <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Years Experience</div>
              </div>

              <div className="space-y-2 border-l border-border-color">
                <div className="text-5xl font-extrabold text-accent-red font-title tracking-tight leading-none">10K</div>
                <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Partners</div>
              </div>

              <div className="space-y-2 border-l border-border-color">
                <div className="text-5xl font-extrabold text-accent-red font-title tracking-tight leading-none">25M</div>
                <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Installed</div>
              </div>

              <div className="space-y-2 border-l border-border-color">
                <div className="text-5xl font-extrabold text-accent-red font-title tracking-tight leading-none">22</div>
                <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Countries</div>
              </div>

              <div className="space-y-2 border-l border-border-color">
                <div className="text-5xl font-extrabold text-accent-red font-title tracking-tight leading-none">5</div>
                <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Awards</div>
              </div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* Combined CTA and Footer Section */}
      <section className="lg:min-h-screen min-h-fit flex flex-col justify-between bg-transparent snap-section">
        {/* Accelerated CTA */}
        <motion.div
          className="flex-1 py-8 md:py-12 relative overflow-hidden flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="w-full px-6 md:px-8 relative z-10">
            <div className="glass-panel p-8 md:p-12 rounded-xl overflow-hidden relative group">
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
                    className="bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/50 px-10 py-4 font-bold text-sm uppercase rounded shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer inline-block"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <Footer onViewChange={onViewChange || onCTA} currentView="home" onSelectSolution={onSelectSolution} />
      </section>
    </>
  );
}
