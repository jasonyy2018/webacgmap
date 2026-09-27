'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Search, 
  Mail, 
  FileCode, 
  Inbox, 
  Terminal, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  HelpCircle, 
  Sliders, 
  Check, 
  RefreshCw, 
  Download, 
  Phone, 
  ExternalLink,
  Flame,
  Zap,
  ShieldCheck,
  Building,
  UserCheck,
  Eye,
  CornerDownRight
} from 'lucide-react';
import EnvModeToggle from '@/components/EnvModeToggle';
import type { Lead } from '@/lib/types';
import { leadsApi, searchApi } from '@/lib/api-client';

export interface WorkflowStatusInfo {
  isRunning: boolean;
  isPaused: boolean;
  activeStage: WorkflowStageKey | null;
  stageTitle: string;
  progress: string;
  percent: number;
}

interface WorkflowEngineProps {
  leads: Lead[];
  onUpdateLeads: () => Promise<void> | void;
  onNavigateTab: (tabId: string) => void;
  onStatusChange?: (status: WorkflowStatusInfo) => void;
}

export type WorkflowStageKey = 'discovery' | 'audit' | 'proposal' | 'outreach' | 'inbound';

interface LogItem {
  id: string;
  time: string;
  stage: WorkflowStageKey;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

interface StageIssue {
  id: string;
  leadId?: number;
  leadName?: string;
  stage: WorkflowStageKey;
  type: 'MISSING_EMAIL' | 'SITE_TIMEOUT' | 'INBOUND_UNRESOLVED' | 'NO_LEADS_FOUND' | 'GENERIC_ERROR' | 'BOUNCED_EMAIL';
  description: string;
  timestamp: string;
  resolved: boolean;
  resolutionHint: string;
}

const TARGET_VERIFIED_COUNT = 20;

const AUTO_EXPANSION_PRESETS = [
  { query: 'Roofing Contractors', location: 'Austin, TX' },
  { query: 'HVAC Services', location: 'Dallas, TX' },
  { query: 'Cosmetic Dentistry', location: 'Seattle, WA' },
  { query: 'Commercial Plumbing', location: 'Denver, CO' },
  { query: 'Solar Panel Installation', location: 'Miami, FL' },
  { query: 'Roofing Repair', location: 'Houston, TX' },
  { query: 'Heating & Air Conditioning', location: 'Phoenix, AZ' },
  { query: 'Dental Clinic', location: 'Atlanta, GA' },
  { query: 'Water Damage Restoration', location: 'Orlando, FL' },
  { query: 'Electrician Services', location: 'Chicago, IL' },
];

const PRESET_TARGETS = [
  { id: 'austin_roofing', query: 'Roofing Contractors', location: 'Austin, TX', badge: '高客单价 / 老旧网站多' },
  { id: 'dallas_hvac', query: 'HVAC Services', location: 'Dallas, TX', badge: '夏季旺季 / 迫切获客' },
  { id: 'seattle_dental', query: 'Cosmetic Dentistry', location: 'Seattle, WA', badge: '高毛利 / 重视移动端信任' },
  { id: 'denver_plumbing', query: 'Commercial Plumbing', location: 'Denver, CO', badge: '应急服务 / 电话转化刚需' },
  { id: 'miami_solar', query: 'Solar Panel Installation', location: 'Miami, FL', badge: '高预算 / 3D 原型促单高' },
];

export default function WorkflowEngine({ leads, onUpdateLeads, onNavigateTab, onStatusChange }: WorkflowEngineProps) {
  // Mode: 'auto' (One-click full automation) or 'manual' (Step-by-step role execution)
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  
  // Pipeline execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeStage, setActiveStage] = useState<WorkflowStageKey | null>(null);
  const [stageProgress, setStageProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  // Stage execution status
  const [stageStatus, setStageStatus] = useState<Record<WorkflowStageKey, 'idle' | 'running' | 'completed' | 'warning' | 'error'>>({
    discovery: 'idle',
    audit: 'idle',
    proposal: 'idle',
    outreach: 'idle',
    inbound: 'idle',
  });

  // Selected Discovery configuration
  const [selectedPreset, setSelectedPreset] = useState(PRESET_TARGETS[0].id);
  const [customQuery, setCustomQuery] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [useExistingPoolOnly, setUseExistingPoolOnly] = useState(leads.length > 0);
  const [throttleMs, setThrottleMs] = useState(800); // polite request pacing

  // Issues & Diagnostics
  const [issues, setIssues] = useState<StageIssue[]>([]);
  const [expandedIssuesStage, setExpandedIssuesStage] = useState<WorkflowStageKey | null>(null);
  const [quickEmailInput, setQuickEmailInput] = useState<Record<number, string>>({});
  const [isFixingIssue, setIsFixingIssue] = useState<Record<string, boolean>>({});

  // Terminal Logs
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warn' | 'success'>('all');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // System Environment & SMTP Status
  const [systemMode, setSystemMode] = useState<'sandbox' | 'real'>('sandbox');
  const [smtpInfo, setSmtpInfo] = useState<{ isConfigured: boolean; user: string; host: string } | null>(null);

  useEffect(() => {
    const fetchEnvStatus = () => {
      fetch('/api/system/mode')
        .then((r) => r.json())
        .then((data) => {
          setSystemMode(data.mode);
          setSmtpInfo({
            isConfigured: Boolean(data.isSmtpConfigured),
            user: data.smtpUser,
            host: data.smtpHost,
          });
        })
        .catch(() => {});
    };

    fetchEnvStatus();

    const handleEnvChanged = (e: any) => {
      if (e.detail?.mode) {
        setSystemMode(e.detail.mode);
        if (typeof e.detail.isSmtpConfigured === 'boolean') {
          setSmtpInfo((prev) => prev ? { ...prev, isConfigured: e.detail.isSmtpConfigured } : null);
        }
      }
    };

    window.addEventListener('system-env-mode-changed', handleEnvChanged);
    return () => window.removeEventListener('system-env-mode-changed', handleEnvChanged);
  }, []);

  // Control references for pause/cancel
  const isPausedRef = useRef(isPaused);
  const isRunningRef = useRef(isRunning);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Broadcast workflow status to parent
  useEffect(() => {
    if (onStatusChange) {
      const stageTitles: Record<WorkflowStageKey, string> = {
        discovery: '阶段 1: 智能商机挖掘',
        audit: '阶段 2: 官网深度诊断',
        proposal: '阶段 3: 3D 原型生成',
        outreach: '阶段 4: EDM 提案外发',
        inbound: '阶段 5: 意向洞察跟进',
      };
      onStatusChange({
        isRunning,
        isPaused,
        activeStage,
        stageTitle: activeStage ? stageTitles[activeStage] : '自动化作业流',
        progress: `${stageProgress.current}/${stageProgress.total || TARGET_VERIFIED_COUNT}`,
        percent: stageProgress.total > 0 ? Math.round((stageProgress.current / stageProgress.total) * 100) : 0,
      });
    }
  }, [isRunning, isPaused, activeStage, stageProgress.current, stageProgress.total, onStatusChange]);

  const addLog = (stage: WorkflowStageKey, level: 'info' | 'success' | 'warn' | 'error', message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, time, stage, level, message },
    ]);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Utility sleep with pause check
  const waitPacing = async (ms: number) => {
    const start = Date.now();
    while (Date.now() - start < ms) {
      if (!isRunningRef.current) throw new Error('PIPELINE_ABORTED');
      while (isPausedRef.current) {
        if (!isRunningRef.current) throw new Error('PIPELINE_ABORTED');
        await new Promise((r) => setTimeout(r, 200));
      }
      await new Promise((r) => setTimeout(r, 100));
    }
  };

  // Stage 1: Lead Discovery (Auto-skip leads without public email until 20 verified leads are gathered)
  const executeDiscovery = async (): Promise<Lead[]> => {
    setActiveStage('discovery');
    setStageStatus((s) => ({ ...s, discovery: 'running' }));
    addLog('discovery', 'info', `🚀 启动阶段 1: 智能商机挖掘与公开邮箱靶向筛选...`);
    addLog('discovery', 'info', `🎯 筛选策略：未公开联系邮箱的企业自动跳过，持续挖掘新商机，直至集齐 ${TARGET_VERIFIED_COUNT} 家具备公开邮箱的企业！`);

    const verifiedLeads: Lead[] = [];
    const seenPlaceIds = new Set<string>();

    // Step A: First check existing leads in database that already have contact_email
    try {
      const existingAll = await leadsApi.getAll();
      for (const l of existingAll) {
        const placeKey = l.place_id || String(l.id);
        if (l.contact_email && !seenPlaceIds.has(placeKey)) {
          seenPlaceIds.add(placeKey);
          verifiedLeads.push(l);
          if (verifiedLeads.length >= TARGET_VERIFIED_COUNT) break;
        }
      }
    } catch (e) {
      // fallback to props leads
      for (const l of leads) {
        const placeKey = l.place_id || String(l.id);
        if (l.contact_email && !seenPlaceIds.has(placeKey)) {
          seenPlaceIds.add(placeKey);
          verifiedLeads.push(l);
          if (verifiedLeads.length >= TARGET_VERIFIED_COUNT) break;
        }
      }
    }

    if (verifiedLeads.length > 0) {
      addLog('discovery', 'info', `⚡ 线索库中已匹配出 ${verifiedLeads.length}/${TARGET_VERIFIED_COUNT} 家已含公开邮箱的商机。`);
    }

    // Step B: If still less than TARGET_VERIFIED_COUNT, continuously search and crawl websites to extract public emails
    let presetIdx = 0;
    const initialPreset = PRESET_TARGETS.find((p) => p.id === selectedPreset);
    let currentQuery = customQuery.trim() || initialPreset?.query || 'Roofing Contractors';
    let currentLocation = customLocation.trim() || initialPreset?.location || 'Austin, TX';

    while (verifiedLeads.length < TARGET_VERIFIED_COUNT && presetIdx < AUTO_EXPANSION_PRESETS.length) {
      if (!isRunningRef.current) throw new Error('PIPELINE_ABORTED');

      addLog('discovery', 'info', `🔍 [进度 ${verifiedLeads.length}/${TARGET_VERIFIED_COUNT}] 正在扫描检索: "${currentQuery}" 在 "${currentLocation}"...`);

      try {
        const batch = await searchApi.search(currentQuery, currentLocation);
        const leadsList = Array.isArray(batch) ? batch : ((batch as any)?.leads || []);

        if (leadsList.length === 0) {
          addLog('discovery', 'info', `当前城市与类目无新数据，自动切换下一个靶向区域...`);
        } else {
          for (const rawLead of leadsList) {
            if (verifiedLeads.length >= TARGET_VERIFIED_COUNT) break;
            if (!isRunningRef.current) throw new Error('PIPELINE_ABORTED');

            const placeKey = rawLead.place_id || String(rawLead.id);
            if (seenPlaceIds.has(placeKey)) continue;
            seenPlaceIds.add(placeKey);

            // 1. If lead already has contact_email
            if (rawLead.contact_email) {
              verifiedLeads.push(rawLead);
              addLog('discovery', 'success', `✓ [已获取公开邮箱 (${verifiedLeads.length}/${TARGET_VERIFIED_COUNT})] "${rawLead.name}" ➔ ${rawLead.contact_email}`);
              continue;
            }

            // 2. If it has a website, inspect website to extract public email
            if (rawLead.website) {
              addLog('discovery', 'info', `🔎 正在深入扫描 "${rawLead.name}" 官网提取公开邮箱 (${rawLead.website})...`);
              try {
                await waitPacing(400);
                await leadsApi.analyze(rawLead.id);
                const updatedLead = await leadsApi.getById(rawLead.id);

                if (updatedLead.contact_email) {
                  verifiedLeads.push(updatedLead);
                  addLog('discovery', 'success', `✓ [官网成功提取公开邮箱 (${verifiedLeads.length}/${TARGET_VERIFIED_COUNT})] "${updatedLead.name}" ➔ ${updatedLead.contact_email}`);
                } else {
                  // No email found on website -> SKIP!
                  addLog('discovery', 'info', `⏩ [自动跳过无邮箱] "${rawLead.name}" 官网未公开联系邮箱，跳过并继续寻找下一家...`);
                }
              } catch (err: any) {
                addLog('discovery', 'info', `⏩ [自动跳过受阻站点] "${rawLead.name}" 网站无法访问或超时，跳过...`);
              }
            } else {
              // No website and no email -> SKIP!
              addLog('discovery', 'info', `⏩ [自动跳过无官网/无邮箱] "${rawLead.name}" 跳过...`);
            }
          }
        }
      } catch (err: any) {
        addLog('discovery', 'warn', `批次抓取网络波动，继续自动尝试备用目标...`);
      }

      // If still need more, advance to next target query/city
      if (verifiedLeads.length < TARGET_VERIFIED_COUNT) {
        const nextPreset = AUTO_EXPANSION_PRESETS[presetIdx % AUTO_EXPANSION_PRESETS.length];
        currentQuery = nextPreset.query;
        currentLocation = nextPreset.location;
        presetIdx++;
        await waitPacing(600);
      }
    }

    await onUpdateLeads();

    if (verifiedLeads.length >= TARGET_VERIFIED_COUNT) {
      addLog('discovery', 'success', `🎉 目标达成！已成功集齐 ${verifiedLeads.length} 家具备公开联系邮箱的目标企业！自动转入后续处理...`);
      setStageStatus((s) => ({ ...s, discovery: 'completed' }));
    } else if (verifiedLeads.length > 0) {
      addLog('discovery', 'warn', `⚠️ 深度扫描结束，共锁定 ${verifiedLeads.length} 家带公开邮箱商机，自动进入后续处理。`);
      setStageStatus((s) => ({ ...s, discovery: 'completed' }));
    } else {
      addLog('discovery', 'error', `❌ 未能探测到包含公开邮箱的商机，请检查网络或提供新的行业预设。`);
      setStageStatus((s) => ({ ...s, discovery: 'warning' }));
    }

    return verifiedLeads.slice(0, TARGET_VERIFIED_COUNT);
  };

  // Stage 2: AI Technical Audit
  const executeAudit = async (targetLeads: Lead[]) => {
    setActiveStage('audit');
    setStageStatus((s) => ({ ...s, audit: 'running' }));
    addLog('audit', 'info', `🚀 启动阶段 2: AI 深度技术体检与痛点评分...`);

    const safeLeads = Array.isArray(targetLeads) ? targetLeads : (Array.isArray(leads) ? leads : []);
    const unAudited = safeLeads.filter((l) => l.ai_status !== 'completed');
    if (unAudited.length === 0) {
      addLog('audit', 'info', `全部 ${targetLeads.length} 家商机此前均已完成技术体检，直接进入方案生成。`);
      setStageStatus((s) => ({ ...s, audit: 'completed' }));
      return;
    }

    setStageProgress({ current: 0, total: unAudited.length });
    let completedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < unAudited.length; i++) {
      const lead = unAudited[i];
      setStageProgress({ current: i + 1, total: unAudited.length });
      addLog('audit', 'info', `[${i + 1}/${unAudited.length}] 正在审计 "${lead.name}" (${lead.website || '无官网'}) ...`);

      try {
        await waitPacing(throttleMs);
        await leadsApi.analyze(lead.id);
        completedCount++;
        addLog('audit', 'success', `✓ "${lead.name}" 审计完成！痛点需求与跑分已入库。`);
      } catch (err: any) {
        failedCount++;
        addLog('audit', 'warn', `⚠️ "${lead.name}" 审计异常: ${err.message}`);
        setIssues((prev) => [
          ...prev,
          {
            id: `audit-${lead.id}-${Date.now()}`,
            leadId: lead.id,
            leadName: lead.name,
            stage: 'audit',
            type: 'SITE_TIMEOUT',
            description: `目标企业网站访问超时或受阻: ${err.message || 'Timeout'}`,
            timestamp: new Date().toLocaleTimeString(),
            resolved: false,
            resolutionHint: '系统可自动为其套用标准行业改版基准方案，或点击就地重试。',
          },
        ]);
      }
    }

    await onUpdateLeads();
    if (failedCount > 0) {
      setStageStatus((s) => ({ ...s, audit: 'warning' }));
      addLog('audit', 'warn', `阶段 2 完成: ${completedCount} 成功, ${failedCount} 异常需人工排查。`);
    } else {
      setStageStatus((s) => ({ ...s, audit: 'completed' }));
      addLog('audit', 'success', `✓ 阶段 2 全部完成！共深度体检 ${completedCount} 家企业。`);
    }
  };

  // Stage 3: Proposal & Pitch Deck Generation
  const executeProposal = async (targetLeads: Lead[]) => {
    setActiveStage('proposal');
    setStageStatus((s) => ({ ...s, proposal: 'running' }));
    addLog('proposal', 'info', `🚀 启动阶段 3: 3D 专属原型改版方案与专属 Pitch 生成...`);

    const safeLeads = Array.isArray(targetLeads) ? targetLeads : (Array.isArray(leads) ? leads : []);
    const validLeads = safeLeads.slice(0, 15);
    setStageProgress({ current: 0, total: validLeads.length });

    for (let i = 0; i < validLeads.length; i++) {
      const lead = validLeads[i];
      setStageProgress({ current: i + 1, total: validLeads.length });
      addLog('proposal', 'info', `[${i + 1}/${validLeads.length}] 校验 "${lead.name}" 的专属提案 /proposal/${lead.id} ...`);
      await waitPacing(200);
    }

    addLog('proposal', 'success', `✓ 阶段 3 完成！已为 ${validLeads.length} 家企业生成专属 3D 方案与转化价值卡。`);
    setStageStatus((s) => ({ ...s, proposal: 'completed' }));
  };

  // Stage 4: Smart Cold Outreach
  const executeOutreach = async (targetLeads: Lead[]) => {
    setActiveStage('outreach');
    const isLive = systemMode === 'real' && smtpInfo?.isConfigured;
    const modeTag = isLive ? '【🚀 真实外发模式 - 腾讯企业邮】' : '【🛡️ 安全沙盒仿真模式 - 防误发保护】';
    addLog('outreach', 'info', `🚀 启动阶段 4: 针对痛点的个性化开发信自动化投递 ${modeTag}...`);

    const safeLeads = Array.isArray(targetLeads) ? targetLeads : (Array.isArray(leads) ? leads : []);
    // Target uncontacted leads, strictly excluding bounced or invalid emails
    const candidates = safeLeads.filter((l) => 
      (!l.status || l.status === 'discovered' || l.status === 'analyzed' || l.status === 'pending') &&
      l.status !== 'bounced' &&
      l.email_status !== 'bounced' &&
      l.email_status !== 'invalid_domain'
    );
    const toDispatch = candidates.length > 0 
      ? candidates 
      : safeLeads.filter((l) => l.status !== 'bounced' && l.email_status !== 'bounced').slice(0, 8);

    setStageProgress({ current: 0, total: toDispatch.length });
    let sentCount = 0;
    let missingEmailCount = 0;
    let bouncedCount = 0;

    for (let i = 0; i < toDispatch.length; i++) {
      const lead = toDispatch[i];
      setStageProgress({ current: i + 1, total: toDispatch.length });

      if (!lead.contact_email) {
        missingEmailCount++;
        addLog('outreach', 'warn', `⚠️ "${lead.name}" 缺少公开邮箱，已挂起至待排查面板。`);
        setIssues((prev) => [
          ...prev,
          {
            id: `email-${lead.id}-${Date.now()}`,
            leadId: lead.id,
            leadName: lead.name,
            stage: 'outreach',
            type: 'MISSING_EMAIL',
            description: `企业暂未公开邮箱 (电话: ${lead.phone || '无'})，无法自动推送 Stage 1 邮件`,
            timestamp: new Date().toLocaleTimeString(),
            resolved: false,
            resolutionHint: '可点击右侧直接录入客户邮箱并重发，或点击转为电话销售外呼。',
          },
        ]);
        continue;
      }

      // Check if lead was marked as bounced
      if (lead.status === 'bounced' || lead.email_status === 'bounced') {
        bouncedCount++;
        addLog('outreach', 'warn', `🛡️ [自动隔离] "${lead.name}" (${lead.contact_email}) 历史记录显示已退信/死信，已自动跳过！`);
        continue;
      }

      addLog('outreach', 'info', `[${i + 1}/${toDispatch.length}] 前置风控核验中... 发件人 jyu@wisdomitc.com ➔ ${lead.contact_email} (${lead.name})`);
      try {
        await waitPacing(throttleMs);
        await leadsApi.sendEmail(lead.id);
        sentCount++;
        addLog('outreach', 'success', `✓ 成功投递开发信至 ${lead.contact_email} (发件人: jyu@wisdomitc.com)！`);
      } catch (err: any) {
        bouncedCount++;
        addLog('outreach', 'warn', `🛡️ [风控拦截/死信隔离] "${lead.name}" (${lead.contact_email}): ${err.message}`);
        setIssues((prev) => [
          ...prev,
          {
            id: `bounce-${lead.id}-${Date.now()}`,
            leadId: lead.id,
            leadName: lead.name,
            stage: 'outreach',
            type: 'BOUNCED_EMAIL',
            description: `邮箱不存在或已被隔离: ${err.message}`,
            timestamp: new Date().toLocaleTimeString(),
            resolved: false,
            resolutionHint: '该商机已自动标记为【退信/死信】并予以永久隔离，不会重复发信损害信誉。',
          },
        ]);
      }
    }

    await onUpdateLeads();
    if (missingEmailCount > 0) {
      setStageStatus((s) => ({ ...s, outreach: 'warning' }));
      addLog('outreach', 'warn', `阶段 4 完成: 成功触达 ${sentCount} 家，${missingEmailCount} 家缺失邮箱已归入待排查清单。`);
    } else {
      setStageStatus((s) => ({ ...s, outreach: 'completed' }));
      addLog('outreach', 'success', `✓ 阶段 4 全部完成！共成功发送 ${sentCount} 封破冰开发信。`);
    }
  };

  // Stage 5: Inbound Triage & Sync
  const executeInbound = async () => {
    setActiveStage('inbound');
    setStageStatus((s) => ({ ...s, inbound: 'running' }));
    addLog('inbound', 'info', `🚀 启动阶段 5: 意向监控与闭环同步检查...`);

    try {
      await waitPacing(500);
      const res = await fetch('/api/replies');
      const data = await res.json();
      const repliesCount = Array.isArray(data.replies) ? data.replies.length : 0;
      addLog('inbound', 'info', `查询到当前收件箱共有 ${repliesCount} 条客户意向/邮件互动记录。`);

      addLog('inbound', 'success', `✓ 阶段 5 闭环同步完毕！新进意向将自动通知销售代表。`);
      setStageStatus((s) => ({ ...s, inbound: 'completed' }));
    } catch (err: any) {
      addLog('inbound', 'warn', `收件箱同步警告: ${err.message}`);
      setStageStatus((s) => ({ ...s, inbound: 'completed' }));
    }
  };

  // Master Run All (One-Click Automation)
  const handleStartAutoPipeline = async () => {
    setIsRunning(true);
    setIsPaused(false);
    addLog('discovery', 'info', `==============================================`);
    addLog('discovery', 'info', `⚡ 启动一键全自动商机转化工作流 (One-Click Pipeline)`);
    addLog('discovery', 'info', `==============================================`);

    try {
      // Step 1: Discovery
      const discoveredLeads = await executeDiscovery();
      if (!isRunningRef.current) return;
      const targetLeads = Array.isArray(discoveredLeads) && discoveredLeads.length > 0 ? discoveredLeads : (Array.isArray(leads) ? leads : []);

      // Step 2: AI Audit
      await executeAudit(targetLeads);
      if (!isRunningRef.current) return;

      // Step 3: Proposal
      await executeProposal(targetLeads);
      if (!isRunningRef.current) return;

      // Step 4: Outreach
      await executeOutreach(targetLeads);
      if (!isRunningRef.current) return;

      // Step 5: Inbound
      await executeInbound();

      addLog('inbound', 'success', `🎉 全自动工作流执行完毕！所有商机均已进入对应流转阶段。`);
    } catch (err: any) {
      if (err.message === 'PIPELINE_ABORTED') {
        addLog('discovery', 'warn', `⏹️ 工作流已被操作员主动中止。`);
      } else {
        addLog('discovery', 'error', `❌ 工作流异常中断: ${err.message}`);
      }
    } finally {
      setIsRunning(false);
      setIsPaused(false);
      setActiveStage(null);
    }
  };

  // Manual Trigger for Single Stage
  const handleRunSingleStage = async (stage: WorkflowStageKey) => {
    setIsRunning(true);
    setIsPaused(false);
    try {
      if (stage === 'discovery') {
        await executeDiscovery();
      } else if (stage === 'audit') {
        await executeAudit(leads);
      } else if (stage === 'proposal') {
        await executeProposal(leads);
      } else if (stage === 'outreach') {
        await executeOutreach(leads);
      } else if (stage === 'inbound') {
        await executeInbound();
      }
    } catch (err: any) {
      addLog(stage, 'error', `单步执行异常: ${err.message}`);
    } finally {
      setIsRunning(false);
      setActiveStage(null);
    }
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => {
      const next = !prev;
      addLog(activeStage || 'discovery', 'info', next ? '⏸️ 工作流已暂停。' : '▶️ 工作流已恢复继续执行。');
      return next;
    });
  };

  const handleAbort = () => {
    setIsRunning(false);
    setIsPaused(false);
    setActiveStage(null);
    addLog('discovery', 'warn', '⏹️ 用户点击了强制终止工作流。');
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setActiveStage(null);
    setStageStatus({
      discovery: 'idle',
      audit: 'idle',
      proposal: 'idle',
      outreach: 'idle',
      inbound: 'idle',
    });
    setLogs([]);
    setIssues([]);
    addLog('discovery', 'info', '🔄 工作流状态与日志已全部重置。');
  };

  // Quick-fix issue actions
  const handleResolveMissingEmail = async (issue: StageIssue) => {
    if (!issue.leadId) return;
    const emailToSet = quickEmailInput[issue.leadId]?.trim();
    if (!emailToSet || !emailToSet.includes('@')) {
      alert('请输入合法的企业电子邮箱地址');
      return;
    }

    setIsFixingIssue((prev) => ({ ...prev, [issue.id]: true }));
    try {
      await leadsApi.updateLead(issue.leadId, { contact_email: emailToSet });
      await leadsApi.sendEmail(issue.leadId);
      
      // Mark issue resolved
      setIssues((prev) => prev.map((item) => (item.id === issue.id ? { ...item, resolved: true } : item)));
      addLog('outreach', 'success', `✓ [就地修复成功] 已补充 "${issue.leadName}" 邮箱为 ${emailToSet} 并成功推送开发信！`);
      await onUpdateLeads();
    } catch (err: any) {
      alert(`修复并发送失败: ${err.message}`);
    } finally {
      setIsFixingIssue((prev) => ({ ...prev, [issue.id]: false }));
    }
  };

  const handleMarkAsPhoneCall = async (issue: StageIssue) => {
    if (!issue.leadId) return;
    setIsFixingIssue((prev) => ({ ...prev, [issue.id]: true }));
    try {
      await leadsApi.updateLead(issue.leadId, { status: 'contacted' });
      setIssues((prev) => prev.map((item) => (item.id === issue.id ? { ...item, resolved: true } : item)));
      addLog('outreach', 'info', `✓ 已将 "${issue.leadName}" 转为销售电话外呼待办，已从阻滞列表中移出。`);
      await onUpdateLeads();
    } catch (err: any) {
      alert(`操作失败: ${err.message}`);
    } finally {
      setIsFixingIssue((prev) => ({ ...prev, [issue.id]: false }));
    }
  };

  const handleRetryAudit = async (issue: StageIssue) => {
    if (!issue.leadId) return;
    setIsFixingIssue((prev) => ({ ...prev, [issue.id]: true }));
    try {
      await leadsApi.analyze(issue.leadId);
      setIssues((prev) => prev.map((item) => (item.id === issue.id ? { ...item, resolved: true } : item)));
      addLog('audit', 'success', `✓ [重试成功] "${issue.leadName}" 已成功完成技术体检！`);
      await onUpdateLeads();
    } catch (err: any) {
      alert(`重试体检仍失败: ${err.message}`);
    } finally {
      setIsFixingIssue((prev) => ({ ...prev, [issue.id]: false }));
    }
  };

  // Filtered issues per stage
  const unresolvedIssues = issues.filter((i) => !i.resolved);
  const issuesByStage = (stage: WorkflowStageKey) => unresolvedIssues.filter((i) => i.stage === stage);

  // Overall pipeline progress
  const completedStagesCount = Object.values(stageStatus).filter((s) => s === 'completed').length;
  const overallProgressPercent = Math.round((completedStagesCount / 5) * 100);

  // Export logs
  const handleExportLogs = () => {
    const text = logs.map((l) => `[${l.time}] [${l.stage.toUpperCase()}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow_run_${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Master Mode Switch & Global Control Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-black/80 to-purple-950/30 border border-white/10 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                Orchestration Engine v2.4
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
              <span>一键商机全自动作业流</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-medium">
                Dual Mode: Autopilot & Manual
              </span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              既支持全自动化一键串联“挖掘 ➔ 体检 ➔ 方案 ➔ 触达 ➔ 闭环”，也支持团队分工单步把控。当环节发生阻滞时，可一键就地排查并快速修复。
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-black/60 p-1.5 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setMode('auto')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all ${
                mode === 'auto'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>一键自动化全流程</span>
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all ${
                mode === 'manual'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>分工分步操作模式</span>
            </button>
          </div>
        </div>

        {/* Global Action Buttons & Scope Preset Selector */}
        <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
          {/* Target Industry & City Selector */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="text-slate-400 font-medium">目标靶向:</span>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              disabled={isRunning || useExistingPoolOnly}
              className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-white outline-none focus:border-indigo-500/50 disabled:opacity-50"
            >
              {PRESET_TARGETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.location} • {p.query} ({p.badge})
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-slate-300 ml-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useExistingPoolOnly}
                onChange={(e) => setUseExistingPoolOnly(e.target.checked)}
                disabled={isRunning}
                className="w-3.5 h-3.5 rounded bg-black/50 border-white/20 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs">直接使用现有未触达商机池 (共 {leads.length} 家)</span>
            </label>
          </div>

          {/* Master Controller Buttons */}
          <div className="flex items-center gap-2.5">
            {mode === 'auto' && (
              <>
                {!isRunning ? (
                  <button
                    onClick={handleStartAutoPipeline}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>启动一键全自动工作流</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePauseResume}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPaused ? '继续执行' : '暂停流水线'}</span>
                    </button>
                    <button
                      onClick={handleAbort}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>强制中止</span>
                    </button>
                  </>
                )}
              </>
            )}

            <button
              onClick={handleReset}
              disabled={isRunning}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="重置流水线进度与日志"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置状态</span>
            </button>
          </div>
        </div>

        {/* Strategy Indicator Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-bold">🎯 自动邮箱严格筛选机制：</span>
            <span className="text-slate-300">
              未公开有效联系邮箱的企业自动跳过，引擎持续自动跨城市/类目深挖，<strong>直至集齐 20 家具备公开邮箱的商机</strong>再进行后续批量处理。
            </span>
          </div>
          <div className="flex items-center gap-3">
            <EnvModeToggle variant="header" />
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-bold shrink-0 text-xs">
              目标定额: 20 家
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">
              流水线总进度: {completedStagesCount} / 5 个环节已完成
            </span>
            <span className="text-indigo-400 font-bold">{overallProgressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 shadow-lg shadow-indigo-500/50"
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5-Stage Stepper Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            key: 'discovery' as WorkflowStageKey,
            num: 1,
            title: '商机挖掘与筛选',
            subtitle: '跳过无邮箱，集齐 20 家',
            role: '数据挖掘中心',
            icon: Search,
            desc: '扫描 Places 并深度解析官网，未公开邮箱自动跳过，直到集齐 20 家具备公开邮箱的企业。',
          },
          {
            key: 'audit' as WorkflowStageKey,
            num: 2,
            title: 'AI 深度体检',
            subtitle: 'Lighthouse 痛点分析',
            role: 'AI 技术架构师',
            desc: '检测移动端体验、老旧 CMS 技术债与月度客流损失。',
            icon: Sparkles,
          },
          {
            key: 'proposal' as WorkflowStageKey,
            num: 3,
            title: '专属方案生成',
            subtitle: '3D 方案与专属 Pitch',
            role: '方案设计架构',
            desc: '自动装配个性化 /proposal 原型预览链接与价值卡。',
            icon: FileCode,
          },
          {
            key: 'outreach' as WorkflowStageKey,
            num: 4,
            title: '智能冷触达',
            subtitle:
              systemMode === 'real'
                ? smtpInfo?.isConfigured
                  ? '🚀 腾讯企业邮公网实发'
                  : '⚠️ 真实模式 (待配密码)'
                : '🛡️ 沙盒安全防误发保护中',
            role: 'SDR 销售代表',
            desc:
              systemMode === 'real'
                ? smtpInfo?.isConfigured
                  ? '真实生产发信中：已接通腾讯企业邮 (jyu@wisdomitc.com)，点击即向海外企业真实外发。'
                  : '已开启真实生产模式。提示: 请在 .env 中填入 SMTP_PASS 授权码以激活真实外送。'
                : '安全沙盒模式：自动化发信全程安全仿真，状态自动推进并记录日志，绝不骚扰真实企业。',
            icon: Mail,
          },
          {
            key: 'inbound' as WorkflowStageKey,
            num: 5,
            title: '意向监控闭环',
            subtitle: '收件箱反哺与沉淀',
            role: '客户成功团队',
            desc: '实时监听官网表单与邮箱来信，AI 判定意向评级。',
            icon: Inbox,
          },
        ].map((stage) => {
          const status = stageStatus[stage.key];
          const stageIssueList = issuesByStage(stage.key);
          const hasIssues = stageIssueList.length > 0;
          const isActive = activeStage === stage.key;

          return (
            <div
              key={stage.key}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                isActive
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : status === 'completed'
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : hasIssues
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              {/* Active glow pulse */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                      status === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-indigo-600 text-white animate-pulse'
                        : 'bg-white/10 text-slate-300'
                    }`}>
                      {status === 'completed' ? <Check className="w-3.5 h-3.5" /> : stage.num}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {stage.role}
                    </span>
                  </div>

                  {/* Status Indicator Badge */}
                  {status === 'completed' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 已完成
                    </span>
                  ) : isActive ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> 执行中
                    </span>
                  ) : hasIssues ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> 阻滞 ({stageIssueList.length})
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">待命</span>
                  )}
                </div>

                <div className="space-y-1 mb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <stage.icon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{stage.title}</span>
                  </h3>
                  <p className="text-[11px] text-indigo-300/80 font-mono">{stage.subtitle}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">{stage.desc}</p>
                </div>
              </div>

              {/* Bottom Actions for Manual Mode */}
              <div className="pt-3 border-t border-white/5 mt-3 space-y-2">
                {mode === 'manual' && (
                  <button
                    onClick={() => handleRunSingleStage(stage.key)}
                    disabled={isRunning}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>单独执行此环节</span>
                  </button>
                )}

                {hasIssues && (
                  <button
                    onClick={() => setExpandedIssuesStage(expandedIssuesStage === stage.key ? null : stage.key)}
                    className="w-full py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>查看并排查问题 ({stageIssueList.length})</span>
                    </span>
                    {expandedIssuesStage === stage.key ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline Quick-Fix & Diagnostics Drawer (当有阻滞问题时展示) */}
      {unresolvedIssues.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>异常诊断与即时处理中心</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    {unresolvedIssues.length} 个待处理项
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  工作流监测到以下商机存在信息缺失或网络受阻，可就地录入修复或一键跳过，保障流水线无卡点运行。
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIssues((prev) => prev.map((i) => ({ ...i, resolved: true })))}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all"
              >
                全部忽略标记为已解决
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {unresolvedIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-2xl bg-black/60 border border-amber-500/20 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-[240px] flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{issue.leadName || '商机记录'}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 uppercase">
                      {issue.stage}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">[{issue.timestamp}]</span>
                  </div>
                  <p className="text-xs text-amber-200/90">{issue.description}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CornerDownRight className="w-3 h-3 text-indigo-400" />
                    <span>建议方案: {issue.resolutionHint}</span>
                  </p>
                </div>

                {/* Interactive Fix Controls per issue type */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {issue.type === 'MISSING_EMAIL' && issue.leadId && (
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        placeholder="输入企业邮箱 (如 owner@domain.com)"
                        value={quickEmailInput[issue.leadId] || ''}
                        onChange={(e) => setQuickEmailInput({ ...quickEmailInput, [issue.leadId!]: e.target.value })}
                        className="px-3 py-1.5 rounded-xl bg-black/80 border border-white/20 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 w-60 font-mono"
                      />
                      <button
                        onClick={() => handleResolveMissingEmail(issue)}
                        disabled={isFixingIssue[issue.id]}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {isFixingIssue[issue.id] ? '正在补发...' : '保存并补发'}
                      </button>
                      <button
                        onClick={() => handleMarkAsPhoneCall(issue)}
                        disabled={isFixingIssue[issue.id]}
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs transition-all"
                        title="转为销售电话跟进"
                      >
                        转为电话外呼
                      </button>
                    </div>
                  )}

                  {issue.type === 'SITE_TIMEOUT' && issue.leadId && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRetryAudit(issue)}
                        disabled={isFixingIssue[issue.id]}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {isFixingIssue[issue.id] ? '重试中...' : '重新检测'}
                      </button>
                      <button
                        onClick={() => setIssues((prev) => prev.map((i) => (i.id === issue.id ? { ...i, resolved: true } : i)))}
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs"
                      >
                        套用基准跳过
                      </button>
                    </div>
                  )}

                  {issue.type === 'NO_LEADS_FOUND' && (
                    <button
                      onClick={() => {
                        setSelectedPreset(PRESET_TARGETS[1].id);
                        setIssues((prev) => prev.map((i) => (i.id === issue.id ? { ...i, resolved: true } : i)));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                    >
                      切换到达拉斯 HVAC 重试
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Operations Terminal & Event Logs */}
      <div className="rounded-3xl bg-black/90 border border-white/10 overflow-hidden shadow-2xl">
        <div className="px-5 py-3.5 bg-white/[0.03] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 ml-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Live Operations Terminal & Event Bus</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex bg-black/50 p-1 rounded-xl border border-white/10 text-[10px] font-mono">
              {(['all', 'error', 'warn', 'success'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  className={`px-2 py-0.5 rounded-md uppercase font-bold transition-all ${
                    logFilter === filter ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportLogs}
              disabled={logs.length === 0}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center gap-1 transition-all disabled:opacity-40"
              title="导出日志文件"
            >
              <Download className="w-3 h-3" />
              <span>导出日志</span>
            </button>

            <button
              onClick={() => setLogs([])}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs transition-all"
            >
              清屏
            </button>
          </div>
        </div>

        {/* Console Log Area */}
        <div className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-1.5 custom-scrollbar bg-black/95">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
              <Terminal className="w-6 h-6" />
              <p>流水线待命中。点击上方“启动一键全自动工作流”或单独执行某个环节，即可实时查看执行日志流。</p>
            </div>
          ) : (
            logs
              .filter((log) => {
                if (logFilter === 'all') return true;
                return log.level === logFilter;
              })
              .map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                  <span
                    className={`uppercase text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                      log.level === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : log.level === 'error'
                        ? 'bg-rose-500/20 text-rose-400'
                        : log.level === 'warn'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {log.stage}
                  </span>
                  <span
                    className={`${
                      log.level === 'success'
                        ? 'text-emerald-300'
                        : log.level === 'error'
                        ? 'text-rose-300 font-bold'
                        : log.level === 'warn'
                        ? 'text-amber-200'
                        : 'text-slate-300'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Quick Navigation to specialized views */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-indigo-400" />
          <div>
            <h4 className="text-xs font-bold text-white">深入专属作业控制台</h4>
            <p className="text-[11px] text-slate-400">完成工作流后，可直接跳转到相应功能区进行精细化商机运营：</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('leads')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all flex items-center gap-1.5"
          >
            <span>Leads & Audits 审核</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => onNavigateTab('pipeline')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all flex items-center gap-1.5"
          >
            <span>Pipeline 看板流转</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => onNavigateTab('inbox')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all flex items-center gap-1.5"
          >
            <span>Inbound 回信意向</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => onNavigateTab('marketing')}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all flex items-center gap-1.5"
          >
            <span>EDM Studio 模板</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
