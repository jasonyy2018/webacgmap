import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mailer } from '@/lib/mailer';
import { getSystemEnvMode } from '@/lib/system-env';
import { generateExecutivePosterHtml, generateExecutivePosterPlainText } from '@/lib/email-poster';
import { emailVerifier } from '@/lib/email-verifier';
import { emailHunter } from '@/lib/email-hunter';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = parseInt(id);

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { analysis: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    let payload: any = {};
    try {
      payload = await req.json();
    } catch (e) {
      // payload may be empty
    }

    let targetEmail = payload.toEmail || lead.contact_email;

    // Check if customer is already flagged as a hard bounce / non-existent recipient
    if (!payload.forceSend && (lead.status === 'bounced' || lead.email_status === 'bounced' || lead.email_status === 'no_valid_email')) {
      return NextResponse.json({
        error: `该客户已被标记为【退信/死信客户】(原因: ${lead.bounce_reason || '邮箱不存在'})。为保护发信服务器信誉，系统已自动隔离。如需重新发送，请先更新为有效邮箱或勾选强制重发。`,
        isBounced: true,
        bounceReason: lead.bounce_reason,
      }, { status: 400 });
    }

    // Step 0: Pre-flight Verification & Automated Email Hunter Recovery
    let verification = targetEmail ? await emailVerifier.verifyEmail(targetEmail) : { valid: false, reason: '未登记有效邮箱' };

    if (!verification.valid && !payload.forceSend) {
      console.log(`🔍 [Email Pre-Check] Lead "${lead.name}" email (${targetEmail || 'none'}) is invalid (${verification.reason}). Hunting for alternatives...`);
      const huntResult = await emailHunter.findValidEmailForLead(lead);

      if (huntResult.found && huntResult.email) {
        console.log(`✓ [Email Pre-Check] Found valid alternative email for "${lead.name}": ${huntResult.email} (Source: ${huntResult.source})`);
        targetEmail = huntResult.email;

        let tags: string[] = [];
        try {
          tags = JSON.parse(lead.ai_tags || '[]');
        } catch {
          tags = [];
        }
        tags = tags.filter((t) => t !== 'BOUNCED_DEAD_EMAIL' && t !== 'NO_VALID_EMAIL' && t !== 'INVALID_DOMAIN_NO_MX');
        tags.push('EMAIL_AUTO_DISCOVERED');

        // Update DB with verified alternative email
        await prisma.lead.update({
          where: { id: leadId },
          data: {
            contact_email: targetEmail,
            email_status: 'valid',
            bounce_reason: null,
            bounced_at: null,
            ai_tags: JSON.stringify(tags),
          },
        });
      } else {
        // Mark as dead / bounced permanently so it is never retried
        let tags: string[] = [];
        try {
          tags = JSON.parse(lead.ai_tags || '[]');
        } catch {
          tags = [];
        }
        if (!tags.includes('BOUNCED_DEAD_EMAIL')) tags.push('BOUNCED_DEAD_EMAIL');
        if (!tags.includes('NO_VALID_EMAIL')) tags.push('NO_VALID_EMAIL');

        await prisma.lead.update({
          where: { id: leadId },
          data: {
            status: 'bounced',
            email_status: 'no_valid_email',
            bounce_reason: huntResult.reason || verification.reason || '前置体检：全网未发现有效可用邮箱',
            bounced_at: new Date(),
            ai_tags: JSON.stringify(tags),
          },
        });

        return NextResponse.json({
          error: `前置风控拦截：原邮箱不可达 (${verification.reason})，且多页面全网深度嗅探未能找到有效可用邮箱。该客户已标记为死信并永久隔离，不再重复发送！`,
          isBounced: true,
          bounceReason: huntResult.reason || verification.reason,
          testedCandidates: huntResult.testedCandidates,
        }, { status: 400 });
      }
    }

    if (!targetEmail) {
      return NextResponse.json({ error: 'Lead has no contact email. Please enter one before dispatching.' }, { status: 400 });
    }

    // Determine public or local origin domain for live proposal links
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const originDomain = `${proto}://${host}`;
    const proposalUrl = `${originDomain}/proposal/${lead.id}`;

    const senderEmail = process.env.SMTP_USER || 'jyu@wisdomitc.com';
    const senderName = process.env.SMTP_SENDER_NAME || 'Jason Yu | Nexora Senior Web Strategist';

    const emailSubject = payload.subject || `2026 Web Architecture Blueprint for ${lead.name} [Confidential Audit]`;

    // 1. Build the exquisite visual HTML poster
    let emailPosterHtml = payload.html;
    if (!emailPosterHtml) {
      if (payload.content && (payload.content.includes('<html') || payload.content.includes('<table') || payload.content.includes('<body'))) {
        emailPosterHtml = payload.content;
      } else {
        emailPosterHtml = generateExecutivePosterHtml(lead as any, {
          originDomain,
          proposalUrl,
          senderName: 'Jason Yu',
          senderRole: 'Senior Web Strategist & Tech Lead',
          senderAgency: 'Nexora Digital Studio',
          replyEmail: senderEmail,
          senderPhone: '+1 (380) 218-4573',
        });
      }
    }

    // 2. Build or sanitize clean text fallback
    let emailPlainText = payload.content && !payload.content.includes('<html')
      ? payload.content
      : generateExecutivePosterPlainText(lead as any, {
          originDomain,
          proposalUrl,
          senderName: 'Jason Yu',
          senderRole: 'Senior Web Strategist & Tech Lead',
          senderAgency: 'Nexora Digital Studio',
          replyEmail: senderEmail,
          senderPhone: '+1 (380) 218-4573',
        });

    // Strictly enforce Jason Yu signature and agency identity
    emailPlainText = emailPlainText
      .replace(/Alex Chen/g, 'Jason Yu')
      .replace(/Jordan Vance/g, 'Jason Yu')
      .replace(/Elena Rostova/g, 'Jason Yu')
      .replace(/Marcus Bell/g, 'Jason Yu')
      .replace(/ApexWeb Studio/g, 'Nexora Digital')
      .replace(/WebPulse Digital/g, 'Nexora Digital')
      .replace(/NextEra Web Design/g, 'Nexora Digital')
      .replace(/Prestige Digital/g, 'Nexora Digital');

    const stage = payload.stage || 'greeting_sent';

    // Dispatch via mailer with both exquisite HTML Poster and plain text fallback
    const mailResult = await mailer.sendEmail({
      to: targetEmail,
      subject: emailSubject,
      text: emailPlainText,
      html: emailPosterHtml,
      fromName: senderName,
    });

    if (!mailResult.success) {
      const errorMsg = mailResult.error || '发送失败';
      const isBounce = errorMsg.includes('前置风控拦截') || 
                       errorMsg.includes('550') || 
                       errorMsg.includes('User unknown') || 
                       errorMsg.includes('not found') || 
                       errorMsg.includes('Recipient address rejected');

      if (isBounce) {
        let currentTags: string[] = [];
        try {
          currentTags = JSON.parse(lead.ai_tags || '[]');
        } catch {
          currentTags = [];
        }
        if (!currentTags.includes('BOUNCED_DEAD_EMAIL')) {
          currentTags.push('BOUNCED_DEAD_EMAIL');
        }

        await prisma.lead.update({
          where: { id: leadId },
          data: {
            status: 'bounced',
            email_status: errorMsg.includes('前置风控拦截') ? 'invalid_domain' : 'bounced',
            bounce_reason: errorMsg,
            bounced_at: new Date(),
            ai_tags: JSON.stringify(currentTags),
          },
        });
      }

      return NextResponse.json({
        error: `邮件投递被拦截/失败: ${errorMsg}`,
        mode: mailResult.mode,
        isBounced: isBounce,
      }, { status: 400 });
    }

    // Determine updated lead status
    let newStatus = 'contacted';
    if (stage === 'stage_1_greeting') newStatus = 'greeting_sent';
    else if (stage === 'stage_2_case_study' || stage === 'stage_3_soft_cta') newStatus = 'followup_sent';
    else if (stage === 'stage_4_breakup') newStatus = 'contacted';

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        contact_email: targetEmail,
        status: newStatus,
        email_status: 'valid',
        contact_attempts: { increment: 1 },
        last_contacted: new Date(),
      },
    });

    const systemMode = getSystemEnvMode();
    let statusMessage = '';
    if (mailResult.mode === 'real_smtp') {
      statusMessage = `[真实外发成功] 邮件已通过腾讯企业邮投递至 ${targetEmail}`;
    } else if (systemMode === 'sandbox') {
      statusMessage = `[沙盒安全仿真] 当前处于沙盒环境，业务状态已推进，未向客户实际发信 (安全防误触)`;
    } else {
      statusMessage = `[沙盒安全仿真] 未配置 SMTP_PASS，业务状态已推进 (配置授权码后可真实投递)`;
    }

    return NextResponse.json({ 
      status: 'success', 
      dispatchMode: mailResult.mode,
      messageId: mailResult.messageId,
      from: `${senderName} <${senderEmail}>`,
      to: targetEmail,
      message: statusMessage,
      dispatchedStage: stage,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: `Failed to send email: ${error.message}` }, { status: 500 });
  }
}
