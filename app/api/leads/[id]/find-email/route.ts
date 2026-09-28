import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseReady } from '@/lib/db-init';
import { emailHunter } from '@/lib/email-hunter';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = parseInt(id);

  try {
    await ensureDatabaseReady();

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const huntResult = await emailHunter.findValidEmailForLead(lead);

    if (huntResult.found && huntResult.email) {
      let tags: string[] = [];
      try {
        tags = JSON.parse(lead.ai_tags || '[]');
      } catch {
        tags = [];
      }
      tags = tags.filter((t) => t !== 'BOUNCED_DEAD_EMAIL' && t !== 'NO_VALID_EMAIL' && t !== 'INVALID_DOMAIN_NO_MX');
      tags.push('EMAIL_AUTO_DISCOVERED');

      const updated = await prisma.lead.update({
        where: { id: leadId },
        data: {
          contact_email: huntResult.email,
          email_status: 'valid',
          bounce_reason: null,
          bounced_at: null,
          ai_tags: JSON.stringify(tags),
        },
      });

      return NextResponse.json({
        success: true,
        message: `成功嗅探并验证通过有效邮箱: ${huntResult.email}`,
        email: huntResult.email,
        source: huntResult.source,
        lead: updated,
      });
    } else {
      // Mark as uncontactable / dead email so it is never retried
      let tags: string[] = [];
      try {
        tags = JSON.parse(lead.ai_tags || '[]');
      } catch {
        tags = [];
      }
      if (!tags.includes('NO_VALID_EMAIL')) {
        tags.push('NO_VALID_EMAIL');
      }

      const updated = await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: 'bounced',
          email_status: 'no_valid_email',
          bounce_reason: huntResult.reason || '全网未发现有效 MX 邮箱',
          bounced_at: new Date(),
          ai_tags: JSON.stringify(tags),
        },
      });

      return NextResponse.json({
        success: false,
        message: huntResult.reason || '未能找到有效邮箱',
        reason: huntResult.reason,
        testedCandidates: huntResult.testedCandidates,
        lead: updated,
      });
    }
  } catch (error: any) {
    console.error('Error finding email for lead:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
