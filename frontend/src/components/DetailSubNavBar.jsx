import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function DetailSubNavBar({ app, onBack, onNavigate }) {
  const origin = app?.navigationOrigin || 'solutions';
  const originLabel = origin === 'technology' ? 'Technology' : origin === 'industries' ? 'Industries' : 'Solutions';

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleOriginClick = () => {
    if (onNavigate) {
      onNavigate('home');
      if (origin === 'solutions') {
        setTimeout(() => {
          const el = document.getElementById('applications-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else if (onBack) {
      onBack();
    }
  };

  const handleHomeClick = () => {
    if (onNavigate) {
      onNavigate('home');
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div 
      className="sticky top-[64px] z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-3">
        {/* Left Side: Clean Back Text Navigation */}
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors duration-150 cursor-pointer shrink-0 select-none group"
          aria-label={`Go back to previous screen`}
        >
          <ArrowLeft size={15} className="text-slate-500 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-all" />
          <span className="hidden sm:inline">Back to {originLabel}</span>
          <span className="sm:hidden">Back</span>
        </button>

        {/* Right Side: Clean Breadcrumbs Navigation */}
        <nav aria-label="Breadcrumb" className="min-w-0 flex items-center">
          <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-normal truncate">
            <li className="shrink-0">
              <button
                type="button"
                onClick={handleHomeClick}
                className="hover:text-blue-700 transition-colors cursor-pointer"
              >
                Home
              </button>
            </li>
            <li className="text-slate-300 shrink-0">/</li>
            <li className="shrink-0">
              <button
                type="button"
                onClick={handleOriginClick}
                className="hover:text-blue-700 transition-colors cursor-pointer"
              >
                {originLabel}
              </button>
            </li>
            <li className="text-slate-300 shrink-0">/</li>
            <li 
              className="text-slate-900 font-semibold truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[240px] md:max-w-none" 
              title={app?.name || 'Overview'}
              aria-current="page"
            >
              {app?.name || 'Overview'}
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
