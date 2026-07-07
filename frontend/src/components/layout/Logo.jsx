import gmarkLogo from '@/assets/G Mark.png';

export default function Logo({ className = '', compact = false }) {
  const imgHeight = compact ? "48px" : "68px";

  return (
    <div 
      className={`logo-container ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        flexShrink: 0 
      }}
    >
      <img
        src={gmarkLogo}
        alt="G Mark Logo Mark"
        style={{
          height: imgHeight,
          width: 'auto',
          display: 'block',
          objectFit: 'contain',
          flexShrink: 0
        }}
      />
    </div>
  );
}



