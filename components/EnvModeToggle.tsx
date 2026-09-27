'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Rocket, CheckCircle2, AlertTriangle, RefreshCw, Lock } from 'lucide-react';

interface EnvModeToggleProps {
  variant?: 'header' | 'banner' | 'card';
  className?: string;
  onModeChange?: (mode: 'sandbox' | 'real') => void;
}

export default function EnvModeToggle({ variant = 'header', className = '', onModeChange }: EnvModeToggleProps) {
  const [mode, setMode] = useState<'sandbox' | 'real'>('sandbox');
  const [isSmtpConfigured, setIsSmtpConfigured] = useState(false);
  const [smtpUser, setSmtpUser] = useState('jyu@wisdomitc.com');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/system/mode');
      if (res.ok) {
        const data = await res.json();
        setMode(data.mode);
        setIsSmtpConfigured(Boolean(data.isSmtpConfigured));
        if (data.smtpUser) setSmtpUser(data.smtpUser);
      }
    } catch (err) {
      console.error('Failed to fetch system mode:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Listen for cross-component mode change events
    const handleCustomChange = (e: any) => {
      if (e.detail?.mode && (e.detail.mode === 'sandbox' || e.detail.mode === 'real')) {
        setMode(e.detail.mode);
        if (typeof e.detail.isSmtpConfigured === 'boolean') {
          setIsSmtpConfigured(e.detail.isSmtpConfigured);
        }
      }
    };

    window.addEventListener('system-env-mode-changed', handleCustomChange);
    return () => window.removeEventListener('system-env-mode-changed', handleCustomChange);
  }, []);

  const handleToggleClick = () => {
    if (isUpdating) return;
    if (mode === 'sandbox') {
      // Switching to Real -> show safety confirmation
      setShowConfirmModal(true);
    } else {
      // Switching back to Sandbox -> apply directly
      applyModeChange('sandbox');
    }
  };

  const applyModeChange = async (targetMode: 'sandbox' | 'real') => {
    setIsUpdating(true);
    setShowConfirmModal(false);
    try {
      const res = await fetch('/api/system/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: targetMode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMode(data.mode);
        setIsSmtpConfigured(Boolean(data.isSmtpConfigured));
        onModeChange?.(data.mode);

        // Broadcast to other components on the page
        window.dispatchEvent(
          new CustomEvent('system-env-mode-changed', {
            detail: { mode: data.mode, isSmtpConfigured: data.isSmtpConfigured },
          })
        );
      } else {
        alert(`切换失败: ${data.error || '未知错误'}`);
      }
    } catch (err: any) {
      alert(`切换请求失败: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Render for Header Variant
  if (variant === 'header') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        {/* Toggle Switch Capsule */}
        <div
          onClick={handleToggleClick}
          role="button"
          tabIndex={0}
          title={
            mode === 'sandbox'
              ? '当前处于安全沙盒环境：所有外发邮件均受保护安全仿真。点击切换为真实生产环境'
              : '当前处于真实生产环境：邮件将通过腾讯企业邮真实投递至目标客户！点击切回安全沙盒'
          }
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer select-none group ${
            mode === 'real'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-900/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
          }`}
        >
          {/* Status Icon */}
          <div className="flex items-center gap-1.5">
            {mode === 'real' ? (
              <div className="relative flex items-center justify-center">
                <Rocket className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
            ) : (
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-[11px] font-bold tracking-tight">
              {mode === 'real' ? '真实生产环境' : '安全沙盒环境'}
            </span>
          </div>

          {/* Graphical Toggle Slider */}
          <div
            className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors duration-300 ${
              mode === 'real' ? 'bg-emerald-500 justify-end' : 'bg-zinc-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
          </div>

          {isUpdating && <RefreshCw className="w-3 h-3 animate-spin text-white/70" />}
        </div>

        {/* Confirmation Modal when switching to Real Production */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#0e0e12] border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">确认切换为「真实商业生产环境」？</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    系统将由安全仿真模式进入真实生产发信通道。
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>发信协议: 腾讯企业邮 (smtp.exmail.qq.com:465)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span>发件邮箱: {smtpUser}</span>
                </div>
                <div className="text-slate-400 text-[11px] leading-relaxed pt-1 border-t border-white/5">
                  ⚠️ 开启后：一键工作流的「阶段 4 邮件触达」与 EDM Studio
                  的手动发信，将<strong>真正向北美目标企业客户投递邮件</strong>。
                  {!isSmtpConfigured && (
                    <div className="mt-1 text-amber-400 font-semibold">
                      (提示：当前尚未在 .env 中填入 SMTP_PASS，系统将在发信时自动安全拦截并提醒)
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all"
                >
                  保持沙盒环境
                </button>
                <button
                  type="button"
                  onClick={() => applyModeChange('real')}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>确认开启真实环境</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render for Card / Banner Variant (used in Settings or Workflow Engine)
  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        mode === 'real'
          ? 'bg-gradient-to-r from-emerald-950/30 to-teal-950/20 border-emerald-500/30'
          : 'bg-gradient-to-r from-amber-950/30 to-orange-950/20 border-amber-500/30'
      } ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              mode === 'real'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}
          >
            {mode === 'real' ? <Rocket className="w-5 h-5 animate-pulse" /> : <Shield className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {mode === 'real' ? '🚀 真实商业生产环境 (Live Outbound Active)' : '🛡️ 安全沙盒仿真环境 (Sandbox Safe Mode)'}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  mode === 'real'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {mode === 'real' ? 'REAL_SMTP' : 'SANDBOX_SIM'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'real'
                ? `自动化工作流及邮件触达将真正通过腾讯企业邮 (${smtpUser}) 投递至客户商业邮箱。`
                : '所有外网发信与触达操作严格受安全沙盒阻断仿真保护，全程模拟并记录日志，绝不骚扰真实企业。'}
            </p>
          </div>
        </div>

        {/* Action Toggle Switch */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              mode === 'real'
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isUpdating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : mode === 'real' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>切回安全沙盒模式</span>
              </>
            ) : (
              <>
                <Rocket className="w-3.5 h-3.5" />
                <span>开启真实生产环境</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
