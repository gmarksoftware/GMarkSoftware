import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ExpertModal from './components/ExpertModal';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import AppDetailPage from './pages/AppDetailPage';
import { APPLICATIONS } from './components/ApplicationsGridSection';

export default function App() {
  // Read initial route from URL path or hash with base path awareness
  const getRouteInfo = () => {
    const rawBase = (import.meta.env.BASE_URL || '/').replace(/^\/+|\/+$/g, '');
    let path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
    
    // Strip repository name if hosted under subfolder (e.g., /markg/ or /markg)
    if (rawBase && path.startsWith(rawBase.toLowerCase())) {
      path = path.slice(rawBase.length).replace(/^\/+/, '');
    }
    
    const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
    const full = path || hash;
    
    if (full === 'about') return { page: 'about', app: null };
    if (full === 'help') return { page: 'help', app: null };
    if (full.startsWith('app/')) {
      const slug = full.split('/')[1];
      const matchedApp = APPLICATIONS.find(a => a.id === slug) || APPLICATIONS.find(a => a.id.includes(slug)) || APPLICATIONS[0];
      const origin = window.history.state?.navigationOrigin || 'solutions';
      return { page: 'app-detail', app: { ...matchedApp, navigationOrigin: origin } };
    }
    return { page: 'home', app: null };
  };

  const initialRoute = getRouteInfo();
  const [currentPage, setCurrentPage] = useState(initialRoute.page);
  const [selectedApp, setSelectedApp] = useState(initialRoute.app);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);

  // Helper to build canonical URL respecting base
  const getTargetUrl = (target) => {
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    if (target === 'home' || target === '/' || target === '') {
      return cleanBase;
    }
    const cleanTarget = target.replace(/^\/+/, '');
    return `${cleanBase}${cleanTarget}`;
  };

  // Sync state with browser Back and Forward navigation (popstate event)
  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteInfo();
      setCurrentPage(route.page);
      setSelectedApp(route.app);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update page and browser history
  const handleNavigate = (page) => {
    if (page === currentPage && page !== 'app-detail') return;

    setCurrentPage(page);
    setSelectedApp(null);
    const targetUrl = getTargetUrl(page);
    
    window.history.pushState({ page }, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectApp = (app) => {
    const origin = app?.navigationOrigin || 'solutions';
    setSelectedApp({ ...app, navigationOrigin: origin });
    setCurrentPage('app-detail');
    const targetUrl = getTargetUrl(`app/${app.id}`);
    window.history.pushState({ page: 'app-detail', appId: app.id, navigationOrigin: origin }, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Sticky Enterprise Navigation Bar */}
      <Navbar 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenExpertModal={() => setIsExpertModalOpen(true)}
        onSelectApp={handleSelectApp}
      />

      {/* Main View Router */}
      <main style={{ minHeight: '100vh' }}>
        {currentPage === 'home' && (
          <HomePage 
            onOpenExpertModal={() => setIsExpertModalOpen(true)}
            onNavigate={handleNavigate}
            onSelectApp={handleSelectApp}
          />
        )}

        {currentPage === 'app-detail' && (
          <AppDetailPage 
            app={selectedApp}
            onBack={() => handleNavigate('home')}
            onNavigate={handleNavigate}
            onOpenExpertModal={() => setIsExpertModalOpen(true)}
            onSelectApp={handleSelectApp}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage 
            onOpenExpertModal={() => setIsExpertModalOpen(true)}
            onExploreSolutions={() => {}}
          />
        )}

        {currentPage === 'help' && (
          <HelpPage 
            onOpenExpertModal={() => setIsExpertModalOpen(true)}
          />
        )}
      </main>

      {/* Enterprise Footer Component */}
      {currentPage !== 'about' && (
        <Footer 
          onNavigate={handleNavigate}
          onOpenExpertModal={() => setIsExpertModalOpen(true)}
        />
      )}

      {/* Interactive Consultation Modal */}
      <ExpertModal 
        isOpen={isExpertModalOpen}
        onClose={() => setIsExpertModalOpen(false)}
      />
    </div>
  );
}


