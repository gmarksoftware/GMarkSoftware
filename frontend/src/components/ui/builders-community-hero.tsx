import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';

export type OrbitRing = 'outer' | 'inner';

interface OrbitBase {
  ring: OrbitRing;
  angle: number;
  mobileAngle?: number;
  mobileRing?: OrbitRing;
  hideOnMobile?: boolean;
}

export interface OrbitAvatarItem extends OrbitBase {
  kind: 'avatar';
  src: string;
  alt?: string;
  size?: number;
  statusDot?: boolean;
}

export interface OrbitPillItem extends OrbitBase {
  kind: 'pill';
  icon: ReactNode;
  label: string;
}

export interface OrbitBadgeItem extends OrbitBase {
  kind: 'badge';
  icon: ReactNode;
  iconBg?: string;
  badge?: string | number;
  badgeIcon?: ReactNode;
  label?: string;
  glow?: string;
}

export interface OrbitStatusItem extends OrbitBase {
  kind: 'status';
  label: string;
}

export interface OrbitCheckItem extends OrbitBase {
  kind: 'check';
}

export interface OrbitCardItem extends OrbitBase {
  kind: 'card';
  emoji: string;
  badge?: string | number;
}

export type OrbitItem =
  | OrbitAvatarItem
  | OrbitPillItem
  | OrbitBadgeItem
  | OrbitStatusItem
  | OrbitCheckItem
  | OrbitCardItem;

export interface OrbitStat {
  value: string;
  label: string;
}

export interface OrbitTag {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface CommunityOrbitProps {
  items: OrbitItem[];
  stats: OrbitStat[];
  headline?: ReactNode;
  tags?: OrbitTag[];
  minScale?: number;
  className?: string;
}

// Desktop Stage configuration (>= 640px)
const DESKTOP_STAGE_W = 1200;
const DESKTOP_STAGE_H = 490;
const DESKTOP_CENTER = { x: 600, y: 580 };
const DESKTOP_RADIUS: Record<OrbitRing, number> = { outer: 490, inner: 390 };

// Mobile Stage configuration (< 640px) - clean, balanced non-colliding dimensions
const MOBILE_STAGE_W = 390;
const MOBILE_STAGE_H = 295;
const MOBILE_CENTER = { x: 195, y: 195 };
const MOBILE_RADIUS: Record<OrbitRing, number> = { outer: 170, inner: 116 };

function positionOnRing(item: OrbitItem, isMobile: boolean): CSSProperties {
  const center = isMobile ? MOBILE_CENTER : DESKTOP_CENTER;
  const radius = isMobile ? MOBILE_RADIUS : DESKTOP_RADIUS;
  const ring = isMobile && item.mobileRing ? item.mobileRing : item.ring;
  const angle = isMobile && item.mobileAngle !== undefined ? item.mobileAngle : item.angle;
  const rad = (angle * Math.PI) / 180;
  const r = radius[ring];
  return {
    left: center.x + r * Math.cos(rad),
    top: center.y - r * Math.sin(rad),
  };
}

function arcPath(r: number, isMobile: boolean) {
  const center = isMobile ? MOBILE_CENTER : DESKTOP_CENTER;
  const stageH = isMobile ? MOBILE_STAGE_H : DESKTOP_STAGE_H;

  if (isMobile) {
    // On mobile, the orbit is a clean semicircle dome overhead framing the avatars.
    // It terminates at the semicircle baseline (center.y) so it never cuts through or overlaps the stats below.
    return `M ${center.x - r} ${center.y} A ${r} ${r} 0 0 1 ${center.x + r} ${center.y}`;
  }

  const dy = center.y - stageH;
  if (Math.abs(dy) >= r) {
    // If center is above stage bottom, arc starts/ends at y = center.y
    return `M ${center.x - r} ${center.y} A ${r} ${r} 0 0 1 ${center.x + r} ${center.y}`;
  }
  const dx = Math.sqrt(r * r - dy * dy);
  return `M ${center.x - dx} ${stageH} A ${r} ${r} 0 0 1 ${center.x + dx} ${stageH}`;
}

function OrbitAvatar({ src, alt, size = 68, statusDot = true }: OrbitAvatarItem) {
  return (
    <div
      className="relative rounded-full p-[2.5px] bg-white ring-1 ring-slate-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.04)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_28px_rgba(0,0,0,0.14)] cursor-pointer"
      style={{ width: size, height: size }}
    >
      <div className="h-full w-full overflow-hidden rounded-full bg-slate-100">
        <img
          src={src}
          alt={alt ?? 'Team Member'}
          draggable={false}
          className="h-full w-full select-none object-cover object-center"
        />
      </div>
      {statusDot && (
        <span className="absolute bottom-0 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-white opacity-80" />
        </span>
      )}
    </div>
  );
}

function OrbitStatus({ label }: OrbitStatusItem) {
  return (
    <div className="flex h-[36px] sm:h-[38px] items-center gap-2 whitespace-nowrap rounded-full border border-emerald-200/90 bg-white/95 px-3 sm:px-3.5 text-[12px] sm:text-[13px] font-semibold text-slate-800 shadow-[0_4px_16px_rgba(16,185,129,0.14),0_2px_4px_rgba(0,0,0,0.03)] backdrop-blur-xs transition-all duration-200 hover:border-emerald-300 hover:shadow-[0_6px_20px_rgba(16,185,129,0.2)]">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
        <Check size={12} strokeWidth={2.8} />
      </span>
      <span>{label}</span>
    </div>
  );
}

function OrbitPill({ icon, label }: OrbitPillItem) {
  return (
    <div className="flex h-[32px] sm:h-[38px] items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-full border border-slate-200/90 bg-white/95 px-2.5 sm:px-3.5 text-[11px] sm:text-[13px] font-semibold text-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] backdrop-blur-xs transition-all duration-200 hover:border-slate-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)]">
      <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}

function OrbitBadge({ icon, iconBg = 'bg-blue-50', badge, badgeIcon, label, glow }: OrbitBadgeItem) {
  return (
    <div className="relative flex items-center">
      {/* Main Circular Icon */}
      <div 
        className="relative flex h-[36px] w-[36px] sm:h-[46px] sm:w-[46px] items-center justify-center rounded-full border border-slate-200/90 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-105"
        style={glow ? { boxShadow: `0 4px 18px ${glow}, 0 2px 6px rgba(0,0,0,0.04)` } : undefined}
      >
        <div className={`flex h-[28px] w-[28px] sm:h-[38px] sm:w-[38px] items-center justify-center rounded-full ${iconBg}`}>
          {icon}
        </div>

        {/* Attached small indicator badge (e.g. "↑ 12") */}
        {badge !== undefined && (
          <span className="absolute -bottom-1 -right-3.5 sm:-right-4 flex h-[17px] sm:h-[20px] items-center gap-0.5 sm:gap-1 rounded-full border border-emerald-200 bg-emerald-50/95 px-1 sm:px-1.5 text-[9.5px] sm:text-[11px] font-bold leading-none text-emerald-700 shadow-xs">
            {badgeIcon}
            <span>{badge}</span>
          </span>
        )}
      </div>

      {/* Attached text pill (e.g. "240", "18", "36") */}
      {label && (
        <span className="-ml-2 sm:-ml-2.5 flex h-[24px] sm:h-[30px] items-center rounded-full border border-slate-200/90 bg-white/95 pl-3 sm:pl-3.5 pr-2 sm:pr-3 text-[10.5px] sm:text-[12px] font-bold text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] z-[-1]">
          {label}
        </span>
      )}
    </div>
  );
}

function OrbitCheck() {
  return (
    <div className="relative flex h-[36px] w-[36px] sm:h-[46px] sm:w-[46px] items-center justify-center rounded-full bg-emerald-50/90 border border-emerald-300/80 shadow-[0_4px_18px_rgba(16,185,129,0.22)] transition-all duration-200 hover:scale-105">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full border border-emerald-400/40"
      />
      <div className="flex h-[24px] w-[24px] sm:h-[30px] sm:w-[30px] items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
        <Check size={14} strokeWidth={3} />
      </div>
    </div>
  );
}

function renderItem(item: OrbitItem, isMobile: boolean) {
  switch (item.kind) {
    case 'avatar': {
      const adjustedSize = isMobile && item.size ? Math.round(item.size * 0.68) : item.size;
      return <OrbitAvatar {...item} size={adjustedSize} />;
    }
    case 'pill':
      return <OrbitPill {...item} />;
    case 'badge':
      return <OrbitBadge {...item} />;
    case 'status':
      return <OrbitStatus {...item} />;
    case 'check':
      return <OrbitCheck />;
    case 'card':
      return (
        <div className="relative flex h-[36px] w-[36px] sm:h-[42px] sm:w-[42px] items-center justify-center rounded-2xl border border-slate-200/90 bg-white text-[16px] sm:text-[18px] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <span>{item.emoji}</span>
        </div>
      );
  }
}

function splitValue(value: string) {
  const m = String(value).match(/^([^\d]*)([\d.,]+)(.*)$/);
  if (!m) return null;
  const raw = m[2].replace(/,/g, '');
  const decimals = (raw.split('.')[1] ?? '').length;
  return { prefix: m[1], target: parseFloat(raw), decimals, suffix: m[3] };
}

function CountUp({ value, delay }: { value: string; delay: number }) {
  const parts = splitValue(value);
  const [n, setN] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!parts) return;
    if (prefersReduced) {
      setN(parts.target);
      return;
    }
    const controls = animate(0, parts.target, {
      delay,
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(v),
    });
    return () => controls.stop();
  }, [value, delay, prefersReduced]);

  if (!parts) return <>{value}</>;
  return (
    <>
      {parts.prefix}
      {n.toFixed(parts.decimals)}
      {parts.suffix}
    </>
  );
}

const reveal = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

export default function CommunityOrbit({
  items,
  stats,
  headline,
  tags = [],
  className,
}: CommunityOrbitProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReduced = useReducedMotion();

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const parentW = frame.parentElement ? frame.parentElement.clientWidth : window.innerWidth;
      const mobile = parentW < 640;
      setIsMobile(mobile);

      if (mobile) {
        // On mobile, scale stage to fit screen width without horizontal overflow
        const targetW = Math.min(parentW - 24, MOBILE_STAGE_W);
        setScale(Math.min(1, Math.max(0.68, targetW / MOBILE_STAGE_W)));
      } else {
        // On desktop, scale between 0.68 and 1.0 to fit container
        const targetW = Math.min(parentW - 32, DESKTOP_STAGE_W);
        setScale(Math.min(1, Math.max(0.68, targetW / DESKTOP_STAGE_W)));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const stageW = isMobile ? MOBILE_STAGE_W : DESKTOP_STAGE_W;
  const stageH = isMobile ? MOBILE_STAGE_H : DESKTOP_STAGE_H;
  const radius = isMobile ? MOBILE_RADIUS : DESKTOP_RADIUS;
  const center = isMobile ? MOBILE_CENTER : DESKTOP_CENTER;

  // Connection node dots along the orbit lines
  const outerNodeAngles = isMobile ? [140, 75] : [151, 103, 78, 33];
  const innerNodeAngles = isMobile ? [115, 65] : [115, 74, 46];

  return (
    <div
      className={`w-full max-w-full overflow-hidden flex-1 flex flex-col items-center justify-between text-center bg-white text-slate-900 pt-4 sm:pt-12 md:pt-20 pb-8 sm:pb-12 md:pb-16 ${className ?? ''}`}
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Orbit Visual Stage (Clean white background with elegant subtle orbit arcs) */}
      <div
        ref={frameRef}
        className="relative mx-auto w-full max-w-[1240px] overflow-hidden flex justify-center bg-white px-2"
        style={{ height: stageH * scale, backgroundColor: '#ffffff' }}
      >
        <div
          className="absolute left-1/2 top-0"
          style={{
            width: stageW,
            height: stageH,
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Semicircular Orbit SVG Lines and Connection Node Dots */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={stageW}
            height={stageH}
            viewBox={`0 0 ${stageW} ${stageH}`}
            fill="none"
          >
            {/* Outer Arc Stroke */}
            <motion.path
              d={arcPath(radius.outer, isMobile)}
              className="stroke-slate-200/85"
              strokeWidth={1.5}
              initial={prefersReduced ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
            />

            {/* Inner Arc Stroke */}
            <motion.path
              d={arcPath(radius.inner, isMobile)}
              className="stroke-slate-200/85"
              strokeWidth={1.5}
              initial={prefersReduced ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.1 }}
            />

            {/* Subtle Connection Node Dots along Outer Arc */}
            {outerNodeAngles.map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const cx = center.x + radius.outer * Math.cos(rad);
              const cy = center.y - radius.outer * Math.sin(rad);
              return (
                <circle
                  key={`outer-node-${idx}`}
                  cx={cx}
                  cy={cy}
                  r={isMobile ? 2.5 : 3.5}
                  className="fill-slate-300 stroke-white"
                  strokeWidth={1.5}
                />
              );
            })}

            {/* Subtle Connection Node Dots along Inner Arc */}
            {innerNodeAngles.map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const cx = center.x + radius.inner * Math.cos(rad);
              const cy = center.y - radius.inner * Math.sin(rad);
              return (
                <circle
                  key={`inner-node-${idx}`}
                  cx={cx}
                  cy={cy}
                  r={isMobile ? 2.5 : 3.5}
                  className="fill-slate-300 stroke-white"
                  strokeWidth={1.5}
                />
              );
            })}
          </svg>

          {/* Floating Orbit Badges, Icons & Avatars (Filtered & properly spaced on mobile) */}
          {items && items
            .filter((item) => !(isMobile && item.hideOnMobile))
            .map((item, i) => (
              <motion.div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                style={positionOnRing(item, isMobile)}
                initial={prefersReduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.3 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  animate={prefersReduced ? undefined : { y: [0, -3.5, 0] }}
                  transition={{
                    duration: 4 + (i % 4) * 0.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: (i * 0.4) % 2,
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  {renderItem(item, isMobile)}
                </motion.div>
              </motion.div>
            ))}

          {/* Statistics Section Anchored Prominently Below the Orbits */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-20"
            style={{
              top: isMobile ? '215px' : '375px',
              gap: isMobile ? 'clamp(10px, 3.5vw, 18px)' : '36px',
              width: isMobile ? 'min(340px, 92%)' : 'auto'
            }}
          >
            {stats && stats.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && (
                  <div 
                    className="w-[1px] bg-slate-200/90 self-center" 
                    style={{ height: isMobile ? '34px' : '48px' }}
                  />
                )}
                <motion.div
                  className="flex flex-col items-center justify-center text-center px-1"
                  variants={reveal}
                  initial={prefersReduced ? 'show' : 'hidden'}
                  animate="show"
                  transition={{ duration: 0.6, delay: 0.8 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span 
                    className="font-bold leading-none tracking-[-0.03em] text-[#0f172a] tabular-nums"
                    style={{
                      fontSize: isMobile ? 'clamp(20px, 5.5vw, 24px)' : '48px'
                    }}
                  >
                    <CountUp value={s.value} delay={0.8 + i * 0.1} />
                  </span>
                  <span 
                    className="font-medium leading-none text-slate-500 mt-2"
                    style={{
                      fontSize: isMobile ? '12px' : '14px'
                    }}
                  >
                    {s.label}
                  </span>
                  {/* Small Green Accent Line */}
                  <div 
                    className="rounded-full bg-emerald-500 mx-auto" 
                    style={{
                      width: isMobile ? '20px' : '32px',
                      height: '3px',
                      marginTop: isMobile ? '6px' : '10px'
                    }}
                  />
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Optional Lower Section (Headline & Tags if provided) */}
      {(headline || (tags && tags.length > 0)) && (
        <div className="w-full bg-white flex flex-col items-center justify-center pt-6 sm:pt-10 md:pt-12 px-4">
          {headline && (
            <motion.div
              className="w-full flex flex-col items-center justify-center text-center"
              variants={reveal}
              initial={prefersReduced ? 'show' : 'hidden'}
              animate="show"
              transition={{ duration: 0.7, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 
                className="w-full max-w-[850px] text-center text-[#0f172a] mx-auto px-2"
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: 'clamp(1.5rem, 3.2vw, 2.7rem)',
                  lineHeight: '1.2',
                  letterSpacing: '-0.01em',
                  fontWeight: 600,
                }}
              >
                {headline}
              </h2>
            </motion.div>
          )}

          {tags && tags.length > 0 && (
            <div className="w-full mt-4 sm:mt-6 flex max-w-[760px] flex-wrap items-center justify-center gap-2 sm:gap-3.5 mx-auto px-2">
              {tags.map((t, i) => {
                const Tag = (t.href ? motion.a : motion.button) as typeof motion.a;
                return (
                  <Tag
                    key={t.label}
                    {...(t.href ? { href: t.href } : { type: 'button' as const })}
                    onClick={t.onClick}
                    variants={reveal}
                    initial={prefersReduced ? 'show' : 'hidden'}
                    animate="show"
                    transition={{ duration: 0.5, delay: 1.4 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    className="group flex h-9 sm:h-10 items-center gap-2 sm:gap-2.5 rounded-full border border-slate-200/90 bg-white pl-2 pr-3.5 sm:pr-4 text-[13px] sm:text-[14px] font-medium text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500/40 active:shadow-none cursor-pointer"
                  >
                    <span className="flex h-6.5 w-6.5 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white [&>svg]:h-[14px] [&>svg]:w-[14px] sm:[&>svg]:h-[15px] sm:[&>svg]:w-[15px]">
                      {t.icon}
                    </span>
                    <span className="font-medium text-slate-800">{t.label}</span>
                  </Tag>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { CommunityOrbit as Component };
