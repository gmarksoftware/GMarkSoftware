import React, { useState } from 'react';
import { 
  Cpu, 
  Radio, 
  Network, 
  BrainCircuit, 
  Layers, 
  Activity, 
  Sprout, 
  Wrench, 
  Server, 
  LineChart, 
  CheckCircle2, 
  ArrowRight,
  Zap
} from 'lucide-react';

export default function HorizontalEcosystemVisual() {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      num: '01',
      title: 'ASSETS',
      subtitle: 'Physical Infrastructure',
      items: ['Machines & Motors', 'Industrial Equipment', 'Agricultural Infrastructure'],
      icon: Cpu,
      color: '#0B3A70',
      badge: 'Physical Assets',
      techDetail: 'Edge sensors retrofitted on pumps, CNCs, tractors & pivot irrigation.'
    },
    {
      num: '02',
      title: 'SENSORS',
      subtitle: 'Telemetry Collection',
      items: ['IoT Devices & Probes', 'Vibration & Acoustic', 'Soil & Environmental'],
      icon: Activity,
      color: '#0284C7',
      badge: 'High-Res Telemetry',
      techDetail: 'Sub-second sensor acquisition sampling at 50Hz with anomaly triggers.'
    },
    {
      num: '03',
      title: 'CONNECTIVITY',
      subtitle: 'Resilient Edge Pipelines',
      items: ['Industrial Gateways', 'MQTT / Modbus / CAN', 'LoRaWAN & Cellular'],
      icon: Network,
      color: '#2563EB',
      badge: 'Edge-to-Cloud',
      techDetail: 'Dual-path fallback failover guaranteeing 99.99% packet transport.'
    },
    {
      num: '04',
      title: 'INTELLIGENCE',
      subtitle: 'Analytical Models',
      items: ['Predictive ML Models', 'Automated Rules Engine', 'Root Cause Insights'],
      icon: BrainCircuit,
      color: '#7C3AED',
      badge: 'Continuous ML',
      techDetail: 'Predictive time-to-failure analysis & automated threshold optimization.'
    },
    {
      num: '05',
      title: 'ACTION',
      subtitle: 'Operational Decisions',
      items: ['Central Cockpits', 'Automated Work Orders', 'Early Warning Alerts'],
      icon: LineChart,
      color: '#16A34A',
      badge: 'Real-Time Impact',
      techDetail: 'Instant trigger dispatch to technicians, operators, and ERP systems.'
    }
  ];

  return (
    <div style={{ position: 'relative', marginTop: '3.5rem', marginBottom: '4rem' }}>
      
      {/* Top Architecture Container with Technical Grid */}
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 12px 32px -4px rgba(11, 58, 112, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
          padding: '2.5rem 2rem 2rem',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="bg-tech-grid"
      >
        {/* Stage Navigation Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#0B3A70', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              CONTINUOUS DATA PIPELINE ARCHITECTURE
            </span>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
              End-to-End Enterprise Flow
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
            <span>5 SYNCHRONIZED STAGES</span>
          </div>
        </div>

        {/* CONTINUOUS CONNECTING LINE BACKBONE */}
        <div style={{ position: 'relative', margin: '1rem 0 2rem' }} className="ecosystem-desktop-track">
          
          {/* SVG Continuous Horizontal Line */}
          <div style={{ position: 'relative', width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', margin: '20px 0' }}>
            {/* Animated Active Progress Line */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${((activeStage + 1) / stages.length) * 100}%`,
                background: 'linear-gradient(90deg, #0B3A70 0%, #2563EB 50%, #16A34A 100%)',
                borderRadius: '2px',
                transition: 'width 0.4s ease-out'
              }}
            />
          </div>

          {/* 5 Stage Horizontal Cards Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1.25rem',
              position: 'relative',
              zIndex: 2
            }}
            className="stages-grid"
          >
            {stages.map((stage, idx) => {
              const isSelected = activeStage === idx;
              const IconComp = stage.icon;

              return (
                <div 
                  key={stage.num}
                  onClick={() => setActiveStage(idx)}
                  style={{
                    backgroundColor: isSelected ? '#FFFFFF' : '#FAFCFE',
                    border: `1.5px solid ${isSelected ? stage.color : '#E2E8F0'}`,
                    borderRadius: '12px',
                    padding: '1.25rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isSelected 
                      ? '0 12px 24px -4px rgba(11, 58, 112, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.04)' 
                      : '0 2px 4px rgba(15, 23, 42, 0.02)',
                    transform: isSelected ? 'translateY(-4px)' : 'translateY(0)'
                  }}
                  onMouseEnter={() => setActiveStage(idx)}
                >
                  {/* Stage Number & Icon */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.75rem', 
                      fontWeight: '800', 
                      color: isSelected ? stage.color : '#94A3B8'
                    }}>
                      {stage.num}
                    </span>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? `${stage.color}15` : '#F1F5F9',
                      color: isSelected ? stage.color : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}>
                      <IconComp size={16} strokeWidth={2} />
                    </div>
                  </div>

                  {/* Stage Title */}
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: '800', 
                    letterSpacing: '0.04em',
                    color: isSelected ? '#0F172A' : '#334155',
                    marginBottom: '0.2rem'
                  }}>
                    {stage.title}
                  </div>

                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#64748B', 
                    fontWeight: '500',
                    marginBottom: '0.85rem'
                  }}>
                    {stage.subtitle}
                  </div>

                  {/* Bullet Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                    {stage.items.map((item, i) => (
                      <div key={i} style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: isSelected ? stage.color : '#CBD5E1' }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Selected Stage Deep-Dive Technical Detail Banner */}
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ 
              backgroundColor: '#FFFFFF', 
              border: `1px solid ${stages[activeStage].color}`, 
              color: stages[activeStage].color,
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: '700'
            }}>
              STAGE {stages[activeStage].num} HIGHLIGHT
            </span>
            <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: '500' }}>
              {stages[activeStage].techDetail}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
            <Zap size={14} style={{ color: '#0B3A70' }} />
            <span>REAL-TIME STREAMING: ACTIVE</span>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .stages-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
