import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HeroCarousel from './components/HeroCarousel';
import Features from './components/Features';
import Support from './components/Support';
import Footer from './components/Footer';
import BackgroundParticles from './components/BackgroundParticles';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'support'
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    // Only run scroll-spy observer on the home page view
    if (currentView !== 'home') return;

    const sections = ['home', 'features', 'solutions'];
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px', // trigger when section occupies the middle view
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [currentView]);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentView]);

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary selection:bg-accent-red/35 selection:text-text-primary">
      <BackgroundParticles />

      {/* Sticky Header Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        activeSection={activeSection}
      />

      {/* Main Content Layout */}
      <main className="flex-1">
        {currentView === 'home' ? (
          <>
            {/* Hero Landing Banner */}
            <Hero onCTA={() => setCurrentView('support')} />

            {/* Systems Spotlight Carousel */}
            <HeroCarousel onCTA={() => setCurrentView('support')} />

            {/* Features & Solutions Section */}
            <Features onCTA={() => setCurrentView('support')} />
          </>
        ) : (
          /* Separate Dedicated Support Page */
          <Support />
        )}
      </main>

      {/* Global Footer Bottom */}
      <Footer onViewChange={setCurrentView} />

    </div>
  );
}

export default App;
