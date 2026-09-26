'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, 
  Smartphone, Monitor, Flame, Zap, Star, Phone, Calendar, ArrowRight, Sparkles 
} from 'lucide-react';
import TiltCard3D from './TiltCard3D';

export default function VisualDeviceComparison() {
  const [selectedIndustry, setSelectedIndustry] = useState<'hvac' | 'dental' | 'roofing'>('hvac');

  const data = {
    hvac: {
      title: 'Precision Emergency HVAC & Plumbing',
      location: 'Dallas, TX',
      oldUrl: 'http://dallas-ac-plumb-express.net',
      newUrl: 'https://precisionhvac-dallas.com',
      oldSpeed: '14.2s',
      newSpeed: '0.6s',
      lift: '+314% Emergency Call Inquiries',
      oldHighlights: [
        '⚠️ "Not Secure" HTTP warning scares 40%+ of visitors',
        'Tiny phone number hidden in footer (unclickable on mobile)',
        'Desktop-only table layout requiring pinch-to-zoom on iPhone',
        'No online dispatch scheduler or instant quote form'
      ],
      newHighlights: [
        '🔒 Sub-second edge CDN with 100/100 Core Web Vitals',
        'Prominent thumb-friendly 1-tap call & dispatch button',
        'Live service area coverage map with instant quote modal',
        'Verified Google Map review badge (142 reviews, 4.9★)'
      ],
      oldMockup: {
        headline: 'Welcome to AC Repair & Plumbing in Dallas Since 2004',
        subtext: 'We do all kinds of repairs for water heaters, drain pipes, and cooling units. Call us during business hours 9am-5pm.',
        buttonText: 'Submit Inquiry (PDF Form)'
      },
      newMockup: {
        badge: '⚡ 24/7 Live Emergency Techs On Duty',
        headline: 'Dallas Premier 24/7 Emergency HVAC & Plumbing',
        subtext: 'Licensed technicians dispatched to your door in 45 minutes or less. Zero overtime fees. Guaranteed honest pricing.',
        buttonText: 'Dispatch Technician Now (Instant Quote)'
      }
    },
    dental: {
      title: 'Seattle Premier Smiles Orthodontics',
      location: 'Seattle, WA',
      oldUrl: 'http://seattle-family-dentistry.org',
      newUrl: 'https://seattlepremiersmiles.com',
      oldSpeed: '9.8s',
      newSpeed: '0.5s',
      lift: '+236% New Patient Consultations',
      oldHighlights: [
        'Clunky generic WordPress template with stock photos',
        'Paper PDF registration form requiring home printer',
        'No HIPAA-compliant intake or treatment cost calculator',
        'Missing before/after cosmetic smile gallery'
      ],
      newHighlights: [
        'Luxurious cosmetic medical aesthetic with video hero',
        'Real-time Calendly online appointment scheduling',
        'Interactive 60s Virtual Smile Assessment quiz',
        'HIPAA-compliant encrypted new patient digital intake'
      ],
      oldMockup: {
        headline: 'General Dentistry and Cleaning Services',
        subtext: 'We are accepting new patients for cleanings, fillings and root canals. Please print our registration packet before your visit.',
        buttonText: 'Download PDF Registration (4.2 MB)'
      },
      newMockup: {
        badge: '✨ Top Rated Seattle Cosmetic Dentistry 2026',
        headline: 'Transform Your Smile With Modern Cosmetic Dentistry',
        subtext: 'Invisalign, veneers & gentle sedation care in a luxury, stress-free clinic. Same-day appointments available for new patients.',
        buttonText: 'Book 3D Smile Scan Online (Free)'
      }
    },
    roofing: {
      title: 'Rocky Mountain Commercial & Residential Roofing',
      location: 'Denver, CO',
      oldUrl: 'http://denver-roof-pros-llc.biz',
      newUrl: 'https://rockymountainroofing.com',
      oldSpeed: '12.4s',
      newSpeed: '0.7s',
      lift: '+411% Qualified Inspection Requests',
      oldHighlights: [
        'Broken CSS grid on mobile screens (content cut off)',
        'Uncompressed 8MB drone photos causing 12s loading lag',
        'Zero suburb-specific SEO landing pages for Denver metro',
        'No storm damage insurance claim walkthrough'
      ],
      newHighlights: [
        'Sub-second Next.js image optimization (WebP/AVIF)',
        'Instant Aerial Roof Estimate & Storm Damage Calculator',
        'Insurance claim assistance guide with 1-click adjuster chat',
        'Synched local Google Maps pack ranking booster'
      ],
      oldMockup: {
        headline: 'Roof Repairs, Shingles & Gutters In Denver Metro',
        subtext: 'Free estimates. Call our office manager to leave a voicemail. We will get back to you within 2-3 business days.',
        buttonText: 'Leave Voicemail Request'
      },
      newMockup: {
        badge: '🌪️ Denver Hail Damage Emergency Response Team',
        headline: 'Colorado Most Trusted Residential & Commercial Roofing',
        subtext: 'Get an instant satellite roof measurement & repair estimate in 90 seconds. $0 down insurance claim assistance.',
        buttonText: 'Get Instant Satellite Roof Quote'
      }
    }
  };

  const current = data[selectedIndustry];

  return (
    <div className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Monitor className="w-3.5 h-3.5 text-indigo-400" />
          Interactive Visual Simulation
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Visual Breakdown: Outdated Legacy vs. 2026 Nexora Engine
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Compare the real visual, speed, and conversion experience between a typical SMB website and our custom conversion engine.
        </p>
      </div>

      {/* Industry Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <button
          type="button"
          onClick={() => setSelectedIndustry('hvac')}
          className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
            selectedIndustry === 'hvac'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Dallas HVAC & Plumbing
        </button>
        <button
          type="button"
          onClick={() => setSelectedIndustry('dental')}
          className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
            selectedIndustry === 'dental'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Seattle Dental & Ortho
        </button>
        <button
          type="button"
          onClick={() => setSelectedIndustry('roofing')}
          className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
            selectedIndustry === 'roofing'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Denver Roofing & Exterior
        </button>
      </div>

      {/* Dual Browser Window Mockup with 3D Tilt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Left: Legacy Outdated Mockup */}
        <TiltCard3D maxTilt={6} glareOpacity={0.05} className="h-full">
          <div className="h-full rounded-3xl border border-rose-500/30 bg-slate-950/70 overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* Browser Top Bar */}
            <div className="bg-slate-900 px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/60 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/60 inline-block" />
                <span className="w-3 h-3 rounded-full bg-slate-600 inline-block" />
              </div>
              <div className="flex-1 max-w-xs mx-3 px-3 py-1 rounded-lg bg-black/60 border border-rose-500/30 text-[11px] font-mono text-rose-300 flex items-center gap-1.5 truncate">
                <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="truncate">{current.oldUrl}</span>
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Load: {current.oldSpeed}
              </span>
            </div>

            {/* Legacy Simulated Content */}
            <div className="p-6 sm:p-8 space-y-6 flex-1 bg-[#1a1c23]/40 font-serif">
              <div className="space-y-2 border-b border-white/10 pb-4">
                <div className="text-[11px] text-rose-400 font-sans font-bold uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Legacy Architecture (2012 Style)</span>
                </div>
                <h3 className="text-xl font-bold text-slate-200">
                  {current.oldMockup.headline}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {current.oldMockup.subtext}
                </p>
              </div>

              {/* Bad CTA button */}
              <div className="pt-2">
                <button 
                  type="button"
                  disabled 
                  className="px-4 py-2.5 rounded bg-slate-700 text-slate-300 text-xs font-sans border border-slate-600 cursor-not-allowed opacity-60"
                >
                  {current.oldMockup.buttonText}
                </button>
              </div>

              {/* Negative Highlights */}
              <div className="pt-4 font-sans space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Identified Friction Points:</div>
                {current.oldHighlights.map((point, idx) => (
                  <div key={idx} className="text-xs text-rose-300/80 flex items-start gap-2">
                    <span className="text-rose-400 font-bold shrink-0">•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-rose-950/20 border-t border-rose-500/20 text-center font-sans text-xs text-rose-300 font-semibold">
              Result: 68% Visitor Bounce Rate & Lost Mobile Phone Inquiries
            </div>
          </div>
        </TiltCard3D>

        {/* Right: Nexora 2026 Engine Mockup */}
        <TiltCard3D maxTilt={10} glareOpacity={0.18} className="h-full">
          <div className="h-full rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/40 overflow-hidden shadow-2xl shadow-emerald-500/15 flex flex-col justify-between relative group">
            {/* Ambient Neon Backlight Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

            {/* Browser Top Bar */}
            <div className="bg-slate-900 px-4 py-3 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-[0_0_6px_#f43f5e]" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-[0_0_6px_#f59e0b]" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_#10b981]" />
              </div>
              <div className="flex-1 max-w-xs mx-3 px-3 py-1 rounded-lg bg-black/70 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 truncate">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{current.newUrl}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                ⚡ {current.newSpeed} Sub-second
              </span>
            </div>

            {/* Nexora Modern Simulated Content */}
            <div className="p-6 sm:p-8 space-y-6 flex-1 bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-purple-950/30 font-sans">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{current.newMockup.badge}</span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  {current.newMockup.headline}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {current.newMockup.subtext}
                </p>
              </div>

              {/* High-Converting CTA Button */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button 
                  type="button"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{current.newMockup.buttonText}</span>
                </button>

                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>4.9★ Google Verified (140+ Reviews)</span>
                </div>
              </div>

              {/* Positive Highlights */}
              <div className="pt-4 space-y-2 border-t border-white/10">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Engineered Advantages:</div>
                {current.newHighlights.map((point, idx) => (
                  <div key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-emerald-950/30 border-t border-emerald-500/30 text-center font-sans text-xs text-emerald-300 font-bold flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 fill-emerald-400" />
              <span>Delivered Outcome: {current.lift} within 30 Days</span>
            </div>
          </div>
        </TiltCard3D>
      </div>
    </div>
  );
}
