# Smile Simulator - Design Guidelines

## Design Approach
**Reference-Based**: Modern dental practice websites (clear.com, SmileDirectClub) combined with medical SaaS aesthetics. Professional, trustworthy, conversion-focused with emphasis on visual proof through before/after imagery.

**Brand Adherence**: Strict alignment with Doctor Diego Serrano's established brand identity - Wotfard typography, gold/cyan accent palette, minimal border radius, professional tone.

## Core Design Elements

### Typography
- **Primary Font**: Wotfard (all elements)
- **Heading Hierarchy**: 
  - H1: 50px, bold weight, tight letter-spacing for impact
  - H2: 32px, medium weight for section headers
  - Body: 17px, regular weight for descriptions
  - Small text: 14px for disclaimers and secondary info

### Layout System
**Spacing Primitives**: Tailwind units 4, 8, 16, 24 for consistency
- Component padding: p-8 to p-16
- Section spacing: py-16 to py-24
- Element gaps: gap-4 to gap-8
- Container: max-w-6xl, centered with px-8

### Component Library

**Header Section**
- Clean white background with logo (left) and navigation (right)
- Minimal height (h-20), sticky positioning
- Logo using provided SVG asset
- Simple navigation: "Inicio | Servicios | Contacto"

**Hero/Upload Section**
- Centered layout with prominent heading: "Simula Tu Sonrisa Perfecta"
- Subheading explaining the instant preview capability
- Large drag-and-drop upload zone (min-h-64) with dashed border (#CCCCCC)
- Upload icon (cloud upload) with "Arrastra tu foto aquí o haz clic para seleccionar"
- File type hint: "JPG, PNG (máx. 5MB)"
- Background: clean white, no hero image (focus on functionality)

**Before/After Comparison**
- Two-column grid (grid-cols-1 md:grid-cols-2) with gap-8
- Each image container:
  - Aspect ratio 3:4 or 1:1 for portraits
  - Rounded corners (rounded-lg)
  - Subtle shadow (shadow-lg)
  - Label overlay at bottom ("ANTES" / "DESPUÉS") with semi-transparent background
- Container background: light gray (#F8F8F8) to frame images

**CTA Section**
- Positioned below comparison
- Large primary button: "Pedir una Cita" 
  - Background: #43CAE6 (cyan accent)
  - Text: white, 18px, medium weight
  - Padding: px-12 py-4
  - Border-radius: 0px (per brand)
  - Full-width on mobile, auto-width centered on desktop
- Supporting text above button: "¿Te gusta el resultado? Agenda tu consulta gratuita hoy"
- Optional: Phone number and WhatsApp link below button

**Trust Elements**
- Small disclaimer section: "Esta es una simulación digital. Los resultados reales pueden variar."
- Brief description (2-3 sentences) about Dr. Diego Serrano's experience
- Trust badge or certification mention if applicable

### Images
**No hero image** - this is a functional tool, not a traditional landing page
**User-uploaded images** are the central visual element
**Logo**: SVG provided in assets (header)
**Icons**: Heroicons via CDN
- Upload icon (cloud-arrow-up)
- Check icons for features
- Phone/WhatsApp icons for contact

### Color Application
- **Primary Gold (#CBA476)**: Accent borders, underlines for emphasis
- **Cyan (#43CAE6)**: Primary CTA button, links, active states
- **Background Gray (#BFBFBF)**: Page background (subtle, light version)
- **White**: Content containers, cards
- **Black (#000000)**: Primary text
- **Light Gray (#CCCCCC)**: Borders, dividers

### Responsive Behavior
- **Mobile-first**: Single column layout, full-width elements
- **Tablet (md:)**: Two-column before/after
- **Desktop (lg:)**: Max-width container, maintained proportions
- Upload zone adapts: larger on desktop, compact on mobile

### Interaction States
- Upload zone: Dashed border becomes solid on drag-over, light cyan background
- Primary button: Brightness increase on hover (no blur needed for solid background)
- Images: Subtle scale on hover (scale-105)
- Loading state: Spinner overlay during AI processing with "Creando tu nueva sonrisa..."

## Key UX Principles
1. **Immediate clarity**: User knows exactly what to do (upload photo)
2. **Trust through simplicity**: Clean, medical-grade aesthetic
3. **Visual proof**: Before/after is the hero, not marketing copy
4. **Low friction**: Single action to see results
5. **Conversion focus**: Clear, prominent CTA after delivering value