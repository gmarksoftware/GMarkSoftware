import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Layers, 
  Warehouse, 
  Boxes, 
  AlertTriangle, 
  RefreshCw, 
  QrCode, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Building,
  PackageCheck
} from 'lucide-react';
import ErpModuleNavRibbon from './ErpModuleNavRibbon';

export default function MultiWarehouseInventoryPage({ app, onBack, onOpenExpertModal, onSelectApp }) {
  const [selectedWarehouse, setSelectedWarehouse] = useState('pune-hub');

  const warehouses = [
    {
      id: 'pune-hub',
      name: 'Pune Central Mother Hub',
      type: 'Primary Storage & Mother Depot',
      capacity: '45,000 MT',
      utilization: '78%',
      activeSKUs: 420,
      status: 'Optimal',
      location: 'Chakan Industrial Zone, Pune'
    },
    {
      id: 'nashik-rdc',
      name: 'Nashik Regional Depot',
      type: 'Regional Distribution Center (RDC)',
      capacity: '18,500 MT',
      utilization: '86%',
      activeSKUs: 215,
      status: 'High Demand',
      location: 'Ambad MIDC, Nashik'
    },
    {
      id: 'nagpur-node',
      name: 'Nagpur Transit Facility',
      type: 'Cross-Dock & In-Transit Depot',
      capacity: '12,000 MT',
      utilization: '54%',
      activeSKUs: 140,
      status: 'Optimal',
      location: 'MIHAN SEZ, Nagpur'
    },
    {
      id: 'aurangabad-hub',
      name: 'Chhatrapati Sambhajinagar Node',
      type: 'Field Collection & Aggregation Node',
      capacity: '8,500 MT',
      utilization: '91%',
      activeSKUs: 88,
      status: 'Near Reorder',
      location: 'Waluj MIDC, CSN'
    }
  ];

  const warehouseInventoryData = {
    'pune-hub': [
      { sku: 'AGR-FPO-001', name: 'Premium Soyabean Seed (Lot A-4)', category: 'Certified Seed', onHand: 1240, reserved: 380, atp: 860, uom: 'Bags (50kg)', minBuffer: 250, status: 'Healthy' },
      { sku: 'FRT-ORG-108', name: 'Bio-Organic NPK Granules', category: 'Fertilizer', onHand: 890, reserved: 210, atp: 680, uom: 'Bags (40kg)', minBuffer: 150, status: 'Healthy' },
      { sku: 'IRR-DRP-302', name: 'Pressure Compensated Dripline 16mm', category: 'Irrigation', onHand: 420, reserved: 190, atp: 230, uom: 'Coils (400m)', minBuffer: 80, status: 'Healthy' },
      { sku: 'EQP-TRC-701', name: 'Rotavator Heavy Tine Spares', category: 'Machinery Spares', onHand: 165, reserved: 45, atp: 120, uom: 'Sets', minBuffer: 50, status: 'Healthy' }
    ],
    'nashik-rdc': [
      { sku: 'AGR-FPO-001', name: 'Premium Soyabean Seed (Lot A-4)', category: 'Certified Seed', onHand: 310, reserved: 280, atp: 30, uom: 'Bags (50kg)', minBuffer: 100, status: 'Reorder Alert' },
      { sku: 'FRT-ORG-108', name: 'Bio-Organic NPK Granules', category: 'Fertilizer', onHand: 450, reserved: 120, atp: 330, uom: 'Bags (40kg)', minBuffer: 80, status: 'Healthy' },
      { sku: 'PST-BIO-204', name: 'Neem-Based Bio-Pesticide (10,000 PPM)', category: 'Crop Protection', onHand: 620, reserved: 90, atp: 530, uom: 'Litres (1L Can)', minBuffer: 100, status: 'Healthy' }
    ],
    'nagpur-node': [
      { sku: 'AGR-FPO-004', name: 'Hybrid Cotton Seed BG-II', category: 'Certified Seed', onHand: 950, reserved: 150, atp: 800, uom: 'Packets (450g)', minBuffer: 200, status: 'Healthy' },
      { sku: 'IRR-DRP-302', name: 'Pressure Compensated Dripline 16mm', category: 'Irrigation', onHand: 85, reserved: 60, atp: 25, uom: 'Coils (400m)', minBuffer: 50, status: 'Reorder Alert' },
      { sku: 'EQP-TRC-701', name: 'Rotavator Heavy Tine Spares', category: 'Machinery Spares', onHand: 78, reserved: 18, atp: 60, uom: 'Sets', minBuffer: 25, status: 'Healthy' }
    ],
    'aurangabad-hub': [
      { sku: 'AGR-FPO-001', name: 'Premium Soyabean Seed (Lot A-4)', category: 'Certified Seed', onHand: 140, reserved: 120, atp: 20, uom: 'Bags (50kg)', minBuffer: 80, status: 'Critical Stock' },
      { sku: 'FRT-ORG-108', name: 'Bio-Organic NPK Granules', category: 'Fertilizer', onHand: 180, reserved: 70, atp: 110, uom: 'Bags (40kg)', minBuffer: 60, status: 'Healthy' },
      { sku: 'PST-BIO-204', name: 'Neem-Based Bio-Pesticide (10,000 PPM)', category: 'Crop Protection', onHand: 95, reserved: 85, atp: 10, uom: 'Litres (1L Can)', minBuffer: 50, status: 'Critical Stock' }
    ]
  };

  const inventoryPillars = [
    {
      title: 'Three-State Real-Time Allocation',
      desc: 'Differentiates physical on-hand quantity, sales-reserved allocations, and Available-to-Promise (ATP) inventory. Prevents double-booking across concurrent sales desks.',
      icon: Boxes,
      badge: 'Stock Integrity'
    },
    {
      title: 'Zero-Negative Stock Prevention',
      desc: 'System-level validation rejects dispatch note creation or warehouse bin releases if physical ATP is zero or negative. Eliminates phantom inventory reconciliation.',
      icon: ShieldCheck,
      badge: 'Zero Discrepancy'
    },
    {
      title: 'Inter-Warehouse Transfers (STO)',
      desc: 'End-to-end stock transfer orders with transit-loss tracking, dispatch vehicle taggings, and automated transit ledger accounts between origin and receiving depots.',
      icon: RefreshCw,
      badge: 'Hub-and-Spoke'
    },
    {
      title: 'Batch & FIFO / FEFO Enforcement',
      desc: 'Strict batch lot tracing with automatic first-expiry-first-out sequencing. Protects perishable agri-inputs and high-value materials from shelf expiration.',
      icon: Clock,
      badge: 'Expiry Compliance'
    }
  ];

  const currentWH = warehouses.find(w => w.id === selectedWarehouse) || warehouses[0];
  const currentItems = warehouseInventoryData[selectedWarehouse] || [];

  return (
    <div style={{ backgroundColor: '#e8e8e8', minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      {/* ========================================================================= */}
      {/* 1. HERO HEADER */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#FFFFFF', 
          textAlign: 'center', 
          paddingTop: 'clamp(1.25rem, 2.5vw, 2rem)', 
          paddingBottom: 'clamp(2.5rem, 4vw, 3.75rem)', 
          paddingLeft: '1.5rem', 
          paddingRight: '1.5rem',
          borderRadius: '0 0 1.5rem 1.5rem',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
          position: 'relative'
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Eyebrow Badge */}
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.76rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: '#F8FAFC',
              color: '#475569',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}>
              <Warehouse size={13} style={{ color: '#64748B' }} />
              <span>CORE ERP & FINANCE • INVENTORY MANAGEMENT MODULE</span>
            </span>
          </div>

          {/* Heading */}
          <h1 
            className="text-balance text-slate-900"
            style={{ 
              fontFamily: "'Lora', serif",
              fontSize: 'clamp(1.75rem, 4.5vw, 3.87rem)',
              lineHeight: '1.18',
              letterSpacing: '-0.01em',
              paddingTop: '0.25rem',
              paddingBottom: '0.75rem',
              fontWeight: 600
            }}
          >
            <span>Multi-Warehouse </span>
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 font-semibold" style={{ color: '#FC787D' }}>
                Inventory
              </span>
              <svg
                className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4.5 pointer-events-none z-0 overflow-visible"
                viewBox="0 0 260 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M 4,14 Q 130,5 256,12 Q 130,20 6,17"
                  fill="#00A3FF"
                />
              </svg>
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(0.92rem, 1.58vw, 1.1rem)',
            color: '#4B5563',
            maxWidth: '820px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.65
          }}>
            Real-time stock valuation across mother hubs, regional depots, and field collection points. Eliminates stockouts with 
            strict Available-to-Promise (ATP) reservations, batch-level FIFO tracking, and automated stock replenishment.
          </p>

          {/* Quick Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            maxWidth: '920px',
            margin: '0 auto 2.5rem'
          }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Negative Stock Risk</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#16A34A', marginTop: '0.25rem' }}>0% Strictly Enforced</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Hard system dispatch lock</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Stock Allocation</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#7B5872', marginTop: '0.25rem' }}>3-State Model</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>On-Hand · Reserved · ATP</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Transit Accounting</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#D97706', marginTop: '0.25rem' }}>Live STO Tracking</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>In-transit reconciliation</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Expiry Management</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>FIFO / FEFO</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Automated batch rotation</div>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                backgroundColor: '#7B5872',
                color: '#FFFFFF',
                padding: '0.8rem 1.85rem',
                borderRadius: '9999px',
                fontWeight: 500,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(123, 88, 114, 0.35)'
              }}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <span>Schedule Inventory Architecture Review</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE LIVE WAREHOUSE SIMULATOR */}
      {/* ========================================================================= */}
      <section className="max-w-[1240px] -mt-6 sm:-mt-10 mb-10 sm:mb-14 mx-auto px-3 sm:px-6 relative z-10">
        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-200">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7B5872] bg-slate-100 border border-slate-200 px-3 py-1 rounded-full mb-2 w-fit">
                <Warehouse size={14} />
                <span>Live Multi-Node Stock Explorer</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-slate-900 leading-tight mb-1" style={{ fontFamily: "'Lora', serif" }}>
                Warehouse Network &amp; Available-to-Promise (ATP)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Select a facility below to view live bin-level stock balances, active reservations, and safety threshold alerts.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-700 w-fit shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">Central Real-Time Sync Active</span>
            </div>
          </div>

          {/* Warehouse Selector: Mobile Swipeable Carousel (<sm) */}
          <div className="block sm:hidden mb-5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 px-1 font-medium">
              <span>Swipe facilities ({warehouses.findIndex(w => w.id === selectedWarehouse) + 1}/4)</span>
              <div className="flex items-center gap-1.5">
                {warehouses.map((wh) => (
                  <span
                    key={wh.id}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      selectedWarehouse === wh.id ? 'w-4 bg-slate-900' : 'w-1.5 bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3 pt-1 px-1 -mx-1">
              {warehouses.map((wh) => {
                const isSelected = selectedWarehouse === wh.id;
                return (
                  <button
                    key={wh.id}
                    type="button"
                    onClick={() => setSelectedWarehouse(wh.id)}
                    className={`w-[260px] shrink-0 snap-center rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xl ring-2 ring-slate-900/10 scale-[1.01]'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                        isSelected 
                          ? 'bg-white/20 text-white border-white/20' 
                          : 'bg-slate-200/80 text-slate-700 border-slate-300/80'
                      }`}>
                        {wh.status}
                      </span>
                      <Building size={16} className={isSelected ? 'text-white/80' : 'text-slate-400'} />
                    </div>

                    <div className="font-bold text-sm leading-tight mb-1">
                      {wh.name}
                    </div>

                    <div className={`text-xs mb-3 truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {wh.location}
                    </div>

                    <div className={`flex justify-between items-center text-xs pt-2.5 border-t ${
                      isSelected ? 'border-white/15 text-slate-200' : 'border-slate-200 text-slate-600'
                    }`}>
                      <span>Capacity: <b className={isSelected ? 'text-white' : 'text-slate-900'}>{wh.capacity}</b></span>
                      <span>Util: <b className={isSelected ? 'text-white' : 'text-slate-900'}>{wh.utilization}</b></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warehouse Selector: Desktop & Tablet Grid (>=sm) */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {warehouses.map((wh) => {
              const isSelected = selectedWarehouse === wh.id;
              return (
                <button
                  key={wh.id}
                  type="button"
                  onClick={() => setSelectedWarehouse(wh.id)}
                  style={{
                    backgroundColor: isSelected ? '#0F172A' : '#F9FAFB',
                    color: isSelected ? '#FFFFFF' : '#1F2937',
                    border: isSelected ? '1px solid #0F172A' : '1px solid #E5E7EB',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 8px 20px -4px rgba(15, 23, 42, 0.2)' : 'none'
                  }}
                  className="hover:-translate-y-0.5 transition-transform"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.375rem',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#E5E7EB',
                      color: isSelected ? '#FFFFFF' : '#4B5563'
                    }}>
                      {wh.status}
                    </span>
                    <Building size={16} opacity={isSelected ? 0.9 : 0.4} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{wh.name}</div>
                  <div style={{ fontSize: '0.75rem', color: isSelected ? '#BFDBFE' : '#6B7280', marginBottom: '0.75rem' }}>
                    {wh.location}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    paddingTop: '0.5rem',
                    borderTop: isSelected ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E5E7EB'
                  }}>
                    <span>Capacity: <b>{wh.capacity}</b></span>
                    <span>Util: <b>{wh.utilization}</b></span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Facility Details Header */}
          <div className="bg-slate-100/90 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="text-[10.5px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Selected Location
                </div>
                <div className="text-sm sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentWH.name} — <span className="font-normal text-slate-600 text-xs sm:text-base">{currentWH.type}</span>
                </div>
              </div>

              {/* Responsive Stats: 3-column micro grid on mobile, inline on desktop */}
              <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-5 text-xs sm:text-sm pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <div className="bg-white/90 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-200/60 text-center sm:text-left">
                  <span className="text-slate-500 block text-[10px] sm:text-xs sm:inline">Active SKUs: </span>
                  <strong className="text-slate-900 font-bold">{currentWH.activeSKUs}</strong>
                </div>
                <div className="bg-white/90 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-200/60 text-center sm:text-left">
                  <span className="text-slate-500 block text-[10px] sm:text-xs sm:inline">Capacity: </span>
                  <strong className="text-slate-900 font-bold">{currentWH.capacity}</strong>
                </div>
                <div className="bg-white/90 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-200/60 text-center sm:text-left">
                  <span className="text-slate-500 block text-[10px] sm:text-xs sm:inline">Utilization: </span>
                  <strong className="text-[#0B3A70] font-bold">{currentWH.utilization}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SKU Inventory Table: Desktop & Tablet View (>=md) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>SKU Code &amp; Description</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Physical On-Hand</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>SO Reserved</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#1E3A8A' }}>Available-to-Promise</th>
                  <th style={{ padding: '0.85rem 1rem' }}>UOM</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < currentItems.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#111827' }}>
                      <div>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>{item.sku}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#4B5563' }}>{item.category}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                      {item.onHand.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#D97706', fontWeight: 600 }}>
                      -{item.reserved.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#1E3A8A', fontSize: '0.95rem' }}>
                      {item.atp.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', color: '#6B7280', fontSize: '0.8rem' }}>{item.uom}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        backgroundColor: 
                          item.status === 'Healthy' ? '#ECFDF5' :
                          item.status === 'Reorder Alert' ? '#FFFBEB' : '#FEF2F2',
                        color:
                          item.status === 'Healthy' ? '#065F46' :
                          item.status === 'Reorder Alert' ? '#92400E' : '#991B1B'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SKU Inventory Cards: Mobile-Optimized Stackable View (<md) */}
          <div className="block md:hidden space-y-3">
            {currentItems.map((item, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl p-4 bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow"
              >
                {/* Top: SKU Title, SKU Code, Status */}
                <div className="flex items-start justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                        {item.sku}
                      </span>
                      <span className="text-[10.5px] text-slate-500 font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                    item.status === 'Healthy' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : item.status === 'Reorder Alert' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* 3 Metrics: Physical On-Hand | SO Reserved | Available-To-Promise */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 text-center mb-2.5">
                  <div>
                    <span className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                      On-Hand
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.onHand.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                      Reserved
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-amber-600">
                      -{item.reserved.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-white rounded-lg p-1 border border-blue-100 shadow-2xs">
                    <span className="text-[9.5px] uppercase tracking-wider text-[#0B3A70] font-bold block mb-0.5">
                      ATP
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-[#0B3A70]">
                      {item.atp.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Footer info: UOM & Safety Buffer */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                  <span>UOM: <strong className="text-slate-700 font-semibold">{item.uom}</strong></span>
                  <span>Safety Buffer: <strong className="text-slate-700 font-semibold">{item.minBuffer}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Three-State Formula Callout */}
          <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-blue-50/90 border border-blue-200/70 text-xs sm:text-[13px] text-blue-900 flex items-start sm:items-center gap-3">
            <ShieldCheck size={20} className="shrink-0 text-blue-700 mt-0.5 sm:mt-0" />
            <div className="leading-relaxed">
              <strong>Three-State Formula Applied:</strong> Available-to-Promise (ATP) = Physical On-Hand - Reserved Customer Allocations. If an order exceeds ATP, the system automatically triggers an Inter-Warehouse Transfer (STO) from the nearest high-stock depot or blocks dispatch.
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FOUR CORE INVENTORY PILLARS */}
      {/* ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: '2rem', fontWeight: 600, color: '#111827', margin: '0 0 0.5rem' }}>
            Built for High-Throughput Warehouse Operations
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', maxWidth: '680px', margin: '0 auto' }}>
            Enterprise multi-location inventory controls engineered to eliminate shrinkage, prevent over-committing, and speed up order turnaround.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {inventoryPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1.5rem',
                  padding: '2rem',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '0.75rem',
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1E3A8A'
                    }}>
                      <Icon size={24} />
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '9999px',
                      backgroundColor: '#F3F4F6',
                      color: '#374151'
                    }}>
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
                    {pillar.title}
                  </h3>

                  <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HUB-AND-SPOKE DISPATCH & STO PIPELINE */}
      {/* ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '2rem',
          padding: '2.5rem',
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
        }}>
          <div style={{ maxWidth: '800px', marginBottom: '2rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#D97706',
              letterSpacing: '0.05em'
            }}>
              Logistics & Transfer Discipline
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.75rem', fontWeight: 600, color: '#111827', margin: '0.5rem 0 0.75rem' }}>
              Inter-Warehouse Transfer (STO) Workflow
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
              Move materials seamlessly between mother warehouses and local distribution hubs with dual-verification transit logs.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.5rem' }}>01</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.5rem' }}>Indent Request</div>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                Regional branch raises replenishment indent based on min-max buffer triggers or customer SO backlog.
              </p>
            </div>

            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.5rem' }}>02</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.5rem' }}>Pick & Dispatch Challan</div>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                Origin mother hub generates Delivery Challan with batch serials and deducts physical inventory to "In-Transit".
              </p>
            </div>

            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.5rem' }}>03</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.5rem' }}>Transit Ledger</div>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                Value is tracked under the In-Transit asset ledger to maintain real-time company balance sheet integrity.
              </p>
            </div>

            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.5rem' }}>04</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.5rem' }}>Destination GRN Inward</div>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                Destination depot receives consignment, performs QC check, records any transit shortfall, and updates local ATP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BOTTOM CTA BANNER */}
      {/* ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{
          backgroundColor: '#0F172A',
          borderRadius: '2rem',
          padding: '3rem 2rem',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.25)'
        }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
            Ready to Connect Your Warehouse Network?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Our enterprise supply chain consultants can help integrate your bin structures, barcode scanning, and multi-hub logistics into G Mark ERP.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                backgroundColor: '#7B5872',
                color: '#FFFFFF',
                fontWeight: 600,
                padding: '0.85rem 2rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 4px 16px rgba(123, 88, 114, 0.35)'
              }}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Consult an ERP Architect
            </button>
            <button
              onClick={onBack}
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                fontWeight: 500,
                padding: '0.85rem 1.75rem',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Explore Other ERP Modules
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
