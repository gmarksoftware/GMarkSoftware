import React from "react";
import AboutSection3 from "@/components/ui/about-section";

export default function AboutPage({ onOpenExpertModal, onExploreSolutions }) {
  return (
    <div 
      className="w-full min-h-screen flex flex-col justify-start overflow-x-hidden"
      style={{ 
        background: 'linear-gradient(180deg, #FDFBFE 0%, #F6EFF9 35%, #EEF6FF 100%)',
        paddingTop: '5rem', 
        paddingBottom: '0rem',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <AboutSection3 onCollaborateClick={onOpenExpertModal} />
    </div>
  );
}
