import React from "react";
import AboutSection3 from "@/components/ui/about-section";

export default function AboutPage({ onOpenExpertModal, onExploreSolutions }) {
  return (
    <div 
      className="w-full min-h-screen bg-[#f9f9f9] flex flex-col justify-start"
      style={{ paddingTop: '4.25rem', paddingBottom: '3.5rem' }}
    >
      <AboutSection3 onCollaborateClick={onOpenExpertModal} />
    </div>
  );
}
