'use client';

import React from 'react';
import { Zap, Phone, ShieldCheck, ArrowRight, Mail } from 'lucide-react';

export default function MobileStickyBar() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-[#04060c]/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_35px_rgba(0,0,0,0.8)]">
      <div className="max-w-md mx-auto space-y-2">
        {/* Micro Live Trust Strip */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>SENIOR ENGINEER ON DUTY</span>
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            <span>14-Day Delivery Guarantee</span>
          </span>
        </div>

        {/* Dual / Triple Primary Mobile Action Buttons */}
        <div className="grid grid-cols-12 gap-2">
          {/* Quick Call Button */}
          <a
            href="tel:+13802184573"
            className="col-span-3 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all text-center"
            title="Call +1 (380) 218-4573"
          >
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Call</span>
          </a>

          {/* Quick Email Button */}
          <a
            href="mailto:jyu@wisdomitc.com?subject=Mobile%20Inquiry%20-%20Nexora%20Studio"
            className="col-span-3 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all text-center"
            title="Email jyu@wisdomitc.com"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span>Email</span>
          </a>

          {/* High-Impact Primary Audit CTA */}
          <a
            href="/#audit-tool"
            className="col-span-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all text-center"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Free 60s Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
