'use client';

import React from 'react';
import { 
  X, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Star, 
  Code, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  Wand2, 
  Download,
  Building,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import type { Lead } from '@/lib/types';
import { leadsApi } from '@/lib/api-client';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onSelectLeadForOutreach: (lead: Lead) => void;
  onUpdate: () => void;
}

export default function LeadDetailModal({
  lead,
  onClose,
  onSelectLeadForOutreach,
  onUpdate,
}: LeadDetailModalProps) {
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const handleReAnalyze = async () => {
    try {
      await leadsApi.analyze(lead.id);
      onUpdate();
    } catch (e) {
      console.error('Failed to trigger re-analysis:', e);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lead, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lead_${lead.id}_${lead.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{lead.name}</h3>
              <p className="text-xs text-gray-500 font-mono truncate max-w-sm">{lead.address || 'Address Not Provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lead.ai_grade && (
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                lead.ai_grade === 'A' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                lead.ai_grade === 'B' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-gray-700 text-gray-300'
              }`}>
                Grade {lead.ai_grade} Priority
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Metadata Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">AI Opportunity Score</span>
              <p className={`text-2xl font-extrabold ${getScoreColor(lead.ai_score)}`}>
                {lead.ai_score || 'N/A'}/100
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Google Rating</span>
              <p className="text-2xl font-extrabold text-amber-400 flex items-center gap-1">
                {lead.rating ? (
                  <>
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{lead.rating}</span>
                  </>
                ) : 'N/A'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mobile Responsive</span>
              <p className="text-lg font-bold text-white flex items-center gap-1.5 pt-1">
                {lead.analysis?.mobile_friendly === true ? (
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Yes</span>
                ) : lead.analysis?.mobile_friendly === false ? (
                  <span className="text-rose-400 flex items-center gap-1"><XCircle className="w-4 h-4" /> Needs Fix</span>
                ) : (
                  <span className="text-gray-500">Unchecked</span>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Contact Status</span>
              <p className="text-sm font-bold text-indigo-400 capitalize pt-1">
                {lead.status || 'Pending'}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-400" /> Discovered Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-gray-300">
                <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                {lead.website ? (
                  <a href={lead.website} target="_blank" rel="noreferrer" className="hover:underline text-indigo-400 truncate">
                    {lead.website}
                  </a>
                ) : <span className="text-gray-500">No official website listed</span>}
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                {lead.contact_email ? (
                  <span className="text-purple-300">{lead.contact_email}</span>
                ) : <span className="text-gray-500">Email not extracted</span>}
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                {lead.phone ? <span>{lead.phone}</span> : <span className="text-gray-500">No phone number</span>}
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">{lead.search_location || lead.address || 'Global'}</span>
              </div>
            </div>
          </div>

          {/* AI Audit Detailed Assessment */}
          {lead.analysis && (
            <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-4">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Gemini AI Technical & UX Assessment
              </h4>

              {lead.analysis.ux_assessment && (
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase">UX & Design Evaluation</p>
                  <p className="text-xs text-gray-200 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                    {lead.analysis.ux_assessment}
                  </p>
                </div>
              )}

              {lead.analysis.business_insight && (
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Business Opportunity Insight</p>
                  <p className="text-xs text-gray-200 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                    {lead.analysis.business_insight}
                  </p>
                </div>
              )}

              {/* Detected Tech Stack Tags */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-indigo-400" /> Detected Tech Stack & Frameworks
                </p>
                <div className="flex flex-wrap gap-2">
                  {(lead.analysis.tech_stack || []).map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 flex items-center gap-2 transition-all border border-white/10"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReAnalyze}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white flex items-center gap-2 transition-all border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Re-Analyze with AI
            </button>
            <button
              onClick={() => {
                onClose();
                onSelectLeadForOutreach(lead);
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-xs text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Wand2 className="w-4 h-4" /> Open Marketing Outreach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
