import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Radio, 
  Server, 
  Wrench, 
  Sprout, 
  Gauge, 
  Layers, 
  CheckCircle2, 
  Zap, 
  CloudCheck, 
  Droplets,
  TrendingUp,
  AlertCircle,
  BarChart3
} from 'lucide-react';

export default function HeroTechnologyVisual() {
  // Live fluctuating telemetry to give life to real-world data streaming
  const [metrics, setMetrics] = useState({
    vibration: 1.18,
    temp: 64.2,
    oee: 94.6,
    soilMoisture: 68.4,
    flowRate: 418,
    latency: 12,
    packetsPerSec: 1420
  });

  const [activeNode, setActiveNode] = useState('cloud');

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        vibration: Number((1.15 + Math.random() * 0.08).toFixed(2)),
        temp: Number((64.0 + Math.random() * 0.6).toFixed(1)),
        oee: Number((94.4 + Math.random() * 0.5).toFixed(1)),
        soilMoisture: Number((68.2 + Math.random() * 0.5).toFixed(1)),
        flowRate: Math.floor(415 + Math.random() * 8),
        latency: Math.floor(11 + Math.random() * 3),
        packetsPerSec: Math.floor(1400 + Math.random() * 50)
      }));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '580px',
        margin: '0 auto',
        userSelect: 'none'
      }}
      className="animate-float"
    >
      {/* Container Card with subtle technical frame and soft shadow */}
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 45px -10px rgba(11, 58, 112, 0.12), 0 4px 16px -2px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Top Technical Status Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          backgroundColor: '#FAFCFE',
          borderBottom: '1px solid #EDF2F7',
          fontSize: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: '#16A34A',
              boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.2)'
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: '#334155' }}>
              TELEMETRY_PIPELINE: ACTIVE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
            <span>LATENCY: <strong style={{ color: '#0B3A70' }}>{metrics.latency}ms</strong></span>
            <span>FREQ: <strong style={{ color: '#0F172A' }}>50Hz</strong></span>
          </div>
        </div>

        {/* Interactive Visual Canvas Area */}
        <div style={{
          position: 'relative',
          padding: '1.5rem',
          backgroundColor: '#FFFFFF',
          minHeight: '440px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
        className="bg-tech-grid"
        >
          {/* Animated Connecting SVG Data Lines */}
          <svg 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            <defs>
              <linearGradient id="lineGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B3A70" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#2563EB" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0B3A70" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="lineGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#16A34A" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0B3A70" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Industrial Line: Machine/Sensors -> Gateway */}
            <path 
              d="M 120 70 L 270 140" 
              fill="none" 
              stroke="url(#lineGradBlue)" 
              strokeWidth="2" 
              strokeDasharray="4 4"
              style={{ animation: 'dataPulse 2.5s linear infinite' }}
            />
            {/* Agriculture Line: Agri/Sensors -> Gateway */}
            <path 
              d="M 440 70 L 270 140" 
              fill="none" 
              stroke="url(#lineGradGreen)" 
              strokeWidth="2" 
              strokeDasharray="4 4"
              style={{ animation: 'dataPulse 3s linear infinite' }}
            />
            {/* Gateway -> Cloud Core */}
            <path 
              d="M 270 175 L 270 245" 
              fill="none" 
              stroke="#0B3A70" 
              strokeWidth="2" 
              strokeDasharray="6 4"
              style={{ animation: 'dataPulse 2s linear infinite' }}
            />
            {/* Cloud Core -> Dashboard Action */}
            <path 
              d="M 270 290 L 270 345" 
              fill="none" 
              stroke="#2563EB" 
              strokeWidth="2.5"
            />
          </svg>

          {/* LAYER 1: PHYSICAL WORLD ASSETS (Top Row) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', position: 'relative', zIndex: 2 }}>
            
            {/* Industrial Equipment & Sensor Node */}
            <div 
              onClick={() => setActiveNode('industrial')}
              style={{
                backgroundColor: '#FAFCFE',
                border: `1px solid ${activeNode === 'industrial' ? '#93C5FD' : '#E2E8F0'}`,
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#EBF3FC', color: '#0B3A70', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={14} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F172A' }}>Industrial CNC #04</span>
                </div>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#16A34A', fontWeight: '600', backgroundColor: '#DCFCE7', padding: '1px 5px', borderRadius: '4px' }}>
                  ONLINE
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #EDF2F7' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Vibration</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                    {metrics.vibration} <span style={{ fontSize: '0.65rem', fontWeight: '400', color: '#94A3B8' }}>mm/s</span>
                  </div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #EDF2F7' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Core Temp</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                    {metrics.temp}°<span style={{ fontSize: '0.65rem', fontWeight: '400', color: '#94A3B8' }}>C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Agriculture Element (Subtle Green) */}
            <div 
              onClick={() => setActiveNode('agri')}
              style={{
                backgroundColor: '#FAFCFE',
                border: `1px solid ${activeNode === 'agri' ? '#86EFAC' : '#E2E8F0'}`,
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#F0FDF4', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sprout size={14} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F172A' }}>Field Sector B</span>
                </div>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#15803D', fontWeight: '600', backgroundColor: '#DCFCE7', padding: '1px 5px', borderRadius: '4px' }}>
                  OPTIMAL
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #EDF2F7' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Soil Moisture</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#15803D', fontFamily: 'var(--font-mono)' }}>
                    {metrics.soilMoisture}%
                  </div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #EDF2F7' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Irrig. Flow</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                    {metrics.flowRate} <span style={{ fontSize: '0.65rem', fontWeight: '400', color: '#94A3B8' }}>L/m</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* LAYER 2: EDGE GATEWAY & PROTOCOLS (Center Pipeline) */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2, margin: '0.5rem 0' }}>
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #0B3A70',
                borderRadius: '24px',
                padding: '0.4rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 12px rgba(11, 58, 112, 0.08)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <Radio size={14} style={{ color: '#0B3A70' }} />
              <span style={{ color: '#0F172A', fontWeight: '600' }}>Edge Telemetry Bridge</span>
              <span style={{ color: '#64748B' }}>|</span>
              <span style={{ color: '#2563EB', fontWeight: '600' }}>MQTT • Modbus • LoRaWAN</span>
            </div>
          </div>

          {/* LAYER 3: CLOUD DATA & INTELLIGENCE ENGINE */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
            <div 
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '0.75rem 1.25rem',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#0B3A70', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A' }}>G Mark Cloud Intelligence</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Predictive models & continuous anomaly evaluation</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0B3A70', fontFamily: 'var(--font-mono)' }}>
                  {metrics.packetsPerSec} msg/s
                </span>
              </div>
            </div>
          </div>

          {/* LAYER 4: DIGITAL DASHBOARD & OPERATIONAL ACTION (Bottom Card) */}
          <div style={{ position: 'relative', zIndex: 2, marginTop: '0.5rem' }}>
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #BFDBFE',
                padding: '1rem',
                boxShadow: '0 8px 24px -4px rgba(11, 58, 112, 0.12)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={16} style={{ color: '#0B3A70' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A' }}>Central Operations Cockpit</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#16A34A', fontWeight: '600' }}>
                  <CheckCircle2 size={12} />
                  <span>All Systems In Nominal State</span>
                </div>
              </div>

              {/* 3 Metric Pillars in Dashboard */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                
                {/* OEE Metric */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Fleet OEE</span>
                    <TrendingUp size={12} style={{ color: '#16A34A' }} />
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {metrics.oee}%
                  </div>
                  <div style={{ fontSize: '0.625rem', color: '#16A34A', fontWeight: '500' }}>+2.4% vs benchmark</div>
                </div>

                {/* Maintenance Status */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Active Work Orders</span>
                    <Wrench size={12} style={{ color: '#0B3A70' }} />
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0B3A70', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    03 <span style={{ fontSize: '0.7rem', fontWeight: '400', color: '#64748B' }}>Sched.</span>
                  </div>
                  <div style={{ fontSize: '0.625rem', color: '#64748B' }}>0 overdue tasks</div>
                </div>

                {/* Asset Health */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>System Health</span>
                    <Activity size={12} style={{ color: '#16A34A' }} />
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#16A34A', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    99.8%
                  </div>
                  <div style={{ fontSize: '0.625rem', color: '#64748B' }}>Zero anomalies</div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Bottom Verification Label */}
        <div style={{
          padding: '0.6rem 1.25rem',
          backgroundColor: '#FAFCFE',
          borderTop: '1px solid #EDF2F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: '#64748B'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0B3A70' }} />
            Autonomous Synchronization Engine
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#0F172A', fontWeight: '600' }}>ISO 27001 & IEC 62443 COMPLIANT</span>
        </div>

      </div>
    </div>
  );
}
