// Comprehensive Module Registry for all Solutions and Technology Modules
// Provides unique domain metadata, metrics, architecture pillars, and operational workflows for every module.

export const MODULES_REGISTRY = {
  // =========================================================================
  // SOLUTIONS — CATEGORY 1: CORE ERP & FINANCE
  // =========================================================================
  'erp-core': {
    id: 'erp-core',
    name: 'Enterprise ERP Core',
    category: 'CORE ERP & FINANCE',
    categorySlug: 'core-erp-finance',
    navigationOrigin: 'solutions',
    badge: 'Multi-Tenant Platform',
    tagline: 'Multi-tenant cloud core with high-concurrency database engine, master catalogs & role-based governance',
    description: 'The foundation of G Mark ERP. Combines centralized customer and vendor catalogs, role-based permission matrices (RBAC), multi-tenant data partitioning, and real-time ledger synchronization across distributed enterprise nodes.',
    metrics: [
      { label: '< 50ms Query Engine', sub: 'PostgreSQL & Prisma ORM', val: '50ms' },
      { label: 'Role-Based Access', sub: 'JWT Bearer & Granular RBAC', val: '100%' },
      { label: 'Audit Trail Lock', sub: 'Immutable Ledger Logs', val: 'ISO 27001' },
      { label: 'Multilingual Support', sub: 'English, Marathi & Hindi', val: '3 Langs' }
    ],
    pillars: [
      { title: 'Centralized Multi-Tenant Core', desc: 'Secure logical isolation of company branches, warehouses, and distributor networks within a unified relational database architecture.', badge: 'Multi-Tenancy' },
      { title: 'System Master Repositories', desc: 'Single source of truth for unified chart of accounts, statutory tax codes, item catalogs, and customer-vendor profiles.', badge: 'Data Integrity' },
      { title: 'Granular RBAC Security', desc: 'Cryptographically verified JWT sessions with field-level permissions for cashiers, storekeepers, accountants, and executive CFOs.', badge: 'Access Control' },
      { title: 'Real-Time Pub/Sub Event Bus', desc: 'Sub-second event dispatching across billing desks, mobile field agents, and warehouse pickers via Redis state pub/sub.', badge: 'Event Engine' }
    ],
    workflow: [
      { step: '1', title: 'Organization Hierarchy Setup', desc: 'Configure company entities, tax registrations (GSTIN), financial years, and branch associations.' },
      { step: '2', title: 'Master Data Seeding', desc: 'Import chart of accounts, HSN directories, product categories, and baseline price books.' },
      { step: '3', title: 'User Role Assignment', desc: 'Define granular permissions, branch access boundaries, and dual-authorization approval hierarchies.' },
      { step: '4', title: 'Live Ledger Orchestration', desc: 'Real-time synchronization across billing counters, mobile logistics apps, and central balance sheets.' }
    ],
    technicalSpecs: [
      { label: 'Database Architecture', value: 'PostgreSQL 16 with TimescaleDB Extension' },
      { label: 'ORM & Schema Migration', value: 'Prisma Type-Safe Client Layer' },
      { label: 'Authentication Engine', value: 'OAuth2 / JWT Bearer + AWS SNS OTP Verification' },
      { label: 'API Protocols', value: 'RESTful OpenAPI 3.0 & Bidirectional WebSockets' }
    ]
  },

  'double-entry-accounting': {
    id: 'double-entry-accounting',
    name: 'Double-Entry Accounting',
    category: 'CORE ERP & FINANCE',
    categorySlug: 'core-erp-finance',
    navigationOrigin: 'solutions',
    badge: 'Statutory Finance',
    tagline: 'Standard double-entry journal postings, Chart of Accounts, four statutory voucher types & trial balance',
    description: 'Institutional-grade financial bookkeeping strictly governed by Luca Pacioli double-entry rules. Automates journal vouchers, payment receipts, contra transfers, and dynamic trial balance generation.',
    metrics: [
      { label: 'Mathematical Balance', sub: 'Debits = Credits Always', val: '100.0%' },
      { label: 'Voucher Coverage', sub: 'Receipt, Payment, Journal, Contra', val: '4 Types' },
      { label: 'Trial Balance Lag', sub: 'Real-Time Posting Roll-up', val: '0 Sec' },
      { label: 'Compliance Grade', sub: 'MCA & ICAI Standardized', val: 'Audit-Ready' }
    ],
    pillars: [
      { title: 'Universal Dual-Entry Balancing', desc: 'Every business event automatically verifies Debit = Credit equality before committing to the general ledger table.', badge: 'Zero Variance' },
      { title: 'Five-Tier Chart of Accounts', desc: 'Standardized hierarchical ledger structure categorizing Assets, Liabilities, Equity, Incomes, and Expenses.', badge: 'Statutory CoA' },
      { title: 'Four Statutory Voucher Protocols', desc: 'Dedicated interfaces for Bank/Cash Receipts, Vendor Payments, Internal Contra Transfers, and Depreciation Journals.', badge: 'Voucher Engine' },
      { title: 'Instantaneous Trial Balance', desc: 'Live computation of ledger debit/credit balances eliminates month-end closing bottlenecks.', badge: 'Instant Closing' }
    ],
    workflow: [
      { step: '1', title: 'Transaction Ingestion', desc: 'Capture economic events from sales invoices, vendor bills, payroll, or bank debits.' },
      { step: '2', title: 'Ledger Account Mapping', desc: 'Resolve source and destination accounts according to standard accounting rules.' },
      { step: '3', title: 'Dual-Entry Validation', desc: 'Enforce mathematical balance check (Σ Debits === Σ Credits) with currency precision.' },
      { step: '4', title: 'General Ledger Posting', desc: 'Append immutable ledger entry with timestamp and user signature for auditor traceability.' }
    ],
    technicalSpecs: [
      { label: 'Accounting Standards', value: 'Ind AS / IFRS Double-Entry Compliant' },
      { label: 'Currency Precision', value: 'High-precision 4-decimal numeric type' },
      { label: 'Audit Trail', value: 'Tamper-evident append-only ledger transaction log' },
      { label: 'Reporting Outputs', value: 'General Ledger, Cash Book, Trial Balance, P&L' }
    ]
  },

  'gst-eway-invoicing': {
    id: 'gst-eway-invoicing',
    name: 'GST & E-Way Invoicing',
    category: 'CORE ERP & FINANCE',
    categorySlug: 'core-erp-finance',
    navigationOrigin: 'solutions',
    badge: 'Tax Compliance',
    tagline: 'Automated CGST/SGST/IGST computation, statutory HSN directory, 12-digit E-Way bills & audit-locked invoices',
    description: 'Complete Indian statutory tax engine. Dynamically applies intra-state CGST+SGST or inter-state IGST, automatically validates consignment value against the ₹50,000 threshold for E-Way Bills, and generates print-ready QR invoices.',
    metrics: [
      { label: 'Tax Accuracy', sub: 'CGST, SGST & IGST Engine', val: '100%' },
      { label: 'HSN Directory', sub: 'Pre-seeded Goods & Services', val: '5,000+' },
      { label: 'E-Way Bill Ingest', sub: 'Automated 12-Digit Slip', val: 'Instant' },
      { label: 'Invoice Locking', sub: 'Tamper-Proof Audit Lock', val: 'Immutable' }
    ],
    pillars: [
      { title: 'Dynamic State GST Rules', desc: 'Auto-detects supplier vs recipient state code to trigger intra-state split (CGST+SGST) or inter-state IGST.', badge: 'Tax Logic' },
      { title: 'Statutory HSN/SAC Database', desc: 'Pre-loaded directory of goods and service codes with verified tax tier rates (0%, 5%, 12%, 18%, 28%).', badge: 'HSN Catalog' },
      { title: 'Automated E-Way Bill Lifecycle', desc: 'Flags dispatches above ₹50,000 and generates Part-A / Part-B transport documentation with vehicle mapping.', badge: 'Logistics Tax' },
      { title: 'Immutable Invoice Verification', desc: 'Post-generation invoice locking prevents retrospective modifications, ensuring statutory GST audit safety.', badge: 'Audit Safe' }
    ],
    workflow: [
      { step: '1', title: 'GSTIN & Place of Supply Validation', desc: 'Verify recipient GSTIN format and resolve supply jurisdiction.' },
      { step: '2', title: 'HSN-Driven Tax Calculation', desc: 'Lookup item statutory rates and calculate base, cess, and net tax payable.' },
      { step: '3', title: 'E-Way Bill Generation', desc: 'Bind transporter ID, vehicle license plate, and distance into compliant transport slip.' },
      { step: '4', title: 'QR Invoicing & Filing Export', desc: 'Generate printable tax invoice with QR code and export monthly GSTR-1/3B JSONs.' }
    ],
    technicalSpecs: [
      { label: 'Statutory Regulations', value: 'GST Act 2017 & NIC E-Way Bill Portal Schema' },
      { label: 'Tax Rates Handled', value: '0% (Nil), 5%, 12%, 18%, 28% + Statutory Cess' },
      { label: 'Data Export Formats', value: 'Official GSTR-1 & GSTR-3B Compliant JSON / CSV' },
      { label: 'Barcode/QR Code', value: 'Dynamic B2B e-Invoicing QR Code Matrix' }
    ]
  },

  'sales-purchase-orders': {
    id: 'sales-purchase-orders',
    name: 'Sales & Purchase Orders',
    category: 'CORE ERP & FINANCE',
    categorySlug: 'core-erp-finance',
    navigationOrigin: 'solutions',
    badge: 'Order Processing',
    tagline: 'End-to-end commercial lifecycle: Quotation to Billing, and Vendor Purchase Order to Inward GRN',
    description: 'Governs high-volume trade workflows with strict document linkages. Sales pipeline handles Quotations, SO Confirmation, Delivery Challans, and Invoicing. Procurement pipeline handles Purchase Requisitions, PO Approval, Goods Receipt Notes (GRN), and 3-way matching.',
    metrics: [
      { label: 'Sales Fulfillment', sub: '5-Stage Order-to-Cash', val: '5 Steps' },
      { label: 'Procurement Matching', sub: 'PO vs GRN vs Vendor Bill', val: '3-Way Match' },
      { label: 'Approval Speed', sub: 'Automated Thresholds', val: '< 2 Hrs' },
      { label: 'Order Traceability', sub: 'Unique Document Barcodes', val: '100%' }
    ],
    pillars: [
      { title: 'Order-to-Cash (O2C) Discipline', desc: 'Full sequential chain from quotation creation to customer invoice and receipt voucher allocation.', badge: 'Sales Engine' },
      { title: 'Procure-to-Pay (P2P) Governance', desc: 'Enforces purchase requisition approvals, multi-vendor rate comparisons, and formal PO generation.', badge: 'Procurement' },
      { title: '3-Way Invoice Matching', desc: 'Guarantees vendor invoices are matched against approved PO line quantities and physical GRN receipts before payment.', badge: 'Leakage Control' },
      { title: 'Credit Limit & Risk Controls', desc: 'Prevents delivery challan creation if customer outstanding receivables exceed assigned credit ceiling.', badge: 'Credit Safety' }
    ],
    workflow: [
      { step: '1', title: 'Quotation / Requisition Stage', desc: 'Create price estimate for buyer or internal department purchase indent.' },
      { step: '2', title: 'Formal Order Confirmation', desc: 'Approve Sales Order (SO) or Purchase Order (PO) with locked commercial terms.' },
      { step: '3', title: 'Physical Movement (Challan / GRN)', desc: 'Generate warehouse pick slip & delivery challan or receive goods via QC inspection note.' },
      { step: '4', title: 'Commercial Billing & Settlement', desc: 'Generate statutory tax invoice or register vendor bill with 3-way line matching.' }
    ],
    technicalSpecs: [
      { label: 'Workflow Stages', value: '5-Step Sales Cycle & 5-Step Procurement Cycle' },
      { label: 'Matching Algorithm', value: 'Strict 3-Way Line Item Quantity & Price Verification' },
      { label: 'Document Numbering', value: 'Customizable Prefix / Suffix / Financial Year Sequences' },
      { label: 'Delivery Integration', value: 'Direct Dispatch Challan to E-Way Bill Bridge' }
    ]
  },

  'multi-warehouse-inventory': {
    id: 'multi-warehouse-inventory',
    name: 'Multi-Warehouse Inventory',
    category: 'CORE ERP & FINANCE',
    categorySlug: 'core-erp-finance',
    navigationOrigin: 'solutions',
    badge: 'Stock Logistics',
    tagline: 'Multi-depot stock allocation, Available-to-Promise (ATP) reservations, zero-negative stock lock & transfer orders',
    description: 'Enterprise multi-location inventory management. Tracks physical on-hand stock, sales-reserved allocations, and Available-to-Promise (ATP) stock across mother hubs, regional depots, and field collection points with strict FIFO/FEFO batch controls.',
    metrics: [
      { label: 'Negative Stock Risk', sub: 'Zero Tolerance System Lock', val: '0.0%' },
      { label: 'Stock Calculation', sub: 'On-Hand · Reserved · ATP', val: '3-State' },
      { label: 'Transfer Tracking', sub: 'Live In-Transit Ledgers', val: 'STO Ready' },
      { label: 'Batch Traceability', sub: 'First-Expiry-First-Out', val: 'FIFO / FEFO' }
    ],
    pillars: [
      { title: 'Three-State Real-Time Allocation', desc: 'Differentiates physical stock, committed customer reservations, and Available-to-Promise (ATP) quantities.', badge: 'Stock Accuracy' },
      { title: 'Zero-Negative Stock Hard Lock', desc: 'System-level validation rejects dispatch creation if ATP is insufficient, eliminating inventory variance.', badge: 'Integrity' },
      { title: 'Inter-Warehouse Transfers (STO)', desc: 'Hub-and-spoke stock movement with in-transit accounts, vehicle manifests, and receiving depot QC.', badge: 'Logistics' },
      { title: 'Batch & Expiry Traceability', desc: 'Granular lot tracking enforcing FIFO / FEFO rotation to safeguard perishable agricultural inputs and medicines.', badge: 'Batch Control' }
    ],
    workflow: [
      { step: '1', title: 'Depot Hierarchy Definition', desc: 'Organize mother hubs, regional distribution centers, and field retail nodes.' },
      { step: '2', title: 'Inward Ingestion via GRN', desc: 'Receive consignments with batch numbers, manufacturing dates, and bin assignments.' },
      { step: '3', title: 'Real-Time Order Reservation', desc: 'Lock stock for confirmed sales orders without physically moving items from bins.' },
      { step: '4', title: 'Pick, Pack & STO Dispatch', desc: 'Generate pick waves and stock transfer manifests with automatic transit balance accounting.' }
    ],
    technicalSpecs: [
      { label: 'Inventory Valuation', value: 'FIFO, Weighted Average Cost (WAC) & Batch Costing' },
      { label: 'Allocation Model', value: 'Physical On-Hand - Open Sales Commitments = ATP' },
      { label: 'Barcode Support', value: 'Code 128, QR Code, GS1 DataMatrix' },
      { label: 'Audit Reconciliation', value: 'Cycle Counting, Annual Physical Audit & Variance Journal' }
    ]
  },

  'branch-ledger-cashflow': {
    id: 'branch-ledger-cashflow',
    name: 'Branch Ledger & Cashflow',
    category: 'CORE ERP & FINANCE',
    categorySlug: 'core-erp-finance',
    navigationOrigin: 'solutions',
    badge: 'Treasury & Ledger',
    tagline: 'Multi-branch distributed accounting, daily cashbook, BRS bank reconciliation & real-time Profit & Loss reporting',
    description: 'Empowers distributed branch accountants with local billing independence while giving corporate finance instant consolidated Profit & Loss, balance sheets, and daily cashflow forecasting with automatic inter-branch contra eliminations.',
    metrics: [
      { label: 'Consolidation Lag', sub: 'Real-Time General Ledger', val: '0 Sec' },
      { label: 'Inter-Branch Contra', sub: 'Auto Elimination of Doubles', val: '100%' },
      { label: 'Bank Reconciliation', sub: 'Daily Electronic BRS', val: 'Automated' },
      { label: 'Statutory Reports', sub: 'Schedule III P&L & Balance Sheet', val: 'Instant' }
    ],
    pillars: [
      { title: 'Inter-Branch Contra Elimination', desc: 'Prevents internal turnover inflation by automatically eliminating mutual branch debit/credit transfers.', badge: 'Consolidation' },
      { title: 'Daily Cashbook & Electronic BRS', desc: 'Reconciles bank statements against recorded payments to track unpresented cheques and direct ECS debits.', badge: 'Bank Reconcile' },
      { title: 'Receivables & Payables Aging', desc: 'Categorizes debtor/creditor balances into 30, 60, 90, and 120+ day buckets with credit freeze alerts.', badge: 'Working Capital' },
      { title: 'Real-Time Profit & Loss (P&L)', desc: 'Instantaneous computation of Trading Accounts, Gross Margins, and Net Operating Surplus across branches.', badge: 'P&L Statement' }
    ],
    workflow: [
      { step: '1', title: 'Branch Ledger Partitioning', desc: 'Establish autonomous chart of accounts and sub-ledgers for each company branch.' },
      { step: '2', title: 'Daily Counter Reconciliation', desc: 'Close daily cash drawers, verify POS credit batches, and import electronic bank statements.' },
      { step: '3', title: 'Inter-Branch Contra Matching', desc: 'Pair internal supply bills and transfer orders to zero out reciprocal balances.' },
      { step: '4', title: 'Consolidated Statement Roll-Up', desc: 'Generate multi-branch consolidated P&L, balance sheets, and liquidity forecast models.' }
    ],
    technicalSpecs: [
      { label: 'Reporting Framework', value: 'Indian Companies Act Schedule III & Ind AS' },
      { label: 'BRS Matching Engine', value: 'Algorithmic Cheque Number, UTR & Amount Matching' },
      { label: 'Aging Interval', value: 'Configurable 30 / 60 / 90 / 120+ Day Aging Buckets' },
      { label: 'Multi-Currency Support', value: 'INR Base Currency with FX Revaluation Support' }
    ]
  },

  // =========================================================================
  // SOLUTIONS — CATEGORY 2: 4M OPERATIONS & CMMS
  // =========================================================================
  'cmms-suite': {
    id: 'cmms-suite',
    name: '4M Smart CMMS Suite',
    category: '4M OPERATIONS & CMMS',
    categorySlug: '4m-operations-cmms',
    navigationOrigin: 'solutions',
    badge: 'Industrial Operations',
    tagline: 'Integrated Man, Machine, Material & Method industrial maintenance suite with computerized workflow management',
    description: 'Comprehensive Computerized Maintenance Management System (CMMS) built upon the Japanese 4M industrial framework. Synchronizes technician staffing (Man), asset telemetry (Machine), spare parts buffers (Material), and standard operating procedures (Method).',
    metrics: [
      { label: 'Downtime Reduction', sub: 'Predictive & PM Scheduling', val: '42%' },
      { label: 'MTTR Improvement', sub: 'Mean Time to Repair', val: '- 38%' },
      { label: 'Work Order Digitalization', sub: 'Zero Paper Paperless Floor', val: '100%' },
      { label: 'Compliance Audit', sub: 'ISO 55000 Asset Standard', val: 'Certified' }
    ],
    pillars: [
      { title: '4M Integrated Framework', desc: 'Holistic maintenance model linking technician skill ratings, machine vibrations, parts inventory, and digital procedures.', badge: '4M Core' },
      { title: 'Dynamic Work Order Dispatch', desc: 'Automated work order creation from runtime counters, calendar triggers, or edge IoT anomaly alerts.', badge: 'Work Orders' },
      { title: 'Asset Hierarchy & Tree View', desc: 'Multi-level parent-child equipment trees representing plant sections, production lines, and sub-assemblies.', badge: 'Asset Trees' },
      { title: 'Autonomous Mobile Maintenance', desc: 'Shop-floor technician app with barcode equipment scanning, photo defect uploads, and digital sign-offs.', badge: 'Shop Floor App' }
    ],
    workflow: [
      { step: '1', title: 'Plant Asset Tree Setup', desc: 'Structure facilities into sections, machines, drives, pumps, and instrumentation.' },
      { step: '2', title: 'Maintenance Schedule Mapping', desc: 'Define calendar-based, runtime-hour, and sensor-triggered PM task cards.' },
      { step: '3', title: 'Mobile Work Order Execution', desc: 'Technicians scan machine QR codes, complete digital checklists, and log replaced spares.' },
      { step: '4', title: 'KPI & Reliability Analysis', desc: 'Compute live MTBF, MTTR, maintenance costs, and technician labor utilization rates.' }
    ],
    technicalSpecs: [
      { label: 'Asset Framework', value: 'ISO 55001 Asset Management Architecture' },
      { label: 'Trigger Mechanisms', value: 'Calendar, Runtime Hours, Machine Cycles & Edge Alarms' },
      { label: 'Mobile Compatibility', value: 'Offline-capable PWA with local SQLite sync' },
      { label: 'ERP Spares Link', value: 'Direct integration with central inventory stock ledger' }
    ]
  },

  'machine-health-mtbf': {
    id: 'machine-health-mtbf',
    name: 'Machine Health & MTBF/MTTR',
    category: '4M OPERATIONS & CMMS',
    categorySlug: '4m-operations-cmms',
    navigationOrigin: 'solutions',
    badge: 'Reliability Analytics',
    tagline: 'Real-time Mean Time Between Failures (MTBF) and Mean Time to Repair (MTTR) calculation engine',
    description: 'Scientific reliability engineering platform for manufacturing assets. Computes instantaneous MTBF, MTTR, equipment availability, and Overall Equipment Effectiveness (OEE) while identifying repeat breakdown patterns.',
    metrics: [
      { label: 'MTBF Accuracy', sub: 'Algorithmic Runtime Tracking', val: '99.9%' },
      { label: 'MTTR Tracking', sub: 'Time-to-Resolve Stopwatch', val: 'Minute-Level' },
      { label: 'OEE Visibility', sub: 'Availability × Perf × Quality', val: 'Live Dash' },
      { label: 'Failure RCA', sub: 'Root Cause Taxonomy', val: '5-Why Guided' }
    ],
    pillars: [
      { title: 'Algorithmic MTBF Tracking', desc: 'Continuous calculation of operating runtime between breakdown events across high-duty machinery.', badge: 'MTBF Metric' },
      { title: 'Stage-Gated MTTR Analysis', desc: 'Breaks down repair duration into Notification, Dispatch, Diagnosis, Spare Fetching, and Repair Execution.', badge: 'MTTR Stopwatch' },
      { title: '5-Why Guided Root Cause', desc: 'Built-in Ishikawa fishbone and 5-Why diagnostic templates to prevent recurring breakdown incidents.', badge: 'RCA Engine' },
      { title: 'Asset Degradation Curves', desc: 'Predictive mathematical wear modeling alerting engineers before catastrophic component seizure.', badge: 'Degradation Curve' }
    ],
    workflow: [
      { step: '1', title: 'Breakdown Event Ingestion', desc: 'Machine trips via IoT dry-contact or manual line-operator mobile alarm.' },
      { step: '2', title: 'Timer Clock Initiation', desc: 'MTTR timer initiates automatically and pings on-duty electrical/mechanical teams.' },
      { step: '3', title: 'Diagnosis & Resolution', desc: 'Technician records corrective actions taken, parts replaced, and machine restart confirmation.' },
      { step: '4', title: 'Reliability Curve Update', desc: 'Engine recalibrates asset MTBF, updating preventative maintenance intervals dynamically.' }
    ],
    technicalSpecs: [
      { label: 'Calculation Formula', value: 'MTBF = Total Operating Hours / Total Failure Count' },
      { label: 'MTTR Formula', value: 'MTTR = Total Maintenance Downtime / Number of Breakdowns' },
      { label: 'Root Cause Templates', value: 'Ishikawa Fishbone, 5-Why, Failure Mode & Effects Analysis (FMEA)' },
      { label: 'Reporting Formats', value: 'PDF Reliability Audits, Excel Loss Tree Summaries' }
    ]
  },

  'preventive-maintenance': {
    id: 'preventive-maintenance',
    name: 'Preventive Maintenance',
    category: '4M OPERATIONS & CMMS',
    categorySlug: '4m-operations-cmms',
    navigationOrigin: 'solutions',
    badge: 'Proactive Care',
    tagline: 'Automated calendar, operating-hour, and telemetry-triggered PM scheduling with parts reservation',
    description: 'Replaces reactive firefighting with scheduled preventive upkeep. Automatically schedules daily, weekly, and overhaul maintenance tasks based on elapsed days or operational equipment run-hours.',
    metrics: [
      { label: 'Unplanned Stops', sub: 'Breakdown Avoidance Rate', val: '- 65%' },
      { label: 'PM Compliance', sub: 'On-Time Task Execution', val: '98.4%' },
      { label: 'Equipment Lifespan', sub: 'Extended Capital Longevity', val: '+ 3.5 Yrs' },
      { label: 'Schedule Automation', sub: 'Hands-Free PM Dispatch', val: '100%' }
    ],
    pillars: [
      { title: 'Multi-Trigger Scheduling', desc: 'Support for fixed calendar intervals, accumulated motor run hours, or production cycle count triggers.', badge: 'Hybrid Triggers' },
      { title: 'Automated Spares Staging', desc: 'Automatically reserves required lubricants, gaskets, and filters in warehouse before PM launch.', badge: 'Spare Staging' },
      { title: 'Technician Skill Matching', desc: 'Routes high-voltage or complex mechanical tasks strictly to certified technician skill brackets.', badge: 'Skills Matrix' },
      { title: 'Compliance Audit Logs', desc: 'Digital signatures with GPS location stamps verifying physical maintenance inspection completion.', badge: 'Zero Fake Logs' }
    ],
    workflow: [
      { step: '1', title: 'PM Master Plan Creation', desc: 'Define maintenance cycles for each asset classification with step-by-step instructions.' },
      { step: '2', title: 'Threshold Monitoring', desc: 'System checks calendar dates or polls PLC runtime telemetry daily.' },
      { step: '3', title: 'Work Order & Spare Allocation', desc: 'System generates work orders and reserves required gaskets/oils from warehouse.' },
      { step: '4', title: 'Inspection & Closure', desc: 'Technician completes checklist items, logs machine parameters, and signs off digitally.' }
    ],
    technicalSpecs: [
      { label: 'Trigger Modes', value: 'Calendar (Daily/Weekly/Monthly), Run-Hours, Stroke Count' },
      { label: 'Checklist Types', value: 'Numerical readings (temp/pressure), Pass/Fail, Multi-choice' },
      { label: 'Spare Reservation', value: 'Automatic BOM reservation in G Mark ERP inventory' },
      { label: 'Notification Channels', value: 'SMS, WhatsApp Business API, Mobile Push, Email' }
    ]
  },

  'digital-sops-checklists': {
    id: 'digital-sops-checklists',
    name: 'Digital SOPs & Checklists',
    category: '4M OPERATIONS & CMMS',
    categorySlug: '4m-operations-cmms',
    navigationOrigin: 'solutions',
    badge: 'Standardization',
    tagline: 'Interactive step-by-step procedures, photo defect logging & mandatory safety checklist protocols',
    description: 'Converts dusty paper binders into interactive, fool-proof mobile checklists. Enforces strict sequencing, parameter tolerance checks (e.g., motor winding resistance between 4.2Ω - 4.8Ω), and mandatory photographic proof before work order sign-off.',
    metrics: [
      { label: 'Error Reduction', sub: 'Standardized SOP Execution', val: '80%' },
      { label: 'Photo Verification', sub: 'Mandatory Inspection Snaps', val: '100%' },
      { label: 'Audit Readiness', sub: 'Instant Historical Retrieval', val: '< 10s' },
      { label: 'Language Options', sub: 'Vernacular Floor Support', val: '3 Langs' }
    ],
    pillars: [
      { title: 'Tolerance-Bounded Fields', desc: 'Rejects out-of-range sensor readings and prompts immediate escalation if readings exceed safety thresholds.', badge: 'Range Guard' },
      { title: 'Mandatory Photographic Proof', desc: 'Requires technicians to snap live photos of equipment condition, thermal gauges, or oil sight glasses.', badge: 'Photo Proof' },
      { title: 'Digital LOTO Safety Protocols', desc: 'Enforces Lockout/Tagout verification checklists prior to initiating high-risk electrical/hydraulic tasks.', badge: 'LOTO Safety' },
      { title: 'Multilingual Voice Guidance', desc: 'Allows field operators to view instructions or listen to checklist steps in regional vernacular languages.', badge: 'Voice SOP' }
    ],
    workflow: [
      { step: '1', title: 'Digital SOP Drafting', desc: 'Engineers configure procedures with rich diagrams, videos, and acceptable measurement limits.' },
      { step: '2', title: 'Work Order Binding', desc: 'Attach SOP to routine preventive maintenance or corrective breakdown tickets.' },
      { step: '3', title: 'Step-by-Step Mobile Guidance', desc: 'Technician executes steps in mandatory sequence on ruggedized mobile tablets.' },
      { step: '4', title: 'Quality Assurance Sign-Off', desc: 'Supervisors review uploaded photos and out-of-spec warnings before approving ticket.' }
    ],
    technicalSpecs: [
      { label: 'Input Formats', value: 'Numeric with Min/Max gates, Barcode Scanner, Geolocation, Photos' },
      { label: 'Photo Storage', value: 'Compressed cloud S3 storage with tamper-resistant watermarks' },
      { label: 'Version Control', value: 'Full change history with engineering revision approval flow' },
      { label: 'Offline Execution', value: 'Runs fully offline with automatic cloud synchronization' }
    ]
  },

  'spare-parts-inventory': {
    id: 'spare-parts-inventory',
    name: 'Spare Parts & Inventory',
    category: '4M OPERATIONS & CMMS',
    categorySlug: '4m-operations-cmms',
    navigationOrigin: 'solutions',
    badge: 'MRO Optimization',
    tagline: 'Maintenance, Repair & Operations (MRO) spare parts tracking, bin locations & automated reorder triggers',
    description: 'Eliminates maintenance downtime caused by missing replacement parts. Tracks critical spares across central toolrooms, line-side lockers, and technician vans with min-max reorder buffers and direct ERP purchase indents.',
    metrics: [
      { label: 'Stockout Incidents', sub: 'Critical Spare Availability', val: '< 0.5%' },
      { label: 'Holding Cost', sub: 'Carrying Cost Reduction', val: '- 24%' },
      { label: 'Pick Accuracy', sub: 'Barcode Bin Identification', val: '99.8%' },
      { label: 'Reorder Automation', sub: 'Direct Purchase Requisitions', val: 'Automated' }
    ],
    pillars: [
      { title: 'Criticality Categorization (ABC/VED)', desc: 'Classifies spares by operational impact (Vital, Essential, Desirable) to prevent stockouts on single points of failure.', badge: 'ABC/VED Matrix' },
      { title: 'Bin & Locker Geolocation', desc: 'Maps exact aisle, shelf, bin, and locker positions for swift part retrieval during emergency breakdowns.', badge: 'Bin Mapping' },
      { title: 'Direct Work Order Deductions', desc: 'Scanning spare barcode immediately deducts quantity from inventory and charges cost directly to machine asset ledger.', badge: 'Cost Allocation' },
      { title: 'Refurbishment & Reconditioned Stock', desc: 'Tracks repairable components (motors, pumps, PCB cards) through external overhaul cycles.', badge: 'Reconditioning' }
    ],
    workflow: [
      { step: '1', title: 'Cataloging & Criticality Grading', desc: 'Register part OEM numbers, cross-references, and Vital/Essential/Desirable tags.' },
      { step: '2', title: 'Bin Location Mapping', desc: 'Assign physical storage bins with scannable QR/barcode labels.' },
      { step: '3', title: 'Work Order Issue & Scanning', desc: 'Technician scans part out of stores; system deducts inventory and links cost to asset.' },
      { step: '4', title: 'Automated Reorder Trigger', desc: 'System triggers purchase requisition when buffer dips below safety threshold.' }
    ],
    technicalSpecs: [
      { label: 'Classification Models', value: 'ABC Analysis (Value) + VED Analysis (Criticality)' },
      { label: 'Barcode Protocols', value: 'GS1-128, QR Code, Code 39' },
      { label: 'ERP Accounting Integration', value: 'Direct debit to Machine Cost Center General Ledger' },
      { label: 'Safety Stock Algorithm', value: 'Dynamic lead time × average daily maintenance consumption' }
    ]
  },

  'downtime-reduction-engine': {
    id: 'downtime-reduction-engine',
    name: 'Downtime Reduction Engine',
    category: '4M OPERATIONS & CMMS',
    categorySlug: '4m-operations-cmms',
    navigationOrigin: 'solutions',
    badge: 'Productivity Optimization',
    tagline: 'Pareto breakdown analysis, loss-tree categorization & machine stoppage alerts for maximum plant productivity',
    description: 'Transform breakdown data into strategic operational uptime gains. Features Pareto 80/20 loss categorization, MTBF trend graphs, shift changeover loss tracking, and autonomous operator alerts that eliminate micro-stops.',
    metrics: [
      { label: 'Overall OEE Gain', sub: 'Plant-Wide Productivity Lift', val: '+ 18%' },
      { label: 'Pareto Clarity', sub: 'Identifies 80% Downtime Causes', val: 'Instant' },
      { label: 'Micro-Stop Detection', sub: 'Sub-Minute Idling Analysis', val: 'Continuous' },
      { label: 'Operator Response', sub: 'Escalation Alert Ladder', val: '< 3 Mins' }
    ],
    pillars: [
      { title: 'Pareto 80/20 Breakdown Analysis', desc: 'Ranks machine failure modes by aggregate stoppage hours to focus engineering efforts on high-impact bottlenecks.', badge: 'Pareto 80/20' },
      { title: 'Loss-Tree Taxonomy', desc: 'Standardizes stoppage classifications into Planned Maintenance, Changeover, Equipment Breakdown, and Starvation.', badge: 'Loss Tree' },
      { title: 'Escalation Ladder Alerts', desc: 'Multi-tier notifications dispatching SMS/WhatsApp alerts to shift supervisors if an asset remains idle past tolerance.', badge: 'Escalations' },
      { title: 'Shift Handover Analytics', desc: 'Highlights production losses occurring during operator shift transitions and meal breaks.', badge: 'Shift Audits' }
    ],
    workflow: [
      { step: '1', title: 'Telemetry Ingestion & Stop Detection', desc: 'Detect line halt via digital speed sensors or current telemetry drops.' },
      { step: '2', title: 'Reason Code Prompt', desc: 'Operator or technician selects standardized stoppage category on touch terminal.' },
      { step: '3', title: 'Real-Time Escalation Cascade', desc: 'If unresolved in 15 mins, system escalates to Maintenance Lead, then Plant Manager.' },
      { step: '4', title: 'Continuous Improvement Kaizen', desc: 'Weekly Pareto review generates corrective action items to eliminate recurrent root causes.' }
    ],
    technicalSpecs: [
      { label: 'Loss Taxonomy', value: 'Standardized TPM (Total Productive Maintenance) 16 Major Losses' },
      { label: 'Alert Protocols', value: 'Configurable multi-tier escalation via SMS, WhatsApp, Siren relays' },
      { label: 'Analytics Engine', value: 'Interactive Pareto charts, Cumulative downtime waterfalls' },
      { label: 'Data Retention', value: '5-year historical granularity for long-term reliability trends' }
    ]
  },

  // =========================================================================
  // SOLUTIONS — CATEGORY 3: INDUSTRIAL IOT & G-NOVA
  // =========================================================================
  'g-nova-iot-dashboard': {
    id: 'g-nova-iot-dashboard',
    name: 'G-Nova IoT Dashboard',
    category: 'INDUSTRIAL IOT & G-NOVA',
    categorySlug: 'industrial-iot-gnova',
    navigationOrigin: 'solutions',
    badge: 'Telemetry Cockpit',
    tagline: 'Central industrial IoT cockpit with real-time sensor streams, asset mimic diagrams & trip alerts',
    description: 'Enterprise telemetry management platform. Connects factory PLCs, remote booster pumps, fire hydrants, and municipal water stations into a unified SCADA-grade real-time web dashboard powered by WebSockets and TimescaleDB.',
    metrics: [
      { label: 'Sensor Stream Latency', sub: 'Sub-Second Edge Telemetry', val: '< 50ms' },
      { label: 'Device Connectivity', sub: 'MQTT & Modbus Gateways', val: '10,000+' },
      { label: 'Historical Resolution', sub: 'High-Density Timeseries', val: '50 Hz' },
      { label: 'Trip Notification', sub: 'Multi-Channel Push & SMS', val: '< 1 Sec' }
    ],
    pillars: [
      { title: 'Interactive SCADA Mimic Diagrams', desc: 'Visual equipment line diagrams displaying live motor currents, pipe pressures, water levels, and valve states.', badge: 'SCADA Mimic' },
      { title: 'Sub-Second Timeseries Telemetry', desc: 'Captures high-frequency electrical and hydraulic sensor readings with zero dropped packets over low-bandwidth 4G.', badge: 'High Density' },
      { title: 'Configurable Alarm Thresholds', desc: 'Customizable high/low warning and critical emergency trip thresholds with audible and visual alerts.', badge: 'Alarm Matrix' },
      { title: 'Historical Trend Overlays', desc: 'Compare historical run-cycles and energy consumption patterns across days, weeks, and seasons.', badge: 'Trend Curves' }
    ],
    workflow: [
      { step: '1', title: 'Edge Hardware Commissioning', desc: 'Mount G-Nova AIPCU microcontroller gateway to industrial control panel.' },
      { step: '2', title: 'Sensor Channel Mapping', desc: 'Bind 4-20mA pressure transmitters, PT100 thermal sensors, and digital dry contacts.' },
      { step: '3', title: 'Secure MQTT Transmission', desc: 'Edge gateway streams encrypted QoS-2 sensor packets to central telemetry cloud.' },
      { step: '4', title: 'Live Visualization & Control', desc: 'Display animated mimic diagrams and trigger automated emergency pump relays.' }
    ],
    technicalSpecs: [
      { label: 'Communication Protocol', value: 'MQTT v5.0 with TLS 1.3 Encryption & QoS 2' },
      { label: 'Timeseries Database', value: 'TimescaleDB hypertables with automated chunk compression' },
      { label: 'Dashboard Technology', value: 'SVG Canvas Mimic with WebSocket Bidirectional Data Flow' },
      { label: 'Gateway Hardware', value: 'G-Nova AIPCU Industrial Arm Cortex-M4 Microcontroller' }
    ]
  },

  'sub-second-telemetry': {
    id: 'sub-second-telemetry',
    name: 'Sub-Second 50Hz Telemetry',
    category: 'INDUSTRIAL IOT & G-NOVA',
    categorySlug: 'industrial-iot-gnova',
    navigationOrigin: 'solutions',
    badge: 'High-Frequency Ingestion',
    tagline: '50Hz continuous voltage, current, and vibration telemetry stream for high-speed diagnostic capture',
    description: 'High-frequency telemetry engine engineered for mission-critical industrial drives and power grids. Captures 50 samples per second to identify sub-cycle transient voltage spikes, inrush currents, and mechanical chatter.',
    metrics: [
      { label: 'Sampling Rate', sub: 'Continuous Data Capture', val: '50 Hz' },
      { label: 'Waveform Resolution', sub: 'Transient Spike Capture', val: '20ms Window' },
      { label: 'Data Compression', sub: 'Delta-of-Delta Timeseries', val: '92% Saved' },
      { label: 'Uptime SLA', sub: 'Enterprise Telemetry Pipe', val: '99.99%' }
    ],
    pillars: [
      { title: 'Sub-Cycle Transient Detection', desc: 'Identifies microsecond power quality anomalies that standard 1-minute SCADA polling completely misses.', badge: 'Transient Hunt' },
      { title: 'Edge Pre-Processing & Compression', desc: 'Applies Gorilla delta-compression on edge gateway before transmission, preserving mobile cellular bandwidth.', badge: 'Edge Compress' },
      { title: 'Inrush Current Profiling', desc: 'Logs start-up current spikes to diagnose pump impeller cavitation, motor bearing wear, or winding insulation fatigue.', badge: 'Inrush Profile' },
      { title: 'Synchronized Phase Telemetry', desc: 'Simultaneous 3-phase R-Y-B current and voltage phase angle capture for true power factor calculation.', badge: '3-Phase Sync' }
    ],
    workflow: [
      { step: '1', title: 'High-Speed ADC Sampling', desc: 'Microcontroller analog-to-digital converter samples current transformer coils at 50Hz.' },
      { step: '2', title: 'Edge Delta Filtering', desc: 'Filter out steady-state noise while capturing harmonic distortions and voltage transients.' },
      { step: '3', title: 'Batch Buffer Streaming', desc: 'Transmit encrypted binary telemetry bursts via persistent TCP socket to cloud.' },
      { step: '4', title: 'Waveform Reconstruction', desc: 'Reconstruct high-definition electrical waveforms in client browser using WebGL rendering.' }
    ],
    technicalSpecs: [
      { label: 'Sampling Frequency', value: '50 Hz (1 sample every 20 milliseconds)' },
      { label: 'Buffer Pipeline', value: 'Circular RAM buffer with automatic network drop retransmission' },
      { label: 'Compression Algorithm', value: 'Gorilla floating-point delta-of-delta encoding' },
      { label: 'Ingestion Pipeline', value: 'Kafka stream cluster routing into TimescaleDB hypertables' }
    ]
  },

  'terrace-booster-automation': {
    id: 'terrace-booster-automation',
    name: 'Terrace Booster Automation',
    category: 'INDUSTRIAL IOT & G-NOVA',
    categorySlug: 'industrial-iot-gnova',
    navigationOrigin: 'solutions',
    badge: 'Hydro-Pneumatic Control',
    tagline: 'Automated pressure transmitter monitoring, multi-pump staging, and dry-run protection relays',
    description: 'Autonomous hydro-pneumatic booster pump automation for commercial complexes and residential townships. Continuously maintains line pressure, rotates lead-lag pumps to equalize run hours, and triggers emergency dry-run shutdown within 200ms.',
    metrics: [
      { label: 'Pressure Stabilization', sub: 'Continuous Line Holding', val: '± 0.2 Bar' },
      { label: 'Dry-Run Protection', sub: 'Zero-Suction Emergency Trip', val: '< 200ms' },
      { label: 'Energy Savings', sub: 'VFD Smart Cascade Staging', val: '31%' },
      { label: 'Pump Life Expansion', sub: 'Cyclic Lead-Lag Equalization', val: '+ 40%' }
    ],
    pillars: [
      { title: 'Multi-Pump Lead/Lag Cascade', desc: 'Stages booster pumps progressively based on instantaneous flow demand and alternates lead pump daily.', badge: 'Cascade Staging' },
      { title: 'Dry-Run Anti-Cavitation Guard', desc: 'Detects suction header vacuum loss or zero-current idling and isolates motors before seal burn.', badge: 'Dry-Run Cutoff' },
      { title: 'VFD PID Pressure Regulation', desc: 'Closed-loop PID regulation maintaining constant terminal tap pressure regardless of concurrent consumer draw.', badge: 'PID Control' },
      { title: 'Water Leak & Burst Alarm', desc: 'Detects continuous non-decaying pump runtime during zero-occupancy nighttime hours, flagging pipeline bursts.', badge: 'Burst Warning' }
    ],
    workflow: [
      { step: '1', title: 'Header Pressure Sensing', desc: '4-20mA pressure transmitter reads delivery line pressure 10 times per second.' },
      { step: '2', title: 'PID Error Calculation', desc: 'Controller calculates deviation from target setpoint (e.g., 3.5 bar).' },
      { step: '3', title: 'Dynamic VFD & Relay Control', desc: 'Modulate VFD inverter frequency or engage lag pump via contactor relay.' },
      { step: '4', title: 'Telemetry & Safety Sync', desc: 'Stream water delivery volume, kWh consumed, and pump running state to mobile app.' }
    ],
    technicalSpecs: [
      { label: 'Control Loop', value: 'Proportional-Integral-Derivative (PID) closed-loop' },
      { label: 'Transmitter Type', value: 'Piezo-resistive 4-20mA 0-10 Bar industrial transmitter' },
      { label: 'Safety Interlocks', value: 'Dry-run low level float, Overload relay, Phase reversal trip' },
      { label: 'Fail-Safe Mode', value: 'Automatic fallback to manual local DOL starter on communication loss' }
    ]
  },

  'fire-hydrant-safety': {
    id: 'fire-hydrant-safety',
    name: 'Fire Hydrant Safety G-Nova',
    category: 'INDUSTRIAL IOT & G-NOVA',
    categorySlug: 'industrial-iot-gnova',
    navigationOrigin: 'solutions',
    badge: 'Life Safety SCADA',
    tagline: '24/7 hydrant ring-main pressure monitoring, diesel engine start sensing, and jockey pump cycling',
    description: 'Statutory life-safety telemetry system for commercial high-rises and manufacturing complexes. Guarantees fire ring-main pressure never dips below statutory 7.0 bar, monitors jockey pump cycling to catch hidden leaks, and alerts building management if the main diesel engine fails to crank.',
    metrics: [
      { label: 'Statutory Compliance', sub: 'NBC & NFPA Fire Codes', val: '100%' },
      { label: 'Hydrant Ring Pressure', sub: 'Constant Ring-Main Watch', val: '7.5 Bar' },
      { label: 'Jockey Pump Watch', sub: 'Excessive Cycle Detection', val: 'Leak Alert' },
      { label: 'Emergency Alert', sub: 'Instant SMS & Hooter Relay', val: '< 500ms' }
    ],
    pillars: [
      { title: 'Continuous Ring-Main Pressure Watch', desc: 'Dual-redundant pressure transmitters ensure fire line pressure remains within mandatory statutory safety limits.', badge: 'Ring Main Watch' },
      { title: 'Jockey Frequency Leak Hunting', desc: 'Counts jockey pump starts per hour; excessive cycling flags underground pipe leaks before pressure collapse.', badge: 'Jockey Cycling' },
      { title: 'Diesel Fire Engine Monitoring', desc: 'Monitors starting battery voltage, fuel tank level, engine oil pressure, and automatic cranking status.', badge: 'Diesel Engine' },
      { title: 'Automated NBC Compliance Reports', desc: 'Generates weekly and monthly compliance reports required by municipal fire safety inspectors.', badge: 'Audit Reports' }
    ],
    workflow: [
      { step: '1', title: 'Pressure & Water Tank Sensor Hookup', desc: 'Connect pressure transducers to wet-riser and ultrasonic sensor to fire static water tank.' },
      { step: '2', title: 'Continuous Pressure Watchdog', desc: 'System checks line pressure every 100ms against statutory 7.0 bar threshold.' },
      { step: '3', title: 'Automatic Fire Event Trigger', desc: 'Pressure drop triggers main electric pump; if power fails, diesel engine auto-cranks.' },
      { step: '4', title: 'Multi-Channel Emergency Alert', desc: 'System sounds physical security hooters and sends emergency calls to fire safety officers.' }
    ],
    technicalSpecs: [
      { label: 'Safety Standards', value: 'National Building Code (NBC) Part IV & NFPA 20 Standards' },
      { label: 'Sensor Redundancy', value: 'Dual 4-20mA pressure transmitters on discharge header' },
      { label: 'Backup Power', value: 'Internal 24V LiFePO4 battery pack with 48-hour continuous runtime' },
      { label: 'Audit Trail', value: 'Immutable event log of every pump start, trip, and pressure drop' }
    ]
  },

  'stp-water-automation': {
    id: 'stp-water-automation',
    name: 'STP & Water Automation',
    category: 'INDUSTRIAL IOT & G-NOVA',
    categorySlug: 'industrial-iot-gnova',
    navigationOrigin: 'solutions',
    badge: 'Environmental IoT',
    tagline: 'Sewage Treatment Plant automation with DO levels, pH sensing, level transmitters & cyclic blower scheduling',
    description: 'Automates residential and industrial Sewage Treatment Plants (STP) and Effluent Treatment Plants (ETP). Monitors dissolved oxygen (DO), pH, turbidity, and tank levels while cyclically managing air blowers, filter feed pumps, and sludge re-circulation.',
    metrics: [
      { label: 'Blower Energy Saved', sub: 'DO-Controlled Air Injection', val: '34%' },
      { label: 'Water Quality Compliance', sub: 'PCB Discharge Guidelines', val: '100%' },
      { label: 'Overflow Prevention', sub: 'Multi-Tank Ultrasonic Level', val: 'Zero Spill' },
      { label: 'Chemical Dosing Control', sub: 'Precise pH Neutralization', val: 'Auto Dose' }
    ],
    pillars: [
      { title: 'Dissolved Oxygen (DO) Blower Logic', desc: 'Maintains optimal 2.0 - 3.0 mg/L DO in aeration tank by dynamically modulating air blower runtime.', badge: 'DO Optimization' },
      { title: 'Multi-Tank Level Telemetry', desc: 'Ultrasonic transmitters monitor raw sewage, equalization, aeration, and treated water holding tanks.', badge: 'Tank Levels' },
      { title: 'Automated Dual-Media Backwash', desc: 'Initiates automated sand filter and carbon filter backwash cycles based on differential pressure drop.', badge: 'Filter Backwash' },
      { title: 'Pollution Board Compliance Logs', desc: 'Continuous logging of discharge pH, COD, BOD, and total flow volume for environmental audit submissions.', badge: 'PCB Logbook' }
    ],
    workflow: [
      { step: '1', title: 'Water Quality Telemetry Ingest', desc: 'Measure pH, DO, and turbidity in treatment chambers via RS-485 Modbus probes.' },
      { step: '2', title: 'Level Transmitter Calculation', desc: 'Ultrasonic sensors calculate available storage capacity across equalization and treated tanks.' },
      { step: '3', title: 'Cyclic Pump & Blower Actuation', desc: 'PLC schedules twin aeration blowers and filter feed pumps with automatic alternating.' },
      { step: '4', title: 'Recycled Water Distribution', desc: 'Automatically dispatches treated effluent for landscape irrigation and flushing headers.' }
    ],
    technicalSpecs: [
      { label: 'Sensors Integrated', value: 'Optical Dissolved Oxygen, Glass Electrode pH, Ultrasonic Level' },
      { label: 'Actuator Controls', value: '415V 3-Phase Blower starters, Motorized pneumatic butterfly valves' },
      { label: 'Environmental Standard', value: 'Central Pollution Control Board (CPCB) continuous monitoring norms' },
      { label: 'Data Log Resolution', value: '1-minute averages stored for 3 years' }
    ]
  },

  'ai-vibration-diagnostics': {
    id: 'ai-vibration-diagnostics',
    name: 'AI Vibration Diagnostics',
    category: 'INDUSTRIAL IOT & G-NOVA',
    categorySlug: 'industrial-iot-gnova',
    navigationOrigin: 'solutions',
    badge: 'Predictive AI',
    tagline: 'Fast Fourier Transform (FFT) spectrum analysis, bearing wear signatures & early motor seizure warnings',
    description: 'Edge-AI vibration intelligence platform for high-value rotating machinery. Executes high-speed Fast Fourier Transform (FFT) spectrum analysis directly on motor bearing housings to identify unbalance, misalignment, looseness, and bearing raceway spalling weeks before failure.',
    metrics: [
      { label: 'Early Warning Window', sub: 'Advance Bearing Fault Notice', val: '3-6 Weeks' },
      { label: 'Catastrophic Failures', sub: 'Complete Seizure Elimination', val: '- 95%' },
      { label: 'FFT Resolution', sub: 'High-Density Spectral Lines', val: '6400 Lines' },
      { label: 'AI Model Accuracy', sub: 'ISO 10816 Vibration Severity', val: '99.2%' }
    ],
    pillars: [
      { title: 'Fast Fourier Transform (FFT) Engine', desc: 'Converts raw time-domain vibration accelerations into frequency spectrum to isolate specific bearing defect frequencies.', badge: 'FFT Spectrum' },
      { title: 'ISO 10816 Severity Classification', desc: 'Classifies vibration velocity (mm/s RMS) into Good, Acceptable, Unsatisfactory, and Dangerous zones.', badge: 'ISO 10816' },
      { title: 'Bearing Defect Frequency Matching', desc: 'Algorithms match vibration peaks against known BPFO, BPFI, BSF, and FTF bearing geometry signatures.', badge: 'Bearing Match' },
      { title: 'Predictive Remaining Useful Life (RUL)', desc: 'Machine learning trend analysis projects remaining operating hours before vibration reaches shutdown limit.', badge: 'RUL Prediction' }
    ],
    workflow: [
      { step: '1', title: 'Triaxial Sensor Sampling', desc: 'Piezoelectric accelerometers capture radial, axial, and tangential vibration signals.' },
      { step: '2', title: 'Edge FFT Spectral Conversion', desc: 'On-device DSP computes 6,400-line Fast Fourier Transform spectral energy graph.' },
      { step: '3', title: 'AI Signature Pattern Match', desc: 'Neural network compares peak harmonics with mechanical unbalance or bearing spall profiles.' },
      { step: '4', title: 'Predictive Maintenance Work Order', desc: 'System automatically raises CMMS work order with recommended replacement bearing part number.' }
    ],
    technicalSpecs: [
      { label: 'Vibration Parameters', value: 'Acceleration (g pk), Velocity (mm/s RMS), Displacement (μm p-p)' },
      { label: 'Frequency Bandwidth', value: '10 Hz to 10 kHz high-frequency envelope spectrum' },
      { label: 'Sensor Interface', value: 'IEPE / ICP 100 mV/g industrial accelerometers' },
      { label: 'Analytics Pipeline', value: 'Edge DSP Fast Fourier Transform + Cloud PyTorch anomaly models' }
    ]
  },

  // =========================================================================
  // SOLUTIONS — CATEGORY 4: SUPPLY CHAIN & LOGISTICS
  // =========================================================================
  'transporter-middle-mile': {
    id: 'transporter-middle-mile',
    name: 'Transporter Middle-Mile Fleet',
    category: 'SUPPLY CHAIN & LOGISTICS',
    categorySlug: 'supply-chain-logistics',
    navigationOrigin: 'solutions',
    badge: 'Fleet Logistics',
    tagline: 'Middle-mile multi-hub logistics, vehicle capacity utilization & digital manifest dispatch workflows',
    description: 'Empowers middle-mile freight operators and contract logistics fleets. Bridges production warehouses and regional distribution hubs with dynamic trip manifests, vehicle capacity planning, and live transit status.',
    metrics: [
      { label: 'Vehicle Fill Rate', sub: 'Volumetric & Weight Packing', val: '94%' },
      { label: 'Turnaround Time', sub: 'Dock-to-Gate Velocity', val: '- 35%' },
      { label: 'Paperless Manifests', sub: '100% Digital Waybills', val: 'Paperless' },
      { label: 'Fuel Route Efficiency', sub: 'Optimized Highway Routing', val: '+ 19%' }
    ],
    pillars: [
      { title: 'Volumetric & Weight Load Planning', desc: 'Maximizes truck capacity by dynamically calculating package cubic volume and axle weight distributions.', badge: 'Load Planning' },
      { title: 'Digital Transit Manifests', desc: 'Consolidates hundreds of customer shipments into a single barcode-scannable master vehicle manifest.', badge: 'Manifests' },
      { title: 'Multi-Stop Route Dispatching', desc: 'Optimizes multi-drop highway delivery sequences to minimize empty deadhead kilometers.', badge: 'Route Sequence' },
      { title: 'Driver Mobile Trip Cockpit', desc: 'Mobile app providing GPS navigation, toll receipts logging, and electronic proof of delivery (ePOD).', badge: 'Driver App' }
    ],
    workflow: [
      { step: '1', title: 'Consignment Aggregation', desc: 'Pool pending customer dispatches into centralized transport staging queue.' },
      { step: '2', title: 'Vehicle Allocation & Loading', desc: 'Assign suitable freight vehicle (e.g. 14ft, 20ft, 32ft) based on weight and volume.' },
      { step: '3', title: 'Dispatch Scan & Gate Pass', desc: 'Scan packages into vehicle manifest and generate digital exit gate pass.' },
      { step: '4', title: 'Destination Inward Handover', desc: 'Regional depot scans master manifest, verifies package count, and confirms arrival.' }
    ],
    technicalSpecs: [
      { label: 'Routing Engine', value: 'OSRM / GraphHopper multi-point road optimization' },
      { label: 'Manifest Standards', value: 'Indian Statutory Consignment Note (Lorry Receipt / LR)' },
      { label: 'Telemetry Integration', value: 'OBD-II vehicle telematics and GPS odometer tracking' },
      { label: 'Proof of Delivery', value: 'Geofenced OTP verification + digital receiver signature' }
    ]
  },

  'shg-rural-delivery': {
    id: 'shg-rural-delivery',
    name: 'SHG Rural Delivery Network',
    category: 'SUPPLY CHAIN & LOGISTICS',
    categorySlug: 'supply-chain-logistics',
    navigationOrigin: 'solutions',
    badge: 'Last-Mile Commerce',
    tagline: 'Self-Help Group (SHG) cluster aggregation, rural doorstep OTP deliveries & village node fulfillment',
    description: 'Empowers rural women micro-entrepreneurs and Self-Help Group (SHG) clusters to manage last-mile rural e-commerce delivery. Features offline-first parcel scanning, village collection points, and cash-on-delivery (COD) wallet reconciliation.',
    metrics: [
      { label: 'Rural Pincode Reach', sub: 'Village-Level Coverage', val: '450+ Villages' },
      { label: 'Delivery Success Rate', sub: 'First-Attempt OTP Completion', val: '97.2%' },
      { label: 'Women Entrepreneurs', sub: 'Empowered Village Sakhis', val: '1,800+' },
      { label: 'COD Settlement', sub: 'T+1 Direct Bank Deposit', val: 'T+1 Days' }
    ],
    pillars: [
      { title: 'Village Node Cluster Aggregation', desc: 'Groups parcels bound for neighboring villages into single hub bags collected by designated SHG Sakhis.', badge: 'Village Node' },
      { title: 'Offline-First Mobile Ingest', desc: 'Executes parcel scans and delivery attempts even in zero-cellular rural connectivity areas.', badge: 'Offline First' },
      { title: 'Doorstep Buyer OTP Verification', desc: 'Prevents package misplacement by requiring recipient to provide SMS OTP before custody handover.', badge: 'OTP Handover' },
      { title: 'Cash & UPI Wallet Reconciliation', desc: 'Automated daily reconciliation of cash-on-delivery collections with instant bank settlement.', badge: 'Cash Wallet' }
    ],
    workflow: [
      { step: '1', title: 'Hub Package Sort & Bagging', desc: 'Central logistics hub sorts consignments by village cluster and seals master bag.' },
      { step: '2', title: 'SHG Sakhi Handover', desc: 'Village coordinator scans master QR code to accept custody of cluster parcels.' },
      { step: '3', title: 'Doorstep Delivery Attempt', desc: 'Sakhi visits farmer/household, delivers package, and records recipient OTP.' },
      { step: '4', title: 'Cash Settlement & Commission Payout', desc: 'COD cash deposited at local banking kiosk with automatic commission credit.' }
    ],
    technicalSpecs: [
      { label: 'Mobile Architecture', value: 'Lightweight Android PWA optimized for entry-level 2GB RAM phones' },
      { label: 'Offline Database', value: 'Encrypted IndexedDB with auto-sync when cellular signal returns' },
      { label: 'Security Handover', value: '4-digit SMS OTP + recipient photo confirmation' },
      { label: 'Payment Channels', value: 'Cash-on-Delivery, UPI Dynamic QR, Aadhaar Enabled Payment (AePS)' }
    ]
  },

  'qr-barcode-scan-ingest': {
    id: 'qr-barcode-scan-ingest',
    name: 'QR & Barcode Scan Ingest',
    category: 'SUPPLY CHAIN & LOGISTICS',
    categorySlug: 'supply-chain-logistics',
    navigationOrigin: 'solutions',
    badge: 'Scanning Engine',
    tagline: 'High-speed camera & laser barcode ingestion for rapid package receiving, picking, and sorting',
    description: 'Industrial-speed camera and hardware laser scanning interface. Decodes 1D barcodes and 2D QR codes in under 100 milliseconds, validating consignment numbers against dispatch orders and preventing duplicate shipments.',
    metrics: [
      { label: 'Scan Speed', sub: 'Camera & Laser Decoders', val: '< 100ms' },
      { label: 'Decode Accuracy', sub: 'Damaged & Low-Contrast Codes', val: '99.9%' },
      { label: 'Hardware Support', sub: 'Zebra, Honeywell, Smartphone', val: 'Universal' },
      { label: 'Duplicate Prevention', sub: 'Instant Audio Error Buzz', val: '100% Guard' }
    ],
    pillars: [
      { title: 'Universal Symbology Support', desc: 'Reads Code 128, GS1-128, QR Code, Data Matrix, and EAN-13 barcodes across diverse packaging materials.', badge: 'All Symbologies' },
      { title: 'Audio-Tactile Feedback', desc: 'Distinct high-pitch chimes for successful scans and loud buzzers with vibration for duplicates or invalid parcels.', badge: 'Audio Cues' },
      { title: 'Continuous Batch Scanning', desc: 'Streamlines inventory sorting with continuous camera shutter scanning without manual button taps.', badge: 'Batch Scan' },
      { title: 'Industrial Handheld Terminal Sync', desc: 'Native integration with enterprise Zebra, Honeywell, and Newland Android laser scanners.', badge: 'Hardware Terminal' }
    ],
    workflow: [
      { step: '1', title: 'Workflow Mode Selection', desc: 'Select operation: Inward Receiving, Bin Putaway, Order Picking, or Dispatch Check.' },
      { step: '2', title: 'Barcode Optical Ingestion', desc: 'Camera or hardware laser scans package label; decodes tracking identifier.' },
      { step: '3', title: 'Real-Time Validation', desc: 'System verifies package belongs to active batch and confirms weight/contents.' },
      { step: '4', title: 'Inventory State Committal', desc: 'Instant database committal updating parcel state from "In-Transit" to "Received".' }
    ],
    technicalSpecs: [
      { label: 'Decoders', value: 'ZXing C++ WebAssembly engine + Native Android Intent Broadcasts' },
      { label: 'Symbologies', value: '1D (Code 128, Code 39, EAN), 2D (QR Code, GS1 DataMatrix)' },
      { label: 'Scanning Latency', value: '75 milliseconds on mid-tier mobile camera' },
      { label: 'Offline Buffer', value: 'Local caching of up to 10,000 scanned packages without Wi-Fi' }
    ]
  },

  'cluster-batch-routing': {
    id: 'cluster-batch-routing',
    name: 'Cluster Batch Routing',
    category: 'SUPPLY CHAIN & LOGISTICS',
    categorySlug: 'supply-chain-logistics',
    navigationOrigin: 'solutions',
    badge: 'Logistics Optimization',
    tagline: 'K-means geographical parcel clustering, traveling salesperson route optimization & vehicle dispatch',
    description: 'Algorithmic route optimization engine. Groups hundreds of dispersed delivery waypoints into dense geographical clusters using machine learning algorithms, cutting delivery mileage by up to 30% and eliminating vehicle idling.',
    metrics: [
      { label: 'Mileage Saved', sub: 'Optimized Routing Algorithms', val: '28%' },
      { label: 'Cluster Formation', sub: 'K-Means Geographic Partition', val: '< 5 Sec' },
      { label: 'On-Time Delivery', sub: 'Traffic-Aware Scheduling', val: '96.5%' },
      { label: 'CO2 Emission Cut', sub: 'Reduced Highway Miles', val: '- 22%' }
    ],
    pillars: [
      { title: 'Geographical K-Means Clustering', desc: 'Partitions delivery destinations into geographical clusters matching individual truck or delivery Sakhi capacity.', badge: 'K-Means Engine' },
      { title: 'Traveling Salesperson (TSP) Optimization', desc: 'Calculates the shortest mathematical traveling sequence across up to 50 drop points per route.', badge: 'TSP Sequencing' },
      { title: 'Time-Window Delivery Constraints', desc: 'Prioritizes commercial deliveries requiring strict morning business hour receipt windows.', badge: 'Time Windows' },
      { title: 'Live Traffic & Road Elevation Tuning', desc: 'Accounts for rural unpaved roads, bridge toll delays, and live highway traffic congestion.', badge: 'Road Quality' }
    ],
    workflow: [
      { step: '1', title: 'Address Geocoding', desc: 'Convert delivery addresses and pincodes into precise latitude/longitude coordinates.' },
      { step: '2', title: 'Algorithmic Clustering', desc: 'Run clustering algorithm to group consignments by geography, weight, and volume.' },
      { step: '3', title: 'Sequence Optimization', desc: 'Compute optimal stop-by-stop driving path with turn-by-turn navigation.' },
      { step: '4', title: 'Driver App Push', desc: 'Push finalized sequence directly to driver or delivery Sakhi smartphone app.' }
    ],
    technicalSpecs: [
      { label: 'Clustering Engine', value: 'K-Means + DBSCAN Density-Based Spatial Clustering' },
      { label: 'Routing Solver', value: 'Google OR-Tools Vehicle Routing Problem (VRP) Engine' },
      { label: 'Map Provider', value: 'OpenStreetMap vector tiles + Google Directions API' },
      { label: 'Capacity Constraints', value: 'Weight (kg), Volume (m³), Maximum Stop Count, Max Shift Hours' }
    ]
  },

  'village-node-ingestion': {
    id: 'village-node-ingestion',
    name: 'Village Node Ingestion',
    category: 'SUPPLY CHAIN & LOGISTICS',
    categorySlug: 'supply-chain-logistics',
    navigationOrigin: 'solutions',
    badge: 'Rural Infrastructure',
    tagline: 'Last-mile village pickup & drop collection hubs, local parcel custody transfer & inventory bins',
    description: 'Establishes digital micro-fulfillment centers in rural village nodes (Gram Panchayats, FPO centers, village grocery stores). Provides local storage bins, custody verification, and self-service pickup options for rural communities.',
    metrics: [
      { label: 'Node Setup Time', sub: 'Instant Mobile Onboarding', val: '< 1 Day' },
      { label: 'Parcel Dwell Time', sub: 'Average Village Node Hold', val: '< 18 Hrs' },
      { label: 'Loss & Damage Rate', sub: 'Strict Custody Verification', val: '< 0.1%' },
      { label: 'Village Connectivity', sub: 'Offline Resilient Ingest', val: '100%' }
    ],
    pillars: [
      { title: 'Micro-Hub Bin Management', desc: 'Simple numbering system (e.g. Shelf A, Bin 3) allowing village shopkeepers to store and retrieve parcels in seconds.', badge: 'Micro Bins' },
      { title: 'Two-Way Custody Transfer', desc: 'Transfers package responsibility from line-haul truck driver to village node manager via mutual barcode scans.', badge: 'Custody Handshake' },
      { title: 'Farmer Agricultural Produce Pickup', desc: 'Enables farmers to drop off packaged produce at village nodes for consolidated transport to city mandis.', badge: 'Reverse Logistics' },
      { title: 'Automatic Recipient SMS Alerts', desc: 'Dispatches automated SMS notification in regional language when parcel arrives at village node.', badge: 'Vernacular SMS' }
    ],
    workflow: [
      { step: '1', title: 'Node Inward Receiving', desc: 'Village node operator scans parcel barcode arriving from feeder transport van.' },
      { step: '2', title: 'Bin Assignment', desc: 'System indicates designated holding bin (e.g., Bin B-4) for quick storage.' },
      { step: '3', title: 'Arrival SMS Dispatch', desc: 'Customer receives Marathi/Hindi SMS with pickup PIN and village store location.' },
      { step: '4', title: 'Customer Collection', desc: 'Customer presents PIN; operator retrieves package and completes delivery in app.' }
    ],
    technicalSpecs: [
      { label: 'Node Hardware', value: 'Runs on standard Android smartphone; optional Bluetooth thermal printer' },
      { label: 'Capacity Range', value: '50 to 500 parcels per village node micro-fulfillment point' },
      { label: 'Reverse Logistics', value: 'Integrated returns and agri-produce aggregation support' },
      { label: 'Audit Mechanism', value: 'Daily closing inventory count with barcode scan reconciliation' }
    ]
  },

  'doorstep-buyer-otp-handover': {
    id: 'doorstep-buyer-otp-handover',
    name: 'Doorstep Buyer OTP Handover',
    category: 'SUPPLY CHAIN & LOGISTICS',
    categorySlug: 'supply-chain-logistics',
    navigationOrigin: 'solutions',
    badge: 'Secure Handover',
    tagline: 'Cryptographic 4-digit SMS OTP verification, geofenced proof-of-delivery & digital cash receipts',
    description: 'Guarantees foolproof last-mile delivery security. The delivery agent cannot mark a package delivered without entering the confidential 4-digit SMS OTP provided directly to the recipient, completely eliminating fake delivery attempts.',
    metrics: [
      { label: 'Fake Delivery Attempts', sub: 'OTP Security Enforcement', val: '0.0%' },
      { label: 'Geofence Verification', sub: 'GPS Radius Check (< 50m)', val: 'Enforced' },
      { label: 'Receipt Generation', sub: 'Instant SMS / WhatsApp Slip', val: 'Immediate' },
      { label: 'Dispute Reduction', sub: 'Conclusive Proof of Delivery', val: '- 98%' }
    ],
    pillars: [
      { title: 'Cryptographic OTP Verification', desc: 'Time-bound one-time password generated by central server and delivered directly to buyer smartphone.', badge: 'SMS OTP' },
      { title: 'Geofenced GPS Radius Enforcer', desc: 'Blocks delivery completion if courier smartphone GPS coordinates deviate more than 50 meters from delivery address.', badge: 'Geofence Guard' },
      { title: 'Photo & Signature Proof (ePOD)', desc: 'Captures optional recipient signature and parcel placement photo as permanent digital audit proof.', badge: 'ePOD Capture' },
      { title: 'Instant Digital Payment Receipt', desc: 'Immediately dispatches digital receipt via SMS and WhatsApp upon cash or UPI payment collection.', badge: 'Digital Receipt' }
    ],
    workflow: [
      { step: '1', title: 'Delivery Proximity Arrival', desc: 'Agent arrives at customer doorstep; app verifies GPS location matches destination.' },
      { step: '2', title: 'OTP Request', desc: 'Agent asks customer for confidential 4-digit OTP received on registered mobile number.' },
      { step: '3', title: 'System Validation', desc: 'App validates OTP against central server; flags error immediately if incorrect.' },
      { step: '4', title: 'Custody Handover & Settlement', desc: 'Order status switches to "Delivered"; digital payment confirmation issued.' }
    ],
    technicalSpecs: [
      { label: 'OTP Algorithm', value: 'HMAC-based Time-One-Time-Password (TOTP) / Cryptographic 4-digit hash' },
      { label: 'Geofence Radius', value: 'Configurable 25m - 100m threshold using high-accuracy GPS/GLONASS' },
      { label: 'Carrier Integration', value: 'Direct SMS Gateway routing (Fast2SMS, Gupshup, Twilio)' },
      { label: 'Fallback Protocol', value: 'Manager-authorized emergency override with mandatory ID proof photo' }
    ]
  },

  // =========================================================================
  // SOLUTIONS — CATEGORY 5: FIELD FORCE & TELEMETRY
  // =========================================================================
  'g-track-field-operations': {
    id: 'g-track-field-operations',
    name: 'G Track Field Operations',
    category: 'FIELD FORCE & TELEMETRY',
    categorySlug: 'field-force-telemetry',
    navigationOrigin: 'solutions',
    badge: 'Field Force CRM',
    tagline: 'Complete field sales & service management: GPS tracking, beat planning, client visits & order booking',
    description: 'Empowers field sales executives, service technicians, and agricultural extension officers. Combines live GPS telemetry trails, geo-fenced attendance, structured beat routes, and on-field digital order booking with instant ERP synchronization.',
    metrics: [
      { label: 'Field Productivity', sub: 'Daily Client Visits Completed', val: '+ 42%' },
      { label: 'Order Booking Speed', sub: 'Direct ERP Catalog Ingest', val: 'Instant' },
      { label: 'Expense Fraud Cut', sub: 'Verified Kilometers Traveled', val: '- 35%' },
      { label: 'Battery Optimization', sub: 'Smart Geofence GPS Polling', val: '14+ Hrs' }
    ],
    pillars: [
      { title: 'Live GPS Travel Trails', desc: 'Records continuous breadcrumb trails showing travel routes, halts, client visit durations, and idle stops.', badge: 'GPS Trails' },
      { title: 'Geo-Fenced Punch Attendance', desc: 'Field staff can only punch attendance when physically located within assigned office, depot, or field territory.', badge: 'Geo-Attendance' },
      { title: 'On-Field Order Booking', desc: 'Browse live inventory stock, apply dealer pricing slabs, and book customer orders directly from customer premises.', badge: 'Order Booking' },
      { title: 'Client Visit Verification', desc: 'Logs selfie check-ins, meeting notes, customer signature, and GPS coordinates for every sales call.', badge: 'Visit Verify' }
    ],
    workflow: [
      { step: '1', title: 'Morning Geo-Attendance Punch', desc: 'Field executive punches in using facial selfie and verified GPS location.' },
      { step: '2', title: 'Daily Beat Schedule Activation', desc: 'App loads today\'s assigned list of retail stores or farmers to visit.' },
      { step: '3', title: 'On-Site Client Meeting Check-In', desc: 'Check in at retailer; record stock audit, collect payments, and book fresh orders.' },
      { step: '4', title: 'Evening Daily Summary Roll-Up', desc: 'System compiles total kilometers driven, orders booked, and visit completion report.' }
    ],
    technicalSpecs: [
      { label: 'Mobile Architecture', value: 'React Native / Android Native background location service' },
      { label: 'Battery Consumption', value: '< 4% battery drain per 8-hour shift using adaptive motion sensors' },
      { label: 'Offline Order Storage', value: 'Complete offline product catalog with local SQLite persistence' },
      { label: 'ERP Bridge', value: 'Real-time sync to G Mark Sales Order & Accounting ledger' }
    ]
  },

  'live-gps-telemetry-trails': {
    id: 'live-gps-telemetry-trails',
    name: 'Live GPS Telemetry & Trails',
    category: 'FIELD FORCE & TELEMETRY',
    categorySlug: 'field-force-telemetry',
    navigationOrigin: 'solutions',
    badge: 'Location Intelligence',
    tagline: 'High-precision breadcrumb location trails, speed monitoring, halt detection & odometer verification',
    description: 'Continuous location telemetry engine. Captures latitude, longitude, speed, heading, and battery health, intelligently filtering out GPS drift to render smooth, accurate travel breadcrumbs and verified odometer readings.',
    metrics: [
      { label: 'Location Accuracy', sub: 'Multi-GNSS Positioning', val: '± 3 Metres' },
      { label: 'Drift Elimination', sub: 'Kalman Filter Noise Removal', val: '100%' },
      { label: 'Odometer Verification', sub: 'Travel Allowance Audit', val: 'Tamper-Proof' },
      { label: 'Update Interval', sub: 'Dynamic Moving Telemetry', val: '5 - 15 Sec' }
    ],
    pillars: [
      { title: 'Kalman Filter Noise Filtering', desc: 'Applies mathematical Kalman filtering to remove erratic GPS multipath reflections and static location jumping.', badge: 'Kalman Filter' },
      { title: 'Intelligent Motion Polling', desc: 'Switches to high-frequency polling while moving and enters low-power sleep state when stationary.', badge: 'Battery Saver' },
      { title: 'Halt & Idle Time Classification', desc: 'Automatically flags stops longer than 10 minutes, distinguishing legitimate client meetings from idle downtime.', badge: 'Halt Detector' },
      { title: 'Verified Mileage Claim Engine', desc: 'Computes exact road kilometers traveled, eliminating inflated travel allowance expense fraud.', badge: 'Mileage Audit' }
    ],
    workflow: [
      { step: '1', title: 'Continuous Satellite Fix', desc: 'Smartphone acquires multi-constellation GNSS satellites (GPS, GLONASS, NavIC).' },
      { step: '2', title: 'Edge Distance Filtering', desc: 'Discard duplicate points if distance traveled is under 15 meters to conserve power.' },
      { step: '3', title: 'Encrypted Stream Transmission', desc: 'Stream coordinate packets to cloud over secure WebSocket or lightweight MQTT.' },
      { step: '4', title: 'Manager Map Visualization', desc: 'Plot animated trail on dashboard with color-coded speed brackets and stop markers.' }
    ],
    technicalSpecs: [
      { label: 'Satellite Constellations', value: 'GPS, GLONASS, Galileo, BeiDou, and Indian NavIC' },
      { label: 'Map Projection', value: 'Web Mercator EPSG:3857 with OpenLayers / Mapbox GL' },
      { label: 'Data Points Captured', value: 'Latitude, Longitude, Altitude, Speed (km/h), Bearing, Battery %' },
      { label: 'Storage Retention', value: 'Unlimited historical route playback with 1-second scrub slider' }
    ]
  },

  'geofenced-mobile-attendance': {
    id: 'geofenced-mobile-attendance',
    name: 'Geo-Fenced Mobile Attendance',
    category: 'FIELD FORCE & TELEMETRY',
    categorySlug: 'field-force-telemetry',
    navigationOrigin: 'solutions',
    badge: 'Workforce Governance',
    tagline: 'Facial recognition selfie check-in with geographic radius locking and anti-spoofing validation',
    description: 'Modern mobile biometric attendance. Allows staff to clock in from designated work sites, depots, or field customer clusters, enforcing real-time GPS coordinate checks and AI liveness detection to defeat mock location apps and photo spoofing.',
    metrics: [
      { label: 'Mock GPS Detection', sub: 'Fake Location App Blocker', val: '100% Block' },
      { label: 'Liveness Accuracy', sub: 'Facial Anti-Spoofing AI', val: '99.8%' },
      { label: 'Punch Radius Gate', sub: 'Configurable Office Boundary', val: '25 - 200m' },
      { label: 'Payroll Integration', sub: 'Direct Overtime & Leave Sync', val: 'Automated' }
    ],
    pillars: [
      { title: 'Virtual Geofence Perimeter', desc: 'Defines circular or polygonal boundary around company offices, warehouse yards, or client sites.', badge: 'Geofence Gate' },
      { title: 'Anti-Mock GPS Enforcement', desc: 'Detects developer mock location tools, rooted devices, and GPS emulation software, blocking fraudulent punches.', badge: 'Anti-Spoof' },
      { title: 'AI Facial Liveness Detection', desc: 'Requires employee to blink or smile during selfie capture, verifying live physical presence.', badge: 'Liveness AI' },
      { title: 'Automated Shift & Overtime Sync', desc: 'Calculates regular working hours, late arrivals, half-days, and overtime directly into payroll software.', badge: 'Payroll Sync' }
    ],
    workflow: [
      { step: '1', title: 'Punch Initiation', desc: 'Employee taps "Punch In" on G Track mobile app upon reaching work site.' },
      { step: '2', title: 'Geographic Perimeter Verification', desc: 'App queries hardware GPS chip and verifies position is within active geofence.' },
      { step: '3', title: 'Liveness Selfie Capture', desc: 'Employee takes quick camera selfie; AI engine verifies face and liveness in 400ms.' },
      { step: '4', title: 'HR Attendance Ledger Committal', desc: 'Record attendance timestamp and notify shift supervisor of successful check-in.' }
    ],
    technicalSpecs: [
      { label: 'Perimeter Geometry', value: 'Circular radius (50m - 500m) or custom MultiPolygon GeoJSON' },
      { label: 'Biometric AI Engine', value: 'On-device lightweight MobileNet face embedding extractor' },
      { label: 'Anti-Tamper Checks', value: 'Root detection, Mock provider hook detection, System clock check' },
      { label: 'Export Compatibility', value: 'Standard Biometric Time & Attendance software format / CSV / API' }
    ]
  },

  'beat-route-planning': {
    id: 'beat-route-planning',
    name: 'Beat & Route Planning',
    category: 'FIELD FORCE & TELEMETRY',
    categorySlug: 'field-force-telemetry',
    navigationOrigin: 'solutions',
    badge: 'Sales Route Planning',
    tagline: 'Permanent Journey Plans (PJP), recurring weekly dealer beats & territory sales optimization',
    description: 'Automates Permanent Journey Plans (PJP) for retail distribution and FMCG sales forces. Assigns structured daily beats (e.g. Monday: Sector 1 Retailers, Tuesday: Sector 2 Wholesalers) to maximize market coverage and reduce travel exhaustion.',
    metrics: [
      { label: 'Beat Adherence', sub: 'Scheduled vs Visited Ratio', val: '94.5%' },
      { label: 'Territory Coverage', sub: 'Elimination of Missed Outlets', val: '+ 30%' },
      { label: 'Planner Setup', sub: 'Drag-and-Drop Route Matrix', val: '< 10 Mins' },
      { label: 'Sales Lift', sub: 'Predictable Merchant Visits', val: '+ 22%' }
    ],
    pillars: [
      { title: 'Permanent Journey Plans (PJP)', desc: 'Assigns recurring weekly or bi-weekly visit schedules to sales representatives based on retailer tiering.', badge: 'PJP Matrix' },
      { title: 'Retailer Clustering by Density', desc: 'Groups outlets by geographic proximity to minimize transit time between consecutive sales calls.', badge: 'Outlet Clusters' },
      { title: 'Unplanned / Ad-Hoc Call Support', desc: 'Allows reps to log impromptu visits to prospective clients while maintaining scheduled beat accountability.', badge: 'Ad-Hoc Visits' },
      { title: 'Manager Beat Coverage Dashboards', desc: 'Visual heatmaps displaying visited outlets, skipped merchants, and overdue retailer follow-ups.', badge: 'Coverage Heatmap' }
    ],
    workflow: [
      { step: '1', title: 'Outlet Mapping & Tiering', desc: 'Categorize dealers into Class A (Weekly), Class B (Bi-Weekly), and Class C (Monthly).' },
      { step: '2', title: 'Beat Schedule Generation', desc: 'Construct weekly schedule allocating specific dealer lists to each sales executive.' },
      { step: '3', title: 'Daily Beat Push to Mobile', desc: 'Sales rep opens app and sees today\'s ordered sequence of customer visits.' },
      { step: '4', title: 'Adherence Audit & Review', desc: 'Managers track real-time beat adherence percentage and outlet conversion rates.' }
    ],
    technicalSpecs: [
      { label: 'Scheduling Cadence', value: 'Daily, Alternate Days, Weekly, Fortnightly, Monthly cycles' },
      { label: 'Route Mapping', value: 'Interactive OpenStreetMap route display with turn-by-turn guidance' },
      { label: 'Dealer Classification', value: 'Revenue tiers, credit ratings, geographic pincode zones' },
      { label: 'Performance Metric', value: 'Beat Adherence % = (Actual Beat Outlets Visited / Scheduled) × 100' }
    ]
  },

  'on-field-order-booking': {
    id: 'on-field-order-booking',
    name: 'On-Field Digital Order Booking',
    category: 'FIELD FORCE & TELEMETRY',
    categorySlug: 'field-force-telemetry',
    navigationOrigin: 'solutions',
    badge: 'Mobile B2B Orders',
    tagline: 'Offline-ready mobile dealer ordering, real-time distributor price books & scheme promotions',
    description: 'Empowers field sales executives to take wholesale orders directly inside customer stores. Features full offline product catalogs, live warehouse stock checks, dealer-specific discount tiers, promotional trade schemes, and instant ERP order dispatch.',
    metrics: [
      { label: 'Order Processing Time', sub: 'Floor Booking to Warehouse', val: '< 60 Sec' },
      { label: 'Ordering Errors', sub: 'Digital Product Code Matching', val: '0.0%' },
      { label: 'Scheme Adoption', sub: 'Buy-N-Get-1 Free Promos', val: '+ 45%' },
      { label: 'Offline Capability', sub: 'Full Local Order Storage', val: '100% Offline' }
    ],
    pillars: [
      { title: 'Dealer-Specific Price Lists', desc: 'Automatically applies assigned dealer wholesale discounts, payment terms, and tax brackets upon merchant selection.', badge: 'Custom Pricing' },
      { title: 'Dynamic Trade Scheme Engine', desc: 'Calculates volume discounts, promotional free goods (e.g., Buy 10 Bags, Get 1 Free), and cash rebates.', badge: 'Trade Schemes' },
      { title: 'Live Warehouse Stock Glance', desc: 'Displays Available-to-Promise (ATP) stock levels to prevent booking unavailable product variants.', badge: 'ATP Stock Glance' },
      { title: 'Instant WhatsApp Order Summary', desc: 'Dispatches automated order confirmation and pro-forma invoice to the retailer\'s WhatsApp number immediately.', badge: 'WhatsApp Invoice' }
    ],
    workflow: [
      { step: '1', title: 'Select Retail Customer', desc: 'Select retailer from beat list; app pulls credit limit, outstanding balance, and custom price list.' },
      { step: '2', title: 'Browse Catalog & Add Items', desc: 'Filter items by category or scan product barcode; enter required bag/box quantities.' },
      { step: '3', title: 'Apply Discounts & Schemes', desc: 'System automatically calculates trade schemes, cash discounts, and statutory GST splits.' },
      { step: '4', title: 'Submit & Sync to ERP', desc: 'Generate digital order number; sync to central warehouse dispatch queue in real time.' }
    ],
    technicalSpecs: [
      { label: 'Offline Database', value: 'High-speed SQLite mobile database holding 20,000+ SKUs' },
      { label: 'Scheme Logic', value: 'Volume discounts, slab-based rebates, free goods promotions, trade credit' },
      { label: 'Printing Support', value: 'Direct ESC/POS Bluetooth 58mm/80mm thermal receipt printing' },
      { label: 'ERP Integration', value: 'Direct JSON REST API payload pushed into G Mark Sales Order table' }
    ]
  },

  'client-visit-verification': {
    id: 'client-visit-verification',
    name: 'Client Visit Verification',
    category: 'FIELD FORCE & TELEMETRY',
    categorySlug: 'field-force-telemetry',
    navigationOrigin: 'solutions',
    badge: 'Proof of Visit',
    tagline: 'Selfie check-in with client, digital merchant signatures, meeting minutes & competitor stock audits',
    description: 'Eliminates ghost sales visits and fabricated call reports. Requires field executives to capture a geostamped photo at the retailer counter, obtain the merchant digital signature, log structured meeting notes, and record competitor price benchmarks.',
    metrics: [
      { label: 'Visit Authenticity', sub: 'Geotagged Photo & Signature', val: '100%' },
      { label: 'Meeting Note Capture', sub: 'Structured Feedback Forms', val: 'Complete' },
      { label: 'Competitor Intel', sub: 'Shelf Share & Price Logging', val: 'Real-Time' },
      { label: 'Dispute Elimination', sub: 'Auditable Timestamped Logs', val: '100%' }
    ],
    pillars: [
      { title: 'Geotagged Counter Selfies', desc: 'Captures camera photo embedded with irreversible GPS coordinates, date, and microsecond timestamp watermark.', badge: 'Watermarked Photo' },
      { title: 'Digital Merchant Signature', desc: 'Touchscreen signature canvas allowing store owners to confirm sales rep physical visit and meeting discussion.', badge: 'Merchant Sign' },
      { title: 'Shelf Share & Competitor Audits', desc: 'Records competitor brand pricing, shelf space percentage, and distributor promotional activities.', badge: 'Market Intel' },
      { title: 'Customer Feedback & Issue Logging', desc: 'Logs customer complaints regarding damaged goods, delayed dispatches, or credit note requests.', badge: 'Issue Tracker' }
    ],
    workflow: [
      { step: '1', title: 'On-Site Arrival Verification', desc: 'App confirms GPS coordinates match retailer master coordinates within 50m.' },
      { step: '2', title: 'Storefront / Counter Photo', desc: 'Capture quick photograph with retailer; app stamps GPS watermark onto image.' },
      { step: '3', title: 'Meeting Form Execution', desc: 'Record discussed agenda, payment collection details, or competitor insights.' },
      { step: '4', title: 'Merchant Signature & Sign-Off', desc: 'Retailer signs on phone screen; record uploaded to central CRM activity feed.' }
    ],
    technicalSpecs: [
      { label: 'Watermark Encryption', value: 'EXIF metadata + hard-burned canvas watermark (Lat, Long, Date, Time)' },
      { label: 'Signature Format', value: 'SVG vector curve + compressed PNG raster image' },
      { label: 'Form Engine', value: 'Dynamic JSON Schema form renderer supporting text, radio, multi-select, rating' },
      { label: 'Cloud Storage', value: 'Compressed AWS S3 bucket storage with secure pre-signed URLs' }
    ]
  },

  // =========================================================================
  // SOLUTIONS — CATEGORY 6: AGRI-COMMERCE & RURAL
  // =========================================================================
  'gram-unnati-marketplace': {
    id: 'gram-unnati-marketplace',
    name: 'GramUnnati Marketplace',
    category: 'AGRI-COMMERCE & RURAL',
    categorySlug: 'agri-commerce-rural',
    navigationOrigin: 'solutions',
    badge: 'Agri B2B Marketplace',
    tagline: 'Rural B2B agri-commerce platform connecting farmers, FPOs, wholesale buyers & agricultural input vendors',
    description: 'Transforming rural agricultural commerce. Direct digital trade network enabling Farmer Producer Organizations (FPOs) and agricultural input dealers to trade directly with bulk institutional buyers, corporate food processors, and rural retail networks.',
    metrics: [
      { label: 'FPO Network', sub: 'Verified Farmer Groups', val: '1,200+' },
      { label: 'Farmer Income Uplift', sub: 'Direct Intermediary Bypass', val: '+ 28%' },
      { label: 'Trade Volume', sub: 'Annual Commodity Trade', val: '₹ 150+ Cr' },
      { label: 'Payout Speed', sub: 'Direct Bank Settlement', val: 'T+1 Days' }
    ],
    pillars: [
      { title: 'Direct Farm-to-Buyer Trade', desc: 'Bypasses multi-tiered middlemen, allowing institutional buyers to procure directly from verified farmer clusters.', badge: 'Zero Middlemen' },
      { title: 'Quality Grading & Assay Logs', desc: 'Standardized commodity quality parameters: moisture content, foreign matter, grain size, and aflatoxin levels.', badge: 'Assay Quality' },
      { title: 'Escrow Payment Protection', desc: 'Buyer funds held safely in statutory escrow until physical delivery inspection is verified at destination warehouse.', badge: 'Escrow Safety' },
      { title: 'Multilingual Rural Interface', desc: 'Intuitive interface designed for rural producers with full voice search and vernacular Marathi/Hindi support.', badge: 'Vernacular' }
    ],
    workflow: [
      { step: '1', title: 'Commodity Listing & Grading', desc: 'Farmer or FPO uploads crop lot details, photos, estimated tonnage, and harvest moisture level.' },
      { step: '2', title: 'Buyer Discovery & Bidding', desc: 'Institutional buyers view assayed produce, submit purchase bids, or accept fixed mandi rates.' },
      { step: '3', title: 'Logistics Booking & Dispatch', desc: 'Contract middle-mile transporter picks up lot from farm gate with digital weighbridge slip.' },
      { step: '4', title: 'Weighment & Direct Bank Payout', desc: 'Destination warehouse verifies lot weight; escrow releases T+1 payment directly to farmer bank account.' }
    ],
    technicalSpecs: [
      { label: 'Marketplace Architecture', value: 'Multi-sided B2B marketplace platform with role separation' },
      { label: 'Quality Assaying', value: 'AGMARK / NCDEX agricultural commodity specification standards' },
      { label: 'Escrow Integration', value: 'Statutory nodal account integration with ICICI / HDFC Corporate Banking' },
      { label: 'Vernacular Framework', value: 'i18next localization engine with voice navigation support' }
    ]
  },

  'farmer-fpo-producer-app': {
    id: 'farmer-fpo-producer-app',
    name: 'Farmer & FPO Producer App',
    category: 'AGRI-COMMERCE & RURAL',
    categorySlug: 'agri-commerce-rural',
    navigationOrigin: 'solutions',
    badge: 'Farmer Empowerment',
    tagline: 'Farmer member onboarding, crop lot pooling, FPO equity shareholding & digital passbooks',
    description: 'Empowers Farmer Producer Organizations (FPOs) and Primary Agricultural Credit Societies (PACS). Features farmer KYC onboarding, share capital management, harvest lot aggregation, and digital passbooks tracking individual member payouts.',
    metrics: [
      { label: 'Onboarding Time', sub: 'Aadhaar & Land Record KYC', val: '< 3 Mins' },
      { label: 'Lot Aggregation', sub: 'Village-Level Pooling', val: '50,000 MT' },
      { label: 'Digital Passbook', sub: 'Transparent Member Ledger', val: '100% Mobile' },
      { label: 'Member Retention', sub: 'FPO Growth & Governance', val: '98.2%' }
    ],
    pillars: [
      { title: 'Aadhaar-Linked Farmer KYC', desc: 'Rapid farmer verification linking landholding records (7/12 extract) and bank account IFSC codes.', badge: 'Aadhaar KYC' },
      { title: 'Harvest Lot Aggregation', desc: 'Pools smallholder farmer produce into bulk commercial consignments commanding premium institutional rates.', badge: 'Lot Pooling' },
      { title: 'Digital Member Passbook', desc: 'Real-time ledger accessible on farmer phone showing delivered crop quantities, prices, and bank transfer UTRs.', badge: 'Passbook' },
      { title: 'FPO Share Capital Management', desc: 'Maintains statutory records of farmer equity shares, dividend distributions, and board resolutions.', badge: 'FPO Governance' }
    ],
    workflow: [
      { step: '1', title: 'Member Registration', desc: 'Scan farmer Aadhaar card, capture land acreage, and link verified bank account.' },
      { step: '2', title: 'Harvest Inward & Weighbridge', desc: 'Farmer delivers grain to FPO center; system records digital weighment and moisture.' },
      { step: '3', title: 'Batch Consolidation', desc: 'Combine individual farmer lots into 25-tonne truckload batches for institutional buyers.' },
      { step: '4', title: 'Digital Passbook Credit', desc: 'Farmer passbook credited immediately with payment confirmation and receipt voucher.' }
    ],
    technicalSpecs: [
      { label: 'KYC Verification', value: 'Aadhaar OCR, Karza Technologies API, Bank Account Penny Drop' },
      { label: 'Weighbridge Bridge', value: 'Direct RS-232 serial interface to electronic weighbridge indicators' },
      { label: 'Compliance Records', value: 'Indian Ministry of Agriculture FPO Portal schema compliant' },
      { label: 'Security', value: 'End-to-end encrypted financial ledger records with multi-factor authentication' }
    ]
  },

  'b2b-bulk-buyer-platform': {
    id: 'b2b-bulk-buyer-platform',
    name: 'B2B Bulk Buyer Platform',
    category: 'AGRI-COMMERCE & RURAL',
    categorySlug: 'agri-commerce-rural',
    navigationOrigin: 'solutions',
    badge: 'Institutional Procurement',
    tagline: 'Direct procurement portal for corporate processors, exporters & agribusiness wholesale buyers',
    description: 'Procurement portal engineered for corporate food processors, commodity exporters, and wholesale flour/oil mills. Enables buyers to post bulk buy orders, view verified lot assay lab reports, negotiate delivery contracts, and manage supply chain financing.',
    metrics: [
      { label: 'Procurement Cost', sub: 'Intermediary Markups Cut', val: '- 14%' },
      { label: 'Quality Dispute Rate', sub: 'Verified Lab Assay Reports', val: '< 0.8%' },
      { label: 'Contract Fulfillment', sub: 'Direct Guaranteed Sourcing', val: '99.1%' },
      { label: 'Credit Line Access', sub: 'Trade Financing Partners', val: 'Up to ₹ 5 Cr' }
    ],
    pillars: [
      { title: 'Direct RFQ & Tender Creation', desc: 'Post formal buying tenders specifying crop variety, quality grade, delivery location, and contract quantity.', badge: 'Bulk RFQs' },
      { title: 'Third-Party Lab Assay Reports', desc: 'Inspect verified laboratory test certificates (SGS, TUV, Bureau Veritas) before dispatch committal.', badge: 'Lab Assays' },
      { title: 'Milestone-Based Escrow Payments', desc: 'Automated release of funds upon physical arrival, quality verification, and weighment certification.', badge: 'Escrow Flow' },
      { title: 'Supply Chain Financing (SCF)', desc: 'Institutional buyers access 30-90 day invoice discounting and working capital credit from partner NBFCs.', badge: 'Trade Finance' }
    ],
    workflow: [
      { step: '1', title: 'Procurement Tender Posting', desc: 'Corporate buyer creates buy order specifying commodity, tonnage, and maximum price.' },
      { step: '2', title: 'FPO Bid Matching', desc: 'Platform matches tender against certified FPOs capable of fulfilling lot specifications.' },
      { step: '3', title: 'Escrow Funding & Dispatch', desc: 'Buyer deposits contract value into statutory escrow; FPO loads transport vehicles.' },
      { step: '4', title: 'Weighment & Release', desc: 'Buyer factory confirms weighbridge receipt; platform executes payment release.' }
    ],
    technicalSpecs: [
      { label: 'Tender Formats', value: 'Fixed Price Buy, Reverse Auction, Milestone Delivery Contracts' },
      { label: 'Corporate ERP Link', value: 'SAP, Oracle NetSuite, and Microsoft Dynamics procurement APIs' },
      { label: 'Statutory Documentation', value: 'Tax Invoices, Mandi Tax (APMC) receipts, E-Way bills, Weightment slips' },
      { label: 'Financing Integration', value: 'TReDS platform API & NBFC automated invoice discounting' }
    ]
  },

  'digital-mandi-price-discovery': {
    id: 'digital-mandi-price-discovery',
    name: 'Digital Mandi Price Discovery',
    category: 'AGRI-COMMERCE & RURAL',
    categorySlug: 'agri-commerce-rural',
    navigationOrigin: 'solutions',
    badge: 'Market Transparency',
    tagline: 'Real-time APMC mandi commodity rates, price arrival trends & predictive market intelligence',
    description: 'Empowers farmers and agribusinesses with real-time market transparency. Aggregates live modal, minimum, and maximum prices from over 3,000 Agricultural Produce Market Committees (APMCs) across India with price forecasting and arrival alerts.',
    metrics: [
      { label: 'Mandi Coverage', sub: 'APMC Market Feeds Across India', val: '3,000+' },
      { label: 'Commodities Tracked', sub: 'Grains, Pulses, Spices, Veg', val: '180+' },
      { label: 'Update Frequency', sub: 'Live Daily Auction Ingest', val: 'Real-Time' },
      { label: 'Price Forecast Accuracy', sub: 'Historical Seasonal Trends', val: '91.4%' }
    ],
    pillars: [
      { title: 'Live Daily APMC Auction Rates', desc: 'Continuous automated ingestion of morning and afternoon auction rates from agricultural mandis nationwide.', badge: 'Live Mandi' },
      { title: 'Nearby Mandi Distance Arbitrage', desc: 'Compares prices across neighboring markets within a 150km radius to guide farmers where to sell for maximum profit.', badge: 'Price Arbitrage' },
      { title: 'Arrival Volume Correlation', desc: 'Analyzes daily arrival truckloads against price movements to predict market price softening or surges.', badge: 'Arrival Trends' },
      { title: 'Personalized WhatsApp Price Alerts', desc: 'Farmers receive morning WhatsApp notifications with daily rates for their specific crops in their local district.', badge: 'WhatsApp Alerts' }
    ],
    workflow: [
      { step: '1', title: 'Automated APMC Feeds Ingestion', desc: 'Scrape and ingest official Agmarknet and state APMC electronic auction results.' },
      { step: '2', title: 'Data Cleaning & Normalization', desc: 'Normalize local units (Quintal, Mann, Bori) into standardized metric pricing per quintal.' },
      { step: '3', title: 'Arbitrage Analysis Calculation', desc: 'Calculate net farmer realization after factoring in transport costs to different mandis.' },
      { step: '4', title: 'Push Notification Dispatch', desc: 'Broadcast personalized market price summaries to farmer smartphone apps.' }
    ],
    technicalSpecs: [
      { label: 'Data Sources', value: 'Agmarknet Gov API, e-NAM portal feeds, Direct mandi reporter network' },
      { label: 'Pricing Metrics', value: 'Minimum Price, Maximum Price, Modal Price (₹ / Quintal)' },
      { label: 'Machine Learning', value: 'ARIMA & Prophet timeseries seasonal price forecasting models' },
      { label: 'Access Channels', value: 'Mobile App, Web Portal, WhatsApp Bot, Automated Voice IVR' }
    ]
  },

  'master-product-catalog': {
    id: 'master-product-catalog',
    name: 'Master Product Catalog',
    category: 'AGRI-COMMERCE & RURAL',
    categorySlug: 'agri-commerce-rural',
    navigationOrigin: 'solutions',
    badge: 'Universal Catalog',
    tagline: 'Standardized agricultural SKU database with certified seeds, fertilizers, pesticides & specifications',
    description: 'Comprehensive agricultural inputs and commodities catalog. Contains standardized technical specifications, active chemical ingredients, recommended dosages, packaging configurations, and government registration certificates.',
    metrics: [
      { label: 'Verified SKUs', sub: 'Seeds, Chemicals, Machinery', val: '25,000+' },
      { label: 'Compliance Data', sub: 'CIBRC & Fertilizer Control Order', val: '100% Valid' },
      { label: 'Barcode Mapping', sub: 'GS1 & OEM Manufacturer Codes', val: 'Pre-Mapped' },
      { label: 'Technical Dossiers', sub: 'Usage, Dosage & Safety Sheets', val: 'Included' }
    ],
    pillars: [
      { title: 'Government Regulatory Tagging', desc: 'Tagging of statutory Central Insecticides Board (CIBRC) registration numbers and Fertilizer Control Order (FCO) licenses.', badge: 'Regulatory Tag' },
      { title: 'Agronomic Dosage Specifications', desc: 'Clear guidelines on chemical formulation, dilution ratios, target pests, and mandatory pre-harvest intervals.', badge: 'Dosage Guides' },
      { title: 'Hierarchical Multi-Unit Packing', desc: 'Accurate conversion between primary packaging (e.g. 500ml bottle) and master shipping cartons (e.g. 20 bottles/case).', badge: 'Packaging UOM' },
      { title: 'Instant ERP Inventory Import', desc: 'Agri-retailers import verified product profiles into their local billing software with one click, skipping manual data entry.', badge: '1-Click Import' }
    ],
    workflow: [
      { step: '1', title: 'Manufacturer Data Verification', desc: 'Ingest OEM technical sheets and government chemical registration certificates.' },
      { step: '2', title: 'Agronomic Enrichment', desc: 'Add regional crop compatibility, application timing, and target weed/pest classifications.' },
      { step: '3', title: 'High-Resolution Asset Binding', desc: 'Attach verified product pack photos, safety datasheets, and barcode numbers.' },
      { step: '4', title: 'Universal Marketplace Sync', desc: 'Publish catalog across retail POS networks, GramUnnati marketplace, and ERP inventory.' }
    ],
    technicalSpecs: [
      { label: 'Catalog Standard', value: 'GS1 Global Product Classification (GPC) for Agriculture' },
      { label: 'Chemical Verification', value: 'Chemical Abstracts Service (CAS) registry & technical purity %' },
      { label: 'Search Engine', value: 'Elasticsearch / OpenSearch with phonetic typo tolerance' },
      { label: 'Media Assets', value: 'Optimized WebP product renders with multi-angle packaging shots' }
    ]
  },

  't1-direct-bank-payouts': {
    id: 't1-direct-bank-payouts',
    name: 'T+1 Direct Bank Payouts',
    category: 'AGRI-COMMERCE & RURAL',
    categorySlug: 'agri-commerce-rural',
    navigationOrigin: 'solutions',
    badge: 'Instant Liquidity',
    tagline: 'Automated NEFT, RTGS & IMPS direct bank transfers, payout reconciliation & SMS UTR tracking',
    description: 'Guarantees next-day financial settlement for rural agricultural transactions. Eliminates delayed informal farmer payments with direct bank transfers (NEFT, RTGS, IMPS) executed via automated banking APIs within 24 hours of produce weighment verification.',
    metrics: [
      { label: 'Settlement Window', sub: 'Produce Delivery to Bank Credit', val: '< 24 Hours' },
      { label: 'Payment Success Rate', sub: 'Pre-Validated Account Penny Drops', val: '99.8%' },
      { label: 'Direct Bank Channels', sub: 'IMPS, NEFT, RTGS, UPI', val: 'All Methods' },
      { label: 'SMS UTR Receipt', sub: 'Instant Bank Reference Delivery', val: 'Immediate' }
    ],
    pillars: [
      { title: 'Pre-Validation Penny Drop', desc: 'Validates farmer bank account and name matching via a ₹1 penny drop prior to executing large commodity payouts.', badge: 'Penny Drop' },
      { title: 'Automated T+1 Settlement Queue', desc: 'Executes approved weighbridge payout batches directly through corporate banking API tunnels without manual intervention.', badge: 'Batch Payouts' },
      { title: 'Instant SMS UTR Confirmation', desc: 'Sends regional-language SMS containing bank UTR reference number so farmers can verify credit at local bank branch.', badge: 'SMS UTR' },
      { title: 'Zero Reversal Architecture', desc: 'Automated error handling with fallback to alternative verified family bank accounts if primary account encounters freeze.', badge: 'Zero Reversal' }
    ],
    workflow: [
      { step: '1', title: 'Weighment Approval & Invoice Generation', desc: 'Destination warehouse approves weighbridge receipt and generates verified farmer payout slip.' },
      { step: '2', title: 'Automated Payout Batch Queue', desc: 'System compiles daily transactions into secure corporate banking API payment instruction.' },
      { step: '3', title: 'Banking Gateway Execution', desc: 'Bank executes IMPS/NEFT transfers, returning unique 16-digit UTR numbers within seconds.' },
      { step: '4', title: 'ERP Ledger & SMS Dispatch', desc: 'Update farmer ledger to "Paid", record transaction UTR, and broadcast SMS confirmation.' }
    ],
    technicalSpecs: [
      { label: 'Banking APIs', value: 'ICICI Connected Banking, HDFC Corporate ENet, RazorpayX Enterprise' },
      { label: 'Supported Protocols', value: 'IMPS (Immediate Payment), NEFT, RTGS, NACH / Direct Benefit Transfer' },
      { label: 'Security & Encryption', value: '256-bit RSA asymmetric encryption with digital signature certificates' },
      { label: 'Reconciliation', value: 'Automated bank statement reconciliation and real-time reversal notifications' }
    ]
  },

  // =========================================================================
  // SOLUTIONS — CATEGORY 7: TASK MANAGEMENT (SYNKRO)
  // =========================================================================
  'synkroboard-workspace': {
    id: 'synkroboard-workspace',
    name: 'SynkroBoard Workspace',
    category: 'TASK MANAGEMENT (SYNKRO)',
    categorySlug: 'task-management-synkro',
    navigationOrigin: 'solutions',
    badge: 'Enterprise Workspace',
    tagline: 'Collaborative task management platform with project boards, milestone tracking & team governance',
    description: 'Enterprise project governance and operational task collaboration. Bridges industrial shop floors, engineering teams, and executive management with shared workspaces, visual task boards, time logs, and cross-departmental accountability.',
    metrics: [
      { label: 'Team Velocity', sub: 'Sprint Completion Improvement', val: '+ 32%' },
      { label: 'Task Visibility', sub: 'Real-Time State Synchronization', val: '100%' },
      { label: 'Milestone Adherence', sub: 'On-Time Project Delivery', val: '94.8%' },
      { label: 'Meeting Reduction', sub: 'Asynchronous Status Tracking', val: '- 40%' }
    ],
    pillars: [
      { title: 'Unified Project Workspaces', desc: 'Organize organizational initiatives into dedicated departmental workspaces with custom access boundaries.', badge: 'Workspaces' },
      { title: 'Multi-Perspective Task Views', desc: 'Switch seamlessly between interactive Kanban boards, Gantt timeline charts, calendar matrices, and spreadsheet grids.', badge: 'Multi-View' },
      { title: 'Real-Time Collaborative State', desc: 'Sub-15ms WebSocket updates ensure all team members see card moves, edits, and comments instantly.', badge: 'Live Collab' },
      { title: 'Automated Milestone Tracking', desc: 'Rolls up individual task completion percentages into executive-level milestone progress bars.', badge: 'Milestones' }
    ],
    workflow: [
      { step: '1', title: 'Workspace & Team Setup', desc: 'Create workspace, assign team members, and define role-based editing privileges.' },
      { step: '2', title: 'Task Definition & Assignment', desc: 'Draft tasks with descriptions, priority levels, estimated hours, checklists, and assignees.' },
      { step: '3', title: 'Active Sprint Execution', desc: 'Move cards through customizable workflow stages (Backlog, In Progress, Review, Done).' },
      { step: '4', title: 'Velocity & Retrospective Review', desc: 'Analyze sprint burndown charts, cycle times, and team member workload distribution.' }
    ],
    technicalSpecs: [
      { label: 'Architecture', value: 'React 18 + WebSocket real-time pub/sub state synchronization' },
      { label: 'Data Store', value: 'PostgreSQL with Redis distributed in-memory cache' },
      { label: 'Views Supported', value: 'Kanban Board, Interactive Gantt, Calendar, List Grid, Matrix' },
      { label: 'Integration Hooks', value: 'Webhooks, REST APIs, Slack, Microsoft Teams, G Mark ERP' }
    ]
  },

  'interactive-kanban-sprints': {
    id: 'interactive-kanban-sprints',
    name: 'Interactive Kanban & Sprints',
    category: 'TASK MANAGEMENT (SYNKRO)',
    categorySlug: 'task-management-synkro',
    navigationOrigin: 'solutions',
    badge: 'Agile Execution',
    tagline: 'Drag-and-drop Kanban boards, sprint backlogs, WIP limits & automated burndown telemetry',
    description: 'High-performance visual task execution engine. Features smooth drag-and-drop card movements, Work-In-Progress (WIP) limits to eliminate bottlenecks, sprint planning backlogs, and automated burndown velocity tracking.',
    metrics: [
      { label: 'Card Move Latency', sub: 'Sub-15ms Drag-and-Drop', val: '< 15ms' },
      { label: 'WIP Limit Enforcement', sub: 'Bottleneck Prevention Guard', val: 'Enforced' },
      { label: 'Burndown Accuracy', sub: 'Real-Time Story Point Burn', val: 'Live' },
      { label: 'Sprint Velocity', sub: 'Historical Team Throughput', val: 'Automated' }
    ],
    pillars: [
      { title: 'Fluid Drag-and-Drop Interface', desc: 'Optimized gesture and pointer event handling for seamless task reordering across desktop and mobile screens.', badge: 'Fluid Drag' },
      { title: 'Work-In-Progress (WIP) Limits', desc: 'Enforces maximum allowed task cards in "In Progress" column to prevent multitasking cognitive overload.', badge: 'WIP Limits' },
      { title: 'Custom Workflow Columns', desc: 'Define domain-specific stages: e.g. Backlog &rarr; Electrical &rarr; Mechanical &rarr; QA Inspection &rarr; Deployed.', badge: 'Custom Stages' },
      { title: 'Live Sprint Burndown Telemetry', desc: 'Real-time charts plotting actual remaining story points against the ideal sprint burn trajectory.', badge: 'Burndown Chart' }
    ],
    workflow: [
      { step: '1', title: 'Sprint Backlog Grooming', desc: 'Prioritize tasks, estimate effort story points, and assign sprint target goals.' },
      { step: '2', title: 'Sprint Launch & WIP Allocation', desc: 'Activate sprint with configured column capacity limits.' },
      { step: '3', title: 'Daily Drag-and-Drop Progress', desc: 'Team members drag cards across columns as work progresses from start to finish.' },
      { step: '4', title: 'Sprint Completion & Rollover', desc: 'Close sprint, review velocity metrics, and roll incomplete items into next backlog.' }
    ],
    technicalSpecs: [
      { label: 'Drag Engine', value: 'HTML5 Drag and Drop API + Framer Motion spring physics' },
      { label: 'WIP Enforcement', value: 'Visual warning banners and optional hard-block on exceeding column caps' },
      { label: 'Sprint Analytics', value: 'Cumulative Flow Diagrams (CFD), Velocity Trends, Cycle Time Histograms' },
      { label: 'Keyboard Shortcuts', value: 'Full keyboard navigation (J/K up/down, Enter to open, Space to assign)' }
    ]
  },

  'raci-governance-matrix': {
    id: 'raci-governance-matrix',
    name: 'RACI Governance Matrix',
    category: 'TASK MANAGEMENT (SYNKRO)',
    categorySlug: 'task-management-synkro',
    navigationOrigin: 'solutions',
    badge: 'Accountability Governance',
    tagline: 'Responsible, Accountable, Consulted, and Informed organizational role mapping for zero ownership ambiguity',
    description: 'Brings crystal-clear institutional governance to industrial workflows. Eliminates the "nobody knew who was responsible" failure by strictly defining exactly who is Responsible (R), Accountable (A), Consulted (C), and Informed (I) for every task and milestone.',
    metrics: [
      { label: 'Ownership Ambiguity', sub: 'Zero Confusion of Responsibility', val: '0.0%' },
      { label: 'Dual-Accountability Block', sub: 'Strictly One Accountable Owner', val: 'Enforced' },
      { label: 'Audit Traceability', sub: 'Role-Based Approval Logs', val: '100%' },
      { label: 'Notification Precision', sub: 'Noise-Free Targeted Alerts', val: 'Zero Spam' }
    ],
    pillars: [
      { title: 'Strict Single Accountable Owner', desc: 'System prevents task creation without exactly ONE Accountable (A) individual, establishing ultimate ownership.', badge: 'Single Owner' },
      { title: 'Responsible Task Doers (R)', desc: 'Assigns one or more team members tasked with executing physical or digital work items.', badge: 'Doer Team' },
      { title: 'Consulted Subject Matter Experts (C)', desc: 'Two-way consultation channels routing technical approval requests to domain specialists before closure.', badge: 'SME Review' },
      { title: 'Informed Stakeholders (I)', desc: 'Automatic read-only status broadcasts keeping senior executives and clients informed without cluttering their inbox.', badge: 'Auto Inform' }
    ],
    workflow: [
      { step: '1', title: 'RACI Matrix Mapping', desc: 'Define matrix grid linking project deliverables to department roles.' },
      { step: '2', title: 'Task Generation & Validation', desc: 'System validates that each card has 1 Accountable and designated Responsible parties.' },
      { step: '3', title: 'Consultation Checkpoints', desc: 'Task cannot be closed until designated Consulted (C) experts submit digital approval.' },
      { step: '4', title: 'Informed Broadcast Dispatch', desc: 'Automated executive summary notification dispatched to Informed (I) stakeholders upon completion.' }
    ],
    technicalSpecs: [
      { label: 'Governance Standard', value: 'Standard Project Management Institute (PMI) RACI Model' },
      { label: 'Validation Engine', value: 'System rule: Exactly 1 [A] per task; Minimum 1 [R] per task' },
      { label: 'Approval Traceability', value: 'Cryptographically signed audit log of consultations and sign-offs' },
      { label: 'Visualization', value: 'Cross-functional 2D matrix grid with role filter toggles' }
    ]
  },

  'gantt-timelines-calendar': {
    id: 'gantt-timelines-calendar',
    name: 'Gantt Timelines & Calendar',
    category: 'TASK MANAGEMENT (SYNKRO)',
    categorySlug: 'task-management-synkro',
    navigationOrigin: 'solutions',
    badge: 'Project Timelines',
    tagline: 'Interactive Gantt charts, task dependency links, critical path analysis & synchronized calendar schedules',
    description: 'Long-range industrial project planning and timeline orchestration. Features interactive Gantt timelines with drag-to-resize duration bars, predecessor/successor dependency connectors, automated critical path calculation, and synchronized team calendars.',
    metrics: [
      { label: 'Critical Path Engine', sub: 'Instant Bottleneck Discovery', val: 'Real-Time' },
      { label: 'Dependency Types', sub: 'FS, SS, FF, SF Connectors', val: '4 Types' },
      { label: 'Zoom Levels', sub: 'Day, Week, Month, Quarter', val: '4 Scales' },
      { label: 'Calendar Sync', sub: 'Google / Outlook / iCal Integration', val: '2-Way Sync' }
    ],
    pillars: [
      { title: 'Interactive Timeline Drag & Resize', desc: 'Adjust task start dates and durations directly on the visual timeline with instantaneous schedule recalibration.', badge: 'Visual Gantt' },
      { title: 'Task Dependency Connectors', desc: 'Enforces Finish-to-Start (FS), Start-to-Start (SS), and Finish-to-Finish (FF) predecessor constraints.', badge: 'Dependencies' },
      { title: 'Critical Path Method (CPM)', desc: 'Highlights the critical chain of dependent tasks directly impacting final project delivery deadlines.', badge: 'Critical Path' },
      { title: 'Bi-Directional Calendar Integration', desc: 'Synchronizes task deadlines and milestones directly into Google Calendar and Microsoft Outlook.', badge: 'Calendar Sync' }
    ],
    workflow: [
      { step: '1', title: 'Work Breakdown Structure (WBS)', desc: 'Deconstruct project into parent milestones and child sub-tasks.' },
      { step: '2', title: 'Dependency Linking', desc: 'Draw visual dependency lines between tasks (e.g., Civil Work must finish before Mechanical Assembly).' },
      { step: '3', title: 'Critical Path Identification', desc: 'System highlights zero-slack tasks in red indicating critical path items.' },
      { step: '4', title: 'Dynamic Schedule Tracking', desc: 'Sliding any delayed task automatically updates downstream schedules and alerts project managers.' }
    ],
    technicalSpecs: [
      { label: 'Rendering Engine', value: 'High-performance SVG/Canvas timeline virtualized for 5,000+ tasks' },
      { label: 'Dependency Algorithm', value: 'Topological sorting with circular dependency loop detection' },
      { label: 'Calendar Standards', value: 'iCalendar RFC 5545 format with CalDAV bi-directional sync' },
      { label: 'Export Options', value: 'Vector PDF, Microsoft Project (MPX / XML), CSV' }
    ]
  },

  'absence-leave-scheduling': {
    id: 'absence-leave-scheduling',
    name: 'Absence & Leave Scheduling Sync',
    category: 'TASK MANAGEMENT (SYNKRO)',
    categorySlug: 'task-management-synkro',
    navigationOrigin: 'solutions',
    badge: 'Capacity Planning',
    tagline: 'Team leave calendar, shift rotation scheduling & automated sprint capacity re-balancing',
    description: 'Connects employee leave management directly into project capacity planning. When a team member schedules paid time off or shift absence, SynkroBoard automatically adjusts available sprint hours and prompts managers to reassign impending deadlines.',
    metrics: [
      { label: 'Capacity Accuracy', sub: 'True Available Work Hours', val: '100%' },
      { label: 'Overbooking Alerts', sub: 'Prevents Task Burnout', val: 'Proactive' },
      { label: 'Approval Speed', sub: 'Mobile Manager Leave Sign-Off', val: '< 1 Hr' },
      { label: 'Shift Coverage', sub: 'Prevents Zero-Staffing Shifts', val: 'Guaranteed' }
    ],
    pillars: [
      { title: 'Leave-Aware Capacity Calculator', desc: 'Deducts approved vacation, sick leave, and statutory holidays from sprint story point allocations.', badge: 'Capacity Guard' },
      { title: 'Shift Rotation Scheduler', desc: 'Plans morning, evening, and night industrial shifts with minimum rest interval validation.', badge: 'Shift Engine' },
      { title: 'Automatic Task Reassignment Prompts', desc: 'Warns project leads if an employee is assigned a deadline falling during their approved leave window.', badge: 'Conflict Warning' },
      { title: 'Holiday Calendar Profiles', desc: 'Supports multi-location statutory holiday calendars across different regional offices and manufacturing plants.', badge: 'Holiday Rules' }
    ],
    workflow: [
      { step: '1', title: 'Leave Application Submission', desc: 'Employee applies for leave on mobile app; displays remaining annual balance.' },
      { step: '2', title: 'Conflict & Capacity Check', desc: 'System checks active task assignments and team shift coverage limits.' },
      { step: '3', title: 'Manager Approval & Calendar Block', desc: 'Supervisor approves leave; team calendar reflects absence block immediately.' },
      { step: '4', title: 'Sprint Capacity Recalibration', desc: 'Sprint planning board automatically reduces available team hours for the week.' }
    ],
    technicalSpecs: [
      { label: 'Leave Types Supported', value: 'Paid Time Off (PTO), Casual Leave, Sick Leave, Maternity/Paternity, Comp-Off' },
      { label: 'Shift Configurations', value: 'Rotational 3-shift (A/B/C), General shift, Weekend on-call support' },
      { label: 'Approval Hierarchy', value: 'Single-tier supervisor or multi-tier HR + department lead approval' },
      { label: 'Payroll Bridge', value: 'Direct export to G Mark Payroll & Attendance module' }
    ]
  },

  'role-based-dashboards': {
    id: 'role-based-dashboards',
    name: 'Role-Based Dashboards',
    category: 'TASK MANAGEMENT (SYNKRO)',
    categorySlug: 'task-management-synkro',
    navigationOrigin: 'solutions',
    badge: 'Executive Visibility',
    tagline: 'Tailored executive, managerial, and individual contributor performance cockpits with KPI widgets',
    description: 'Eliminates information overload with role-tailored dashboards. C-level executives see high-level project budget burn and milestone status; project managers see team velocity and bottleneck alerts; individual engineers see their personal to-do list and upcoming deadlines.',
    metrics: [
      { label: 'Dashboard Roles', sub: 'Executive, Lead, Engineer, Client', val: '4 Profiles' },
      { label: 'Data Freshness', sub: 'Real-Time Widget Telemetry', val: '< 100ms' },
      { label: 'Report Generation', sub: 'PDF Executive Status Briefs', val: 'Instant' },
      { label: 'Focus Lift', sub: 'Zero Clutter Targeted Views', val: '+ 35%' }
    ],
    pillars: [
      { title: 'C-Suite Executive Overview', desc: 'Aggregated portfolio health, budget utilization, overdue milestone counters, and risk matrices.', badge: 'Executive View' },
      { title: 'Project Lead Operations Cockpit', desc: 'Sprint velocity gauges, team member workload heatmaps, and unassigned task queues.', badge: 'Manager View' },
      { title: 'Personal Contributor Focus Pad', desc: 'Clean, distraction-free view showing today\'s priorities, pending review requests, and mentions.', badge: 'My Tasks' },
      { title: 'Client & Stakeholder Portal', desc: 'Secure, brandable portal providing external clients view-only transparency into project progress.', badge: 'Client Portal' }
    ],
    workflow: [
      { step: '1', title: 'User Login & Role Resolution', desc: 'System reads user RBAC privileges and loads tailored widget layout.' },
      { step: '2', title: 'Real-Time KPI Ingestion', desc: 'Widgets poll task velocity, milestone progress, and open tickets.' },
      { step: '3', title: 'Custom Widget Arrangement', desc: 'Users customize drag-and-drop widget layout according to personal preferences.' },
      { step: '4', title: 'Scheduled Executive Email Reports', desc: 'System automatically compiles weekly PDF digest and emails to executive board.' }
    ],
    technicalSpecs: [
      { label: 'Widget Framework', value: 'Modular React grid layout engine with resizable tile dimensions' },
      { label: 'Security Boundary', value: 'Server-side data filtering preventing unauthorized metric exposure' },
      { label: 'Export Formats', value: 'High-resolution PDF Executive Status Pack, Excel Data Dumps' },
      { label: 'Dark / Light Modes', value: 'Fully responsive UI optimized for desktop monitors and mobile tablets' }
    ]
  },

  // =========================================================================
  // SOLUTIONS — CATEGORY 8: PLATFORM & EDGE CLOUD
  // =========================================================================
  'real-time-websocket-bus': {
    id: 'real-time-websocket-bus',
    name: 'Real-Time WebSocket Bus',
    category: 'PLATFORM & EDGE CLOUD',
    categorySlug: 'platform-edge-cloud',
    navigationOrigin: 'solutions',
    badge: 'Real-Time Infrastructure',
    tagline: 'Bidirectional low-latency event distribution bus powered by WebSockets & Redis Pub/Sub cluster',
    description: 'The real-time communications backbone of the G Mark cloud. Distributes sub-15ms state changes, collaborative task movements, live GPS vehicle trails, and industrial SCADA alarms across thousands of concurrent connected browser and mobile clients.',
    metrics: [
      { label: 'Event Latency', sub: 'Sub-15ms Pub/Sub Broadcast', val: '< 15ms' },
      { label: 'Concurrent Sockets', sub: 'Horizontal Scaling Capacity', val: '100,000+' },
      { label: 'Packet Drop Rate', sub: 'Guaranteed In-Order Delivery', val: '0.001%' },
      { label: 'Heartbeat Protocol', sub: 'Instant Reconnection Recovery', val: '< 1.5 Sec' }
    ],
    pillars: [
      { title: 'Bidirectional WebSocket Transport', desc: 'Replaces wasteful HTTP polling with full-duplex persistent TCP connections for instantaneous data exchange.', badge: 'Full Duplex' },
      { title: 'Redis Pub/Sub Cluster Backing', desc: 'Distributed event broker broadcasting state updates across horizontally scaled multi-node application servers.', badge: 'Redis Broker' },
      { title: 'Automatic Reconnection & State Recovery', desc: 'Handles mobile network dropouts with exponential backoff and delta-missed-packet synchronization.', badge: 'Resilient Sync' },
      { title: 'Room & Channel Namespacing', desc: 'Isolates events strictly to authorized company tenants, project rooms, and asset telemetry channels.', badge: 'Namespacing' }
    ],
    workflow: [
      { step: '1', title: 'Handshake & JWT Authentication', desc: 'Client opens WebSocket connection; server validates cryptographic JWT session token.' },
      { step: '2', title: 'Channel Subscription', desc: 'Client subscribes to relevant topic rooms (e.g. `tenant:12:board:45` or `device:88:telemetry`).' },
      { step: '3', title: 'Event Publication & Fan-Out', desc: 'Backend microservice publishes state mutation to Redis; event fans out to connected clients.' },
      { step: '4', title: 'Client UI DOM Mutation', desc: 'Client application updates local state store in under 15ms with zero screen flicker.' }
    ],
    technicalSpecs: [
      { label: 'Protocol', value: 'WebSocket RFC 6455 over WSS (TLS 1.3 encrypted)' },
      { label: 'Message Broker', value: 'Redis Cluster 7.2 with in-memory Pub/Sub & Redis Streams' },
      { label: 'Framing Format', value: 'Lightweight JSON or binary Protocol Buffers (Protobuf)' },
      { label: 'Fallback Mode', value: 'Automatic downgrade to HTTP Long-Polling if WebSocket port blocked' }
    ]
  },

  'multichannel-alert-engine': {
    id: 'multichannel-alert-engine',
    name: 'Multi-Channel Alert Engine',
    category: 'PLATFORM & EDGE CLOUD',
    categorySlug: 'platform-edge-cloud',
    navigationOrigin: 'solutions',
    badge: 'Notification Dispatch',
    tagline: 'Intelligent incident notification engine dispatching via SMS, WhatsApp, Voice Calls & Mobile Push',
    description: 'Mission-critical notification dispatch engine. Routes emergency machinery trips, security geofence breaches, and statutory billing approvals across SMS, WhatsApp Business API, automated IVR phone calls, and mobile push notifications with deduplication.',
    metrics: [
      { label: 'Dispatch Latency', sub: 'Trigger to Notification Send', val: '< 500ms' },
      { label: 'Delivery Redundancy', sub: 'Multi-Carrier Failover', val: '99.98%' },
      { label: 'Alert Fatigue Guard', sub: 'Smart Flapping Deduplication', val: 'Active' },
      { label: 'Supported Channels', sub: 'SMS, WhatsApp, Voice, Push, Email', val: '5 Modes' }
    ],
    pillars: [
      { title: 'Multi-Tier Escalation Matrix', desc: 'If on-duty technician does not acknowledge an alert within 5 minutes, system auto-escalates to maintenance manager.', badge: 'Escalations' },
      { title: 'Intelligent Alert Deduplication', desc: 'Suppresses duplicate notifications during sensor flapping to eliminate operator alert fatigue.', badge: 'Anti-Flapping' },
      { title: 'Direct WhatsApp Interactive Buttons', desc: 'Dispatches rich WhatsApp messages with interactive "Acknowledge" and "Create Ticket" quick-action buttons.', badge: 'WhatsApp API' },
      { title: 'Critical Voice Call (IVR) Fallback', desc: 'Triggers automated phone call voice broadcast for high-severity fire alarms and water system dry-runs.', badge: 'Voice Alert' }
    ],
    workflow: [
      { step: '1', title: 'Alarm Trigger Ingestion', desc: 'Receive alert event from IoT edge gateway, CMMS rule, or accounting threshold.' },
      { step: '2', title: 'Severity Classification & Deduplication', desc: 'Check alert priority (P1 Critical, P2 Major, P3 Minor) and filter recent duplicates.' },
      { step: '3', title: 'Channel Routing & Formatting', desc: 'Dispatch push notification, SMS, and WhatsApp message according to on-call duty roster.' },
      { step: '4', title: 'Acknowledgment Audit', desc: 'Record operator acknowledgment timestamp and cancel downstream escalation calls.' }
    ],
    technicalSpecs: [
      { label: 'Notification Gateways', value: 'Firebase Cloud Messaging (FCM), Twilio, Gupshup WhatsApp API, AWS SNS' },
      { label: 'Throughput Capacity', value: '5,000 alerts per second with distributed RabbitMQ task queues' },
      { label: 'Rate Limiting', value: 'Configurable recipient rate limits and quiet-hour policy rules' },
      { label: 'Audit Logging', value: 'Immutable delivery receipt log tracking gateway carrier status' }
    ]
  },

  'timescaledb-timeseries': {
    id: 'timescaledb-timeseries',
    name: 'TimescaleDB Timeseries',
    category: 'PLATFORM & EDGE CLOUD',
    categorySlug: 'platform-edge-cloud',
    navigationOrigin: 'solutions',
    badge: 'Database Architecture',
    tagline: 'High-throughput relational timeseries storage with automatic hypertable partitioning & 90% compression',
    description: 'Industrial-scale timeseries database engine built on PostgreSQL. Ingests millions of sensor telemetry readings per minute, automatically partitioning data into hypertables and applying algorithmic columnar compression to reduce storage footprints by over 90%.',
    metrics: [
      { label: 'Ingestion Throughput', sub: 'Inserts Per Second', val: '100,000+' },
      { label: 'Storage Compression', sub: 'Columnar Compression Ratio', val: '93% Saved' },
      { label: 'Query Performance', sub: 'Time-Bucket Aggregation', val: '< 20ms' },
      { label: 'SQL Compatibility', sub: 'Full Standard PostgreSQL SQL', val: '100% ANSI' }
    ],
    pillars: [
      { title: 'Automated Hypertables', desc: 'Partitions continuous sensor data streams across time and space chunks transparently, maintaining lightning-fast query speeds.', badge: 'Hypertables' },
      { title: 'Algorithmic Columnar Compression', desc: 'Applies Gorilla and delta compression on historical chunks, reducing terabyte-scale sensor storage costs.', badge: 'Compression' },
      { title: 'Continuous Aggregate Views', desc: 'Pre-computes hourly, daily, and monthly min/max/average metrics automatically in background materialized views.', badge: 'Aggregates' },
      { title: 'Relational & Timeseries Synergy', desc: 'Join high-speed telemetry directly with business relational tables (assets, customers, technicians) using standard SQL.', badge: 'Relational SQL' }
    ],
    workflow: [
      { step: '1', title: 'High-Volume Ingestion Stream', desc: 'Edge gateways push telemetry batches into Kafka queue routing directly to TimescaleDB.' },
      { step: '2', title: 'Automatic Chunk Partitioning', desc: 'Database writes readings into active 24-hour time chunks without index degradation.' },
      { step: '3', title: 'Historical Compression Policy', desc: 'Chunks older than 7 days automatically convert into compressed columnar format.' },
      { step: '4', title: 'Analytical Query Execution', desc: 'Execute complex analytical queries (e.g. `time_bucket(\'15 minutes\', time)`) in milliseconds.' }
    ],
    technicalSpecs: [
      { label: 'Core Engine', value: 'PostgreSQL 16 with TimescaleDB 2.14 Enterprise Extension' },
      { label: 'Compression Types', value: 'Gorilla (floats), Delta-of-delta (timestamps), LZ4 (strings)' },
      { label: 'Retention Policies', value: 'Automated data drop or downsampling policies past statutory retention' },
      { label: 'Query Language', value: 'Standard ANSI SQL with custom Timeseries analytical extensions' }
    ]
  },

  'digital-document-vault': {
    id: 'digital-document-vault',
    name: 'Digital Document Vault',
    category: 'PLATFORM & EDGE CLOUD',
    categorySlug: 'platform-edge-cloud',
    navigationOrigin: 'solutions',
    badge: 'Enterprise ECM',
    tagline: 'Cryptographically secured enterprise document repository with OCR text extraction & compliance archiving',
    description: 'Enterprise Content Management (ECM) and statutory document repository. Securely archives tax invoices, vendor agreements, land records, vehicle registrations, and machine manuals with AES-256 encryption, optical character recognition (OCR), and tamper-evident audit logs.',
    metrics: [
      { label: 'Encryption Grade', sub: 'At-Rest & In-Transit', val: 'AES-256' },
      { label: 'OCR Text Search', sub: 'Scanned Document Discovery', val: 'Automated' },
      { label: 'Storage Durability', sub: 'Cloud S3 Multi-AZ Redundancy', val: '99.999999999%' },
      { label: 'Retrieval Speed', sub: 'Pre-Signed Secure Download', val: '< 100ms' }
    ],
    pillars: [
      { title: 'End-to-End Cryptographic Storage', desc: 'Every uploaded file is encrypted with unique envelope keys before writing to multi-zone cloud storage buckets.', badge: 'AES-256' },
      { title: 'Automated OCR Text Extraction', desc: 'Extracts printed text, tax numbers, and dates from scanned vendor bills and vehicle papers for instant search.', badge: 'OCR Engine' },
      { title: 'Role-Based Access & Watermarking', desc: 'Applies dynamic watermarks (user name, timestamp, IP) when sensitive contracts are viewed or downloaded.', badge: 'Watermarking' },
      { title: 'Statutory Retention Archiving', desc: 'Locks statutory financial documents against deletion for the mandatory 8-year company law compliance period.', badge: 'Statutory Lock' }
    ],
    workflow: [
      { step: '1', title: 'File Upload & Virus Scan', desc: 'Client uploads PDF or image; server scans for malware and computes SHA-256 checksum.' },
      { step: '2', title: 'OCR & Metadata Indexing', desc: 'Background worker extracts text, indexes keywords, and links file to ERP record.' },
      { step: '3', title: 'Encrypted Cloud Archiving', desc: 'Encrypt file with AES-256 and store in distributed object storage with redundancy.' },
      { step: '4', title: 'Authorized Secure Retrieval', desc: 'Generate time-limited (15-minute) pre-signed URL upon verified user permission check.' }
    ],
    technicalSpecs: [
      { label: 'Storage Backend', value: 'Amazon S3 / MinIO Object Storage with SSE-S3 encryption' },
      { label: 'OCR Engine', value: 'Tesseract OCR + AWS Textract machine learning document analysis' },
      { label: 'Compliance Standards', value: 'ISO 27001, Indian IT Act 2000, GDPR document retention rules' },
      { label: 'Audit Trail', value: 'Immutable record of every file upload, preview, download, and deletion attempt' }
    ]
  },

  'enterprise-rest-webhook-apis': {
    id: 'enterprise-rest-webhook-apis',
    name: 'Enterprise REST & Webhook APIs',
    category: 'PLATFORM & EDGE CLOUD',
    categorySlug: 'platform-edge-cloud',
    navigationOrigin: 'solutions',
    badge: 'Integration Architecture',
    tagline: 'OpenAPI 3.0 documented RESTful endpoints, event-driven webhooks & secure third-party ERP integration',
    description: 'Universal interoperability bridge connecting G Mark with third-party software, SAP systems, banking portals, government e-way bill servers, and custom corporate applications through high-speed OpenAPI 3.0 REST endpoints and retry-enabled webhooks.',
    metrics: [
      { label: 'API Uptime SLA', sub: 'High-Availability Gateway', val: '99.95%' },
      { label: 'Response Latency', sub: 'Average P95 API Response', val: '< 45ms' },
      { label: 'Webhook Reliability', sub: 'Exponential Backoff Retries', val: '99.99%' },
      { label: 'Rate Limiting Guard', sub: 'DDoS & Burst Protection', val: '10,000 req/m' }
    ],
    pillars: [
      { title: 'OpenAPI 3.0 Standardized Schemas', desc: 'Thoroughly documented REST endpoints with automated Swagger UI interactive testing console.', badge: 'OpenAPI 3.0' },
      { title: 'Event-Driven Webhook Dispatch', desc: 'Pushes real-time JSON payloads to external URLs upon invoice creation, payment receipt, or machine alarm.', badge: 'Webhooks' },
      { title: 'API Key & HMAC Signature Security', desc: 'Secures external communications with rotating API keys and cryptographic HMAC-SHA256 signature headers.', badge: 'HMAC Security' },
      { title: 'Token Bucket Rate Limiting', desc: 'Protects backend microservices from traffic spikes using Redis-backed token bucket rate limiters.', badge: 'Rate Limiter' }
    ],
    workflow: [
      { step: '1', title: 'API Key Generation', desc: 'Admin generates scoped API credential key with granular read/write resource permissions.' },
      { step: '2', title: 'External System Invocation', desc: 'Third-party ERP or custom app issues HTTPS request with Bearer authorization header.' },
      { step: '3', title: 'Schema Validation & Execution', desc: 'API gateway validates payload against JSON schema and commits transaction in database.' },
      { step: '4', title: 'Webhook Event Broadcast', desc: 'System fires asynchronous webhook notifying external systems of downstream workflow state changes.' }
    ],
    technicalSpecs: [
      { label: 'API Framework', value: 'NestJS TypeScript with Fastify high-performance HTTP adapter' },
      { label: 'Specification', value: 'OpenAPI 3.0 (Swagger) with auto-generated client SDKs' },
      { label: 'Authentication', value: 'OAuth 2.0 Client Credentials, API Keys, and HMAC-SHA256 signatures' },
      { label: 'Webhook Retries', value: 'Exponential backoff schedule (5 attempts over 24 hours)' }
    ]
  },

  'edge-microservice-gateways': {
    id: 'edge-microservice-gateways',
    name: 'Edge Microservice Gateways',
    category: 'PLATFORM & EDGE CLOUD',
    categorySlug: 'platform-edge-cloud',
    navigationOrigin: 'solutions',
    badge: 'Edge Computing',
    tagline: 'Embedded Linux & microcontroller edge gateways executing offline logic, relay control & telemetry caching',
    description: 'Decentralized edge computing architecture. G-Nova edge gateways execute local automated control loops, safety trip relays, and offline telemetry buffering directly on factory and pump room premises, ensuring 100% operation even during total internet blackouts.',
    metrics: [
      { label: 'Offline Autonomy', sub: 'Local Control Loop Operation', val: '100% Autonomous' },
      { label: 'Relay Actuation Speed', sub: 'Edge Dry-Run Trip Delay', val: '< 50ms' },
      { label: 'Local Telemetry Buffer', sub: 'Flash Storage Duration', val: '30 Days' },
      { label: 'OTA Firmware Updates', sub: 'Encrypted Remote Patches', val: 'Automated' }
    ],
    pillars: [
      { title: 'Zero-Cloud Autonomous Operation', desc: 'Maintains critical pump staging, fire safety interlocks, and sensor trips locally without cloud dependency.', badge: 'Local Logic' },
      { title: 'Offline Flash Telemetry Caching', desc: 'Stores sensor readings on industrial eMMC flash storage during network outages, syncing smoothly upon reconnection.', badge: 'Flash Buffer' },
      { title: 'Over-The-Air (OTA) Firmware Management', desc: 'Remotely deploys cryptographically signed firmware updates and security patches to thousands of edge gateways.', badge: 'Remote OTA' },
      { title: 'Hardware Watchdog & Self-Healing', desc: 'Hardware watchdog timer automatically reboots edge microprocessor in under 2 seconds if software hangs.', badge: 'Self-Healing' }
    ],
    workflow: [
      { step: '1', title: 'Local Sensor Reading', desc: 'Edge processor reads analog 4-20mA lines and RS-485 Modbus registers continuously.' },
      { step: '2', title: 'Local Safety Logic Evaluation', desc: 'Evaluate rule matrix (e.g. If pressure < 1.0 bar and current > 15A &rarr; trip relay).' },
      { step: '3', title: 'Immediate Actuation', desc: 'Trigger digital output relay in under 50ms to protect mechanical equipment.' },
      { step: '4', title: 'Cloud Telemetry Batching', desc: 'Compress events and transmit to cloud platform when connectivity is available.' }
    ],
    technicalSpecs: [
      { label: 'Hardware Architecture', value: 'G-Nova AIPCU Industrial Gateway (ARM Cortex-A7 / Cortex-M4)' },
      { label: 'Operating System', value: 'Embedded Linux (Yocto) / FreeRTOS Real-Time Operating System' },
      { label: 'Physical Interfaces', value: 'RS-485 Modbus RTU, 4-20mA Analog Inputs, Digital Dry Contacts, Relay Outputs' },
      { label: 'Connectivity', value: '4G LTE Cat-1 with 2G fallback, Dual SIM, Ethernet, Wi-Fi 802.11 b/g/n' }
    ]
  },

  // =========================================================================
  // TECHNOLOGY — CATEGORY 1: CORE STACK & CLOUD PLATFORM
  // =========================================================================
  'tech-react-vite': {
    id: 'tech-react-vite',
    name: 'React 18 & Vite Architecture',
    category: 'CORE STACK & CLOUD PLATFORM',
    categorySlug: 'core-stack-cloud-platform',
    navigationOrigin: 'technology',
    badge: 'Frontend Engineering',
    tagline: 'High-performance Single Page Application (SPA) architecture with sub-second HMR and optimized bundle splitting',
    description: 'The foundation of G Mark\'s blazing-fast web user interface. Leverages React 18 concurrent rendering, Vite next-generation ES module bundling, dynamic code splitting, and hardware-accelerated animations to deliver a seamless desktop and mobile web experience.',
    metrics: [
      { label: 'Initial Page Load', sub: 'Optimized Gzip JS Chunks', val: '< 0.8 Sec' },
      { label: 'Hot Module Replace', sub: 'Instantaneous Dev Velocity', val: '< 50ms' },
      { label: 'Lighthouse Score', sub: 'Performance & Accessibility', val: '98 / 100' },
      { label: 'Bundle Efficiency', sub: 'Tree-Shaken Rollup Build', val: 'Zero Bloat' }
    ],
    pillars: [
      { title: 'Concurrent React 18 Rendering', desc: 'Uses non-blocking concurrent features (`useTransition`, `useDeferredValue`) to maintain silky smooth 60fps UI responsiveness during heavy data sorting.', badge: 'Concurrent UI' },
      { title: 'Vite Next-Gen Module Pipeline', desc: 'Replaces legacy Webpack compilation with native browser ES modules during development, cutting build times from minutes to milliseconds.', badge: 'Vite Speed' },
      { title: 'Dynamic Route Code Splitting', desc: 'Loads application modules on-demand, ensuring visitors only download the JavaScript code needed for their active screen.', badge: 'Lazy Loading' },
      { title: 'Hardware-Accelerated CSS Transitions', desc: 'Leverages GPU-accelerated CSS transforms and Framer Motion spring physics for smooth, natural interactive feedback.', badge: 'GPU Smooth' }
    ],
    workflow: [
      { step: '1', title: 'Component Modularization', desc: 'Structure application into atomic, reusable UI components using strict modern design tokens.' },
      { step: '2', title: 'State Management & Caching', desc: 'Manage global application state with lightweight reactive stores and optimistic UI updates.' },
      { step: '3', title: 'Production Tree-Shaking', desc: 'Rollup bundler eliminates unused code exports, outputting compact, immutable hashed chunks.' },
      { step: '4', title: 'Global Edge CDN Delivery', desc: 'Serve static assets worldwide via high-speed edge caching with automated HTTP/3 compression.' }
    ],
    technicalSpecs: [
      { label: 'Core Framework', value: 'React 18.2 with Concurrent Mode & Hooks architecture' },
      { label: 'Build Tooling', value: 'Vite 5.x powered by Rollup and esbuild' },
      { label: 'CSS Architecture', value: 'Tailwind CSS utility engine with custom vanilla design tokens' },
      { label: 'Animation Engine', value: 'Framer Motion 11 with hardware-accelerated SVG/CSS pipelines' }
    ]
  },

  'tech-nestjs-backend': {
    id: 'tech-nestjs-backend',
    name: 'NestJS Enterprise Backend',
    category: 'CORE STACK & CLOUD PLATFORM',
    categorySlug: 'core-stack-cloud-platform',
    navigationOrigin: 'technology',
    badge: 'Backend Architecture',
    tagline: 'Scalable TypeScript microservices architecture with dependency injection, CQRS & event-driven buses',
    description: 'The enterprise backend engine powering G Mark software. Built with NestJS and TypeScript, utilizing modular architecture, robust dependency injection, schema validation pipes, and asynchronous job processing queues for institutional scalability.',
    metrics: [
      { label: 'Type Safety', sub: 'Full-Stack TypeScript Typing', val: '100% Strict' },
      { label: 'Throughput Capacity', sub: 'High-Concurrency Fastify Core', val: '25,000 req/s' },
      { label: 'Test Coverage', sub: 'Unit & Integration Suite', val: '> 88%' },
      { label: 'Microservice Bus', sub: 'RabbitMQ Event Streaming', val: 'Decoupled' }
    ],
    pillars: [
      { title: 'Inversion of Control (IoC)', desc: 'Enterprise dependency injection architecture ensuring modular separation of concerns, testability, and maintainability.', badge: 'IoC Engine' },
      { title: 'Strict DTO Validation Pipes', desc: 'Validates incoming network payloads against strict class-validator schemas before executing business logic.', badge: 'Schema Guard' },
      { title: 'Microservice Message Brokers', desc: 'Decoupled asynchronous event communication connecting billing, telemetry, and notification services via RabbitMQ.', badge: 'Event Bus' },
      { title: 'Automated OpenAPI Documentation', desc: 'Generates live Swagger documentation directly from TypeScript decorators and entity schemas.', badge: 'Live Swagger' }
    ],
    workflow: [
      { step: '1', title: 'Controller Request Routing', desc: 'Receive incoming HTTP or WebSocket request through authenticated gateway guard.' },
      { step: '2', title: 'Validation Pipe Execution', desc: 'Validate payload types and sanitize inputs to prevent injection attacks.' },
      { step: '3', title: 'Service Business Logic', desc: 'Execute business rules, database queries, and inter-service event publishing.' },
      { step: '4', title: 'Response Transformation', desc: 'Format standardized response envelope with performance execution headers.' }
    ],
    technicalSpecs: [
      { label: 'Backend Runtime', value: 'Node.js 20 LTS with TypeScript 5.x in strict mode' },
      { label: 'HTTP Adapter', value: 'Fastify ultra-low overhead HTTP engine' },
      { label: 'Message Broker', value: 'RabbitMQ 3.12 with dead-letter exchange queues' },
      { label: 'Architectural Style', value: 'Modular Domain-Driven Design (DDD) with CQRS pattern' }
    ]
  },

  'tech-postgresql-timescaledb': {
    id: 'tech-postgresql-timescaledb',
    name: 'PostgreSQL & TimescaleDB',
    category: 'CORE STACK & CLOUD PLATFORM',
    categorySlug: 'core-stack-cloud-platform',
    navigationOrigin: 'technology',
    badge: 'Relational & Timeseries',
    tagline: 'Dual-engine persistence uniting ACID relational ledger guarantees with high-throughput timeseries telemetry',
    description: 'The unified data backbone of G Mark. Couples PostgreSQL\'s strict ACID compliance for financial accounting and inventory balances with TimescaleDB\'s specialized hypertable architecture for high-frequency IoT sensor telemetry.',
    metrics: [
      { label: 'ACID Compliance', sub: 'Transactional Ledger Guarantee', val: '100% Strict' },
      { label: 'Telemetry Ingestion', sub: 'Sensor Readings Per Second', val: '100,000+' },
      { label: 'Data Compression', sub: 'Columnar Compression Ratio', val: '92% Saved' },
      { label: 'Data Reliability', sub: 'WAL Multi-Zone Replication', val: '99.999%' }
    ],
    pillars: [
      { title: 'Full ACID Ledger Integrity', desc: 'Guarantees that financial journal postings, inventory transfers, and billing records are atomic, consistent, isolated, and durable.', badge: 'ACID Core' },
      { title: 'Automatic Hypertables Partitioning', desc: 'Partitions sensor telemetry into transparent time chunks to prevent index bloat on multi-billion row tables.', badge: 'Hypertables' },
      { title: 'Advanced JSONB Indexing', desc: 'Enables flexible semi-structured document storage with high-speed GIN indexes for dynamic equipment attributes.', badge: 'JSONB Power' },
      { title: 'Write-Ahead Logging (WAL)', desc: 'Zero data loss guarantees through continuous write-ahead log archiving and point-in-time recovery (PITR).', badge: 'PITR Recovery' }
    ],
    workflow: [
      { step: '1', title: 'Connection Pooling', desc: 'Client requests routed through PgBouncer connection pooler for sub-millisecond query execution.' },
      { step: '2', title: 'Transactional Committal', desc: 'Execute database transactions with strict isolation levels to prevent race conditions.' },
      { step: '3', title: 'Timeseries Ingestion Pipeline', desc: 'Stream high-frequency sensor readings into TimescaleDB hypertables.' },
      { step: '4', title: 'Continuous Aggregate Maintenance', desc: 'Background workers refresh materialized aggregates for instant dashboard analytics.' }
    ],
    technicalSpecs: [
      { label: 'Database Version', value: 'PostgreSQL 16.2 with TimescaleDB 2.14' },
      { label: 'Connection Pooler', value: 'PgBouncer in transaction pooling mode' },
      { label: 'Indexing Methods', value: 'B-Tree, GIN (JSONB), BRIN (Block Range Index for massive tables)' },
      { label: 'Backup Architecture', value: 'pgBackRest with automated continuous WAL archiving to AWS S3' }
    ]
  },

  'tech-redis-streaming': {
    id: 'tech-redis-streaming',
    name: 'Redis Event Streaming & Cache',
    category: 'CORE STACK & CLOUD PLATFORM',
    categorySlug: 'core-stack-cloud-platform',
    navigationOrigin: 'technology',
    badge: 'In-Memory Telemetry',
    tagline: 'Sub-15ms in-memory state caching, distributed locks, rate-limiting & Redis Streams event log',
    description: 'Ultra-low latency in-memory data engine. Provides high-speed session management, distributed Redlock synchronization for concurrent sales reservations, API rate-limiting, and persistent event streaming across distributed clusters.',
    metrics: [
      { label: 'Memory Read Latency', sub: 'In-Memory Retrieval Speed', val: '< 1.5ms' },
      { label: 'Operations Per Second', sub: 'Redis Cluster Throughput', val: '500,000+' },
      { label: 'Distributed Locking', sub: 'Redlock Mutual Exclusion', val: 'Zero Race' },
      { label: 'Cluster High Availability', sub: 'Sentinel Auto-Failover', val: '< 3 Sec' }
    ],
    pillars: [
      { title: 'Sub-Millisecond Cache Layer', desc: 'Caches frequently accessed master data (product catalogs, tax rates, user roles) directly in RAM.', badge: 'RAM Speed' },
      { title: 'Distributed Redlock Algorithm', desc: 'Prevents double-booking during concurrent warehouse inventory reservations and sales orders.', badge: 'Redlock Lock' },
      { title: 'Redis Streams Event Backbone', desc: 'Append-only in-memory log enabling consumer groups to process high-throughput telemetry without data loss.', badge: 'Redis Streams' },
      { title: 'Token Bucket Rate Limiting', desc: 'Protects backend authentication and transactional endpoints from brute-force and DDoS attacks.', badge: 'Rate Limiter' }
    ],
    workflow: [
      { step: '1', title: 'Cache Lookup Check', desc: 'Incoming query checks Redis cache; returns in 1.5ms on cache hit, bypassing database.' },
      { step: '2', title: 'Distributed Lock Acquisition', desc: 'Acquire Redlock key with TTL before mutating critical shared stock resources.' },
      { step: '3', title: 'Event Publishing to Stream', desc: 'Publish telemetry mutation to Redis Stream for consumption by multiple background workers.' },
      { step: '4', title: 'Cache Invalidation on Mutation', desc: 'Automatically purge stale cache keys when records are updated in primary database.' }
    ],
    technicalSpecs: [
      { label: 'Redis Version', value: 'Redis 7.2 Enterprise Cluster with Sentinel auto-failover' },
      { label: 'Data Structures Used', value: 'Hashes, Sorted Sets, HyperLogLogs, Redis Streams, Pub/Sub' },
      { label: 'Persistence Modes', value: 'RDB snapshots every 15 mins + AOF (Append-Only File) every second' },
      { label: 'Clustering Topology', value: '3 Master nodes + 3 Replica nodes with automatic failover' }
    ]
  },

  'tech-prisma-multitenancy': {
    id: 'tech-prisma-multitenancy',
    name: 'Prisma ORM & Multi-Tenancy',
    category: 'CORE STACK & CLOUD PLATFORM',
    categorySlug: 'core-stack-cloud-platform',
    navigationOrigin: 'technology',
    badge: 'Data Layer',
    tagline: 'End-to-end type-safe ORM data layer with declarative schema migrations and strict multi-tenant isolation',
    description: 'Type-safe data access layer ensuring complete database query correctness at compile time. Implements strict logical multi-tenant partitioning, preventing accidental data leakage across different companies, branches, or agricultural cooperatives.',
    metrics: [
      { label: 'Query Type Safety', sub: 'Zero Runtime Schema Mismatch', val: '100% Strict' },
      { label: 'Tenant Isolation', sub: 'Logical Row-Level Security', val: 'Guaranteed' },
      { label: 'Migration Reliability', sub: 'Declarative Versioned Schemas', val: 'Zero Downtime' },
      { label: 'Developer Velocity', sub: 'Auto-Generated Client Types', val: '+ 40%' }
    ],
    pillars: [
      { title: 'Compile-Time Type Safety', desc: 'Every database query is strictly validated against TypeScript types at compile time, eliminating runtime SQL bugs.', badge: 'Type Safe' },
      { title: 'Tenant Scoped Middleware', desc: 'Prisma query extensions automatically inject `tenantId` into every SELECT, UPDATE, and DELETE query.', badge: 'Tenant Guard' },
      { title: 'Declarative Schema Migrations', desc: 'Version-controlled database schema migrations managed with `prisma migrate`, ensuring seamless zero-downtime updates.', badge: 'Migrations' },
      { title: 'Optimized Relationship Loading', desc: 'Prevents N+1 query performance traps through intelligent eager loading and query batching algorithms.', badge: 'Query Optimizer' }
    ],
    workflow: [
      { step: '1', title: 'Declarative Schema Modeling', desc: 'Define entities, relationships, indexes, and enum constraints in `schema.prisma` file.' },
      { step: '2', title: 'Client Generation', desc: 'Generate fully-typed Prisma Client tailored to the exact database schema.' },
      { step: '3', title: 'Tenant Context Injection', desc: 'Middleware binds authenticated user\'s `tenantId` to all query parameters.' },
      { step: '4', title: 'Transactional Database Execution', desc: 'Execute queries inside managed transactions with automatic rollback on error.' }
    ],
    technicalSpecs: [
      { label: 'ORM Engine', value: 'Prisma 5.x with Query Engine written in Rust' },
      { label: 'Type System', value: 'Full integration with TypeScript 5 strict compiler' },
      { label: 'Multi-Tenancy Model', value: 'Shared database with row-level tenant isolation middleware' },
      { label: 'Migration Tooling', value: 'Prisma Migrate with automated shadow database verification' }
    ]
  },

  // =========================================================================
  // TECHNOLOGY — CATEGORY 2: EDGE TELEMETRY & PROTOCOLS
  // =========================================================================
  'tech-mqtt-broker': {
    id: 'tech-mqtt-broker',
    name: 'MQTT Telemetry Broker (QoS 2)',
    category: 'EDGE TELEMETRY & PROTOCOLS',
    categorySlug: 'edge-telemetry-protocols',
    navigationOrigin: 'technology',
    badge: 'IoT Protocol',
    tagline: 'Guaranteed edge sensor publish/subscribe broker with QoS 2 exactly-once delivery and TLS 1.3 encryption',
    description: 'Industrial-grade message broker engineered for low-bandwidth cellular IoT connections. Utilizes MQTT protocol with Quality of Service Level 2 (QoS 2) to guarantee exactly-once message delivery for critical fire system and booster telemetry.',
    metrics: [
      { label: 'Delivery Guarantee', sub: 'Exactly-Once Handshake', val: 'QoS Level 2' },
      { label: 'Packet Overhead', sub: 'Ultra-Compact Header', val: '2 Bytes' },
      { label: 'Encryption Standard', sub: 'Mutual TLS Authentication', val: 'TLS 1.3' },
      { label: 'Concurrent Devices', sub: 'Clustered Broker Capacity', val: '100,000+' }
    ],
    pillars: [
      { title: 'QoS 2 Exactly-Once Semantics', desc: 'Four-step handshake protocol ensuring critical alarm triggers are delivered exactly once without duplicates or loss.', badge: 'QoS 2 Handshake' },
      { title: 'Ultra-Low Packet Overhead', desc: 'Compact 2-byte header optimized for low-bandwidth 2G/4G cellular SIM cards in remote agricultural and rural areas.', badge: 'Low Bandwidth' },
      { title: 'Last Will and Testament (LWT)', desc: 'Automatically broadcasts emergency disconnect alerts if an edge gateway unexpectedly loses power or cell signal.', badge: 'LWT Watchdog' },
      { title: 'Mutual TLS (mTLS) Security', desc: 'X.509 cryptographic certificate authentication ensuring only verified company hardware can connect to the broker.', badge: 'mTLS Security' }
    ],
    workflow: [
      { step: '1', title: 'TLS Handshake & Certificate Verification', desc: 'Edge device establishes encrypted TLS 1.3 connection and presents client certificate.' },
      { step: '2', title: 'QoS 2 Publish Handshake', desc: 'Device sends PUBLISH packet; broker responds with PUBREC, PUBREL, and PUBCOMP.' },
      { step: '3', title: 'Topic Routing & Distribution', desc: 'Broker routes payload to subscribed TimescaleDB ingestion workers and WebSocket bridges.' },
      { step: '4', title: 'Keep-Alive & LWT Monitoring', desc: 'Broker monitors ping heartbeats; triggers Last Will alert if device goes silent.' }
    ],
    technicalSpecs: [
      { label: 'Broker Engine', value: 'EMQX Enterprise / Mosquitto MQTT v5.0 Broker' },
      { label: 'QoS Levels Handled', value: 'QoS 0 (At most once), QoS 1 (At least once), QoS 2 (Exactly once)' },
      { label: 'Security & Auth', value: 'X.509 Client Certificates, TLS 1.3, Token-based JWT client credentials' },
      { label: 'Clustering Mechanism', value: 'Erlang Mnesia cluster with automatic node discovery' }
    ]
  },

  'tech-modbus-fieldbus': {
    id: 'tech-modbus-fieldbus',
    name: 'Modbus RTU / TCP Field Bus',
    category: 'EDGE TELEMETRY & PROTOCOLS',
    categorySlug: 'edge-telemetry-protocols',
    navigationOrigin: 'technology',
    badge: 'Industrial Fieldbus',
    tagline: 'Standard RS-485 serial and Ethernet industrial protocol connecting PLCs, digital meters & VFD inverters',
    description: 'The standard industrial language connecting G-Nova edge gateways directly to shop-floor hardware. Reads and writes holding registers across Schneider, Siemens, ABB, and Delta PLCs, digital energy meters, and variable frequency drives (VFDs).',
    metrics: [
      { label: 'Baud Rates Supported', sub: 'RS-485 Serial Standards', val: 'Up to 115,200' },
      { label: 'Register Polling Speed', sub: 'Multi-Register Block Reads', val: '< 25ms' },
      { label: 'Checksum Verification', sub: 'CRC-16 Polynomial Check', val: '100% Guard' },
      { label: 'PLC Compatibility', sub: 'Siemens, Schneider, ABB, Delta', val: 'Universal' }
    ],
    pillars: [
      { title: 'RS-485 Two-Wire Differential Bus', desc: 'High-noise-immunity physical layer communicating reliably over cable runs of up to 1,200 meters in noisy factory environments.', badge: 'RS-485 Noise Shield' },
      { title: 'CRC-16 Error Checking', desc: 'Cyclic Redundancy Check verifying packet data integrity and rejecting packets corrupted by electromagnetic interference.', badge: 'CRC-16 Check' },
      { title: 'Block Register Polling', desc: 'Reads contiguous holding registers in single transactions to maximize serial bus throughput and reduce query latency.', badge: 'Block Polling' },
      { title: 'Modbus TCP / RTU Gateway Bridge', desc: 'Seamlessly translates between modern Ethernet Modbus TCP and legacy serial RS-485 Modbus RTU devices.', badge: 'TCP/RTU Bridge' }
    ],
    workflow: [
      { step: '1', title: 'Hardware Bus Initialization', desc: 'Configure serial baud rate, data bits, parity, and stop bits matching target slave PLC.' },
      { step: '2', title: 'Query Frame Transmission', desc: 'Master gateway issues Function Code 03 (Read Holding Registers) to target device ID.' },
      { step: '3', title: 'Slave Response & CRC Check', desc: 'Slave returns register byte stream; gateway verifies CRC-16 mathematical checksum.' },
      { step: '4', title: 'Engineering Unit Scaling', desc: 'Convert raw 16-bit register integers into real-world floating-point values (Volts, Amps, Bar).' }
    ],
    technicalSpecs: [
      { label: 'Supported Protocols', value: 'Modbus RTU (Serial RS-485 / RS-232) & Modbus TCP (Ethernet / IP)' },
      { label: 'Function Codes Handled', value: 'FC01 (Read Coils), FC02 (Discrete Inputs), FC03 (Holding Regs), FC04 (Input Regs), FC06/16 (Write)' },
      { label: 'Physical Transceiver', value: 'Galvanically isolated RS-485 transceiver with 2.5kV surge protection' },
      { label: 'Bus Capacity', value: 'Up to 32 multidrop slave devices per RS-485 bus segment' }
    ]
  },

  'tech-websocket-engine': {
    id: 'tech-websocket-engine',
    name: 'Real-Time WebSocket Engine',
    category: 'EDGE TELEMETRY & PROTOCOLS',
    categorySlug: 'edge-telemetry-protocols',
    navigationOrigin: 'technology',
    badge: 'Socket Architecture',
    tagline: 'Bidirectional client-server communication engine powering live SCADA mimic animations & collaborative Kanban',
    description: 'High-throughput WebSocket engine. Maintains persistent full-duplex TCP socket connections between web/mobile clients and backend clusters, streaming sub-second telemetry updates, interactive card moves, and live alarms with minimal overhead.',
    metrics: [
      { label: 'Frame Latency', sub: 'Client-to-Client Roundtrip', val: '< 15ms' },
      { label: 'Socket Density', sub: 'Concurrent Connections / Node', val: '50,000+' },
      { label: 'Frame Compression', sub: 'Per-Message Deflate', val: '70% Saved' },
      { label: 'Reconnection Grace', sub: 'Buffered Message Queue', val: '60 Seconds' }
    ],
    pillars: [
      { title: 'Full-Duplex Communication', desc: 'Allows bidirectional data transfer simultaneously without the HTTP request-response round-trip penalty.', badge: 'Full Duplex' },
      { title: 'Per-Message Deflate Compression', desc: 'Compresses payload frames transparently, reducing data consumption on low-bandwidth mobile devices.', badge: 'Frame Deflate' },
      { title: 'Connection Heartbeat Watchdog', desc: 'Exchanges periodic ping/pong frames every 25 seconds to detect half-open sockets and trigger auto-reconnect.', badge: 'Ping/Pong' },
      { title: 'Client Session Multiplexing', desc: 'Multiple application tabs on a single device share a single multiplexed socket connection to conserve memory.', badge: 'Multiplexing' }
    ],
    workflow: [
      { step: '1', title: 'HTTP Upgrade Handshake', desc: 'Browser initiates HTTP GET with `Upgrade: websocket` header; server upgrades connection.' },
      { step: '2', title: 'Binary / JSON Frame Framing', desc: 'Wrap outgoing telemetry and UI state updates in compact WebSocket protocol frames.' },
      { step: '3', title: 'Pub/Sub Channel Distribution', desc: 'Distribute frames across subscribed client sessions according to topic channels.' },
      { step: '4', title: 'Client DOM Render', desc: 'Client application updates live charts and SCADA diagrams without page reloading.' }
    ],
    technicalSpecs: [
      { label: 'Specification', value: 'IETF RFC 6455 & W3C WebSocket API standard' },
      { label: 'Server Adapter', value: 'ws / uWebSockets.js for high-speed C++ socket performance' },
      { label: 'Encoding Formats', value: 'JSON, UTF-8 text strings, binary ArrayBuffers' },
      { label: 'Security Layer', value: 'WSS (WebSocket Secure) with TLS 1.3 encryption and origin header validation' }
    ]
  },

  'tech-aipcu-hardware': {
    id: 'tech-aipcu-hardware',
    name: 'AIPCU Hardware Edge Gateways',
    category: 'EDGE TELEMETRY & PROTOCOLS',
    categorySlug: 'edge-telemetry-protocols',
    navigationOrigin: 'solutions',
    badge: 'Industrial Edge Hardware',
    tagline: 'Custom ARM Cortex-M4 microcontroller edge hardware with galvanic isolation, 4G LTE & dry-contact relays',
    description: 'Proprietary industrial IoT hardware designed and manufactured by G Mark. Built with ruggedized components to withstand factory heat, dust, and electrical surges while executing real-time sensor processing and automated relay trips.',
    metrics: [
      { label: 'Processor Core', sub: 'ARM Cortex-M4 with FPU', val: '168 MHz' },
      { label: 'Galvanic Isolation', sub: 'Surge & Ground Loop Protection', val: '2.5 kV' },
      { label: 'Operating Temp', sub: 'Industrial Harsh Environment', val: '-20° to +70°C' },
      { label: 'Cellular Connectivity', sub: '4G LTE Cat-1 with 2G Fallback', val: 'Global Band' }
    ],
    pillars: [
      { title: 'Galvanic Industrial Isolation', desc: 'Optocoupled inputs and isolated DC-DC converters protect sensitive microcontrollers from high-voltage factory ground loops.', badge: '2.5kV Isolation' },
      { title: 'Hardware Watchdog Supervisor', desc: 'Dedicated external supervisory IC forces hardware reset if firmware fails to stroke watchdog within 1.6 seconds.', badge: 'Hardware Watchdog' },
      { title: 'On-Board High-Current Relays', desc: 'Industrial SPDT relays rated at 250VAC / 10A capable of directly driving pump contactors and emergency shutoff valves.', badge: 'Power Relays' },
      { title: 'Internal LiFePO4 Backup Battery', desc: 'Integrated lithium iron phosphate battery keeps gateway online for 48 hours during total factory power cuts.', badge: 'Backup Battery' }
    ],
    workflow: [
      { step: '1', title: 'DIN-Rail Panel Mounting', desc: 'Mount AIPCU gateway on standard 35mm DIN rail inside industrial control panel.' },
      { step: '2', title: 'Sensor & Contactor Wiring', desc: 'Wire 4-20mA transmitters, RS-485 cables, and pump starter trip relays.' },
      { step: '3', title: 'Cellular Network Registration', desc: 'Gateway boots, acquires 4G LTE signal, and registers with G Mark cloud server.' },
      { step: '4', title: 'Autonomous Operational Run', desc: 'Execute continuous sensor acquisition, local safety protection, and telemetry streaming.' }
    ],
    technicalSpecs: [
      { label: 'Microcontroller', value: 'STM32F407 High-Performance ARM Cortex-M4 with Hardware Floating Point Unit' },
      { label: 'Input Channels', value: '4x 4-20mA Analog Inputs, 6x Optoisolated Digital Inputs, 1x RS-485 Port' },
      { label: 'Output Channels', value: '4x 250VAC/10A Form-C Mechanical Relays, 2x Open-Collector Transistor Outputs' },
      { label: 'Enclosure Rating', value: 'Flame-retardant ABS DIN-rail enclosure with IP54 ingress protection' }
    ]
  },

  'tech-gps-telemetry': {
    id: 'tech-gps-telemetry',
    name: 'GPS Telemetry & Geo-Fencing',
    category: 'EDGE TELEMETRY & PROTOCOLS',
    categorySlug: 'edge-telemetry-protocols',
    navigationOrigin: 'technology',
    badge: 'Geospatial Engineering',
    tagline: 'High-precision GNSS positioning, spatial indexing, ray-casting point-in-polygon & travel telemetry',
    description: 'The geospatial computing engine powering G-Track and middle-mile fleet logistics. Executes sub-meter multi-GNSS tracking, spatial indexing via R-Trees and Uber H3 hexagonal bins, and microsecond ray-casting point-in-polygon geofencing calculations.',
    metrics: [
      { label: 'Point-in-Polygon Speed', sub: 'Ray-Casting Algorithm Latency', val: '< 2μs' },
      { label: 'Spatial Indexing', sub: 'Uber H3 Hexagonal Grid & PostGIS', val: 'Resolution 9' },
      { label: 'Geofence Breach Notice', sub: 'Boundary Entry/Exit Detection', val: '< 500ms' },
      { label: 'Satellite Support', sub: 'Multi-Constellation GNSS', val: 'NavIC / GPS' }
    ],
    pillars: [
      { title: 'Ray-Casting Point-in-Polygon Engine', desc: 'High-speed mathematical algorithm determining whether a vehicle coordinate is inside or outside complex polygonal geofences.', badge: 'Ray-Casting' },
      { title: 'Uber H3 Hexagonal Spatial Index', desc: 'Discretizes geographic space into hierarchical hexagonal cells for ultra-fast spatial search and density heatmaps.', badge: 'H3 Spatial' },
      { title: 'Speed & Directional Vectoring', desc: 'Calculates instantaneous speed, heading azimuth, and acceleration vectors to identify harsh braking or speeding.', badge: 'Vector Analytics' },
      { title: 'PostGIS Spatial Query Engine', desc: 'Executes geographic distance, containment, and intersection queries using PostgreSQL PostGIS extension.', badge: 'PostGIS Engine' }
    ],
    workflow: [
      { step: '1', title: 'GNSS Satellite Fix', desc: 'Hardware receiver locks to minimum 8 satellites to compute 3D position and dilution of precision (DOP).' },
      { step: '2', title: 'Spatial Index Lookup', desc: 'Map coordinate to H3 hexagonal index to find nearby geofence boundary fences.' },
      { step: '3', title: 'Ray-Casting Boundary Evaluation', desc: 'Execute intersection algorithm; detect boundary transition (Entered, Exited, Stayed).' },
      { step: '4', title: 'Event Dispatch & Trail Plotting', desc: 'Emit geofence breach event and append point to vehicle movement history.' }
    ],
    technicalSpecs: [
      { label: 'Spatial Engine', value: 'PostgreSQL 16 with PostGIS 3.4 Spatial Database Extension' },
      { label: 'Geofencing Algorithm', value: 'Optimized Jordan Curve theorem ray-casting in C++ / WebAssembly' },
      { label: 'Coordinate System', value: 'WGS 84 (EPSG:4326) with projected metric conversion to EPSG:3857' },
      { label: 'Spatial Indexing', value: 'Uber H3 Discrete Global Grid System & R-Tree GiST indexes' }
    ]
  },

  // =========================================================================
  // TECHNOLOGY — CATEGORY 3: ENTERPRISE LOGIC & GOVERNANCE
  // =========================================================================
  'tech-raci-governance': {
    id: 'tech-raci-governance',
    name: 'RACI Governance & Sprint Engine',
    category: 'ENTERPRISE LOGIC & GOVERNANCE',
    categorySlug: 'enterprise-logic-governance',
    navigationOrigin: 'technology',
    badge: 'Governance Architecture',
    tagline: 'Formal institutional role assignment rules, approval state machines & automated sprint governance',
    description: 'The algorithmic governance layer of SynkroBoard. Enforces mathematical ownership invariants, strict finite state machine (FSM) task transitions, dual-authorization approval sign-offs, and team sprint velocity computations.',
    metrics: [
      { label: 'State Machine Rigor', sub: 'Deterministic Workflow Engine', val: '100% Strict' },
      { label: 'Approval Verification', sub: 'Cryptographic Audit Footprint', val: 'Tamper-Proof' },
      { label: 'Ownership Integrity', sub: 'Strictly One Accountable Owner', val: 'Enforced' },
      { label: 'Sprint Governance', sub: 'Automated Burndown & Velocity', val: 'Algorithmic' }
    ],
    pillars: [
      { title: 'Deterministic Finite State Machine (FSM)', desc: 'Governs task card lifecycles through strictly validated transitions, preventing illegal state jumps.', badge: 'FSM Engine' },
      { title: 'Dual-Key Approval Gates', desc: 'Requires cryptographic sign-off from both Engineering Lead and QA Specialist before marking critical tasks done.', badge: 'Dual Approval' },
      { title: 'Automated Velocity Tracking', desc: 'Calculates rolling 3-sprint average team velocity to prevent over-committing during sprint planning.', badge: 'Velocity Formula' },
      { title: 'Role Invariant Enforcement', desc: 'Rejects task commits where the Accountable role is vacant or shared, maintaining absolute clarity.', badge: 'Role Invariant' }
    ],
    workflow: [
      { step: '1', title: 'Task Definition & RACI Binding', desc: 'Task created; system enforces 1 Accountable and validates assigned Responsible members.' },
      { step: '2', title: 'FSM State Transition', desc: 'Move card; FSM validates transition rules (e.g. Cannot move to QA without passing unit tests).' },
      { step: '3', title: 'Consultation Checkpoint', desc: 'System requires sign-off from designated Consulted expert before unblocking deployment.' },
      { step: '4', title: 'Milestone Closure & Velocity Committal', desc: 'Close sprint milestone and log earned story points into historical velocity table.' }
    ],
    technicalSpecs: [
      { label: 'State Machine Engine', value: 'XState deterministic finite state machine and statecharts' },
      { label: 'Governance Rule Engine', value: 'Custom TypeScript rule evaluator with declarative YAML policies' },
      { label: 'Audit Logging', value: 'Immutable event log recording user ID, old state, new state, and reason' },
      { label: 'Velocity Algorithms', value: 'Story Point Burndown, Cycle Time, Lead Time, Work-in-Progress (WIP) formulas' }
    ]
  },

  'tech-4m-asset-framework': {
    id: 'tech-4m-asset-framework',
    name: '4M Asset Governance Framework',
    category: 'ENTERPRISE LOGIC & GOVERNANCE',
    categorySlug: 'enterprise-logic-governance',
    navigationOrigin: 'technology',
    badge: 'Industrial Framework',
    tagline: 'Man, Machine, Material & Method relational governance engine for Total Productive Maintenance (TPM)',
    description: 'The industrial operational logic driving G Mark CMMS. Digitizes the renowned Japanese 4M manufacturing model, linking technician skill competencies (Man), telemetry degradation (Machine), inventory buffer stocks (Material), and standard operating procedures (Method).',
    metrics: [
      { label: 'Framework Pillars', sub: 'Man, Machine, Material, Method', val: '4 Pillars' },
      { label: 'TPM Alignment', sub: 'Total Productive Maintenance', val: 'ISO 55000' },
      { label: 'OEE Optimization', sub: 'Plant-Wide Productivity Lift', val: '+ 18%' },
      { label: 'Data Relationship', sub: 'Interconnected 4M Graph', val: 'Unified' }
    ],
    pillars: [
      { title: 'Man: Skill Matrix & Labor Allocation', desc: 'Tracks technician certifications, training hours, and work order execution speeds to assign appropriate personnel.', badge: 'Man Pillar' },
      { title: 'Machine: Asset Trees & Telemetry', desc: 'Multi-tiered equipment parent-child hierarchy linked directly with live vibration and temperature telemetry.', badge: 'Machine Pillar' },
      { title: 'Material: MRO Spares & Inventory', desc: 'Tracks critical spare parts, warehouse bins, reorder thresholds, and direct consumption cost center ledgers.', badge: 'Material Pillar' },
      { title: 'Method: Digital SOPs & Safety Rules', desc: 'Step-by-step procedures, photo proof requirements, tolerance gates, and LOTO safety verification.', badge: 'Method Pillar' }
    ],
    workflow: [
      { step: '1', title: 'Asset & Skill Cataloging', desc: 'Configure 4M entities: machine hierarchies, technician skills, spare parts, and standard SOPs.' },
      { step: '2', title: 'Maintenance Event Trigger', desc: 'Breakdown or PM alert fires; system checks asset location and required spare parts.' },
      { step: '3', title: 'Automated 4M Synthesis', desc: 'Dispatch work order binding qualified technician (Man), machine telemetry (Machine), spares (Material), and SOP (Method).' },
      { step: '4', title: 'Post-Maintenance Review', desc: 'Record completed work, verify machine operational recovery, and update reliability database.' }
    ],
    technicalSpecs: [
      { label: 'Standard Framework', value: 'Japanese Total Productive Maintenance (TPM) 4M Manufacturing Model' },
      { label: 'Data Model', value: 'Relational Graph schema interconnecting Staff, Assets, Spares, and Procedures' },
      { label: 'Reliability Metrics', value: 'Overall Equipment Effectiveness (OEE), Availability, Performance, Quality' },
      { label: 'Compliance Standards', value: 'ISO 55001 Asset Management & OHSAS 18001 / ISO 45001 Safety Standards' }
    ]
  },

  'tech-qrcode-otp-dispatch': {
    id: 'tech-qrcode-otp-dispatch',
    name: 'QR Code Scanning & OTP Dispatch',
    category: 'ENTERPRISE LOGIC & GOVERNANCE',
    categorySlug: 'enterprise-logic-governance',
    navigationOrigin: 'technology',
    badge: 'Verification Logic',
    tagline: 'Cryptographic package custody verification, two-party handshake & tamper-proof delivery completion',
    description: 'The core security protocol governing G Mark logistics. Eliminates parcel loss and fraudulent delivery claims through dynamic barcode verification, two-party cryptographic handshakes, and timed one-time password (OTP) buyer verification.',
    metrics: [
      { label: 'Custody Fraud', sub: 'Cryptographic Handshake Guard', val: '0.0%' },
      { label: 'OTP Generation', sub: 'Cryptographically Secure Pseudo-Random', val: '4-Digit TOTP' },
      { label: 'Validation Latency', sub: 'Cloud Verification Speed', val: '< 100ms' },
      { label: 'Audit Trail', sub: 'GPS Timestamped Signatures', val: 'Immutable' }
    ],
    pillars: [
      { title: 'Dynamic QR Package Encryption', desc: 'Package labels encode encrypted tracking IDs, destination pincodes, and checksum tokens preventing label counterfeiting.', badge: 'Dynamic QR' },
      { title: 'Mutual Custody Handshake', desc: 'Requires both transferring courier and receiving node manager to scan mutual barcodes to confirm package transfer.', badge: 'Two-Party Scan' },
      { title: 'Time-Based One-Time Password (TOTP)', desc: 'Generates secure 4-digit verification code delivered directly to recipient smartphone via SMS/WhatsApp.', badge: 'TOTP Code' },
      { title: 'Tamper-Evident Digital Delivery Slip', desc: 'Generates signed electronic proof of delivery (ePOD) with GPS coordinates, recipient name, and timestamp.', badge: 'Signed ePOD' }
    ],
    workflow: [
      { step: '1', title: 'Encrypted Label Generation', desc: 'Generate high-density QR code embedding shipment token and print onto parcel label.' },
      { step: '2', title: 'Hub Custody Handshake', desc: 'Transport driver and hub manager perform mutual scan to record legal change of custody.' },
      { step: '3', title: 'Doorstep OTP Trigger', desc: 'System dispatches 4-digit code to buyer phone when courier arrives within 100m of doorstep.' },
      { step: '4', title: 'Cryptographic Verification', desc: 'Courier enters OTP into app; central server verifies code and marks consignment delivered.' }
    ],
    technicalSpecs: [
      { label: 'QR Symbology', value: 'ISO/IEC 18004 QR Code Model 2 with Error Correction Level H (30% recovery)' },
      { label: 'OTP Algorithm', value: 'RFC 6238 TOTP (Time-Based One-Time Password) with 15-minute validity window' },
      { label: 'Transmission Security', value: 'HTTPS TLS 1.3 encrypted API payloads with SHA-256 HMAC request signing' },
      { label: 'Verification Guard', value: 'Rate-limited to 3 failed attempts before temporary account lockout' }
    ]
  },

  'tech-double-entry-gst': {
    id: 'tech-double-entry-gst',
    name: 'Double-Entry GST & Invoicing Engine',
    category: 'ENTERPRISE LOGIC & GOVERNANCE',
    categorySlug: 'enterprise-logic-governance',
    navigationOrigin: 'technology',
    badge: 'Statutory Engine',
    tagline: 'High-precision dual-entry general ledger rules, automated tax split algorithms & invoice locking',
    description: 'The algorithmic statutory accounting core. Executes mathematical double-entry balance validation, dynamically splits tax into CGST, SGST, and IGST based on place-of-supply rules, and locks generated invoices against retrospective modification.',
    metrics: [
      { label: 'Debit/Credit Balance', sub: 'Mathematical Invariant', val: 'Σ Dr === Σ Cr' },
      { label: 'Tax Calculation', sub: 'CGST, SGST, IGST Rules', val: '100% Compliant' },
      { label: 'Invoice Locking', sub: 'Tamper-Proof Audit Lock', val: 'Immutable' },
      { label: 'Numeric Precision', sub: 'Four-Decimal High Accuracy', val: 'Zero Rounding Err' }
    ],
    pillars: [
      { title: 'Mathematical Balance Invariant', desc: 'Database constraint strictly rejects any transaction where total debits do not equal total credits to the exact penny.', badge: 'Balance Gate' },
      { title: 'State-Aware Tax Computation', desc: 'Analyzes supplier GSTIN state code vs customer shipping state code to apply intra-state or inter-state tax logic.', badge: 'Tax Splitter' },
      { title: 'Statutory Invoice Locking', desc: 'Locks invoice rows and generates sequential statutory voucher numbers that cannot be deleted or re-ordered.', badge: 'Audit Lock' },
      { title: 'Granular General Ledger Posting', desc: 'Simultaneously writes balancing entries to Customer Ledger, Sales Revenue, Output CGST, and Output SGST accounts.', badge: 'Ledger Post' }
    ],
    workflow: [
      { step: '1', title: 'Commercial Line Calculation', desc: 'Calculate line item subtotals, apply approved trade discounts, and determine taxable base.' },
      { step: '2', title: 'Statutory Tax Decomposition', desc: 'Lookup HSN tax rate; split into 50% CGST + 50% SGST (intra-state) or 100% IGST (inter-state).' },
      { step: '3', title: 'Double-Entry Balancing Validation', desc: 'Verify Debit (Debtors) = Credit (Sales + Taxes) equality to 4 decimal places.' },
      { step: '4', title: 'Immutable Committal & QR Generation', desc: 'Commit ledger vouchers and generate government-compliant e-invoice QR code.' }
    ],
    technicalSpecs: [
      { label: 'Mathematical Logic', value: 'High-precision arbitrary-precision arithmetic (decimal.js) avoiding binary float errors' },
      { label: 'Tax Rules', value: 'Indian Central Goods and Services Tax (CGST) Act 2017 & IGST Act' },
      { label: 'Concurrency Isolation', value: 'PostgreSQL SERIALIZABLE / REPEATABLE READ transaction isolation' },
      { label: 'Audit Trail', value: 'System-generated irreversible audit trail tracking user, timestamp, and voucher ID' }
    ]
  },

  'tech-restful-webhooks': {
    id: 'tech-restful-webhooks',
    name: 'RESTful APIs & Webhook Webbus',
    category: 'ENTERPRISE LOGIC & GOVERNANCE',
    categorySlug: 'enterprise-logic-governance',
    navigationOrigin: 'technology',
    badge: 'Integration Architecture',
    tagline: 'Standardized REST API resource endpoints, event-driven webhooks & enterprise integration middleware',
    description: 'The enterprise integration bus. Enables bi-directional data exchange between G Mark and third-party corporate systems (SAP, Oracle, Tally, Salesforce) via secure RESTful APIs and reliable event-driven webhook callbacks with automated exponential retry schedules.',
    metrics: [
      { label: 'API Uptime SLA', sub: 'Enterprise Gateway Availability', val: '99.95%' },
      { label: 'Webhook Delivery', sub: 'Retry-Protected Dispatch', val: '99.99%' },
      { label: 'Response Latency', sub: 'Optimized Endpoint Speed', val: '< 40ms' },
      { label: 'Payload Security', sub: 'HMAC-SHA256 Signatures', val: 'Cryptographic' }
    ],
    pillars: [
      { title: 'Standardized RESTful Endpoints', desc: 'Predictable resource-oriented URLs, standard HTTP response codes, and JSON-encoded response payloads.', badge: 'REST Standards' },
      { title: 'Asynchronous Webhook Callbacks', desc: 'Notifies external ERP and CRM systems immediately when invoices are generated, payments clear, or alarms fire.', badge: 'Async Webhooks' },
      { title: 'HMAC-SHA256 Request Verification', desc: 'Calculates cryptographic signature for each webhook payload allowing recipients to verify authenticity and integrity.', badge: 'HMAC Signing' },
      { title: 'Exponential Backoff Retry Schedule', desc: 'Automatically retries failed webhook deliveries up to 5 times over 24 hours if destination server is temporarily down.', badge: 'Auto Retry' }
    ],
    workflow: [
      { step: '1', title: 'Webhook Endpoint Registration', desc: 'External customer registers secure HTTPS callback URL and receives secret signing key.' },
      { step: '2', title: 'System Event Trigger', desc: 'Business event occurs (e.g. Sales invoice generated or vibration trip triggered).' },
      { step: '3', title: 'HMAC Signature Computation', desc: 'Sign JSON payload using secret key and append `X-GMark-Signature` header.' },
      { step: '4', title: 'Guaranteed Delivery Dispatch', desc: 'Post payload to external endpoint; queue retry in BullMQ queue if response is non-200.' }
    ],
    technicalSpecs: [
      { label: 'HTTP Framework', value: 'NestJS with Fastify high-performance HTTP adapter' },
      { label: 'Queue Engine', value: 'BullMQ with Redis-backed distributed task queue and retry scheduler' },
      { label: 'Signature Algorithm', value: 'HMAC with SHA-256 hash function' },
      { label: 'Rate Limiting', value: 'Redis token-bucket rate limiter with customizable enterprise tier limits' }
    ]
  }
};

// Helper to find any module or app across Solutions and Technology
export function getModuleById(id) {
  if (!id) return null;
  const cleanId = String(id).toLowerCase().trim();
  
  // Direct match in registry
  if (MODULES_REGISTRY[cleanId]) {
    return MODULES_REGISTRY[cleanId];
  }

  // Check aliases / normalized key
  const match = Object.values(MODULES_REGISTRY).find(m => {
    return m.id === cleanId || 
           m.id.replace(/-/g, '') === cleanId.replace(/-/g, '') ||
           m.name.toLowerCase() === cleanId ||
           m.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId.replace(/[^a-z0-9]/g, '');
  });

  return match || null;
}

// Get all modules belonging to a specific category slug
export function getModulesByCategory(categorySlug) {
  if (!categorySlug) return [];
  const cleanSlug = String(categorySlug).toLowerCase().trim();
  return Object.values(MODULES_REGISTRY).filter(m => m.categorySlug === cleanSlug);
}

// Get all modules for Solutions
export function getAllSolutionsModules() {
  return Object.values(MODULES_REGISTRY).filter(m => m.navigationOrigin === 'solutions');
}

// Get all modules for Technology
export function getAllTechnologyModules() {
  return Object.values(MODULES_REGISTRY).filter(m => m.navigationOrigin === 'technology');
}
