import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

/** Bright modern SaaS banner at the top of inner academy pages. */
export function PageHeader({ title, tagline, icon = 'school' }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-slate-50 to-indigo-50/70 text-[#0F172A] border-b border-slate-200">
      <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -top-24 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
      <Icon name={icon} className="absolute right-8 top-6 text-[120px] text-[#2563EB]/10 hidden md:block pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#2563EB] hover:border-blue-300 shadow-2xs transition"
          >
            <Icon name="arrow_back" className="text-sm" /> Back to Website
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#2563EB] hover:border-blue-300 shadow-2xs transition"
          >
            <Icon name="space_dashboard" className="text-sm text-[#2563EB]" /> My Learning Dashboard
          </Link>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-[#0F172A]">{title}</h1>
        {tagline && <p className="mt-3 text-base md:text-xl text-[#475569] font-medium max-w-3xl">{tagline}</p>}
      </div>
    </section>
  );
}

export function Section({ id, title, children, className = '', narrow = false, tint = false }) {
  return (
    <section id={id} className={`${tint ? 'bg-slate-100/70 border-y border-slate-200' : 'bg-[#F8FAFC]'} scroll-mt-24`}>
      <div className={`max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-14 ${className}`}>
        {title && <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-7">{title}</h2>}
        {children}
      </div>
    </section>
  );
}

export const Paras = ({ items, className = '' }) =>
  (Array.isArray(items) ? items : [items]).map((p, i) => (
    <p key={i} className={`text-base md:text-lg leading-relaxed text-[#475569] mb-4 ${className}`}>{p}</p>
  ));

export const Pill = ({ children }) => (
  <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-extrabold uppercase tracking-wider">{children}</span>
);

export function Bullets({ items, dark = false, cols = 'sm:grid-cols-2' }) {
  return (
    <ul className={`grid grid-cols-1 ${cols} gap-3`}>
      {items.map((it) => (
        <li key={it} className={`flex items-start gap-2.5 px-4 py-3 rounded-2xl border text-sm font-semibold ${dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-[#0F172A] shadow-xs'}`}>
          <Icon name="check_circle" filled className="text-[20px] mt-px text-[#0D9488]" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/** "Learn → Develop Skills → Apply → Grow" style flow. */
export function ApproachSteps({ steps }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2.5">
          <span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white text-sm font-extrabold shadow-md shadow-blue-600/20">{s}</span>
          {i < steps.length - 1 && <Icon name="arrow_forward" className="text-slate-400" />}
        </div>
      ))}
    </div>
  );
}

export const Quote = ({ children, cite }) => (
  <figure className="relative p-7 rounded-3xl bg-white border border-slate-200 text-[#0F172A] shadow-sm">
    <Icon name="format_quote" className="text-[#2563EB] text-4xl" />
    <blockquote className="text-xl md:text-2xl font-bold leading-relaxed text-[#0F172A]">{children}</blockquote>
    {cite && <figcaption className="mt-4 text-sm font-bold text-[#2563EB]">{cite}</figcaption>}
  </figure>
);
