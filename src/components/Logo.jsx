export default function Logo({ showText = true, className = '' }) {
  return (
    <div className={`logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
      <svg
        viewBox="0 0 100 60"
        width="54"
        height="32"
        style={{ overflow: 'visible', flexShrink: 0 }}
        aria-hidden="true"
      >
        {/* Tilted sketched ring/oval matching the logo artwork */}
        <path
          d="M 22 42 C 12 34, 20 21, 40 16 C 62 10, 85 18, 88 28 C 91 38, 70 46, 45 48 C 22 50, 10 44, 25 33 C 38 23, 68 15, 82 22"
          fill="none"
          stroke="var(--color-accent-red)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(249, 90, 90, 0.4))' }}
        />
      </svg>
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.5rem',
            fontWeight: '800',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em'
          }}>
            G Mark
          </span>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.55rem',
            fontWeight: '700',
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.14em',
            marginTop: '1px'
          }}>
            SOFTWARE PVT. LTD.
          </span>
        </div>
      )}
    </div>
  );
}
