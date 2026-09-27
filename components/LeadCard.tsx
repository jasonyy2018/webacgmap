import React from 'react';
import { 
    ExternalLink, MapPin, Globe, Star, Code, Phone, Mail, 
    Loader2, Sparkles, Wand2, Eye, CheckCircle2, Clock, 
    ArrowRight, Flame, Calendar, Trophy, FileText, AlertTriangle 
} from 'lucide-react';
import type { Lead } from "@/lib/types";
import { leadsApi } from "@/lib/api-client";

interface LeadProps {
    lead: Lead;
    isSelected?: boolean;
    onToggleSelect?: (id: number) => void;
    onSelectLead: (lead: Lead) => void;
    onOpenDetail?: (lead: Lead) => void;
    onUpdate: () => void;
}

const LeadCard: React.FC<LeadProps> = ({ 
    lead, 
    isSelected = false, 
    onToggleSelect, 
    onSelectLead, 
    onOpenDetail,
    onUpdate 
}) => {
    const isBounced = lead.status === 'bounced' || lead.email_status === 'bounced' || lead.email_status === 'invalid_domain';

    const getContactStatusBadge = () => {
        if (isBounced) {
            return (
                <span 
                    title={lead.bounce_reason || '邮箱不存在或已被退信隔离'}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/25 border border-rose-500/50 text-rose-300 flex items-center gap-1 shadow-sm"
                >
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>❌ 退信/死信</span>
                </span>
            );
        }
        if (lead.status === 'greeting_sent') {
            return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>已发 Stage 1 (破冰信)</span>
                </span>
            );
        }
        if (lead.status === 'followup_sent') {
            return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    <span>已发 Stage 2 (案例信)</span>
                </span>
            );
        }
        if (lead.status === 'replied') {
            return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1 animate-pulse">
                    <Flame className="w-3 h-3" />
                    <span>🔥 客户已回复意向</span>
                </span>
            );
        }
        if (lead.status === 'meeting_booked') {
            return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>📅 已预约演示</span>
                </span>
            );
        }
        if (lead.status === 'closed_won') {
            return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    <span>🏆 签约成交</span>
                </span>
            );
        }
        if (lead.status === 'contacted') {
            return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>已完成邮件触达</span>
                </span>
            );
        }
        return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800/80 border border-white/10 text-gray-400">
                待触达建联
            </span>
        );
    };
    const getScoreColor = (score?: number) => {
        if (!score) return 'text-gray-500';
        if (score >= 80) return 'text-emerald-400';
        if (score >= 50) return 'text-amber-400';
        return 'text-rose-400';
    };

    const handleAnalyze = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await leadsApi.analyze(lead.id);
            onUpdate();
        } catch (error) {
            console.error('Failed to trigger analysis:', error);
        }
    };

    return (
        <div className={`bg-white/5 border transition-all group overflow-hidden relative rounded-2xl p-6 hover:bg-white/10 ${
            isSelected ? 'border-indigo-500/60 ring-2 ring-indigo-500/30 bg-indigo-950/20' : 'border-white/10'
        }`}>
            {/* Selection Checkbox & Header */}
            <div className="flex justify-between items-start mb-4 gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    {onToggleSelect && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect(lead.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-4 h-4 rounded border-white/20 bg-black/40 text-indigo-600 focus:ring-indigo-500/40 cursor-pointer"
                        />
                    )}
                    <div className="min-w-0 flex-1">
                        <h3 
                            onClick={() => onOpenDetail && onOpenDetail(lead)}
                            className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors cursor-pointer truncate"
                        >
                            {lead.name}
                        </h3>
                        <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-[200px]">{lead.address || 'No address'}</span>
                            </div>
                            {lead.contact_email && (
                                <div className="flex items-center gap-2 text-indigo-400 text-sm">
                                    <Mail className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate max-w-[200px]">{lead.contact_email}</span>
                                </div>
                            )}
                            {/* Contact Status and Maintenance Tracker */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {getContactStatusBadge()}
                                {(lead.contact_attempts ?? 0) > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 font-mono">
                                        触达 {lead.contact_attempts} 次
                                    </span>
                                )}
                                {lead.last_contacted && (
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                                        <Clock className="w-2.5 h-2.5 text-gray-500" />
                                        <span>{new Date(lead.last_contacted).toLocaleDateString()}</span>
                                    </span>
                                )}
                            </div>
                            {isBounced && (
                                <div className="mt-2.5 p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-rose-200">邮箱失效 / 已被系统隔离</div>
                                        <div className="text-[11px] text-rose-300/80 truncate" title={lead.bounce_reason || '550 Recipient address rejected'}>
                                            {lead.bounce_reason || '对方邮箱不存在或域名无有效 MX 记录'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {lead.ai_score ? (
                    <div className="flex flex-col items-end shrink-0">
                        <div className={`text-2xl font-bold ${getScoreColor(lead.ai_score)}`}>
                            {lead.ai_score}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">AI Score</div>
                    </div>
                ) : null}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
                {lead.rating ? (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{lead.rating}</span>
                    </div>
                ) : null}
                {lead.analysis?.need_category === 'NO_WEBSITE' || !lead.website ? (
                    <span className="px-2 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-xs font-bold text-rose-300">
                        无独立官网
                    </span>
                ) : lead.analysis?.need_category === 'MOBILE_UNFRIENDLY' ? (
                    <span className="px-2 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300">
                        移动端体验差
                    </span>
                ) : lead.website ? (
                    <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                    >
                        <Globe className="w-3 h-3" />
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                ) : null}
                {lead.analysis?.estimated_lost_visitors_monthly && (
                    <span className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300">
                        月失 ~{lead.analysis.estimated_lost_visitors_monthly} 流量
                    </span>
                )}
                {lead.phone ? (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                        <Phone className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{lead.phone}</span>
                    </div>
                ) : null}
            </div>

            {/* AI Status or Insights */}
            {lead.ai_status === 'analyzing' || lead.ai_status === 'pending' ? (
                <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse py-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>AI Analysis in progress...</span>
                </div>
            ) : (lead.ai_tags?.length || lead.analysis?.tech_stack?.length) ? (
                <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        <Code className="w-3 h-3" />
                        Key Insights & Stack
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {(lead.ai_tags || lead.analysis?.tech_stack || []).slice(0, 5).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-[10px] text-indigo-300">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {lead.ai_grade && (
                <div className="absolute top-0 right-0 p-2">
                    <div className={`w-6 h-6 rounded-bl-xl flex items-center justify-center text-[10px] font-black ${
                        lead.ai_grade === 'A' ? 'bg-indigo-500 text-white' :
                        lead.ai_grade === 'B' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'
                    }`}>
                        {lead.ai_grade}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-2">
                <button
                    onClick={handleAnalyze}
                    disabled={lead.ai_status === 'analyzing' || lead.ai_status === 'pending'}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-50"
                >
                    {lead.ai_status === 'analyzing' || lead.ai_status === 'pending' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    {lead.ai_status === 'completed' ? 'Re-analyze' :
                        (lead.ai_status === 'analyzing' || lead.ai_status === 'pending') ? 'Analyzing...' : 'AI Audit'}
                </button>

                {onOpenDetail && (
                    <button
                        onClick={() => onOpenDetail(lead)}
                        className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs"
                        title="查看深度体检与商机详情"
                    >
                        <Eye className="w-3.5 h-3.5" />
                    </button>
                )}

                <a
                    href={`/proposal/${lead.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1"
                    title="新窗口预览为该客户生成的专属 3D 提案页"
                >
                    <FileText className="w-3.5 h-3.5" />
                    <span>提案</span>
                </a>

                {lead.ai_status === 'completed' && (
                    <button
                        onClick={() => onSelectLead(lead)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 group/btn"
                    >
                        <Wand2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                        Outreach
                    </button>
                )}
            </div>
        </div>
    );
};

export default LeadCard;
