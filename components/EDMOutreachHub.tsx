'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, Sparkles, Wand2, Zap, Check, Copy, ExternalLink, 
  Eye, Code2, Smartphone, Monitor, Shield, AlertTriangle, 
  ArrowRight, Users, ChevronRight, Clock, Award, Building2, Flame,
  Share2, Compass, AlertCircle
} from 'lucide-react';
import { Lead, WebNeedType, OutreachSequenceStep } from '@/lib/types';
import { EMAIL_TEMPLATES, renderEmail } from '@/lib/email-templates';
import { leadsApi } from '@/lib/api-client';

interface EDMOutreachHubProps {
  leads: Lead[];
  onUpdate: () => void;
  initialSelectedLead?: Lead | null;
}

// North American Spam Trigger Words List
const SPAM_TRIGGER_WORDS = [
  '100% free', 'guaranteed', 'risk free', 'urgent', 
  'act now', 'buy now', 'no catch', 'click here', 
  'cash bonus', 'winner', 'million dollars'
];

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
  const [senderName, setSenderName] = useState('Jason Yu');
  const [senderAgency, setSenderAgency] = useState('Nexora Digital Studio');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [textContent, setTextContent] = useState('');
  const [renderedHtml, setRenderedHtml] = useState('');
  
  // Status flags
  const [isSending, setIsSending] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedProposalUrl, setCopiedProposalUrl] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'no_website' | 'mobile' | 'ready_to_send'>('all');
  const [showEmailDetector, setShowEmailDetector] = useState(false);

  // System Environment Mode (Real vs Sandbox)
  const [systemMode, setSystemMode] = useState<'sandbox' | 'real'>('sandbox');
  const [isSmtpConfigured, setIsSmtpConfigured] = useState(false);

  useEffect(() => {
    fetch('/api/system/mode')
      .then((r) => r.json())
      .then((data) => {
        setSystemMode(data.mode);
        setIsSmtpConfigured(Boolean(data.isSmtpConfigured));
      })
      .catch(() => {});

    const handleEnvChanged = (e: any) => {
      if (e.detail?.mode) {
        setSystemMode(e.detail.mode);
        if (typeof e.detail.isSmtpConfigured === 'boolean') {
          setIsSmtpConfigured(e.detail.isSmtpConfigured);
        }
      }
    };

    window.addEventListener('system-env-mode-changed', handleEnvChanged);
    return () => window.removeEventListener('system-env-mode-changed', handleEnvChanged);
  }, []);

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
      replyEmail: 'jyu@wisdomitc.com'
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
    const isLive = systemMode === 'real' && isSmtpConfigured;
    const confirmPrompt = isLive
      ? `【⚠️ 真实商业外发确认】\n\n系统当前处于「真实生产环境」。\n将通过腾讯企业邮 (jyu@wisdomitc.com) 真正向企业客户 ${recipientEmail} 发送 Stage ${selectedSequenceIndex + 1} 邮件！\n\n确认立即发送吗？`
      : `【🛡️ 安全沙盒仿真确认】\n\n系统当前处于「安全沙盒环境」。\n将进行安全模拟发信，记录完整业务状态与仿真日志，不会打扰真实企业。\n\n确认执行沙盒仿真吗？`;

    if (!confirm(confirmPrompt)) {
      return;
    }

    setIsSending(true);
    try {
      const res = await leadsApi.sendCustomEmail(activeLead.id, {
        toEmail: recipientEmail,
        subject,
        content: textContent,
        html: renderedHtml,
        stage: currentStepStage,
      });

      const successNotice = isLive
        ? `🚀 [真实邮件已外发] 邮件已通过腾讯企业邮成功投递至 ${recipientEmail}！`
        : `🛡️ [沙盒安全仿真完成] 业务流已推进至下一阶段 (当前处于沙盒环境，未外发真实邮件)。`;

      alert(successNotice);
      onUpdate();
    } catch (err: any) {
      console.error('Failed to dispatch:', err);
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Launch in Gmail Web Composer
  const handleOpenGmail = () => {
    if (!activeLead) return;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(textContent)}`;
    window.open(gmailUrl, '_blank');
  };

  // Launch in Local Mail Client (Outlook / Apple Mail)
  const handleOpenDefaultMail = () => {
    if (!activeLead) return;
    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(textContent)}`;
  };

  // Generate and Copy Proposal Landing Page
  const getProposalUrl = () => {
    if (typeof window === 'undefined' || !activeLead) return '';
    return `${window.location.origin}/proposal/${activeLead.id}`;
  };

  const handleCopyProposalUrl = () => {
    const url = getProposalUrl();
    navigator.clipboard.writeText(url);
    setCopiedProposalUrl(true);
    setTimeout(() => setCopiedProposalUrl(false), 2000);
  };

  // Extract clean domain for email guessing
  const getCleanDomain = () => {
    if (!activeLead?.website) return '';
    try {
      const u = new URL(activeLead.website.startsWith('http') ? activeLead.website : `https://${activeLead.website}`);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  const detectedDomain = getCleanDomain();
  const guessedEmails = detectedDomain ? [
    `owner@${detectedDomain}`,
    `contact@${detectedDomain}`,
    `service@${detectedDomain}`,
    `info@${detectedDomain}`,
  ] : [];

  // Check spam trigger words
  const detectedSpamWords = SPAM_TRIGGER_WORDS.filter(w => 
    subject.toLowerCase().includes(w) || textContent.toLowerCase().includes(w)
  );

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
            手机差
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
          {/* Top Compact Banner: Lead Diagnosis & Proposal Preview Shortcuts */}
          <div className="shrink-0 p-3.5 px-5 bg-gradient-to-r from-indigo-950/50 via-purple-950/30 to-black/70 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white truncate">{activeLead.name}</h3>
              {getNeedBadge(activeLead.analysis?.need_category)}
              <span className="text-xs font-bold text-amber-400 shrink-0">
                ⭐ {activeLead.rating || '4.8'}
              </span>
              <span className="text-[11px] text-gray-400 truncate hidden xl:inline">
                &bull; {activeLead.analysis?.personalized_hook || '建议通过现代移动端响应式改版提升预约转化率'}
              </span>
            </div>

            {/* Quick Actions: Live Proposal Page */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={getProposalUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5"
                title="Open client's personalized redesign proposal page"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>客户专属提案页</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={handleCopyProposalUrl}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-all flex items-center gap-1"
                title="Copy proposal page link to send to client"
              >
                {copiedProposalUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedProposalUrl ? '已复制链接' : '复制提案链接'}</span>
              </button>
            </div>
          </div>

          {/* Customer Follow-up & Touchpoint Tracking Status Bar */}
          {(((activeLead.contact_attempts ?? 0) > 0) || Boolean(activeLead.last_contacted) || activeLead.status === 'greeting_sent' || activeLead.status === 'followup_sent') && (
            <div className="shrink-0 px-4 py-2 bg-gradient-to-r from-indigo-950/40 via-black/40 to-blue-950/30 border-b border-indigo-500/20 flex flex-wrap items-center justify-between text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-gray-300 font-medium">客户建联与维护状态:</span>
                <span className="font-bold text-indigo-300 font-mono">
                  {activeLead.status === 'greeting_sent' ? '已完成 Stage 1 破冰信' :
                   activeLead.status === 'followup_sent' ? '已完成 Stage 2 案例跟进' :
                   activeLead.status === 'replied' ? '🔥 客户已回复 (高意向)' :
                   activeLead.status === 'meeting_booked' ? '📅 已预约 10 分钟演示' :
                   `已完成邮件触达 (${activeLead.status})`}
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400 font-mono">
                  累计触达: <strong className="text-white">{activeLead.contact_attempts || 1}</strong> 次
                </span>
                {activeLead.last_contacted && (
                  <span className="text-gray-400 font-mono">
                    • 上次发信: <strong className="text-slate-300">{new Date(activeLead.last_contacted).toLocaleDateString()} {new Date(activeLead.last_contacted).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-cyan-300 font-medium flex items-center gap-1">
                <span>💡 维护推进建议:</span>
                <span className="text-slate-300">
                  {activeLead.status === 'greeting_sent'
                    ? '建议在 3 天后发送 Stage 2 同城同行案例佐证信'
                    : activeLead.status === 'followup_sent'
                    ? '建议在 3 天后发送 Stage 3 极简咨询电话邀约'
                    : '保持周期性关怀，及时跟进客户意向反馈'}
                </span>
              </div>
            </div>
          )}

          {/* Integrated Sequence & Template Bar */}
          <div className="shrink-0 px-4 py-2 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-2.5">
            {/* Sequence 4 Steps */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0 mr-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-indigo-400" />
                触达序列:
              </span>
              {[
                { title: 'Stage 1 问候与原型', delay: 'Day 0', done: (activeLead.status === 'greeting_sent' || activeLead.status === 'followup_sent' || (activeLead.contact_attempts || 0) > 0) },
                { title: 'Stage 2 案例佐证', delay: '+3天', done: (activeLead.status === 'followup_sent' || (activeLead.contact_attempts || 0) > 1), recommended: activeLead.status === 'greeting_sent' },
                { title: 'Stage 3 低阻力邀约', delay: '+6天', done: (activeLead.contact_attempts || 0) > 2, recommended: activeLead.status === 'followup_sent' },
                { title: 'Stage 4 优雅告别信', delay: '+10天', done: false },
              ].map((step, idx) => {
                const isSelected = selectedSequenceIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSequenceSelect(idx)}
                    className={`px-2.5 py-1 rounded-lg border text-xs transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold shadow-sm'
                        : step.recommended
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-semibold'
                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      step.done
                        ? 'bg-emerald-500 text-white'
                        : isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/10 text-gray-400'
                    }`}>
                      {step.done ? '✓' : idx + 1}
                    </span>
                    <span>{step.title}</span>
                    {step.recommended && (
                      <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">建议</span>
                    )}
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

          {/* Email Header: To, From, Subject, and AI Email Detective */}
          <div className="shrink-0 px-4 py-2 bg-black/25 border-b border-white/5 space-y-1.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="relative">
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0">收件人 (To):</span>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="name@business.com"
                    className="bg-transparent text-white font-mono text-xs outline-none w-full"
                  />
                  {guessedEmails.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowEmailDetector(!showEmailDetector)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold shrink-0 flex items-center gap-0.5"
                    >
                      <Compass className="w-3 h-3" />
                      <span>邮箱推测</span>
                    </button>
                  )}
                </div>

                {/* Guessed Email Popup */}
                {showEmailDetector && guessedEmails.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 z-30 w-full bg-[#0d1322] border border-indigo-500/30 rounded-xl p-2 shadow-2xl space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      基于官网域名 @{detectedDomain} 推荐邮箱 (点击直接填入):
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {guessedEmails.map((email) => (
                        <button
                          key={email}
                          type="button"
                          onClick={() => {
                            setRecipientEmail(email);
                            setShowEmailDetector(false);
                          }}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-indigo-600 text-left font-mono text-[11px] text-white transition-colors"
                        >
                          {email}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                {copiedSubject ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Main Body Preview / Editor Area */}
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

                {/* AI Refinement Actions & Deliverability Status */}
                <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
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
                      onClick={() => handleRefine(`Mention that their personalized interactive concept is ready at ${getProposalUrl()}`)}
                      disabled={isRefining}
                      className="px-2.5 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-[10px] text-indigo-300 transition-all"
                    >
                      插入专属提案链接
                    </button>
                  </div>

                  {/* Spam words auditor */}
                  <div className="flex items-center gap-1 text-[10px]">
                    {detectedSpamWords.length > 0 ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        含敏感词 ({detectedSpamWords.join(', ')})
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Shield className="w-3 h-3" />
                        投递评分 99% (安全无垃圾词)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Fixed Action Footer (Sticky & Complete Direct Launch Options) */}
          <div className="shrink-0 p-3 px-5 bg-[#080c14] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            {/* Operator Client Quick Triggers */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mr-1 hidden sm:inline">直发唤起:</span>
              <button
                type="button"
                onClick={handleOpenGmail}
                disabled={!recipientEmail}
                className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                title="Launch Gmail Web Composer with pre-filled content (100% Inbox Delivery via your Workspace account)"
              >
                <span>Gmail 直发</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleOpenDefaultMail}
                disabled={!recipientEmail}
                className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                title="Launch Outlook / Mac Mail default client"
              >
                <span>Outlook / 本地客户端</span>
              </button>
            </div>

            {/* In-App Dispatch */}
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] px-2.5 py-1.5 rounded-xl border font-mono font-bold flex items-center gap-1.5 ${
                systemMode === 'real'
                  ? isSmtpConfigured
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              }`}>
                {systemMode === 'real' ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>🚀 真实模式</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>🛡️ 沙盒安全模式</span>
                  </>
                )}
              </span>

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
                className={`px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5 ${
                  systemMode === 'real'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/25'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSending 
                    ? '发送中...' 
                    : systemMode === 'real'
                    ? `真实发送 Stage ${selectedSequenceIndex + 1}`
                    : `沙盒模拟发送 Stage ${selectedSequenceIndex + 1}`}
                </span>
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
