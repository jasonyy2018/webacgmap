'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, AlertTriangle, ShieldCheck, Mail, RefreshCw, 
  Trash2, Edit3, CheckCircle2, AlertCircle, ArrowUpRight, 
  FileText, Activity, ShieldAlert, Sparkles
} from 'lucide-react';
import { bounceApi, leadsApi } from '@/lib/api-client';
import type { Lead } from '@/lib/types';

interface BounceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateLeads: () => void;
}

export default function BounceManagementModal({
  isOpen,
  onClose,
  onUpdateLeads,
}: BounceManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'parser' | 'preflight' | 'list'>('parser');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [bouncedLeads, setBouncedLeads] = useState<any[]>([]);

  // Parser state
  const [rawText, setRawText] = useState('');
  const [parseResult, setParseResult] = useState<any>(null);

  // Pre-flight scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Lead update inline state
  const [editingLeadId, setEditingLeadId] = useState<number | null>(null);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch deliverability metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await bounceApi.getMetrics();
      setMetrics(data.metrics);
      setBouncedLeads(data.bounced_leads || []);
    } catch (err: any) {
      setErrorMsg(`获取送达率统计失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
      setParseResult(null);
      setScanResult(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle parsing bounce text
  const handleParseAndMark = async () => {
    if (!rawText.trim()) {
      setErrorMsg('请先粘贴退信邮件内容或邮箱地址');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const res = await bounceApi.parseAndMark(rawText);
      setParseResult(res);
      setSuccessMsg(res.message);
      await fetchMetrics();
      onUpdateLeads();
    } catch (err: any) {
      setErrorMsg(err.message || '解析标记失败');
    } finally {
      setLoading(false);
    }
  };

  // Handle pre-flight DNS MX verification
  const handlePreflightScan = async () => {
    try {
      setIsScanning(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const res = await bounceApi.preflightVerifyAll(50);
      setScanResult(res);
      setSuccessMsg(res.message);
      await fetchMetrics();
      onUpdateLeads();
    } catch (err: any) {
      setErrorMsg(err.message || '前置体检失败');
    } finally {
      setIsScanning(false);
    }
  };

  // Handle updating a lead's email and unmarking bounce
  const handleRestoreLead = async (leadId: number) => {
    if (!newEmailInput.trim()) {
      setErrorMsg('请输入有效的新邮箱地址');
      return;
    }
    try {
      setIsSavingLead(true);
      setErrorMsg(null);
      const res = await bounceApi.restoreLead(leadId, newEmailInput.trim());
      setSuccessMsg(res.message);
      setEditingLeadId(null);
      setNewEmailInput('');
      await fetchMetrics();
      onUpdateLeads();
    } catch (err: any) {
      setErrorMsg(err.message || '更新邮箱并恢复失败');
    } finally {
      setIsSavingLead(false);
    }
  };

  // Archive / ignore a dead lead
  const handleArchiveLead = async (leadId: number) => {
    try {
      await leadsApi.updateLead(leadId, { status: 'ignored' });
      await fetchMetrics();
      onUpdateLeads();
    } catch (err: any) {
      setErrorMsg(`归档失败: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  邮件送达率监控与退信死信清洗中心
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Bounce Guard
                </span>
              </div>
              <p className="text-xs text-gray-400">
                实时把控发件人信誉，智能解析退信 NDR，自动隔离死信客户并提供前置 DNS MX 防护
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* KPI Metrics Dashboard HUD */}
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-5 gap-3 border-b border-white/10 bg-black/20">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] uppercase font-bold text-gray-400">送达成功率</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {metrics ? `${metrics.delivery_rate}%` : '--'}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Delivery Rate</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] uppercase font-bold text-gray-400">退信/死信率</div>
            <div className={`text-2xl font-black mt-1 ${(metrics?.bounce_rate || 0) > 5 ? 'text-rose-400' : 'text-amber-400'}`}>
              {metrics ? `${metrics.bounce_rate}%` : '--'}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">目标 &lt; 2.0%</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] uppercase font-bold text-gray-400">总外发触达量</div>
            <div className="text-xl font-bold text-cyan-400 mt-1">
              {metrics ? metrics.total_contacted : '--'}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Total Outbound</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] uppercase font-bold text-gray-400">已成功送达</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {metrics ? metrics.delivered_count : '--'}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Valid Inboxes</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] uppercase font-bold text-gray-400">已隔离死信</div>
            <div className="text-xl font-bold text-rose-400 mt-1">
              {metrics ? metrics.bounced_count : '--'}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Quarantined</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('parser')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'parser'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>智能退信解析录入 (Paste & Ingest)</span>
          </button>

          <button
            onClick={() => setActiveTab('preflight')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'preflight'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>前置 DNS MX 邮件体检 (Pre-flight Shield)</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'list'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>已隔离死信客户清单 ({bouncedLeads.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: Smart Text Parser */}
          {activeTab === 'parser' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  从邮箱复制退信通知全文，系统自动识别并永久隔离死信
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  如果您在腾讯企业邮、Gmail 或 Outlook 中收到了发往 <strong>jyu@wisdomitc.com</strong> 的系统退信（如 <em>Mail Delivery Subsystem</em>, <em>550 Recipient Rejected</em>, <em>User unknown</em> 等），直接将整封邮件文本或报错日志复制粘贴在下方，AI 与正则解析器会自动提取出失败邮箱，并在数据库中将对应客户标记为【退信/死信】，永久禁止外发以保护您的发件人信誉。
                </p>
              </div>

              <div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`在此粘贴退信邮件内容或邮箱地址列表，例如：\n\nDelivery to the following recipient failed permanently:\n    service@apexplumbingdallas.com\nTechnical details of permanent failure:\n550 5.1.1 The email account that you tried to reach does not exist.`}
                  className="w-full h-44 p-3.5 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  支持多行、混杂文本或单行独立邮箱
                </span>
                <button
                  onClick={handleParseAndMark}
                  disabled={loading || !rawText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-rose-950/40 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>⚡ 立即智能解析并批量隔离死信</span>
                </button>
              </div>

              {parseResult && (
                <div className="mt-4 p-4 rounded-xl bg-black/40 border border-indigo-500/20 space-y-2">
                  <div className="text-xs font-bold text-indigo-300">
                    解析报告：{parseResult.message}
                  </div>
                  {parseResult.analyzed_emails?.length > 0 && (
                    <div className="text-xs text-gray-300">
                      识别到的失效邮箱:
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {parseResult.analyzed_emails.map((e: string) => (
                          <span key={e} className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded font-mono text-[11px]">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Pre-flight DNS MX Verification */}
          {activeTab === 'preflight' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <h3 className="text-sm font-bold text-indigo-200 mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  前置防御：发信前排查无 MX 邮件服务器的空壳域名
                </h3>
                <p className="text-xs text-indigo-300/80 leading-relaxed">
                  在 Google Maps 拓客或网络抓取过程中，部分企业填写的域名可能早已过期、注销或根本没有配置企业邮局（MX 记录）。向这些邮箱投递将 <strong>100% 发生退信</strong>。
                  点击下方按钮，系统将通过权威 DNS 对库中待触达客户的邮箱执行极速 MX 解析体检，凡是域名不存在或无 MX 记录的客户，将提前标记为【死信/无效域名】并予以隔离，绝不向网络发出任何实际发信包，从源头消灭退信！
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-sm font-semibold text-white">批量前置 MX 深度体检</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    单次智能扫描至多 50 个待发客户，毫秒级探测 MX 主机
                  </div>
                </div>
                <button
                  onClick={handlePreflightScan}
                  disabled={isScanning}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{isScanning ? '正在逐一探测 MX 记录...' : '🛡️ 一键体检待发客户邮箱'}</span>
                </button>
              </div>

              {scanResult && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-400">体检扫描完成</span>
                    <span className="text-gray-400">
                      总扫描: {scanResult.scanned} | 有效: <span className="text-emerald-300">{scanResult.valid}</span> | 拦截死信: <span className="text-rose-400">{scanResult.invalid}</span>
                    </span>
                  </div>
                  {scanResult.flagged?.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      <div className="text-[11px] font-semibold text-rose-300">已提前拦截并隔离的无效客户:</div>
                      {scanResult.flagged.map((item: any) => (
                        <div key={item.id} className="p-2 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-white">{item.name}</span>
                            <span className="text-gray-400 ml-2 font-mono text-[11px]">({item.email})</span>
                          </div>
                          <span className="text-rose-400 text-[11px]">{item.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Quarantined Bounced Leads List */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  当前共有 <strong className="text-rose-400">{bouncedLeads.length}</strong> 个商机已被隔离，不再参与任何自动化触达
                </div>
                <button
                  onClick={fetchMetrics}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>刷新数据</span>
                </button>
              </div>

              {bouncedLeads.length === 0 ? (
                <div className="py-12 text-center text-gray-500 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto" />
                  <p className="text-sm">暂无退信/死信客户记录，客户邮箱质量极其健康！</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-black/20">
                  {bouncedLeads.map((lead) => (
                    <div key={lead.id} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white truncate">{lead.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            退信死信
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-mono">
                          <span className="text-rose-300">{lead.contact_email || '无邮箱'}</span>
                          {lead.phone && <span>📞 {lead.phone}</span>}
                          {lead.search_location && <span>📍 {lead.search_location}</span>}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>退信原因: {lead.bounce_reason || '550 Recipient Rejected'}</span>
                          {lead.bounced_at && (
                            <span className="ml-2 font-mono">
                              ({new Date(lead.bounced_at).toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {editingLeadId === lead.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="email"
                              value={newEmailInput}
                              onChange={(e) => setNewEmailInput(e.target.value)}
                              placeholder="输入客户真实有效邮箱..."
                              className="px-2.5 py-1.5 rounded-lg bg-black/80 border border-indigo-500/50 text-xs text-white placeholder-gray-500 font-mono outline-none w-48"
                            />
                            <button
                              onClick={() => handleRestoreLead(lead.id)}
                              disabled={isSavingLead}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              {isSavingLead ? '验证中...' : '保存并激活'}
                            </button>
                            <button
                              onClick={() => { setEditingLeadId(null); setNewEmailInput(''); }}
                              className="px-2 py-1.5 text-xs text-gray-400 hover:text-white"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingLeadId(lead.id);
                                setNewEmailInput(lead.contact_email || '');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>更新邮箱并解除隔离</span>
                            </button>
                            <button
                              onClick={() => handleArchiveLead(lead.id)}
                              title="将该死信客户归档，彻底移出日常管理视图"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-white/[0.02] text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>腾讯企业邮安全防护协议启用中 (jyu@wisdomitc.com)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            完成并关闭
          </button>
        </div>

      </div>
    </div>
  );
}
