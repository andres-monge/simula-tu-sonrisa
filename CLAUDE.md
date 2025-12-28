# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smile Simulator ("Simula tu Sonrisa") - A Spanish-language marketing demo for cosmetic dentist Dr. Diego Serrano (Zaragoza, Spain). Users upload selfies and receive AI-generated enhanced smile images using Google Gemini's image generation.

## Development Commands

```bash
npm run dev      # Start development server (Express + Vite HMR)
npm run build    # Production build
npm run start    # Run production build
npm run check    # TypeScript type checking
npm run db:push  # Push Drizzle schema to database
```

The dev server runs on port 5000 and serves both API and client.

## Architecture

**Monorepo Structure:**
- `client/` - React frontend (Vite, TanStack Query, Wouter router, Shadcn UI)
- `server/` - Express backend (API routes, Gemini integration)
- `shared/` - Shared types and Drizzle schemas

**Key Files:**
- `server/gemini.ts` - Gemini API integration with prompts for smile enhancement and modification
- `server/routes.ts` - API endpoints (`POST /api/enhance-smile`, `POST /api/modify-image`)
- `client/src/pages/Home.tsx` - Main page with upload, camera capture, and results display
- `shared/schema.ts` - Drizzle ORM schemas with Zod validation

**Data Flow:**
1. User uploads image or captures via webcam
2. Frontend sends base64 image to `/api/enhance-smile`
3. Backend calls Gemini 2.5 Flash Image model
4. Enhanced image returned as base64 for before/after display
5. Users can iteratively refine via `/api/modify-image` with Spanish prompts

## Environment Variables

- `AI_INTEGRATIONS_GEMINI_API_KEY` - Gemini API key (via Replit AI Integrations)
- `AI_INTEGRATIONS_GEMINI_BASE_URL` - Gemini base URL
- `GEMINI_MODEL` - Model name (default: `gemini-2.5-flash-image`)
- `PORT` - Server port (default: 5000)

## Design Guidelines

**Brand Colors:**
- Primary Gold: `#CBA476` (CTAs, accents)
- Accent Cyan: `#43CAE6` (links, secondary)
- Background: `#F5F3F0` (warm off-white)

**Typography:** DM Sans for all text, DM Serif Display optional for headings

**UI Language:** All user-facing text must be in Spanish

**Layout:** Mobile-first, max-w-5xl container, responsive before/after grid

See `design_guidelines.md` for complete design specifications.

## Tech Stack Notes

- Uses `@google/genai` SDK for Gemini (not OpenAI-compatible endpoint)
- Wouter for routing (not React Router)
- Drizzle ORM with Neon/PostgreSQL (though app is currently stateless)
- Shadcn UI components in `client/src/components/ui/`