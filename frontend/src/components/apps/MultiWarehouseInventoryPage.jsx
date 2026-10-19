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
      <section style={{ maxWidth: '1240px', margin: '-2.5rem auto 3.5rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '2rem',
          padding: '2.5rem',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
          border: '1px solid #E5E7EB'
        }}>
          {/* Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#7B5872',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                marginBottom: '0.75rem'
              }}>
                <Warehouse size={14} />
                Live Multi-Node Stock Explorer
              </div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.75rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                Warehouse Network & Available-to-Promise (ATP)
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem', marginTop: '0.35rem', margin: 0 }}>
                Select a facility below to view live bin-level stock balances, active reservations, and safety threshold alerts.
              </p>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '0.75rem',
              padding: '0.6rem 1rem',
              fontSize: '0.85rem',
              color: '#374151'
            }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#10B981' }}></span>
              <span>Central Real-Time Sync Active</span>
            </div>
          </div>

          {/* Warehouse Selector Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem'
          }}>
            {warehouses.map((wh) => {
              const isSelected = selectedWarehouse === wh.id;
              return (
                <button
                  key={wh.id}
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
          <div style={{
            backgroundColor: '#F3F4F6',
            borderRadius: '1rem',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Selected Location</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>{currentWH.name} — {currentWH.type}</div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
              <div><span style={{ color: '#6B7280' }}>Active SKUs:</span> <strong style={{ color: '#111827' }}>{currentWH.activeSKUs}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Capacity:</span> <strong style={{ color: '#111827' }}>{currentWH.capacity}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Utilization:</span> <strong style={{ color: '#1E3A8A' }}>{currentWH.utilization}</strong></div>
            </div>
          </div>

          {/* Stock Table */}
          <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>SKU Code & Description</th>
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

          <div style={{
            marginTop: '1.25rem',
            padding: '1rem',
            backgroundColor: '#EFF6FF',
            borderRadius: '0.75rem',
            border: '1px solid #DBEAFE',
            fontSize: '0.825rem',
            color: '#1E40AF',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
            <div>
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
