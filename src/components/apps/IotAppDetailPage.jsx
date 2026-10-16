import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Globe, 
  Activity, 
  Zap, 
  Server,
  RefreshCw,
  Clock,
  Code2,
  Users,
  MapPin,
  Check,
  ArrowRight,
  Database,
  ChevronDown,
  Sparkles,
  Cpu,
  SlidersHorizontal,
  Building2,
  Radio,
  Bell,
  Gauge,
  Flame,
  Droplets,
  Wind,
  Binary,
  Lock,
  FileCheck,
  AlertTriangle,
  FileSpreadsheet,
  CheckCheck,
  Power,
  ChevronRight
} from 'lucide-react';
import { APPLICATIONS } from '../ApplicationsGridSection';
import { getAssetUrl } from '@/utils/asset';

export default function IotAppDetailPage({ onBack, onOpenExpertModal, onSelectApp }) {
  const [activeGNovaTab, setActiveGNovaTab] = useState(0);
  const [digitalTwinState, setDigitalTwinState] = useState('running'); // 'running' | 'standby' | 'alarm'

  const metricPills = [
    { label: '< 500 ms', sub: 'Telemetry Latency', icon: Zap },
    { label: '99.9%', sub: 'System Availability', icon: ShieldCheck },
    { label: '35%', sub: 'Downtime Reduction', icon: Activity },
    { label: '100%', sub: 'Digital Audit Trail', icon: FileCheck }
  ];

  const fourMFramework = [
    {
      key: 'man',
      badge: 'MAN',
      title: 'Workforce & Roles',
      color: '#0B3A70',
      bgColor: '#EBF3FC',
      icon: Users,
      desc: 'Governance of operational personnel, shift technicians, and emergency responders across multi-facility operations.',
      bullets: [
        'Granular Role-Based Access (Super Admin to Operator)',
        'Direct Device & Facility User Assignment',
        'Shift logging & technician accountability',
        'Special permission overrides & audit logs'
      ]
    },
    {
      key: 'machine',
      badge: 'MACHINE',
      title: 'Asset & Telemetry',
      color: '#16A34A',
      bgColor: '#DCFCE7',
      icon: Cpu,
      desc: 'Deep hardware telemetry instrumentation and continuous physical asset health monitoring.',
      bullets: [
        '7-step lifecycle asset builder & specs tracking',
        'IoT edge controller linkage (MAC / Device ID)',
        'Real-time sensor feeds (bar, PSI, kW, Amps)',
        'Motor run hours & duty cycle rotation'
      ]
    },
    {
      key: 'material',
      badge: 'MATERIAL',
      title: 'Spares & Inventory',
      color: '#D97706',
      bgColor: '#FEF3C7',
      icon: Layers,
      desc: 'Real-time synchronization of consumable parts, critical spares, and procurement buffers.',
      bullets: [
        'Critical machine spare parts mapping',
        'Minimum inventory threshold alerts',
        'Replacement logs & supplier procurement data',
        'Consumable consumption tracking'
      ]
    },
    {
      key: 'method',
      badge: 'METHOD',
      title: 'SOPs & Maintenance',
      color: '#9333EA',
      bgColor: '#F3E8FF',
      icon: FileCheck,
      desc: 'Standard operating procedures, preventative schedules, and automated emergency escalation.',
      bullets: [
        'Automated AMC & warranty tracking',
        'Preventative maintenance scheduling',
        'Digital document vault (manuals, circuit diagrams)',
        'Automated emergency trip SOP escalation'
      ]
    }
  ];

  const gNovaTemplates = [
    {
      id: 'booster',
      category: 'PUMPING',
      title: 'Domestic Terrace Booster System',
      badgeColor: '#0284C7',
      badgeBg: '#E0F2FE',
      summary: 'Designed for residential and commercial multi-story pressure management. Features dynamic 3-pump or multi-stage booster monitoring, header discharge pressure gauge (0-10 bar), line trip protections, suction tank dry-run cutoff, and auto-duty alternation to balance motor wear and prevent coil burnout.',
      tags: ['Auto / Manual Modes', 'VFD Frequency Hz', 'Header Pressure'],
      telemetry: [
        { name: 'Discharge Header Pressure', value: '4.2 bar', normal: '3.8 - 4.5 bar', status: 'Optimal' },
        { name: 'Suction Line Level', value: '88 %', normal: '> 20 %', status: 'Safe' },
        { name: 'Pump 1 Status (Active)', value: '48.5 Hz', normal: '0 - 50 Hz', status: 'Running' },
        { name: 'Pump 2 Status (Standby)', value: '0.0 Hz', normal: 'Ready', status: 'Standby' },
        { name: 'Motor Draw Current', value: '14.2 A', normal: '< 18.0 A', status: 'Normal' }
      ]
    },
    {
      id: 'fire',
      category: 'SAFETY',
      title: 'Fire Fighting & Hydrant Panel',
      badgeColor: '#DC2626',
      badgeBg: '#FEE2E2',
      summary: 'Mission-critical life-safety surveillance panel tracking Jockey Pump, Main Electric Hydrant Pump, and Diesel Standby Engine. Features real-time annunciator window alarms, battery voltage monitoring, engine cranking status, fuel tank level indicators, and NFPA/NBC compliant pressure threshold logging.',
      tags: ['Diesel Cranking Status', 'Jockey Pump Cycling', 'Header Bar Alert'],
      telemetry: [
        { name: 'Hydrant Ring Pressure', value: '7.5 bar', normal: '7.0 - 8.5 bar', status: 'Armed' },
        { name: 'Jockey Pump Cut-in', value: '6.0 bar', normal: 'Setpoint', status: 'Standby' },
        { name: 'Diesel Engine Battery', value: '26.8 VDC', normal: '24.0 - 28.0 V', status: 'Charged' },
        { name: 'Diesel Fuel Reservoir', value: '94 %', normal: '> 70 %', status: 'Optimal' },
        { name: 'Annunciator Panel', value: 'ALL CLEAR', normal: '0 Trips', status: 'Normal' }
      ]
    },
    {
      id: 'sump',
      category: 'TRANSFER',
      title: 'Sump to Overhead Tank (OHT) Automation',
      badgeColor: '#2563EB',
      badgeBg: '#DBEAFE',
      summary: 'Dual-reservoir automated liquid transfer control. Continuously computes sump suction levels and overhead tank availability using ultrasonic or magnetic level sensors. Automatically triggers transfer pump cycles, prevents dry-run cavitation, and signals overflow prevention interlocks.',
      tags: ['High/Low Level Sensors', 'Overflow Protection', 'Runtime Counter'],
      telemetry: [
        { name: 'Raw Water Sump Level', value: '76 %', normal: '> 25 %', status: 'Sufficient' },
        { name: 'Overhead Tank (OHT)', value: '42 %', normal: 'Trigger @ 35%', status: 'Pumping' },
        { name: 'Transfer Pump 1', value: 'RUNNING', normal: 'Duty Mode', status: 'Active' },
        { name: 'Dry Run Protection', value: 'INTERLOCKED', normal: 'Closed', status: 'Safe' },
        { name: 'Total Gallons Shift', value: '48,500 L', normal: 'Daily Target', status: 'Logged' }
      ]
    },
    {
      id: 'hypn',
      category: 'SUSTAINABILITY',
      title: 'Hydro-Pneumatic (HYPN) & Flushing Systems',
      badgeColor: '#059669',
      badgeBg: '#D1FAE5',
      summary: 'Constant-pressure variable flow pumping for sanitary flushing and recycled greywater loops. Monitors energy consumption per cubic meter pumped, bladder tank pre-charge pressures, and detects instantaneous micro-leaks in building risers before internal water damage can occur.',
      tags: ['Micro-Leak Detection', 'Energy (kWh) Tracking', 'Greywater Recycle'],
      telemetry: [
        { name: 'Loop Delivery Pressure', value: '3.5 bar', normal: '3.2 - 3.8 bar', status: 'Constant' },
        { name: 'Micro-Leak Detection', value: 'NO LEAK', normal: '0.00 L/min', status: 'Secured' },
        { name: 'Energy Consumption', value: '0.42 kWh/m³', normal: '< 0.55 kWh/m³', status: 'Efficient' },
        { name: 'Greywater Filtration', value: '99.2 %', normal: '> 95 %', status: 'Clean' },
        { name: 'Bladder Tank Pressure', value: '2.8 bar', normal: '2.5 - 3.0 bar', status: 'Optimal' }
      ]
    }
  ];

  const telemetryMatrix = [
    {
      module: 'Booster Pumps',
      parameters: 'Suction Pressure, Discharge Header Pressure, Motor Current (R/Y/B Amps), Voltage, VFD Speed',
      interlocks: 'Dry Run Cutoff, Phase Failure, Overcurrent, High Pressure Burst',
      control: 'Auto / Manual / Remote Start-Stop / Setpoint Adjust'
    },
    {
      module: 'Fire Safety System',
      parameters: 'Main Hydrant Pressure, Jockey Pressure, Diesel Battery Volts, Fuel Level %, Engine Oil Temp',
      interlocks: 'Low Pressure Alarm, Engine Fail-to-Start, Charger Fail',
      control: 'Emergency Alarm Silence, Test Mode, Manual Override'
    },
    {
      module: 'STP & Drainage',
      parameters: 'Sump High Level, Equalization Tank Level, Aeration Blower Run, Discharge Turbidity / TDS',
      interlocks: 'Basement Flood Interlock, Thermal Overload Trip',
      control: 'Blower Timer Schedule, Auto Sludge Pump Cycle'
    },
    {
      module: 'Landscape Irrigation',
      parameters: 'Zone Solenoid Status, Line Flow Rate (LPM), Soil Moisture %, Weather Interlock',
      interlocks: 'Pipe Burst Shutdown, No-Water Flow Lockout',
      control: 'Zone Scheduling, Remote Rain-Delay Mode'
    }
  ];

  const userRoles = [
    {
      role: 'Super Admin',
      scope: 'Global Multi-Tenant Authority',
      desc: 'Full visibility across all societies, main facilities, user credentials, system configs, and master permission templates.',
      caps: ['Global multi-facility dashboard', 'System threshold & alarm policy', 'Tenant provisioning & billing', 'Raw telemetry export & logs']
    },
    {
      role: 'Facility Admin',
      scope: 'Campus & Complex Management',
      desc: 'Supervises all towers, pump rooms, employee shift assignments, and operational maintenance for their assigned complex.',
      caps: ['Campus asset hierarchy control', 'Shift technician assignment', 'Preventative maintenance sign-off', 'Local setpoint overrides']
    },
    {
      role: 'Maintenance Eng.',
      scope: 'Asset Lifecycle & Field Repairs',
      desc: 'Manages equipment health, spare part inventories, AMC contract renewals, and responds to high-priority equipment alerts.',
      caps: ['Asset calibration & builder', 'Spare inventory deduction', 'Fault snapshot diagnostics', 'AMC contract renewal logs']
    },
    {
      role: 'Device Operator',
      scope: 'Machine-Locked Execution',
      desc: 'Dedicated access strictly locked to specific machines (e.g., booster pump operator). Prevents accidental cross-facility errors.',
      caps: ['Live single-screen G-Nova view', 'Manual pump start / stop cycle', 'Physical shift checklist log', 'Direct SOS emergency trip button']
    }
  ];

  const techSpecs = [
    { layer: 'Edge Protocols', spec: 'MQTT (v3.1.1 / v5.0), Modbus RTU over RS-485, Modbus TCP/IP, AIPCU Controller protocol, HTTP REST Webhooks' },
    { layer: 'Supported Hardware', spec: 'Siemens, Schneider Electric, ABB, Delta, Custom IoT Microcontroller Gateways, Ultrasonic/Hydrostatic Level Transmitters' },
    { layer: 'Cloud Core Engine', spec: 'NestJS (Enterprise TypeScript), Prisma ORM, PostgreSQL with TimescaleDB indexing, Redis pub/sub queueing' },
    { layer: 'Frontend G-Nova UI', spec: 'React 18+, TypeScript, Tailwind CSS, Native Canvas/SVG Telemetry Visualizers, Socket.io Real-Time Client' },
    { layer: 'Deployment Modes', spec: 'Multi-tenant Cloud SaaS (AWS / Azure / GCP), Private Cloud Dedicated Cluster, or Local On-Premise Server deployment' },
    { layer: 'Data Export & APIs', spec: 'Automated CSV / Excel / PDF report generation, RESTful APIs for ERP / SAP integration, Third-Party BI connectors' }
  ];

  const targetIndustries = [
    {
      title: 'Smart Real Estate',
      desc: 'High-rise residential societies, commercial IT parks, gated communities.',
      badge: 'Commercial & Residential'
    },
    {
      title: 'Industrial Plants',
      desc: 'Textile mills, automotive lines, food & beverage processing, utility rooms.',
      badge: 'Manufacturing & Plants'
    },
    {
      title: 'Healthcare & Hotels',
      desc: 'Continuous water supply, hot water recirc loops, fire compliance monitoring.',
      badge: 'Critical Infrastructure'
    },
    {
      title: 'Municipal Utilities',
      desc: 'Sewage treatment plants (STP), water pumping stations, storm-water sumps.',
      badge: 'Public Sector & Water'
    }
  ];

  return (
    <div style={{ backgroundColor: '#e8e8e8', minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      
      {/* 1. HERO SECTION (WHITE WITH GREY CURVATURE ARC) */}
      <section 
        style={{ 
          backgroundColor: '#FFFFFF', 
          textAlign: 'center', 
          paddingTop: '2.5rem', 
          paddingBottom: '4.5rem', 
          paddingLeft: '1.5rem', 
          paddingRight: '1.5rem', 
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle top grid background */}
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
            backgroundSize: '4rem 4rem'
          }}
        />

        {/* Horizon Curvature Arc in Grey (#e8e8e8) */}
        <div
          className="absolute left-1/2 top-[calc(100%-110px)] sm:top-[calc(100%-130px)] md:top-[calc(100%-150px)] lg:top-[calc(100%-170px)] 
          h-[480px] w-[700px] md:h-[550px] md:w-[1100px] lg:h-[750px] lg:w-[140%] 
          -translate-x-1/2 rounded-[100%] border-t border-slate-300/40 bg-[#e8e8e8] 
          shadow-[0_-20px_50px_rgba(0,0,0,0.06)] pointer-events-none z-0"
          style={{
            backgroundColor: '#e8e8e8'
          }}
        />

        <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          


          {/* Headline matching Lora handwriting font style and #00A3FF brush underline */}
          <div className="relative inline-block">
            <h1 
              className="text-balance text-slate-900"
              style={{ 
                fontFamily: "'Lora', serif",
                fontSize: 'clamp(1.75rem, 4.5vw, 3.87rem)',
                lineHeight: '1.15',
                letterSpacing: '-0.01em',
                paddingTop: '0.25rem',
                paddingBottom: '0.75rem',
                display: 'inline-block',
                position: 'relative',
                zIndex: 1,
                fontWeight: 600
              }}
            >
              <span>Intelligent Facility </span>
              <br className="hidden sm:inline" />
              <span>Automation & </span>
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 font-semibold" style={{ color: '#FC787D' }}>
                  Industrial IoT
                </span>
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
              {/* Hand-drawn curved arrow pointing to the text */}
              <svg
                className="w-14 h-10 md:w-16 md:h-12 lg:w-20 lg:h-14 pointer-events-none overflow-visible -mr-1 mb-2"
                viewBox="0 0 80 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Curved arc from logo towards the text */}
                <path
                  d="M 76 38 C 55 46, 24 38, 8 14"
                  stroke="#7B5872"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Arrowhead */}
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
                  src={getAssetUrl("/G-Nova IOT logo 02.jpg")} 
                  alt="G-Nova IoT Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.4)' }}
                />
              </div>
            </div>
          </div>

          <p 
            className="text-balance text-gray-600 font-normal"
            style={{ 
              fontSize: 'clamp(0.92rem, 1.58vw, 1.1rem)', 
              lineHeight: '1.65', 
              maxWidth: '760px',
              margin: '1.25rem auto 2rem',
              position: 'relative',
              zIndex: 1,
              fontWeight: 400
            }}
          >
            A unified cloud-native platform providing sub-second G-Nova visualization, predictive fault alarms, and complete 4M (Man, Machine, Material, Method) asset governance for commercial towers, residential townships, and industrial facilities.
          </p>

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
            <button
              onClick={onOpenExpertModal}
              style={{
                padding: '0.8rem 1.85rem',
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
              <span>Schedule Live G-Nova Demo</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Metric Badges */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
              gap: '1rem',
              position: 'relative',
              zIndex: 1
            }}
          >
            {metricPills.map((m, idx) => {
              const IconComp = m.icon;
              return (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'center',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.4rem', color: '#0B3A70' }}>
                    <IconComp size={20} />
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '600', color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', fontWeight: '400' }}>
                    {m.sub}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 2. EXECUTIVE SUMMARY & ARCHITECTURE FLOW */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '3rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              EXECUTIVE OVERVIEW
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
              Bridging Edge Telemetry with Enterprise Workflows
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
        </div>

        {/* Full-width container extending white background to the RIGHT */}
        <div 
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '3rem'
          }}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: 'min(100%, calc(50vw + 560px))',
              marginLeft: 'auto',
              marginRight: 0,
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #CBD5E1',
              borderBottom: '1px solid #CBD5E1',
              borderLeft: '1px solid #CBD5E1',
              borderRight: 'none',
              borderTopLeftRadius: '28px',
              borderBottomLeftRadius: '28px',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
              paddingTop: '2.25rem',
              paddingBottom: '2.25rem',
              paddingLeft: '1.5rem',
              paddingRight: 'max(1.5rem, calc((100vw - 1120px) / 2 + 1.5rem))',
              boxSizing: 'border-box'
            }}
          >
            <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: '1.7', margin: 0, fontWeight: '400', maxWidth: '1072px' }}>
              Modern infrastructure facilities and smart buildings depend heavily on critical electromechanical systems—including booster water pumps, fire hydrants, sewage treatment plants (STP), and HVAC systems. Traditionally, these assets operate in silos, requiring manual paper logs and reactive repairs after catastrophic breakdowns occur. <strong>G-Nova IoT & 4M ERP</strong> bridges this gap by marrying real-time edge telemetry (G-Nova) with rigorous enterprise operational workflows, giving management, facility directors, and field engineers complete transparency over equipment health, energy draw, and operational safety.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* High-Level Architecture & Signal Flow */}
          <div style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: '#0F172A', marginBottom: '1.25rem' }}>
              High-Level Architecture & Signal Flow
            </h3>
            
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: '1rem',
                position: 'relative'
              }}
            >
              {[
                {
                  step: '1',
                  title: 'Field Sensors & PLC',
                  desc: 'Pressure transducers, flow meters, energy meters, AIPCU controllers.',
                  icon: Radio
                },
                {
                  step: '2',
                  title: 'Edge IoT Gateway',
                  desc: 'Modbus RS485 / Ethernet / 4G GSM MQTT Publisher pipelines.',
                  icon: Cpu
                },
                {
                  step: '3',
                  title: 'G Mark Core Engine',
                  desc: 'NestJS Microservices, TimescaleDB, Prisma ORM, Redis Event Bus.',
                  icon: Server
                },
                {
                  step: '4',
                  title: 'Real-time G-Nova UI',
                  desc: 'React WebSocket Dashboard, Sub-second visualizer, Multi-channel Alerts.',
                  icon: Gauge
                }
              ].map((flow, idx) => {
                const FlowIcon = flow.icon;
                return (
                  <div 
                    key={idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EBF3FC', color: '#0B3A70', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FlowIcon size={20} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>
                        PHASE {flow.step}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '500', color: '#0F172A', margin: 0, marginBottom: '6px' }}>
                      {flow.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                      {flow.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 3. THE CORE 4M OPERATIONAL FRAMEWORK */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '3.5rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              PROVEN INDUSTRIAL METHODOLOGY
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
              The Core 4M Operational Framework
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
              The platform is engineered around the proven industrial 4M methodology to guarantee holistic plant and facility management:
            </p>
          </div>

          {/* 4M Grid - 4 Columns in 1 Row on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5">
            {fourMFramework.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '16px',
                    padding: '1.35rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
                  }}
                  className="hover:shadow-md transition-all duration-200"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: item.bgColor, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComponent size={20} />
                    </div>
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: '700', 
                        color: item.color, 
                        backgroundColor: item.bgColor, 
                        padding: '3px 8px', 
                        borderRadius: '100px',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0F172A', margin: 0, marginBottom: '6px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, marginBottom: '1rem', lineHeight: '1.45' }}>
                    {item.desc}
                  </p>

                  <div style={{ marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {item.bullets.map((b, bIdx) => (
                        <li key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.78rem', color: '#334155', lineHeight: '1.35' }}>
                          <Check size={14} style={{ color: item.color, flexShrink: 0, marginTop: '2px' }} />
                          <span>{b}</span>
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
      {/* 4. VISUAL ODOO-STYLE SHOWCASE 1: "LEVEL UP YOUR QUALITY OF WORK" (iot2.jpeg) */}
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
                          "If you simplify everything, you can do anything!"
                        </p>
                        <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '500' }}>
                          — Bill McDermott, former CEO of SAP
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
              Sub-second G-Nova visualization, pressure telemetry, and automated dual-pump duty cycling.
            </p>
          </div>

          {/* Elevated Showcase Frame with Elevated Window and Playback Scrubber (Exact Odoo Reference) */}
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
                  Dashboard / Flushing Terrace Booster System
                </div>

                <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: '700', letterSpacing: '0.04em' }}>
                  ● LIVE EDGE MQTT TELEMETRY
                </div>
              </div>

              {/* Real Booster System Dashboard Screenshot */}
              <div style={{ padding: '0.85rem', backgroundColor: '#F1F5F9' }}>
                <img 
                  src={getAssetUrl("/iot2.jpeg")} 
                  alt="Flushing Terrace Booster System G-Nova Dashboard"
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
      {/* 5. VISUAL ODOO-STYLE SHOWCASE 2: "NO MANUAL INSPECTIONS! JUST AUTOMATION" WITH OVERLAPPING CARD & CURVED ARROW (iot1.jpeg) */}
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
            
            {/* Line 1: No manual inspections! */}
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
                No manual inspections!
              </h2>
            </div>

            {/* Wavy blue brush stroke */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-4px', marginBottom: '4px' }}>
              <svg className="w-56 h-3 text-[#00A3FF]" viewBox="0 0 200 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M 4,6 Q 28,1 54,6 T 104,6 T 154,6 T 196,6" />
              </svg>
            </div>

            {/* Line 2: Just zero-fault automation */}
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
                Just zero-fault automation
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
              Experience zero false alarms. Our NFPA & NBC compliant edge telemetry continuously monitors hydrant & sprinkler pressure rings with instant incident escalation.
            </p>

          </div>

          {/* Overlapping Dual-Card Layout with Hand-Drawn Curved Arrow (Exact Odoo Reference 2) */}
          <div className="relative w-full max-w-5xl mx-auto mt-8">
            
            {/* Prominent Curved Hand-Drawn Arrow in Berry Plum (#7B5872) pointing from floating card to main fire panel */}
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

            {/* Floating Overlapping Telemetry & Pump Inspector Card (Top-Right) */}
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
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '100px' }}>
                  LIFE SAFETY G-NOVA
                </span>
                <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: '700' }}>
                  0 FAULTS
                </span>
              </div>
              
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFFFFF', margin: '0 0 6px' }}>
                Hydrant & Sprinkler Zone
              </h4>
              
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0 0 10px' }}>
                Upper Zone: <strong style={{ color: '#38BDF8' }}>8.6 bar (NORMAL)</strong>
              </p>

              {/* Mini Readiness Bar */}
              <div style={{ width: '100%', height: '6px', backgroundColor: '#334155', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', backgroundColor: '#10B981', borderRadius: '100px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#10B981', fontWeight: '600', marginTop: '4px' }}>
                <span>Jockey Pump Ready</span>
                <span>Armed (100%)</span>
              </div>
            </div>

            {/* Main Application Window Card displaying iot1.jpeg */}
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
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
                  Dashboard / Fire Panel System 3004202546
                </div>

                <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: '700', letterSpacing: '0.04em' }}>
                  FAULTS: 0 (ALL SYSTEMS NORMAL)
                </div>
              </div>

              {/* Real Fire Panel G-Nova Screenshot */}
              <div style={{ padding: '0.85rem', backgroundColor: '#F1F5F9' }}>
                <img 
                  src={getAssetUrl("/iot1.jpeg")} 
                  alt="Fire Panel System G-Nova Dashboard"
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

      {/* 6. TELEMETRY SENSOR & PARAMETER MATRIX (FULL TABLE) */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '3.5rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              INSTRUMENTATION MATRIX
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
              Telemetry Sensor & Parameter Matrix
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
                    <th style={{ padding: '1.1rem 1.5rem', fontWeight: '600', color: '#0F172A', width: '22%' }}>System Module</th>
                    <th style={{ padding: '1.1rem 1.5rem', fontWeight: '600', color: '#0F172A', width: '32%' }}>Monitored Telemetry Parameters</th>
                    <th style={{ padding: '1.1rem 1.5rem', fontWeight: '600', color: '#0F172A', width: '26%' }}>Safety Interlocks</th>
                    <th style={{ padding: '1.1rem 1.5rem', fontWeight: '600', color: '#0F172A', width: '20%' }}>Control Options</th>
                  </tr>
                </thead>
                <tbody>
                  {telemetryMatrix.map((row, idx) => (
                    <tr 
                      key={idx} 
                      style={{ 
                        borderBottom: idx < telemetryMatrix.length - 1 ? '1px solid #E2E8F0' : 'none',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FBFDFF'
                      }}
                    >
                      <td style={{ padding: '1.1rem 1.5rem', fontWeight: '500', color: '#0B3A70' }}>
                        {row.module}
                      </td>
                      <td style={{ padding: '1.1rem 1.5rem', color: '#334155', lineHeight: '1.5' }}>
                        {row.parameters}
                      </td>
                      <td style={{ padding: '1.1rem 1.5rem', color: '#DC2626', fontWeight: '500' }}>
                        {row.interlocks}
                      </td>
                      <td style={{ padding: '1.1rem 1.5rem', color: '#16A34A', fontWeight: '500' }}>
                        {row.control}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 6. ENTERPRISE GOVERNANCE, TENANCY & ALERTS */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '3.5rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              GOVERNANCE & SECURITY
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
              Multi-Tier Hierarchy, Alerts & Tenancy
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

          {/* 3-Tier Hierarchy Cards */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem'
            }}
          >
            {[
              {
                tier: '1. Organization / Society',
                desc: 'The top-level enterprise boundary. Defines corporate policies, global user pools, GST/billing compliance, and master administrative privileges.'
              },
              {
                tier: '2. Main & Sub-Facilities',
                desc: 'Physical properties, corporate campuses, residential towers, or manufacturing units with localized facility heads and geospatial mapping.'
              },
              {
                tier: '3. Machines & IoT Nodes',
                desc: 'Discrete equipment items linked to hardware telemetry controllers. Complete with specifications, AMC contracts, spare parts, and live telemetry feeds.'
              }
            ].map((t, idx) => (
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
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0B3A70', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  TIER LEVEL 0{idx + 1}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#0F172A', margin: 0, marginBottom: '8px' }}>
                  {t.tier}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, lineHeight: '1.6' }}>
                  {t.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Alerting & Incident Diagnostics 2-Col Card */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem'
            }}
          >
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EBF3FC', color: '#0B3A70', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '500', color: '#0F172A', margin: 0 }}>
                  Automated Multi-Channel Notifications
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                Configurable alert triggers evaluate parameter thresholds (e.g. pressure below 2.0 bar, motor trip, thermal breach). Instant HTML email summaries with device location, current values, and direct G-Nova dashboard deep-links are dispatched to assigned engineers and technicians.
              </p>
            </div>

            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '500', color: '#0F172A', margin: 0 }}>
                  Fault History & Snapshot Logging
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                Every alarm incident automatically captures a sub-second time-series snapshot of all registers before and after the event. This forensic log allows maintenance teams to pinpoint root causes (e.g., power surge vs. pipe burst) without guesswork.
              </p>
            </div>
          </div>

          {/* Security & Compliance Footer Box */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '16px',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Lock size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#0F172A', margin: 0, marginBottom: '4px' }}>
                Enterprise Security & Compliance Standards
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                Built with state-of-the-art web security: JWT authentication with rotating access tokens, bcrypt password hashing, encrypted TLS WebSocket pipelines, and automated tamper-evident Audit Logging tracking every user click, export, and configuration edit.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. ROLE-BASED ACCESS CONTROL (RBAC) */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '3.5rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ACCESS DELEGATION
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
              Role-Based Access Control (RBAC)
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
              Security is enforced at every layer. Users only see and control the facilities and machines explicitly delegated to their profile:
            </p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: '1.25rem'
            }}
          >
            {userRoles.map((r, idx) => (
              <div 
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0B3A70', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  {r.scope}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '500', color: '#0F172A', margin: 0, marginBottom: '6px' }}>
                  {r.role}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  {r.desc}
                </p>

                <div style={{ marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '0.9rem' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {r.caps.map((c, cIdx) => (
                      <li key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#334155' }}>
                        <Check size={14} style={{ color: '#16A34A', flexShrink: 0 }} />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. PLATFORM TECHNICAL SPECIFICATIONS */}
      <section 
        style={{ 
          backgroundColor: '#e8e8e8', 
          borderBottom: '1px solid #CBD5E1', 
          padding: '3.5rem 0 4.5rem' 
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              TECHNICAL ARCHITECTURE
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
              Platform Technical Specifications
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

          <div 
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              marginBottom: '2.5rem'
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                    <th style={{ padding: '1.1rem 1.5rem', fontWeight: '600', color: '#0F172A', width: '28%' }}>Architectural Layer</th>
                    <th style={{ padding: '1.1rem 1.5rem', fontWeight: '600', color: '#0F172A', width: '72%' }}>Technical Specification & Capabilities</th>
                  </tr>
                </thead>
                <tbody>
                  {techSpecs.map((row, idx) => (
                    <tr 
                      key={idx} 
                      style={{ 
                        borderBottom: idx < techSpecs.length - 1 ? '1px solid #E2E8F0' : 'none',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FBFDFF'
                      }}
                    >
                      <td style={{ padding: '1.1rem 1.5rem', fontWeight: '600', color: '#0B3A70' }}>
                        {row.layer}
                      </td>
                      <td style={{ padding: '1.1rem 1.5rem', color: '#334155', lineHeight: '1.5' }}>
                        {row.spec}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Target Industries */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: '#0F172A', marginBottom: '1.25rem' }}>
              Key Target Industries & Implementations
            </h3>

            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: '1rem'
              }}
            >
              {targetIndustries.map((ind, idx) => (
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
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0B3A70', backgroundColor: '#EBF3FC', padding: '3px 8px', borderRadius: '6px' }}>
                    {ind.badge}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '500', color: '#0F172A', margin: '8px 0 4px' }}>
                    {ind.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                    {ind.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Ecosystem Applications */}
          <div style={{ marginTop: '3.5rem', paddingTop: '3rem', borderTop: '1px solid #CBD5E1' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#0B3A70', fontWeight: '400', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                INTEGRATED PLATFORM ARCHITECTURE
              </span>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.35rem, 2.64vw, 1.98rem)', fontWeight: 600, color: '#0F172A', letterSpacing: '0', marginTop: '4px' }}>
                Seamlessly Connected to the G Mark Ecosystem
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'erp', name: 'ERP', tag: 'Core Enterprise ERP', image: getAssetUrl('/ERP Logo.png') },
                { id: 'g-track', name: 'G Track', tag: 'Field Force & GPS Telemetry', image: getAssetUrl('/G Track logo.png') },
                { id: 'gram-unnati', name: 'GramUnnati', tag: 'Agri-Commerce Platform', image: getAssetUrl('/gramunnati-clean.png') },
                { id: 'task-management', name: 'SynkroBoard', tag: 'Task Management & Collaboration', image: getAssetUrl('/synkroboard-clean.png') }
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
          </div>

        </div>
      </section>

      {/* 9. BOTTOM CTA BANNER (WHITE BACKGROUND) */}
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
            ENTERPRISE DEPLOYMENT
          </span>

          <h2 
            style={{ 
              fontFamily: "'Lora', serif",
              fontSize: 'clamp(1.5rem, 3.17vw, 2.24rem)', 
              fontWeight: 600, 
              color: '#0F172A', 
              letterSpacing: '0',
              margin: '0 0 1rem' 
            }}
          >
            Ready to Transform Your Facility Operations?
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
            Schedule a live proof-of-concept demonstration or connect with our IoT solution architects.
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
              <span>Schedule Live G-Nova Demo</span>
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
