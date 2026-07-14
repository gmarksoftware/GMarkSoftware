import { cn } from "@/utils/utils";

export const Component = ({ className = "" }) => {
  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-xl p-6 md:p-8 lg:p-4 xl:p-8 border border-border-color bg-linear-to-b from-bg-secondary/40 to-bg-secondary/20 hover:from-bg-tertiary/60 hover:to-bg-secondary/50 backdrop-blur-md hover:border-accent-red/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_25px_rgba(255,90,95,0.25)] transition-all duration-300 flex flex-col justify-between text-text-primary ${className}`}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <h3 className="text-xl lg:text-lg xl:text-xl font-bold text-text-primary mb-3 lg:mb-1.5 xl:mb-3">
          Top-level performance
        </h3>
        <p className="text-sm lg:text-xs xl:text-sm text-text-secondary leading-relaxed">
          Made for static sites while avoiding heavy assets, your website will
          feel snappy and load instantly.
        </p>

        {/* Globe illustration */}
        <div className="mt-6 h-64 w-64 md:h-80 md:w-80 lg:h-52 lg:w-52 xl:h-80 xl:w-80 overflow-hidden">
          <svg
            viewBox="0 0 300 300"
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Glow hub - adaptive to theme */}
              <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                <stop
                  offset="0%"
                  stopColor="rgba(34,211,238,0.9)" // cyan‑500
                />
                <stop
                  offset="100%"
                  stopColor="rgba(59,130,246,0.1)" // blue‑500 faint
                />
              </radialGradient>
              {/* Line trail gradients - dark mode */}
              <linearGradient id="trailBright" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />{/* cyan-400 */}
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />{/* indigo-500 */}
              </linearGradient>
              <linearGradient id="trailDim" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
              </linearGradient>
              {/* Light mode gradients */}
              <linearGradient id="trailBrightLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0891b2" stopOpacity="0.8" />{/* cyan-600 */}
                <stop offset="100%" stopColor="#4338ca" stopOpacity="0.6" />{/* indigo-600 */}
              </linearGradient>
              <linearGradient id="trailDimLight" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0891b2" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#4338ca" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Enhanced globe group - no rotation */}
            <g>
              {/* Latitude lines - enhanced visibility */}
              {[...Array(6)].map((_, i) => (
                <ellipse
                  key={`lat-${i}`}
                  cx="150"
                  cy="150"
                  rx={120}
                  ry={40 + i * 12}
                  stroke="url(#trailDim)"
                  strokeWidth="1.2"
                  fill="none"
                  strokeDasharray="5 5"
                  style={{ animation: "flowAnimation 10s linear infinite" }}
                  opacity={0.8}
                  transform="rotate(-25,150,150)"
                  className="stroke-[url(#trailDim)]"
                />
              ))}

              {/* Longitude lines - enhanced visibility */}
              {[...Array(8)].map((_, i) => (
                <path
                  key={`lon-${i}`}
                  d="M150,30 A120,120 0 0,1 150,270"
                  stroke="url(#trailDim)"
                  strokeWidth="1.2"
                  fill="none"
                  strokeDasharray="4 4"
                  style={{ animation: "flowAnimation 12s linear infinite reverse" }}
                  opacity={0.8}
                  transform={`rotate(${i * 22.5},150,150)`}
                  className="stroke-[url(#trailDim)]"
                />
              ))}

              {/* Orbital trails - enhanced visibility */}
              <ellipse
                cx="150"
                cy="150"
                rx="140"
                ry="60"
                stroke="url(#trailBright)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="10 10"
                style={{ animation: "flowAnimation 14s linear infinite" }}
                opacity="1"
                transform="rotate(20,150,150)"
                className="stroke-[url(#trailBright)]"
              />
              <ellipse
                cx="150"
                cy="150"
                rx="130"
                ry="50"
                stroke="url(#trailDim)"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="12 12"
                style={{ animation: "flowAnimation 9s linear infinite reverse" }}
                opacity="0.9"
                transform="rotate(-40,150,150)"
                className="stroke-[url(#trailDim)]"
              />

            </g>
          </svg>
        </div>
      </div>

      {/* Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flowAnimation {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -100;
          }
        }
      `}} />
    </div>
  );
};
