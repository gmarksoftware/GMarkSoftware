import React, { useState, useEffect, useRef } from 'react';
import logoBlack from '../assets/G Mark-black.png';
import { 
  Wrench, 
  Radio, 
  Sprout, 
  Menu, 
  X,
  ArrowLeft,
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  Server,
  Cloud,
  FileText,
  ExternalLink,
  Droplets,
  Gauge,
  Workflow,
  Zap,
  BarChart3,
  Factory,
  Car,
  Warehouse,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Users,
  Settings,
  ClipboardList,
  Package,
  TrendingUp,
  Leaf,
  ShoppingCart,
  Truck,
  Store,
  Globe,
  UserCheck,
  HelpCircle,
  BookOpen,
  Headphones,
  LifeBuoy,
  MessageSquareQuote,
  Video,
  SlidersHorizontal,
  Edit3
} from 'lucide-react';
import { APPLICATIONS } from './ApplicationsGridSection';

const SOLUTION_CATEGORIES = [
  {
    title: 'CORE ERP & FINANCE',
    accentColor: '#0D9488',
    items: [
      { name: 'Enterprise ERP Core', appId: 'erp' },
      { name: 'Double-Entry Accounting', appId: 'erp' },
      { name: 'GST & E-Way Invoicing', appId: 'erp' },
      { name: 'Sales & Purchase Orders', appId: 'erp' },
      { name: 'Multi-Warehouse Inventory', appId: 'erp' },
      { name: 'Branch Ledger & Cashflow', appId: 'erp' }
    ]
  },
  {
    title: '4M OPERATIONS & CMMS',
    accentColor: '#E11D48',
    items: [
      { name: '4M Smart CMMS Suite', appId: 'cmms' },
      { name: 'Machine Health & MTBF/MTTR', appId: 'cmms' },
      { name: 'Preventive Maintenance', appId: 'cmms' },
      { name: 'Digital SOPs & Checklists', appId: 'cmms' },
      { name: 'Spare Parts & Inventory', appId: 'cmms' },
      { name: 'Downtime Reduction Engine', appId: 'cmms' }
    ]
  },
  {
    title: 'INDUSTRIAL IOT & G-NOVA',
    accentColor: '#0284C7',
    items: [
      { name: 'G-Nova IoT Dashboard', appId: 'g-nova-iot' },
      { name: 'Sub-Second 50Hz Telemetry', appId: 'g-nova-iot' },
      { name: 'Terrace Booster Automation', appId: 'g-nova-iot' },
      { name: 'Fire Hydrant Safety G-Nova', appId: 'g-nova-iot' },
      { name: 'STP & Water Automation', appId: 'g-nova-iot' },
      { name: 'AI Vibration Diagnostics', appId: 'g-nova-iot' }
    ]
  },
  {
    title: 'SUPPLY CHAIN & LOGISTICS',
    accentColor: '#7C3AED',
    items: [
      { name: 'Transporter Middle-Mile Fleet', appId: 'transporter-app' },
      { name: 'SHG Rural Delivery Network', appId: 'shg-app' },
      { name: 'QR & Barcode Scan Ingest', appId: 'transporter-app' },
      { name: 'Cluster Batch Routing', appId: 'transporter-app' },
      { name: 'Village Node Ingestion', appId: 'shg-app' },
      { name: 'Doorstep Buyer OTP Handover', appId: 'shg-app' }
    ]
  },
  {
    title: 'FIELD FORCE & TELEMETRY',
    accentColor: '#16A34A',
    items: [
      { name: 'G Track Field Operations', appId: 'g-track' },
      { name: 'Live GPS Telemetry & Trails', appId: 'g-track' },
      { name: 'Geo-Fenced Mobile Attendance', appId: 'g-track' },
      { name: 'Beat & Route Planning', appId: 'g-track' },
      { name: 'On-Field Digital Order Booking', appId: 'g-track' },
      { name: 'Client Visit Verification', appId: 'g-track' }
    ]
  },
  {
    title: 'AGRI-COMMERCE & RURAL',
    accentColor: '#15803D',
    items: [
      { name: 'GramUnnati Marketplace', appId: 'gram-unnati' },
      { name: 'Farmer & FPO Producer App', appId: 'gram-unnati' },
      { name: 'B2B Bulk Buyer Platform', appId: 'gram-unnati' },
      { name: 'Digital Mandi Price Discovery', appId: 'gram-unnati' },
      { name: 'Master Product Catalog', appId: 'gram-unnati' },
      { name: 'T+1 Direct Bank Payouts', appId: 'gram-unnati' }
    ]
  },
  {
    title: 'TASK MANAGEMENT (SYNKRO)',
    accentColor: '#EA580C',
    items: [
      { name: 'SynkroBoard Workspace', appId: 'task-management' },
      { name: 'Interactive Kanban & Sprints', appId: 'task-management' },
      { name: 'RACI Governance Matrix', appId: 'task-management' },
      { name: 'Gantt Timelines & Calendar', appId: 'task-management' },
      { name: 'Absence & Leave Scheduling Sync', appId: 'task-management' },
      { name: 'Role-Based Dashboards', appId: 'task-management' }
    ]
  },
  {
    title: 'PLATFORM & EDGE CLOUD',
    accentColor: '#7B5872',
    items: [
      { name: 'Real-Time WebSocket Bus', appId: 'task-management' },
      { name: 'Multi-Channel Alert Engine', appId: 'g-nova-iot' },
      { name: 'TimescaleDB Timeseries', appId: 'g-nova-iot' },
      { name: 'Digital Document Vault', appId: 'erp' },
      { name: 'Enterprise REST & Webhook APIs', appId: 'erp' },
      { name: 'Edge Microservice Gateways', appId: 'g-nova-iot' }
    ]
  }
];

const TECHNOLOGY_CATEGORIES = [
  {
    title: 'CORE STACK & CLOUD PLATFORM',
    accentColor: '#0B3A70',
    items: [
      { label: 'React 18 & Vite Architecture', desc: 'Fast, modular single-page interface with dynamic UI states', appId: 'erp' },
      { label: 'NestJS Enterprise Backend', desc: 'Scalable TypeScript microservices with event-driven architecture', appId: 'erp' },
      { label: 'PostgreSQL & TimescaleDB', desc: 'Relational ledger storage and high-concurrency timeseries telemetry', appId: 'g-nova-iot' },
      { label: 'Redis Event Streaming & Cache', desc: 'Sub-15ms real-time state pub/sub and distributed job queues', appId: 'task-management' },
      { label: 'Prisma ORM & Multi-Tenancy', desc: 'Type-safe data layer with tenant-level data isolation', appId: 'erp' }
    ]
  },
  {
    title: 'EDGE TELEMETRY & PROTOCOLS',
    accentColor: '#0284C7',
    items: [
      { label: 'MQTT Telemetry Broker (QoS 2)', desc: 'Guaranteed edge sensor pub/sub for booster & fire systems', appId: 'g-nova-iot' },
      { label: 'Modbus RTU / TCP Field Bus', desc: 'Direct industrial RS485 connection to PLCs and digital meters', appId: 'g-nova-iot' },
      { label: 'Real-Time WebSocket Engine', desc: 'Bidirectional live telemetry streams and collaborative Kanban sync', appId: 'task-management' },
      { label: 'AIPCU Hardware Edge Gateways', desc: 'Embedded microcontroller telemetry capture & automated trip relays', appId: 'g-nova-iot' },
      { label: 'GPS Telemetry & Geo-Fencing', desc: 'Sub-second field vehicle trails and mobile radius verification', appId: 'g-track' }
    ]
  },
  {
    title: 'ENTERPRISE LOGIC & GOVERNANCE',
    accentColor: '#16A34A',
    items: [
      { label: 'RACI Governance & Sprint Engine', desc: 'Role-based ownership matrix, Kanban boards & team timeline sync', appId: 'task-management' },
      { label: '4M Asset Governance Framework', desc: 'Integrated Man, Machine, Material & Method maintenance tracking', appId: 'cmms' },
      { label: 'QR Code Scanning & OTP Dispatch', desc: 'Package custody verification and secure doorstep delivery', appId: 'transporter-app' },
      { label: 'Double-Entry GST & Invoicing Engine', desc: 'Automated tax invoicing, E-Way bills and financial ledgers', appId: 'erp' },
      { label: 'RESTful APIs & Webhook Webbus', desc: 'Secure third-party enterprise integrations, SAP & data exports', appId: 'erp' }
    ]
  }
];

export default function Navbar({ currentPage = 'home', onNavigate, onOpenExpertModal, onScrollToSection, onSelectApp }) {
  const [activeMenu, setActiveMenu] = useState(null); // 'solutions' | 'technology' | 'industries' | null
  const [isClosing, setIsClosing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  const handleAppItemClick = (appId, origin = 'solutions') => {
    closeMenu();
    setMobileMenuOpen(false);
    if (onSelectApp) {
      const found = APPLICATIONS.find(a => a.id === appId) || { id: appId };
      onSelectApp({ ...found, navigationOrigin: origin });
    } else {
      window.history.pushState({ page: 'app-detail', appId, navigationOrigin: origin }, '', `/app/${appId}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeMenu();
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMenu = (menuName) => {
    if (activeMenu === menuName) {
      closeMenu();
    } else {
      setIsClosing(false);
      setActiveMenu(menuName);
    }
  };

  const closeMenu = () => {
    if (activeMenu) {
      setIsClosing(true);
      setTimeout(() => {
        setActiveMenu(null);
        setIsClosing(false);
      }, 320);
    }
  };

  const handleBackToMobileMenu = () => {
    setActiveMenu(null);
    setIsClosing(false);
    setMobileMenuOpen(true);
  };

  const handlePageNav = (page) => {
    closeMenu();
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSolutionNav = (sectionId) => {
    closeMenu();
    setMobileMenuOpen(false);
    if (currentPage !== 'home' && onNavigate) {
      onNavigate('home');
      setTimeout(() => {
        if (onScrollToSection) onScrollToSection(sectionId || 'solutions');
      }, 150);
    } else if (onScrollToSection) {
      onScrollToSection(sectionId || 'solutions');
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* ODOO-STYLE GREY BACKDROP OVERLAY (Gentle & Slow Cinematic Fade) */}
      {/* ========================================================================= */}
      <div 
        onClick={closeMenu}
        className={`backdrop-overlay ${(activeMenu && !isClosing) ? 'backdrop-visible' : ''}`}
        aria-hidden="true"
      />

      <header 
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: activeMenu ? '1px solid #E2E8F0' : '1px solid #E2E8F0',
          boxShadow: activeMenu ? '0 16px 36px -4px rgba(15, 23, 42, 0.12)' : (scrolled ? '0 2px 8px rgba(15, 23, 42, 0.04)' : 'none'),
          zIndex: 60
        }}
      >
        <div style={{ backgroundColor: '#FFFFFF', position: 'relative', zIndex: 61 }}>
          <div style={{ width: '100%', padding: '0 1.75rem', margin: 0 }} className="nav-header-full">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', position: 'relative', width: '100%' }}>
              
              {/* Left Side Brand Logo */}
              <div 
                onClick={() => handlePageNav('home')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  zIndex: 10,
                  userSelect: 'none',
                  padding: '4px 0'
                }}
                className="nav-logo-wrap"
                title="G Mark"
              >
                <img 
                  src={logoBlack} 
                  alt="G Mark" 
                  style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
                />
              </div>

              {/* Clean Navigation Bar Links */}
              <nav 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '2.5rem',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
                className="desktop-nav"
              >
                {/* HOME BUTTON */}
                <div>
                  <button 
                    onClick={() => handlePageNav('home')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.95rem',
                      fontWeight: (currentPage === 'home' && !activeMenu) ? '700' : '600',
                      color: (currentPage === 'home' && !activeMenu) ? '#0B3A70' : '#1E293B',
                      cursor: 'pointer',
                      padding: '0.65rem 0.85rem',
                      fontFamily: 'inherit',
                      borderRadius: '8px',
                      backgroundColor: (currentPage === 'home' && !activeMenu) ? '#F1F5F9' : 'transparent',
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    Home
                  </button>
                </div>

                {/* SOLUTIONS BUTTON */}
                <div>
                  <button 
                    onClick={() => toggleMenu('solutions')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.95rem',
                      fontWeight: activeMenu === 'solutions' ? '700' : '600',
                      color: activeMenu === 'solutions' ? '#0B3A70' : '#1E293B',
                      cursor: 'pointer',
                      padding: '0.65rem 0.85rem',
                      fontFamily: 'inherit',
                      borderRadius: '8px',
                      backgroundColor: activeMenu === 'solutions' ? '#F1F5F9' : 'transparent',
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    Solutions
                  </button>
                </div>

                {/* TECHNOLOGY BUTTON */}
                <div>
                  <button 
                    onClick={() => toggleMenu('technology')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.95rem',
                      fontWeight: activeMenu === 'technology' ? '700' : '600',
                      color: activeMenu === 'technology' ? '#0B3A70' : '#1E293B',
                      cursor: 'pointer',
                      padding: '0.65rem 0.85rem',
                      fontFamily: 'inherit',
                      borderRadius: '8px',
                      backgroundColor: activeMenu === 'technology' ? '#F1F5F9' : 'transparent',
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    Technology
                  </button>
                </div>

                {/* INDUSTRIES BUTTON */}
                <div>
                  <button 
                    onClick={() => toggleMenu('industries')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.95rem',
                      fontWeight: activeMenu === 'industries' ? '700' : '600',
                      color: activeMenu === 'industries' ? '#0B3A70' : '#1E293B',
                      cursor: 'pointer',
                      padding: '0.65rem 0.85rem',
                      fontFamily: 'inherit',
                      borderRadius: '8px',
                      backgroundColor: activeMenu === 'industries' ? '#F1F5F9' : 'transparent',
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    Industries
                  </button>
                </div>

                {/* ABOUT BUTTON (Full Page View) */}
                <div>
                  <button 
                    onClick={() => handlePageNav('about')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.95rem',
                      fontWeight: currentPage === 'about' ? '700' : '600',
                      color: currentPage === 'about' ? '#0B3A70' : '#1E293B',
                      cursor: 'pointer',
                      padding: '0.65rem 0.85rem',
                      fontFamily: 'inherit',
                      borderRadius: '8px',
                      backgroundColor: currentPage === 'about' ? '#F1F5F9' : 'transparent',
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    About
                  </button>
                </div>

                {/* HELP BUTTON (Full Page View) */}
                <div>
                  <button 
                    onClick={() => handlePageNav('help')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.95rem',
                      fontWeight: currentPage === 'help' ? '700' : '600',
                      color: currentPage === 'help' ? '#0B3A70' : '#1E293B',
                      cursor: 'pointer',
                      padding: '0.65rem 0.85rem',
                      fontFamily: 'inherit',
                      borderRadius: '8px',
                      backgroundColor: currentPage === 'help' ? '#F1F5F9' : 'transparent',
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    Help
                  </button>
                </div>

              </nav>

              {/* Right Spacer for Desktop Layout Symmetry */}
              <div style={{ width: '120px' }} className="desktop-right-spacer" />

              {/* Mobile hamburger toggle */}
              <div style={{ position: 'absolute', right: 0 }} className="mobile-nav-toggle-wrap">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  style={{
                    background: 'none',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '6px',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  className="mobile-nav-toggle"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MEGA-MENU EXPANSION CONTAINER (Extra Slow & Smooth Curtain Transition) */}
        {/* ========================================================================= */}
        <div 
          className={`mega-menu-wrapper ${activeMenu && !isClosing ? 'mega-menu-expanded' : 'mega-menu-collapsed'}`}
          style={{
            backgroundColor: '#FFFFFF',
            position: 'relative',
            zIndex: 62,
            overflow: 'hidden'
          }}
        >
          <div className="mega-menu-inner">

            {/* 1. SOLUTIONS MEGA-MENU (ODOO STYLE MINIMALIST 8-CATEGORY DIRECTORY FOR MARKG APPS) */}
            {activeMenu === 'solutions' && (
              <div className="mega-menu-content-fade solutions-mega-menu-wrapper" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                {/* Mobile Navigation Header Bar */}
                <div className="mega-menu-mobile-nav-bar lg:hidden">
                  <button 
                    type="button"
                    onClick={handleBackToMobileMenu}
                    className="mega-menu-nav-back-btn"
                    aria-label="Back to main navigation menu"
                  >
                    <ArrowLeft size={16} className="shrink-0 text-slate-600" />
                    <span>Back to Menu</span>
                  </button>
                  <div className="mega-menu-nav-right">
                    <span className="mega-menu-nav-badge">Solutions</span>
                    <button
                      type="button"
                      onClick={closeMenu}
                      className="mega-menu-nav-close-btn"
                      aria-label="Close Solutions Menu"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="solutions-mega-menu-inner" style={{ maxWidth: '1240px', margin: '0 auto', backgroundColor: '#FFFFFF' }}>
                  
                  {/* 8-Category Clean Responsive Grid (4 columns on desktop, 2 on tablet, 1 on mobile) */}
                  <div className="solutions-odoo-grid">
                    {SOLUTION_CATEGORIES.map((cat, catIdx) => (
                      <div key={catIdx} className="solution-category-col">
                        <div 
                          className="solution-category-heading"
                          style={{ 
                            borderBottom: `2px solid ${cat.accentColor}`, 
                            paddingBottom: '0.45rem', 
                            marginBottom: '0.75rem'
                          }}
                        >
                          <span 
                            style={{ 
                              fontSize: '0.82rem', 
                              fontWeight: '700', 
                              color: cat.accentColor, 
                              letterSpacing: '0.08em', 
                              textTransform: 'uppercase',
                              display: 'block',
                              lineHeight: 1.3
                            }}
                          >
                            {cat.title}
                          </span>
                        </div>
                        <div className="solution-category-items">
                          {cat.items.map((item, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => handleAppItemClick(item.appId, 'solutions')}
                              className="solution-item-row"
                            >
                              <span className="solution-item-text">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Utility Row (Exact Odoo Style for MarkG) */}
                  <div className="solutions-bottom-utility stagger-bottom">
                    <div 
                      onClick={() => { closeMenu(); handleSolutionNav('solutions'); }}
                      className="solutions-utility-link hover:text-slate-900 transition-colors"
                    >
                      <Package size={16} className="solutions-utility-icon" />
                      <span className="solutions-utility-text">Connected Ecosystem Apps</span>
                    </div>
                    <div 
                      onClick={() => { closeMenu(); onOpenExpertModal?.(); }}
                      className="solutions-utility-link hover:text-slate-900 transition-colors"
                    >
                      <Edit3 size={16} className="solutions-utility-icon" />
                      <span className="solutions-utility-text">G Mark Studio & Custom ERP</span>
                    </div>
                    <div 
                      onClick={() => { closeMenu(); handleSolutionNav('solutions'); }}
                      className="solutions-utility-link hover:text-slate-900 transition-colors"
                    >
                      <Cloud size={16} className="solutions-utility-icon" />
                      <span className="solutions-utility-text">G Mark Edge & Cloud Platform</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 2. TECHNOLOGY MEGA-MENU (AUTHENTIC MARKG ENTERPRISE TECH STACK) */}
            {activeMenu === 'technology' && (
              <div className="mega-menu-content-fade technology-mega-menu-wrapper" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                {/* Mobile Navigation Header Bar */}
                <div className="mega-menu-mobile-nav-bar lg:hidden">
                  <button 
                    type="button"
                    onClick={handleBackToMobileMenu}
                    className="mega-menu-nav-back-btn"
                    aria-label="Back to main navigation menu"
                  >
                    <ArrowLeft size={16} className="shrink-0 text-slate-600" />
                    <span>Back to Menu</span>
                  </button>
                  <div className="mega-menu-nav-right">
                    <span className="mega-menu-nav-badge">Technology</span>
                    <button
                      type="button"
                      onClick={closeMenu}
                      className="mega-menu-nav-close-btn"
                      aria-label="Close Technology Menu"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="technology-mega-menu-inner" style={{ maxWidth: '1240px', margin: '0 auto', backgroundColor: '#FFFFFF' }}>
                  <div className="technology-odoo-grid">
                    {TECHNOLOGY_CATEGORIES.map((cat, catIdx) => (
                      <div key={catIdx} className="technology-category-col">
                        <div 
                          className="technology-category-heading"
                          style={{ 
                            borderBottom: `2px solid ${cat.accentColor}`, 
                            paddingBottom: '0.45rem', 
                            marginBottom: '1.25rem' 
                          }}
                        >
                          <span 
                            style={{ 
                              fontSize: '0.82rem', 
                              fontWeight: '700', 
                              color: cat.accentColor, 
                              letterSpacing: '0.08em', 
                              textTransform: 'uppercase',
                              display: 'block',
                              lineHeight: 1.3
                            }}
                          >
                            {cat.title}
                          </span>
                        </div>
                        <div className="technology-category-items">
                          {cat.items.map((item, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => handleAppItemClick(item.appId, 'technology')}
                              className="technology-item-row group transition-all"
                            >
                              <div className="technology-item-label group-hover:text-blue-700">
                                {item.label}
                              </div>
                              <div className="technology-item-desc">
                                {item.desc}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Utility Row (Odoo Style) */}
                  <div className="technology-bottom-utility stagger-bottom">
                    <div 
                      onClick={() => { closeMenu(); handleSolutionNav('solutions'); }}
                      className="technology-utility-link hover:text-slate-900 transition-colors"
                    >
                      <Zap size={16} className="technology-utility-icon" />
                      <span className="technology-utility-text">Sub-Second 50Hz MQTT Streams</span>
                    </div>
                    <div 
                      onClick={() => { closeMenu(); onOpenExpertModal?.(); }}
                      className="technology-utility-link hover:text-slate-900 transition-colors"
                    >
                      <ShieldCheck size={16} className="technology-utility-icon" />
                      <span className="technology-utility-text">Enterprise Multi-Tenant Security</span>
                    </div>
                    <div 
                      onClick={() => { closeMenu(); handleSolutionNav('solutions'); }}
                      className="technology-utility-link hover:text-slate-900 transition-colors"
                    >
                      <Cloud size={16} className="technology-utility-icon" />
                      <span className="technology-utility-text">Open REST & Webhook APIs</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 3. INDUSTRIES MEGA-MENU (AUTHENTIC MARKG ENTERPRISE VERTICALS) */}
            {activeMenu === 'industries' && (
              <div className="mega-menu-content-fade" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                {/* Mobile Navigation Header Bar */}
                <div className="mega-menu-mobile-nav-bar lg:hidden">
                  <button 
                    type="button"
                    onClick={handleBackToMobileMenu}
                    className="mega-menu-nav-back-btn"
                    aria-label="Back to main navigation menu"
                  >
                    <ArrowLeft size={16} className="shrink-0 text-slate-600" />
                    <span>Back to Menu</span>
                  </button>
                  <div className="mega-menu-nav-right">
                    <span className="mega-menu-nav-badge">Industries</span>
                    <button
                      type="button"
                      onClick={closeMenu}
                      className="mega-menu-nav-close-btn"
                      aria-label="Close Industries Menu"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2.5rem 2rem 2.25rem', backgroundColor: '#FFFFFF' }}>
                  <div 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      columnGap: '3.5rem',
                      rowGap: '2rem',
                      alignItems: 'start'
                    }}
                    className="industries-odoo-grid"
                  >
                    {/* COLUMN 1: FACILITIES & INFRASTRUCTURE */}
                    <div>
                      <div style={{ 
                        borderBottom: '1.5px solid #0B3A70', 
                        paddingBottom: '0.45rem', 
                        marginBottom: '1.25rem' 
                      }}>
                        <span style={{ 
                          fontSize: '0.82rem', 
                          fontWeight: '700', 
                          color: '#0B3A70', 
                          letterSpacing: '0.08em', 
                          textTransform: 'uppercase' 
                        }}>
                          FACILITIES & INFRASTRUCTURE
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                        {[
                          { label: 'Residential Societies & Townships', desc: 'Centralized domestic booster water pumps, STP & sump automation', appId: 'g-nova-iot' },
                          { label: 'Commercial Complexes & IT Parks', desc: '24/7 Energy monitoring, HVAC baseline & multi-facility dashboards', appId: 'g-nova-iot' },
                          { label: 'Life Safety & Fire Protection', desc: 'Real-time hydrant pressure, jockey pump monitoring & zero-fault alarms', appId: 'g-nova-iot' },
                          { label: 'Water & Sewage Treatment (STP)', desc: 'Level transmitter telemetry, automated pump cycling & effluent logs', appId: 'g-nova-iot' }
                        ].map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleAppItemClick(item.appId, 'industries')}
                            style={{ cursor: 'pointer' }}
                            className="group transition-all"
                          >
                            <div style={{ fontSize: '0.92rem', fontWeight: '600', color: '#0F172A', transition: 'color 0.15s ease' }} className="group-hover:text-blue-700">
                              {item.label}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', fontWeight: '400' }}>
                              {item.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* COLUMN 2: RURAL COMMERCE & AGRI-SUPPLY */}
                    <div>
                      <div style={{ 
                        borderBottom: '1.5px solid #16A34A', 
                        paddingBottom: '0.45rem', 
                        marginBottom: '1.25rem' 
                      }}>
                        <span style={{ 
                          fontSize: '0.82rem', 
                          fontWeight: '700', 
                          color: '#16A34A', 
                          letterSpacing: '0.08em', 
                          textTransform: 'uppercase' 
                        }}>
                          RURAL COMMERCE & AGRI-SUPPLY
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                        {[
                          { label: 'Farmers & Producer Groups (FPOs)', desc: 'Direct digital mandi price discovery, product combos & bulk trade', appId: 'gram-unnati' },
                          { label: 'Self-Help Groups (SHG Networks)', desc: 'Rural women micro-entrepreneur order aggregation & doorstep delivery', appId: 'shg-app' },
                          { label: 'Agri-Inputs & Rural Distribution', desc: 'Verified vendor KYC, batch purchasing and T+1 direct bank payouts', appId: 'gram-unnati' },
                          { label: 'Cold Chain & Perishables Storage', desc: 'Live temperature & humidity logging during rural transit', appId: 'g-track' }
                        ].map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleAppItemClick(item.appId, 'industries')}
                            style={{ cursor: 'pointer' }}
                            className="group transition-all"
                          >
                            <div style={{ fontSize: '0.92rem', fontWeight: '600', color: '#0F172A', transition: 'color 0.15s ease' }} className="group-hover:text-blue-700">
                              {item.label}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', fontWeight: '400' }}>
                              {item.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* COLUMN 3: MANUFACTURING & FLEET OPERATIONS */}
                    <div>
                      <div style={{ 
                        borderBottom: '1.5px solid #0284C7', 
                        paddingBottom: '0.45rem', 
                        marginBottom: '1.25rem' 
                      }}>
                        <span style={{ 
                          fontSize: '0.82rem', 
                          fontWeight: '700', 
                          color: '#0284C7', 
                          letterSpacing: '0.08em', 
                          textTransform: 'uppercase' 
                        }}>
                          MANUFACTURING & FLEET OPERATIONS
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                        {[
                          { label: 'Industrial Manufacturing Plants', desc: '4M CMMS preventive maintenance, MTTR tracking & downtime reduction', appId: 'cmms' },
                          { label: 'Middle-Mile Transporter Fleets', desc: 'Cluster batch routing, vehicle capacity fill & barcode manifests', appId: 'transporter-app' },
                          { label: 'Field Force & Sales Operations', desc: 'Geo-fenced attendance, beat planning & on-field digital order booking', appId: 'g-track' },
                          { label: 'Multi-Branch Corporate Enterprises', desc: 'Consolidated ERP accounting, branch ledgers & task boards', appId: 'erp' }
                        ].map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleAppItemClick(item.appId, 'industries')}
                            style={{ cursor: 'pointer' }}
                            className="group transition-all"
                          >
                            <div style={{ fontSize: '0.92rem', fontWeight: '600', color: '#0F172A', transition: 'color 0.15s ease' }} className="group-hover:text-blue-700">
                              {item.label}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', fontWeight: '400' }}>
                              {item.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Utility Row (Odoo Style) */}
                  <div 
                    style={{
                      marginTop: '2.5rem',
                      paddingTop: '1.25rem',
                      borderTop: '1px solid #EDF2F7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3.5rem',
                      flexWrap: 'wrap',
                      fontSize: '0.88rem',
                      color: '#475569'
                    }}
                    className="stagger-bottom"
                  >
                    <div 
                      onClick={() => { closeMenu(); handleSolutionNav('solutions'); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }} 
                      className="hover:text-slate-900 transition-colors"
                    >
                      <Building2 size={16} style={{ color: '#475569' }} />
                      <span style={{ fontWeight: '500' }}>50+ Smart Facility Deployments</span>
                    </div>
                    <div 
                      onClick={() => { closeMenu(); handleAppItemClick('gram-unnati'); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }} 
                      className="hover:text-slate-900 transition-colors"
                    >
                      <Sprout size={16} style={{ color: '#475569' }} />
                      <span style={{ fontWeight: '500' }}>100k+ Farmers & Rural SHGs</span>
                    </div>
                    <div 
                      onClick={() => { closeMenu(); handleAppItemClick('g-track'); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }} 
                      className="hover:text-slate-900 transition-colors"
                    >
                      <Truck size={16} style={{ color: '#475569' }} />
                      <span style={{ fontWeight: '500' }}>10M+ Logistics & Fleet Pings</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '1.5rem',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            textAlign: 'center',
            position: 'relative',
            zIndex: 62
          }}>
            <button 
              onClick={() => handlePageNav('home')}
              style={{ background: 'none', border: 'none', padding: '8px 0', fontWeight: (currentPage === 'home' && !activeMenu) ? '800' : '600', fontSize: '1.05rem', color: (currentPage === 'home' && !activeMenu) ? '#0B3A70' : '#0F172A', cursor: 'pointer' }}
            >
              Home
            </button>
            <button 
              onClick={() => { toggleMenu('solutions'); setMobileMenuOpen(false); }}
              style={{ background: 'none', border: 'none', padding: '8px 0', fontWeight: '700', fontSize: '1.05rem', color: '#0F172A', cursor: 'pointer' }}
            >
              Solutions
            </button>
            <button 
              onClick={() => { toggleMenu('technology'); setMobileMenuOpen(false); }}
              style={{ background: 'none', border: 'none', padding: '8px 0', fontWeight: '700', fontSize: '1.05rem', color: '#0F172A', cursor: 'pointer' }}
            >
              Technology
            </button>
            <button 
              onClick={() => { toggleMenu('industries'); setMobileMenuOpen(false); }}
              style={{ background: 'none', border: 'none', padding: '8px 0', fontWeight: '700', fontSize: '1.05rem', color: '#0F172A', cursor: 'pointer' }}
            >
              Industries
            </button>
            <button 
              onClick={() => handlePageNav('about')}
              style={{ background: 'none', border: 'none', padding: '8px 0', fontWeight: currentPage === 'about' ? '800' : '600', fontSize: '1.05rem', color: currentPage === 'about' ? '#0B3A70' : '#0F172A', cursor: 'pointer' }}
            >
              About
            </button>
            <button 
              onClick={() => handlePageNav('help')}
              style={{ background: 'none', border: 'none', padding: '8px 0', fontWeight: currentPage === 'help' ? '800' : '600', fontSize: '1.05rem', color: currentPage === 'help' ? '#0B3A70' : '#0F172A', cursor: 'pointer' }}
            >
              Help
            </button>
          </div>
        )}
      </header>

      <style>{`
        /* Smooth Slow Luxury Curtain Expansion */
        .mega-menu-wrapper {
          display: grid;
          transition: 
            grid-template-rows 0.58s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.58s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .mega-menu-expanded {
          grid-template-rows: 1fr;
          opacity: 1;
          transform: translateY(0);
        }

        .mega-menu-collapsed {
          grid-template-rows: 0fr;
          opacity: 0;
          transform: translateY(-8px);
        }

        .mega-menu-inner {
          min-height: 0;
        }

        .mega-menu-content-fade {
          animation: contentGentleFade 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes contentGentleFade {
          0% {
            opacity: 0;
            transform: translateY(-12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Staggered Column Cascade for Luxury Slow Reveal */
        .stagger-col-1 { animation: colGentleFade 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.08s backwards; }
        .stagger-col-2 { animation: colGentleFade 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.14s backwards; }
        .stagger-col-3 { animation: colGentleFade 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.20s backwards; }
        .stagger-bottom { animation: colGentleFade 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.26s backwards; }

        @keyframes colGentleFade {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Odoo-style Grey Backdrop (Behind Header and Mega Menu) */
        .backdrop-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(2.5px);
          -webkit-backdrop-filter: blur(2.5px);
          z-index: 40;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .backdrop-visible {
          opacity: 1;
          pointer-events: auto;
        }

        /* Mega menu links hover effect */
        .mega-menu-link:hover div:first-child {
          color: #0B3A70 !important;
          transform: translateX(4px);
        }
        .mega-menu-link div:first-child {
          transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* Mobile Mega-Menu Top Navigation Control Bar */
        .mega-menu-mobile-nav-bar {
          display: none;
        }

        @media (max-width: 1023px) {
          .mega-menu-mobile-nav-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 30;
            background-color: #FFFFFF;
            border-bottom: 1px solid #E2E8F0;
            padding: 0.65rem 1rem;
            min-height: 52px;
            box-sizing: border-box;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
          }
          .mega-menu-nav-back-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 0 14px;
            height: 38px;
            border-radius: 8px;
            border: 1px solid #CBD5E1;
            background-color: #FFFFFF;
            color: #1E293B;
            font-size: 0.85rem;
            font-weight: 500;
            white-space: nowrap !important;
            flex-shrink: 0;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
            transition: all 0.15s ease;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
          }
          .mega-menu-nav-back-btn:hover {
            background-color: #F8FAFC;
            border-color: #94A3B8;
            color: #0F172A;
          }
          .mega-menu-nav-back-btn:active {
            background-color: #F1F5F9;
            transform: scale(0.98);
          }
          .mega-menu-nav-right {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }
          .mega-menu-nav-badge {
            font-size: 0.72rem;
            font-weight: 600;
            color: #0B3A70;
            background-color: #F0F6FF;
            border: 1px solid #DBEAFE;
            padding: 3px 10px;
            border-radius: 9999px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            white-space: nowrap;
          }
          .mega-menu-nav-close-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
            background-color: #FFFFFF;
            color: #64748B;
            cursor: pointer;
            transition: all 0.15s ease;
            -webkit-tap-highlight-color: transparent;
          }
          .mega-menu-nav-close-btn:hover {
            background-color: #F8FAFC;
            color: #0F172A;
            border-color: #CBD5E1;
          }
          .mega-menu-nav-close-btn:active {
            background-color: #F1F5F9;
            transform: scale(0.96);
          }
        }

        /* ========================================================= */
        /* SOLUTIONS MEGA-MENU RESPONSIVE STYLING */
        /* ========================================================= */
        .solutions-mega-menu-wrapper {
          width: 100%;
          background-color: #FFFFFF;
        }

        .solutions-mega-menu-inner {
          width: 100%;
          box-sizing: border-box;
        }

        .solutions-odoo-grid {
          display: grid;
          align-items: start;
          width: 100%;
        }

        .solution-category-col {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .solution-category-heading {
          width: 100%;
          box-sizing: border-box;
        }

        .solution-category-items {
          display: flex;
          flex-direction: column;
        }

        .solution-item-row {
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .solution-item-text {
          display: block;
          white-space: normal;
          word-break: normal;
          overflow-wrap: break-word;
        }

        .solutions-bottom-utility {
          box-sizing: border-box;
          width: 100%;
        }

        .solutions-utility-link {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
          transition: all 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .solutions-utility-icon {
          color: #475569;
          flex-shrink: 0;
        }

        .solutions-utility-text {
          font-weight: 500;
        }

        /* ========================================================= */
        /* TECHNOLOGY MEGA-MENU RESPONSIVE STYLING */
        /* ========================================================= */
        .technology-mega-menu-wrapper {
          width: 100%;
          background-color: #FFFFFF;
        }

        .technology-mega-menu-inner {
          width: 100%;
          box-sizing: border-box;
        }

        .technology-odoo-grid {
          display: grid;
          align-items: start;
          width: 100%;
        }

        .technology-category-col {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .technology-category-heading {
          width: 100%;
          box-sizing: border-box;
        }

        .technology-category-items {
          display: flex;
          flex-direction: column;
        }

        .technology-item-row {
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .technology-item-label {
          font-size: 0.92rem;
          font-weight: 600;
          color: #0F172A;
          transition: color 0.15s ease;
          line-height: 1.35;
          white-space: normal;
          word-break: normal;
          overflow-wrap: break-word;
        }

        .technology-item-desc {
          font-size: 0.78rem;
          color: #64748B;
          margin-top: 2px;
          font-weight: 400;
          line-height: 1.4;
          white-space: normal;
          word-break: normal;
          overflow-wrap: break-word;
        }

        .technology-bottom-utility {
          box-sizing: border-box;
          width: 100%;
        }

        .technology-utility-link {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
          transition: all 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .technology-utility-icon {
          color: #475569;
          flex-shrink: 0;
        }

        .technology-utility-text {
          font-weight: 500;
        }

        /* Desktop: 4 columns across for Solutions, 3 columns for Technology */
        @media (min-width: 1024px) {
          .solutions-mega-menu-inner {
            padding: 2.5rem 2rem 2rem;
          }
          .solutions-odoo-grid {
            grid-template-columns: repeat(4, 1fr);
            column-gap: 2.75rem;
            row-gap: 2.25rem;
          }
          .solution-category-items {
            gap: 0.5rem;
          }
          .solution-item-row {
            font-size: 0.88rem;
            color: #475569;
            font-weight: 400;
            padding: 0.2rem 0;
            line-height: 1.45;
          }
          .solution-item-row:hover {
            color: #0F172A;
            transform: translateX(2px);
          }
          .solutions-bottom-utility {
            margin-top: 2.5rem;
            padding-top: 1.25rem;
            border-top: 1px solid #EDF2F7;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3.5rem;
            flex-wrap: wrap;
            font-size: 0.88rem;
            color: #475569;
          }
          .solutions-utility-link {
            gap: 0.45rem;
          }

          /* Technology Desktop */
          .technology-mega-menu-inner {
            padding: 2.5rem 2rem 2.25rem;
          }
          .technology-odoo-grid {
            grid-template-columns: repeat(3, 1fr);
            column-gap: 3.5rem;
            row-gap: 2rem;
          }
          .technology-category-items {
            gap: 1.15rem;
          }
          .technology-item-row:hover .technology-item-label {
            color: #1D4ED8;
          }
          .technology-bottom-utility {
            margin-top: 2.5rem;
            padding-top: 1.25rem;
            border-top: 1px solid #EDF2F7;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3.5rem;
            flex-wrap: wrap;
            font-size: 0.88rem;
            color: #475569;
          }
          .technology-utility-link {
            gap: 0.45rem;
          }
        }

        /* Tablet: 2 columns */
        @media (min-width: 640px) and (max-width: 1023px) {
          .solutions-mega-menu-wrapper,
          .technology-mega-menu-wrapper {
            max-height: calc(100vh - 64px);
            max-height: calc(100dvh - 64px);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          .solutions-mega-menu-inner,
          .technology-mega-menu-inner {
            padding: 2rem 1.5rem;
          }
          .solutions-odoo-grid,
          .technology-odoo-grid {
            grid-template-columns: repeat(2, 1fr);
            column-gap: 2.25rem;
            row-gap: 2rem;
          }
          .solution-category-items {
            gap: 0.55rem;
          }
          .technology-category-items {
            gap: 1rem;
          }
          .solution-item-row,
          .technology-item-row {
            padding: 0.35rem 0.5rem;
            border-radius: 6px;
            margin: 0 -0.5rem;
          }
          .solution-item-row {
            font-size: 0.88rem;
            color: #334155;
            font-weight: 450;
            line-height: 1.4;
          }
          .solution-item-row:hover,
          .technology-item-row:hover {
            background-color: #F8FAFC;
          }
          .solution-item-row:hover {
            color: #0F172A;
          }
          .technology-item-row:hover .technology-item-label {
            color: #1D4ED8;
          }
          .solutions-bottom-utility,
          .technology-bottom-utility {
            margin-top: 2rem;
            padding-top: 1.25rem;
            border-top: 1px solid #EDF2F7;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
            font-size: 0.88rem;
            color: #475569;
          }
          .solutions-utility-link,
          .technology-utility-link {
            gap: 0.45rem;
          }
        }

        /* Mobile (< 640px): 1 readable vertical column */
        @media (max-width: 639px) {
          .solutions-mega-menu-wrapper,
          .technology-mega-menu-wrapper {
            max-height: calc(100vh - 64px);
            max-height: calc(100dvh - 64px);
            overflow-y: auto;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
          }
          .solutions-mega-menu-wrapper::-webkit-scrollbar,
          .technology-mega-menu-wrapper::-webkit-scrollbar {
            width: 4px;
          }
          .solutions-mega-menu-wrapper::-webkit-scrollbar-track,
          .technology-mega-menu-wrapper::-webkit-scrollbar-track {
            background: transparent;
          }
          .solutions-mega-menu-wrapper::-webkit-scrollbar-thumb,
          .technology-mega-menu-wrapper::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 4px;
          }

          .solutions-mega-menu-inner,
          .technology-mega-menu-inner {
            padding: 1.25rem 1.125rem 2.25rem;
          }
          .solutions-odoo-grid,
          .technology-odoo-grid {
            grid-template-columns: 1fr;
            row-gap: 1.75rem;
          }
          .solution-category-col,
          .technology-category-col {
            padding: 0.25rem 0;
          }
          .solution-category-heading,
          .technology-category-heading {
            padding-bottom: 0.45rem;
            margin-bottom: 0.85rem;
          }
          .solution-category-heading span,
          .technology-category-heading span {
            font-size: 0.8rem;
            letter-spacing: 0.07em;
          }
          .solution-category-items {
            gap: 0.25rem;
          }
          .technology-category-items {
            gap: 0.75rem;
          }
          .solution-item-row {
            font-size: 0.88rem;
            color: #334155;
            font-weight: 450;
            padding: 0.5rem 0.65rem;
            margin: 0 -0.65rem;
            border-radius: 8px;
            line-height: 1.4;
          }
          .technology-item-row {
            padding: 0.55rem 0.65rem;
            margin: 0 -0.65rem;
            border-radius: 8px;
            transition: background-color 0.15s ease;
          }
          .solution-item-row:active,
          .solution-item-row:hover,
          .technology-item-row:active,
          .technology-item-row:hover {
            background-color: #F8FAFC;
          }
          .solution-item-row:active,
          .solution-item-row:hover {
            color: #0F172A;
          }
          .technology-item-row:active .technology-item-label,
          .technology-item-row:hover .technology-item-label {
            color: #1D4ED8;
          }
          .solutions-bottom-utility,
          .technology-bottom-utility {
            margin-top: 1.75rem;
            padding-top: 1.25rem;
            border-top: 1px solid #EDF2F7;
            display: flex;
            flex-direction: column;
            gap: 0.625rem;
            align-items: stretch;
          }
          .solutions-utility-link,
          .technology-utility-link {
            gap: 0.625rem;
            padding: 0.65rem 0.85rem;
            border-radius: 8px;
            background-color: #F8FAFC;
            border: 1px solid #F1F5F9;
            color: #334155;
            font-size: 0.86rem;
          }
          .solutions-utility-link:active,
          .solutions-utility-link:hover,
          .technology-utility-link:active,
          .technology-utility-link:hover {
            background-color: #F1F5F9;
            color: #0F172A;
          }
          .solutions-utility-icon,
          .technology-utility-icon {
            color: #2563EB;
          }
        }

        @media (max-width: 900px) {
          .mega-menu-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 1.5rem !important;
          }
        }
        @media (max-width: 600px) {
          .mega-menu-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-nav-toggle-wrap {
            display: none !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1080px) {
          .desktop-nav {
            gap: 1.5rem !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-right-spacer {
            display: none !important;
          }
          .mobile-nav-toggle-wrap {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
