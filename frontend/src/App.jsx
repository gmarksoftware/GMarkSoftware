import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ExpertModal from './components/ExpertModal';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import AppDetailPage from './pages/AppDetailPage';
import { APPLICATIONS, findAppOrModule } from './components/ApplicationsGridSection';
import { getModuleById } from './data/modulesRegistry';
import { useAuth } from './lib/AuthContext.jsx';
import Icon from './components/Icon.jsx';
import Auth from './pages/auth/Auth.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import Courses from './pages/Courses.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import CourseExcelViewer from './pages/CourseExcelViewer.jsx';
import CertificateVerification from './pages/CertificateVerification.jsx';
import Admin from './pages/admin/Admin.jsx';

function PublicWebsite() {
  const location = useLocation();

  // Read route from URL path or hash with base path awareness
  const getRouteInfo = useCallback(() => {
    const rawBase = (import.meta.env.BASE_URL || '/').replace(/^\/+|\/+$/g, '');
    let path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');

    // Strip repository name if hosted under subfolder (e.g., /markg/ or /markg)
    if (rawBase && path.startsWith(rawBase.toLowerCase())) {
      path = path.slice(rawBase.length).replace(/^\/+/, '');
    } else if (path.startsWith('markg/')) {
      path = path.slice(6).replace(/^\/+/, '');
    } else if (path === 'markg') {
      path = '';
    }

    const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
    const full = path || hash;

    if (full === 'about') return { page: 'about', app: null };
    if (full === 'help') return { page: 'help', app: null };
    if (full.startsWith('app/') || full.startsWith('technology/') || full.startsWith('module/')) {
      const parts = full.split('/');
      const slug = parts[1];
      const origin = full.startsWith('technology/') ? 'technology' : (window.history.state?.navigationOrigin || 'solutions');
      const matchedApp = getModuleById(slug) || findAppOrModule(slug) || APPLICATIONS[0];
      return { page: 'app-detail', app: { ...matchedApp, navigationOrigin: origin } };
    }
    return { page: 'home', app: null };
  }, []);

  const initialRoute = getRouteInfo();
  const [currentPage, setCurrentPage] = useState(initialRoute.page);
  const [selectedApp, setSelectedApp] = useState(initialRoute.app);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);

  // Keep public view synced when React Router navigates back to public routes
  useEffect(() => {
    const route = getRouteInfo();
    setCurrentPage(route.page);
    setSelectedApp(route.app);
  }, [location.pathname, location.hash, getRouteInfo]);

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
  }, [getRouteInfo]);

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
    <div className="min-h-screen bg-white text-slate-900 w-full overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Fixed 1440px Desktop Viewport Container */}
      <div className="w-full max-w-[1440px] mx-auto min-h-screen relative flex flex-col bg-white">
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
              onExploreSolutions={() => { }}
            />
          )}

          {currentPage === 'help' && (
            <HelpPage
              onOpenExpertModal={() => setIsExpertModalOpen(true)}
            />
          )}
        </main>

        {/* Enterprise Footer Component */}
        <Footer
          onNavigate={handleNavigate}
          onOpenExpertModal={() => setIsExpertModalOpen(true)}
        />
      </div>

      {/* Interactive Consultation Modal */}
      <ExpertModal
        isOpen={isExpertModalOpen}
        onClose={() => setIsExpertModalOpen(false)}
      />
    </div>
  );
}

function PortalShell({ children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-blue-100 selection:text-blue-900">
      {children}
    </div>
  );
}

function AdminRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <PortalShell>
        <div className="min-h-screen flex items-center justify-center text-[#2563EB]">
          <Icon name="sync" className="animate-spin text-4xl" />
        </div>
      </PortalShell>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return (
      <PortalShell>
        <div className="max-w-xl mx-auto px-6 py-32 text-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
            <h1 className="text-3xl font-extrabold text-[#0F172A] mb-3">Admin Access Only</h1>
            <p className="text-[#475569] mb-6 text-sm">
              You are signed in as <strong className="text-[#0F172A]">{user.email}</strong>, which is a registered learner account, not an administrator account.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/dashboard" className="px-6 py-3 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white font-bold shadow-md shadow-blue-600/25 hover:from-[#1D4ED8] hover:to-[#4338CA] transition">
                Go to My Learner Dashboard →
              </Link>
              <Link to="/" className="px-6 py-3 rounded-full border border-slate-200 bg-white text-[#0F172A] font-bold hover:bg-slate-50 transition">
                Back to Website
              </Link>
              <button onClick={() => { logout(); navigate('/login'); }} className="px-6 py-3 rounded-full border border-red-200 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition cursor-pointer">
                Switch Account
              </button>
            </div>
          </div>
        </div>
      </PortalShell>
    );
  }

  return <Admin onLogout={() => { logout(); navigate('/login'); }} />;
}

function MetaPixelTracker() {
  const location = useLocation();
  const isFirstMountRef = useRef(true);
  const lastTrackedUrlRef = useRef('');

  useEffect(() => {
    const currentUrl = `${location.pathname}${location.search}${location.hash}`;
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      lastTrackedUrlRef.current = currentUrl;
      return;
    }
    if (currentUrl === lastTrackedUrlRef.current) return;
    lastTrackedUrlRef.current = currentUrl;
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
}

export default function App() {
  return (
    <>
      <MetaPixelTracker />
      <Routes>
        <Route path="/auth" element={<PortalShell><Auth initialView="login" /></PortalShell>} />
        <Route path="/login" element={<PortalShell><Auth initialView="login" /></PortalShell>} />
        <Route path="/register" element={<PortalShell><Auth initialView="register" /></PortalShell>} />
        <Route path="/dashboard" element={<PortalShell><UserDashboard /></PortalShell>} />
        <Route path="/profile" element={<PortalShell><UserDashboard /></PortalShell>} />
        <Route path="/my-learning" element={<PortalShell><UserDashboard /></PortalShell>} />
        <Route path="/courses" element={<PortalShell><Courses /></PortalShell>} />
        <Route path="/courses/:slug" element={<PortalShell><CourseDetail /></PortalShell>} />
        <Route path="/playlists/:id" element={<PortalShell><CourseDetail /></PortalShell>} />
        <Route path="/courses/:slug/excel" element={<PortalShell><CourseExcelViewer /></PortalShell>} />
        <Route path="/certificates/:code" element={<PortalShell><CertificateVerification /></PortalShell>} />
        <Route path="/verify-certificate" element={<PortalShell><CertificateVerification /></PortalShell>} />
        <Route path="/verify-certificate/:code" element={<PortalShell><CertificateVerification /></PortalShell>} />
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="*" element={<PublicWebsite />} />
      </Routes>
    </>
  );
}
