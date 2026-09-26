'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileStickyBar from '@/components/MobileStickyBar';
import CyberGridBackground from '@/components/CyberGridBackground';
import TiltCard3D from '@/components/TiltCard3D';
import { 
  Mail, Phone, Clock, ShieldCheck, CheckCircle2, ArrowRight, 
  ExternalLink, Copy, Check, MessageSquare, Sparkles, MapPin 
} from 'lucide-react';

export default function ContactPage() {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryWebsite, setInquiryWebsite] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState<'CONSULTATION' | 'QUOTATION' | 'FEEDBACK' | 'PARTNERSHIP'>('CONSULTATION');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || (!inquiryEmail && !inquiryPhone)) {
      alert('Please provide your name and at least an email or phone number.');
      return;
    }
    if (!inquiryMessage.trim()) {
      alert('Please enter your project goals, inquiry, or feedback.');
      return;
    }

    setIsInquirySubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          email: inquiryEmail,
          phone: inquiryPhone,
          website: inquiryWebsite,
          category: inquiryCategory,
          message: inquiryMessage,
        }),
      });

      if (res.ok) {
        setInquirySubmitted(true);
      } else {
        const data = await res.json();
        alert(`Failed to submit: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert(`Error submitting inquiry: ${err.message}`);
    } finally {
      setIsInquirySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      <CyberGridBackground />
      <Navbar />

      {/* Header */}
      <section className="pt-20 pb-12 px-6 max-w-6xl mx-auto text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5 text-indigo-400" />
          <span>Direct Senior Architect Access</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Let’s Discuss Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Digital Transformation</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Submit your project requirements online to our management console, or email our lead engineer directly at <span className="text-indigo-400 font-mono font-bold">jyu@wisdomitc.com</span>. We respond within 2 hours.
        </p>
      </section>

      {/* Dual Channel Contact Desk */}
      <section className="py-8 pb-24 px-6 max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Official Channels */}
          <div className="lg:col-span-4 space-y-6">
            <TiltCard3D maxTilt={6} glareOpacity={0.08} className="w-full">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/80 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Direct Mailbox
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Active SLA
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Official Business Mailbox</h3>
                  <p className="text-xs text-slate-400">
                    Monitored 24/7 by our technical lead. Attach RFPs, design briefs, or feedback directly.
                  </p>
                </div>

                {/* Email Highlight Box */}
                <div className="p-4 rounded-2xl bg-black/60 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-slate-400 font-mono block">Engineering Desk</span>
                      <a 
                        href="mailto:jyu@wisdomitc.com?subject=Nexora%20Studio%20Inquiry"
                        className="text-sm font-bold text-indigo-300 hover:text-indigo-200 font-mono truncate block"
                      >
                        jyu@wisdomitc.com
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href="mailto:jyu@wisdomitc.com?subject=Nexora%20Studio%20Inquiry"
                      className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] text-center transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Send Email</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('jyu@wisdomitc.com');
                        setCopiedEmail(true);
                        setTimeout(() => setCopiedEmail(false), 2000);
                      }}
                      className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-[11px] text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                    </button>
                  </div>
                </div>

                {/* Direct Phone Hotline */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Direct Hotline</span>
                      <a href="tel:+13802184573" className="text-xs font-bold text-white hover:text-cyan-300 font-mono">
                        +1 (380) 218-4573
                      </a>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Mon-Fri 9am-6pm CST</span>
                </div>

                {/* Locations */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>North American Presence</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Engineering hubs in Austin, TX & Toronto, ON. Serving clients across the United States & Canada.
                  </p>
                </div>

                {/* SLA Commitment */}
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Under 2-Hour Response SLA</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Every message sent to <span className="text-white font-mono">jyu@wisdomitc.com</span> is reviewed by a senior web engineer, not an outsourced call center.
                  </p>
                </div>
              </div>
            </TiltCard3D>
          </div>

          {/* Right Column: Online Consultation & Feedback Submission Form */}
          <div className="lg:col-span-8">
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-black/80 to-purple-950/20 border border-white/10 shadow-2xl relative">
              <div className="mb-6">
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block mb-1">
                  Online Triage Portal
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Schedule Strategy Consultation or Submit Feedback
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your submission is recorded directly in our administrative backend and flagged for immediate review.
                </p>
              </div>

              {inquirySubmitted ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white">Thank You! Your Request Has Been Logged.</h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                      Our lead engineer will review your market presence and reach out from <span className="text-indigo-400 font-mono font-bold">jyu@wisdomitc.com</span> with your tailored concept mockup within 1 business day.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href="mailto:jyu@wisdomitc.com?subject=Supplementary%20Files%20for%20Inquiry"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Supplemental Files via Email</span>
                    </a>
                    <button
                      onClick={() => setInquirySubmitted(false)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                    >
                      Submit Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-5">
                  {/* Category Selector Tabs */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Select Inquiry Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'CONSULTATION', label: '💼 Web Redesign' },
                        { id: 'QUOTATION', label: '💰 Custom Quote' },
                        { id: 'FEEDBACK', label: '💬 Site Feedback' },
                        { id: 'PARTNERSHIP', label: '🤝 Partnership' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setInquiryCategory(cat.id as any)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                            inquiryCategory === cat.id
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                              : 'bg-black/50 text-slate-400 border-white/10 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Your Name / Business</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe (Austin Roofing)"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Business Email <span className="text-indigo-400 font-mono text-[10px]">(for reply)</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@austinroofing.com"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+1 (380) 218-4573"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Current Website URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="www.yourcurrentbusiness.com"
                      value={inquiryWebsite}
                      onChange={(e) => setInquiryWebsite(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Project Details, Questions, or Feedback</label>
                    <textarea
                      rows={4}
                      required
                      placeholder={
                        inquiryCategory === 'FEEDBACK'
                          ? 'Please share any feedback or suggestions regarding your experience with our platform...'
                          : inquiryCategory === 'QUOTATION'
                          ? 'Tell us about your target timeline, estimated budget range, and key business features needed...'
                          : 'Describe your current web bottlenecks (e.g. slow speed, lack of mobile calls, outdated design)...'
                      }
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-400">
                      🔒 Protected by NDA. Our team replies directly from <span className="text-indigo-400 font-mono">jyu@wisdomitc.com</span>.
                    </p>
                    <button
                      type="submit"
                      disabled={isInquirySubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 shrink-0"
                    >
                      {isInquirySubmitting ? (
                        <span>Logging Inquiry...</span>
                      ) : (
                        <>
                          <span>Submit Request to Engineering Desk</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileStickyBar />
    </div>
  );
}
