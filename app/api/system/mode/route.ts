import { NextRequest, NextResponse } from 'next/server';
import { getSystemEnvMode, setSystemEnvMode, SystemEnvironmentMode } from '@/lib/system-env';
import { mailer } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mode = getSystemEnvMode();
  const isSmtpConfigured = mailer.isRealSmtpConfigured();
  const config = mailer.getSmtpConfig();

  return NextResponse.json({
    mode,
    isSmtpConfigured,
    smtpUser: config.user,
    smtpHost: config.host,
    smtpPort: config.port,
    isRealActive: mode === 'real' && isSmtpConfigured,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetMode = body.mode as SystemEnvironmentMode;

    if (targetMode !== 'sandbox' && targetMode !== 'real') {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "sandbox" or "real".' },
        { status: 400 }
      );
    }

    const state = setSystemEnvMode(targetMode);
    const isSmtpConfigured = mailer.isRealSmtpConfigured();
    const config = mailer.getSmtpConfig();

    return NextResponse.json({
      success: true,
      mode: state.mode,
      updatedAt: state.updatedAt,
      isSmtpConfigured,
      smtpUser: config.user,
      smtpHost: config.host,
      isRealActive: state.mode === 'real' && isSmtpConfigured,
      message:
        targetMode === 'real'
          ? isSmtpConfigured
            ? '已切换为真实生产环境 (已连接腾讯企业邮，真实投递已生效)'
            : '已切换为真实生产环境 (提示: .env 中未配置 SMTP_PASS，系统将在发信前提醒)'
          : '已切换为安全沙盒环境 (发信将进行安全仿真，绝不会向真实客户外发邮件)',
    });
  } catch (error: any) {
    console.error('Failed to update system mode:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
