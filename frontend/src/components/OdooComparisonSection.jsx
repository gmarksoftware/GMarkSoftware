import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, animate, useReducedMotion } from 'framer-motion';
import { 
  X, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Zap, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Server,
  Sparkles
} from 'lucide-react';

const SMOOTH_SLOW_EASING = [0.16, 1, 0.3, 1];

/**
 * Smooth, high-precision scroll-triggered count-up metric component
 */
function MetricCounter({
  targetValue,
  prefix = '',
  suffix = '',
  decimals = 0,
  appendSuffixAtEnd = false,
  inView = false,
  duration = 1.8,
  prefersReduced = false,
}) {
  const [displayValue, setDisplayValue] = useState(() => {
    if (prefersReduced) {
      return decimals > 0 ? targetValue.toFixed(decimals) : Math.floor(targetValue).toString();
    }
    return decimals > 0 ? (0).toFixed(decimals) : '0';
  });
  const [isCompleted, setIsCompleted] = useState(Boolean(prefersReduced));
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(decimals > 0 ? targetValue.toFixed(decimals) : Math.floor(targetValue).toString());
      setIsCompleted(true);
      return;
    }

    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const controls = animate(0, targetValue, {
      duration: duration,
      ease: SMOOTH_SLOW_EASING,
      onUpdate: (latest) => {
        if (decimals > 0) {
          setDisplayValue(latest.toFixed(decimals));
        } else {
          setDisplayValue(Math.floor(latest).toString());
        }
      },
      onComplete: () => {
        if (decimals > 0) {
          setDisplayValue(targetValue.toFixed(decimals));
        } else {
          setDisplayValue(Math.floor(targetValue).toString());
        }
        setIsCompleted(true);
      },
    });

    return () => controls.stop();
  }, [inView, targetValue, decimals, duration, prefersReduced]);

  const activeSuffix = appendSuffixAtEnd ? (isCompleted ? suffix : '') : suffix;

  return (
    <span className="inline-flex items-baseline tabular-nums">
      {prefix && <span className="select-none">{prefix}</span>}
      <span>{displayValue}</span>
      {activeSuffix && (
        <motion.span
          initial={appendSuffixAtEnd ? { opacity: 0, scale: 0.85 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="select-none"
        >
          {activeSuffix}
        </motion.span>
      )}
    </span>
  );
}

export default function OdooComparisonSection({ onOpenExpertModal, onExploreApps }) {
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.25 });
  const prefersReduced = useReducedMotion();

  const PAIN_POINTS = [
    { title: 'Multiple Expensive Subscriptions', desc: '5-8 separate software vendors with independent monthly license fees, per-user premiums, and disjointed renewal dates.' },
    { title: 'Painful Manual CSV Imports', desc: 'Staff forced to spend hours downloading Excel sheets from one system to upload into another, creating errors.' },
    { title: 'Delayed Operational Visibility', desc: 'Financial reports lag weeks behind shop-floor operations and warehouse dispatches.' },
    { title: 'Brittle Custom API Connectors', desc: 'Custom webhook code breaks with every third-party software update, causing data pipeline freezes.' }
  ];

  const GMARK_ADVANTAGES = [
    { title: 'Single Unified Platform', desc: 'One integrated suite sharing a single relational database. Zero manual transfers or duplicate data entry.' },
    { title: 'Sub-Second Real-Time Synchronization', desc: 'Shop-floor IoT telemetry immediately triggers CMMS maintenance work orders and balances general ledgers.' },
    { title: '100% Indian Statutory & Ind AS Compliance', desc: 'Built-in intra/inter-state GST rules, automated HSN lookup, and print-ready 12-digit E-Way bills.' },
    { title: 'Up to 40% Lower Total Cost of Ownership', desc: 'Replace costly patchwork tools with modular, scalable enterprise software built for long-term growth.' }
  ];

  const STATS = [
    { 
      targetValue: 10,
      prefix: '',
      suffix: '+',
      decimals: 0,
      appendSuffixAtEnd: true,
      label: 'Integrated Platforms', 
      sub: 'Single Relational Core' 
    },
    { 
      targetValue: 50,
      prefix: '< ',
      suffix: 'ms',
      decimals: 0,
      appendSuffixAtEnd: false,
      label: 'Telemetry Latency', 
      sub: '50Hz Sub-Second Stream' 
    },
    { 
      targetValue: 100,
      prefix: '',
      suffix: '%',
      decimals: 0,
      appendSuffixAtEnd: false,
      label: 'Statutory GST & Ind AS', 
      sub: 'Dual-Entry Mathematical Match' 
    },
    { 
      targetValue: 99.99,
      prefix: '',
      suffix: '%',
      decimals: 2,
      appendSuffixAtEnd: false,
      label: 'High Availability', 
      sub: 'Enterprise SLA Guarantee' 
    }
  ];

  return (
    <section 
      className="w-full bg-white py-20 sm:py-24"
      style={{
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading: Authentic Odoo Style with Smooth Slow Slide Up */}
        <motion.div 
          initial={{ opacity: 0, y: 55 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.05, ease: SMOOTH_SLOW_EASING }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-16"
        >
          
          <h2 
            className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-slate-900 tracking-tight leading-tight"
            style={{ color: '#1E293B' }}
          >
            No more integration headaches.
          </h2>
          <p 
            className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto"
            style={{ color: '#4B5563' }}
          >
            If you have separate software for accounting, separate tools for maintenance, and third-party apps for field tracking, you&apos;re paying too much and losing valuable operational velocity.
          </p>
        </motion.div>

        {/* Side-by-Side Comparison Grid (Smooth Slow Slide Up from Bottom) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 sm:mb-20">
          
          {/* Left Column: Traditional Fragmented Software */}
          <motion.div 
            initial={{ opacity: 0, y: 65 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.05, ease: SMOOTH_SLOW_EASING }}
            className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <X className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-bold text-slate-800">
                Traditional Disconnected Software
              </h3>
            </div>

            <div className="space-y-5">
              {PAIN_POINTS.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: G Mark Unified Suite (Odoo Way) */}
          <motion.div 
            initial={{ opacity: 0, y: 65 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.05, delay: 0.15, ease: SMOOTH_SLOW_EASING }}
            className="p-6 sm:p-8 rounded-3xl bg-white border-2 shadow-lg relative overflow-hidden"
            style={{ borderColor: '#FC787D' }}
          >
            <div 
              className="absolute top-0 right-0 px-4 py-1 text-[11px] font-bold text-white rounded-bl-xl uppercase tracking-wider"
              style={{ backgroundColor: '#FC787D' }}
            >
              Recommended Architecture
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                G Mark Unified Ecosystem
              </h3>
            </div>

            <div className="space-y-5">
              {GMARK_ADVANTAGES.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Odoo Key Enterprise Numbers Strip: Scroll-Triggered Animated Count-Up */}
        <motion.div 
          ref={statsRef}
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          animate={isStatsInView ? { opacity: 1, y: 0 } : (prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 })}
          transition={{ duration: 1.0, ease: SMOOTH_SLOW_EASING }}
          className="p-8 sm:p-10 rounded-3xl bg-[#F8FAFC] border border-slate-200/90 mb-16 sm:mb-20 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            {STATS.map((stat, i) => (
              <motion.div 
                key={i} 
                initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : (prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 })}
                transition={{ duration: 0.8, delay: i * 0.1, ease: SMOOTH_SLOW_EASING }}
                className="flex flex-col items-center group cursor-default"
              >
                <span 
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight select-none"
                  style={{ color: '#FC787D' }}
                >
                  <MetricCounter
                    targetValue={stat.targetValue}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    appendSuffixAtEnd={stat.appendSuffixAtEnd}
                    inView={isStatsInView}
                    duration={1.8}
                    prefersReduced={prefersReduced}
                  />
                </span>
                <span className="text-sm font-bold text-slate-800 mt-2 group-hover:text-[#FC787D] transition-colors duration-200">
                  {stat.label}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {stat.sub}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Odoo Final Call-to-Action Banner: Smooth Slow Slide Up from Bottom */}
        <motion.div 
          initial={{ opacity: 0, y: 65 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.15, ease: SMOOTH_SLOW_EASING }}
          className="rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl"
          style={{ backgroundColor: '#FC787D' }}
        >
          {/* Subtle decorative circles */}
          <div 
            className="absolute -top-24 -left-24 w-72 h-72 rounded-full pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
          />
          <div 
            className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
          />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Unleash your enterprise growth.
            </h3>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal mb-8 max-w-xl">
              Join forward-thinking companies running on G Mark&apos;s unified software suite. Experience the seamless synergy of ERP, IoT, and industrial operations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
              <button
                type="button"
                onClick={onOpenExpertModal}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#FC787D] hover:bg-slate-100 font-bold text-sm sm:text-base rounded-lg shadow-md transition-all cursor-pointer"
              >
                Request Free Consultation
              </button>
              <button
                type="button"
                onClick={onExploreApps}
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white text-white hover:bg-white/10 font-semibold text-sm sm:text-base rounded-lg transition-all cursor-pointer"
              >
                Explore All Modules
              </button>
            </div>

            <p className="text-xs text-white/70 mt-6 font-medium">
              Enterprise architecture consultation • Custom modules • On-premise or cloud hosting
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
