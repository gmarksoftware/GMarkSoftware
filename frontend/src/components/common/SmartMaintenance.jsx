export default function SmartMaintenance({ onCTA }) {
  return (
    <section id="4m-system" className="relative border-t border-border-color bg-transparent py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Phone & Copy */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            
            {/* Phone and Title block */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8">
              
              {/* Phone Mockup */}
              <div className="relative shrink-0">
                {/* Phone Frame */}
                <div className="relative w-[130px] h-[250px] rounded-[28px] border-[5px] border-text-secondary/40 bg-[#05070D] flex flex-col justify-between p-3 shadow-2xl overflow-hidden">
                  
                  {/* Speaker Notch */}
                  <div className="w-12 h-3.5 bg-text-secondary/30 rounded-full mx-auto -mt-1 flex items-center justify-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <div className="w-4 h-0.5 rounded-full bg-white/20" />
                  </div>

                  {/* Phone Screen Core */}
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <span className="text-4xl font-extrabold text-white tracking-widest font-title">
                      4M
                    </span>
                  </div>

                  {/* Home indicator */}
                  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-1" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-title leading-[1.15] text-text-primary tracking-tight">
                Smart Maintenance Management System
              </h2>
            </div>

            {/* Description Block */}
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl">
              4M is a CMMS software which streamlines maintenance operations providing comprehensive connectivity for maintenance activities. It empowers teams and businesses to efficiently track, manage, and optimize their maintenance tasks, ensuring enhanced productivity and reduced downtime.
            </p>

            {/* CTA Button */}
            <button
              onClick={onCTA}
              className="bg-accent-red text-on-primary-fixed hover:bg-accent-red-hover px-10 py-4.5 font-bold uppercase tracking-widest text-xs rounded shadow-lg shadow-accent-red/25 transition-all duration-300 w-fit cursor-pointer animate-none"
            >
              Learn More
            </button>
          </div>

          {/* Right Column: Outline Monitor Mockup */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div className="relative w-full max-w-[540px]">
              
              {/* Desktop Screen Container */}
              <div className="relative w-full">
                
                {/* Monitor Frame */}
                <div className="rounded-2xl border-[6px] border-text-secondary/40 bg-transparent p-6 overflow-hidden aspect-16/10 flex items-center justify-center">
                  
                  {/* Dashboard Screen Content */}
                  <div className="grid grid-cols-3 gap-4 items-center justify-items-center w-full">
                    
                    {/* Line/Bar Chart Outline */}
                    <div className="w-full flex items-center justify-center p-2">
                      <svg className="w-full max-w-[120px] h-[100px] text-text-secondary/40" viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="1.2">
                        {/* Axis */}
                        <path d="M10 10 L10 70 L90 70" />
                        {/* Bars */}
                        <rect x="22" y="50" width="10" height="20" />
                        <rect x="42" y="38" width="10" height="32" />
                        <rect x="62" y="25" width="10" height="45" />
                        {/* Line */}
                        <path d="M10 65 L27 55 L47 43 L67 30 L85 15" strokeWidth="1.8" />
                        <circle cx="85" cy="15" r="2" fill="currentColor" />
                      </svg>
                    </div>

                    {/* Pie Chart Outline */}
                    <div className="w-full flex items-center justify-center p-2">
                      <svg className="w-full max-w-[100px] h-[100px] text-text-secondary/40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <circle cx="50" cy="50" r="40" />
                        <path d="M50 10 L50 50 L90 50" />
                        <path d="M50 50 L22 78" />
                        <path d="M50 50 L78 78" />
                      </svg>
                    </div>

                    {/* Document Preview Outline */}
                    <div className="w-full flex items-center justify-center p-2">
                      <svg className="w-full max-w-[100px] h-[110px] text-text-secondary/40" viewBox="0 0 100 110" fill="none" stroke="currentColor" strokeWidth="1.2">
                        {/* Background dashed document */}
                        <rect x="25" y="20" width="55" height="75" strokeDasharray="3 3" />
                        {/* Foreground solid document */}
                        <rect x="15" y="10" width="55" height="75" fill="#05070D" />
                        {/* Text lines in document */}
                        <line x1="23" y1="22" x2="48" y2="22" strokeDasharray="2 2" />
                        <line x1="23" y1="32" x2="62" y2="32" strokeDasharray="2 2" />
                        <line x1="23" y1="42" x2="52" y2="42" strokeDasharray="2 2" />
                        <line x1="23" y1="52" x2="42" y2="52" strokeDasharray="2 2" />
                      </svg>
                    </div>

                  </div>

                </div>

                {/* Monitor Stand */}
                <div className="w-20 h-10 border-x-[5px] border-b-[5px] border-text-secondary/40 mx-auto mt-[-5px]" />
                {/* Monitor Base */}
                <div className="w-44 h-1.5 bg-text-secondary/40 mx-auto rounded-full" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
