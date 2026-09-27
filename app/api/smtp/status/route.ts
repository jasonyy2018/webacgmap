import { NextRequest, NextResponse } from 'next/server';
import { mailer } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = mailer.getSmtpConfig();
  const isConfigured = mailer.isRealSmtpConfigured();

  return NextResponse.json({
    isConfigured,
    mode: isConfigured ? 'real_smtp' : 'sandbox_simulation',
    host: config.host,
    port: config.port,
    user: config.user,
    senderName: config.senderName,
    message: isConfigured 
      ? `已配置腾讯企业邮真实发信模式 (${config.user})`
      : '未填写 SMTP_PASS，系统运行于安全沙盒模拟发信模式。',
  });
}

export async function POST() {
  const verification = await mailer.verifyConnection();
  return NextResponse.json(verification);
}
