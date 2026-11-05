import React from 'react';
import ShgAppDetailPage from '../components/apps/ShgAppDetailPage';
import TransporterAppDetailPage from '../components/apps/TransporterAppDetailPage';
import ErpAppDetailPage from '../components/apps/ErpAppDetailPage';
import DoubleEntryAccountingPage from '../components/apps/DoubleEntryAccountingPage';
import GstInvoicingPage from '../components/apps/GstInvoicingPage';
import SalesPurchaseOrdersPage from '../components/apps/SalesPurchaseOrdersPage';
import MultiWarehouseInventoryPage from '../components/apps/MultiWarehouseInventoryPage';
import BranchLedgerCashflowPage from '../components/apps/BranchLedgerCashflowPage';
import IotAppDetailPage from '../components/apps/IotAppDetailPage';
import GramUnnatiAppDetailPage from '../components/apps/GramUnnatiAppDetailPage';
import GTrackAppDetailPage from '../components/apps/GTrackAppDetailPage';
import SynkroBoardAppDetailPage from '../components/apps/SynkroBoardAppDetailPage';
import UniversalModuleDetailPage from '../components/apps/UniversalModuleDetailPage';
import { getModuleById } from '../data/modulesRegistry';
import DetailSubNavBar from '../components/DetailSubNavBar';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  ArrowRight,
  ShieldCheck, 
  Zap, 
  Globe, 
  Wallet
} from 'lucide-react';

export default function AppDetailPage({ app, onBack, onOpenExpertModal, onSelectApp, onNavigate }) {
  const renderDetailContent = () => {
    // ---------------------------------------------------------
    // Core ERP & Finance Sub-Modules
    // ---------------------------------------------------------
    // 1. Double-Entry Accounting
    if (app?.id === 'double-entry-accounting' || app?.id === 'double-entry' || app?.name?.toLowerCase().includes('double-entry')) {
      return (
        <DoubleEntryAccountingPage 
          app={app} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    // 2. GST & E-Way Invoicing
    if (app?.id === 'gst-eway-invoicing' || app?.id === 'gst-invoicing' || app?.name?.toLowerCase().includes('gst')) {
      return (
        <GstInvoicingPage 
          app={app} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    // 3. Sales & Purchase Orders
    if (app?.id === 'sales-purchase-orders' || app?.name?.toLowerCase().includes('purchase orders') || app?.name?.toLowerCase().includes('sales & purchase')) {
      return (
        <SalesPurchaseOrdersPage 
          app={app} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    // 4. Multi-Warehouse Inventory
    if (app?.id === 'multi-warehouse-inventory' || app?.name?.toLowerCase().includes('multi-warehouse') || app?.name?.toLowerCase().includes('warehouse inventory')) {
      return (
        <MultiWarehouseInventoryPage 
          app={app} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    // 5. Branch Ledger & Cashflow
    if (app?.id === 'branch-ledger-cashflow' || app?.name?.toLowerCase().includes('branch ledger') || app?.name?.toLowerCase().includes('cashflow')) {
      return (
        <BranchLedgerCashflowPage 
          app={app} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    // 6. Enterprise ERP Core / ERP Overview
    if (app?.id === 'erp-core' || app?.id === 'erp' || app?.name?.toLowerCase().includes('enterprise erp core') || app?.name?.toLowerCase().includes('erp')) {
      return (
        <ErpAppDetailPage 
          app={app} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    // If G-Track is selected, render full G Mark Tracking & Field Force Management page
    if (app?.id === 'g-track' || app?.id === 'gtrack' || app?.id === 'tracking' || app?.name?.toLowerCase().includes('track')) {
      return (
        <GTrackAppDetailPage 
          app={app} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    // If GramUnnati is selected, render full GramUnnati Agri-Commerce & Rural Marketplace page
    if (app?.id === 'gram-unnati' || app?.id === 'gramunnati' || app?.name?.toLowerCase().includes('gram') || app?.name?.toLowerCase().includes('unnati')) {
      return (
        <GramUnnatiAppDetailPage 
          app={app} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    // If G-Nova IoT is selected, render full IoT & 4M ERP System page
    if (app?.id === 'g-nova-iot' || app?.id === 'iot' || app?.name?.toLowerCase().includes('iot') || app?.name?.toLowerCase().includes('g-nova')) {
      return (
        <IotAppDetailPage 
          app={app} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    // If Transporter App is selected, render full 2-phase middle-mile transporter workflow page
    if (app?.id === 'transporter-app' || (app?.name?.toLowerCase().includes('transporter') && !app?.id?.includes('shg'))) {
      return (
        <TransporterAppDetailPage 
          app={app} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    // If SHG App is selected, render full 2-phase workflow details page
    if (app?.id === 'shg-app' || app?.id === 'shg-transporter' || app?.name?.toLowerCase().includes('shg')) {
      return (
        <ShgAppDetailPage 
          app={app} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    // If SynkroBoard / Task Management is selected, render full SynkroBoard enterprise ecosystem page
    if (app?.id === 'task-management' || app?.id === 'synkroboard' || app?.id === 'synkro' || app?.name?.toLowerCase().includes('task') || app?.name?.toLowerCase().includes('synkro')) {
      return (
        <SynkroBoardAppDetailPage 
          app={app} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    // Check if the requested app is any registered module in MODULES_REGISTRY
    const registeredModule = getModuleById(app?.id) || getModuleById(app?.name);
    if (registeredModule) {
      return (
        <UniversalModuleDetailPage 
          module={registeredModule} 
          onBack={onBack} 
          onOpenExpertModal={onOpenExpertModal} 
          onSelectApp={onSelectApp}
        />
      );
    }

    const FallbackIcon = app?.fallbackIcon || Layers;

    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        
        {/* 1. HERO SECTION (HIGH-END MINIMALIST SAAS ATMOSPHERE) */}
        <section 
          style={{ 
            backgroundColor: '#FFFFFF', 
            textAlign: 'center', 
            paddingTop: 'clamp(1.5rem, 3vw, 2.5rem)', 
            paddingBottom: 'clamp(2.5rem, 4vw, 4rem)', 
            paddingLeft: '1.5rem', 
            paddingRight: '1.5rem', 
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '1px solid #F1F5F9'
          }}
        >
          {/* Ambient top radial gradient glow */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-red-100/40 via-rose-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-0" 
            aria-hidden="true"
          />

          {/* Subtle top subtle grid background */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
              backgroundSize: '4rem 4rem'
            }}
          />

          <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
            {/* Eyebrow badge */}
            <div style={{ marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
              <div 
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#FFF1F2',
                  border: '1px solid #FED7D9',
                  borderRadius: '100px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(252, 120, 125, 0.04)',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: '#FC787D',
                  letterSpacing: '0.04em'
                }}
              >
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FC787D' }} />
                {app?.category?.toUpperCase() || 'ENTERPRISE PLATFORM'} • {app?.badge || 'ENTERPRISE'}
              </div>
            </div>

            {/* Headline matching homepage design language */}
            <h1 
              className="text-balance text-slate-900 font-extrabold tracking-tight"
              style={{ 
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: 'clamp(2rem, 4.5vw, 3.87rem)',
                lineHeight: '1.15',
                letterSpacing: '-0.025em',
                paddingTop: '0.25rem',
                paddingBottom: '0.75rem',
                display: 'inline-block',
                position: 'relative',
                zIndex: 1
              }}
            >
              <span>{app?.name || 'Application'} </span>
              <br className="hidden sm:inline" />
              <span>Platform </span>
              <span className="text-[#FC787D]">
                Overview
              </span>
            </h1>

            <p 
              className="text-balance text-slate-600 font-normal"
              style={{ 
                fontSize: 'clamp(0.95rem, 1.6vw, 1.125rem)', 
                lineHeight: '1.65', 
                maxWidth: '760px',
                margin: '1.25rem auto 2rem',
                position: 'relative',
                zIndex: 1
              }}
            >
              {app?.description || app?.tagline || 'Next-generation industrial software suite designed for modern enterprises.'}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
              <button
                onClick={onOpenExpertModal}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  backgroundColor: '#FC787D',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(252, 120, 125, 0.25)'
                }}
                className="hover:bg-[#E86368] active:scale-[0.98] transition-all"
              >
                <span>Request {app?.name || 'Platform'} Demo</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={onBack}
                style={{
                  padding: '0.65rem 1.35rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                className="hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Solutions</span>
              </button>
            </div>
          </div>

        </section>

        {/* 2. CAPABILITIES & FEATURES */}
        <section 
          style={{ 
            backgroundColor: '#F8FAFC', 
            borderBottom: '1px solid #E2E8F0', 
            padding: '3rem 0 4.5rem' 
          }}
        >
          <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
            
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#FC787D', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                CAPABILITIES & ARCHITECTURE
              </span>
              <h2 style={{ 
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: 'clamp(1.35rem, 3.5vw, 2.16rem)', 
                fontWeight: 700, 
                color: '#0F172A',
                letterSpacing: '-0.02em',
                display: 'block',
                marginTop: '4px',
                position: 'relative'
              }}>
                Core Features & Technical Scope
                <span style={{ 
                  display: 'block', 
                  height: '3px', 
                  backgroundColor: '#FC787D', 
                  borderRadius: '2px', 
                  width: '60px', 
                  marginTop: '8px' 
                }} />
              </h2>
            </div>

            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                gap: '1.25rem'
              }}
            >
              {(app?.features || [
                'High-speed real-time telemetry ingestion',
                'Enterprise-grade security and role-based access',
                'Full cloud synchronization and backup',
                'Modular API integration endpoints'
              ]).map((feat, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFF1F2', color: '#FC787D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: '600', color: '#0F172A', margin: 0, marginBottom: '4px' }}>
                      {feat}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, fontWeight: '400', lineHeight: '1.5' }}>
                      Production-tested feature delivering enterprise reliability and compliance.
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

      </div>
    );
  };

  return (
    <div className="app-detail-root-container" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', paddingTop: '64px' }}>
      <DetailSubNavBar app={app} onBack={onBack} onNavigate={onNavigate} onSelectApp={onSelectApp} />
      {renderDetailContent()}
    </div>
  );
}
