'use client';

import React from 'react';
import { Sparkles, TrendingUp, CheckCircle2, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function LiveMarqueeTicker() {
  const items = [
    { city: 'Dallas, TX', name: 'Apex Emergency HVAC', metric: '+314% Emergency Calls', speed: '0.5s FCP' },
    { city: 'Seattle, WA', name: 'Pacific Smile Ortho', metric: '+236% New Consultations', speed: '0.4s FCP' },
    { city: 'Denver, CO', name: 'Summit Ridge Roofing', metric: '4.2x Roof Quotes', speed: '0.6s FCP' },
    { city: 'Austin, TX', name: 'Lonestar Luxury Detail', metric: '100% Booking Automated', speed: '0.4s FCP' },
    { city: 'Toronto, ON', name: 'Oakridge Injury Law', metric: '+188% Direct Inquiries', speed: '0.5s FCP' },
    { city: 'Miami, FL', name: 'South Beach Dental Spa', metric: '+290% Cosmetic Intakes', speed: '0.4s FCP' },
    { city: 'Chicago, IL', name: 'Midwest Precision Plumbing', metric: '+340% Mobile Inbound', speed: '0.5s FCP' },
    { city: 'Vancouver, BC', name: 'WestCoast Modern Homes', metric: '3.8x High-Ticket Leads', speed: '0.6s FCP' },
  ];

  return (
    <div className="relative py-4 border-y border-white/[0.06] bg-gradient-to-r from-indigo-950/20 via-black to-purple-950/20 overflow-hidden select-none">
      {/* Side Vignette Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#04060c] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#04060c] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex gap-6 animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md hover:border-indigo-500/40 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="text-xs font-bold text-white tracking-tight">{item.name}</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">({item.city})</span>
            <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {item.metric}
            </span>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">
              ⚡ {item.speed}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
