'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, Mail, Phone, Menu, X, ArrowRight, Zap, Layout 
} from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/case-studies', label: 'Case Studies' },
    { href: '/process', label: '14-Day Method' },
    { href: '/pricing', label: 'Pricing & ROI' },
    { href: '/contact', label: 'Contact Us' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#04060c]/85 border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              Nexora Studio
            </span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-widest block uppercase font-bold">
              Web Systems & Growth
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  active 
                    ? 'text-white bg-white/10 shadow-sm shadow-indigo-500/10 font-bold' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Direct Email Link */}
          <a
            href="mailto:jyu@wisdomitc.com?subject=Inquiry%20for%20Nexora%20Studio"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 hover:text-white hover:bg-indigo-500/20 text-xs font-mono transition-all"
            title="Official Business Email: jyu@wisdomitc.com"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span>jyu@wisdomitc.com</span>
          </a>

          {/* Quick Admin Access Link */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono transition-all"
            title="Access Admin Console"
          >
            <Layout className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Admin Portal</span>
            <span className="sm:hidden">Admin</span>
          </Link>

          {/* Free Audit Button */}
          <Link
            href="/#audit-tool"
            className="hidden sm:flex px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all items-center gap-1.5"
          >
            <span>Free 60s Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#04060c]/98 backdrop-blur-2xl px-6 py-6 space-y-4 animate-fadeIn shadow-2xl">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Official Email:</span>
            <a href="mailto:jyu@wisdomitc.com" className="text-indigo-300 font-mono font-bold flex items-center gap-1">
              <Mail className="w-3 h-3 text-indigo-400" />
              <span>jyu@wisdomitc.com</span>
            </a>
          </div>

          <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-300">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-3 rounded-xl transition-colors flex items-center justify-between ${
                    active ? 'bg-indigo-600/20 text-white font-bold border border-indigo-500/30' : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <Link
              href="/#audit-tool"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/25"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Instant 60s Website Audit</span>
            </Link>

            <a
              href="tel:+13802184573"
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>Call Team: +1 (380) 218-4573</span>
            </a>

            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white font-mono text-xs flex items-center justify-center gap-2"
            >
              <Layout className="w-4 h-4 text-indigo-400" />
              <span>Admin Management Console</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
