import React from 'react';
import { Eye, Network, Layers, ShieldCheck } from 'lucide-react';

export default function TrustStrip() {
  const capabilities = [
    {
      id: 'visibility',
      title: 'REAL-TIME VISIBILITY',
      description: 'Continuous operational telemetry across physical assets and distributed equipment.',
      icon: Eye,
      tag: '< 15ms Telemetry'
    },
    {
      id: 'connected',
      title: 'CONNECTED OPERATIONS',
      description: 'Unified data pipelines bridging hardware, edge controllers, and management software.',
      icon: Network,
      tag: 'Multi-Protocol'
    },
    {
      id: 'scalable',
      title: 'SCALABLE TECHNOLOGY',
      description: 'Modular enterprise architecture designed to scale seamlessly from single sites to fleets.',
      icon: Layers,
      tag: 'Cloud & Hybrid'
    },
    {
      id: 'secure',
      title: 'SECURE INFRASTRUCTURE',
      description: 'Industrial-grade encryption, role-based access control, and stringent compliance standards.',
      icon: ShieldCheck,
      tag: 'ISO / IEC Compliant'
    }
  ];

  return (
    <section 
      id="capabilities"
      style={{
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
        padding: '4.5rem 0',
        position: 'relative'
      }}
    >
      <div className="container-enterprise">
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '2.5rem',
            alignItems: 'start'
          }}
        >
          {capabilities.map((item) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1rem 0.5rem',
                  transition: 'transform 0.2s ease'
                }}
              >
                {/* Minimal Line Icon with subtle container */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#0B3A70',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
                }}>
                  <IconComponent size={22} strokeWidth={1.75} />
                </div>

                {/* Capability Title */}
                <h3 style={{
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  letterSpacing: '0.08em',
                  color: '#0F172A',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem'
                }}>
                  {item.title}
                </h3>

                {/* Capability Description */}
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748B',
                  lineHeight: '1.6',
                  marginBottom: '0.75rem'
                }}>
                  {item.description}
                </p>

                {/* Technical Tag */}
                <div style={{ marginTop: 'auto' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#0B3A70',
                    backgroundColor: '#EBF3FC',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: '600'
                  }}>
                    {item.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
