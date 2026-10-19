import React from 'react';
import { getModuleById, getModulesByCategory } from '../data/modulesRegistry';

export default function DetailSubNavBar({ app, onSelectApp, onNavigate }) {
  const registeredModule = getModuleById(app?.id) || getModuleById(app?.name);
  const activeModule = registeredModule || app;

  const origin = activeModule?.navigationOrigin || (activeModule?.id?.startsWith('tech-') || activeModule?.categorySlug?.includes('tech') ? 'technology' : 'solutions');

  const categorySlug = activeModule?.categorySlug || (
    activeModule?.id?.includes('erp') || ['double-entry-accounting', 'gst-eway-invoicing', 'sales-purchase-orders', 'multi-warehouse-inventory', 'branch-ledger-cashflow', 'erp-core', 'erp'].includes(activeModule?.id)
      ? 'core-erp-finance' 
      : null
  );

  const siblingModules = categorySlug ? getModulesByCategory(categorySlug) : [];
  const hasSiblings = siblingModules && siblingModules.length > 1;

  if (!hasSiblings) {
    return null;
  }

  const handleModuleSelect = (mod) => {
    if (onSelectApp) {
      onSelectApp({ ...mod, navigationOrigin: origin });
    } else if (onNavigate) {
      onNavigate(`app/${mod.id}`);
    }
  };

  return (
    <div 
      className="sticky top-[64px] z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        <div 
          className="max-w-[1240px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <span className="text-[0.68rem] sm:text-[0.72rem] font-bold text-slate-500 uppercase tracking-wider pr-2.5 border-r border-slate-200/90 whitespace-nowrap shrink-0">
            {activeModule?.category || siblingModules[0]?.category || 'MODULES'}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {siblingModules.map((mod) => {
              const isActive = mod.id === activeModule?.id || (activeModule?.id === 'erp' && mod.id === 'erp-core');
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleModuleSelect(mod)}
                  className={`text-[0.74rem] sm:text-[0.78rem] font-medium px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {mod.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
