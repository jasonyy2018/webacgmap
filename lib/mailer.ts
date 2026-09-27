import nodemailer from 'nodemailer';
import { getSystemEnvMode } from './system-env';
import { emailVerifier } from './email-verifier';

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  fromName?: string;
}

export interface MailerResult {
  success: boolean;
  mode: 'real_smtp' | 'sandbox_simulation';
  messageId?: string;
  from: string;
  to: string;
  error?: string;
}

export const mailer = {
  getSmtpConfig() {
    return {
      host: process.env.SMTP_HOST || 'smtp.exmail.qq.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true, // 465 is SSL secure
      user: process.env.SMTP_USER || 'jyu@wisdomitc.com',
      pass: process.env.SMTP_PASS || '',
      senderName: process.env.SMTP_SENDER_NAME || 'Jason Yu | Nexora Senior Web Strategist',
    };
  },

  isRealSmtpConfigured(): boolean {
    const config = this.getSmtpConfig();
    return Boolean(config.pass && config.pass.trim().length > 0 && config.pass !== 'your_auth_code_here');
  },

  isRealModeActive(): boolean {
    const envMode = getSystemEnvMode();
    return envMode === 'real' && this.isRealSmtpConfigured();
  },

  async verifyConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.isRealSmtpConfigured()) {
      return {
        ok: false,
        message: '未配置 SMTP_PASS 授权码，当前运行于安全沙盒调试模式。',
      };
    }

    const config = this.getSmtpConfig();
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });

      await transporter.verify();
      return {
        ok: true,
        message: `成功连接腾讯企业邮 (${config.host}:${config.port})，发信身份: ${config.user}`,
      };
    } catch (err: any) {
      return {
        ok: false,
        message: `连接腾讯企业邮失败: ${err.message}`,
      };
    }
  },

  async sendEmail(options: SendEmailOptions): Promise<MailerResult> {
    const config = this.getSmtpConfig();
    const fromAddress = `"${options.fromName || config.senderName}" <${config.user}>`;

    // 0. Pre-flight verification (RFC Syntax & DNS MX lookup)
    const verification = await emailVerifier.verifyEmail(options.to);
    if (!verification.valid) {
      console.warn(`⚠️ [PRE-FLIGHT BLOCKED]: Target ${options.to} failed check: ${verification.reason}`);
      return {
        success: false,
        mode: this.isRealModeActive() ? 'real_smtp' : 'sandbox_simulation',
        from: fromAddress,
        to: options.to,
        error: `[前置风控拦截] ${verification.reason}`,
      };
    }

    // 1. If Sandbox mode is active OR SMTP_PASS is not provided, run in Safe Sandbox Mode
    if (!this.isRealModeActive()) {
      const currentMode = getSystemEnvMode();
      const reason = currentMode === 'sandbox' 
        ? '系统当前运行于【安全沙盒环境】(防误发保护中)' 
        : '未配置 SMTP_PASS 授权码';

      console.log('====================================================');
      console.log(`🛡️ [MAILER SANDBOX SIMULATION - ${reason}]`);
      console.log(`From: ${fromAddress}`);
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Status: Simulated delivery (Protection active)`);
      console.log('====================================================');

      return {
        success: true,
        mode: 'sandbox_simulation',
        from: fromAddress,
        to: options.to,
        messageId: `sim-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      };
    }

    // 2. Real SMTP Dispatch via Tencent Exmail
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });

      console.log('====================================================');
      console.log('🚀 [REAL SMTP DISPATCH - TENCENT EXMAIL]');
      console.log(`Host: ${config.host}:${config.port}`);
      console.log(`From: ${fromAddress}`);
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('====================================================');

      const info = await transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text || '',
        html: options.html || options.text?.replace(/\n/g, '<br/>'),
      });

      return {
        success: true,
        mode: 'real_smtp',
        from: fromAddress,
        to: options.to,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error('❌ [REAL SMTP DISPATCH ERROR]:', error.message);
      return {
        success: false,
        mode: 'real_smtp',
        from: fromAddress,
        to: options.to,
        error: error.message,
      };
    }
  },
};
