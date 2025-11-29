# Smile Simulator

## Overview
A Spanish-language marketing demo web app for a cosmetic dentist (Dr. Diego Serrano, Zaragoza, Spain) that uses Google's Gemini AI to simulate enhanced smiles. Users upload a selfie, and the app generates a before/after comparison showing a simulated smile improvement.

## Purpose
- Marketing demo for cosmetic dentistry services
- Proof of concept for AI-powered smile simulation
- Designed for iframe embedding on the dentist's website

## Key Features
- **Selfie Upload**: Drag-and-drop or file selection for uploading photos
- **Camera Capture**: Live webcam capture option for taking selfies
- **AI Enhancement**: Gemini 2.5 Flash Image model enhances smiles
- **Before/After Display**: Side-by-side "Antes" and "Después" comparison
- **Image Download**: Users can save their simulated results
- **Responsive Design**: Mobile-friendly centered layout

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **AI**: Google Gemini API (gemini-2.5-flash-image model)
- **Styling**: Brand colors from Dr. Diego Serrano's website

## Environment Variables
- `GEMINI_API_KEY`: Google AI API key (stored in Replit Secrets)
- `GEMINI_MODEL`: Gemini model name (default: gemini-2.5-flash-image)

## Project Structure
```
client/
  src/
    pages/Home.tsx     # Main page with upload, camera, and results
    App.tsx            # Router setup
    index.css          # Brand colors and styling
server/
  routes.ts            # API endpoints
  gemini.ts            # Gemini API integration
attached_assets/
  logo.svg             # Dr. Diego Serrano logo
```

## API Endpoints
- `POST /api/enhance-smile`: Accepts base64 image, returns enhanced image

## Brand Colors
- Primary (Gold): #CBA476
- Accent (Cyan): #43CAE6
- Background: White/Light gray

## User Preferences
- Spanish language UI
- Clean, professional medical aesthetic
- Iframe-embeddable design
- No database required (stateless)

## Recent Changes
- Initial implementation of Smile Simulator MVP
- Gemini integration for smile enhancement
- Camera capture and image download features