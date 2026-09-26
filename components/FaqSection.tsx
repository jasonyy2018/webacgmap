'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Check, ShieldCheck } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Will our current website go down or company email break during the redesign?',
      a: 'Absolutely not. We build and test your new high-performance platform on a private, isolated staging environment. When ready, we perform a zero-downtime DNS cutover. Your domain email (Google Workspace, Microsoft 365, etc.) and MX records remain 100% untouched.'
    },
    {
      q: 'Do we have to write all the website copy and provide professional photos?',
      a: 'No. As busy business owners, your time is best spent running operations. Our specialized North American copywriting team handles all high-converting industry copy, service descriptions, and localized value propositions. We also provide high-resolution, licensed industry photography.'
    },
    {
      q: 'How fast is the turnaround time from kickoff to launch?',
      a: 'We operate on a strict 14-day turnaround guarantee. While traditional legacy marketing agencies drag out simple redesigns for 3 to 6 months with endless meetings, our modern Next.js component system and agile sprints deliver a launch-ready, fully tested web platform in under two weeks.'
    },
    {
      q: 'Will this redesign affect or hurt our existing Google search rankings?',
      a: 'Your SEO is protected and enhanced. We implement strict 301 URL redirects for all your historical pages so zero Google ranking authority is lost. Furthermore, because Google now strongly favors sub-second Core Web Vitals speed and schema markup, 89% of our clients experience a measurable local ranking boost within 30-60 days.'
    },
    {
      q: 'Do we own the website, domain, and source code once completed?',
      a: '100% yes. We do not practice predatory vendor lock-in. You retain 100% full legal ownership of your source code, design assets, and content. You can host anywhere, edit anytime, or have your internal staff manage it without restrictive proprietary builder fees.'
    },
    {
      q: 'How does the free 60s audit and concept proposal work?',
      a: 'Simply enter your business name and details in our instant diagnostic tool above. Our system evaluates your mobile viewport, Core Web Vitals, and conversion friction. Within 24 hours, our engineering director prepares a tailored interactive Before/After preview showing how your business can outshine local competitors.'
    }
  ];

  return (
    <div className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          Clear Answers For Busy Business Owners
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Frequently Asked Questions
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Everything you need to know about our 14-day delivery, zero-downtime migration, and guaranteed conversion results.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen 
                  ? 'bg-white/[0.04] border-indigo-500/40 shadow-lg shadow-indigo-500/5' 
                  : 'bg-white/[0.015] border-white/10 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-sm sm:text-base font-bold text-white leading-snug">
                  {faq.q}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-indigo-500/20 text-indigo-300' : 'text-slate-400'}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs text-slate-300">
            Have a specific technical question or need an NDA? We're available for a 15-minute introductory call.
          </span>
        </div>
        <a
          href="/contact"
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline shrink-0"
        >
          Speak with our team &rarr;
        </a>
      </div>
    </div>
  );
}
