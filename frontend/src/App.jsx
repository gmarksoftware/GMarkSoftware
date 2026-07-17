import { useState, useEffect, useRef } from 'react';
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
  const [swipeState, setSwipeState] = useState({ isSwiping: false, distance: 0, edge: 'left' });
  const [history, setHistory] = useState(['home']);

  const historyRef = useRef(['home']);
  const isTouchActiveRef = useRef(false);
  const isGoingBackToCarouselRef = useRef(false);
  
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Automatic history tracking
  useEffect(() => {
    if (currentView === 'home') {
      setHistory(['home']);
      return;
    }

    setHistory(prev => {
      const currentTop = prev[prev.length - 1];
      if (currentTop === currentView) return prev;
      if (prev.length > 1 && prev[prev.length - 2] === currentView) {
        return prev.slice(0, -1);
      }
      return [...prev, currentView];
    });
  }, [currentView]);

  // Set active carousel slide based on the subpage being left
  useEffect(() => {
    if (currentView === 'cmms') {
      setActiveCarouselSlide(2);
    } else if (currentView === 'iot') {
      setActiveCarouselSlide(1);
    } else if (currentView === 'gramunnati') {
      setActiveCarouselSlide(0);
    }
  }, [currentView]);

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



  // Swipe back gesture detection with visual overlay feedback (supporting Touch, Mouse drag, and Trackpad scroll from both edges)
  useEffect(() => {
    if (currentView === 'home') return;

    let startX = 0;
    let startY = 0;
    let swipeEdge = 'left'; // 'left' | 'right'
    let isMouseDown = false;
    let wheelAccumulator = 0;
    let wheelTimer = null;

    const edgeThreshold = 40; // Only start swipe within 40px from the edges
    const minSwipeDistance = 120; // Swipe at least 120px to trigger back
    const maxVerticalDeviation = 60; // Don't trigger if swiped vertically too much

    // Helper to perform the actual history back navigation
    const triggerBackNavigation = () => {
      const currentHistory = historyRef.current;
      if (currentHistory.length > 1) {
        const prevView = currentHistory[currentHistory.length - 2];
        if (prevView === 'home') {
          isGoingBackToCarouselRef.current = true;
        }
        setCurrentView(prevView);
      } else {
        setCurrentView('home');
      }
    };

    // Touch handlers
    const handleTouchStart = (e) => {
      isTouchActiveRef.current = true;
      const touch = e.touches[0];
      const width = window.innerWidth;
      
      if (touch.clientX < edgeThreshold) {
        startX = touch.clientX;
        startY = touch.clientY;
        swipeEdge = 'left';
        setSwipeState({ isSwiping: true, distance: 0, edge: 'left' });
      } else if (touch.clientX > width - edgeThreshold) {
        startX = touch.clientX;
        startY = touch.clientY;
        swipeEdge = 'right';
        setSwipeState({ isSwiping: true, distance: 0, edge: 'right' });
      } else {
        startX = 0;
      }
    };

    const handleTouchMove = (e) => {
      if (startX === 0) return;
      const touch = e.touches[0];
      const diffY = Math.abs(touch.clientY - startY);

      if (diffY > maxVerticalDeviation) {
        startX = 0;
        setSwipeState({ isSwiping: false, distance: 0, edge: 'left' });
        return;
      }

      let diffX = 0;
      if (swipeEdge === 'left') {
        diffX = touch.clientX - startX;
      } else {
        diffX = startX - touch.clientX;
      }

      if (diffX > 0) {
        setSwipeState({ isSwiping: true, distance: diffX, edge: swipeEdge });
        if (e.cancelable) e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (startX === 0) return;
      const touch = e.changedTouches[0];
      
      let diffX = 0;
      if (swipeEdge === 'left') {
        diffX = touch.clientX - startX;
      } else {
        diffX = startX - touch.clientX;
      }
      
      const diffY = Math.abs(touch.clientY - startY);

      if (diffX >= minSwipeDistance && diffY < maxVerticalDeviation) {
        triggerBackNavigation();
      }

      startX = 0;
      setSwipeState({ isSwiping: false, distance: 0, edge: 'left' });
      
      setTimeout(() => {
        isTouchActiveRef.current = false;
      }, 500);
    };

    // Mouse handlers for desktop/laptop
    const handleMouseDown = (e) => {
      if (isTouchActiveRef.current) return;
      const width = window.innerWidth;
      
      if (e.button === 0) {
        if (e.clientX < edgeThreshold) {
          startX = e.clientX;
          startY = e.clientY;
          swipeEdge = 'left';
          isMouseDown = true;
          setSwipeState({ isSwiping: true, distance: 0, edge: 'left' });
        } else if (e.clientX > width - edgeThreshold) {
          startX = e.clientX;
          startY = e.clientY;
          swipeEdge = 'right';
          isMouseDown = true;
          setSwipeState({ isSwiping: true, distance: 0, edge: 'right' });
        }
      }
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown || startX === 0) return;
      const diffY = Math.abs(e.clientY - startY);

      if (diffY > maxVerticalDeviation) {
        startX = 0;
        isMouseDown = false;
        setSwipeState({ isSwiping: false, distance: 0, edge: 'left' });
        return;
      }

      let diffX = 0;
      if (swipeEdge === 'left') {
        diffX = e.clientX - startX;
      } else {
        diffX = startX - e.clientX;
      }

      if (diffX > 0) {
        setSwipeState({ isSwiping: true, distance: diffX, edge: swipeEdge });
        e.preventDefault();
      }
    };

    const handleMouseUp = (e) => {
      if (!isMouseDown || startX === 0) return;
      
      let diffX = 0;
      if (swipeEdge === 'left') {
        diffX = e.clientX - startX;
      } else {
        diffX = startX - e.clientX;
      }
      
      const diffY = Math.abs(e.clientY - startY);

      if (diffX >= minSwipeDistance && diffY < maxVerticalDeviation) {
        triggerBackNavigation();
      }

      startX = 0;
      isMouseDown = false;
      setSwipeState({ isSwiping: false, distance: 0, edge: 'left' });
    };

    // Trackpad horizontal swipe back handler (anywhere on the screen)
    const handleWheel = (e) => {
      // deltaX < 0: finger swiping left-to-right (horizontal back scroll)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (e.deltaX < 0) {
          wheelAccumulator += Math.abs(e.deltaX);
          
          setSwipeState({ isSwiping: true, distance: wheelAccumulator * 0.6, edge: 'left' });
          
          if (e.cancelable) e.preventDefault();

          if (wheelAccumulator >= minSwipeDistance) {
            triggerBackNavigation();
            wheelAccumulator = 0;
            setSwipeState({ isSwiping: false, distance: 0, edge: 'left' });
          }
        }

        if (e.deltaX > 0) {
          wheelAccumulator = 0;
          setSwipeState({ isSwiping: false, distance: 0, edge: 'left' });
        }

        if (wheelTimer) clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => {
          wheelAccumulator = 0;
          setSwipeState({ isSwiping: false, distance: 0, edge: 'left' });
        }, 150);
      }
    };

    // Listeners
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      window.removeEventListener('wheel', handleWheel);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, [currentView]);

  // Unified Scroll & Scroll-Snapping management on view changes
  useEffect(() => {
    const updateScrollSnapping = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (currentView === 'home' && isDesktop) {
        document.documentElement.classList.add('snap-container');
      } else {
        document.documentElement.classList.remove('snap-container');
      }
    };
    
    updateScrollSnapping();
    
    if (isGoingBackToCarouselRef.current) {
      isGoingBackToCarouselRef.current = false;
      setTimeout(() => {
        const el = document.getElementById('systems-spotlight');
        if (el) {
          const isDesktop = window.innerWidth >= 1024;
          if (isDesktop) {
            // On desktop, align exactly to 100vh snap point
            window.scrollTo({ top: window.innerHeight, behavior: 'instant' });
          } else {
            // On mobile, use calculated offset
            const offset = 90;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'instant' });
          }
        }
      }, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    window.addEventListener('resize', updateScrollSnapping);
    return () => {
      document.documentElement.classList.remove('snap-container');
      window.removeEventListener('resize', updateScrollSnapping);
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

      {/* Swipe Back Visual Overlay Feedback */}
      {swipeState.isSwiping && swipeState.distance > 10 && (
        <div 
          className={`fixed top-0 bottom-0 z-50 pointer-events-none transition-opacity duration-150 ${
            swipeState.edge === 'left' ? 'left-0' : 'right-0'
          }`}
          style={{ 
            width: `${Math.min(swipeState.distance, 120)}px`,
            background: `linear-gradient(to ${swipeState.edge === 'left' ? 'right' : 'left'}, rgba(255, 90, 95, ${Math.min(swipeState.distance / 400, 0.25)}), transparent)`,
            opacity: Math.min(swipeState.distance / 100, 1)
          }}
        />
      )}

    </div>
  );
}

export default App;
