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
  Edit3,
  ChevronDown,
  ChevronUp,
  ChevronRight
} from 'lucide-react';
import { APPLICATIONS, findAppOrModule } from './ApplicationsGridSection';
import { getModuleById } from '../data/modulesRegistry';

const SOLUTION_CATEGORIES = [
  {
    title: 'CORE ERP & FINANCE',
    items: [
      { name: 'Enterprise ERP Core', appId: 'erp-core' },
      { name: 'Double-Entry Accounting', appId: 'double-entry-accounting' },
      { name: 'GST & E-Way Invoicing', appId: 'gst-eway-invoicing' },
      { name: 'Sales & Purchase Orders', appId: 'sales-purchase-orders' },
      { name: 'Multi-Warehouse Inventory', appId: 'multi-warehouse-inventory' },
      { name: 'Branch Ledger & Cashflow', appId: 'branch-ledger-cashflow' }
    ]
  },
  {
    title: '4M OPERATIONS & CMMS',
    items: [
      { name: '4M Smart CMMS Suite', appId: 'cmms-suite' },
      { name: 'Machine Health & MTBF/MTTR', appId: 'machine-health-mtbf' },
      { name: 'Preventive Maintenance', appId: 'preventive-maintenance' },
      { name: 'Digital SOPs & Checklists', appId: 'digital-sops-checklists' },
      { name: 'Spare Parts & Inventory', appId: 'spare-parts-inventory' },
      { name: 'Downtime Reduction Engine', appId: 'downtime-reduction-engine' }
    ]
  },
  {
    title: 'INDUSTRIAL IOT & G-NOVA',
    items: [
      { name: 'G-Nova IoT Dashboard', appId: 'g-nova-iot-dashboard' },
      { name: 'Sub-Second 50Hz Telemetry', appId: 'sub-second-telemetry' },
      { name: 'Terrace Booster Automation', appId: 'terrace-booster-automation' },
      { name: 'Fire Hydrant Safety G-Nova', appId: 'fire-hydrant-safety' },
      { name: 'STP & Water Automation', appId: 'stp-water-automation' },
      { name: 'AI Vibration Diagnostics', appId: 'ai-vibration-diagnostics' }
    ]
  },
  {
    title: 'SUPPLY CHAIN & LOGISTICS',
    items: [
      { name: 'Transporter Middle-Mile Fleet', appId: 'transporter-middle-mile' },
      { name: 'SHG Rural Delivery Network', appId: 'shg-rural-delivery' },
      { name: 'QR & Barcode Scan Ingest', appId: 'qr-barcode-scan-ingest' },
      { name: 'Cluster Batch Routing', appId: 'cluster-batch-routing' },
      { name: 'Village Node Ingestion', appId: 'village-node-ingestion' },
      { name: 'Doorstep Buyer OTP Handover', appId: 'doorstep-buyer-otp-handover' }
    ]
  },
  {
    title: 'FIELD FORCE & TELEMETRY',
    items: [
      { name: 'G Track Field Operations', appId: 'g-track-field-operations' },
      { name: 'Live GPS Telemetry & Trails', appId: 'live-gps-telemetry-trails' },
      { name: 'Geo-Fenced Mobile Attendance', appId: 'geofenced-mobile-attendance' },
      { name: 'Beat & Route Planning', appId: 'beat-route-planning' },
      { name: 'On-Field Digital Order Booking', appId: 'on-field-order-booking' },
      { name: 'Client Visit Verification', appId: 'client-visit-verification' }
    ]
  },
  {
    title: 'AGRI-COMMERCE & RURAL',
    items: [
      { name: 'GramUnnati Marketplace', appId: 'gram-unnati-marketplace' },
      { name: 'Farmer & FPO Producer App', appId: 'farmer-fpo-producer-app' },
      { name: 'B2B Bulk Buyer Platform', appId: 'b2b-bulk-buyer-platform' },
      { name: 'Digital Mandi Price Discovery', appId: 'digital-mandi-price-discovery' },
      { name: 'Master Product Catalog', appId: 'master-product-catalog' },
      { name: 'T+1 Direct Bank Payouts', appId: 't1-direct-bank-payouts' }
    ]
  },
  {
    title: 'TASK MANAGEMENT (SYNKRO)',
    items: [
      { name: 'SynkroBoard Workspace', appId: 'synkroboard-workspace' },
      { name: 'Interactive Kanban & Sprints', appId: 'interactive-kanban-sprints' },
      { name: 'RACI Governance Matrix', appId: 'raci-governance-matrix' },
      { name: 'Gantt Timelines & Calendar', appId: 'gantt-timelines-calendar' },
      { name: 'Absence & Leave Scheduling Sync', appId: 'absence-leave-scheduling' },
      { name: 'Role-Based Dashboards', appId: 'role-based-dashboards' }
    ]
  },
  {
    title: 'PLATFORM & EDGE CLOUD',
    items: [
      { name: 'Real-Time WebSocket Bus', appId: 'real-time-websocket-bus' },
      { name: 'Multi-Channel Alert Engine', appId: 'multichannel-alert-engine' },
      { name: 'TimescaleDB Timeseries', appId: 'timescaledb-timeseries' },
      { name: 'Digital Document Vault', appId: 'digital-document-vault' },
      { name: 'Enterprise REST & Webhook APIs', appId: 'enterprise-rest-webhook-apis' },
      { name: 'Edge Microservice Gateways', appId: 'edge-microservice-gateways' }
    ]
  }
];

const TECHNOLOGY_CATEGORIES = [
  {
    title: 'CORE STACK & CLOUD PLATFORM',
    items: [
      { label: 'React 18 & Vite Architecture', desc: 'Fast, modular single-page interface with dynamic UI states', appId: 'tech-react-vite' },
      { label: 'NestJS Enterprise Backend', desc: 'Scalable TypeScript microservices with event-driven architecture', appId: 'tech-nestjs-backend' },
      { label: 'PostgreSQL & TimescaleDB', desc: 'Relational ledger storage and high-concurrency timeseries telemetry', appId: 'tech-postgresql-timescaledb' },
      { label: 'Redis Event Streaming & Cache', desc: 'Sub-15ms real-time state pub/sub and distributed job queues', appId: 'tech-redis-streaming' },
      { label: 'Prisma ORM & Multi-Tenancy', desc: 'Type-safe data layer with tenant-level data isolation', appId: 'tech-prisma-multitenancy' }
    ]
  },
  {
    title: 'EDGE TELEMETRY & PROTOCOLS',
    items: [
      { label: 'MQTT Telemetry Broker (QoS 2)', desc: 'Guaranteed edge sensor pub/sub for booster & fire systems', appId: 'tech-mqtt-broker' },
      { label: 'Modbus RTU / TCP Field Bus', desc: 'Direct industrial RS485 connection to PLCs and digital meters', appId: 'tech-modbus-fieldbus' },
      { label: 'Real-Time WebSocket Engine', desc: 'Bidirectional live telemetry streams and collaborative Kanban sync', appId: 'tech-websocket-engine' },
      { label: 'AIPCU Hardware Edge Gateways', desc: 'Embedded microcontroller telemetry capture & automated trip relays', appId: 'tech-aipcu-hardware' },
      { label: 'GPS Telemetry & Geo-Fencing', desc: 'Sub-second field vehicle trails and mobile radius verification', appId: 'tech-gps-telemetry' }
    ]
  },
  {
    title: 'ENTERPRISE LOGIC & GOVERNANCE',
    items: [
      { label: 'RACI Governance & Sprint Engine', desc: 'Role-based ownership matrix, Kanban boards & team timeline sync', appId: 'tech-raci-governance' },
      { label: '4M Asset Governance Framework', desc: 'Integrated Man, Machine, Material & Method maintenance tracking', appId: 'tech-4m-asset-framework' },
      { label: 'QR Code Scanning & OTP Dispatch', desc: 'Package custody verification and secure doorstep delivery', appId: 'tech-qrcode-otp-dispatch' },
      { label: 'Double-Entry GST & Invoicing Engine', desc: 'Automated tax invoicing, E-Way bills and financial ledgers', appId: 'tech-double-entry-gst' },
      { label: 'RESTful APIs & Webhook Webbus', desc: 'Secure third-party enterprise integrations, SAP & data exports', appId: 'tech-restful-webhooks' }
    ]
  }
];

const INDUSTRY_CATEGORIES = [
  {
    title: 'FACILITIES & INFRASTRUCTURE',
    items: [
      { label: 'Residential Societies & Townships', desc: 'Centralized domestic booster water pumps, STP & sump automation', appId: 'g-nova-iot' },
      { label: 'Commercial Complexes & IT Parks', desc: '24/7 Energy monitoring, HVAC baseline & multi-facility dashboards', appId: 'g-nova-iot' },
      { label: 'Life Safety & Fire Protection', desc: 'Real-time hydrant pressure, jockey pump monitoring & zero-fault alarms', appId: 'g-nova-iot' },
      { label: 'Water & Sewage Treatment (STP)', desc: 'Level transmitter telemetry, automated pump cycling & effluent logs', appId: 'g-nova-iot' }
    ]
  },
  {
    title: 'RURAL COMMERCE & AGRI-SUPPLY',
    items: [
      { label: 'Farmers & Producer Groups (FPOs)', desc: 'Direct digital mandi price discovery, product combos & bulk trade', appId: 'gram-unnati' },
      { label: 'Self-Help Groups (SHG Networks)', desc: 'Rural women micro-entrepreneur order aggregation & doorstep delivery', appId: 'shg-app' },
      { label: 'Agri-Inputs & Rural Distribution', desc: 'Verified vendor KYC, batch purchasing and T+1 direct bank payouts', appId: 'gram-unnati' },
      { label: 'Cold Chain & Perishables Storage', desc: 'Live temperature & humidity logging during rural transit', appId: 'g-track' }
    ]
  },
  {
    title: 'MANUFACTURING & FLEET OPERATIONS',
    items: [
      { label: 'Industrial Manufacturing Plants', desc: '4M CMMS preventive maintenance, MTTR tracking & downtime reduction', appId: 'cmms' },
      { label: 'Middle-Mile Transporter Fleets', desc: 'Cluster batch routing, vehicle capacity fill & barcode manifests', appId: 'transporter-app' },
      { label: 'Field Force & Sales Operations', desc: 'Geo-fenced attendance, beat planning & on-field digital order booking', appId: 'g-track' },
      { label: 'Multi-Branch Corporate Enterprises', desc: 'Consolidated ERP accounting, branch ledgers & task boards', appId: 'erp' }
    ]
  }
];

export default function Navbar({ currentPage = 'home', onNavigate, onOpenExpertModal, onScrollToSection, onSelectApp }) {
  const [activeMenu, setActiveMenu] = useState(null); // 'solutions' | 'technology' | 'industries' | null
  const [isClosing, setIsClosing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const scrollPosRef = useRef(0);
  const isLockedRef = useRef(false);
  const navigatingRef = useRef(false);

  useEffect(() => {
    setActiveCategoryIndex(null);
  }, [activeMenu]);

  const closeMenu = () => {
    if (activeMenu) {
      setIsClosing(true);
      setActiveCategoryIndex(null);
      setTimeout(() => {
        setActiveMenu(null);
        setIsClosing(false);
      }, 320);
    }
  };

  const closeAllMenus = () => {
    closeMenu();
    setMobileMenuOpen(false);
    setActiveCategoryIndex(null);
  };

  const handleAppItemClick = (appId, origin = 'solutions') => {
    navigatingRef.current = true;
    closeMenu();
    setMobileMenuOpen(false);
    if (onSelectApp) {
      const found = getModuleById(appId) || findAppOrModule(appId) || APPLICATIONS.find(a => a.id === appId) || { id: appId };
      onSelectApp({ ...found, navigationOrigin: origin });
    } else {
      window.history.pushState({ page: 'app-detail', appId, navigationOrigin: origin }, '', `/${origin === 'technology' ? 'technology' : 'app'}/${appId}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Lock body scroll on mobile web when mobile nav drawer or mobile mega-menu is active
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const shouldLock = isMobile && (mobileMenuOpen || Boolean(activeMenu && !isClosing));

    if (shouldLock && !isLockedRef.current) {
      scrollPosRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      isLockedRef.current = true;
    } else if (!shouldLock && isLockedRef.current) {
      const restoreY = scrollPosRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      isLockedRef.current = false;

      if (!navigatingRef.current) {
        window.scrollTo(0, restoreY);
      } else {
        navigatingRef.current = false;
      }
    }

    return () => {
      if (isLockedRef.current) {
        const restoreY = scrollPosRef.current;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.paddingRight = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        isLockedRef.current = false;
        if (!navigatingRef.current) {
          window.scrollTo(0, restoreY);
        }
      }
    };
  }, [mobileMenuOpen, activeMenu, isClosing]);

  // Automatically close mobile menu if screen resizes to desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        closeAllMenus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAllMenus();
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

  const handleBackToMobileMenu = () => {
    setActiveMenu(null);
    setIsClosing(false);
    setMobileMenuOpen(true);
  };

  const handlePageNav = (page) => {
    navigatingRef.current = true;
    closeAllMenus();
    if (onNavigate) {
      onNavigate(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSolutionNav = (sectionId) => {
    navigatingRef.current = true;
    closeAllMenus();
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
        onClick={closeAllMenus}
        className={`backdrop-overlay ${(activeMenu && !isClosing) || mobileMenuOpen ? 'backdrop-visible' : ''}`}
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
              <div className="mobile-nav-toggle-wrap">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  style={{
                    background: 'none',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px',
                    color: '#1E293B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '40px',
                    minHeight: '40px'
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
                  
                  {/* Unified Interactive Category Accordion (Responsive Desktop, Tablet & Mobile) */}
                  <div className="category-accordion-container">
                    {SOLUTION_CATEGORIES.map((cat, catIdx) => {
                      const isExpanded = activeCategoryIndex === catIdx;
                      return (
                        <div 
                          key={catIdx} 
                          className={`category-accordion-card ${isExpanded ? 'category-accordion-card-active' : ''}`}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveCategoryIndex(isExpanded ? null : catIdx)}
                            className="category-accordion-header"
                            aria-expanded={isExpanded}
                          >
                            <div className="category-accordion-header-left">
                              <span className="category-accordion-title">
                                {cat.title}
                              </span>
                            </div>
                            <div className="category-accordion-header-right">
                              <span className="category-accordion-count-badge">
                                {cat.items.length} Apps
                              </span>
                              <div className={`category-accordion-chevron ${isExpanded ? 'category-accordion-chevron-open' : ''}`}>
                                <ChevronDown size={18} />
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="category-accordion-body">
                              <div className="category-accordion-body-header">
                                <span className="category-accordion-body-subtitle">
                                  Select an application to view modules and features
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCategoryIndex(null);
                                  }}
                                  className="category-close-top-btn"
                                  aria-label="Close section"
                                >
                                  <X size={13} />
                                  <span>Close</span>
                                </button>
                              </div>

                              <div className="category-items-grid-simple">
                                {cat.items.map((item, idx) => (
                                  <div 
                                    key={idx} 
                                    onClick={() => handleAppItemClick(item.appId, 'solutions')}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleAppItemClick(item.appId, 'solutions');
                                      }
                                    }}
                                    className="category-item-simple-row"
                                    role="button"
                                    tabIndex={0}
                                  >
                                    <span className="category-item-simple-name">{item.name}</span>
                                    <ChevronRight size={15} className="category-item-simple-arrow" />
                                  </div>
                                ))}
                              </div>

                              <div className="category-accordion-footer">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCategoryIndex(null);
                                  }}
                                  className="category-accordion-close-btn"
                                >
                                  <ChevronUp size={14} />
                                  <span>Collapse Section</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                  
                  {/* Unified Interactive Category Accordion (Responsive Desktop, Tablet & Mobile) */}
                  <div className="category-accordion-container">
                    {TECHNOLOGY_CATEGORIES.map((cat, catIdx) => {
                      const isExpanded = activeCategoryIndex === catIdx;
                      return (
                        <div 
                          key={catIdx} 
                          className={`category-accordion-card ${isExpanded ? 'category-accordion-card-active' : ''}`}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveCategoryIndex(isExpanded ? null : catIdx)}
                            className="category-accordion-header"
                            aria-expanded={isExpanded}
                          >
                            <div className="category-accordion-header-left">
                              <span className="category-accordion-title">
                                {cat.title}
                              </span>
                            </div>
                            <div className="category-accordion-header-right">
                              <span className="category-accordion-count-badge">
                                {cat.items.length} Tech
                              </span>
                              <div className={`category-accordion-chevron ${isExpanded ? 'category-accordion-chevron-open' : ''}`}>
                                <ChevronDown size={18} />
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="category-accordion-body">
                              <div className="category-accordion-body-header">
                                <span className="category-accordion-body-subtitle">
                                  Enterprise Stack Architecture & Industrial Protocols
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCategoryIndex(null);
                                  }}
                                  className="category-close-top-btn"
                                  aria-label="Close section"
                                >
                                  <X size={13} />
                                  <span>Close</span>
                                </button>
                              </div>

                              <div className="category-items-grid-detailed">
                                {cat.items.map((item, idx) => (
                                  <div 
                                    key={idx} 
                                    onClick={() => handleAppItemClick(item.appId, 'technology')}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleAppItemClick(item.appId, 'technology');
                                      }
                                    }}
                                    className="category-item-detailed-row"
                                    role="button"
                                    tabIndex={0}
                                  >
                                    <div className="category-item-detailed-label">
                                      {item.label}
                                    </div>
                                    <div className="category-item-detailed-desc">
                                      {item.desc}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="category-accordion-footer">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCategoryIndex(null);
                                  }}
                                  className="category-accordion-close-btn"
                                >
                                  <ChevronUp size={14} />
                                  <span>Close Section</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
              <div className="mega-menu-content-fade industries-mega-menu-wrapper" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
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

                <div className="industries-mega-menu-inner" style={{ maxWidth: '1240px', margin: '0 auto', backgroundColor: '#FFFFFF' }}>
                  
                  {/* Unified Interactive Category Accordion (Responsive Desktop, Tablet & Mobile) */}
                  <div className="category-accordion-container">
                    {INDUSTRY_CATEGORIES.map((cat, catIdx) => {
                      const isExpanded = activeCategoryIndex === catIdx;
                      return (
                        <div 
                          key={catIdx} 
                          className={`category-accordion-card ${isExpanded ? 'category-accordion-card-active' : ''}`}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveCategoryIndex(isExpanded ? null : catIdx)}
                            className="category-accordion-header"
                            aria-expanded={isExpanded}
                          >
                            <div className="category-accordion-header-left">
                              <span className="category-accordion-title">
                                {cat.title}
                              </span>
                            </div>
                            <div className="category-accordion-header-right">
                              <span className="category-accordion-count-badge">
                                {cat.items.length} Verticals
                              </span>
                              <div className={`category-accordion-chevron ${isExpanded ? 'category-accordion-chevron-open' : ''}`}>
                                <ChevronDown size={18} />
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="category-accordion-body">
                              <div className="category-accordion-body-header">
                                <span className="category-accordion-body-subtitle">
                                  Industry Verticals, Field Deployments & Operations
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCategoryIndex(null);
                                  }}
                                  className="category-close-top-btn"
                                  aria-label="Close section"
                                >
                                  <X size={13} />
                                  <span>Close</span>
                                </button>
                              </div>

                              <div className="category-items-grid-detailed">
                                {cat.items.map((item, idx) => (
                                  <div 
                                    key={idx} 
                                    onClick={() => handleAppItemClick(item.appId, 'industries')}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleAppItemClick(item.appId, 'industries');
                                      }
                                    }}
                                    className="category-item-detailed-row"
                                    role="button"
                                    tabIndex={0}
                                  >
                                    <div className="category-item-detailed-label">
                                      {item.label}
                                    </div>
                                    <div className="category-item-detailed-desc">
                                      {item.desc}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="category-accordion-footer">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCategoryIndex(null);
                                  }}
                                  className="category-accordion-close-btn"
                                >
                                  <ChevronUp size={14} />
                                  <span>Close Section</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Utility Row (Odoo Style) */}
                  <div className="industries-bottom-utility stagger-bottom">
                    <div 
                      onClick={() => { closeMenu(); handleSolutionNav('solutions'); }}
                      className="industries-utility-link hover:text-slate-900 transition-colors"
                    >
                      <Building2 size={16} className="industries-utility-icon" />
                      <span className="industries-utility-text">50+ Smart Facility Deployments</span>
                    </div>
                    <div 
                      onClick={() => { closeMenu(); handleAppItemClick('gram-unnati'); }}
                      className="industries-utility-link hover:text-slate-900 transition-colors"
                    >
                      <Sprout size={16} className="industries-utility-icon" />
                      <span className="industries-utility-text">100k+ Farmers & Rural SHGs</span>
                    </div>
                    <div 
                      onClick={() => { closeMenu(); handleAppItemClick('g-track'); }}
                      className="industries-utility-link hover:text-slate-900 transition-colors"
                    >
                      <Truck size={16} className="industries-utility-icon" />
                      <span className="industries-utility-text">10M+ Logistics & Fleet Pings</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div 
            className="mobile-nav-drawer"
            role="dialog"
            aria-label="Mobile Navigation Menu"
          >
            <button 
              type="button"
              onClick={() => handlePageNav('home')}
              className={`mobile-nav-link ${(currentPage === 'home' && !activeMenu) ? 'mobile-nav-link-active' : ''}`}
            >
              <span>Home</span>
            </button>
            <button 
              type="button"
              onClick={() => { toggleMenu('solutions'); setMobileMenuOpen(false); }}
              className={`mobile-nav-link ${activeMenu === 'solutions' ? 'mobile-nav-link-active' : ''}`}
            >
              <span>Solutions</span>
              <span className="mobile-nav-badge">Directory →</span>
            </button>
            <button 
              type="button"
              onClick={() => { toggleMenu('technology'); setMobileMenuOpen(false); }}
              className={`mobile-nav-link ${activeMenu === 'technology' ? 'mobile-nav-link-active' : ''}`}
            >
              <span>Technology</span>
              <span className="mobile-nav-badge">Stack →</span>
            </button>
            <button 
              type="button"
              onClick={() => { toggleMenu('industries'); setMobileMenuOpen(false); }}
              className={`mobile-nav-link ${activeMenu === 'industries' ? 'mobile-nav-link-active' : ''}`}
            >
              <span>Industries</span>
              <span className="mobile-nav-badge">Verticals →</span>
            </button>
            <button 
              type="button"
              onClick={() => handlePageNav('about')}
              className={`mobile-nav-link ${currentPage === 'about' ? 'mobile-nav-link-active' : ''}`}
            >
              <span>About</span>
            </button>
            <button 
              type="button"
              onClick={() => handlePageNav('help')}
              className={`mobile-nav-link ${currentPage === 'help' ? 'mobile-nav-link-active' : ''}`}
            >
              <span>Help & Support</span>
            </button>
            <div className="mobile-nav-action-wrap">
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); onOpenExpertModal?.(); }}
                className="mobile-nav-action-btn"
              >
                <span>Request Consultation</span>
              </button>
            </div>
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
          z-index: 55;
          opacity: 0;
          pointer-events: none;
          touch-action: none;
          transition: opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .backdrop-visible {
          opacity: 1;
          pointer-events: auto;
        }

        /* ========================================================= */
        /* MOBILE NAVIGATION DRAWER RESPONSIVE STYLING */
        /* ========================================================= */
        .mobile-nav-drawer {
          background-color: #FFFFFF;
          border-top: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 62;
          box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.12);
          width: 100%;
          box-sizing: border-box;
          max-height: calc(100vh - 64px);
          max-height: calc(100dvh - 64px);
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-y;
          padding: 1.15rem 1.25rem max(1.75rem, calc(1.25rem + env(safe-area-inset-bottom, 0px)));
          gap: 0.55rem;
          animation: mobileNavDrawerSlideDown 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes mobileNavDrawerSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-nav-drawer::-webkit-scrollbar {
          width: 4px;
        }
        .mobile-nav-drawer::-webkit-scrollbar-track {
          background: transparent;
        }
        .mobile-nav-drawer::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          color: #1E293B;
          background-color: transparent;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-family: inherit;
          transition: background-color 0.15s ease, color 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          user-select: none;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link:active {
          background-color: #F8FAFC;
          color: #0F172A;
        }

        .mobile-nav-link-active {
          font-weight: 700;
          color: #0B3A70;
          background-color: #F1F5F9;
        }

        .mobile-nav-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 9999px;
          background-color: #EBF3FC;
          color: #0B3A70;
          flex-shrink: 0;
        }

        .mobile-nav-action-wrap {
          padding-top: 0.5rem;
          border-top: 1px solid #F1F5F9;
          margin-top: 0.25rem;
        }

        .mobile-nav-action-btn {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 9999px;
          background-color: #7B5872;
          color: #FFFFFF;
          font-weight: 600;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(123, 88, 114, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-family: inherit;
          transition: background-color 0.15s ease, transform 0.1s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .mobile-nav-action-btn:hover {
          background-color: #6F4C66;
        }

        .mobile-nav-action-btn:active {
          transform: scale(0.98);
          background-color: #63435B;
        }

        @media (max-height: 680px) {
          .mobile-nav-drawer {
            padding: 0.85rem 1rem max(1.25rem, calc(0.85rem + env(safe-area-inset-bottom, 0px)));
            gap: 0.35rem;
          }
          .mobile-nav-link {
            padding: 0.55rem 0.85rem;
            font-size: 0.92rem;
          }
        }

        /* ========================================================= */
        /* UNIFIED INTERACTIVE CATEGORY ACCORDION (DESKTOP, TABLET & MOBILE) */
        /* ========================================================= */
        .category-accordion-container {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          width: 100%;
          box-sizing: border-box;
          padding: 0.5rem 0 1rem;
        }

        .category-accordion-card {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .category-accordion-card-active {
          border-color: #CBD5E1;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.07);
        }

        .category-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.85rem 1rem;
          background-color: #FFFFFF;
          border: none;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          transition: background-color 0.15s ease, color 0.15s ease;
        }

        .category-accordion-header:hover {
          background-color: #F8FAFC;
        }

        .category-accordion-card-active .category-accordion-header {
          background-color: #F8FAFC;
          border-bottom: 1px solid #F1F5F9;
        }

        .category-accordion-header:active {
          background-color: #F1F5F9;
        }

        .category-accordion-header-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          min-width: 0;
          flex: 1;
        }

        .category-accordion-accent-pip {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .category-accordion-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          line-height: 1.3;
          white-space: normal;
          word-break: break-word;
        }

        .category-accordion-header-right {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
          margin-left: 0.5rem;
        }

        .category-accordion-count-badge {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 9999px;
          background-color: #F1F5F9;
          color: #475569;
          border: 1px solid #E2E8F0;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .category-accordion-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748B;
          transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .category-accordion-chevron-open {
          transform: rotate(180deg);
          color: #0B3A70;
        }

        .category-accordion-body {
          background-color: #FFFFFF;
          padding: 0.75rem 1rem 0.85rem;
          animation: accordionContentFade 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes accordionContentFade {
          0% {
            opacity: 0;
            transform: translateY(-4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Top header inside expanded body */
        .category-accordion-body-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.65rem;
          margin-bottom: 0.65rem;
          border-bottom: 1px solid #F1F5F9;
        }

        .category-accordion-body-subtitle {
          font-size: 0.76rem;
          font-weight: 500;
          color: #64748B;
          letter-spacing: 0.01em;
        }

        .category-close-top-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.74rem;
          font-weight: 600;
          color: #64748B;
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          padding: 3px 8px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .category-close-top-btn:hover {
          background-color: #F1F5F9;
          color: #0F172A;
          border-color: #CBD5E1;
        }

        .category-close-top-btn:active {
          transform: scale(0.96);
        }

        /* Simple App Items Grid (Solutions) */
        .category-items-grid-simple {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.35rem;
        }

        .category-item-simple-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          background-color: #FFFFFF;
          border: 1px solid transparent;
          transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
        }

        .category-item-simple-row:hover,
        .category-item-simple-row:active {
          background-color: #F8FAFC;
          border-color: #E2E8F0;
        }

        .category-item-simple-name {
          font-size: 0.88rem;
          font-weight: 500;
          color: #334155;
          line-height: 1.4;
          transition: color 0.15s ease;
        }

        .category-item-simple-row:hover .category-item-simple-name {
          color: #0B3A70;
        }

        .category-item-simple-arrow {
          color: #94A3B8;
          flex-shrink: 0;
          margin-left: 0.5rem;
          transition: transform 0.15s ease, color 0.15s ease;
        }

        .category-item-simple-row:hover .category-item-simple-arrow {
          color: #0B3A70;
          transform: translateX(2px);
        }

        /* Detailed Items Grid (Technology & Industries) */
        .category-items-grid-detailed {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.45rem;
        }

        .category-item-detailed-row {
          display: flex;
          flex-direction: column;
          padding: 0.65rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          background-color: #FFFFFF;
          border: 1px solid transparent;
          transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
        }

        .category-item-detailed-row:hover,
        .category-item-detailed-row:active {
          background-color: #F8FAFC;
          border-color: #E2E8F0;
        }

        .category-item-detailed-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: #0F172A;
          line-height: 1.35;
          transition: color 0.15s ease;
        }

        .category-item-detailed-row:hover .category-item-detailed-label {
          color: #0B3A70;
        }

        .category-item-detailed-desc {
          font-size: 0.76rem;
          color: #64748B;
          margin-top: 2px;
          line-height: 1.38;
        }

        /* Accordion Footer & Collapse Button */
        .category-accordion-footer {
          margin-top: 0.65rem;
          padding-top: 0.65rem;
          border-top: 1px dashed #E2E8F0;
          display: flex;
          justify-content: flex-end;
        }

        .category-accordion-close-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.76rem;
          font-weight: 600;
          color: #64748B;
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          padding: 4px 10px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .category-accordion-close-btn:hover {
          background-color: #F1F5F9;
          color: #0F172A;
          border-color: #CBD5E1;
        }

        .category-accordion-close-btn:active {
          transform: scale(0.96);
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

        /* Wrappers */
        .solutions-mega-menu-wrapper,
        .technology-mega-menu-wrapper,
        .industries-mega-menu-wrapper {
          width: 100%;
          background-color: #FFFFFF;
        }

        .solutions-mega-menu-inner,
        .technology-mega-menu-inner,
        .industries-mega-menu-inner {
          width: 100%;
          box-sizing: border-box;
        }

        .solutions-bottom-utility,
        .technology-bottom-utility,
        .industries-bottom-utility {
          box-sizing: border-box;
          width: 100%;
        }

        .solutions-utility-link,
        .technology-utility-link,
        .industries-utility-link {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
          transition: all 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .solutions-utility-icon,
        .technology-utility-icon,
        .industries-utility-icon {
          color: #475569;
          flex-shrink: 0;
        }

        .solutions-utility-text,
        .technology-utility-text,
        .industries-utility-text {
          font-weight: 500;
        }

        /* ========================================================= */
        /* RESPONSIVE BREAKPOINTS (DESKTOP, TABLET, MOBILE) */
        /* ========================================================= */

        /* Desktop Breakpoint (>= 1024px) */
        @media (min-width: 1024px) {
          .solutions-mega-menu-wrapper,
          .technology-mega-menu-wrapper,
          .industries-mega-menu-wrapper {
            max-height: calc(100vh - 72px);
            max-height: calc(100dvh - 72px);
            overflow-y: auto;
            overscroll-behavior: contain;
          }
          .solutions-mega-menu-wrapper::-webkit-scrollbar,
          .technology-mega-menu-wrapper::-webkit-scrollbar,
          .industries-mega-menu-wrapper::-webkit-scrollbar {
            width: 5px;
          }
          .solutions-mega-menu-wrapper::-webkit-scrollbar-track,
          .technology-mega-menu-wrapper::-webkit-scrollbar-track,
          .industries-mega-menu-wrapper::-webkit-scrollbar-track {
            background: transparent;
          }
          .solutions-mega-menu-wrapper::-webkit-scrollbar-thumb,
          .technology-mega-menu-wrapper::-webkit-scrollbar-thumb,
          .industries-mega-menu-wrapper::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 4px;
          }

          .solutions-mega-menu-inner,
          .technology-mega-menu-inner,
          .industries-mega-menu-inner {
            padding: 1.75rem 2rem 2rem;
            max-width: 1060px !important;
          }

          .category-accordion-container {
            gap: 0.65rem;
            padding: 0;
          }

          .category-accordion-card {
            border-radius: 10px;
          }

          .category-accordion-header {
            padding: 0.95rem 1.25rem;
          }

          .category-accordion-title {
            font-size: 0.85rem;
            letter-spacing: 0.06em;
          }

          .category-accordion-count-badge {
            font-size: 0.74rem;
            padding: 2px 10px;
          }

          .category-accordion-body {
            padding: 1rem 1.25rem 1.15rem;
          }

          .category-accordion-body-subtitle {
            font-size: 0.8rem;
          }

          .category-close-top-btn {
            font-size: 0.76rem;
            padding: 4px 10px;
          }

          /* Solutions 3 columns on desktop */
          .category-items-grid-simple {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.65rem 0.85rem;
          }

          .category-item-simple-row {
            padding: 0.7rem 0.85rem;
            background-color: #F8FAFC;
            border: 1px solid #F1F5F9;
          }

          .category-item-simple-row:hover {
            background-color: #FFFFFF;
            border-color: #CBD5E1;
            box-shadow: 0 3px 10px rgba(15, 23, 42, 0.05);
            transform: translateY(-1px);
          }

          /* Technology & Industries 2 columns on desktop */
          .category-items-grid-detailed {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem 1rem;
          }

          .category-item-detailed-row {
            padding: 0.8rem 1rem;
            background-color: #F8FAFC;
            border: 1px solid #F1F5F9;
          }

          .category-item-detailed-row:hover {
            background-color: #FFFFFF;
            border-color: #CBD5E1;
            box-shadow: 0 3px 10px rgba(15, 23, 42, 0.05);
            transform: translateY(-1px);
          }

          .category-item-detailed-label {
            font-size: 0.9rem;
          }

          .category-item-detailed-desc {
            font-size: 0.78rem;
          }

          .category-accordion-footer {
            margin-top: 0.85rem;
            padding-top: 0.75rem;
          }

          .category-accordion-close-btn {
            font-size: 0.78rem;
            padding: 5px 12px;
          }

          .solutions-bottom-utility,
          .technology-bottom-utility,
          .industries-bottom-utility {
            margin-top: 1.75rem;
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

          .solutions-utility-link,
          .technology-utility-link,
          .industries-utility-link {
            gap: 0.45rem;
          }

          .solutions-utility-link:hover,
          .technology-utility-link:hover,
          .industries-utility-link:hover {
            color: #0F172A;
          }
        }

        /* Tablet Breakpoint (640px to 1023px) */
        @media (min-width: 640px) and (max-width: 1023px) {
          .solutions-mega-menu-wrapper,
          .technology-mega-menu-wrapper,
          .industries-mega-menu-wrapper {
            max-height: calc(100vh - 64px);
            max-height: calc(100dvh - 64px);
            overflow-y: auto;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
          }

          .solutions-mega-menu-inner,
          .technology-mega-menu-inner,
          .industries-mega-menu-inner {
            padding: 1.5rem 1.25rem;
            max-width: 768px !important;
          }

          .category-items-grid-simple {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }

          .category-items-grid-detailed {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.65rem;
          }

          .solutions-bottom-utility,
          .technology-bottom-utility,
          .industries-bottom-utility {
            margin-top: 1.5rem;
            padding-top: 1.15rem;
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
          .technology-utility-link,
          .industries-utility-link {
            gap: 0.45rem;
          }
        }

        /* Mobile (< 640px) */
        @media (max-width: 639px) {
          .solutions-mega-menu-wrapper,
          .technology-mega-menu-wrapper,
          .industries-mega-menu-wrapper {
            max-height: calc(100vh - 64px);
            max-height: calc(100dvh - 64px);
            overflow-y: auto;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
          }

          .solutions-mega-menu-wrapper::-webkit-scrollbar,
          .technology-mega-menu-wrapper::-webkit-scrollbar,
          .industries-mega-menu-wrapper::-webkit-scrollbar {
            width: 4px;
          }
          .solutions-mega-menu-wrapper::-webkit-scrollbar-track,
          .technology-mega-menu-wrapper::-webkit-scrollbar-track,
          .industries-mega-menu-wrapper::-webkit-scrollbar-track {
            background: transparent;
          }
          .solutions-mega-menu-wrapper::-webkit-scrollbar-thumb,
          .technology-mega-menu-wrapper::-webkit-scrollbar-thumb,
          .industries-mega-menu-wrapper::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 4px;
          }

          .solutions-mega-menu-inner,
          .technology-mega-menu-inner,
          .industries-mega-menu-inner {
            padding: 1rem 0.85rem 2rem;
          }

          .category-accordion-container {
            gap: 0.55rem;
          }

          .category-accordion-header {
            padding: 0.8rem 0.85rem;
          }

          .category-accordion-body {
            padding: 0.65rem 0.65rem 0.75rem;
          }

          .category-items-grid-simple {
            grid-template-columns: 1fr;
            gap: 0.25rem;
          }

          .category-items-grid-detailed {
            grid-template-columns: 1fr;
            gap: 0.4rem;
          }

          .solutions-bottom-utility,
          .technology-bottom-utility,
          .industries-bottom-utility {
            margin-top: 1.5rem;
            padding-top: 1.15rem;
            border-top: 1px solid #EDF2F7;
            display: flex;
            flex-direction: column;
            gap: 0.625rem;
            align-items: stretch;
          }

          .solutions-utility-link,
          .technology-utility-link,
          .industries-utility-link {
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
          .technology-utility-link:hover,
          .industries-utility-link:active,
          .industries-utility-link:hover {
            background-color: #F1F5F9;
            color: #0F172A;
          }

          .solutions-utility-icon,
          .technology-utility-icon,
          .industries-utility-icon {
            color: #0B3A70;
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

        /* Desktop Nav Breakpoint (>= 1024px) */
        @media (min-width: 1024px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-right-spacer {
            display: block !important;
          }
          .mobile-nav-toggle-wrap {
            display: none !important;
          }
        }

        /* Tablet & Mobile Nav Breakpoint (< 1024px) */
        @media (max-width: 1023px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-right-spacer {
            display: none !important;
          }
          .mobile-nav-toggle-wrap {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
