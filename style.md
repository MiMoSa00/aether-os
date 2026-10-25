name: Aether OS
colors:
  surface: '#faf9f8'
  surface-dim: '#dadad9'
  surface-bright: '#faf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f2'
  surface-container: '#eeeeed'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e1'
  on-surface: '#1a1c1c'
  on-surface-variant: '#45464c'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f0f0'
  outline: '#76777c'
  outline-variant: '#c6c6cc'
  surface-tint: '#595e6d'
  primary: '#030612'
  on-primary: '#ffffff'
  primary-container: '#1a1f2c'
  on-primary-container: '#828697'
  inverse-primary: '#c2c6d8'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#03080d'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a2026'
  on-tertiary-container: '#81888f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee2f4'
  primary-fixed-dim: '#c2c6d8'
  on-primary-fixed: '#161b28'
  on-primary-fixed-variant: '#424655'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#dde3eb'
  tertiary-fixed-dim: '#c1c7cf'
  on-tertiary-fixed: '#161c22'
  on-tertiary-fixed-variant: '#41474e'
  background: '#faf9f8'
  on-background: '#1a1c1c'
  surface-variant: '#e3e2e1'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

The design system is built on the narrative of "Modular Sovereignty"—empowering African creative agencies with a workspace that feels like a premium, physical studio. The brand personality is "Approachable Luxury": it is authoritative and established, yet lacks the coldness of traditional enterprise software. 

The visual style merges high-end editorial aesthetics with industrial modularity. It avoids the clichés of "tech-blue" and glowing gradients in favor of a "Paper & Ink" philosophy. The UI should evoke the feeling of high-quality stationery and structured architectural plans. Surfaces are tactile and grounded, emphasizing stability and professional excellence for high-stakes creative operations.

## Colors

The palette is centered on **Heritage Indigo**, providing a deep, intellectual foundation for the interface. This is contrasted by **Warm Off-White** surfaces which reduce eye strain and provide a "paper-like" canvas for creative work.

**Naira Gold** is reserved strictly for moments of high value: primary actions, success confirmations, and premium status indicators. **Subtle Slate** is used for structural borders, maintaining a clear hierarchy without introducing visual noise. Neutral grays are warmed slightly to maintain harmony with the off-white background.

## Typography

This design system utilizes a high-contrast typographic pairing to signal both heritage and precision. **Playfair Display** is used for headlines to establish a premium, editorial voice. It should be typeset with tight tracking in larger sizes to emphasize its elegant serifs.

**Inter** handles all functional UI elements and body copy. It is selected for its utilitarian clarity and neutral tone, ensuring that complex data remains legible. Small labels and metadata should utilize Inter in a semi-bold weight with increased letter-spacing and uppercase styling to provide a "catalog" or "ledger" feel.

## Layout & Spacing

The layout follows a strict **8px grid system** to maintain a sense of "Modular Sovereignty." All margins, paddings, and component heights must be multiples of 8. 

The layout utilizes a **Fixed Grid** on desktop (12 columns) centered within the viewport to maintain an organized, contained workspace. On mobile, the system transitions to a fluid single-column layout with 16px side margins. Space is treated as a luxury; avoid crowding elements. Use generous padding (24px+) within cards and containers to give creative content "room to breathe."

## Elevation & Depth

Depth in this design system is achieved through **Tonal Layering** and **Subtle Outlines** rather than heavy shadows. The primary surface is the Off-White background. Secondary containers (cards, modals) are elevated using a thin 1px border of Subtle Slate (#E2E8F0).

When depth is necessary (e.g., for dropdowns or floating modals), use a single, extra-diffused shadow: `0px 4px 20px rgba(26, 31, 44, 0.04)`. This creates a soft lift that feels natural and non-distracting. Interactive elements do not "glow"; they shift in background tone or border weight to indicate state changes.

## Shapes

The shape language is "Softly Structured." A standard radius of **10px** is applied to primary containers and buttons. This provides a approachable feel that is still formal enough for business operations. 

Interactive components like checkboxes and small tags use a smaller 4px radius to maintain a sense of precision. Avoid full pill shapes except for status indicators (chips) to differentiate them from functional buttons.

## Components

### Buttons
- **Primary:** Heritage Indigo background with White text. 10px radius. No shadow.
- **Secondary:** Transparent background with Heritage Indigo 1px border.
- **High-Value (CTA):** Naira Gold background with Heritage Indigo text. Reserved for "Submit," "Pay," or "Sign Contract."

### Cards & Containers
Cards should use the 10px radius and a Subtle Slate border. Internal padding is generous (minimum 24px). For "Modular" sections, use a dashed border style in Subtle Slate to indicate drop zones or empty states.

### Input Fields
Inputs use a white background with a 1px Subtle Slate border. On focus, the border thickens to 2px and changes to Heritage Indigo. Labels are always positioned above the field using the `label-md` typographic style.

### Chips & Status Indicators
Status chips use a "Muted Tonal" approach. For example, a "Success" chip uses a 10% opacity Naira Gold background with a darkened gold text. This maintains the luxury aesthetic without the harshness of high-saturation system colors.

### Lists & Data Tables
Tables should avoid vertical lines. Use thin horizontal Subtle Slate dividers. Rows should have a subtle hover state shift to a slightly warmer tint of the background to guide the eye.
