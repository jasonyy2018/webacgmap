import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseReady } from '@/lib/db-init';
import { emailVerifier } from '@/lib/email-verifier';
import { emailHunter } from '@/lib/email-hunter';

export const dynamic = 'force-dynamic';

/**
 * GET: Deliverability Statistics & Bounced Lead Audit
 */
export async function GET() {
  try {
    await ensureDatabaseReady();

    const totalLeads = await prisma.lead.count();
    const leadsWithEmail = await prisma.lead.count({
      where: {
        contact_email: { not: null },
      },
    });

    // Contacted leads are those that have been sent to (including those that bounced)
    const contactedLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { status: { in: ['contacted', 'greeting_sent', 'followup_sent', 'replied', 'meeting_booked', 'closed_won', 'bounced'] } },
          { contact_attempts: { gt: 0 } },
          { email_status: 'bounced' },
        ],
      },
      select: {
        id: true,
        name: true,
        contact_email: true,
        status: true,
        email_status: true,
        bounce_reason: true,
        bounced_at: true,
      },
    });

    const totalContacted = contactedLeads.length;

    // Bounced leads (either explicitly marked bounced or email_status is bounced)
    const bouncedLeadsList = await prisma.lead.findMany({
      where: {
        OR: [
          { status: 'bounced' },
          { email_status: 'bounced' },
          { email_status: 'invalid_domain' },
          { email_status: 'invalid_syntax' },
          { bounce_reason: { not: null } },
        ],
      },
      select: {
        id: true,
        name: true,
        contact_email: true,
        phone: true,
        website: true,
        search_location: true,
        industry: true,
        status: true,
        email_status: true,
        bounce_reason: true,
        bounced_at: true,
        updated_at: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    const bouncedCount = bouncedLeadsList.length;
    const deliveredCount = Math.max(0, totalContacted - bouncedCount);

    const deliveryRate = totalContacted > 0
      ? Number(((deliveredCount / totalContacted) * 100).toFixed(1))
      : 100.0;

    const bounceRate = totalContacted > 0
      ? Number(((bouncedCount / totalContacted) * 100).toFixed(1))
      : 0.0;

    // Sender reputation health status based on international deliverability benchmarks
    // Healthy: < 2.0%, Warning: 2.0% - 5.0%, Danger: > 5.0%
    let healthRating = 'EXCELLENT';
    let healthLabel = '极度健康 (发信信誉优良)';
    let healthColor = '#10b981';

    if (bounceRate > 5.0) {
      healthRating = 'CRITICAL';
      healthLabel = '高危警报 (退信率超标，需立即清洗)';
      healthColor = '#ef4444';
    } else if (bounceRate > 2.5) {
      healthRating = 'WARNING';
      healthLabel = '轻微预警 (建议先执行前置 MX 校验)';
      healthColor = '#f59e0b';
    }

    return NextResponse.json({
      status: 'success',
      metrics: {
        total_leads: totalLeads,
        leads_with_email: leadsWithEmail,
        total_contacted: totalContacted,
        delivered_count: deliveredCount,
        bounced_count: bouncedCount,
        delivery_rate: deliveryRate,
        bounce_rate: bounceRate,
        health: {
          rating: healthRating,
          label: healthLabel,
          color: healthColor,
          benchmark_target: '国际标准退信率需控制在 2% 以内',
        },
      },
      bounced_leads: bouncedLeadsList,
    });
  } catch (error: any) {
    console.error('Error fetching bounce metrics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Bounce Ingestion, Raw Text Parsing, Batch DNS MX Pre-flight Scan
 */
export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const action = body.action || 'parse_and_mark';

    // -------------------------------------------------------------
    // ACTION 1: Parse Raw Text / Email List & Mark Bounced Leads
    // -------------------------------------------------------------
    if (action === 'parse_and_mark') {
      const rawText = body.raw_text || body.text || '';
      const directEmails: string[] = Array.isArray(body.emails) ? body.emails : [];

      let targetEmails = new Set<string>();
      let reasonMap: Record<string, string> = {};

      if (rawText) {
        const parsed = emailVerifier.parseBounceText(rawText);
        parsed.extractedEmails.forEach((e) => targetEmails.add(e.toLowerCase().trim()));
        reasonMap = { ...reasonMap, ...parsed.failureReasons };
      }

      directEmails.forEach((e) => {
        if (e && typeof e === 'string') {
          const clean = e.toLowerCase().trim();
          targetEmails.add(clean);
          if (!reasonMap[clean]) {
            reasonMap[clean] = body.reason || '邮箱地址不存在或已被注销 (550 User Unknown)';
          }
        }
      });

      const emailList = Array.from(targetEmails);
      if (emailList.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: '未检测到任何有效的退信邮箱地址，请直接粘贴退信邮件内容或提供邮箱列表。',
        }, { status: 400 });
      }

      // Find matching leads in database
      const matchedLeads = await prisma.lead.findMany({
        where: {
          contact_email: { in: emailList },
        },
      });

      const updatedLeadIds: number[] = [];
      const now = new Date();

      for (const lead of matchedLeads) {
        let currentTags: string[] = [];
        try {
          currentTags = JSON.parse(lead.ai_tags || '[]');
        } catch {
          currentTags = [];
        }
        if (!currentTags.includes('BOUNCED_DEAD_EMAIL')) {
          currentTags.push('BOUNCED_DEAD_EMAIL');
        }

        const reason = reasonMap[lead.contact_email?.toLowerCase() || ''] || '550 Recipient address rejected';

        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: 'bounced',
            email_status: 'bounced',
            bounce_reason: reason,
            bounced_at: now,
            ai_tags: JSON.stringify(currentTags),
          },
        });
        updatedLeadIds.push(lead.id);
      }

      return NextResponse.json({
        status: 'success',
        message: `成功解析 ${emailList.length} 个退信地址，已将库中 ${updatedLeadIds.length} 个商机标记为【死信/退信】并予以永久隔离！`,
        analyzed_emails: emailList,
        matched_lead_count: updatedLeadIds.length,
        matched_leads: matchedLeads.map((l) => ({ id: l.id, name: l.name, email: l.contact_email })),
        unmatched_emails: emailList.filter((e) => !matchedLeads.some((l) => l.contact_email?.toLowerCase() === e)),
      });
    }

    // -------------------------------------------------------------
    // ACTION 2: Pre-flight DNS MX Scan for All Pending Leads
    // -------------------------------------------------------------
    if (action === 'preflight_verify_all') {
      const candidates = await prisma.lead.findMany({
        where: {
          contact_email: { not: null },
          status: { notIn: ['bounced', 'ignored'] },
          email_status: { not: 'valid' },
        },
        take: body.limit || 50,
      });

      let checkedCount = 0;
      let validCount = 0;
      let invalidCount = 0;
      const flaggedLeads: any[] = [];

      for (const lead of candidates) {
        if (!lead.contact_email) continue;
        checkedCount++;

        const result = await emailVerifier.verifyEmail(lead.contact_email);
        if (!result.valid) {
          invalidCount++;
          let currentTags: string[] = [];
          try {
            currentTags = JSON.parse(lead.ai_tags || '[]');
          } catch {
            currentTags = [];
          }
          if (!currentTags.includes('INVALID_DOMAIN_NO_MX')) {
            currentTags.push('INVALID_DOMAIN_NO_MX');
          }

          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              status: 'bounced',
              email_status: result.status,
              bounce_reason: `[前置拦截] ${result.reason}`,
              bounced_at: new Date(),
              ai_tags: JSON.stringify(currentTags),
            },
          });

          flaggedLeads.push({
            id: lead.id,
            name: lead.name,
            email: lead.contact_email,
            reason: result.reason,
            status: result.status,
          });
        } else {
          validCount++;
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              email_status: 'valid',
            },
          });
        }
      }

      return NextResponse.json({
        status: 'success',
        message: `前置 MX 深度体检完成：共扫描 ${checkedCount} 个待发客户，健康有效 ${validCount} 个，提前拦截并隔离无效死信 ${invalidCount} 个！`,
        scanned: checkedCount,
        valid: validCount,
        invalid: invalidCount,
        flagged: flaggedLeads,
      });
    }

    // -------------------------------------------------------------
    // ACTION 3: Restore / Update Lead with New Valid Email
    // -------------------------------------------------------------
    if (action === 'update_email_and_restore') {
      const leadId = Number(body.lead_id);
      const newEmail = (body.new_email || '').trim();

      if (!leadId || !newEmail) {
        return NextResponse.json({ error: 'lead_id and new_email are required' }, { status: 400 });
      }

      // Verify the new email first
      const verification = await emailVerifier.verifyEmail(newEmail);
      if (!verification.valid) {
        return NextResponse.json({
          status: 'error',
          message: `新邮箱验证未通过: ${verification.reason}`,
          details: verification,
        }, { status: 400 });
      }

      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      let currentTags: string[] = [];
      try {
        currentTags = JSON.parse(lead.ai_tags || '[]');
      } catch {
        currentTags = [];
      }
      currentTags = currentTags.filter((t) => t !== 'BOUNCED_DEAD_EMAIL' && t !== 'INVALID_DOMAIN_NO_MX');
      currentTags.push('VERIFIED_VALID_EMAIL');

      const updated = await prisma.lead.update({
        where: { id: leadId },
        data: {
          contact_email: newEmail,
          status: 'pending',
          email_status: 'valid',
          bounce_reason: null,
          bounced_at: null,
          ai_tags: JSON.stringify(currentTags),
        },
      });

      return NextResponse.json({
        status: 'success',
        message: `客户 "${lead.name}" 邮箱已成功更新为 ${newEmail}，MX 校验通过，已解除隔离恢复正常外发生命周期！`,
        lead: updated,
      });
    }

    // -------------------------------------------------------------
    // ACTION 4: Deep Hunt & Recover Valid Emails for All Leads
    // -------------------------------------------------------------
    if (action === 'deep_hunt_all') {
      const candidates = await prisma.lead.findMany({
        where: {
          status: { notIn: ['contacted', 'greeting_sent', 'followup_sent', 'replied', 'meeting_booked', 'closed_won'] },
          OR: [
            { email_status: { not: 'valid' } },
            { email_status: null },
            { contact_email: null },
          ]
        },
        take: body.limit || 30,
      });

      let scannedCount = 0;
      let recoveredCount = 0;
      let deadCount = 0;
      const recoveredList: any[] = [];
      const deadList: any[] = [];

      for (const lead of candidates) {
        scannedCount++;
        const huntResult = await emailHunter.findValidEmailForLead(lead);

        if (huntResult.found && huntResult.email) {
          recoveredCount++;
          let tags: string[] = [];
          try {
            tags = JSON.parse(lead.ai_tags || '[]');
          } catch {
            tags = [];
          }
          tags = tags.filter((t) => t !== 'BOUNCED_DEAD_EMAIL' && t !== 'NO_VALID_EMAIL' && t !== 'INVALID_DOMAIN_NO_MX');
          tags.push('EMAIL_AUTO_DISCOVERED');

          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              contact_email: huntResult.email,
              email_status: 'valid',
              status: lead.status === 'bounced' ? 'pending' : lead.status,
              bounce_reason: null,
              bounced_at: null,
              ai_tags: JSON.stringify(tags),
            }
          });

          recoveredList.push({
            id: lead.id,
            name: lead.name,
            email: huntResult.email,
            source: huntResult.source,
          });
        } else {
          deadCount++;
          let tags: string[] = [];
          try {
            tags = JSON.parse(lead.ai_tags || '[]');
          } catch {
            tags = [];
          }
          if (!tags.includes('NO_VALID_EMAIL')) tags.push('NO_VALID_EMAIL');

          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              status: 'bounced',
              email_status: 'no_valid_email',
              bounce_reason: huntResult.reason || '深度嗅探：官网与全网未发现有效可用邮箱',
              bounced_at: new Date(),
              ai_tags: JSON.stringify(tags),
            }
          });

          deadList.push({
            id: lead.id,
            name: lead.name,
            reason: huntResult.reason,
          });
        }
      }

      return NextResponse.json({
        status: 'success',
        message: `全网深度邮箱嗅探完成：共检索 ${scannedCount} 个商机，成功发掘并校验通过真实邮箱 ${recoveredCount} 家，标记无效死信 ${deadCount} 家并已永久隔离！`,
        scanned: scannedCount,
        recovered: recoveredCount,
        dead: deadCount,
        recovered_leads: recoveredList,
        dead_leads: deadList,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing bounce action:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
