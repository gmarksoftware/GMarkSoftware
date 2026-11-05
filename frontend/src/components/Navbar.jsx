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
  ChevronUp
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

const SOLUTION_CATEGORY_CONFIG = {
  'CORE ERP & FINANCE': {
    icon: Layers,
    color: 'text-teal-600',
    bg: 'bg-teal-50 border-teal-200/70',
    badgeText: '6 Apps'
  },
  '4M OPERATIONS & CMMS': {
    icon: Settings,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200/70',
    badgeText: '6 Apps'
  },
  'INDUSTRIAL IOT & G-NOVA': {
    icon: Activity,
    color: 'text-sky-600',
    bg: 'bg-sky-50 border-sky-200/70',
    badgeText: '6 Apps'
  },
  'SUPPLY CHAIN & LOGISTICS': {
    icon: Truck,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200/70',
    badgeText: '6 Apps'
  },
  'FIELD FORCE & TELEMETRY': {
    icon: MapPin,
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200/70',
    badgeText: '6 Apps'
  },
  'AGRI-COMMERCE & RURAL': {
    icon: Sprout,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200/70',
    badgeText: '6 Apps'
  },
  'TASK MANAGEMENT (SYNKRO)': {
    icon: ClipboardList,
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200/70',
    badgeText: '6 Apps'
  },
  'PLATFORM & EDGE CLOUD': {
    icon: Server,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200/70',
    badgeText: '6 Apps'
  }
};

const TECH_CATEGORY_CONFIG = {
  'CORE STACK & CLOUD PLATFORM': {
    icon: Server,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200/70'
  },
  'EDGE TELEMETRY & PROTOCOLS': {
    icon: Zap,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200/70'
  },
  'ENTERPRISE LOGIC & GOVERNANCE': {
    icon: ShieldCheck,
    color: 'text-teal-600',
    bg: 'bg-teal-50 border-teal-200/70'
  }
};

const INDUSTRY_CATEGORY_CONFIG = {
  'FACILITIES & INFRASTRUCTURE': {
    icon: Building2,
    color: 'text-sky-600',
    bg: 'bg-sky-50 border-sky-200/70'
  },
  'RURAL COMMERCE & AGRI-SUPPLY': {
    icon: Sprout,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200/70'
  },
  'MANUFACTURING & FLEET OPERATIONS': {
    icon: Factory,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200/70'
  }
};

export default function Navbar({ currentPage = 'home', onNavigate, onOpenExpertModal, onScrollToSection, onSelectApp }) {
  const [activeMenu, setActiveMenu] = useState(null); // 'solutions' | 'technology' | 'industries' | null
  const [isClosing, setIsClosing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navRef = useRef(null);
  const scrollPosRef = useRef(0);
  const isLockedRef = useRef(false);
  const navigatingRef = useRef(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-nav-hidden', isVisible ? 'false' : 'true');
    }
  }, [isVisible]);

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
    setIsVisible(true);
    lastScrollYRef.current = 0;
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
    lastScrollYRef.current = Math.max(0, window.scrollY || window.pageYOffset || 0);

    const handleScroll = () => {
      // Don't auto-hide when mobile menu or mega-menu dropdown is open, or scroll is locked
      if (mobileMenuOpen || activeMenu || isLockedRef.current) {
        setIsVisible(true);
        return;
      }

      const currentScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const isPast = currentScrollY > 20;
      setScrolled((prev) => (prev !== isPast ? isPast : prev));

      // Always visible near the top of the page
      if (currentScrollY <= 40) {
        setIsVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      const deltaY = currentScrollY - lastScrollYRef.current;

      // Ignore small movements (threshold of 8px to prevent jitter)
      if (Math.abs(deltaY) < 8) {
        return;
      }

      if (deltaY > 0) {
        // Scrolling DOWN -> hide navigation bar smoothly
        setIsVisible(false);
      } else {
        // Scrolling UP (reverse) -> make navigation bar visible smoothly
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen, activeMenu]);

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
    setIsVisible(true);
    lastScrollYRef.current = 0;
    if (onNavigate) {
      onNavigate(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSolutionNav = (sectionId) => {
    navigatingRef.current = true;
    closeAllMenus();
    setIsVisible(true);
    lastScrollYRef.current = 0;
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
        className="fixed top-0 left-0 right-0 z-50 max-w-[1440px] mx-auto"
        style={{
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backgroundColor: (activeMenu || mobileMenuOpen)
            ? '#FFFFFF'
            : (scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent'),
          backdropFilter: (scrolled && !activeMenu && !mobileMenuOpen) ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: (scrolled && !activeMenu && !mobileMenuOpen) ? 'blur(12px)' : 'none',
          borderBottom: (activeMenu || mobileMenuOpen)
            ? '1px solid #E2E8F0'
            : (scrolled ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid transparent'),
          boxShadow: activeMenu 
            ? '0 16px 36px -4px rgba(15, 23, 42, 0.12)' 
            : (scrolled ? '0 4px 16px -2px rgba(15, 23, 42, 0.08)' : 'none'),
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          pointerEvents: isVisible ? 'auto' : 'none',
          transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
          zIndex: 60
        }}
      >
        <div 
          style={{ 
            backgroundColor: (activeMenu || mobileMenuOpen) ? '#FFFFFF' : 'transparent', 
            position: 'relative', 
            zIndex: 61,
            transition: 'background-color 0.25s ease'
          }}
        >
          <div className="nav-header-full">
            <div className="nav-header-inner">
              
              {/* Left Side Brand Logo */}
              <div 
                onClick={() => handlePageNav('home')}
                className="nav-logo-wrap"
                title="G Mark Software"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePageNav('home'); } }}
              >
                <img 
                  src={logoBlack} 
                  alt="G Mark Software Pvt. Ltd" 
                  className="nav-logo-img"
                  draggable={false}
                />
              </div>

              {/* Center: Odoo-Style Clean Minimalist Navigation Links */}
              <nav className="desktop-nav">
                {/* HOME */}
                <button 
                  type="button"
                  onClick={() => handlePageNav('home')}
                  className={`nav-link-odoo ${currentPage === 'home' && !activeMenu ? 'nav-link-odoo-active' : ''}`}
                >
                  <span>Home</span>
                </button>

                {/* SOLUTIONS (Dropdown) */}
                <button 
                  type="button"
                  onClick={() => toggleMenu('solutions')}
                  className={`nav-link-odoo ${activeMenu === 'solutions' ? 'nav-link-odoo-active' : ''}`}
                  aria-expanded={activeMenu === 'solutions'}
                >
                  <span>Solutions</span>
                  <ChevronDown 
                    size={13} 
                    className={`nav-link-chevron ${activeMenu === 'solutions' ? 'nav-link-chevron-open' : ''}`} 
                  />
                </button>

                {/* TECHNOLOGY (Dropdown) */}
                <button 
                  type="button"
                  onClick={() => toggleMenu('technology')}
                  className={`nav-link-odoo ${activeMenu === 'technology' ? 'nav-link-odoo-active' : ''}`}
                  aria-expanded={activeMenu === 'technology'}
                >
                  <span>Technology</span>
                  <ChevronDown 
                    size={13} 
                    className={`nav-link-chevron ${activeMenu === 'technology' ? 'nav-link-chevron-open' : ''}`} 
                  />
                </button>

                {/* INDUSTRIES (Dropdown) */}
                <button 
                  type="button"
                  onClick={() => toggleMenu('industries')}
                  className={`nav-link-odoo ${activeMenu === 'industries' ? 'nav-link-odoo-active' : ''}`}
                  aria-expanded={activeMenu === 'industries'}
                >
                  <span>Industries</span>
                  <ChevronDown 
                    size={13} 
                    className={`nav-link-chevron ${activeMenu === 'industries' ? 'nav-link-chevron-open' : ''}`} 
                  />
                </button>

                {/* ABOUT */}
                <button 
                  type="button"
                  onClick={() => handlePageNav('about')}
                  className={`nav-link-odoo ${currentPage === 'about' && !activeMenu ? 'nav-link-odoo-active' : ''}`}
                >
                  <span>About</span>
                </button>

                {/* HELP */}
                <button 
                  type="button"
                  onClick={() => handlePageNav('help')}
                  className={`nav-link-odoo ${currentPage === 'help' && !activeMenu ? 'nav-link-odoo-active' : ''}`}
                >
                  <span>Help</span>
                </button>
              </nav>

              {/* Right Side: Contact Us Action Button */}
              <div className="desktop-nav-actions">
                <button 
                  type="button"
                  onClick={onOpenExpertModal}
                  className="nav-action-primary-btn"
                >
                  <span>Contact Us</span>
                </button>
              </div>

              {/* Mobile Hamburger Toggle (Clean Flat Minimalist Style) */}
              <div className="mobile-nav-toggle-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (activeMenu) closeMenu();
                    setMobileMenuOpen(!mobileMenuOpen);
                  }}
                  className="mobile-nav-toggle-odoo text-slate-800 hover:text-slate-950 p-1 border-0 bg-transparent shadow-none ring-0 outline-none focus:outline-none"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                  
                  {/* Desktop Directory Header */}
                  <div className="hidden lg:flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                        Solutions & Application Directory
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Integrated industrial platforms, ERP modules, IoT telemetry and field operations
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeMenu}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label="Close Solutions Menu"
                    >
                      <span>Close</span>
                      <X size={14} />
                    </button>
                  </div>

                  {/* Flat Clean Minimalist Grid Layout - 2 columns on mobile (4 rows of 2 sections), responsive on sm/lg */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2 xs:gap-x-3 sm:gap-x-8 gap-y-3.5 sm:gap-y-8 lg:gap-x-10 lg:gap-y-9 py-1 sm:py-2">
                    {SOLUTION_CATEGORIES.map((cat, catIdx) => {
                      const config = SOLUTION_CATEGORY_CONFIG[cat.title] || {
                        icon: Layers,
                        color: 'text-slate-700',
                        bg: 'bg-slate-50 border-slate-200/70'
                      };
                      const CatIcon = config.icon;

                      return (
                        <div 
                          key={catIdx} 
                          className="flex flex-col group/category min-w-0"
                        >
                          {/* Category Header */}
                          <div className="flex items-center justify-between pb-1 sm:pb-2.5 mb-1 sm:mb-2 border-b border-slate-200/70 gap-1">
                            <div className="flex items-center gap-1 sm:gap-2.5 min-w-0 flex-1">
                              <div className={`w-[18px] h-[18px] xs:w-[20px] xs:h-[20px] sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center shrink-0 border ${config.bg} ${config.color} transition-transform group-hover/category:scale-105 duration-200`}>
                                <CatIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-[15px] sm:h-[15px]" />
                              </div>
                              <h3 className="text-[9px] xs:text-[10px] sm:text-[13px] font-bold tracking-tight sm:tracking-wider text-slate-900 uppercase truncate font-sans">
                                {cat.title}
                              </h3>
                            </div>
                            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[11px] font-semibold text-slate-500 bg-slate-100/90 border border-slate-200/70 px-1 py-0.2 sm:px-2 sm:py-0.5 rounded-full shrink-0">
                              {cat.items.length} Apps
                            </span>
                          </div>

                          {/* Associated Apps List directly on Section Background */}
                          <div className="space-y-0.5">
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
                                className="group/item flex items-center gap-1 sm:gap-2 px-0.5 sm:px-2 py-0.5 sm:py-1.5 rounded-md sm:rounded-lg cursor-pointer select-none transition-colors duration-150 hover:bg-slate-50 active:bg-slate-100 min-w-0"
                                role="button"
                                tabIndex={0}
                              >
                                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-300 group-hover/item:bg-blue-600 transition-colors shrink-0" />
                                <span className="text-[10px] xs:text-[11px] sm:text-[13px] font-medium text-slate-700 group-hover/item:text-slate-950 truncate transition-colors leading-tight">
                                  {item.name}
                                </span>
                              </div>
                            ))}
                          </div>
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
                  
                  {/* Desktop Tech Header */}
                  <div className="hidden lg:flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                        Enterprise Technology & Cloud Stack
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enterprise stack architecture, industrial protocols, edge telemetry and distributed logic
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeMenu}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label="Close Technology Menu"
                    >
                      <span>Close</span>
                      <X size={14} />
                    </button>
                  </div>

                  {/* Flat Clean Minimalist Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7 sm:gap-y-8 lg:gap-x-10 lg:gap-y-9 py-2">
                    {TECHNOLOGY_CATEGORIES.map((cat, catIdx) => {
                      const config = TECH_CATEGORY_CONFIG[cat.title] || {
                        icon: Server,
                        color: 'text-slate-700',
                        bg: 'bg-slate-50 border-slate-200/70'
                      };
                      const CatIcon = config.icon;

                      return (
                        <div 
                          key={catIdx} 
                          className="flex flex-col group/category"
                        >
                          {/* Category Header */}
                          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200/70">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${config.bg} ${config.color} transition-transform group-hover/category:scale-105 duration-200`}>
                                <CatIcon size={15} />
                              </div>
                              <h3 className="text-xs sm:text-[13px] font-bold tracking-wider text-slate-900 uppercase truncate font-sans">
                                {cat.title}
                              </h3>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100/90 border border-slate-200/70 px-2 py-0.5 rounded-full shrink-0 ml-2">
                              {cat.items.length} Tech
                            </span>
                          </div>

                          {/* Associated Tech Items directly on Section Background */}
                          <div className="space-y-1">
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
                                className="group/item flex items-start gap-2 px-2 py-1.5 rounded-lg cursor-pointer select-none transition-colors duration-150 hover:bg-slate-50 active:bg-slate-100"
                                role="button"
                                tabIndex={0}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/item:bg-blue-600 transition-colors shrink-0 mt-1.5" />
                                <div className="min-w-0 flex-1">
                                  <span className="text-[13px] font-medium text-slate-700 group-hover/item:text-slate-950 transition-colors block leading-snug">
                                    {item.label}
                                  </span>
                                  <p className="text-[11.5px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
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
                  
                  {/* Desktop Industry Header */}
                  <div className="hidden lg:flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                        Industry Verticals & Deployments
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Field-proven operational systems across smart facilities, rural commerce and manufacturing fleets
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeMenu}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label="Close Industries Menu"
                    >
                      <span>Close</span>
                      <X size={14} />
                    </button>
                  </div>

                  {/* Flat Clean Minimalist Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7 sm:gap-y-8 lg:gap-x-10 lg:gap-y-9 py-2">
                    {INDUSTRY_CATEGORIES.map((cat, catIdx) => {
                      const config = INDUSTRY_CATEGORY_CONFIG[cat.title] || {
                        icon: Building2,
                        color: 'text-slate-700',
                        bg: 'bg-slate-50 border-slate-200/70'
                      };
                      const CatIcon = config.icon;

                      return (
                        <div 
                          key={catIdx} 
                          className="flex flex-col group/category"
                        >
                          {/* Category Header */}
                          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200/70">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${config.bg} ${config.color} transition-transform group-hover/category:scale-105 duration-200`}>
                                <CatIcon size={15} />
                              </div>
                              <h3 className="text-xs sm:text-[13px] font-bold tracking-wider text-slate-900 uppercase truncate font-sans">
                                {cat.title}
                              </h3>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100/90 border border-slate-200/70 px-2 py-0.5 rounded-full shrink-0 ml-2">
                              {cat.items.length} Verticals
                            </span>
                          </div>

                          {/* Associated Industry Items directly on Section Background */}
                          <div className="space-y-1">
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
                                className="group/item flex items-start gap-2 px-2 py-1.5 rounded-lg cursor-pointer select-none transition-colors duration-150 hover:bg-slate-50 active:bg-slate-100"
                                role="button"
                                tabIndex={0}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/item:bg-blue-600 transition-colors shrink-0 mt-1.5" />
                                <div className="min-w-0 flex-1">
                                  <span className="text-[13px] font-medium text-slate-700 group-hover/item:text-slate-950 transition-colors block leading-snug">
                                    {item.label}
                                  </span>
                                  <p className="text-[11.5px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
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
                <span>Contact Us</span>
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
          padding: 0.75rem 1rem max(1.25rem, calc(0.85rem + env(safe-area-inset-bottom, 0px)));
          gap: 0.3rem;
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
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
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
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 1.5px 7px;
          border-radius: 9999px;
          background-color: #EBF3FC;
          color: #0B3A70;
          flex-shrink: 0;
        }

        .mobile-nav-action-wrap {
          padding-top: 0.35rem;
          border-top: 1px solid #F1F5F9;
          margin-top: 0.25rem;
        }

        .mobile-nav-action-btn {
          width: 100%;
          padding: 0.55rem 1rem;
          border-radius: 9999px;
          background-color: #FC787D;
          color: #FFFFFF;
          font-weight: 600;
          font-size: 0.875rem;
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
            max-width: 1240px !important;
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
            padding: 0.65rem 0.6rem 1.5rem;
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

        /* Navbar Header & Brand Logo Responsive Styling */
        .nav-header-full {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 1.75rem;
          box-sizing: border-box;
        }

        .nav-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 62px;
          position: relative;
          width: 100%;
        }

        .nav-logo-wrap {
          display: flex;
          align-items: center;
          cursor: pointer;
          z-index: 10;
          user-select: none;
          padding: 3px 0;
          transition: opacity 0.2s ease, transform 0.15s ease;
        }
        .nav-logo-wrap:hover {
          opacity: 0.88;
        }
        .nav-logo-wrap:active {
          transform: scale(0.98);
        }

        .nav-logo-img {
          height: 27px;
          width: auto;
          max-width: 135px;
          object-fit: contain;
          display: block;
          transition: height 0.2s ease, max-width 0.2s ease;
        }

        /* ========================================================================= */
        /* ODOO-STYLE CLEAN ENTERPRISE HEADER STYLES */
        /* ========================================================================= */

        /* Desktop Nav Link Container */
        .desktop-nav {
          display: none;
          align-items: center;
          gap: 0.25rem;
          margin: 0;
          padding: 0;
        }

        /* Minimalist Nav Links (Clean text, no button box on hover) */
        .nav-link-odoo {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.5rem 0.75rem;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14.5px;
          font-weight: 500;
          letter-spacing: -0.012em;
          color: #475569;
          background: transparent !important;
          border: none;
          outline: none;
          border-radius: 6px;
          cursor: pointer;
          user-select: none;
          transition: color 0.15s ease, background-color 0.15s ease;
          line-height: 1.25;
          -webkit-font-smoothing: antialiased;
        }

        .nav-link-odoo:hover,
        .nav-link-odoo:focus,
        .nav-link-odoo:focus-visible {
          color: #FC787D;
          background: rgba(252, 120, 125, 0.04) !important;
          outline: none;
        }

        .nav-link-odoo:active {
          color: #E86368;
          background: rgba(252, 120, 125, 0.08) !important;
        }

        .nav-link-odoo-active {
          color: #FC787D !important;
          font-weight: 600 !important;
          letter-spacing: -0.012em;
          background: rgba(252, 120, 125, 0.06) !important;
        }

        /* Smooth Rotating Chevron for Dropdown Links */
        .nav-link-chevron {
          color: #94A3B8;
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease;
        }

        .nav-link-odoo:hover .nav-link-chevron {
          color: #FC787D;
        }

        .nav-link-odoo-active .nav-link-chevron {
          color: #FC787D;
        }

        .nav-link-chevron-open {
          transform: rotate(180deg);
          color: #FC787D !important;
        }

        /* Odoo Right Actions Group */
        .desktop-nav-actions {
          display: none;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-action-text-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.45rem 0.75rem;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: #475569;
          background: transparent !important;
          border: none;
          outline: none;
          border-radius: 6px;
          cursor: pointer;
          transition: color 0.15s ease, background-color 0.15s ease;
          -webkit-font-smoothing: antialiased;
        }

        .nav-action-text-btn:hover,
        .nav-action-text-btn:focus,
        .nav-action-text-btn:active {
          color: #FC787D;
          background: rgba(252, 120, 125, 0.04) !important;
          outline: none;
        }

        .nav-action-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          padding: 0.5rem 1.15rem;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #FFFFFF;
          background-color: #FC787D; /* Primary brand red */
          border: 1px solid transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease;
          box-shadow: 0 1px 2px rgba(252, 120, 125, 0.15);
          -webkit-font-smoothing: antialiased;
        }

        .nav-action-primary-btn:hover {
          background-color: #E86368;
          box-shadow: 0 2px 6px rgba(252, 120, 125, 0.25);
        }

        .nav-action-primary-btn:active {
          transform: scale(0.98);
        }

        /* Mobile Nav Toggle Button */
        .mobile-nav-toggle-wrap {
          display: flex;
          align-items: center;
        }

        .mobile-nav-toggle-odoo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          color: #1E293B;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          outline: none !important;
          cursor: pointer;
          transition: color 0.15s ease, opacity 0.15s ease;
        }

        .mobile-nav-toggle-odoo:hover {
          background-color: transparent !important;
          color: #0F172A;
          border: none !important;
          box-shadow: none !important;
        }

        .mobile-nav-toggle-odoo:active {
          background-color: transparent !important;
          opacity: 0.7;
          border: none !important;
          box-shadow: none !important;
        }

        /* Desktop Nav Breakpoint (>= 1024px) */
        @media (min-width: 1024px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-nav-actions {
            display: flex !important;
          }
          .mobile-nav-toggle-wrap {
            display: none !important;
          }
        }

        /* Tablet Nav Breakpoint (< 1024px) */
        @media (max-width: 1023px) {
          .nav-header-full {
            padding: 0 1.25rem;
          }
          .nav-header-inner {
            min-height: 58px;
          }
          .nav-logo-img {
            height: 24px;
            max-width: 120px;
          }
          .desktop-nav {
            display: none !important;
          }
          .desktop-nav-actions {
            display: none !important;
          }
          .mobile-nav-toggle-wrap {
            display: flex !important;
          }
        }

        /* Mobile Screen Breakpoint (< 640px) */
        @media (max-width: 639px) {
          .nav-header-full {
            padding: 0 1rem;
          }
          .nav-header-inner {
            min-height: 54px;
          }
          .nav-logo-img {
            height: 18px;
            max-width: 90px;
          }
        }

        /* Very Small Screens (< 360px) */
        @media (max-width: 359px) {
          .nav-header-full {
            padding: 0 0.75rem;
          }
          .nav-logo-img {
            height: 16px;
            max-width: 80px;
          }
        }

        /* Adaptive Sticky Sub-Navbars on detail pages when header hides/reveals */
        .sticky-subnav-ribbon {
          transition: top 0.32s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        html[data-nav-hidden="true"] .sticky-subnav-ribbon {
          top: 0px !important;
        }
      `}</style>
    </>
  );
}
