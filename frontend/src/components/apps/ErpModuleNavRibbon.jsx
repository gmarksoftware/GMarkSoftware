import React from 'react';
import { 
  Layers, 
  Wallet, 
  Receipt, 
  ShoppingCart, 
  Package, 
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { ERP_MODULES } from '../ApplicationsGridSection';

export default function ErpModuleNavRibbon({ currentModuleId, onSelectApp }) {
  const iconMap = {
    'erp-core': Layers,
    'double-entry-accounting': Wallet,
    'gst-eway-invoicing': Receipt,
    'sales-purchase-orders': ShoppingCart,
    'multi-warehouse-inventory': Package,
    'branch-ledger-cashflow': BarChart3
  };

  const handleModuleClick = (mod) => {
    if (onSelectApp) {
      onSelectApp({ ...mod, navigationOrigin: 'solutions' });
    } else {
      window.history.pushState({ page: 'app-detail', appId: mod.id, navigationOrigin: 'solutions' }, '', `/app/${mod.id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white border-b border-slate-200/90 py-3 px-4 sm:px-6">
      <div className="max-w-[1160px] mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.72rem] font-semibold text-slate-500 uppercase tracking-wider">
            Core ERP & Finance Suite Modules
          </span>
          <span className="text-[0.72rem] text-slate-400 hidden sm:inline">
            6 Specialized Modules
          </span>
        </div>
        
        {/* Horizontal scrollable on mobile, flex grid on desktop */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {ERP_MODULES.map((mod) => {
            const isActive = currentModuleId === mod.id || (currentModuleId === 'erp' && mod.id === 'erp-core');
            const IconComp = iconMap[mod.id] || Layers;

            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleModuleClick(mod)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300'
                }`}
                title={mod.name}
              >
                <IconComp size={13} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span>{mod.name}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/70" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
