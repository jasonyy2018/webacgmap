'use client';

import React, { useState, useEffect } from 'react';
import { 
  Inbox, MessageSquare, Sparkles, CheckCircle2, Clock, 
  ExternalLink, Mail, ArrowRight, ArrowLeft, RefreshCw, Send, Check, 
  Copy, Flame, Calendar, AlertTriangle, ShieldCheck, UserCheck,
  Globe, HelpCircle, Filter, Zap, Terminal, ChevronRight, Layers
} from 'lucide-react';
import { LeadReply, ReplySentiment } from '@/lib/types';

interface InboundInboxProps {
  onRefreshLeads: () => void;
  onSelectLeadForOutreach?: (leadId: number) => void;
}

export default function InboundInbox({ onRefreshLeads, onSelectLeadForOutreach }: InboundInboxProps) {
  const [replies, setReplies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReply, setSelectedReply] = useState<any | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [filterSentiment, setFilterSentiment] = useState<'ALL' | ReplySentiment>('ALL');
  const [filterSource, setFilterSource] = useState<'ALL' | 'web_contact' | 'direct_email' | 'website_inquiry'>('ALL');
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'detail'>('list');

  // Simulation test states
  const [showSimModal, setShowSimModal] = useState(false);
  const [simType, setSimType] = useState<'email' | 'contact_form' | 'webhook_docs'>('email');
  const [testEmail, setTestEmail] = useState('dave@austinroofing.com');
  const [testName, setTestName] = useState('Dave Miller');
  const [testSubject, setTestSubject] = useState('Inquiry: Requesting Website Redesign Proposal');
  const [testContent, setTestContent] = useState('Hi Jason, we came across your work and want to modernize our local contracting website. What is your typical timeline and how much does a Next.js rebuild cost?');
  const [testCategory, setTestCategory] = useState<'CONSULTATION' | 'FEEDBACK' | 'QUOTATION'>('CONSULTATION');
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchReplies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/replies');
      if (res.ok) {
        const data = await res.json();
        setReplies(data);
        if (data.length > 0 && !selectedReply) {
          setSelectedReply(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch replies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, []);

  const handleMarkAsRead = async (replyId: number) => {
    try {
      await fetch('/api/replies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: replyId, is_read: true })
      });
      setReplies(prev => prev.map(r => r.id === replyId ? { ...r, is_read: true } : r));
      if (selectedReply?.id === replyId) {
        setSelectedReply((prev: any) => ({ ...prev, is_read: true }));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testContent) return;
    setIsSimulating(true);

    try {
      if (simType === 'email') {
        const res = await fetch('/api/inbound/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'jyu@wisdomitc.com',
            from_email: testEmail,
            from_name: testName,
            subject: testSubject,
            content: testContent,
            type: testCategory,
            source: 'direct_email'
          })
        });
        const data = await res.json();
        if (res.ok) {
          alert('✅ 成功模拟外部邮件投递至 jyu@wisdomitc.com！系统已完成 AI 意向分析并归档。');
          await fetchReplies();
          onRefreshLeads();
          setShowSimModal(false);
        } else {
          alert(`模拟发信失败: ${data.error}`);
        }
      } else {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: testName,
            email: testEmail,
            phone: '+1 (380) 218-4573',
            category: testCategory,
            message: testContent
          })
        });
        const data = await res.json();
        if (res.ok) {
          alert('✅ 成功模拟官网 Contact Us 在线提交！已实时推送到后台控制台。');
          await fetchReplies();
          onRefreshLeads();
          setShowSimModal(false);
        } else {
          alert(`提交失败: ${data.error}`);
        }
      }
    } catch (e: any) {
      alert(`测试异常: ${e.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const applyPreset = (preset: 'quote' | 'feedback' | 'booking') => {
    if (preset === 'quote') {
      setTestCategory('QUOTATION');
      setTestSubject('Requesting Quote for Multi-location Medical Group Web Overhaul');
      setTestContent('Hi Jason, we manage 3 chiropractic clinics in Texas. Our current WordPress site is slow and outdated. Could we get a quotation for a modern Next.js overhaul and online booking integration?');
    } else if (preset === 'feedback') {
      setTestCategory('FEEDBACK');
      setTestSubject('Feedback regarding website navigation on tablet devices');
      setTestContent('Hi Nexora team, I really like your 3D Hero and ROI calculator. One small suggestion: on iPad Safari the sticky button sometimes overlaps with the cookies banner. Otherwise the design is top-notch!');
    } else {
      setTestCategory('CONSULTATION');
      setTestSubject('Request a 15-min discovery call this Thursday');
      setTestContent('Hello! We received your audit proposal regarding our mobile conversion rate. We are free this Thursday at 2 PM CST for a quick walkthrough. What is your Zoom link?');
    }
  };

  const handleOpenDefaultMailReply = (reply: any) => {
    const toEmail = reply.from_email || reply.lead?.contact_email;
    const subject = reply.subject ? `Re: ${reply.subject.replace(/^Re:\s*/i, '')}` : `Re: Web Modernization Proposal`;
    const body = reply.ai_suggested_reply || 'Hi,\n\nThank you for getting back to me!';
    const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?cc=jyu@wisdomitc.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleOpenGmailReply = (reply: any) => {
    const toEmail = reply.from_email || reply.lead?.contact_email;
    const subject = reply.subject ? `Re: ${reply.subject.replace(/^Re:\s*/i, '')}` : `Re: Web Modernization Proposal`;
    const body = reply.ai_suggested_reply || 'Hi,\n\nThank you for getting back to me!';
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'FEEDBACK':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-teal-400" />
            💬 体验与功能反馈
          </span>
        );
      case 'CONSULTATION':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            <Zap className="w-3 h-3 text-indigo-400" />
            💼 业务建站咨询
          </span>
        );
      case 'INTERESTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            🔥 高意向询盘 (Interested)
          </span>
        );
      case 'BOOKING_REQUEST':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-400" />
            📅 预约会议 (Booking Request)
          </span>
        );
      case 'OBJECTION':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-blue-400" />
            💡 疑虑/顾虑 (Objection)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-300 border border-white/10">
            暂无意向 (Not Interested)
          </span>
        );
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'web_contact':
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 flex items-center gap-1">
            <Globe className="w-2.5 h-2.5 text-indigo-400" />
            官网 Contact Us
          </span>
        );
      case 'direct_email':
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
            <Mail className="w-2.5 h-2.5 text-emerald-400" />
            jyu@wisdomitc.com 直投
          </span>
        );
      case 'website_inquiry':
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25 flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-purple-400" />
            60s 极速诊断
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono text-gray-400 border border-white/10 uppercase">
            {source || 'INBOUND'}
          </span>
        );
    }
  };

  const filteredReplies = replies.filter(r => {
    if (filterSentiment !== 'ALL' && r.sentiment !== filterSentiment) return false;
    if (filterSource !== 'ALL' && r.source !== filterSource) return false;
    return true;
  });

  const unreadCount = replies.filter(r => !r.is_read).length;

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Top Mailbox Status Header Banner */}
      <div className="shrink-0 p-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#0a0e1a] via-[#0d1326] to-[#0a0e1a] border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">官方业务直收邮箱:</span>
              <span className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                jyu@wisdomitc.com
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Webhook 实时监听中
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              已打通官网 Contact Us 在线表单与外部邮箱直接投递，所有咨询与反馈由 AI 实时归档并提炼诉求。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold font-mono">
              {unreadCount} 条待处理
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowSimModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>模拟客户来信 / Webhook配置</span>
          </button>
          <button
            type="button"
            onClick={fetchReplies}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="刷新收件箱"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Left List of Inbound Messages */}
        <div className={`w-full lg:w-80 xl:w-96 shrink-0 h-full flex-col bg-[#0a0e17] border border-white/10 rounded-2xl p-3 overflow-hidden shadow-xl ${
          mobileViewMode === 'detail' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Header & Source Filter Tabs */}
          <div className="shrink-0 space-y-2 border-b border-white/5 pb-2.5 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5 text-indigo-400" />
                <span>收信列表 ({filteredReplies.length})</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">按接收时间倒序</span>
            </div>

            {/* Source Channel Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-black/60 border border-white/5 rounded-xl text-[10px] font-bold text-center">
              <button
                type="button"
                onClick={() => setFilterSource('ALL')}
                className={`py-1 rounded-lg transition-all ${filterSource === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                全部
              </button>
              <button
                type="button"
                onClick={() => setFilterSource('web_contact')}
                className={`py-1 rounded-lg transition-all ${filterSource === 'web_contact' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                官网表单
              </button>
              <button
                type="button"
                onClick={() => setFilterSource('direct_email')}
                className={`py-1 rounded-lg transition-all ${filterSource === 'direct_email' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                邮箱直投
              </button>
              <button
                type="button"
                onClick={() => setFilterSource('website_inquiry')}
                className={`py-1 rounded-lg transition-all ${filterSource === 'website_inquiry' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                60s诊断
              </button>
            </div>

            {/* Sentiment Filter Pills */}
            <div className="flex flex-wrap gap-1 text-[10px] pt-1">
              {(['ALL', 'CONSULTATION', 'FEEDBACK', 'INTERESTED', 'BOOKING_REQUEST'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterSentiment(s)}
                  className={`px-2 py-0.5 rounded-full border transition-all ${
                    filterSentiment === s 
                      ? 'bg-white/10 text-white border-white/30 font-bold' 
                      : 'text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  {s === 'ALL' ? '全部意向' : s === 'CONSULTATION' ? '💼 咨询' : s === 'FEEDBACK' ? '💬 反馈' : s === 'INTERESTED' ? '🔥 高意向' : '📅 约演示'}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Inbound Messages List */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredReplies.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl">
                <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs text-slate-400">当前分类暂无客户留言</p>
                <p className="text-[10px] text-slate-500 mt-1">您可点击右上角进行发信模拟或等待客户互动</p>
              </div>
            ) : (
              filteredReplies.map((r) => {
                const isSelected = selectedReply?.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedReply(r);
                      setMobileViewMode('detail');
                      if (!r.is_read) handleMarkAsRead(r.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-white truncate flex-1">
                        {r.lead?.name || r.from_name || 'Business Client'}
                      </span>
                      {!r.is_read && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="未读"></span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-1 mb-1 font-medium">
                      {r.subject || r.content}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                      <span className="text-indigo-300 font-mono truncate">{r.from_email}</span>
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="pt-1.5 border-t border-white/5 flex items-center justify-between gap-1">
                      {getSentimentBadge(r.sentiment)}
                      {getSourceBadge(r.source)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail & AI Action Studio */}
        {selectedReply ? (
          <div className={`flex-1 h-full flex-col bg-[#0b0f19] border border-white/10 rounded-2xl overflow-hidden shadow-2xl ${
            mobileViewMode === 'list' ? 'hidden lg:flex' : 'flex'
          }`}>
            {/* Mobile Back Button */}
            <div className="lg:hidden px-4 pt-3 pb-1 border-b border-white/5 bg-black/40 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMobileViewMode('list')}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>返回收信列表</span>
              </button>
              <span className="text-[11px] text-gray-400 truncate max-w-[180px]">
                {selectedReply.lead?.name || selectedReply.from_name}
              </span>
            </div>

            {/* Header */}
            <div className="shrink-0 p-4 px-6 bg-gradient-to-r from-indigo-950/60 via-purple-950/30 to-black border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selectedReply.lead?.name || selectedReply.from_name}</h3>
                  {getSentimentBadge(selectedReply.sentiment)}
                  {getSourceBadge(selectedReply.source)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  发件人: <span className="text-indigo-300 font-mono font-medium">{selectedReply.from_email}</span> &bull; 
                  接收邮箱: <span className="text-white font-mono">jyu@wisdomitc.com</span> &bull; 
                  收到时间: {new Date(selectedReply.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDefaultMailReply(selectedReply)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                  title="使用本机默认邮件客户端以 jyu@wisdomitc.com 身份回复"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>以 jyu@wisdomitc.com 回复</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenGmailReply(selectedReply)}
                  className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="在网页版 Gmail 中一键回复"
                >
                  <span>在 Gmail 中打开</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* AI Executive Summary Box */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI 意向与核心诉求提炼 (Executive Intent & Feedback Summary)
                </span>
                <p className="text-xs md:text-sm text-white font-medium leading-relaxed">
                  {selectedReply.ai_summary || '客户发起了建站咨询或体验反馈，正在整理诉求。'}
                </p>
              </div>

              {/* Original Inbound Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    客户来信 / 咨询原文 (Raw Inbound Message)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Subject: {selectedReply.subject || 'No Subject'}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedReply.content}
                </div>
              </div>

              {/* AI Suggested Reply Draft */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AI 智能拟定专业回复 (Suggested Reply from Jason Yu / jyu@wisdomitc.com)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedReply.ai_suggested_reply) {
                        navigator.clipboard.writeText(selectedReply.ai_suggested_reply);
                        setCopiedDraft(true);
                        setTimeout(() => setCopiedDraft(false), 2000);
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDraft ? '已复制话术' : '复制回复话术'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/20 text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {selectedReply.ai_suggested_reply || '正在生成智能回复建议...'}
                </div>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="shrink-0 p-4 px-6 bg-[#080c14] border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>客户档案与意向已同步至看板，状态: <strong className="text-white uppercase font-mono">{selectedReply.lead?.status || 'replied'}</strong></span>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenDefaultMailReply(selectedReply)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>调起邮件客户端发送回复</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-2xl border-dashed text-center">
            <Inbox className="w-10 h-10 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-white mb-1.5">选择一条客户咨询或反馈查看详情</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              当官网收到 Contact Us 留言或邮箱 jyu@wisdomitc.com 收到外部投递时，系统自动完成意向解析并提供一键跟进方案。
            </p>
          </div>
        )}
      </div>

      {/* Simulation & Webhook Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0b0f19] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>邮箱投递模拟与 Webhook 对接指南</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  官方邮箱: <span className="text-indigo-300 font-mono font-bold">jyu@wisdomitc.com</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-black/60 border border-white/10 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSimType('email')}
                className={`py-2 rounded-lg transition-all ${simType === 'email' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                📧 模拟发信到官方邮箱
              </button>
              <button
                type="button"
                onClick={() => setSimType('contact_form')}
                className={`py-2 rounded-lg transition-all ${simType === 'contact_form' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                🌐 模拟官网 Contact Us
              </button>
              <button
                type="button"
                onClick={() => setSimType('webhook_docs')}
                className={`py-2 rounded-lg transition-all ${simType === 'webhook_docs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                ⚙️ Webhook 生产对接
              </button>
            </div>

            {simType === 'webhook_docs' ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span>Inbound Webhook 接收端点</span>
                  </h4>
                  <div className="p-3 bg-black/80 rounded-xl font-mono text-emerald-400 break-all border border-white/10">
                    POST /api/inbound/email
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    任何邮件服务商（SendGrid Inbound Parse, Cloudflare Email Routing, Postmark, AWS SES, Zapier）将收到的发往 <strong className="text-white">jyu@wisdomitc.com</strong> 的邮件转送至上述接口，系统将自动录入数据库并由 AI 意向分析引擎即时归档。
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <span className="font-bold text-white block">支持的标准 Payload 结构:</span>
                  <pre className="p-3 bg-black/80 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto">
{`{
  "to": "jyu@wisdomitc.com",
  "from_email": "customer@company.com",
  "from_name": "Customer Name",
  "subject": "Website Inquiry / Feedback",
  "content": "Message body text...",
  "type": "inquiry" | "feedback" | "quotation"
}`}
                  </pre>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSimulateInbound} className="space-y-4">
                {/* Presets Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">快速套用测试用例:</span>
                  <button
                    type="button"
                    onClick={() => applyPreset('quote')}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px]"
                  >
                    💼 咨询项目报价
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('feedback')}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px]"
                  >
                    💬 提出体验反馈
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('booking')}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px]"
                  >
                    📅 预约演示会议
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">发件人姓名</label>
                    <input
                      type="text"
                      required
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">发件人邮箱</label>
                    <input
                      type="email"
                      required
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                    />
                  </div>
                </div>

                {simType === 'email' && (
                  <div className="text-xs">
                    <label className="text-slate-300 font-bold block mb-1">邮件主题 (Subject)</label>
                    <input
                      type="text"
                      required
                      value={testSubject}
                      onChange={(e) => setTestSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-sans"
                    />
                  </div>
                )}

                <div className="text-xs">
                  <label className="text-slate-300 font-bold block mb-1">邮件或表单详细内容</label>
                  <textarea
                    rows={4}
                    required
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white leading-relaxed font-sans"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSimModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSimulating}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSimulating ? (
                      <span>AI 正在分析并录入...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>立即发送测试来信</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
