import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Smartphone, 
  QrCode, 
  Truck, 
  ShieldCheck, 
  Layers, 
  Wallet, 
  Server,
  RefreshCw,
  Users,
  ArrowRight,
  ChevronDown,
  Sparkles,
  PackageCheck,
  KeyRound,
  Store,
  Home,
  HeartHandshake,
  TrendingUp,
  Leaf,
  BellRing,
  RotateCcw,
  Maximize2,
  X,
  ChevronRight
} from 'lucide-react';
import { APPLICATIONS } from '../ApplicationsGridSection';
import { getAssetUrl } from '@/utils/asset';

export default function ShgAppDetailPage({ onBack, onOpenExpertModal, onSelectApp }) {
  const [activeStepP1, setActiveStepP1] = useState(0); // active accordion step for Phase 1
  const [activeStepP2, setActiveStepP2] = useState(0); // active accordion step for Phase 2
  const [selectedScreenIndex, setSelectedScreenIndex] = useState(0); // active screen tab
  const [previewImage, setPreviewImage] = useState(null); // zoom modal

  const metricPills = [
    { label: '₹15 / Completed Order', sub: 'Instant Commission Credit', icon: Wallet },
    { label: '100% OTP Proof', sub: 'Secure Doorstep Handover', icon: KeyRound },
    { label: 'Real-Time GHub Sync', sub: 'Batch & Hub Movement', icon: RefreshCw },
    { label: 'Simple Mobile UI', sub: 'Self-Help Group Optimized', icon: Smartphone }
  ];

  // Real App Screenshots from public folder
  const appScreens = [
    {
      id: 'onboarding',
      title: 'Partner Onboarding',
      subtitle: 'Connecting Villages With Faster Deliveries',
      badge: 'Welcome Screen',
      image: getAssetUrl('/shg2.jpeg'),
      description: 'Clean onboarding interface empowering Self-Help Group members with key benefits: Easy Pickups, Wide Area Coverage, Faster Deliveries, and Timely Earnings.',
      highlights: [
        'Accessible registration for rural women SHG members',
        'Direct connection to village clusters & rural sellers',
        'Intuitive multilingual navigation'
      ]
    },
    {
      id: 'dashboard',
      title: 'Activity Dashboard',
      subtitle: 'Daily Earnings & Scheduled Tasks',
      badge: 'Home Overview',
      image: getAssetUrl('/shg4.jpeg'),
      description: 'Personalized dashboard displaying real-time monthly earnings (e.g. ₹12,750.00), today’s income, this week’s progress, upcoming scheduled pickups, and delivery runs.',
      highlights: [
        'Total monthly & daily earnings metrics widget',
        'Upcoming scheduled pickup & delivery time slots',
        'Quick access to recent order lifecycle events'
      ]
    },
    {
      id: 'order-mgmt',
      title: 'Order Management',
      subtitle: 'Real-time Batch & Hub Transfers',
      badge: 'Logistics Control',
      image: getAssetUrl('/shg1.jpeg'),
      description: 'Comprehensive operational board categorizing orders into Incoming (for processing), Upcoming, Return / RTO Items, Redirected, and Completed deliveries.',
      highlights: [
        'Multi-status order tracking (Incoming, Return, Redirected)',
        'Detailed origin-destination manifests (e.g. Nesari → Transporter)',
        'Weight and item count verification at a glance'
      ]
    },
    {
      id: 'earnings',
      title: 'Earnings Ledger',
      subtitle: 'Transparent Income & Payout Tracking',
      badge: 'Financial Autonomy',
      image: getAssetUrl('/shg3.jpeg'),
      description: 'Transparent commission wallet providing breakdown of completed orders, verified ₹15/order rate, and daily/weekly/monthly payout statements.',
      highlights: [
        'Guaranteed ₹15 payout for every verified completed order',
        'Filterable income view (Today, This Week, This Month)',
        'Direct ledger integration with village SHG bank accounts'
      ]
    }
  ];

  // Core Values from PDF Section 6
  const coreValues = [
    {
      title: 'Empowerment',
      desc: 'Enable SHG members to participate in organized digital delivery operations and build technological confidence.',
      icon: HeartHandshake,
      color: '#16A34A',
      bg: '#DCFCE7'
    },
    {
      title: 'Self-Reliance',
      desc: 'Create recurring income opportunities for local women and youth through structured logistics tasks (₹15/order).',
      icon: TrendingUp,
      color: '#0284C7',
      bg: '#E0F2FE'
    },
    {
      title: 'Transparency',
      desc: 'Provide crystal-clear order assignments, live status tracking, and automated commission ledger logs.',
      icon: ShieldCheck,
      color: '#9333EA',
      bg: '#F3E8FF'
    },
    {
      title: 'Technology for Good',
      desc: 'Keep mobile workflows simple, lightweight, and accessible to non-technical rural users across regional languages.',
      icon: Smartphone,
      color: '#EA580C',
      bg: '#FFEDD5'
    },
    {
      title: 'Community Prosperity',
      desc: 'Strengthen the grassroots role of Self-Help Groups within GramUnnati’s expanding rural supply chain.',
      icon: Users,
      color: '#D97706',
      bg: '#FEF3C7'
    },
    {
      title: 'Sustainability',
      desc: 'Support efficient, consolidated local movement of farm harvests and artisan products to eliminate empty miles.',
      icon: Leaf,
      color: '#059669',
      bg: '#D1FAE5'
    }
  ];


  // Phase 1 Workflow Steps
  const phase1Steps = [
    {
      num: '1',
      title: 'Seller Doorstep Visit & Inspection',
      tag: 'Pickup Assignment',
      desc: 'SHG representative receives notification on the Gkart app, visits the rural producer or farmer’s home, and verifies product condition.',
      desc2: 'Confirms item count, inspects packaging integrity, and affixes the standardized GMU barcode label.',
      status: 'PICKUP_SHG_ACCEPTED',
      icon: Home
    },
    {
      num: '2',
      title: 'Barcode / QR Scan & Weight Registration',
      tag: 'Camera Scanner Engine',
      desc: 'SHG opens the camera scanner interface, scans the affixed parcel QR label, and logs the gross verified weight.',
      desc2: 'Status transitions in real-time to PICKUP_SHG_PICKED, establishing initial chain-of-custody in the cloud database.',
      status: 'PICKUP_SHG_PICKED',
      icon: QrCode
    },
    {
      num: '3',
      title: 'Staging at Village Center Node',
      tag: 'Local Aggregation',
      desc: 'Collected parcels are securely staged at the local village SHG center awaiting scheduled middle-mile transport.',
      desc2: 'Inventory view tracks all staged parcels grouped by destination hub pincodes.',
      status: 'VILLAGE_NODE_STAGED',
      icon: Layers
    },
    {
      num: '4',
      title: 'Transporter Scan & Custody Handover',
      tag: 'Middle-Mile Handoff',
      desc: 'Transporter vehicle arrives at the village node. The transporter scans the barcode to take physical custody of the batch.',
      desc2: 'Custody transfers from SHG to Transporter vehicle manifest, en route to the GMU Central Hub.',
      status: 'PICKUP_TRANSPORTER_LOADED',
      icon: Truck
    }
  ];

  // Phase 2 Workflow Steps
  const phase2Steps = [
    {
      num: '1',
      title: 'Transporter Batch Ingestion at Node',
      tag: 'Inbound Batch Arrival',
      desc: 'Regional transporter drops consolidated parcel batches at the destination village SHG center.',
      desc2: 'SHG receives batch arrival notification with assigned local doorstep delivery routes.',
      status: 'DROP_BATCH_ARRIVED',
      icon: Truck
    },
    {
      num: '2',
      title: 'SHG Inbound Barcode Verification',
      tag: 'Custody Transfer',
      desc: 'SHG representative scans each incoming parcel barcode to verify parcel integrity and accept custody.',
      desc2: 'App populates the buyer address, contact navigation, and optimal village delivery sequence.',
      status: 'DROP_SHG_ACCEPTED',
      icon: QrCode
    },
    {
      num: '3',
      title: 'Doorstep Delivery Run to Buyer',
      tag: 'Final Mile Dispatch',
      desc: 'SHG representative carries the verified package directly to the buyer’s home doorstep.',
      desc2: 'Presents the package for buyer physical inspection prior to final confirmation.',
      status: 'OUT_FOR_DELIVERY',
      icon: Home
    },
    {
      num: '4',
      title: '4-Digit OTP Confirmation & Instant Payout',
      tag: 'Tamper-Proof Handover',
      desc: 'Buyer provides the secret 4-digit OTP sent to their mobile. SHG inputs OTP into the app for instant cryptographic validation.',
      desc2: 'Order transitions to DROP_SHG_DELIVERED, closing the lifecycle and instantly crediting ₹15 commission to the SHG wallet.',
      status: 'DROP_SHG_DELIVERED',
      icon: KeyRound
    }
  ];

  const ecosystemComponents = [
    {
      title: 'Buyer & Seller Commerce Apps',
      desc: 'Create, catalog, and manage the underlying rural e-commerce orders and farm produce demand.',
      badge: 'Demand Generation',
      icon: Store
    },
    {
      title: 'GHub Central Logistics Engine',
      desc: 'Central command cloud for automated order assignment, route optimization, and middle-mile oversight.',
      badge: 'Central Core',
      icon: Server
    },
    {
      title: 'Gkart (SHG Delivery App)',
      desc: 'SHG-side mobile client for first-mile farmer pickups, village node staging, and doorstep deliveries.',
      badge: 'SHG Operations',
      icon: Smartphone
    },
    {
      title: 'GKart (Transporter Fleet App)',
      desc: 'Transporter-side mobile application for regional middle-mile batch hauling and hub transfers.',
      badge: 'Middle Mile',
      icon: Truck
    }
  ];

  return (
    <div style={{ backgroundColor: '#e8e8e8', minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ========================================================================= */}
      {/* 1. HERO HEADER (FIRST PAGE - WHITE WITH GREY CURVATURE ARC) */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#FFFFFF', 
          textAlign: 'center', 
          paddingTop: 'clamp(1.25rem, 2.5vw, 2rem)', 
          paddingBottom: 'clamp(2.5rem, 4vw, 3.75rem)', 
          paddingLeft: '1.5rem', 
          paddingRight: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle top subtle grid background */}
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
            backgroundSize: '4rem 4rem'
          }}
        />

        {/* Horizon Curvature Arc in Grey (#e8e8e8) */}
        <div
          className="absolute left-1/2 top-[calc(100%-140px)] sm:top-[calc(100%-165px)] md:top-[calc(100%-190px)] lg:top-[calc(100%-210px)] 
          h-[480px] w-[700px] md:h-[550px] md:w-[1100px] lg:h-[750px] lg:w-[140%] 
          -translate-x-1/2 rounded-[100%] border-t border-slate-300/40 bg-[#e8e8e8] 
          shadow-[0_-20px_50px_rgba(0,0,0,0.06)] pointer-events-none z-0"
          style={{
            backgroundColor: '#e8e8e8'
          }}
        />

        <div style={{ maxWidth: '920px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          




          {/* Headline matching Lora handwriting font style and #00A3FF brush underline */}
          <div className="relative inline-block">
            <h1 
              className="text-balance text-slate-900"
              style={{ 
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(1.75rem, 4.5vw, 3.87rem)',
                lineHeight: '1.18',
                letterSpacing: '-0.01em',
                paddingTop: '0.25rem',
                paddingBottom: '0.75rem',
                display: 'inline-block',
                position: 'relative',
                zIndex: 1,
                fontWeight: 600
              }}
            >
              <span>Gkart – Self-Help Group </span>
              <br className="hidden sm:inline" />
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 font-semibold" style={{ color: '#FC787D' }}>
                  Delivery Partner App
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
            </h1>

            {/* Floating App Logo Square Card with Hand-drawn Curved Arrow */}
            <div className="hidden sm:flex absolute -right-28 md:-right-36 lg:-right-44 bottom-1 md:bottom-2 items-end z-20 pointer-events-none">
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

              <div 
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '22px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={getAssetUrl("/SHG Delivary and Transporter Logo 01.jpg")} 
                  alt="SHG App Logo" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: 'scale(1.22)',
                    borderRadius: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          <p 
            className="text-balance text-gray-700 font-normal"
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
            Connecting rural Self-Help Groups (SHGs) with GramUnnati’s centralized GHub logistics platform to manage assigned orders, coordinate pickups, update live movement, and execute verified doorstep deliveries.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3.75rem', position: 'relative', zIndex: 1 }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                padding: '0.85rem 2rem',
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
              <span>Schedule Logistics Demo</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Support Highlights Ribbon */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
              gap: '0.85rem',
              maxWidth: '880px',
              margin: '0 auto',
              position: 'relative',
              zIndex: 10,
              paddingTop: '0.5rem'
            }}
          >
            {metricPills.map((pill, idx) => {
              const IconC = pill.icon;
              return (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '16px',
                    padding: '0.95rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconC size={18} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#0F172A', lineHeight: 1.15 }}>
                      {pill.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '400', marginTop: '2px' }}>
                      {pill.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>


      {/* ========================================================================= */}
      {/* 2. VISUAL ODOO-STYLE SHOWCASE 1: "DELIVER WITH CONFIDENCE & CLARITY" */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderTop: '1px solid #CBD5E1',
          borderBottom: '1px solid #CBD5E1', 
          padding: '4.5rem 0 5.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Odoo Style Heading with Floating Sticky Note */}
          <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
            <div className="inline-block relative">
              
              {/* Floating Executive Quote Sticky Note (Top-Right matching reference) */}
              <div className="hidden sm:flex absolute -top-12 sm:-top-14 -right-4 md:-right-24 z-20 items-start">
                <div className="relative">
                  {/* Speech Bubble Icon on Top */}
                  <div className="absolute -top-4 left-6 z-30">
                    <div className="w-6 h-6 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-xs">
                      💬
                    </div>
                  </div>
                  
                  {/* Yellow folded note backing */}
                  <div 
                    style={{
                      backgroundColor: '#F59E0B',
                      borderRadius: '16px',
                      padding: '4px',
                      boxShadow: '0 10px 25px rgba(245, 158, 11, 0.28)',
                      transform: 'rotate(2.5deg)'
                    }}
                  >
                    <div 
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}
                    >
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#16A34A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px', flexShrink: 0 }}>
                        <span style={{ fontSize: '13px' }}>₹</span>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: '600', color: '#1E293B', margin: 0, lineHeight: 1.3, fontStyle: 'italic' }}>
                          "₹15 direct commission credit for every verified OTP doorstep handover!"
                        </p>
                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '500' }}>
                          — Self-Help Group Logistics Partner
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Headline */}
              <h2 style={{ 
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(1.94rem, 3.7vw, 2.82rem)', 
                fontWeight: 700, 
                color: '#0F172A',
                letterSpacing: '0',
                lineHeight: 1.2,
                margin: 0,
                display: 'inline-flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.35em'
              }}>
                <span>Deliver with</span>

                {/* "confidence" with green highlighter brush background */}
                <span className="relative inline-block px-3 py-0.5 my-1">
                  <span 
                    className="absolute inset-0 rounded-md"
                    style={{ 
                      backgroundColor: '#16A34A', 
                      transform: 'skewX(-4deg) rotate(-1.5deg)',
                      opacity: 0.95
                    }} 
                  />
                  <span className="relative z-10 text-white font-bold">
                    confidence
                  </span>
                </span>

                <span>& real-time</span>

                {/* "clarity" with cyan brush underline */}
                <span className="relative inline-block">
                  <span className="relative z-10" style={{ color: '#0F172A' }}>
                    clarity
                  </span>
                  <svg
                    className="absolute -bottom-1.5 left-0 w-full h-3 pointer-events-none z-0 overflow-visible"
                    viewBox="0 0 100 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 2,7 Q 50,1 98,6 Q 50,11 2,8"
                      fill="#00D2B4"
                    />
                  </svg>
                </span>
              </h2>
            </div>

            <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: '660px', margin: '1.25rem auto 0', fontWeight: 400 }}>
              Explore the four core mobile screens powering Self-Help Group pickups, batch assignments, earnings telemetry, and doorstep order closures.
            </p>
          </div>

          {/* Interactive Screen Tab Switcher */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
            {appScreens.map((screen, idx) => {
              const isSelected = selectedScreenIndex === idx;
              return (
                <button
                  key={screen.id}
                  onClick={() => setSelectedScreenIndex(idx)}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '100px',
                    fontSize: '0.86rem',
                    fontWeight: isSelected ? '600' : '500',
                    backgroundColor: isSelected ? '#0F172A' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    border: `1px solid ${isSelected ? '#0F172A' : '#CBD5E1'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(15, 23, 42, 0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  className="hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: isSelected ? '#FFFFFF' : '#94A3B8' 
                  }} />
                  <span>{screen.title}</span>
                </button>
              );
            })}
          </div>

          {/* Main Elevated Application Window Frame */}
          <div className="relative w-full max-w-5xl mx-auto">
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid #CBD5E1',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.12), 0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}
            >
              {/* Browser Header Bar */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                padding: '0.85rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                </div>
                
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: '#475569',
                  backgroundColor: '#FFFFFF',
                  padding: '4px 14px',
                  borderRadius: '100px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                  <span>Gkart Mobile Client / {appScreens[selectedScreenIndex].title}</span>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: '700', letterSpacing: '0.04em' }}>
                  ● LIVE GHUB CLOUD SYNC
                </div>
              </div>

              {/* Main Showcase Split Body */}
              <div style={{ padding: '2rem', backgroundColor: '#F8FAFC' }}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Feature Content & Highlights (5 cols) */}
                  <div className="lg:col-span-6 flex flex-col justify-center">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: '700', 
                        color: '#16A34A', 
                        backgroundColor: '#DCFCE7', 
                        padding: '4px 12px', 
                        borderRadius: '100px', 
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase'
                      }}>
                        {appScreens[selectedScreenIndex].badge}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '500' }}>
                        Screen {selectedScreenIndex + 1} of {appScreens.length}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.65rem', fontWeight: '700', color: '#0F172A', lineHeight: '1.25', margin: '0 0 4px' }}>
                      {appScreens[selectedScreenIndex].title}
                    </h3>
                    
                    <p style={{ fontSize: '0.92rem', color: '#16A34A', fontWeight: '600', margin: '0 0 1rem' }}>
                      {appScreens[selectedScreenIndex].subtitle}
                    </p>

                    <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.65', margin: '0 0 1.5rem' }}>
                      {appScreens[selectedScreenIndex].description}
                    </p>

                    {/* Bullet Highlights */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
                      {appScreens[selectedScreenIndex].highlights.map((h, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                            <CheckCircle2 size={14} />
                          </div>
                          <span style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.5', fontWeight: '500' }}>
                            {h}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Quick Screen Pill Selectors */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                      {appScreens.map((sc, i) => (
                        <button
                          key={sc.id}
                          onClick={() => setSelectedScreenIndex(i)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: selectedScreenIndex === i ? '#0F172A' : '#FFFFFF',
                            color: selectedScreenIndex === i ? '#FFFFFF' : '#64748B',
                            border: '1px solid #CBD5E1',
                            cursor: 'pointer'
                          }}
                        >
                          {i + 1}. {sc.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: High-Res Elevated Phone Mockup (6 cols) */}
                  <div className="lg:col-span-6 flex justify-center items-center">
                    <div 
                      className="relative group cursor-pointer"
                      onClick={() => setPreviewImage(appScreens[selectedScreenIndex])}
                      style={{
                        width: '100%',
                        maxWidth: '340px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '36px',
                        padding: '12px',
                        border: '8px solid #0F172A',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1) inset',
                        position: 'relative'
                      }}
                    >
                      {/* Phone Speaker / Camera Notch */}
                      <div 
                        style={{
                          width: '90px',
                          height: '18px',
                          backgroundColor: '#0F172A',
                          borderRadius: '0 0 12px 12px',
                          margin: '-12px auto 8px',
                          position: 'relative',
                          zIndex: 20
                        }}
                      />

                      {/* Screen Image Container */}
                      <div 
                        style={{
                          width: '100%',
                          height: '520px',
                          borderRadius: '24px',
                          overflow: 'hidden',
                          backgroundColor: '#F1F5F9',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <img 
                          src={appScreens[selectedScreenIndex].image} 
                          alt={appScreens[selectedScreenIndex].title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />

                        {/* Hover Zoom Prompt Overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-sm rounded-2xl">
                          <Maximize2 size={18} />
                          <span>Click to Zoom</span>
                        </div>
                      </div>

                      {/* Phone Bottom Home Bar Indicator */}
                      <div 
                        style={{
                          width: '110px',
                          height: '4px',
                          backgroundColor: '#CBD5E1',
                          borderRadius: '4px',
                          margin: '10px auto 2px'
                        }}
                      />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Zoom Modal */}
          <AnimatePresence>
            {previewImage && (
              <div 
                onClick={() => setPreviewImage(null)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative flex flex-col items-center"
                >
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                  >
                    <X size={18} />
                  </button>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                    {previewImage.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#16A34A', fontWeight: '600', marginBottom: '1rem' }}>
                    {previewImage.subtitle}
                  </p>
                  <div style={{ maxHeight: '75vh', overflowY: 'auto', borderRadius: '16px', border: '1px solid #CBD5E1' }}>
                    <img src={previewImage.image} alt={previewImage.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.5 VISUAL ODOO-STYLE SHOWCASE 2: "NO MANUAL PAPERWORK! JUST VERIFIED SCANS" */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#FFFFFF', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '4.5rem 0 5.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Odoo Style Handwritten Dual-Line Heading with Cross and Check Badges */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            
            {/* Line 1: No manual paperwork */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <span 
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  border: '2px solid #EF4444',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
              >
                ✕
              </span>
              <span style={{
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(1.5rem, 2.82vw, 2.07rem)',
                fontWeight: 700,
                color: '#EF4444',
                letterSpacing: '0',
                lineHeight: 1.2
              }}>
                No manual registers or unverified handovers!
              </span>
            </div>

            {/* Line 2: Just instant barcode scans & verified OTP payouts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: '0.25rem' }}>
              <span 
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  border: '2px solid #16A34A',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
              >
                ✓
              </span>
              <span style={{
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(1.58rem, 2.99vw, 2.2rem)',
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '0',
                lineHeight: 1.2
              }}>
                Just instant QR scans, 4-digit OTPs & guaranteed ₹15 payouts!
              </span>
            </div>

            <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: '640px', margin: '0.75rem auto 0', fontWeight: 400 }}>
              Tailored specifically for rural Self-Help Group members with large touch targets, high contrast, and automatic wallet credit upon delivery.
            </p>
          </div>

          {/* Centerpiece Showcase with Overlapping Highlight Card & Curved Arrow */}
          <div className="relative w-full max-w-4xl mx-auto">
            
            {/* Overlapping Highlight Card (Top-Left) */}
            <div className="hidden md:flex absolute -top-6 -left-6 z-30 items-center">
              <div 
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '12px 18px',
                  border: '1.5px solid #CBD5E1',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
                    Automated Commission
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A' }}>
                    ₹12,750.00 <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: '600' }}>Earned</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Highlight Card (Bottom-Right) with Hand-Drawn Arrow */}
            <div className="hidden md:flex absolute -bottom-6 -right-6 z-30 items-center gap-3">
              <svg 
                className="w-16 h-12 text-slate-700 pointer-events-none overflow-visible"
                viewBox="0 0 70 45" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M 6 36 C 25 44, 45 32, 58 10" 
                  stroke="#16A34A" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  fill="none"
                />
                <path 
                  d="M 48 8 L 60 8 L 62 20" 
                  stroke="#16A34A" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none"
                />
              </svg>
              <div 
                style={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '12px 18px',
                  boxShadow: '0 12px 30px rgba(15,23,42,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <KeyRound size={20} style={{ color: '#4ADE80' }} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '600' }}>
                    4-Digit Verification
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#FFFFFF' }}>
                    100% Tamper-Proof Delivery
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Showcase Feature Banner Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {[
                {
                  icon: QrCode,
                  title: 'Instant QR/Barcode Scan',
                  desc: 'High-speed camera scanner engine logs verified package weight and transfers custody instantly.',
                  color: '#16A34A',
                  bg: '#DCFCE7'
                },
                {
                  icon: RefreshCw,
                  title: 'Real-Time GHub Sync',
                  desc: 'Central command cloud automatically routes batch assignments to local village SHG staging nodes.',
                  color: '#0284C7',
                  bg: '#E0F2FE'
                },
                {
                  icon: Wallet,
                  title: 'Automated Commission Wallet',
                  desc: 'Guaranteed ₹15 rate per completed delivery credited directly into transparent digital ledger statements.',
                  color: '#9333EA',
                  bg: '#F3E8FF'
                }
              ].map((feat, idx) => {
                const IconC = feat.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '20px',
                      padding: '1.75rem',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                    className="hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: feat.bg, color: feat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconC size={22} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                      {feat.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.55', margin: 0 }}>
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 3. PROBLEM & SOLUTION STATEMENT (PDF SECTIONS 1, 2, 3, 4, 5) */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#e8e8e8', padding: '5.5rem 0', borderTop: '1px solid #CBD5E1', borderBottom: '1px solid #CBD5E1' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 mb-20 lg:mb-24">
            {/* Problem Statement Card */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '20px', padding: '2.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '100px', backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '0.78rem', fontWeight: '700', marginBottom: '1rem' }}>
                <span>1. PROBLEM STATEMENT</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.75rem' }}>
                Fragmented Rural Delivery Workflows
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: '1.7' }}>
                Self-Help Groups need a simple digital system to receive delivery-related work, manage assigned orders, coordinate pickups, and update order progress in real-time while supporting GramUnnati's rural delivery network.
              </p>
            </div>

            {/* Our Solution Card */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '20px', padding: '2.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '100px', backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '0.78rem', fontWeight: '700', marginBottom: '1rem' }}>
                <span>2. OUR SOLUTION</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.75rem' }}>
                The Gkart SHG Mobile Platform
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: '1.7' }}>
                Gkart provides SHG delivery partners with a mobile application to manage assigned pickup and delivery activities, update order statuses, coordinate with the GHub logistics platform, and support reliable movement of orders between sellers, hubs, and customers.
              </p>
            </div>
          </div>

          {/* Dual Goals Grid (Self-Help Groups vs GramUnnati Logistics) */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '24px', padding: '2.75rem 2.5rem', boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginTop: '0' }}>
                Aligned for Grassroots Empowerment & Supply Chain Velocity
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
              {/* For SHGs */}
              <div style={{ padding: '1.75rem 2rem', borderRadius: '16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} />
                  <span>Goals for Self-Help Groups</span>
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    'Receive and manage assigned logistics orders on mobile.',
                    'Coordinate pickup and delivery activities through a simplified workflow.',
                    'Update order status in real time as shipments move through each stage.',
                    'Support local logistics and sustainable delivery-related income for SHG members.'
                  ].map((goal, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: '#334155', lineHeight: '1.5' }}>
                      <CheckCircle2 size={16} style={{ color: '#16A34A', marginTop: '3px', flexShrink: 0 }} />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* For GramUnnati Logistics */}
              <div style={{ padding: '1.75rem 2rem', borderRadius: '16px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1E40AF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={20} />
                  <span>Goals for GramUnnati Logistics</span>
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    'Connect SHG delivery partners directly with the centralized GHub system.',
                    'Maintain complete visibility of order movement and operational status.',
                    'Support coordinated pickup, node staging, hub transfers, and final delivery.',
                    'Guarantee tamper-proof proof of delivery via 4-digit buyer OTP confirmation.'
                  ].map((goal, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: '#334155', lineHeight: '1.5' }}>
                      <CheckCircle2 size={16} style={{ color: '#2563EB', marginTop: '3px', flexShrink: 0 }} />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CORE VALUES (PDF SECTION 6) */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '5rem 0' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              SECTION 6 • GUIDING PRINCIPLES
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.8rem, 3.17vw, 2.42rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px' }}>
              Our Core Operating Values
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '650px', margin: '0.5rem auto 0', lineHeight: '1.6' }}>
              Designed to uplift rural micro-entrepreneurs while building a dependable, transparent supply chain infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((val, idx) => {
              const IconC = val.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                  className="hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: val.bg, color: val.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconC size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    {val.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.55', margin: 0 }}>
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>



      {/* ========================================================================= */}
      {/* 6. PHASE 1: FIRST-MILE COLLECTION (CURVED RIGHT SECTION) */}
      {/* ========================================================================= */}
      <section 
        id="phase-1-section"
        style={{ 
          backgroundColor: '#e8e8e8', 
          padding: '3rem 0 3.5rem',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%'
        }}
      >
        <div 
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1040px',
            marginLeft: 'auto',
            marginRight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
          }}
        >
          {/* White Curved Background shape */}
          <div 
            className="absolute -top-4 sm:-top-6 md:-top-8 -bottom-4 sm:-bottom-6 md:-bottom-8 right-0 left-0 bg-white rounded-l-[24px] sm:rounded-l-[90px] md:rounded-l-[150px] lg:rounded-l-[180px] border-l border-y border-slate-300/70 shadow-[0_12px_44px_rgba(0,0,0,0.04)] pointer-events-none z-0"
            style={{ right: 0 }}
          />

          <div 
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              alignItems: 'flex-start'
            }}
            className="gap-6 sm:gap-8 lg:gap-10 py-5 sm:py-8 pl-4 sm:pl-14 md:pl-20 pr-3.5 sm:pr-6 md:pr-8"
          >
            
            {/* LEFT: Phase 1 Info */}
            <div className="w-full lg:max-w-[370px] flex flex-col gap-[0.85rem] shrink-0">
              <div>
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.07rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', lineHeight: '1.25', marginTop: '2px', marginBottom: '0.75rem' }}>
                  First-Mile Collection <br className="hidden sm:inline" />
                  & Transporter Pickup
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#16A34A', marginTop: '2px' }}>•</span>
                    <span>Visits producer home & verifies item condition</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#16A34A', marginTop: '2px' }}>•</span>
                    <span>Scans QR barcode & registers gross verified weight</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#16A34A', marginTop: '2px' }}>•</span>
                    <span>Stages collected goods at the local village SHG node</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#16A34A', marginTop: '2px' }}>•</span>
                    <span>Completes barcode custody handover to pickup transporter</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Phase 1 Process Steps */}
            <div className="relative w-full lg:max-w-[530px] shrink-0 min-w-0">
              <div 
                className="absolute left-[16px] sm:left-[20px] top-[20px] bottom-[20px] w-[2px] bg-slate-300 pointer-events-none" 
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {phase1Steps.map((step, index) => {
                  const isActive = activeStepP1 === index;
                  const IconComp = step.icon;

                  return (
                    <motion.div
                      key={step.num}
                      style={{ position: 'relative', display: 'flex', cursor: 'pointer', alignItems: 'flex-start' }}
                      className="gap-2.5 sm:gap-4"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                      onClick={() => setActiveStepP1(prev => prev === index ? -1 : index)}
                    >
                      <div
                        className="w-[34px] h-[34px] sm:w-[42px] sm:h-[42px] text-xs sm:text-sm font-medium"
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isActive ? '#16A34A' : '#94A3B8',
                          backgroundColor: isActive ? '#16A34A' : '#FFFFFF',
                          color: isActive ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.25s ease',
                          boxShadow: isActive ? '0 4px 12px rgba(22, 163, 74, 0.25)' : '0 2px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        <span>{step.num}</span>
                      </div>

                      <div
                        className="flex-1 min-w-0 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-200"
                        style={{
                          border: `1.5px solid ${isActive ? '#16A34A' : '#CBD5E1'}`,
                          backgroundColor: '#F8FAFC',
                          boxShadow: isActive ? '0 8px 24px -4px rgba(22, 163, 74, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" style={{ backgroundColor: isActive ? '#16A34A' : '#DCFCE7', color: isActive ? '#FFFFFF' : '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <IconComp size={15} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <span style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500', display: 'block' }}>
                                {step.tag}
                              </span>
                              <h3 style={{ fontSize: 'clamp(0.85rem, 2.2vw, 0.98rem)', fontWeight: 500, color: '#0F172A', margin: 0, lineHeight: '1.3', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                {step.title}
                              </h3>
                            </div>
                          </div>

                          <div 
                            className="w-6 h-6 sm:w-[26px] sm:h-[26px]"
                            style={{ 
                              borderRadius: '50%', 
                              backgroundColor: '#FFFFFF', 
                              border: '1px solid #E2E8F0',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: '#64748B',
                              transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.25s ease',
                              flexShrink: 0
                            }}
                          >
                            <ChevronDown size={13} />
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ paddingTop: '0.75rem', marginTop: '0.7rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.55', margin: 0 }}>
                                  {step.desc}
                                </p>
                                <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                                  {step.desc2}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginTop: '0.4rem', paddingTop: '0.45rem', borderTop: '1px dashed #CBD5E1' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>
                                    System Status:
                                  </span>
                                  <code style={{ fontSize: '0.7rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '4px', color: '#16A34A', fontWeight: '500', wordBreak: 'break-all' }}>
                                    {step.status}
                                  </code>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PHASE 2: LAST-MILE DELIVERY (CURVED LEFT SECTION) */}
      {/* ========================================================================= */}
      <section 
        id="phase-2-section"
        style={{ 
          backgroundColor: '#e8e8e8', 
          padding: '3rem 0 4rem',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%'
        }}
      >
        <div 
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1040px',
            marginRight: 'auto',
            marginLeft: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}
        >
          {/* White Curved Background shape */}
          <div 
            className="absolute -top-4 sm:-top-6 md:-top-8 -bottom-4 sm:-bottom-6 md:-bottom-8 left-0 right-0 bg-white rounded-r-[24px] sm:rounded-r-[90px] md:rounded-r-[150px] lg:rounded-r-[180px] border-r border-y border-slate-300/70 shadow-[0_12px_44px_rgba(0,0,0,0.04)] pointer-events-none z-0"
            style={{ left: 0 }}
          />

          <div 
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}
            className="gap-6 sm:gap-8 lg:gap-10 py-5 sm:py-8 pr-4 sm:pr-14 md:pr-20 pl-3.5 sm:pl-6 md:pl-8"
          >
            
            {/* LEFT: Phase 2 Process Steps */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '540px', flexShrink: 0, order: 1 }}>
              <div 
                className="absolute left-[16px] sm:left-[20px] top-[24px] bottom-[24px] w-[2px] bg-slate-300"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {phase2Steps.map((step, index) => {
                  const isActive = activeStepP2 === index;
                  const IconComp = step.icon;

                  return (
                    <motion.div
                      key={step.num}
                      style={{ position: 'relative', display: 'flex', cursor: 'pointer' }}
                      className="gap-2.5 sm:gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                      onClick={() => setActiveStepP2(prev => prev === index ? -1 : index)}
                    >
                      <div
                        className="w-[34px] h-[34px] sm:w-[42px] sm:h-[42px]"
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isActive ? '#16A34A' : '#94A3B8',
                          backgroundColor: isActive ? '#16A34A' : '#FFFFFF',
                          color: isActive ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.25s ease',
                          boxShadow: isActive ? '0 4px 12px rgba(22, 163, 74, 0.25)' : '0 2px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        <span className="text-xs sm:text-sm font-semibold">{step.num}</span>
                      </div>

                      <div
                        className="flex-1 min-w-0 p-3.5 sm:p-5"
                        style={{
                          borderRadius: '16px',
                          border: `1.5px solid ${isActive ? '#16A34A' : '#CBD5E1'}`,
                          backgroundColor: '#F8FAFC',
                          boxShadow: isActive ? '0 8px 24px -4px rgba(22, 163, 74, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                          transition: 'all 0.25s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: isActive ? '#16A34A' : '#DCFCE7', color: isActive ? '#FFFFFF' : '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <IconComp size={16} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', display: 'block' }}>
                                {step.tag}
                              </span>
                              <h3 style={{ fontSize: '0.98rem', fontWeight: '600', color: '#0F172A', margin: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                {step.title}
                              </h3>
                            </div>
                          </div>

                          <div 
                            style={{ 
                              width: '26px', 
                              height: '26px', 
                              borderRadius: '50%', 
                              backgroundColor: '#FFFFFF', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: '#64748B',
                              transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.25s ease',
                              flexShrink: 0
                            }}
                          >
                            <ChevronDown size={14} />
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ paddingTop: '0.85rem', marginTop: '0.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.6', margin: 0 }}>
                                  {step.desc}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.55', margin: 0 }}>
                                  {step.desc2}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #CBD5E1' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>
                                    System Status:
                                  </span>
                                  <code style={{ fontSize: '0.72rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '4px', color: '#16A34A', fontWeight: '600', wordBreak: 'break-all', maxWidth: '100%' }}>
                                    {step.status}
                                  </code>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Phase 2 Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', order: 2, width: '100%', maxWidth: '380px', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 3.5vw, 2.07rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', lineHeight: '1.2', marginTop: '2px', marginBottom: '0.75rem' }}>
                  Last-Mile Delivery <br className="hidden sm:inline" />
                  & Buyer OTP Verification
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.88rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#16A34A', marginTop: '2px' }}>•</span>
                    <span>Ingests consolidated transporter parcel batches at village node</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.88rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#16A34A', marginTop: '2px' }}>•</span>
                    <span>Scans inbound barcodes & maps optimal village delivery route</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.88rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#16A34A', marginTop: '2px' }}>•</span>
                    <span>Direct final-mile doorstep delivery visit to the buyer</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.88rem', lineHeight: '1.5', fontWeight: '400' }}>
                    <span style={{ color: '#16A34A', marginTop: '2px' }}>•</span>
                    <span>4-digit secret OTP verification & instant ₹15 commission credit</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. PLATFORM ECOSYSTEM (PDF SECTION 8) */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '5rem 0', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              SECTION 8 • PLATFORM ECOSYSTEM
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.5rem, 3.17vw, 2.42rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px' }}>
              The GramUnnati Rural Supply Chain Architecture
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '650px', margin: '0.5rem auto 0', lineHeight: '1.6' }}>
              Four specialized applications interlinked to connect farmers, transporters, and village SHGs into one cohesive digital pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecosystemComponents.map((item, idx) => {
              const IconC = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                  className="hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconC size={20} />
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '2px 8px', borderRadius: '100px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                      {item.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A', margin: '0.25rem 0 0' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.55', margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CONNECTED LOGISTICS APPS GRID */}
      {/* ========================================================================= */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '4.5rem 0 5rem', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#7B5872', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              EXPLORE ADJACENT PLATFORMS
            </span>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 2.64vw, 1.98rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px' }}>
              Connected Logistics & Enterprise Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'transporter-app', name: 'Transporter App', tag: 'Middle-Mile Hauling Fleet', image: getAssetUrl('/SHG Delivary and Transporter Logo.jpg') },
              { id: 'gram-unnati', name: 'GramUnnati', tag: 'Agri-Commerce Platform', image: getAssetUrl('/gramunnati-clean.png') },
              { id: 'g-track', name: 'G Track', tag: 'Field Force & GPS Telemetry', image: getAssetUrl('/G Track logo.png') },
              { id: 'erp', name: 'ERP', tag: 'Core Enterprise ERP', image: getAssetUrl('/ERP Logo.png') }
            ].map((app, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  if (onSelectApp) {
                    const found = APPLICATIONS.find(a => a.id === app.id) || { id: app.id };
                    onSelectApp(found);
                  } else {
                    window.history.pushState({ page: 'app-detail', appId: app.id }, '', `/app/${app.id}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
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

          {/* Bottom Action Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem', flexWrap: 'wrap' }}>
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
              <span>Schedule SHG Consultation</span>
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
