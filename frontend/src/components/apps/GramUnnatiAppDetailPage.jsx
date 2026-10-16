import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sprout, 
  ShoppingBag, 
  Store, 
  ShieldCheck, 
  Truck, 
  Users, 
  Tag, 
  Bell, 
  HelpCircle, 
  Image as ImageIcon, 
  TrendingUp, 
  Award, 
  Layers, 
  HeartHandshake, 
  Globe2, 
  Sparkles, 
  FileCheck2, 
  Package, 
  Percent, 
  Smartphone, 
  LayoutDashboard,
  Check,
  ChevronRight,
  ArrowUpRight,
  Search,
  CreditCard,
  BarChart3
} from 'lucide-react';

import { APPLICATIONS } from '../ApplicationsGridSection';
import { getAssetUrl } from '@/utils/asset';

// Realistic Smartphone Device Mockup Component
function MobileDeviceMockup({ imageSrc, alt, caption, badge, badgeColor = '#15803D', badgeBg = '#DCFCE7' }) {
  return (
    <div className="flex flex-col items-center justify-center w-full my-2">
      {badge && (
        <span 
          style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '3px 10px',
            borderRadius: '9999px',
            backgroundColor: badgeBg,
            color: badgeColor,
            marginBottom: '10px',
            display: 'inline-block'
          }}
        >
          {badge}
        </span>
      )}
      <div 
        style={{
          width: '100%',
          maxWidth: '280px',
          backgroundColor: '#0F172A',
          borderRadius: '36px',
          padding: '10px 10px 12px',
          boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
          position: 'relative',
          margin: '0 auto'
        }}
      >
        {/* Dynamic Island / Speaker Notch */}
        <div 
          style={{
            width: '76px',
            height: '14px',
            backgroundColor: '#0F172A',
            borderRadius: '0 0 10px 10px',
            margin: '-10px auto 6px',
            position: 'relative',
            zIndex: 10
          }}
        />
        {/* Inner Screen Container */}
        <div 
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            position: 'relative',
            border: '1px solid #334155'
          }}
        >
          <img 
            src={imageSrc} 
            alt={alt}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain'
            }}
            loading="lazy"
          />
        </div>
        {/* Bottom Home Indicator Bar */}
        <div 
          style={{
            width: '84px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.35)',
            borderRadius: '9999px',
            margin: '8px auto 2px'
          }}
        />
      </div>
      {caption && (
        <p style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '10px', textAlign: 'center', fontWeight: '500', maxWidth: '280px' }}>
          {caption}
        </p>
      )}
    </div>
  );
}

export default function GramUnnatiAppDetailPage({ onBack, onOpenExpertModal, onSelectApp }) {
  const [activeStakeholderTab, setActiveStakeholderTab] = useState('farmers');
  const [activeModuleTab, setActiveModuleTab] = useState('catalog');

  // Stakeholders Data from PDF
  const STAKEHOLDERS = {
    farmers: {
      title: 'Farmers (Producers & Buyers)',
      tagline: 'Direct marketplace access, transparent price discovery & yield maximization',
      accentColor: '#16A34A',
      bgColor: '#F0FDF4',
      borderColor: '#BBF7D0',
      icon: Sprout,
      challenges: [
        'Exploitation by local middlemen and non-transparent mandi commissions',
        'Lack of direct access to high-quality agri-inputs (certified seeds, fertilizers)',
        'Inability to reach broader regional and national urban consumer markets',
        'Distress selling during harvest peaks due to lack of immediate buyer linkages'
      ],
      solutions: [
        'Direct-to-buyer e-commerce marketplace with fair price discovery algorithms',
        'Village-to-global market reach through the GramUnnati digital ecosystem',
        'Integrated access to certified agri-inputs and modern farm equipment',
        'Real-time price trend alerts, combo harvest packages, and instant order tracking'
      ],
      metrics: [
        { label: 'Farmer Profit Uplift', value: '+35%', sub: 'Eliminating intermediaries' },
        { label: 'Input Cost Savings', value: '18%', sub: 'Direct manufacturer pricing' },
        { label: 'Payment Settlement', value: 'T+1', sub: 'Direct bank account transfer' }
      ]
    },
    industries: {
      title: 'Rural Micro-Industries & Entrepreneurs',
      tagline: 'Empowering village-level manufacturing, packaging & national trade',
      accentColor: '#0284C7',
      bgColor: '#F0F9FF',
      borderColor: '#BAE6FD',
      icon: Store,
      challenges: [
        'Limited geographic reach confined to nearby weekly village haats',
        'High compliance hurdles and difficulty establishing verifiable seller credentials',
        'Inability to compete with large industrial consumer FMCG brands',
        'Working capital bottlenecks and delayed receivable recovery cycles'
      ],
      solutions: [
        'Streamlined digital onboarding with document verification & KYC badges',
        'Branded digital storefronts showcasing local agro-processed goods & crafts',
        'B2B and B2C sales channels connecting to institutional buyers and urban retailers',
        'Automated order management, invoice generation, and courier tracking'
      ],
      metrics: [
        { label: 'Market Reach Expansion', value: '10x', sub: 'Pan-India consumer access' },
        { label: 'Order Processing Speed', value: '< 2 hrs', sub: 'From placement to dispatch' },
        { label: 'Revenue Growth', value: '+42%', sub: 'Within 6 months on platform' }
      ]
    },
    shg: {
      title: 'Women Self-Help Groups (SHGs)',
      tagline: 'Financial self-reliance, regular product creation & zero distress migration',
      accentColor: '#D97706',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A',
      icon: Users,
      challenges: [
        'Lack of formalized marketing channels for handmade rural foods and handicrafts',
        'Irregular production cycles due to unpredictable seasonal demand',
        'Dependence on local moneylenders and low financial autonomy for rural women',
        'Distress migration of families to urban construction hubs for survival wages'
      ],
      solutions: [
        'Formal marketplace listing for SHG food products, spices, honey, and textiles',
        'Predictable recurring demand aggregation to foster steady production schedules',
        'Direct bank account payouts fostering independent financial dignity for women',
        'Sustainable village livelihoods ensuring families remain together prosperously'
      ],
      metrics: [
        { label: 'SHG Women Empowered', value: '15,000+', sub: 'Active micro-entrepreneurs' },
        { label: 'Monthly Income Boost', value: '₹8.5k+', sub: 'Average recurring income' },
        { label: 'Village Retention', value: '98%', sub: 'Zero urban distress migration' }
      ]
    }
  };

  // 9 Core Modules extracted directly from PDF Section 7
  const CORE_MODULES = [
    {
      id: 'users',
      title: 'User Management & Role-Based Access',
      category: 'Security & Identities',
      icon: Users,
      badge: 'Core Identity',
      summary: 'Comprehensive registration, login, and profile lifecycle for Buyers, Sellers, and Admins with OTP authentication.',
      features: [
        'Multi-role access architecture (Farmer Buyer, Verified Seller, SHG Leader, Super Admin)',
        'Mobile OTP authentication with localized vernacular interface support',
        'Unified profile dashboard managing multiple farm locations and delivery addresses',
        'Detailed transaction history and tax-compliant digital GST billing archives'
      ]
    },
    {
      id: 'onboarding',
      title: 'Seller Onboarding & KYC Pipeline',
      category: 'Compliance & Verification',
      icon: FileCheck2,
      badge: 'Trust & Verification',
      summary: 'Rigorous document verification and certification workflow before merchants can list products.',
      features: [
        'Digital document upload portal for Aadhaar, PAN, GST, FSSAI, and Udyam certificates',
        'Super-Admin approval workflow with automated compliance status tracking',
        'Trust verification badge displayed on seller storefronts upon approval',
        'Automated bank account validation for direct electronic payout settlements'
      ]
    },
    {
      id: 'catalog',
      title: 'Master Product Catalog, Variants & Combos',
      category: 'Merchandising & Commerce',
      icon: Package,
      badge: 'Product Engine',
      summary: 'Centralized admin master taxonomy supporting complex multi-pack variants, weights, and value bundles.',
      features: [
        'Standardized central Product Master preventing duplicate or unverified listings',
        'Multi-variant support (e.g. 1kg, 5kg, 25kg bags, seed grades, cold-pressed purity)',
        'Curated seasonal agro-combo packages (e.g. Sowing Kit: Seeds + Bio-fertilizer + Spray)',
        'Rich media gallery with multi-angle crop photos, organic lab tests, and usage advisories'
      ]
    },
    {
      id: 'cart',
      title: 'Smart Shopping Cart & Order Processing',
      category: 'Checkout & Transactions',
      icon: ShoppingBag,
      badge: 'Checkout Engine',
      summary: 'Seamless multi-seller checkout with transparent GST computation and milestone-based order dispatch.',
      features: [
        'Multi-seller consolidated cart with real-time stock reservation locks',
        'Dynamic tax calculation supporting intra-state and inter-state GST rules',
        'Instant digital invoice generation with QR code payment verification',
        'Automated order splitting and routing to nearest regional fulfillment nodes'
      ]
    },
    {
      id: 'offers',
      title: 'Promotional Offers & Discount Coupon Engine',
      category: 'Growth & Incentives',
      icon: Percent,
      badge: 'Promotion System',
      summary: 'Dynamic discount and promotional campaign engine enabling sellers to run harvest flash sales.',
      features: [
        'Flat cash discount and percentage-based coupon generation tool for sellers',
        'Minimum order value thresholds and category-specific promotional rules',
        'Seasonal harvest coupon codes (Kharif/Rabi flash promotions)',
        'Admin-sponsored subsidy vouchers for smallholder farmers and SHG products'
      ]
    },
    {
      id: 'shipment',
      title: 'End-to-End Shipment & Logistics Tracking',
      category: 'Supply Chain Telemetry',
      icon: Truck,
      badge: 'Live Telemetry',
      summary: 'Comprehensive state-based delivery tracking from farm gate packaging to final customer doorstep.',
      features: [
        '5-stage live shipment progression: Placed -> Verified -> Dispatched -> In-Transit -> Delivered',
        'Integration with GramUnnati Middle-Mile Transporter & SHG Delivery fleets',
        'Real-time transit location updates with digital Proof-of-Delivery (e-POD)',
        'Automated SMS & push notifications on dispatch and out-for-delivery milestones'
      ]
    },
    {
      id: 'complaints',
      title: 'Automated Grievance & Complaint Redressal',
      category: 'Customer Protection',
      icon: HelpCircle,
      badge: 'Dispute Resolution',
      summary: 'Built-in ticketing mechanism enabling buyers to resolve quality, transit, or payment discrepancies quickly.',
      features: [
        'One-click ticket generation tied directly to specific order items and batch IDs',
        'Photo and video evidence upload for damaged packaging or seed germination issues',
        'Super-Admin mediation dashboard with strict SLA resolution timers (< 24 hrs)',
        'Automated refund and return dispatch management directly via escrow gateway'
      ]
    },
    {
      id: 'banners',
      title: 'Targeted Ad Banners & Regional Advisories',
      category: 'Marketing & Advisory',
      icon: ImageIcon,
      badge: 'Advisory Engine',
      summary: 'Targeted promotional banner system delivering region-specific agri-advisories and product highlights.',
      features: [
        'Location-aware promotional banners customized to specific district agro-climatic zones',
        'Government subsidy alerts and crop disease outbreak prevention advisories',
        'Click-through navigation directing farmers straight to featured product bundles',
        'Seasonal scheduling tools allowing pre-planned harvest festival banner campaigns'
      ]
    },
    {
      id: 'notifications',
      title: 'Real-Time Push Notifications (Firebase FCM)',
      category: 'Cloud Communication',
      icon: Bell,
      badge: 'Instant Alerts',
      summary: 'Sub-second real-time messaging pipeline keeping all stakeholders synchronized on order states.',
      features: [
        'Cloud-native Firebase Cloud Messaging (FCM) integration with high delivery rates',
        'Instant alerts for order approvals, price drop alerts, and payment receipts',
        'Critical weather warning notifications and mandi rate trend broadcasts',
        'Deep-linking notifications directly opening order tracking or product detail views'
      ]
    }
  ];

  // 7 Core Values from PDF Page 1-2
  const CORE_VALUES = [
    { title: 'Empowerment', desc: 'Enable rural women and youth to become successful local digital entrepreneurs.' },
    { title: 'Self-Reliance', desc: 'Create economic independence through village production, packaging, and distribution.' },
    { title: 'Transparency', desc: 'Build lasting trust through absolute honesty in pricing, transactions, and profits.' },
    { title: 'Sustainability', desc: 'Promote environmentally responsible local production and a resilient circular economy.' },
    { title: 'Technology for Good', desc: 'Make high-tech tools radically simple, localized, and accessible for social development.' },
    { title: 'Community Prosperity', desc: 'Align every business transaction with the holistic socio-economic growth of the village.' },
    { title: 'Cultural Pride', desc: 'Elevate authentic local rural crafts, traditional produce, and indigenous skills to global fame.' }
  ];

  // Connected Ecosystem Applications
  const CONNECTED_APPS = [
    { id: 'erp', name: 'ERP', tag: 'Core Enterprise ERP', desc: 'Double-entry accounting, GST engine & inventory', image: getAssetUrl('/ERP Logo.png') },
    { id: 'g-nova-iot', name: 'G-Nova IoT', tag: 'G-Nova Telemetry & 4M ERP', desc: 'Industrial telemetry and facility monitoring', image: getAssetUrl('/g-nova-clean.png') },
    { id: 'g-track', name: 'G Track', tag: 'Field Force & GPS Telemetry', desc: 'Real-time vehicle tracking & cold-chain monitoring', image: getAssetUrl('/G Track logo.png') },
    { id: 'task-management', name: 'SynkroBoard', tag: 'Task Management & Collaboration', desc: 'Enterprise sprint, kanban & RACI workflows', image: getAssetUrl('/synkroboard-clean.png') }
  ];

  const handleAppClick = (targetId) => {
    if (onSelectApp) {
      const found = APPLICATIONS.find(a => a.id === targetId) || { id: targetId };
      onSelectApp(found);
    } else {
      window.history.pushState({ page: 'app-detail', appId: targetId }, '', `/app/${targetId}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentStakeholder = STAKEHOLDERS[activeStakeholderTab];
  const StakeholderIcon = currentStakeholder.icon;

  return (
    <div style={{ backgroundColor: '#e8e8e8', minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#e8e8e8', paddingTop: '2.25rem', paddingBottom: '3rem', position: 'relative' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          


          {/* Headline matching Lora handwriting font style with #00A3FF brush underline */}
          <div className="relative inline-block">
            <h1 
              className="text-balance text-slate-900"
              style={{ 
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(1.75rem, 4.5vw, 3.87rem)',
                lineHeight: '1.15',
                letterSpacing: '0',
                paddingTop: '0.25rem',
                paddingBottom: '0.75rem',
                display: 'inline-block',
                position: 'relative',
                zIndex: 1,
                fontWeight: 600
              }}
            >
              <span>GramUnnati Agricultural </span>
              <br className="hidden sm:inline" />
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 font-semibold" style={{ color: '#FC787D' }}>
                  E-Commerce
                </span>
                {/* Hand-drawn marker brush stroke highlight */}
                <svg
                  className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4.5 pointer-events-none z-0 overflow-visible"
                  viewBox="0 0 260 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 4,14 Q 130,5 256,12 Q 130,20 6,17"
                    fill="#00A3FF"
                  />
                </svg>
              </span>
              <span className="text-slate-900 font-semibold"> & Rural Marketplace</span>
            </h1>

            {/* Floating App Logo Square Card with Hand-drawn Curved Arrow */}
            <div className="hidden sm:flex absolute -right-28 md:-right-36 lg:-right-44 bottom-1 md:bottom-2 items-end z-20 pointer-events-none">
              {/* Hand-drawn curved arrow pointing to the text in #7B5872 */}
              <svg
                className="w-14 h-10 md:w-16 md:h-12 lg:w-20 lg:h-14 pointer-events-none overflow-visible -mr-1 mb-2"
                viewBox="0 0 80 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 76 38 C 55 46, 24 38, 8 14"
                  stroke="#7B5872"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 6 24 L 8 12 L 20 16"
                  stroke="#7B5872"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>

              {/* App Logo Square Card */}
              <div 
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '22px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={getAssetUrl("/Final Logo-09.jpg.jpeg")} 
                  alt="GramUnnati Logo" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: 'scale(0.9)',
                    borderRadius: '12px'
                  }}
                />
              </div>
            </div>
          </div>

          <p 
            className="text-balance text-gray-600 font-normal"
            style={{ 
              fontSize: 'clamp(0.92rem, 1.58vw, 1.1rem)', 
              lineHeight: '1.65', 
              maxWidth: '780px',
              margin: '1.25rem auto 2.25rem',
              position: 'relative',
              zIndex: 1,
              fontWeight: 400
            }}
          >
            All-in-one agricultural e-commerce ecosystem connecting farmers, rural micro-enterprises, and Self-Help Groups with verified buyers, quality agri-inputs, transparent pricing, and direct bank payouts.
          </p>

          {/* Action Button styled in #7B5872 with matching pill radius */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3.75rem', position: 'relative', zIndex: 1 }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                padding: '0.85rem 2.15rem',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                fontWeight: '500',
                backgroundColor: '#7B5872',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(123, 88, 114, 0.35)'
              }}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <span>Request Platform Demo</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* 4 Impact Metric Highlights Ribbon */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
              gap: '1rem',
              maxWidth: '960px',
              margin: '0 auto',
              position: 'relative',
              zIndex: 1
            }}
          >
            {[
              { val: '+35%', label: 'Farmer Net Profit', sub: 'Zero middleman commission leakage' },
              { val: '100%', label: 'KYC Verified Sellers', sub: 'Aadhaar, GST & FSSAI certified' },
              { val: '150+', label: 'Agro Categories', sub: 'Seeds, bio-nutrients & craft goods' },
              { val: '0%', label: 'Distress Migration', sub: 'Dignified village livelihood creation' }
            ].map((stat, i) => (
              <div 
                key={i}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #CBD5E1',
                  padding: '1.25rem 1rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A', lineHeight: 1 }}>
                  {stat.val}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginTop: '6px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Farmer Onboarding App Spotlight: Your Farming Companion */}
          <div 
            style={{
              marginTop: '3.5rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #CBD5E1',
              padding: '2.5rem 2rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
              textAlign: 'left'
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Smartphone Mockup */}
              <div className="lg:col-span-5 flex justify-center">
                <MobileDeviceMockup 
                  imageSrc={getAssetUrl('/gramunnati-farmer-onboarding.png')}
                  alt="GramUnnati Mobile App - Farmer Welcome and Onboarding Screen"
                  caption="Mobile Onboarding: Your Digital Farming Companion"
                  badge="Mobile Gateway"
                  badgeColor="#15803D"
                  badgeBg="#DCFCE7"
                />
              </div>

              {/* Concise Explanation */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <span style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  FARMER ONBOARDING EXPERIENCE
                </span>
                <h3 
                  style={{ 
                    fontFamily: "'Lora', serif", 
                    fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)', 
                    fontWeight: 600, 
                    color: '#0F172A', 
                    letterSpacing: '0',
                    lineHeight: '1.25',
                    marginBottom: '1rem' 
                  }}
                >
                  Your Digital Farming Companion: Essential Inputs at Your Doorstep
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.65', marginBottom: '1.25rem' }}>
                  The GramUnnati mobile application welcomes farmers and rural growers into an intuitive digital agricultural hub. Designed for simplicity, the introductory interface empowers cultivators to discover all essential farming supplies without navigating complicated menus or travel hurdles.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                  {[
                    { title: 'Comprehensive Input Discovery', desc: 'Browse certified seeds, fertilizers, and crop-protection bio-pesticides curated for local regional soil.' },
                    { title: 'Doorstep Delivery Assurance', desc: 'Essential farming products brought directly to village communities, eliminating expensive middleman logistics.' },
                    { title: 'Flexible Getting Started Flow', desc: 'Quick access to Sign In or Sign Up, alongside a convenient "Remind me Later" option to explore the app at any pace.' }
                  ].map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D', flexShrink: 0, marginTop: '2px' }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A' }}>{feat.title}: </span>
                        <span style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: '1.5' }}>{feat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.9rem', borderRadius: '9999px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', fontSize: '0.8rem', fontWeight: '600' }}>
                    <Sprout size={14} />
                    <span>Vernacular Friendly</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.9rem', borderRadius: '9999px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>
                    <Truck size={14} />
                    <span>Village Doorstep Fulfillment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. EXECUTIVE SUMMARY & RURAL VISION (EXTENDED FULL-BLEED TO RIGHT VIEWPORT) */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#FFFFFF', 
          borderTop: '1px solid #CBD5E1', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '4.5rem 0 5rem',
          maxWidth: 'min(100%, calc(50vw + 560px))',
          marginRight: 0,
          marginLeft: 'auto',
          borderTopLeftRadius: '28px',
          borderBottomLeftRadius: '28px',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          boxShadow: '-8px 12px 32px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{ 
            maxWidth: '1120px', 
            margin: '0 auto', 
            paddingLeft: '1.5rem',
            paddingRight: 'max(1.5rem, calc((100vw - 1120px) / 2 + 1.5rem))' 
          }}
        >
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              EXECUTIVE OVERVIEW & PROBLEM STATEMENT
            </span>
            <h2 style={{ 
              fontFamily: "'Lora', serif", 
              fontSize: 'clamp(1.35rem, 3.5vw, 2.16rem)', 
              fontWeight: 600, 
              color: '#0F172A', 
              letterSpacing: '0', 
              display: 'block', 
              marginTop: '4px' 
            }}>
              Bridging the Rural Economy with Modern Digital Commerce
              <span style={{ 
                display: 'block', 
                height: '4px', 
                backgroundColor: '#D97706', 
                borderRadius: '2px', 
                width: '60px', 
                marginTop: '6px' 
              }} />
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
            
            {/* The Problem Card */}
            <div 
              style={{
                backgroundColor: '#FFF7ED',
                border: '1px solid #FFEDD5',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FDBA74', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A3412' }}>
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#9A3412', margin: 0 }}>The Rural Challenge</h3>
                  <p style={{ fontSize: '0.78rem', color: '#C2410C', margin: 0 }}>Fragmented markets & middleman exploitation</p>
                </div>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#7C2D12', lineHeight: '1.65', marginBottom: '1rem' }}>
                Farmers, rural micro-industries, and Self-Help Groups lack transparent access to fair marketplaces. Geographic isolation forces producers to sell through multiple commission agents, forfeiting up to 40% of their earned margins.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Opaque local mandi price setting without real-time benchmark telemetry',
                  'Inaccessible certified agri-inputs leading to poor crop yield and quality',
                  'High urban distress migration due to lack of stable village livelihoods'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#9A3412' }}>
                    <span style={{ color: '#EA580C', fontWeight: 'bold' }}>✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Solution Card */}
            <div 
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #DCFCE7',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14532D' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#14532D', margin: 0 }}>The GramUnnati Solution</h3>
                  <p style={{ fontSize: '0.78rem', color: '#15803D', margin: 0 }}>Unified 3-tier digital commerce ecosystem</p>
                </div>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#166534', lineHeight: '1.65', marginBottom: '1rem' }}>
                GramUnnati delivers an all-in-one agricultural e-commerce platform tailored for rural trade. Featuring Buyer Mobile App, Seller Mobile App, and Central Admin Dashboard for end-to-end order routing, transparent escrow payments, and live logistics tracking.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Direct digital seller storefronts with verified KYC compliance',
                  'Central Master Product Catalog supporting multi-pack variants & combo packs',
                  'Integrated shipment tracking with direct T+1 electronic bank settlements'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#14532D' }}>
                    <Check size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Rural Vision & 7 Core Values */}
          <div 
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '22px',
              border: '1px solid #E2E8F0',
              padding: '2.25rem',
              marginBottom: '1rem'
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                <Sparkles size={14} color="#D97706" />
                <span>Our Guiding Rural Vision</span>
              </div>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0F172A', lineHeight: '1.6', margin: 0 }}>
                "To build a self-reliant, prosperous, and self-sufficient rural India where every family earns a dignified livelihood within their own village and there is zero need to migrate to cities."
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
              {CORE_VALUES.map((val, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '14px',
                    padding: '1.1rem',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                    {val.title}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE 3 CORE STAKEHOLDER TRANSFORMATIONS (TABS & DEEP-DIVE) */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#e8e8e8', padding: '4.5rem 0 5rem', borderBottom: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              STAKEHOLDER GOALS & VALUE CREATION
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.16rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px' }}>
              Tailored Impact Across the Rural Value Chain
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '680px', margin: '0.5rem auto 0', lineHeight: '1.6' }}>
              Explore how GramUnnati unlocks unprecedented economic leverage and fair trade for farmers, micro-industries, and women self-help collectives.
            </p>
          </div>

          {/* Stakeholder Switcher Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'farmers', label: 'Farmers (Producers & Buyers)', icon: Sprout },
              { id: 'industries', label: 'Rural Micro-Industries', icon: Store },
              { id: 'shg', label: 'Women Self-Help Groups (SHGs)', icon: Users }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isSelected = activeStakeholderTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStakeholderTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.75rem 1.4rem',
                    borderRadius: '9999px',
                    border: isSelected ? '1.5px solid #0F172A' : '1px solid #CBD5E1',
                    backgroundColor: isSelected ? '#0F172A' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? '600' : '500',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 14px rgba(15, 23, 42, 0.15)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <IconComp size={16} color={isSelected ? '#FFFFFF' : '#64748B'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Stakeholder Card */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: `1.5px solid ${currentStakeholder.borderColor}`,
              padding: '2.5rem',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
              <div 
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  backgroundColor: currentStakeholder.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentStakeholder.accentColor,
                  border: `1px solid ${currentStakeholder.borderColor}`
                }}
              >
                <StakeholderIcon size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  {currentStakeholder.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', margin: '2px 0 0' }}>
                  {currentStakeholder.tagline}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              
              {/* Challenges */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#DC2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Traditional System Pain Points</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentStakeholder.challenges.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
                      <span style={{ color: '#EF4444', fontWeight: 'bold' }}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* GramUnnati Enabled Solutions */}
              <div style={{ backgroundColor: currentStakeholder.bgColor, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${currentStakeholder.borderColor}` }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: currentStakeholder.accentColor, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} />
                  <span>GramUnnati Enabled Outcomes</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentStakeholder.solutions.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', color: '#1E293B', lineHeight: '1.5' }}>
                      <Check size={16} color={currentStakeholder.accentColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Stakeholder Metrics Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem' }}>
              {currentStakeholder.metrics.map((m, idx) => (
                <div key={idx} style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: currentStakeholder.accentColor }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0F172A', marginTop: '2px' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    {m.sub}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Easy Registration & Account Access Showcase */}
          <div 
            style={{
              marginTop: '2.5rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1.5px solid #CBD5E1',
              padding: '2.5rem 2rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Concise Explanation */}
              <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
                <span style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  STREAMLINED ACCOUNT ACCESS
                </span>
                <h3 
                  style={{ 
                    fontFamily: "'Lora', serif", 
                    fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)', 
                    fontWeight: 600, 
                    color: '#0F172A', 
                    letterSpacing: '0',
                    lineHeight: '1.25',
                    marginBottom: '1rem' 
                  }}
                >
                  Start Your Farming Journey: Fast & Hassle-Free Mobile Sign-Up
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.65', marginBottom: '1.25rem' }}>
                  Getting started on GramUnnati is designed specifically for rural ease. Cultivators register directly with their 10-digit mobile number, agreeing to transparent Terms and Privacy Policies to unlock quick and easy farming solutions.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                  {[
                    { title: 'Standard Mobile Number Login', desc: 'Pre-configured country code (+91) with rapid mobile digit entry without demanding unnecessary personal paperwork upfront.' },
                    { title: 'One-Tap Policy Agreement', desc: 'Integrated Terms & Conditions and Privacy Policy consent checkbox protecting user data and digital platform rights.' },
                    { title: 'Direct OTP Verification', desc: 'Instant "Get OTP" action triggers a one-time passcode for secure, passwordless authentication tailored for rural mobile connectivity.' }
                  ].map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D', flexShrink: 0, marginTop: '2px' }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A' }}>{feat.title}: </span>
                        <span style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: '1.5' }}>{feat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.9rem', borderRadius: '9999px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', fontSize: '0.8rem', fontWeight: '600' }}>
                    <ShieldCheck size={14} />
                    <span>Passwordless OTP Login</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.9rem', borderRadius: '9999px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>
                    <Users size={14} />
                    <span>Instant Account Creation</span>
                  </div>
                </div>
              </div>

              {/* Smartphone Mockup */}
              <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
                <MobileDeviceMockup 
                  imageSrc={getAssetUrl('/gramunnati-farmer-registration.png')}
                  alt="GramUnnati Mobile App - Start Your Farming Journey Registration Screen"
                  caption="Mobile Registration: Start your farming journey"
                  badge="Simple Sign-Up"
                  badgeColor="#15803D"
                  badgeBg="#DCFCE7"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. THE 3-TIER PLATFORM ECOSYSTEM (BUYER APP, SELLER APP, ADMIN DASHBOARD) */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '4.5rem 0 5rem', borderBottom: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              END-TO-END APPLICATION ECOSYSTEM
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.16rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px' }}>
              3 Specialized Interfaces. One Connected Platform.
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '680px', margin: '0.5rem auto 0', lineHeight: '1.6' }}>
              Purpose-built digital applications tailored for on-the-ground rural buyers, local merchant sellers, and centralized enterprise governance.
            </p>
          </div>

          {/* 1. Buyer Mobile Application Showcase */}
          <div 
            style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              marginBottom: '2.5rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Smartphone Mockup */}
              <div className="lg:col-span-5 flex justify-center">
                <MobileDeviceMockup 
                  imageSrc={getAssetUrl('/gramunnati-buyer-marketplace.png')}
                  alt="GramUnnati Buyer Mobile App - Product Discovery and Marketplace Screen"
                  caption="Buyer Marketplace: Product Discovery, Prices & Cart"
                  badge="Buyer App Interface"
                  badgeColor="#15803D"
                  badgeBg="#DCFCE7"
                />
              </div>

              {/* Description & Features */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D' }}>
                    <Smartphone size={22} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#15803D', backgroundColor: '#DCFCE7', padding: '3px 12px', borderRadius: '20px' }}>
                    Buyer Mobile Application
                  </span>
                </div>

                <h3 
                  style={{ 
                    fontFamily: "'Lora', serif", 
                    fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)', 
                    fontWeight: 600, 
                    color: '#0F172A', 
                    letterSpacing: '0',
                    lineHeight: '1.25',
                    marginBottom: '1rem' 
                  }}
                >
                  Agricultural Shopping, Instant Search & One-Tap Cart Checkout
                </h3>

                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.65', marginBottom: '1.25rem' }}>
                  The Buyer Mobile Application offers a smooth, consumer-grade shopping experience designed for farmers, rural families, and bulk institutional buyers. Customers easily search the catalog, view certified product specifications, inspect clear prices, and add items directly to their cart.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                  {[
                    { title: 'Keyword Search & Filtering', desc: 'Fast search bar for agricultural inputs including fertilizers, composts, and seasonal produce.' },
                    { title: 'Transparent Farm Produce Catalog', desc: 'Browse curated product cards (e.g. Goa Mango, Farm Fresh Products) with upfront unit pricing (₹100) and favorite lists.' },
                    { title: 'Instant Add to Cart', desc: 'Direct cart additions enabling fast basket accumulation and consolidated order checkout.' },
                    { title: 'Dedicated Bottom Navigation', desc: 'Intuitive bottom menu providing immediate one-touch switching between Home, Orders, Local Weather/Temp, Cart, and Profile.' }
                  ].map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D', flexShrink: 0, marginTop: '2px' }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A' }}>{feat.title}: </span>
                        <span style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: '1.5' }}>{feat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.9rem', borderRadius: '9999px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', fontSize: '0.8rem', fontWeight: '600' }}>
                    <ShoppingBag size={14} />
                    <span>Instant Cart Checkout</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.9rem', borderRadius: '9999px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>
                    <Search size={14} />
                    <span>Live Input Search</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Seller Mobile Application Showcase */}
          <div 
            style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              marginBottom: '2.5rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Description & Features */}
              <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7' }}>
                    <Store size={22} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0284C7', backgroundColor: '#E0F2FE', padding: '3px 12px', borderRadius: '20px' }}>
                    Merchant App Interface
                  </span>
                </div>

                <h3 
                  style={{ 
                    fontFamily: "'Lora', serif", 
                    fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)', 
                    fontWeight: 600, 
                    color: '#0F172A', 
                    letterSpacing: '0',
                    lineHeight: '1.25',
                    marginBottom: '1rem' 
                  }}
                >
                  Revenue Analytics, Store Overview & Merchant Operations
                </h3>

                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.65', marginBottom: '1.25rem' }}>
                  The Seller Mobile Application equips village producers, farmer cooperatives, and rural agro-dealers with complete control over their commercial storefront. Merchants review real-time revenue stats, track store catalog status, and fulfill incoming orders with ease.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                  {[
                    { title: 'Live Revenue Analytics', desc: 'Real-time Total Revenue review (with flexible period filters like "Today", Weekly, or All-Time) and visual daily trend tracking.' },
                    { title: 'Store Overview & Catalog Health', desc: 'Instant breakdown of Total Active Products vs. Total Inactive Products with direct "View All Products" inventory management.' },
                    { title: 'Centralized Business Navigation', desc: 'Dedicated bottom bar tabs for rapid access to Home, Products, Orders, Payments, and Merchant Profile.' },
                    { title: 'Order Fulfillment & Payouts', desc: 'Track incoming buyer orders, update packaging status, and monitor digital payment settlements directly to linked bank accounts.' }
                  ].map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7', flexShrink: 0, marginTop: '2px' }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A' }}>{feat.title}: </span>
                        <span style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: '1.5' }}>{feat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.9rem', borderRadius: '9999px', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', color: '#0284C7', fontSize: '0.8rem', fontWeight: '600' }}>
                    <BarChart3 size={14} />
                    <span>Real-Time Revenue Telemetry</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.9rem', borderRadius: '9999px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.8rem', fontWeight: '600' }}>
                    <CreditCard size={14} />
                    <span>Direct Bank Settlements</span>
                  </div>
                </div>
              </div>

              {/* Smartphone Mockup */}
              <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
                <MobileDeviceMockup 
                  imageSrc={getAssetUrl('/gramunnati-seller-dashboard.png')}
                  alt="GramUnnati Seller Mobile App - Revenue and Store Overview Dashboard Screen"
                  caption="Seller Dashboard: Revenue Analytics & Store Overview"
                  badge="Seller App Interface"
                  badgeColor="#0284C7"
                  badgeBg="#E0F2FE"
                />
              </div>
            </div>
          </div>

          {/* 3. Central Admin Dashboard */}
          <div 
            style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '22px',
              padding: '2.25rem 2rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
            }}
            className="hover:border-purple-300 transition-colors"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333EA' }}>
                    <LayoutDashboard size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9333EA', backgroundColor: '#F3E8FF', padding: '3px 10px', borderRadius: '20px' }}>
                      Super Admin Portal
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: '4px 0 0' }}>
                      Central Admin Dashboard
                    </h3>
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                  Unified cloud control center enabling enterprise administrators to govern users, verify seller compliance, oversee dispute resolution, and broadcast targeted push campaigns.
                </p>
              </div>

              <div className="lg:col-span-7">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '10px' }}>
                  {[
                    'Seller document verification & approval pipeline',
                    'Master Product Catalog taxonomy governance',
                    'Targeted regional ad banner & advisory manager',
                    'Firebase FCM push notification broadcaster',
                    'Complaint ticket mediation & refund approval system'
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#334155', backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <Check size={14} color="#9333EA" style={{ flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. THE 9 FUNCTIONAL MODULES MATRIX (DIRECT FROM PDF SECTION 7 & 9) */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#e8e8e8', padding: '4.5rem 0 5rem', borderBottom: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              PLATFORM SPECIFICATIONS & CORE CAPABILITIES
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.16rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px' }}>
              The 9 Core Architectural Functional Modules
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '680px', margin: '0.5rem auto 0', lineHeight: '1.6' }}>
              Engineered for extreme reliability, low bandwidth rural network tolerance, and multi-tenant security across millions of transactions.
            </p>
          </div>

          {/* 9 Modules Interactive Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {CORE_MODULES.map((mod) => {
              const IconComp = mod.icon;
              return (
                <div 
                  key={mod.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '18px',
                    padding: '1.75rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  className="hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                      <IconComp size={22} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: '700', color: '#0B3A70', backgroundColor: '#EBF3FC', padding: '2px 8px', borderRadius: '6px' }}>
                      {mod.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.4rem' }}>
                    {mod.title}
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: '1.5', marginBottom: '1.25rem', flex: 1 }}>
                    {mod.summary}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                    {mod.features.map((feat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.78rem', color: '#334155', lineHeight: '1.4' }}>
                        <span style={{ color: '#16A34A', fontWeight: 'bold' }}>•</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. BEFORE VS AFTER COMPARISON MATRIX */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '4.5rem 0 5rem', borderBottom: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              TRANSFORMATION BENCHMARKS
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.16rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px' }}>
              Traditional Rural Trade vs. GramUnnati Digital Platform
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '680px', margin: '0.5rem auto 0', lineHeight: '1.6' }}>
              Measurable operational and financial advantages delivered by digitizing the agricultural supply chain.
            </p>
          </div>

          <div 
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>
                    <th style={{ padding: '1rem 1.25rem', fontWeight: '600' }}>Operational Dimension</th>
                    <th style={{ padding: '1rem 1.25rem', fontWeight: '600', color: '#FCA5A5' }}>Traditional Village Mandi</th>
                    <th style={{ padding: '1rem 1.25rem', fontWeight: '600', color: '#86EFAC' }}>GramUnnati Digital Platform</th>
                    <th style={{ padding: '1rem 1.25rem', fontWeight: '600', color: '#93C5FD' }}>Direct Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { dim: 'Price Discovery', old: 'Dictated by local commission agents & middlemen', neu: 'Algorithmic fair pricing based on regional demand', imp: '+28% to 35% higher realization' },
                    { dim: 'Market Reach', old: 'Restricted to nearby 10-15 km weekly haats', neu: 'Pan-India direct-to-consumer & B2B digital storefront', imp: '10x market footprint' },
                    { dim: 'Agri-Input Sourcing', old: 'Counterfeit risk, uncertified seeds, inflated rates', neu: 'Direct manufacturer catalog with verified lab reports', imp: '18% input cost savings' },
                    { dim: 'Payment Cycle', old: 'Deferred 30-60 days with frequent bad debts', neu: 'Instant escrow settlement upon digital POD (T+1)', imp: '100% liquidity certainty' },
                    { dim: 'Women SHG Participation', old: 'Isolated artisan sales with zero formal branding', neu: 'Dedicated SHG micro-enterprise store listings', imp: '15,000+ women self-reliant' },
                    { dim: 'Dispute Redressal', old: 'No formal recourse for damaged or spoiled goods', neu: 'Integrated complaint ticketing with < 24h SLA', imp: '99.4% resolution rate' }
                  ].map((row, idx) => (
                    <tr 
                      key={idx}
                      style={{ 
                        borderBottom: idx < 5 ? '1px solid #E2E8F0' : 'none',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                      }}
                    >
                      <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#0F172A' }}>{row.dim}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#991B1B' }}>✕ {row.old}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#166534', fontWeight: '600' }}>✓ {row.neu}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#0B3A70', fontWeight: '700' }}>{row.imp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. CONNECTED ECOSYSTEM APPLICATIONS */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#e8e8e8', padding: '4rem 0 4.5rem', borderBottom: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              INTEGRATED PLATFORM ARCHITECTURE
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 2.64vw, 1.98rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px' }}>
              Seamlessly Connected to the G Mark Ecosystem
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONNECTED_APPS.map((app, idx) => (
              <div 
                key={idx}
                onClick={() => handleAppClick(app.id)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '1.15rem 1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease',
                  minHeight: '88px'
                }}
                className="hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div 
                  style={{
                    width: '56px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <img 
                    src={app.image} 
                    alt={app.name} 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block'
                    }} 
                  />
                </div>
                <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ 
                    fontSize: '0.98rem', 
                    fontWeight: '700', 
                    color: '#0F172A', 
                    margin: '0 0 3px', 
                    letterSpacing: '-0.01em',
                    lineHeight: '1.25' 
                  }}>
                    {app.name}
                  </h4>
                  <p style={{ 
                    fontSize: '0.76rem', 
                    color: '#C2410C', 
                    fontWeight: '600', 
                    margin: 0, 
                    lineHeight: '1.35',
                    letterSpacing: '0.01em'
                  }}>
                    {app.tag}
                  </p>
                </div>
                <ChevronRight 
                  size={18} 
                  className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" 
                />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. BOTTOM ACTION CTA BANNER */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '5rem 0 5.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.35rem 0.9rem', borderRadius: '20px', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
            <Sprout size={14} />
            <span>DEPLOY GRAMUNNATI IN YOUR REGION</span>
          </div>

          <h2 style={{ 
            fontFamily: "'Lora', serif", 
            fontSize: 'clamp(1.5rem, 3.7vw, 2.64rem)', 
            fontWeight: 600, 
            color: '#0F172A', 
            letterSpacing: '0', 
            lineHeight: 1.15,
            marginBottom: '1rem' 
          }}>
            <span>Empower Farmers, Rural Enterprises & </span>
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 text-slate-900 font-semibold">
                Self-Help Groups
              </span>
              <svg
                className="absolute -bottom-1 left-0 w-full h-3 pointer-events-none z-0 overflow-visible"
                viewBox="0 0 260 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M 4,14 Q 130,5 256,12 Q 130,20 6,17"
                  fill="#00A3FF"
                />
              </svg>
            </span>
          </h2>

          <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: '1.6', margin: 0, marginBottom: '2.5rem', maxWidth: '680px', marginLeft: 'auto', marginRight: 'auto' }}>
            Schedule an interactive platform consultation to explore custom FPO onboarding, SHG federation integrations, and rural commerce deployment blueprints.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: '500',
                backgroundColor: '#7B5872',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 10px rgba(123, 88, 114, 0.28)'
              }}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <span>Schedule Platform Consultation</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={onBack}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: '500',
                backgroundColor: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              className="hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Solutions</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
