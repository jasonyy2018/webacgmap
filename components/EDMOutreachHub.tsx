'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, Sparkles, Wand2, Zap, Check, Copy, ExternalLink, 
  Eye, Code2, Smartphone, Monitor, Shield, AlertTriangle, 
  ArrowRight, Users, ChevronRight, Clock, Award, Building2, Flame
} from 'lucide-react';
import { Lead, WebNeedType, OutreachSequenceStep } from '@/lib/types';
import { EMAIL_TEMPLATES, renderEmail } from '@/lib/email-templates';
import { leadsApi } from '@/lib/api-client';

interface EDMOutreachHubProps {
  leads: Lead[];
  onUpdate: () => void;
  initialSelectedLead?: Lead | null;
}

export default function EDMOutreachHub({ leads, onUpdate, initialSelectedLead }: EDMOutreachHubProps) {
  const analyzedLeads = leads.filter(l => l.ai_status === 'completed');
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(
    initialSelectedLead?.id || analyzedLeads[0]?.id || null
  );

  const activeLead = leads.find(l => l.id === selectedLeadId) || analyzedLeads[0] || null;

  // Outreach workflow states
  const [selectedSequenceIndex, setSelectedSequenceIndex] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState(EMAIL_TEMPLATES[0].id);
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  
  // Sender and Content states
  const [senderName, setSenderName] = useState('Alex Chen');
  const [senderAgency, setSenderAgency] = useState('ApexWeb Studios (North America)');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [textContent, setTextContent] = useState('');
  const [renderedHtml, setRenderedHtml] = useState('');
  
  // Status flags
  const [isSending, setIsSending] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'no_website' | 'mobile' | 'ready_to_send'>('all');

  // Synchronize when active lead changes
  useEffect(() => {
    if (!activeLead) return;

    setRecipientEmail(activeLead.contact_email || '');
    
    // Check if lead has sequence from AI
    const seq = activeLead.analysis?.email_sequence;
    if (seq && seq.length > 0 && seq[selectedSequenceIndex]) {
      setSubject(seq[selectedSequenceIndex].defaultSubject);
      setTextContent(seq[selectedSequenceIndex].content);
    } else {
      const rendered = renderEmail(selectedTemplateId, activeLead, {
        senderName,
        senderAgency,
      });
      setSubject(rendered.subject);
      setTextContent(rendered.plainText);
    }
  }, [activeLead?.id, selectedSequenceIndex]);

  // Re-render HTML whenever template or active lead changes
  useEffect(() => {
    if (!activeLead) return;
    const rendered = renderEmail(selectedTemplateId, activeLead, {
      senderName,
      senderAgency,
      replyEmail: 'consult@apexweb.dev'
    });
    setRenderedHtml(rendered.html);
  }, [activeLead?.id, selectedTemplateId, senderName, senderAgency]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!activeLead) return;
    const rendered = renderEmail(templateId, activeLead, {
      senderName,
      senderAgency,
    });
    setSubject(rendered.subject);
    setTextContent(rendered.plainText);
    setRenderedHtml(rendered.html);
  };

  const handleSequenceSelect = (index: number) => {
    setSelectedSequenceIndex(index);
    if (!activeLead) return;
    const seq = activeLead.analysis?.email_sequence;
    if (seq && seq[index]) {
      setSubject(seq[index].defaultSubject);
      setTextContent(seq[index].content);
    }
  };

  const handleRefine = async (instruction: string) => {
    if (!activeLead) return;
    setIsRefining(true);
    try {
      const res = await leadsApi.refineEmail(activeLead.id, instruction);
      setTextContent(res.refined_email);
    } catch (e: any) {
      alert(`Refinement failed: ${e.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSendEmail = async () => {
    if (!activeLead) return;
    if (!recipientEmail || !recipientEmail.includes('@')) {
      alert('Please enter a valid recipient email address first.');
      return;
    }

    const currentStepStage = activeLead.analysis?.email_sequence?.[selectedSequenceIndex]?.stage || 'stage_1_greeting';

    if (!confirm(`Confirm dispatching Stage ${selectedSequenceIndex + 1} greeting email to ${recipientEmail}?`)) {
      return;
    }

    setIsSending(true);
    try {
      await leadsApi.sendCustomEmail(activeLead.id, {
        toEmail: recipientEmail,
        subject,
        content: previewMode === 'html' ? renderedHtml : textContent,
        stage: currentStepStage,
      });

      alert(`✅ EDM successfully dispatched to ${activeLead.name}! Pipeline stage has been updated.`);
      onUpdate();
    } catch (err: any) {
      console.error('Failed to dispatch:', err);
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const filteredLeads = analyzedLeads.filter((lead) => {
    if (filterType === 'no_website') return lead.analysis?.need_category === 'NO_WEBSITE';
    if (filterType === 'mobile') return lead.analysis?.need_category === 'MOBILE_UNFRIENDLY';
    if (filterType === 'ready_to_send') return Boolean(lead.contact_email);
    return true;
  });

  const getNeedBadge = (type?: WebNeedType) => {
    switch (type) {
      case 'NO_WEBSITE':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">无独立官网 (95分紧急)</span>;
      case 'MOBILE_UNFRIENDLY':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">手机端体验极差</span>;
      case 'LEGACY_TECH_DEBT':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-orange-500/20 text-orange-300 border border-orange-500/30">技术老旧/无SSL</span>;
      case 'LOW_CONVERSION_DESIGN':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">视觉过时/缺CTA</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">现代常规</span>;
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* Left Column: Leads Selection & Filters */}
      <div className="w-full lg:w-72 xl:w-80 shrink-0 h-full flex flex-col bg-[#0a0e17] border border-white/10 rounded-2xl p-3 overflow-hidden shadow-xl">
        {/* Quick Filter Tabs */}
        <div className="shrink-0 flex p-1 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold mb-2.5">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1 rounded-lg transition-all ${filterType === 'all' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            全部 ({analyzedLeads.length})
          </button>
          <button
            onClick={() => setFilterType('no_website')}
            className={`flex-1 py-1 rounded-lg transition-all ${filterType === 'no_website' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            无官网
          </button>
          <button
            onClick={() => setFilterType('mobile')}
            className={`flex-1 py-1 rounded-lg transition-all ${filterType === 'mobile' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            手机端差
          </button>
        </div>

        {/* Leads Scroll List */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredLeads.length === 0 ? (
            <div className="p-6 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
              <Mail className="w-6 h-6 text-gray-600 mx-auto mb-1.5" />
              <p className="text-[11px] text-gray-500">暂无匹配客户</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const isSelected = lead.id === activeLead?.id;
              return (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-500/15 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <h4 className="text-xs font-bold text-white truncate flex-1">{lead.name}</h4>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 shrink-0">
                      {lead.ai_score || 85}分
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1.5">
                    <span className="truncate">{lead.search_location || 'North America'}</span>
                    <span className="text-amber-400 font-bold shrink-0">⭐ {lead.rating || '4.8'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    {getNeedBadge(lead.analysis?.need_category)}
                    <span className={`text-[9px] font-mono ${lead.contact_email ? 'text-gray-400' : 'text-amber-500'}`}>
                      {lead.contact_email ? '有邮箱' : '需填邮箱'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main EDM Studio Area */}
      {activeLead ? (
        <div className="flex-1 h-full flex flex-col bg-[#0b0f19] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Top Compact Banner: Lead Diagnosis & Urgency Insights */}
          <div className="shrink-0 p-3.5 px-5 bg-gradient-to-r from-indigo-950/50 via-purple-950/30 to-black/70 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white truncate">{activeLead.name}</h3>
              {getNeedBadge(activeLead.analysis?.need_category)}
              <span className="text-xs font-bold text-amber-400 shrink-0">
                ⭐ {activeLead.rating || '4.8'}
              </span>
              <span className="text-[11px] text-gray-400 truncate hidden md:inline">
                &bull; {activeLead.analysis?.personalized_hook || activeLead.analysis?.ux_assessment || '建议通过现代移动端响应式改版提升预约转化率'}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300 font-mono text-[11px]">
                手机分: {activeLead.analysis?.mobile_score || 45}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px]">
                月失客流: ~{activeLead.analysis?.estimated_lost_visitors_monthly || 240}人
              </span>
            </div>
          </div>

          {/* Integrated Sequence & Template Bar (Consolidated & Compact) */}
          <div className="shrink-0 px-4 py-2 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-2.5">
            {/* Sequence 4 Steps */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0 mr-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-indigo-400" />
                触达序列:
              </span>
              {[
                { title: 'Stage 1 问候与原型', delay: 'Day 0' },
                { title: 'Stage 2 案例佐证', delay: '+3天' },
                { title: 'Stage 3 低阻力邀约', delay: '+6天' },
                { title: 'Stage 4 优雅告别信', delay: '+10天' },
              ].map((step, idx) => {
                const isSelected = selectedSequenceIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSequenceSelect(idx)}
                    className={`px-2.5 py-1 rounded-lg border text-xs transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold shadow-sm'
                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-white/10 text-gray-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span>{step.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Template Selector & View Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex gap-1">
                {EMAIL_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleTemplateSelect(tmpl.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      selectedTemplateId === tmpl.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {tmpl.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-black/60 p-0.5 rounded-lg border border-white/10 text-xs">
                <button
                  onClick={() => setPreviewMode('html')}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-bold text-[11px] transition-all ${
                    previewMode === 'html' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>HTML</span>
                </button>
                <button
                  onClick={() => setPreviewMode('text')}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-bold text-[11px] transition-all ${
                    previewMode === 'text' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>纯文本</span>
                </button>
              </div>

              {previewMode === 'html' && (
                <div className="flex bg-black/60 p-0.5 rounded-lg border border-white/10 text-xs">
                  <button
                    onClick={() => setDeviceView('desktop')}
                    className={`p-1 rounded ${deviceView === 'desktop' ? 'bg-white/15 text-white' : 'text-gray-400'}`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDeviceView('mobile')}
                    className={`p-1 rounded ${deviceView === 'mobile' ? 'bg-white/15 text-white' : 'text-gray-400'}`}
                    title="Mobile Viewport Preview"
                  >
                    <Smartphone className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Compact Email Header (To, From, Subject) */}
          <div className="shrink-0 px-4 py-2 bg-black/25 border-b border-white/5 space-y-1.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0">收件人 (To):</span>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="name@business.com (可直接输入或补充)"
                  className="bg-transparent text-white font-mono text-xs outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0">发件身份:</span>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="bg-transparent text-indigo-300 font-medium text-xs outline-none w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0">邮件主题:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-transparent text-white font-medium text-xs outline-none w-full"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(subject);
                  setCopiedSubject(true);
                  setTimeout(() => setCopiedSubject(false), 2000);
                }}
                className="text-gray-400 hover:text-white p-1 rounded shrink-0"
              >
                {copiedSubject ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Main Body Preview / Editor Area (Fully fluid, no clipping) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-black/50 flex justify-center custom-scrollbar">
            {previewMode === 'html' ? (
              <div 
                className={`transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-white h-full flex flex-col ${
                  deviceView === 'mobile' ? 'w-[375px]' : 'w-full max-w-[680px]'
                }`}
              >
                <iframe
                  title="Email HTML Preview"
                  srcDoc={renderedHtml}
                  className="w-full flex-1 min-h-[350px] border-none"
                />
              </div>
            ) : (
              <div className="w-full max-w-3xl flex flex-col gap-2 h-full">
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  disabled={isRefining}
                  className="w-full flex-1 min-h-[280px] p-4 bg-white/[0.03] border border-white/10 rounded-xl text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none font-mono text-xs leading-relaxed"
                />

                {/* AI Refinement Actions */}
                <div className="shrink-0 flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Wand2 className="w-3 h-3 text-indigo-400" />
                    AI 润色:
                  </span>
                  <button
                    onClick={() => handleRefine('Make tone more consultative, professional and executive for North American business owners.')}
                    disabled={isRefining}
                    className="px-2.5 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 transition-all"
                  >
                    顾问级正式
                  </button>
                  <button
                    onClick={() => handleRefine('Make it under 110 words, very direct, focusing strictly on mobile conversion flaws.')}
                    disabled={isRefining}
                    className="px-2.5 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 transition-all"
                  >
                    &lt;110词极简
                  </button>
                  <button
                    onClick={() => handleRefine('Highlight that competitor websites in their city are capturing mobile leads, and offer a free Figma mockup.')}
                    disabled={isRefining}
                    className="px-2.5 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 transition-all"
                  >
                    强调竞争与赠送原型
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Fixed Action Footer (Sticky & 100% visible, never clipped) */}
          <div className="shrink-0 p-3 px-5 bg-[#080c14] border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px]">SPF / DKIM 兼容 &bull; 99% 高投递率优化</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  const contentToCopy = previewMode === 'html' ? renderedHtml : textContent;
                  navigator.clipboard.writeText(contentToCopy);
                  setCopiedContent(true);
                  setTimeout(() => setCopiedContent(false), 2000);
                }}
                className="px-3.5 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold transition-all flex items-center gap-1.5 text-gray-300"
              >
                {copiedContent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>复制邮件代码</span>
              </button>

              <button
                onClick={handleSendEmail}
                disabled={isSending || !recipientEmail}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? '发送中...' : `发送 Stage ${selectedSequenceIndex + 1} 问候邮件`}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-2xl border-dashed text-center">
          <Mail className="w-10 h-10 text-gray-600 mb-3" />
          <h3 className="text-base font-bold text-white mb-1.5">EDM 客户触达中枢待命</h3>
          <p className="text-xs text-gray-400 max-w-sm">
            请从左侧选择已完成 AI 诊断的客户，或前往 Search 界面批量发掘北美中小企业。
          </p>
        </div>
      )}
    </div>
  );
}
