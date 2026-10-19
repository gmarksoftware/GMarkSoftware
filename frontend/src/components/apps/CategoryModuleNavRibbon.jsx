import React from 'react';
import { getModulesByCategory } from '../../data/modulesRegistry';

export default function CategoryModuleNavRibbon({ currentModule, onSelectApp }) {
  if (!currentModule || !currentModule.categorySlug) return null;

  const siblingModules = getModulesByCategory(currentModule.categorySlug);
  if (!siblingModules || siblingModules.length <= 1) return null;

  return (
    <div 
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0.65rem 1rem',
        position: 'sticky',
        top: '64px',
        zIndex: 35,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}
    >
      <div 
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="no-scrollbar"
      >
        <span 
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            paddingRight: '0.65rem',
            borderRight: '1px solid #E2E8F0',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {currentModule.category}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          {siblingModules.map((mod) => {
            const isActive = mod.id === currentModule.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => onSelectApp && onSelectApp(mod)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  backgroundColor: isActive ? '#0F172A' : '#F3F4F6',
                  padding: '0.32rem 0.8rem',
                  borderRadius: '9999px',
                  border: isActive ? '1px solid #0F172A' : '1px solid #E5E7EB',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#E5E7EB';
                    e.currentTarget.style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                    e.currentTarget.style.color = '#4B5563';
                  }
                }}
              >
                {mod.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
