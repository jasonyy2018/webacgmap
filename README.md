# MapKDev AI (Next.js Version)

A smart lead generation tool that uses Google Maps and Gemini AI to discover businesses needing technical help.

## Tech Stack
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Lucide React, Framer Motion
- **Backend**: Next.js API Routes (Serverless ready)
- **Database**: SQLite with Prisma ORM
- **AI**: Google Gemini Pro API (Analysis & Content Generation)
- **Services**: Google Maps Places API

## Getting Started

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Ensure your `.env` file has the following:
   ```env
   GOOGLE_MAPS_API_KEY=your_key
   GEMINI_API_KEY=your_key
   DATABASE_URL="file:./dev.db"
   ```

3. **Database Setup**
   ```bash
   npx prisma migrate dev
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Key Features
- **Map Search**: Intelligent business discovery using Google Maps API.
- **AI Audit**: Automatic website technical audit using Gemini AI.
- **Lead Scoring**: Smart lead prioritization based on technical debt.
- **Marketing Automation**: AI-generated personalized outreach emails.
- **Unified Architecture**: Consolidated frontend and backend into a single Next.js project.
