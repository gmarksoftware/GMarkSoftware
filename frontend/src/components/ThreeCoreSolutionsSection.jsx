import React, { useState } from 'react';
import { 
  Wrench, 
  Radio, 
  Sprout, 
  ArrowRight, 
  Activity, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Gauge, 
  Cpu, 
  Sliders, 
  Droplets, 
  SunMedium, 
  Wind, 
  LineChart, 
  FileText,
  ShieldCheck,
  Zap,
  TrendingUp
} from 'lucide-react';

export default function ThreeCoreSolutionsSection({ onOpenExpertModal }) {
  const [activeSolution, setActiveSolution] = useState('maintenance');

  const solutions = [
    {
      id: 'maintenance',
      num: '01',
      tag: 'ENTERPRISE CMMS',
      title: 'Smart Maintenance Management System',
      description: 'Bring maintenance operations, assets, work orders, schedules, and service activities into one connected system.',
      flow: ['Assets', 'Monitoring', 'Maintenance', 'Insights'],
      icon: Wrench,
      accentColor: '#0B3A70',
      accentBg: '#EBF3FC',
      badge: 'Predictive & Preventive Maintenance',
      capabilities: [
        'Automated preventive work order dispatch based on runtime hours & sensor alerts',
        'Comprehensive asset tree hierarchy with full lifecycle cost & MTBF tracking',
        'Digital work execution checklists with photo proof & technician audit logs',
        'Seamless spare parts inventory management & automated re-order triggers'
      ]
    },
    {
      id: 'iot',
      num: '02',
      tag: 'INDUSTRIAL TELEMETRY & EDGE',
      title: 'Smart Industrial IoT Telemetry & Networks',
      description: 'Connect industrial assets and infrastructure to capture real-time telemetry, monitor performance, and turn operational data into actionable insights.',
      flow: ['Sensors', 'Telemetry', 'Networks', 'Analytics'],
      icon: Radio,
      accentColor: '#0284C7',
      accentBg: '#E0F2FE',
      badge: 'Edge Gateway & Protocol Translation',
      capabilities: [
        'Universal multi-protocol ingestion supporting Modbus RTU/TCP, MQTT, OPC-UA, CANbus',
        'Sub-second high frequency vibration spectral FFT analysis for bearing health',
        'Real-time Overall Equipment Effectiveness (OEE) tracking and micro-stoppage logging',
        'Zero-trust edge gateway management with encrypted over-the-air firmware updates'
      ]
    },
    {
      id: 'agriculture',
      num: '03',
      tag: 'PRECISION AGRI-TECH',
      title: 'Smart Agricultural Management System',
      description: 'Connect agricultural operations with intelligent monitoring, data, and management tools for better visibility across the farm.',
      flow: ['Field', 'Sensors', 'Data', 'Management'],
      icon: Sprout,
      accentColor: '#15803D',
      accentBg: '#F0FDF4',
      badge: 'Precision Irrigation & Soil Telemetry',
      capabilities: [
        'Multi-depth volumetric soil moisture, salinity, and temperature telemetry arrays',
        'Automated precision irrigation valve scheduling synchronized with weather forecast models',
        'Crop health vegetation indexing & micro-climate humidity alert triggers',
        'Connected tractor & pivot irrigation equipment fleet runtime tracking'
      ]
    }
  ];

  return (
    <div id="solutions" style={{ marginTop: '5rem', marginBottom: '5rem' }}>
      
      {/* Section Header */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
        <div className="eyebrow-tag" style={{ marginBottom: '0.75rem' }}>
          OUR CORE CAPABILITIES
        </div>
        <h2 className="section-headline" style={{ marginBottom: '1.25rem' }}>
          Three Areas. One Connected Technology Vision.
        </h2>
        <p className="body-large">
          A unified industrial platform architecture designed to bridge the physical reality of equipment, networks, and land with actionable enterprise intelligence.
        </p>
      </div>

      {/* Interactive Solution Switcher Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '3rem',
          flexWrap: 'wrap'
        }}
      >
        {solutions.map((sol) => {
          const isSelected = activeSolution === sol.id;
          const IconComponent = sol.icon;
          return (
            <button
              key={sol.id}
              onClick={() => setActiveSolution(sol.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.5rem',
                borderRadius: '10px',
                border: `1.5px solid ${isSelected ? sol.accentColor : '#E2E8F0'}`,
                backgroundColor: isSelected ? '#FFFFFF' : '#F8FAFC',
                color: isSelected ? '#0F172A' : '#64748B',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: isSelected ? '700' : '600',
                fontSize: '0.925rem',
                boxShadow: isSelected ? '0 4px 16px rgba(11, 58, 112, 0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                backgroundColor: isSelected ? sol.accentBg : '#E2E8F0',
                color: isSelected ? sol.accentColor : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconComponent size={14} />
              </div>
              <span>{sol.title.split(' ')[1]} {sol.title.split(' ')[2] || ''}</span>
              <span style={{ 
                fontSize: '0.7rem', 
                fontFamily: 'var(--font-mono)', 
                color: isSelected ? sol.accentColor : '#94A3B8',
                backgroundColor: isSelected ? sol.accentBg : '#EDF2F7',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {sol.num}
              </span>
            </button>
          );
        })}
      </div>

      {/* THREE LARGE EDITORIAL-STYLE PANELS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* PANEL 01 — SMART MAINTENANCE MANAGEMENT */}
        <section 
          id="solution-maintenance"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: `1px solid ${activeSolution === 'maintenance' ? '#93C5FD' : '#E2E8F0'}`,
            boxShadow: activeSolution === 'maintenance' ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
            opacity: activeSolution && activeSolution !== 'maintenance' ? 0.75 : 1,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
            padding: '3rem'
          }}
          className="editorial-panel"
          onMouseEnter={() => setActiveSolution('maintenance')}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }} className="solution-grid">
            
            {/* Left Content */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.8rem', 
                  fontWeight: '800', 
                  color: '#0B3A70', 
                  backgroundColor: '#EBF3FC', 
                  padding: '3px 8px', 
                  borderRadius: '4px' 
                }}>
                  SOLUTION 01
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  ENTERPRISE CMMS & ASSET RELIABILITY
                </span>
              </div>

              <h3 className="section-subheadline" style={{ marginBottom: '1.25rem' }}>
                Smart Maintenance<br />Management System
              </h3>

              <p className="body-large" style={{ marginBottom: '1.75rem', color: '#475569' }}>
                Bring maintenance operations, assets, work orders, schedules, and service activities into one connected system.
              </p>

              {/* Connecting Technology Flow */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>ARCHITECTURE FLOW:</span>
                <span style={{ color: '#0B3A70', fontWeight: '700' }}>Assets</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span style={{ color: '#0B3A70', fontWeight: '700' }}>Monitoring</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span style={{ color: '#0B3A70', fontWeight: '700' }}>Maintenance</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span style={{ color: '#16A34A', fontWeight: '700' }}>Insights</span>
              </div>

              {/* Capability List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: '#0B3A70', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem', color: '#334155' }}>
                    <strong>Automated Work Order Triggers:</strong> Sensor anomalies automatically spawn assigned work orders with checklists.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: '#0B3A70', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem', color: '#334155' }}>
                    <strong>Asset Lifecycle & Health Scores:</strong> Track MTBF, MTTR, depreciation, and real-time wear-and-tear coefficients.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: '#0B3A70', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem', color: '#334155' }}>
                    <strong>Mobile Technician Dispatch:</strong> Offline-capable work execution with QR asset verification.
                  </span>
                </div>
              </div>

              <button 
                onClick={onOpenExpertModal}
                className="btn-primary"
                style={{ fontSize: '0.9rem', padding: '0.75rem 1.4rem' }}
              >
                Request Maintenance Demo
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Right Visual: Clean Maintenance Dashboard */}
            <div style={{
              backgroundColor: '#FAFCFE',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              padding: '1.5rem',
              boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.08)'
            }}>
              {/* Top Dashboard Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#0B3A70', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wrench size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>CMMS Fleet Commander</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Plant Sector 01 • Active Shift</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                  HEALTH 98.4%
                </span>
              </div>

              {/* Maintenance Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Open Work Orders</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>04</div>
                  <div style={{ fontSize: '0.65rem', color: '#16A34A' }}>2 completed today</div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Mean Time To Repair</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0B3A70', fontFamily: 'var(--font-mono)' }}>42m</div>
                  <div style={{ fontSize: '0.65rem', color: '#0B3A70' }}>-18% vs last month</div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Compliance Rate</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#16A34A', fontFamily: 'var(--font-mono)' }}>100%</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B' }}>ISO 55001 aligned</div>
                </div>
              </div>

              {/* Live Work Orders Table */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid #EDF2F7', fontSize: '0.72rem', fontWeight: '700', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                  <span>ACTIVE SCHEDULE & WORK ORDERS</span>
                  <span>STATUS</span>
                </div>
                
                <div style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={14} style={{ color: '#D97706' }} />
                    <div>
                      <span style={{ fontWeight: '600', color: '#0F172A' }}>WO-8921: Hydraulic Pump Bearing Lubrication</span>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Assigned: Lead Tech R. Patel • Priority: High</div>
                    </div>
                  </div>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '600' }}>
                    In Progress
                  </span>
                </div>

                <div style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={14} style={{ color: '#0B3A70' }} />
                    <div>
                      <span style={{ fontWeight: '600', color: '#0F172A' }}>PM-1044: Monthly Spindle Calibration Check</span>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Scheduled: Tomorrow 08:00 AM • Automated trigger</div>
                    </div>
                  </div>
                  <span style={{ backgroundColor: '#EBF3FC', color: '#0B3A70', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '600' }}>
                    Scheduled
                  </span>
                </div>

                <div style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={14} style={{ color: '#16A34A' }} />
                    <div>
                      <span style={{ fontWeight: '600', color: '#0F172A' }}>WO-8919: Air Compressor Filter Replacement</span>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Completed by M. Santos • Duration: 24 min</div>
                    </div>
                  </div>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '600' }}>
                    Verified
                  </span>
                </div>

              </div>

            </div>

          </div>
        </section>


        {/* PANEL 02 — SMART INDUSTRIAL IoT */}
        <section 
          id="solution-iot"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: `1px solid ${activeSolution === 'iot' ? '#93C5FD' : '#E2E8F0'}`,
            boxShadow: activeSolution === 'iot' ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
            opacity: activeSolution && activeSolution !== 'iot' ? 0.75 : 1,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
            padding: '3rem'
          }}
          className="editorial-panel"
          onMouseEnter={() => setActiveSolution('iot')}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }} className="solution-grid">
            
            {/* Left Content */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.8rem', 
                  fontWeight: '800', 
                  color: '#0284C7', 
                  backgroundColor: '#E0F2FE', 
                  padding: '3px 8px', 
                  borderRadius: '4px' 
                }}>
                  SOLUTION 02
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  INDUSTRIAL TELEMETRY & EDGE NETWORKS
                </span>
              </div>

              <h3 className="section-subheadline" style={{ marginBottom: '1.25rem' }}>
                Smart Industrial IoT<br />Telemetry & Networks
              </h3>

              <p className="body-large" style={{ marginBottom: '1.75rem', color: '#475569' }}>
                Connect industrial assets and infrastructure to capture real-time telemetry, monitor performance, and turn operational data into actionable insights.
              </p>

              {/* Connecting Technology Flow */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>ARCHITECTURE FLOW:</span>
                <span style={{ color: '#0284C7', fontWeight: '700' }}>Sensors</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span style={{ color: '#0284C7', fontWeight: '700' }}>Telemetry</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span style={{ color: '#0284C7', fontWeight: '700' }}>Networks</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span style={{ color: '#16A34A', fontWeight: '700' }}>Analytics</span>
              </div>

              {/* Capability List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: '#0284C7', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem', color: '#334155' }}>
                    <strong>Edge Telemetry Gateways:</strong> Ingest high-speed analog/digital sensor streams with local edge intelligence.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: '#0284C7', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem', color: '#334155' }}>
                    <strong>Vibration & Thermal Telemetry:</strong> Detect mechanical imbalance, misalignment, and cavitation before failure occurs.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: '#0284C7', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem', color: '#334155' }}>
                    <strong>Industrial Network Security:</strong> TLS 1.3 encryption, hardware root of trust, and isolated industrial VLANs.
                  </span>
                </div>
              </div>

              <button 
                onClick={onOpenExpertModal}
                className="btn-primary"
                style={{ fontSize: '0.9rem', padding: '0.75rem 1.4rem' }}
              >
                Explore IoT Architecture
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Right Visual: Industrial Telemetry Monitoring */}
            <div style={{
              backgroundColor: '#FAFCFE',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              padding: '1.5rem',
              boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.08)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#0284C7', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Radio size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>Industrial Edge Telemetry</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>50 Hz Synchronized Ingestion • Modbus Gateway 02</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#0284C7', backgroundColor: '#E0F2FE', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                  BUFFER: OPTIMAL
                </span>
              </div>

              {/* Real-Time Machine Telemetry Visualizer */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0F172A' }}>Live Spectral Vibration Stream (Axis X/Y/Z)</span>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#16A34A' }}>1.18 mm/s RMS (Norm &lt; 2.5)</span>
                </div>

                {/* Spectral SVG Line */}
                <div style={{ height: '70px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                  <svg width="100%" height="100%" viewBox="0 0 400 70" preserveAspectRatio="none">
                    <path 
                      d="M0 35 Q 25 15, 50 35 T 100 35 T 150 20 T 200 45 T 250 28 T 300 38 T 350 18 T 400 35" 
                      fill="none" 
                      stroke="#0284C7" 
                      strokeWidth="2" 
                    />
                    <path 
                      d="M0 35 Q 20 45, 60 30 T 120 40 T 180 25 T 240 35 T 300 42 T 360 28 T 400 35" 
                      fill="none" 
                      stroke="#2563EB" 
                      strokeWidth="1.5" 
                      strokeOpacity="0.4"
                    />
                  </svg>
                </div>
              </div>

              {/* Multi-Node Industrial Sensors Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pump Stator Temp</span>
                    <span style={{ color: '#16A34A', fontWeight: '600' }}>Nominal</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    64.2°C
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Limit threshold: 85°C</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Flow Rate Velocity</span>
                    <span style={{ color: '#16A34A', fontWeight: '600' }}>Active</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    418 L/min
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Pressure: 4.8 bar</div>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* PANEL 03 — SMART AGRICULTURE */}
        <section 
          id="solution-agriculture"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: `1px solid ${activeSolution === 'agriculture' ? '#86EFAC' : '#E2E8F0'}`,
            boxShadow: activeSolution === 'agriculture' ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
            opacity: activeSolution && activeSolution !== 'agriculture' ? 0.75 : 1,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
            padding: '3rem'
          }}
          className="editorial-panel"
          onMouseEnter={() => setActiveSolution('agriculture')}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }} className="solution-grid">
            
            {/* Left Content */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.8rem', 
                  fontWeight: '800', 
                  color: '#15803D', 
                  backgroundColor: '#DCFCE7', 
                  padding: '3px 8px', 
                  borderRadius: '4px' 
                }}>
                  SOLUTION 03
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  SMART AGRICULTURAL MANAGEMENT
                </span>
              </div>

              <h3 className="section-subheadline" style={{ marginBottom: '1.25rem' }}>
                Smart Agricultural<br />Management System
              </h3>

              <p className="body-large" style={{ marginBottom: '1.75rem', color: '#475569' }}>
                Connect agricultural operations with intelligent monitoring, data, and management tools for better visibility across the farm.
              </p>

              {/* Connecting Technology Flow */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>ARCHITECTURE FLOW:</span>
                <span style={{ color: '#15803D', fontWeight: '700' }}>Field</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span style={{ color: '#15803D', fontWeight: '700' }}>Sensors</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span style={{ color: '#15803D', fontWeight: '700' }}>Data</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span style={{ color: '#0B3A70', fontWeight: '700' }}>Management</span>
              </div>

              {/* Capability List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: '#15803D', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem', color: '#334155' }}>
                    <strong>Precision Irrigation Control:</strong> Soil moisture matrix automation prevents overwatering and preserves groundwater.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: '#15803D', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem', color: '#334155' }}>
                    <strong>Microclimate Telemetry Probes:</strong> Solar-powered LoRa probes report canopy temperature, humidity, and solar radiation.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} style={{ color: '#15803D', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem', color: '#334155' }}>
                    <strong>Farm Infrastructure Fleet Telemetry:</strong> Track tractor hours, pump status, and pivot irrigation location in real-time.
                  </span>
                </div>
              </div>

              <button 
                onClick={onOpenExpertModal}
                className="btn-primary"
                style={{ fontSize: '0.9rem', padding: '0.75rem 1.4rem' }}
              >
                Request Agri-Tech Briefing
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Right Visual: Smart Agriculture Operations */}
            <div style={{
              backgroundColor: '#FAFCFE',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              padding: '1.5rem',
              boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.08)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#15803D', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sprout size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>Precision Farm Management</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Valley Sector B & C • 420 Hectares Under Telemetry</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#15803D', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                  ALL PROBES ONLINE
                </span>
              </div>

              {/* Soil & Environmental Status Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Droplets size={12} style={{ color: '#0284C7' }} />
                    Soil Moisture
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#15803D', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    68.4%
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#16A34A' }}>Depth: 30cm (Optimal)</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <SunMedium size={12} style={{ color: '#D97706' }} />
                    Canopy Temp
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    26.8°C
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Humidity: 62%</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={12} style={{ color: '#0B3A70' }} />
                    Pivot Line #2
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0B3A70', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    FLOWING
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#16A34A' }}>418 L/min active</div>
                </div>
              </div>

              {/* Field Microclimate & Probe Zone Map Indicator */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>Zone Sensor Grid Telemetry</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#64748B', fontSize: '0.7rem' }}>LoRaWAN 868MHz</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {['Probe 01 (Corn)', 'Probe 02 (Wheat)', 'Probe 03 (Pivot)', 'Probe 04 (Canal)'].map((p, i) => (
                    <div key={i} style={{ backgroundColor: '#F8FAFC', padding: '0.4rem', borderRadius: '6px', textAlign: 'center', border: '1px solid #EDF2F7' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748B' }}>{p.split(' ')[0]} {p.split(' ')[1]}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803D', fontFamily: 'var(--font-mono)' }}>99.2%</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

      </div>

      <style>{`
        .editorial-panel {
          padding: 1.25rem !important;
        }
        @media (min-width: 640px) {
          .editorial-panel {
            padding: 2rem !important;
          }
        }
        @media (min-width: 1024px) {
          .editorial-panel {
            padding: 3rem !important;
          }
        }
        @media (min-width: 992px) {
          .solution-grid {
            grid-template-columns: 1.1fr 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
