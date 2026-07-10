import gmarkLogo from '@/assets/G Mark.png';

export default function Logo({ className = '', compact = false }) {
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
        className="h-[44px] sm:h-[48px] md:h-[68px] w-auto block object-contain shrink-0"
      />
    </div>
  );
}



