import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/layout/Hero';
import HeroCarousel from './components/layout/HeroCarousel';
import Features from './components/layout/Features';
import Support from './pages/Support';
import Footer from './components/layout/Footer';
import MoreLayout from './pages/MoreLayout';
import GramUnnatiInfo from './pages/GramUnnatiInfo';
import CmmsInfo from './pages/CmmsInfo';
import IotInfo from './pages/IotInfo';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'support'
  const [activeSection, setActiveSection] = useState('home');
  const [activeCarouselSlide, setActiveCarouselSlide] = useState(0);

  const handleSelectSolution = (slideIndex) => {
    setCurrentView('home');
    setActiveCarouselSlide(slideIndex);
    setTimeout(() => {
      const element = document.getElementById('systems-spotlight');
      if (element) {
        const offset = 90;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 150);
  };



  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentView]);

  // Dynamically manage desktop scroll snapping class on html element
  useEffect(() => {
    if (currentView === 'home') {
      document.documentElement.classList.add('snap-container');
    } else {
      document.documentElement.classList.remove('snap-container');
    }
    return () => {
      document.documentElement.classList.remove('snap-container');
    };
  }, [currentView]);

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary selection:bg-accent-red/35 selection:text-text-primary">

      {/* Sticky Header Navigation */}
      {currentView !== 'gramunnati' && currentView !== 'cmms' && currentView !== 'iot' && (
        <Navbar
          currentView={currentView}
          onViewChange={setCurrentView}
          activeSection={activeSection}
          onActiveSectionChange={setActiveSection}
        />
      )}

      {/* Main Content Layout */}
      <main className="flex-1">
        {currentView === 'home' ? (
          <>
            {/* Hero Landing Banner */}
            <Hero onCTA={() => {
              const el = document.getElementById('solutions');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} />

            {/* Systems Spotlight Carousel */}
            <HeroCarousel 
              onCTA={(view) => {
                if (typeof view === 'string') setCurrentView(view);
                else setCurrentView('contact');
              }} 
              activeSlideIndex={activeCarouselSlide}
              onChangeSlide={setActiveCarouselSlide}
            />

            {/* Features & Solutions Section */}
            <Features 
              onCTA={() => setCurrentView('contact')} 
              onViewChange={setCurrentView}
              onSelectSolution={handleSelectSolution}
            />
          </>
        ) : currentView === 'support' ? (
          /* Separate Dedicated Support Page */
          <Support />
        ) : currentView === 'gramunnati' ? (
          /* Separate Dedicated GramUnnati Dashboard */
          <GramUnnatiInfo onViewChange={setCurrentView} />
        ) : currentView === 'cmms' ? (
          /* Separate Dedicated 4M CMMS Dashboard */
          <CmmsInfo onViewChange={setCurrentView} />
        ) : currentView === 'iot' ? (
          /* Separate Dedicated Smart Industrial IoT Dashboard */
          <IotInfo onViewChange={setCurrentView} />
        ) : (
          /* Sub-pages layout under 'More' (Blog, Contact Us, Privacy Policy, Employees) */
          <MoreLayout activeTab={currentView} onTabChange={setCurrentView} />
        )}
      </main>

      {/* Global Footer Bottom (rendered only on subpages; on homepage it snaps with CTA inside Features.jsx) */}
      {currentView !== 'home' && currentView !== 'support' && currentView !== 'contact' && currentView !== 'gramunnati' && currentView !== 'cmms' && currentView !== 'iot' && (
        <Footer 
          onViewChange={setCurrentView} 
          currentView={currentView} 
          onSelectSolution={handleSelectSolution}
        />
      )}

    </div>
  );
}

export default App;
