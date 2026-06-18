---
name: Digital Kinetic
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#38393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#e1bebc'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#a98987'
  outline-variant: '#5a413f'
  surface-tint: '#ffb3af'
  primary: '#ffb3af'
  on-primary: '#68000d'
  primary-container: '#f95a5a'
  on-primary-container: '#5c000a'
  inverse-primary: '#b3272d'
  secondary: '#b1c9e5'
  on-secondary: '#1a3248'
  secondary-container: '#344b62'
  on-secondary-container: '#a3bbd6'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#929090'
  on-tertiary-container: '#2a2a29'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3af'
  on-primary-fixed: '#410005'
  on-primary-fixed-variant: '#910819'
  secondary-fixed: '#cfe5ff'
  secondary-fixed-dim: '#b1c9e5'
  on-secondary-fixed: '#021d32'
  on-secondary-fixed-variant: '#324960'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  stats-lg:
    fontFamily: Hanken Grotesk
    fontSize: 56px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-x: 32px
  section-padding: 120px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system embodies a **High-Tech Corporate** aesthetic, balancing industrial reliability with digital innovation. It is designed to evoke a sense of precision, velocity, and "future-proof" intelligence.

The visual language leverages **Minimalism** with a **Dark Theme** foundation, punctuated by vibrant data-driven accents. A key characteristic is the use of abstract generative patterns—representing data flow and connectivity—layered behind clean, structured content modules. The emotional response is one of institutional trust paired with cutting-edge technical capability.

## Colors
The palette is dominated by a deep, monochromatic background strategy to allow "Digital Kinetic Red" to serve as a high-impact call-to-action and data indicator.

- **Primary (Red/Orange):** Used exclusively for high-priority actions, critical data highlights, and branding accents.
- **Secondary (Deep Blue/Slate):** Used for subtle backgrounds, card strokes, and secondary depth layers.
- **Tertiary (True Black/Onyx):** The core canvas color, ensuring maximum contrast for white typography and vibrant data patterns.
- **Neutrals:** A range of cool grays (from #FFFFFF to #999999) ensure legibility and professional hierarchy.

## Typography
The system uses **Hanken Grotesk** as the primary typeface to deliver a clean, sharp, and contemporary feel that scales from massive display headers to technical body copy.

For specialized technical context—such as data labels, small metadata, or "machine-read" indicators—**JetBrains Mono** is introduced to reinforce the developer-friendly, high-tech narrative. Headlines should utilize tight letter-spacing to appear more engineered and impactful.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a maximum container width of 1280px. A 12-column system is used for desktop, collapsing to 4 columns for mobile.

- **Vertical Rhythm:** Generous section padding (120px+) is used to create a premium, editorial feel and allow the background data patterns "room to breathe."
- **Content Modules:** Information is grouped into distinct vertical stacks with clear hierarchical separation.
- **Mobile Reflow:** For mobile, all multi-column feature grids stack vertically, and display typography scales down to maintain readability without excessive horizontal overflow.

## Elevation & Depth
Depth in this design system is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than traditional shadows.

- **Surface Tiers:** The base level is True Black (#000000). Secondary surfaces (cards, sidebars) use a subtle deep gray (#121212 or #1A1A1A).
- **Outlines:** Instead of drop shadows, containers are defined by 1px solid borders in #333333 or very low-opacity white (10%).
- **Interactive Depth:** On hover, cards may use a very subtle "Digital Kinetic Red" outer glow (0px blur, 2px spread) or a slight lightening of the background tone.
- **Data Overlays:** High-tech "HUD" elements use semi-transparent backgrounds with backdrop-blur (10px) to maintain legibility over moving patterns.

## Shapes
The shape language is disciplined and industrial. **Soft** roundedness (4px - 8px) is applied to buttons and cards to prevent the UI from feeling overly aggressive or sharp, while maintaining a professional structure.

- **Buttons:** 4px border-radius for a precise, "machined" look.
- **Cards/Modules:** 8px border-radius.
- **Icons:** Use thin-stroke, geometric icons with consistent corner radii to match the UI components.

## Components
- **Buttons:**
    - *Primary:* Solid "Digital Kinetic Red" with white text. High contrast, sharp corners.
    - *Secondary:* Ghost style with 1px white or light gray border. No fill.
- **Cards:** Feature cards utilize a subtle top-border accent or a corner-placed icon in the primary color. Content is left-aligned with ample internal padding (32px).
- **Data Chips:** Small, pill-shaped indicators with #1A1A1A backgrounds and "JetBrains Mono" typography for status or categories.
- **Inputs:** Dark-filled fields (#121212) with 1px borders. Active state triggers a primary color border highlight.
- **Feature Lists:** Vertical lists separated by subtle 1px horizontal dividers (#333333). Icons are used as bullet points to guide the eye.
- **Stats Block:** Large, high-impact numerical displays in Primary Red, paired with small-cap labels.