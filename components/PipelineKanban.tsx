'use client';

import React, { useState } from 'react';
import { 
  Users, Mail, CheckCircle2, MessageSquare, Calendar, Trophy, 
  ArrowRight, Sparkles, ExternalLink, Globe, AlertCircle, Phone, MapPin,
  Clock, FileText, Send, AlertTriangle 
} from 'lucide-react';
import { Lead } from '@/lib/types';
import { leadsApi } from '@/lib/api-client';

interface PipelineKanbanProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdate: () => void;
}

interface ColumnDef {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  badgeBg: string;
  borderColor: string;
  matcher: (lead: Lead) => boolean;
}

export default function PipelineKanban({ leads, onSelectLead, onUpdate }: PipelineKanbanProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const columns: ColumnDef[] = [
    {
      id: 'audited',
      title: 'Audited Leads',
      subtitle: 'AI 诊断完成 / 待触达',
      icon: Sparkles,
      color: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-400',
      borderColor: 'border-indigo-500/20',
      matcher: (l) => l.status !== 'bounced' && l.email_status !== 'bounced' && l.ai_status === 'completed' && (!l.status || l.status === 'analyzed' || l.status === 'pending')
    },
    {
      id: 'greeting_sent',
      title: 'Stage 1: Greeting Sent',
      subtitle: '已发初次问候与免费原型',
      icon: Mail,
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-400',
      borderColor: 'border-cyan-500/20',
      matcher: (l) => l.status !== 'bounced' && l.email_status !== 'bounced' && (l.status === 'greeting_sent' || (l.status === 'contacted' && (l.contact_attempts || 0) === 1))
    },
    {
      id: 'followup_sent',
      title: 'Stage 2: Follow-up',
      subtitle: '发送行业案例与改版方案',
      icon: ArrowRight,
      color: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-400',
      borderColor: 'border-blue-500/20',
      matcher: (l) => l.status !== 'bounced' && l.email_status !== 'bounced' && (l.status === 'followup_sent' || (l.status === 'contacted' && (l.contact_attempts || 0) > 1))
    },
    {
      id: 'replied',
      title: 'Replied & Engaged',
      subtitle: '客户回复 / 产生兴趣',
      icon: MessageSquare,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-400',
      borderColor: 'border-amber-500/20',
      matcher: (l) => l.status === 'replied'
    },
    {
      id: 'meeting_booked',
      title: 'Meeting Booked',
      subtitle: '预约 10 分钟原型演示',
      icon: Calendar,
      color: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 text-purple-400',
      borderColor: 'border-purple-500/20',
      matcher: (l) => l.status === 'meeting_booked'
    },
    {
      id: 'closed_won',
      title: 'Deal Won',
      subtitle: '成功签约网站建设',
      icon: Trophy,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400',
      borderColor: 'border-emerald-500/20',
      matcher: (l) => l.status === 'closed_won'
    },
    {
      id: 'bounced',
      title: 'Bounced / Quarantined',
      subtitle: '退信死信 / 邮箱不存在隔离',
      icon: AlertTriangle,
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-400',
      borderColor: 'border-rose-500/20',
      matcher: (l) => l.status === 'bounced' || l.email_status === 'bounced' || l.email_status === 'invalid_domain'
    }
  ];

  const handleStageChange = async (leadId: number, newStatus: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    setUpdatingId(leadId);
    try {
      await leadsApi.updateLead(leadId, { status: newStatus });
      onUpdate();
    } catch (err) {
      console.error('Failed to change stage:', err);
      alert('Failed to update stage');
    } finally {
      setUpdatingId(null);
    }
  };

  const getUrgencyBadge = (lead: Lead) => {
    const need = lead.analysis?.need_category;
    if (need === 'NO_WEBSITE') {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">无官网</span>;
    }
    if (need === 'MOBILE_UNFRIENDLY') {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">手机端差</span>;
    }
    if (need === 'LEGACY_TECH_DEBT') {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 shrink-0">老旧慢速</span>;
    }
    return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">需重构</span>;
  };

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Compact Top Value Banner */}
      <div className="shrink-0 flex flex-wrap items-center justify-between p-3 px-4 sm:px-5 rounded-2xl bg-white/[0.03] border border-white/10 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
              North America Cold-to-Trust Pipeline
            </h3>
            <p className="text-[10px] sm:text-[11px] text-gray-400">
              从 Google 陌生客户发掘，到建立信任、预约原型演示与签约的全链路漏斗
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="text-gray-400 mr-1.5">客户总数:</span>
            <span className="font-bold text-white font-mono">{leads.length}</span>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="text-emerald-400 mr-1.5">已签约:</span>
            <span className="font-bold text-emerald-400 font-mono">
              {leads.filter(l => l.status === 'closed_won').length}
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="flex-1 min-h-0 flex gap-3.5 overflow-x-auto overflow-y-hidden pb-1 custom-scrollbar snap-x snap-mandatory">
        {columns.map((col) => {
          const colLeads = leads.filter(col.matcher);
          const ColIcon = col.icon;

          return (
            <div 
              key={col.id} 
              className="w-[82vw] sm:w-72 shrink-0 h-full flex flex-col bg-[#0b0f19]/90 border border-white/10 rounded-2xl p-3 overflow-hidden shadow-lg snap-center"
            >
              {/* Column Header */}
              <div className="shrink-0 flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${col.badgeBg}`}>
                    <ColIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{col.title}</h4>
                    <p className="text-[9px] text-gray-400 truncate">{col.subtitle}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-gray-300">
                  {colLeads.length}
                </span>
              </div>

              {/* Cards List (Independently scrollable without overflowing container) */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {colLeads.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl text-center px-2">
                    <p className="text-[11px] text-gray-500">当前阶段暂无客户</p>
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="group p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer space-y-2 relative"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <h5 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 flex-1">
                          {lead.name}
                        </h5>
                        {getUrgencyBadge(lead)}
                      </div>

                      <div className="text-[10px] text-gray-400 space-y-1">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="w-2.5 h-2.5 text-gray-500 shrink-0" />
                          <span className="truncate">{lead.search_location || lead.address || 'North America'}</span>
                        </div>
                        {lead.contact_email ? (
                          <div className="flex items-center gap-1 text-indigo-300 truncate">
                            <Mail className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                            <span className="truncate font-mono">{lead.contact_email}</span>
                          </div>
                        ) : (
                          <div className="text-amber-500/90 flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                            <span>待填邮箱</span>
                          </div>
                        )}

                        {(lead.status === 'bounced' || lead.email_status === 'bounced' || lead.email_status === 'invalid_domain') && (
                          <div className="text-[9px] text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded px-1.5 py-0.5 flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                            <span className="truncate">{lead.bounce_reason || '退信/死信已隔离'}</span>
                          </div>
                        )}

                        {/* Contact attempts & Last Contacted time */}
                        {(((lead.contact_attempts ?? 0) > 0) || Boolean(lead.last_contacted)) && (
                          <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono pt-0.5">
                            <span className="text-cyan-300 font-bold">
                              已触达 {lead.contact_attempts || 1} 次
                            </span>
                            {lead.last_contacted && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-gray-500" />
                                <span>{new Date(lead.last_contacted).toLocaleDateString()}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Score and Rating */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                        <span className="text-amber-400 font-bold">⭐ {lead.rating || '4.8'}</span>
                        <span className="text-indigo-400 font-bold font-mono">
                          需求分: {lead.ai_score || 85}
                        </span>
                      </div>

                      {/* Stage Selector */}
                      <div className="pt-1">
                        <select
                          value={lead.status}
                          disabled={updatingId === lead.id}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStageChange(lead.id, e.target.value, e)}
                          className="w-full bg-black/70 border border-white/10 rounded-lg text-[10px] px-2 py-1 text-gray-300 outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="analyzed">待触达 (Audited)</option>
                          <option value="greeting_sent">已发首封 (Greeting)</option>
                          <option value="followup_sent">案例跟进 (Follow-up)</option>
                          <option value="replied">客户已回复 (Replied)</option>
                          <option value="meeting_booked">已预约演示 (Meeting)</option>
                          <option value="closed_won">签约成交 (Won)</option>
                          <option value="bounced">❌ 退信死信 (Bounced)</option>
                          <option value="ignored">归档关闭 (Ignore)</option>
                        </select>
                      </div>

                      {/* Quick Action Bar */}
                      <div className="flex items-center justify-between gap-1.5 pt-1">
                        <a
                          href={`/proposal/${lead.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 py-1 px-2 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-indigo-300 hover:text-white flex items-center justify-center gap-1 transition-all"
                          title="新窗口预览客户专属 3D 提案"
                        >
                          <FileText className="w-2.5 h-2.5" />
                          <span>提案</span>
                        </a>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className="flex-1 py-1 px-2 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                          title="在 EDM Studio 中打开并推进下一轮跟进信"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>跟进发信</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
