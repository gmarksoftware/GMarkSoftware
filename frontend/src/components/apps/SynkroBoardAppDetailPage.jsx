import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Users,
  Calendar,
  Clock,
  LayoutGrid,
  Kanban,
  FileCheck,
  SlidersHorizontal,
  FolderKanban,
  MessageSquare,
  Bell,
  BarChart3,
  Search,
  Sparkles,
  Award,
  TrendingUp,
  Cpu,
  Smartphone,
  Server,
  Lock,
  Workflow,
  PlusCircle,
  HelpCircle,
  Settings,
  Flame,
  Globe,
  FileSpreadsheet,
  CheckSquare2,
  GitBranch,
  Timer,
  ChevronRight
} from 'lucide-react';

import { APPLICATIONS } from '../ApplicationsGridSection';
import { getAssetUrl } from '@/utils/asset';

export default function SynkroBoardAppDetailPage({ onBack, onOpenExpertModal, onSelectApp }) {
  const [activeVisualizationTab, setActiveVisualizationTab] = useState(0);
  const [activeRoleTab, setActiveRoleTab] = useState(0);

  // Key Value Metrics Pills
  const metricPills = [
    { label: '5-in-1', sub: 'Project Views (Kanban/Gantt/RACI)', icon: LayoutGrid },
    { label: '< 200 ms', sub: 'WebSocket Live Sync', icon: Zap },
    { label: '40%', sub: 'Team Velocity Increase', icon: TrendingUp },
    { label: '100%', sub: 'RACI Accountability', icon: ShieldCheck }
  ];

  // 5 Multi-View Visualization Engines
  const visualizationViews = [
    {
      id: 'kanban',
      title: 'Interactive Kanban Boards',
      badge: 'AGILE EXECUTION',
      color: '#F97316',
      bgColor: '#FFF7ED',
      desc: 'Drag-and-drop visual workflow stages with custom columns, WIP limits, task color tags, card archiving, and real-time member assignment.',
      highlights: ['Customizable stage pipelines', 'Work-in-Progress (WIP) constraints', 'Subtask checklist counters', 'Instant card search & priority badges']
    },
    {
      id: 'raci',
      title: 'RACI Responsibility Matrix',
      badge: 'GOVERNANCE',
      color: '#0284C7',
      bgColor: '#E0F2FE',
      desc: 'Formal assignment and real-time auditing of Responsible, Accountable, Consulted, and Informed stakeholders across all project deliverables.',
      highlights: ['Zero ownership ambiguity', 'Audit-ready compliance tracking', 'Multi-department stakeholder mapping', 'Automated approval escalations']
    },
    {
      id: 'gantt',
      title: 'Interactive Gantt & Timeline',
      badge: 'SCHEDULE PLANNING',
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      desc: 'High-precision timeline scheduling with milestone tracking, task duration mapping, predecessor-successor dependencies, and critical path analysis.',
      highlights: ['Interactive drag timeline bars', 'Task dependency links', 'Milestone completion markers', 'Multi-project horizon view']
    },
    {
      id: 'eisenhower',
      title: 'Eisenhower Priority Matrix',
      badge: 'HIGH IMPACT',
      color: '#16A34A',
      bgColor: '#DCFCE7',
      desc: '4-Quadrant prioritization (Do First, Schedule, Delegate, Don’t Do) enabling fast-moving teams and executives to focus on high-leverage outcomes.',
      highlights: ['Urgent vs Important classification', 'Instant focus quadrant filtering', 'Delegation workflow triggers', 'Burnout reduction framework']
    },
    {
      id: 'calendar',
      title: 'Day Planner & Unified Calendar',
      badge: 'PERSONAL FOCUS',
      color: '#EC4899',
      bgColor: '#FDF2F8',
      desc: 'Personalized "Today’s Focus" / "My Day" schedule synchronized with project milestone due dates, holiday calendars, and approved employee leaves.',
      highlights: ['Personal daily agenda view', 'Leave-aware deadline scheduling', 'Google/Outlook calendar sync', 'One-click daily check-in']
    }
  ];

  // 13 System Modules (from Section 7 "What the System Does")
  const systemModules = [
    { area: 'Workspace Management', purpose: 'Create, configure, and isolate multi-tenant workspaces with custom settings and member role permissions.', tag: 'Multi-Tenant' },
    { area: 'Project Management', purpose: 'Organize projects with categories, status workflows, budget tracking, member assignments, and health metrics.', tag: 'Projects' },
    { area: 'Kanban Board System', purpose: 'Visual workflow management with customizable stages/columns, WIP limits, color tagging, card archiving, and reordering.', tag: 'Agile' },
    { area: 'Task Lifecycle & Checklists', purpose: 'Comprehensive task tracking with priorities, due dates, estimates, subtask checklists, and file attachments.', tag: 'Tasks' },
    { area: 'RACI Matrix Governance', purpose: 'Formal assignment and auditing of Responsible, Accountable, Consulted, and Informed stakeholders per task.', tag: 'Accountability' },
    { area: 'Gantt & Timeline Scheduling', purpose: 'Interactive project schedules, dependency tracking, duration planning, and milestone monitoring.', tag: 'Gantt' },
    { area: 'Eisenhower Matrix Planning', purpose: '4-Quadrant prioritization (Urgent/Important) for rapid decision making and high-impact task execution.', tag: 'Priority' },
    { area: 'Calendar & Day Planner', purpose: 'Centralized team calendar combining project deadlines, personal "Today’s Focus" schedules, and holiday events.', tag: 'Planning' },
    { area: 'Leave & Absence Management', purpose: 'Submit and approve employee leaves (Sick, Casual, Annual) with automated task timeline recalculation.', tag: 'HR & Leaves' },
    { area: 'Real-Time Team Chat', purpose: 'Contextual direct messaging and group channels with live typing indicators, read receipts, and emoji reactions.', tag: 'WebSocket Chat' },
    { area: 'Alerts & Push Notifications', purpose: 'Real-time WebSocket alerts and mobile push notifications for task assignments, mentions, and approaching deadlines.', tag: 'Alerts' },
    { area: 'Role-Based Dashboards', purpose: 'Dedicated analytical views for Super Admins (system health), Admins (team progress), and Employees (personal focus).', tag: 'Analytics' },
    { area: 'User & Role Administration', purpose: 'Comprehensive user lifecycle management, invitation flows, status toggles, and granular role assignments.', tag: 'RBAC Security' }
  ];

  // Stakeholder Personas & Goals (from Section 4 in PDF)
  const stakeholderRoles = [
    {
      title: 'Project Managers & Team Leaders',
      badge: 'LEADERSHIP',
      color: '#F97316',
      bgColor: '#FFF7ED',
      icon: Users,
      summary: 'Empowers leaders to maintain total control over project velocity, remove bottlenecks, and ensure equitable workload distribution.',
      points: [
        'Complete visibility over project timelines, task lifecycles, and team velocity in real time.',
        'Eliminate ambiguity in ownership with built-in RACI responsibility matrices and automated milestone tracking.',
        'Optimize team workload and automatically adjust task deadlines based on member leaves and availability.',
        'Accelerate project delivery through agile Kanban boards with customizable workflows and WIP limits.'
      ]
    },
    {
      title: 'Team Members & Employees',
      badge: 'EXECUTION',
      color: '#0284C7',
      bgColor: '#E0F2FE',
      icon: CheckSquare2,
      summary: 'Designed for distraction-free focus, clear daily priorities, and seamless collaboration without tool fragmentation.',
      points: [
        'Intuitive "Today’s Focus" / "My Day" dashboard for effortless daily task prioritization.',
        'Streamline task execution with rich subtask checklists, markdown descriptions, file attachments, and activity timelines.',
        'Integrated, instant team chat, group channels, and real-time socket notifications.',
        'Simplified absence management with 1-click leave requests and transparent holiday schedules.'
      ]
    },
    {
      title: 'Executives & Super Admins',
      badge: 'GOVERNANCE',
      color: '#16A34A',
      bgColor: '#DCFCE7',
      icon: ShieldCheck,
      summary: 'Delivers complete organizational oversight, multi-tenant isolation, cross-project health, and strict security governance.',
      points: [
        'Enterprise-grade data security with multi-tenant workspace isolation and granular role-based permissions (RBAC).',
        'Actionable organizational insights through executive-level productivity analytics and cross-project health metrics.',
        'Seamless user onboarding, workspace memberships, and system-wide configurations from a single centralized hub.',
        'Foster a culture of accountability, transparency, and operational excellence across the entire enterprise.'
      ]
    }
  ];

  // Core Organizational Values (from Section 6 in PDF)
  const coreValues = [
    { title: 'Clarity & Accountability', desc: 'Ensure every project role, task ownership, and milestone is crystal clear through structured RACI modeling.' },
    { title: 'Real-Time Agility', desc: 'Deliver instantaneous state synchronization across Web and Mobile via live WebSockets.' },
    { title: 'Employee Well-Being & Balance', desc: 'Respect human capacity by integrating absence awareness directly into project schedules and deadlines.' },
    { title: 'Data Privacy & Security', desc: 'Guarantee enterprise-level data segregation through strict multi-tenancy and role-based access control.' },
    { title: 'User-Centric Simplicity', desc: 'Craft clean, modern, and friction-free user experiences that teams genuinely love using every single day.' },
    { title: 'Continuous Innovation', desc: 'Empower teams with versatile views (Kanban, Gantt, Eisenhower, Calendar) tailored to diverse working styles.' },
    { title: 'Collaborative Synergy', desc: 'Unify execution with contextual communication so discussions happen where work is being done.' }
  ];

  // Connected Ecosystem Applications
  const CONNECTED_APPS = [
    { id: 'erp', name: 'ERP', tag: 'Core Enterprise ERP', desc: 'Double-entry accounting, invoice reconciliation & resource planning', image: getAssetUrl('/ERP Logo.png') },
    { id: 'g-nova-iot', name: 'G-Nova IoT', tag: 'G-Nova Telemetry & 4M ERP', desc: 'Facility telemetry, machine monitoring & preventive work orders', image: getAssetUrl('/g-nova-clean.png') },
    { id: 'g-track', name: 'G Track', tag: 'Field Force & GPS Telemetry', desc: 'Real-time on-field workforce tracking & client visit automation', image: getAssetUrl('/G Track logo.png') },
    { id: 'gram-unnati', name: 'GramUnnati', tag: 'Agri-Commerce Platform', desc: 'Digital marketplace for farmers & rural self-help enterprises', image: getAssetUrl('/gramunnati-clean.png') }
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

  return (
    <div style={{ backgroundColor: '#e8e8e8', minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION / HEADER */}


      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH Lora HEADING & FLOATING SYNKROBOARD LOGO BADGE */}
      {/* ========================================================================= */}
      <section 
        style={{
          backgroundColor: '#e8e8e8',
          borderBottom: '1px solid #CBD5E1',
          paddingTop: 'clamp(3rem, 5vw, 4.5rem)',
          paddingBottom: '4.5rem'
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 3rem' }}>
            
            {/* Headline with 'Lora', serif and floating logo card with hand-drawn arrow */}
            <div className="relative inline-block w-full">
              
              {/* Floating SynkroBoard Logo Square Card with Curved Arrow */}
              <div 
                className="hidden md:flex items-center gap-2 absolute -top-10 right-2 lg:-right-6 z-20 pointer-events-none select-none"
              >
                {/* Hand-drawn Curved Arrow pointing to the headline */}
                <svg
                  className="w-16 h-12 text-[#7B5872] transform -rotate-12"
                  viewBox="0 0 100 70"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 85,15 C 65,45 35,50 15,35"
                    stroke="#7B5872"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 12,27 L 15,35 L 25,32"
                    stroke="#7B5872"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>

                {/* SynkroBoard Logo Square Card */}
                <div 
                  style={{
                    width: '68px',
                    height: '68px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
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
                    src={getAssetUrl("/Task Management & Team Collaboration Logo 01.jpg")} 
                    alt="SynkroBoard Logo" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '10px'
                    }}
                  />
                </div>
              </div>

              {/* Main Headline */}
              <h1 
                style={{ 
                  fontFamily: "'Lora', serif",
                  fontSize: 'clamp(1.65rem, 3.7vw, 2.82rem)', 
                  fontWeight: 600, 
                  color: '#0F172A',
                  letterSpacing: '0',
                  lineHeight: '1.2',
                  margin: '0 0 1rem'
                }}
              >
                All-in-One Enterprise{' '}
                <span className="relative inline-block whitespace-nowrap">
                  <span className="relative z-10" style={{ color: '#FC787D' }}>
                    Task Management
                  </span>
                  <svg
                    className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2.5 sm:h-3.5 pointer-events-none z-0 overflow-visible"
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
                {' '}& Workspace Ecosystem
              </h1>
            </div>

            <p style={{ fontSize: 'clamp(0.92rem, 1.58vw, 1.07rem)', color: '#475569', lineHeight: '1.65', margin: '0 auto 2rem', maxWidth: '780px' }}>
              Bridge the gap between strategic project governance and real-time operational execution. Powered by multi-view visualization (Kanban, RACI, Gantt, Eisenhower), absence-aware scheduling, and sub-second WebSocket team synchronization.
            </p>

            {/* Hero CTA Button */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={onOpenExpertModal}
                style={{
                  padding: '0.85rem 2.25rem',
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
                <span>Request SynkroBoard Demo</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>

          {/* Metric Badges */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
              gap: '1rem'
            }}
          >
            {metricPills.map((m, idx) => {
              const IconComp = m.icon;
              return (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '16px',
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.4rem', color: '#F97316' }}>
                    <IconComp size={22} />
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px', fontWeight: '500' }}>
                    {m.sub}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROBLEM & SOLUTION STATEMENT */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '4rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              EXECUTIVE CONTEXT
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
              Unifying Strategy with Daily Operational Execution
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
            
            {/* Problem Card */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '3px 10px', borderRadius: '100px', letterSpacing: '0.04em' }}>
                  THE CORE PROBLEM
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0F172A', marginBottom: '0.75rem' }}>
                Fragmented Tools & Scattered Task Accountability
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.65', margin: 0 }}>
                Modern organizations, distributed teams, and executives struggle with fragmented workflows, lack of transparent task accountability, scattered communication channels, and rigid project management tools. Existing platforms disconnect high-level strategic tracking (RACI matrix, milestones, team availability) from daily execution (Kanban boards, subtasks, real-time discussions), resulting in missed deadlines, resource bottlenecks, unmonitored team absences, and inefficient team collaboration.
              </p>
            </div>

            {/* Solution Card */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16A34A', backgroundColor: '#DCFCE7', padding: '3px 10px', borderRadius: '100px', letterSpacing: '0.04em' }}>
                  THE SYNKROBOARD SOLUTION
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0F172A', marginBottom: '0.75rem' }}>
                All-in-One Enterprise Task & Workspace Ecosystem
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.65', margin: 0 }}>
                SynkroBoard provides an all-in-one collaborative ecosystem that unifies strategic project governance with real-time operational execution. It includes a responsive Web Application and cross-platform Mobile Applications (iOS & Android) for on-the-go productivity and team chat, powered by a centralized NestJS backend with real-time WebSocket synchronization, role-based access control, intelligent absence-aware task scheduling, and comprehensive auditability.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. VISUAL ODOO-STYLE SHOWCASE 1: "LEVEL UP YOUR QUALITY OF WORK" (syn1.jpeg) */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '4.5rem 0 5.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Odoo Style Heading with Floating Sticky Note */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem', position: 'relative' }}>
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
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#0B3A70', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px', flexShrink: 0 }}>
                        <span style={{ fontSize: '13px' }}>⚡</span>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: '600', color: '#1E293B', margin: 0, lineHeight: 1.3, fontStyle: 'italic' }}>
                          "When you synchronize everything, you can achieve anything!"
                        </p>
                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '500' }}>
                          — SynkroBoard Enterprise Oversight
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Headline */}
              <h2 style={{ 
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(1.4rem, 3.5vw, 2.82rem)', 
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
                {/* "Level up" with coral/salmon highlighter brush background */}
                <span className="relative inline-block px-3 py-0.5 my-1">
                  <span 
                    className="absolute inset-0 rounded-md"
                    style={{ 
                      backgroundColor: '#FC787D', 
                      transform: 'skewX(-4deg) rotate(-1.5deg)',
                      opacity: 0.95
                    }} 
                  />
                  <span className="relative z-10 text-white font-bold">
                    Level up
                  </span>
                </span>

                <span>your quality of</span>

                {/* "work" with cyan/teal brush underline */}
                <span className="relative inline-block">
                  <span className="relative z-10" style={{ color: '#0F172A' }}>
                    work
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

            <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: '640px', margin: '1.25rem auto 0', fontWeight: 400 }}>
              Centralized real-time analytics across all workspaces, active projects, and team members.
            </p>
          </div>

          {/* Elevated Showcase Frame with Elevated Window and Playback Scrubber */}
          <div className="relative w-full max-w-5xl mx-auto">
            
            {/* Main Application Window Card */}
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
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  Dashboard / System Overview
                </div>

                <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: '700', letterSpacing: '0.04em' }}>
                  ● LIVE WEBSOCKET SYNC
                </div>
              </div>

              {/* Real Dashboard Image */}
              <div style={{ padding: '0.85rem', backgroundColor: '#F1F5F9' }}>
                <img 
                  src={getAssetUrl("/syn1.jpeg")} 
                  alt="SynkroBoard System Overview Dashboard"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0'
                  }}
                />
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. VISUAL ODOO-STYLE SHOWCASE 2: "NO SCATTERED TASKS! JUST AUTOMATION" WITH OVERLAPPING CARD & CURVED ARROW (syn2.jpeg) */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#FFFFFF', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '4.5rem 0 5.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Odoo Style Handwritten Dual-Line Heading with Cross and Check Badges (Exact Reference 2) */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            
            {/* Line 1: No scattered spreadsheets! */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <span 
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  border: '2px solid #EF4444',
                  color: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '900',
                  flexShrink: 0
                }}
              >
                ✕
              </span>
              <h2 style={{ 
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(1.25rem, 3.34vw, 2.55rem)', 
                fontWeight: 600, 
                color: '#0F172A',
                letterSpacing: '0',
                lineHeight: 1.1,
                margin: 0
              }}>
                No scattered spreadsheets!
              </h2>
            </div>

            {/* Wavy blue brush stroke */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-4px', marginBottom: '4px' }}>
              <svg className="w-56 h-3 text-[#00A3FF]" viewBox="0 0 200 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M 4,6 Q 28,1 54,6 T 104,6 T 154,6 T 196,6" />
              </svg>
            </div>

            {/* Line 2: Just live automation & boards */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <h2 style={{ 
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(1.25rem, 3.34vw, 2.55rem)', 
                fontWeight: 600, 
                color: '#0F172A',
                letterSpacing: '0',
                lineHeight: 1.1,
                margin: 0
              }}>
                Just synchronized automation
              </h2>
              <span 
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  border: '2px solid #16A34A',
                  color: '#16A34A',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '900',
                  flexShrink: 0
                }}
              >
                ✓
              </span>
            </div>

            <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: '620px', margin: '1rem auto 0' }}>
              Experience zero manual tracking. Our intelligent project boards automatically recalculate task deadlines and progress across multi-tenant teams. All you have to do is execute.
            </p>

          </div>

          {/* Overlapping Dual-Card Layout with Hand-Drawn Curved Arrow (Exact Odoo Reference 2) */}
          <div className="relative w-full max-w-5xl mx-auto mt-8">
            
            {/* Prominent Curved Hand-Drawn Arrow in Berry Plum (#7B5872) pointing from floating card to main board */}
            <div className="hidden lg:block absolute top-6 right-64 z-30 pointer-events-none">
              <svg 
                width="90" 
                height="80" 
                viewBox="0 0 90 80" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M 75,5 C 25,10 15,55 35,70" 
                  stroke="#7B5872" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  fill="none"
                />
                <path 
                  d="M 23,60 L 35,70 L 40,55" 
                  stroke="#7B5872" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none"
                />
              </svg>
            </div>

            {/* Floating Overlapping Task Inspector Card (Top-Right) */}
            <div 
              className="hidden sm:block absolute -top-8 -right-4 lg:-right-6 z-20"
              style={{
                width: '270px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '18px',
                padding: '1.25rem',
                border: '2px solid #334155',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                transform: 'rotate(2deg)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#F97316', backgroundColor: '#FFF7ED', padding: '2px 8px', borderRadius: '100px' }}>
                  ACTIVE SPRINT #12
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                  Task #104
                </span>
              </div>
              
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFFFFF', margin: '0 0 6px' }}>
                Synkro Board Architecture
              </h4>
              
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0 0 10px' }}>
                Assigned: <strong style={{ color: '#E2E8F0' }}>Super Admin</strong> • 1 Member
              </p>

              {/* Mini Progress Bar */}
              <div style={{ width: '100%', height: '6px', backgroundColor: '#334155', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', backgroundColor: '#10B981', borderRadius: '100px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#10B981', fontWeight: '600', marginTop: '4px' }}>
                <span>In Progress</span>
                <span>75% On-Track</span>
              </div>
            </div>

            {/* Main Application Window Card displaying syn2.jpeg */}
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
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#0284C7' }} />
                  Workspace / Project Boards
                </div>

                <div style={{ fontSize: '0.75rem', color: '#F97316', fontWeight: '700', letterSpacing: '0.04em' }}>
                  + CREATE PROJECT BOARD
                </div>
              </div>

              {/* Real Project Boards Screenshot */}
              <div style={{ padding: '0.85rem', backgroundColor: '#F1F5F9' }}>
                <img 
                  src={getAssetUrl("/syn2.jpeg")} 
                  alt="SynkroBoard Project Boards System"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0'
                  }}
                />
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MULTI-VIEW VISUALIZATION ENGINE (INTERACTIVE TABS) */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '4rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              VERSATILE PROJECT VISUALIZATION
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
              5 Dynamic Project Views Tailored to Every Workflow
              <span style={{ 
                display: 'block', 
                height: '4px', 
                backgroundColor: '#D97706', 
                borderRadius: '2px', 
                width: '60px', 
                marginTop: '6px' 
              }} />
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.5rem' }}>
              Switch seamlessly between agile execution, strategic governance, timeline scheduling, and personal daily focus:
            </p>
          </div>

          {/* View Tabs */}
          <div 
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              marginBottom: '1.5rem'
            }}
          >
            {visualizationViews.map((v, idx) => (
              <button
                key={idx}
                onClick={() => setActiveVisualizationTab(idx)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  border: activeVisualizationTab === idx ? '1px solid #0B3A70' : '1px solid #CBD5E1',
                  backgroundColor: activeVisualizationTab === idx ? '#0B3A70' : '#FFFFFF',
                  color: activeVisualizationTab === idx ? '#FFFFFF' : '#334155',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{v.title}</span>
              </button>
            ))}
          </div>

          {/* Active View Card */}
          {(() => {
            const currentView = visualizationViews[activeVisualizationTab];
            return (
              <div 
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '20px',
                  padding: '2.25rem',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <span 
                    style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '700', 
                      color: currentView.color, 
                      backgroundColor: currentView.bgColor, 
                      padding: '4px 12px', 
                      borderRadius: '100px',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {currentView.badge}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500' }}>
                    Instant Tab Switching • Live Sync
                  </span>
                </div>

                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', margin: '0 0 0.75rem' }}>
                  {currentView.title}
                </h3>
                <p style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.65', marginBottom: '2rem' }}>
                  {currentView.desc}
                </p>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0B3A70', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                    Core Architectural Capabilities
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '0.85rem' }}>
                    {currentView.highlights.map((h, hIdx) => (
                      <div key={hIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>
                        <CheckCircle2 size={18} style={{ color: currentView.color, flexShrink: 0 }} />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. COMPLETE 13 SYSTEM MODULES MATRIX (FULL TABLE) */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '4rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              SYSTEM CAPABILITIES
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
              13 Core Functional Modules Matrix
              <span style={{ 
                display: 'block', 
                height: '4px', 
                backgroundColor: '#D97706', 
                borderRadius: '2px', 
                width: '60px', 
                marginTop: '6px' 
              }} />
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.5rem' }}>
              Comprehensive breakdown of platform features derived directly from the SynkroBoard architectural specification:
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
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                    <th style={{ padding: '1.1rem 1.5rem', fontWeight: '600', color: '#0F172A', width: '28%' }}>Functional Area</th>
                    <th style={{ padding: '1.1rem 1.5rem', fontWeight: '600', color: '#0F172A', width: '54%' }}>System Purpose & Scope</th>
                    <th style={{ padding: '1.1rem 1.5rem', fontWeight: '600', color: '#0F172A', width: '18%' }}>Module Tag</th>
                  </tr>
                </thead>
                <tbody>
                  {systemModules.map((row, idx) => (
                    <tr 
                      key={idx} 
                      style={{ 
                        borderBottom: idx < systemModules.length - 1 ? '1px solid #E2E8F0' : 'none',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FBFDFF'
                      }}
                    >
                      <td style={{ padding: '1.1rem 1.5rem', fontWeight: '600', color: '#0B3A70' }}>
                        {row.area}
                      </td>
                      <td style={{ padding: '1.1rem 1.5rem', color: '#334155', lineHeight: '1.5' }}>
                        {row.purpose}
                      </td>
                      <td style={{ padding: '1.1rem 1.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#F97316', backgroundColor: '#FFF7ED', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FFEDD5' }}>
                          {row.tag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. STAKEHOLDER PERSONAS & ORGANIZATIONAL GOALS */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '4rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ORGANIZATIONAL GOALS & ROLES
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
              Tailored Value for Every Stakeholder
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
            {stakeholderRoles.map((role, idx) => {
              const RoleIcon = role.icon;
              return (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '20px',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
                  }}
                  className="hover:shadow-md transition-all duration-200"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: role.bgColor, color: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RoleIcon size={22} />
                    </div>
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: '700', 
                        color: role.color, 
                        backgroundColor: role.bgColor, 
                        padding: '4px 10px', 
                        borderRadius: '100px',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {role.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A', margin: '0 0 0.5rem' }}>
                    {role.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 0 1.25rem', lineHeight: '1.5' }}>
                    {role.summary}
                  </p>

                  <div style={{ marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {role.points.map((p, pIdx) => (
                        <li key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: '#334155', lineHeight: '1.4' }}>
                          <Check size={15} style={{ color: role.color, flexShrink: 0, marginTop: '2px' }} />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. 3-TIER ENTERPRISE PLATFORM ECOSYSTEM */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '4rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ENTERPRISE ARCHITECTURE
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
              3-Tier SynkroBoard Platform Ecosystem
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FFF7ED', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <LayoutGrid size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.5rem' }}>
                Web Application
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                A high-performance, responsive desktop application for workspace administrators, project managers, and collaborative power users with multi-monitor support and fast keyboard shortcuts.
              </p>
            </div>

            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Smartphone size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.5rem' }}>
                Mobile Apps (iOS & Android)
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                Native cross-platform mobile apps for on-the-go task updates, real-time team chat, 1-click leave applications, personal calendar access, and instant push notifications.
              </p>
            </div>

            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Server size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.5rem' }}>
                Centralized Backend API & WebSockets
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                A robust NestJS RESTful and WebSocket server providing real-time state synchronization, enterprise security (JWT/RBAC), background schedule engine, and automated absence recalibration.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. CORE VALUES & CULTURE */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '4rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              OUR VALUES & VISION
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
              Engineered for Human-Centric Productivity
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
            {coreValues.map((val, idx) => (
              <div 
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <Sparkles size={16} style={{ color: '#F97316' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    {val.title}
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.55', margin: 0 }}>
                  {val.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. CONNECTED MARKG ECOSYSTEM */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '4rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
      {/* 12. BOTTOM CTA BANNER */}
      {/* ========================================================================= */}
      <section 
        style={{ 
          backgroundColor: '#FFFFFF', 
          borderTop: '1px solid #CBD5E1',
          padding: '5rem 0' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          
          <span 
            style={{ 
              fontSize: '0.78rem', 
              color: '#0B3A70', 
              fontWeight: '400', 
              letterSpacing: '0.12em', 
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '0.5rem'
            }}
          >
            TRANSFORM TEAM PRODUCTIVITY
          </span>

          <h2 
            style={{ 
              fontFamily: "'Lora', serif",
              fontSize: 'clamp(1.5rem, 3.17vw, 2.42rem)', 
              fontWeight: 600, 
              color: '#0F172A', 
              letterSpacing: '0',
              margin: '0 0 1rem' 
            }}
          >
            Ready to Empower Your Teams with SynkroBoard?
          </h2>

          <p 
            style={{ 
              fontSize: '1.1rem', 
              color: '#64748B', 
              maxWidth: '680px', 
              margin: '0 auto 2rem',
              lineHeight: '1.6'
            }}
          >
            Experience frictionless agile collaboration, RACI accountability, and sub-second WebSocket task management across your enterprise.
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
              <span>Schedule Live SynkroBoard Demo</span>
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
