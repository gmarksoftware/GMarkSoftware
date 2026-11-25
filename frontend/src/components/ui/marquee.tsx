import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  speed?: number;
}

export function Marquee({
  children,
  pauseOnHover = true,
  direction = "left",
  speed = 28,
  className,
  ...props
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "w-full max-w-full overflow-hidden z-20 flex justify-center",
        className
      )}
      {...props}
    >
      <div 
        className="relative flex w-full max-w-full overflow-hidden py-2"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent 0px, black 40px, black calc(100% - 40px), transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0px, black 40px, black calc(100% - 40px), transparent 100%)",
        }}
      >
        <div
          className={cn(
            "flex w-max items-center animate-marquee",
            pauseOnHover && "hover:[animation-play-state:paused]",
            direction === "right" && "animate-marquee-reverse"
          )}
          style={{ "--duration": `${speed}s` } as React.CSSProperties}
        >
          <div className="flex shrink-0 items-center">
            {children}
          </div>
          <div className="flex shrink-0 items-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
