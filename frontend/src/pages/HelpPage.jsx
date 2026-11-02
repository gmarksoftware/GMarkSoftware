import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Headphones, 
  Wrench, 
  Code2, 
  Users, 
  Bug, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  LifeBuoy,
  Clock,
  Sparkles,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  Zap,
  Activity,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { sendContactEmail } from '../utils/emailService';

// Custom Intersection Observer Hook for smooth scroll reveal
function useScrollReveal(options = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (domRef.current) {
          observer.unobserve(domRef.current);
        }
      }
    }, options);

    const currentTarget = domRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, []);

  return [domRef, isVisible];
}

// Reusable Animated Container Component
function Reveal({ children, delay = 0, direction = 'up', style = {}, className = '' }) {
  const [ref, isVisible] = useScrollReveal();

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0) scale(1)';
    switch (direction) {
      case 'up': return 'translate3d(0, 36px, 0)';
      case 'down': return 'translate3d(0, -36px, 0)';
      case 'left': return 'translate3d(36px, 0, 0)';
      case 'right': return 'translate3d(-36px, 0, 0)';
      case 'scale': return 'scale(0.92) translate3d(0, 20px, 0)';
      default: return 'translate3d(0, 30px, 0)';
    }
  };

  return (
    <div
      ref={ref}
      className={`reveal-box ${isVisible ? 'revealed' : ''} ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, transform',
        ...style
      }}
    >
      {children}
    </div>
  );
}

export default function HelpPage({ onOpenExpertModal }) {
  const [heroMounted, setHeroMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('advisor'); // 'advisor' | 'developments' | 'partner' | 'bug'
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroMounted(true);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name) {
      setErrorMessage('Please enter your name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }
    if (!message) {
      setErrorMessage('Please enter your message details.');
      return;
    }

    setSubmitting(true);

    const tabTitles = {
      advisor: 'Schedule Consultation with an Advisor',
      developments: 'Request Custom Telemetry & Software Development',
      partner: 'Inquire About Partner & FPO Programs',
      bug: 'Submit an Engineering Support Ticket'
    };
    const title = formData.subject.trim() || tabTitles[activeTab] || 'Website Support Inquiry';
    const time = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const res = await sendContactEmail({
      name,
      email,
      title,
      subject: title,
      time,
      phone: formData.phone.trim(),
      message,
      activeTab
    });

    setSubmitting(false);

    if (res.success) {
      setSubmitted(true);
      setErrorMessage('');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } else {
      setErrorMessage(res.error || 'Failed to dispatch inquiry. Please try again.');
    }
  };

  const contactCards = [
    {
      id: 'advisor',
      title: 'Meet an advisor',
      desc: 'Schedule a discovery session with a senior industrial systems engineer.',
      icon: Users,
      badge: 'Consultation'
    },
    {
      id: 'developments',
      title: 'Request developments',
      desc: 'Custom telemetry integrations, PLC protocol adapters, or CMMS features.',
      icon: Code2,
      badge: 'Custom Engineering'
    },
    {
      id: 'partner',
      title: 'Become a partner',
      desc: 'Join the G-Mark Agritech FPO or industrial automation partner network.',
      icon: Sparkles,
      badge: 'Ecosystem'
    },
    {
      id: 'bug',
      title: 'Report an issue',
      desc: 'Submit a technical support ticket for rapid engineering response.',
      icon: Bug,
      badge: 'Priority Support'
    }
  ];

  const supportPills = [
    { label: '< 15 Mins', sub: 'First Response Time', icon: Clock },
    { label: '24/7 SLA', sub: 'Plant Telemetry Support', icon: Activity },
    { label: 'Dedicated', sub: 'Systems Engineers', icon: LifeBuoy },
    { label: 'Direct Desk', sub: 'Pune Engineering Lab', icon: Zap }
  ];

  return (
    <div 
      className="w-full max-w-full flex flex-col bg-white text-slate-900 overflow-x-hidden"
      style={{ 
        backgroundColor: '#FFFFFF', 
        minHeight: '100vh', 
        paddingTop: '5rem', 
        paddingBottom: '4rem', 
        overflowX: 'hidden',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
      }}
    >
      
      {/* ========================================================================= */}
      {/* 1. HERO HEADER WITH SMOOTH ENTRANCE MOTION */}
      {/* ========================================================================= */}
      <section style={{ textAlign: 'center', padding: '2.5rem 1.5rem 2.75rem', maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
        
        {/* Ambient subtle glow background matching Home Page */}
        <div 
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '680px',
            height: '380px',
            background: 'radial-gradient(ellipse 80% 50% at 50% -15%, rgba(113, 75, 103, 0.09) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
          aria-hidden="true"
        />

        {/* Eyebrow badge matching Home Page pill style */}
        <div
          style={{
            opacity: heroMounted ? 1 : 0,
            transform: heroMounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
            marginBottom: '1.25rem',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div 
            style={{
              padding: '6px 16px',
              backgroundColor: '#F9F5F8',
              border: '1px solid #E3D4DF',
              borderRadius: '100px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(113, 75, 103, 0.04)',
              fontSize: '0.75rem',
              fontWeight: '700',
              letterSpacing: '0.08em',
              color: '#714B67',
              textTransform: 'uppercase',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#714B67', animation: 'pulseDot 2s infinite' }} />
            G-MARK SUPPORT &amp; HELP CENTER
          </div>
        </div>

        {/* Headline matching Home Page Hero Typography */}
        <h1 
          style={{ 
            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: 'clamp(2.35rem, 4.8vw, 3.85rem)', 
            fontWeight: 800, 
            letterSpacing: '-0.025em', 
            color: '#1E293B',
            lineHeight: 1.16,
            marginBottom: '1.25rem',
            opacity: heroMounted ? 1 : 0,
            transform: heroMounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.75s ease-out 0.25s, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.25s',
            position: 'relative',
            zIndex: 1
          }}
        >
          <span>How can we </span>
          <span style={{ color: '#714B67' }}>help you?</span>
        </h1>

        <p 
          style={{ 
            fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)', 
            lineHeight: '1.7', 
            color: '#4B5563',
            maxWidth: '720px',
            margin: '0 auto 1.85rem',
            opacity: heroMounted ? 1 : 0,
            transform: heroMounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out 0.35s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.35s',
            position: 'relative',
            zIndex: 1,
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          <strong style={{ color: '#1E293B', fontWeight: '600' }}>Direct engineering support &amp; solutions.</strong>{' '}
          Access our engineering desk, request system customizations, or speak directly with our industrial IoT &amp; CMMS specialists.
        </p>

        {/* Search Bar + Ask a Human CTA */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.85rem', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            opacity: heroMounted ? 1 : 0,
            transform: heroMounted ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
            transition: 'opacity 0.85s ease-out 0.45s, transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.45s',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div 
            className="help-search-input-box"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              borderRadius: '10px',
              padding: '0.7rem 1.25rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.25s ease'
            }}
          >
            <Search size={18} style={{ color: '#64748B', marginRight: '10px', flexShrink: 0 }} />
            <input 
              type="text" 
              placeholder="Ask G Mark AI or search technical guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.92rem',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#1E293B',
                backgroundColor: 'transparent'
              }}
            />
            <button 
              type="button" 
              style={{ 
                background: 'rgba(113, 75, 103, 0.08)', 
                border: 'none', 
                color: '#714B67', 
                cursor: 'pointer', 
                padding: '7px 11px', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease'
              }}
              aria-label="Search"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(113, 75, 103, 0.16)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(113, 75, 103, 0.08)'}
            >
              <Send size={15} />
            </button>
          </div>

          <span style={{ fontSize: '0.92rem', color: '#64748B', fontWeight: '600', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>or</span>

          <button
            onClick={() => {
              const el = document.getElementById('contact-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center gap-2 text-white font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] select-none text-center"
            style={{
              backgroundColor: '#714B67',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              padding: '0.8rem 1.75rem',
              borderRadius: '10px',
              fontSize: '0.95rem',
              border: 'none',
              boxShadow: '0 2px 6px rgba(113, 75, 103, 0.25)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5E3E55'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#714B67'}
          >
            <span>Ask a Human</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Support Highlights Ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
            maxWidth: '820px',
            margin: '2rem auto 0',
            opacity: heroMounted ? 1 : 0,
            transform: heroMounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.85s ease-out 0.55s, transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.55s',
            position: 'relative',
            zIndex: 1
          }}
        >
          {supportPills.map((pill, idx) => {
            const IconC = pill.icon;
            return (
              <div 
                key={idx}
                className="support-pill"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '0.75rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
                }}
              >
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(113, 75, 103, 0.08)', color: '#714B67', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconC size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#1E293B', lineHeight: 1.15, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {pill.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {pill.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. ACTION TILES & EMERGENCY LINES WITH SCROLL REVEAL */}
      {/* ========================================================================= */}
      <section 
        id="contact-section"
        style={{ 
          backgroundColor: '#F8FAFC', 
          borderTop: '1px solid #E2E8F0', 
          borderBottom: '1px solid #E2E8F0', 
          padding: '2.5rem 0 3.5rem' 
        }}
      >
        <div className="container-enterprise">
          
          <Reveal direction="up" delay={0}>
            <div style={{ marginBottom: '1.75rem' }}>
              <span 
                className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3 inline-block"
                style={{
                  backgroundColor: '#F9F5F8',
                  color: '#714B67',
                  border: '1px solid #E3D4DF',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                DIRECT ACTION PATHWAYS
              </span>
              <h2 style={{ 
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: 'clamp(1.85rem, 3.2vw, 2.45rem)', 
                fontWeight: 800, 
                color: '#1E293B',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                marginTop: '4px',
                marginBottom: '0.4rem'
              }}>
                <span>Contact Us &amp; </span>
                <span style={{ color: '#714B67' }}>Inquiries</span>
              </h2>
              <p style={{
                fontSize: 'clamp(0.88rem, 1.5vw, 1rem)',
                color: '#4B5563',
                lineHeight: '1.6',
                maxWidth: '650px',
                marginBottom: '0',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}>
                Select your preferred engagement channel below to connect directly with our engineering desk or schedule an advisory session.
              </p>
            </div>
          </Reveal>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1.75rem',
              alignItems: 'start'
            }}
            className="help-layout-grid"
          >
            {/* Left: 4 Action Cards with Staggered Cascading Reveals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }} className="help-action-cards">
              {contactCards.map((card, i) => {
                const isSelected = activeTab === card.id;
                const IconComp = card.icon;
                return (
                  <Reveal key={card.id} direction="up" delay={i * 120}>
                    <div 
                      onClick={() => setActiveTab(card.id)}
                      className={`help-select-card ${isSelected ? 'selected' : ''}`}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: `1.5px solid ${isSelected ? '#714B67' : '#E2E8F0'}`,
                        borderRadius: '16px',
                        padding: '1.5rem 1.35rem',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 12px 28px -6px rgba(113, 75, 103, 0.16)' : '0 2px 8px rgba(15, 23, 42, 0.03)',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: isSelected ? 'translateY(-3px)' : 'none',
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                          <div 
                            className="card-icon-box"
                            style={{ 
                              width: '42px', 
                              height: '42px', 
                              borderRadius: '10px', 
                              backgroundColor: isSelected ? '#714B67' : '#F9F5F8',
                              color: isSelected ? '#FFFFFF' : '#714B67',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <IconComp size={20} />
                          </div>

                          <span 
                            style={{ 
                              fontSize: '0.7rem', 
                              fontFamily: "'Plus Jakarta Sans', sans-serif", 
                              color: '#714B67', 
                              fontWeight: '700',
                              backgroundColor: isSelected ? 'rgba(113, 75, 103, 0.1)' : '#F9F5F8',
                              border: isSelected ? '1px solid #E3D4DF' : '1px solid #E2E8F0',
                              padding: '3px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            {card.badge}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.4rem', letterSpacing: '-0.015em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {card.title}
                        </h3>
                        <p style={{ fontSize: '0.86rem', color: '#4B5563', lineHeight: '1.5', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {card.desc}
                        </p>
                      </div>

                      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '700', color: isSelected ? '#714B67' : '#94A3B8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <span>{isSelected ? 'Active Selection' : 'Select category'}</span>
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {/* Right: Emergency Lines Box with Scale Reveal */}
            <Reveal direction="scale" delay={150}>
              <div 
                className="emergency-lines-box"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  padding: '1.75rem',
                  boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.05)',
                  position: 'relative',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1E293B', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(113, 75, 103, 0.08)', color: '#714B67', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Headphones size={18} />
                  </div>
                  Support &amp; Emergency Lines
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: '#64748B', fontWeight: '500' }}>Direct Helpline</span>
                    <a href="tel:+919657363967" style={{ color: '#714B67', fontWeight: '700', textDecoration: 'none' }} className="contact-link">
                      +91 9657363967
                    </a>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: '#64748B', fontWeight: '500' }}>Technical Desk</span>
                    <a href="mailto:gmarksoftware@gmail.com" style={{ color: '#714B67', fontWeight: '700', textDecoration: 'none' }} className="contact-link">
                      gmarksoftware@gmail.com
                    </a>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: '#64748B', fontWeight: '500' }}>Operating Hours</span>
                    <span style={{ color: '#1E293B', fontWeight: '600' }}>Mon - Sat (9am - 7pm IST)</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: '#64748B', fontWeight: '500' }}>Plant SLA Priority</span>
                    <span style={{ color: '#16A34A', fontWeight: '700', backgroundColor: '#DCFCE7', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A', animation: 'pulseDot 1.8s infinite' }} />
                      24/7 ACTIVE
                    </span>
                  </div>

                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem', color: '#4B5563', backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <MapPin size={18} style={{ color: '#714B67', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#1E293B', display: 'block' }}>G Mark Software Private Limited</strong>
                    <div style={{ color: '#64748B' }}>Moshi, Pune, Maharashtra, India - 412105</div>
                  </div>
                </div>

              </div>
            </Reveal>

          </div>

          {/* Direct Ticket / Message Submission Form with Smooth Reveal */}
          <Reveal direction="up" delay={200}>
            <div 
              style={{
                marginTop: '2.5rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #CBD5E1',
                padding: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                boxShadow: '0 12px 36px -6px rgba(15, 23, 42, 0.06)',
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <span 
                  className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3 inline-block"
                  style={{
                    backgroundColor: '#F9F5F8',
                    color: '#714B67',
                    border: '1px solid #E3D4DF',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                >
                  ONLINE INQUIRY &amp; SUPPORT DESK
                </span>
                <h3 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#1E293B', marginTop: '4px', letterSpacing: '-0.025em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <span>
                    {activeTab === 'advisor' && 'Schedule Consultation with an '}
                    {activeTab === 'developments' && 'Request Custom Telemetry & Software '}
                    {activeTab === 'partner' && 'Inquire About Partner & FPO '}
                    {activeTab === 'bug' && 'Submit an Engineering Support '}
                  </span>
                  <span style={{ color: '#714B67' }}>
                    {activeTab === 'advisor' && 'Advisor'}
                    {activeTab === 'developments' && 'Development'}
                    {activeTab === 'partner' && 'Programs'}
                    {activeTab === 'bug' && 'Ticket'}
                  </span>
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#4B5563', marginTop: '0.35rem', marginBottom: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <strong style={{ color: '#1E293B', fontWeight: '600' }}>Simple, efficient, yet fully integrated.</strong>{' '}
                  Connect directly with our engineering specialists.
                </p>
              </div>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', animation: 'fadeInUp 0.5s ease-out' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(113, 75, 103, 0.12)', color: '#714B67', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 6px 18px rgba(113, 75, 103, 0.2)' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
                    <span>Inquiry Dispatched </span>
                    <span style={{ color: '#714B67' }}>Successfully!</span>
                  </h4>
                  <p style={{ color: '#4B5563', maxWidth: '460px', margin: '0 auto', lineHeight: '1.6', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    A G-Mark systems specialist will review your ticket and connect with you within 2-4 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
                  {errorMessage && (
                    <div style={{
                      padding: '0.85rem 1.15rem',
                      borderRadius: '10px',
                      backgroundColor: '#FEF2F2',
                      border: '1.5px solid #FCA5A5',
                      color: '#991B1B',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>
                      <AlertCircle size={18} style={{ color: '#DC2626', flexShrink: 0 }} />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.4rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Your Name *
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Anand Sharma"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="form-control-input"
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.92rem',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: '#1E293B',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.4rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Work Email *
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="anand@company.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="form-control-input"
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.92rem',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: '#1E293B',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.4rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Contact Number
                      </label>
                      <input 
                        type="tel" 
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="form-control-input"
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.92rem',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: '#1E293B',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.4rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Subject / Project Reference
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 4M CMMS Implementation or GramUnnati Mandi Integration"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="form-control-input"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.92rem',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: '#1E293B',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.4rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Message Details *
                    </label>
                    <textarea 
                      rows="4"
                      required
                      placeholder="Describe your inquiry, technical objectives, or issue description..."
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="form-control-input"
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.92rem',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: '#1E293B',
                        resize: 'vertical',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#64748B', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '500' }}>
                      <ShieldCheck size={18} style={{ color: '#714B67' }} />
                      <span>Protected by G-Mark Enterprise NDA standards</span>
                    </div>

                    <button 
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 text-white font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] select-none"
                      style={{
                        backgroundColor: '#714B67',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        padding: '0.85rem 2.2rem',
                        fontSize: '0.98rem',
                        borderRadius: '10px',
                        border: 'none',
                        opacity: submitting ? 0.75 : 1,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 6px rgba(113, 75, 103, 0.25)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5E3E55'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#714B67'}
                    >
                      {submitting ? (
                        <>
                          <span>Sending Ticket...</span>
                          <Loader2 size={17} className="animate-spin" />
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </Reveal>

        </div>
      </section>

      {/* COMPONENT ANIMATIONS & STYLES */}
      <style>{`
        @keyframes pulseDot {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(113, 75, 103, 0.5);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 7px rgba(113, 75, 103, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(113, 75, 103, 0);
          }
        }

        .help-search-input-box:focus-within {
          border-color: #714B67 !important;
          box-shadow: 0 0 0 3px rgba(113, 75, 103, 0.12), 0 4px 16px rgba(113, 75, 103, 0.08) !important;
        }

        .support-pill:hover {
          transform: translateY(-2px);
          background-color: #FFFFFF !important;
          border-color: #CBD5E1 !important;
          box-shadow: 0 6px 18px rgba(113, 75, 103, 0.08);
        }

        .help-select-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px -6px rgba(113, 75, 103, 0.16) !important;
          border-color: #714B67 !important;
        }

        .help-select-card:hover .card-icon-box {
          transform: scale(1.08);
        }

        .emergency-lines-box:hover {
          border-color: #E3D4DF !important;
          box-shadow: 0 12px 28px -6px rgba(113, 75, 103, 0.08) !important;
        }

        .form-control-input:focus {
          border-color: #714B67 !important;
          box-shadow: 0 0 0 3px rgba(113, 75, 103, 0.12) !important;
        }

        .contact-link:hover {
          color: #5E3E55 !important;
          text-decoration: underline !important;
        }

        @media (min-width: 992px) {
          .help-layout-grid {
            grid-template-columns: 1.25fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .help-action-cards {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
