# Smile Simulator - Design Guidelines

## Design Approach
**Reference-Based**: Modern dental practice website (doctordiegoserrano.com) with clean, professional aesthetics. Emphasis on trust, conversion, and visual proof through before/after imagery.

**Brand Adherence**: Strict alignment with Doctor Diego Serrano's updated brand identity - DM Sans typography (clean modern alternative), gold (#CBA476) and cyan (#43CAE6) accent palette, rounded buttons (pill shape for CTAs), professional tone.

## Core Design Elements

### Typography
- **Primary Font**: DM Sans (all elements) - clean, modern humanist sans-serif
- **Heading Font**: DM Serif Display (optional for display headings)
- **Heading Hierarchy**: 
  - H1: 42px, semibold weight, tight letter-spacing
  - H2: 28px, medium weight for section headers
  - Body: 18px, regular weight for descriptions
  - Small text: 14px for disclaimers and secondary info

### Color Palette
- **Primary Gold (#CBA476)**: Main accent, CTA buttons, active states
- **Accent Cyan (#43CAE6)**: Links, secondary accent
- **Background (#F5F3F0)**: Light warm background (lighter version of brand gray)
- **White (#FFFFFF)**: Content containers, cards
- **Black (#000000)**: Primary text
- **Muted Gray (#6B6B6B)**: Secondary text
- **Border Gray (#E5E5E5)**: Borders, dividers

### Layout System
**Spacing Primitives**: Tailwind units 4, 8, 16, 24 for consistency
- Component padding: p-6 to p-12
- Section spacing: py-12 to py-20
- Element gaps: gap-4 to gap-6
- Container: max-w-5xl, centered with px-4 md:px-8

### Component Library

**Header Section**
- Clean white background with logo (left) and navigation (right)
- Height: h-16, sticky positioning with blur background
- Logo using provided SVG asset
- CTA button: "Pedir una cita" with rounded-full styling (#CBA476 background)

**Hero/Upload Section**
- Centered layout with prominent heading
- Subheading explaining the instant preview capability
- Large drag-and-drop upload zone with subtle border
- Upload icon with clear instructions
- Background: warm off-white, clean aesthetic

**Before/After Comparison**
- Two-column grid (grid-cols-1 md:grid-cols-2) with gap-6
- Each image container:
  - Aspect ratio 3:4 for portraits
  - Rounded corners (rounded-lg)
  - Subtle shadow
  - Label overlay at bottom ("ANTES" / "DESPUÉS")

**CTA Section**
- Primary button: "Pedir una Cita" 
  - Background: #CBA476 (primary gold)
  - Text: white, 16-18px, medium weight
  - Padding: px-8 py-3
  - Border-radius: rounded-full (pill shape)
- Supporting text above button

### Images
**No hero image** - functional tool focused
**User-uploaded images** are central visual element
**Logo**: SVG provided in assets (header)
**Icons**: Lucide icons

### Responsive Behavior
- **Mobile-first**: Single column layout, full-width elements
- **Tablet (md:)**: Two-column before/after
- **Desktop (lg:)**: Max-width container, maintained proportions

### Interaction States
- Upload zone: Border becomes accent color on drag-over
- Primary button: Subtle hover state using elevate system
- Images: Subtle scale on hover

## Key UX Principles
1. **Immediate clarity**: User knows exactly what to do (upload photo)
2. **Trust through simplicity**: Clean, medical-grade aesthetic
3. **Visual proof**: Before/after is the hero, not marketing copy
4. **Low friction**: Single action to see results
5. **Conversion focus**: Clear, prominent CTA after delivering value
