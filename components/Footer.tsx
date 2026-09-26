'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Phone, Layout, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#020307] py-16 px-6 relative z-10">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Pre-Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/[0.06]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white block">Nexora Digital Studio</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">High-Performance SMB Web Systems</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              We design and engineer sub-second, mobile-first web platforms for North American local leaders, converting casual searchers into high-ticket clients.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <a 
                href="mailto:jyu@wisdomitc.com" 
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>jyu@wisdomitc.com</span>
              </a>
              <span>•</span>
              <a 
                href="tel:+13802184573" 
                className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>+1 (380) 218-4573</span>
              </a>
            </div>
          </div>

          {/* Core Navigation */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">Platform</span>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home Showcase</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">Digital Services</Link>
              </li>
              <li>
                <Link href="/case-studies" className="hover:text-white transition-colors">Case Studies & ROI</Link>
              </li>
              <li>
                <Link href="/process" className="hover:text-white transition-colors">14-Day Delivery Method</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">Pricing & Calculator</Link>
              </li>
            </ul>
          </div>

          {/* Solutions by Industry */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">Niche Solutions</span>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/services#hvac" className="hover:text-white transition-colors">Plumbing & HVAC</Link>
              </li>
              <li>
                <Link href="/services#roofing" className="hover:text-white transition-colors">Roofing & Contractors</Link>
              </li>
              <li>
                <Link href="/services#medical" className="hover:text-white transition-colors">Dental & Clinics</Link>
              </li>
              <li>
                <Link href="/services#legal" className="hover:text-white transition-colors">Legal & Financial</Link>
              </li>
              <li>
                <Link href="/#audit-tool" className="hover:text-white transition-colors flex items-center gap-1 text-indigo-400">
                  <span>60s Free Audit Tool</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Contact & Admin */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">Direct Connect</span>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Book Strategy Call</Link>
              </li>
              <li>
                <a href="mailto:jyu@wisdomitc.com" className="hover:text-white transition-colors">Send RFP / Spec Files</a>
              </li>
              <li>
                <span className="text-slate-500">Offices: Austin, TX • Toronto, ON</span>
              </li>
              <li className="pt-2">
                <Link 
                  href="/admin" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-400 font-mono text-[11px] transition-all border border-white/5"
                >
                  <Layout className="w-3 h-3" />
                  <span>Admin Console</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Nexora Digital Studio. Built with Next.js 16.3 on sub-second edge architecture.</p>
          <div className="flex items-center gap-4">
            <Link href="/pricing#guarantees" className="hover:text-slate-400 transition-colors">4-Point Guarantee</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">Support Desk</Link>
            <span>•</span>
            <span className="text-emerald-400/80 font-mono">100% Mobile Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
