'use client';

import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, ArrowRight, DollarSign, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RoiCalculator() {
  const [visitors, setVisitors] = useState<number>(2000);
  const [ticketValue, setTicketValue] = useState<number>(2500);
  const [industryPreset, setIndustryPreset] = useState<string>('HVAC & Plumbing');

  const presets = [
    { label: 'HVAC & Plumbing', visitors: 1800, ticket: 2200 },
    { label: 'Dental & Medical', visitors: 2500, ticket: 1400 },
    { label: 'Roofing & Construction', visitors: 1200, ticket: 7500 },
    { label: 'Legal & Accounting', visitors: 1000, ticket: 3500 },
    { label: 'Auto Detailing / Repair', visitors: 1500, ticket: 650 },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setIndustryPreset(preset.label);
    setVisitors(preset.visitors);
    setTicketValue(preset.ticket);
  };

  // Typical legacy website conversion rate: 1.0%
  // Nexora Next.js high-converting website rate: 3.8%
  // Conversion lift = 2.8%
  const currentInquiries = Math.round(visitors * 0.01);
  const optimizedInquiries = Math.round(visitors * 0.038);
  const lostInquiriesMonthly = Math.max(0, optimizedInquiries - currentInquiries);
  const monthlyRevenueLoss = lostInquiriesMonthly * ticketValue;
  const annualRevenueLoss = monthlyRevenueLoss * 12;

  return (
    <div className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5" />
          Interactive Revenue Opportunity Calculator
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          How Much Revenue Is Your Outdated Website Costing You?
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Slow loading, unclickable phone numbers, and desktop-only forms cause 60%+ of potential local customers to bounce to your competitor. See your estimated monthly loss below:
        </p>
      </div>

      <div className="p-5 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900/80 via-black to-slate-950 border border-white/10 shadow-2xl backdrop-blur-xl">
        {/* Industry Presets with Horizontal Swipe on Mobile */}
        <div className="mb-8">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
            Quick Industry Presets:
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar sm:flex-wrap">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  industryPreset === p.label
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders Left */}
          <div className="lg:col-span-7 space-y-8">
            {/* Slider 1: Monthly Visitors */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Estimated Monthly Website Visitors
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20 w-fit">
                  {visitors.toLocaleString()} visitors
                </span>
              </div>
              <input
                type="range"
                min={300}
                max={15000}
                step={100}
                value={visitors}
                onChange={(e) => {
                  setVisitors(Number(e.target.value));
                  setIndustryPreset('Custom');
                }}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>300 / mo</span>
                <span>5,000 / mo</span>
                <span>15,000+ / mo</span>
              </div>
            </div>

            {/* Slider 2: Average Ticket Value */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Average Customer Job / Ticket Value
                </span>
                <span className="text-lg font-mono font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                  ${ticketValue.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={15000}
                step={100}
                value={ticketValue}
                onChange={(e) => {
                  setTicketValue(Number(e.target.value));
                  setIndustryPreset('Custom');
                }}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>$200 (Service call)</span>
                <span>$5,000 (Medical / Install)</span>
                <span>$15,000+ (Roof / Commercial)</span>
              </div>
            </div>

            {/* Methodology Note */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Why this benchmark matters:</p>
              <p>
                Standard legacy websites convert around ~1.0% of traffic. Nexora's mobile-first, sub-second engines with instant booking modals convert at an average of 3.8% — capturing ~{lostInquiriesMonthly} additional qualified inquiries per month.
              </p>
            </div>
          </div>

          {/* Result Card Right */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-rose-950/30 via-slate-900 to-indigo-950/40 border border-rose-500/30 shadow-xl space-y-6 text-center">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-300 font-bold flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Estimated Revenue Leaking To Competitors
              </span>
              <div className="text-4xl sm:text-5xl font-black text-rose-400 font-mono py-2">
                ${monthlyRevenueLoss.toLocaleString()}
                <span className="text-sm font-normal text-slate-400 font-sans block mt-1">per month</span>
              </div>
            </div>

            <div className="py-4 border-y border-white/10 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-400">Lost Monthly Inquiries</div>
                <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">~{lostInquiriesMonthly} leads</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Annual Growth Left On Table</div>
                <div className="text-xl font-extrabold text-white font-mono mt-1">${annualRevenueLoss.toLocaleString()}</div>
              </div>
            </div>

            <a
              href="/#audit-tool"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-indigo-600 to-emerald-500 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Fix My Conversion Leaks (Claim Free Audit)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
