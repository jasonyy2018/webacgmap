'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  MailCheck, 
  Cpu, 
  ShieldAlert,
  Zap,
  Globe
} from 'lucide-react';
import type { Lead } from '@/lib/types';

interface AnalyticsDashboardProps {
  leads: Lead[];
}

export default function AnalyticsDashboard({ leads }: AnalyticsDashboardProps) {
  const totalLeads = leads.length;
  const analyzedLeads = leads.filter((l) => l.ai_status === 'completed');
  const analyzedCount = analyzedLeads.length;
  const contactedCount = leads.filter((l) => l.status === 'contacted').length;

  const gradeA = analyzedLeads.filter((l) => l.ai_grade === 'A').length;
  const gradeB = analyzedLeads.filter((l) => l.ai_grade === 'B').length;
  const gradeC = analyzedLeads.filter((l) => l.ai_grade === 'C').length;

  const priorityPct = analyzedCount > 0 ? Math.round((gradeA / analyzedCount) * 100) : 0;
  const contactedPct = analyzedCount > 0 ? Math.round((contactedCount / analyzedCount) * 100) : 0;

  // Revenue pipeline: Grade A @ $2,500, Grade B @ $1,500, Grade C @ $800
  const estimatedRevenue = gradeA * 2500 + gradeB * 1500 + gradeC * 800;

  // Tech stack analysis frequency
  const stackCounts: Record<string, number> = {};
  analyzedLeads.forEach((l) => {
    const stack = l.analysis?.tech_stack || l.ai_tags || [];
    stack.forEach((tech) => {
      stackCounts[tech] = (stackCounts[tech] || 0) + 1;
    });
  });

  const sortedTech = Object.entries(stackCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalTechMentions = sortedTech.reduce((acc, curr) => acc + curr[1], 0) || 1;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-black border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BarChart3 className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Real-time Pipeline Intelligence</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Analytics & Business Intelligence</h2>
          <p className="text-gray-400 text-sm max-w-2xl">
            Real-time audit performance, lead grading distribution, tech stack debt metrics, and conversion funnel analytics.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-indigo-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Discovered</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white mb-1">{totalLeads}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Globe className="w-3 h-3 text-indigo-400" /> Discovered from Google Maps
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Audited</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white mb-1">{analyzedCount}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" /> {analyzedCount > 0 ? Math.round((analyzedCount / Math.max(totalLeads, 1)) * 100) : 0}% audit rate
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Est. Pipeline Value</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-emerald-400 mb-1">${estimatedRevenue.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Based on AI opportunity score
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-amber-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Outreach Reach</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <MailCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white mb-1">{contactedCount}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            {contactedPct}% of analyzed leads contacted
          </p>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Grade Distribution */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-400" /> Lead Quality & Priority Grade Distribution
              </h3>
              <p className="text-xs text-gray-500">Graded by Gemini AI technical debt assessment</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              {priorityPct}% High Priority
            </span>
          </div>

          <div className="space-y-5">
            {/* Grade A */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-indigo-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Priority A (Urgent Need / Old Tech)
                </span>
                <span className="font-mono text-gray-300">{gradeA} leads ({analyzedCount > 0 ? Math.round((gradeA / analyzedCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                  style={{ width: `${analyzedCount > 0 ? (gradeA / analyzedCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Grade B */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Priority B (Scale / UX Enhancement)
                </span>
                <span className="font-mono text-gray-300">{gradeB} leads ({analyzedCount > 0 ? Math.round((gradeB / analyzedCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
                  style={{ width: `${analyzedCount > 0 ? (gradeB / analyzedCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Grade C */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span> Priority C (Low Need / Modern Site)
                </span>
                <span className="font-mono text-gray-300">{gradeC} leads ({analyzedCount > 0 ? Math.round((gradeC / analyzedCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
                <div 
                  className="h-full rounded-full bg-gray-600 transition-all duration-1000"
                  style={{ width: `${analyzedCount > 0 ? (gradeC / analyzedCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Conversion Funnel Bar */}
          <div className="pt-6 border-t border-white/5 grid grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Discovered</p>
              <p className="text-lg font-bold text-white">{totalLeads}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Audited</p>
              <p className="text-lg font-bold text-purple-400">{analyzedCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] text-gray-500 font-bold uppercase">High Value</p>
              <p className="text-lg font-bold text-indigo-400">{gradeA}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Contacted</p>
              <p className="text-lg font-bold text-emerald-400">{contactedCount}</p>
            </div>
          </div>
        </div>

        {/* Tech Stack Vulnerability Frequency */}
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Cpu className="w-5 h-5 text-purple-400" /> Detected Tech Stack Debt
            </h3>
            <p className="text-xs text-gray-500">Most frequent legacy systems or UX flaws</p>
          </div>

          <div className="space-y-4">
            {sortedTech.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs italic">
                No tech stack data yet. Analyze leads to generate debt frequency insights.
              </div>
            ) : (
              sortedTech.map(([tech, count], idx) => {
                const pct = Math.round((count / totalTechMentions) * 100);
                return (
                  <div key={tech} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-gray-300 truncate max-w-[160px]">{tech}</span>
                      <span className="font-mono text-indigo-400">{count} leads</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-gray-400">
            <span className="font-bold text-indigo-300">Strategy Tip:</span> Leads with non-responsive layouts or missing CMS frameworks show 3.2x higher outreach response rates.
          </div>
        </div>
      </div>
    </div>
  );
}
