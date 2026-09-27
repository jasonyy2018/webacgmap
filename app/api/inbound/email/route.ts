import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/ai';
import { emailVerifier } from '@/lib/email-verifier';
import { ensureDatabaseReady } from '@/lib/db-init';

export const dynamic = 'force-dynamic';

export const OFFICIAL_INBOUND_EMAIL = 'jyu@wisdomitc.com';

// GET: Returns mailbox connection status and documentation for webhook setup
export async function GET() {
  try {
    const totalDeliveries = await prisma.leadReply.count({
      where: {
        OR: [
          { source: 'direct_email' },
          { source: 'email_inbound' },
          { source: 'web_contact' },
        ]
      }
    });

    return NextResponse.json({
      status: 'active',
      mailbox: OFFICIAL_INBOUND_EMAIL,
      protocol: 'Webhook / Inbound Parse / SMTP Receiver',
      total_inbound_deliveries: totalDeliveries,
      instructions: {
        description: 'Send inbound email payloads (JSON or FormData) from SendGrid Inbound Parse, Cloudflare Email Routing, Postmark, or AWS SES.',
        endpoint: '/api/inbound/email',
        method: 'POST',
        supportedFields: ['from_email', 'from_name', 'to', 'subject', 'content', 'type']
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Ingest email delivery to jyu@wisdomitc.com
export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    let payload: any = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        payload[key] = value.toString();
      });
    } else {
      try {
        payload = await req.json();
      } catch {
        payload = {};
      }
    }

    const from_email = payload.from_email || payload.from || payload.sender || payload.envelope?.from;
    const from_name = payload.from_name || payload.sender_name || payload.name || (from_email ? from_email.split('@')[0] : 'Inbound Sender');
    const to = payload.to || payload.recipient || OFFICIAL_INBOUND_EMAIL;
    const subject = payload.subject || 'Direct Inquiry / Feedback via Mailbox';
    const content = payload.content || payload.text || payload.body || payload.html || payload.message || '';
    const category = payload.category || payload.type || 'direct_inquiry';

    if (!from_email || !content) {
      return NextResponse.json({
        error: 'Missing required email fields: from_email and content are required.'
      }, { status: 400 });
    }

    // 0. Detect if this is an automated NDR / Bounce notification (e.g. from mailer-daemon)
    const isBounce = emailVerifier.isBounceNotification(from_email, subject, content);
    if (isBounce) {
      console.log(`🛡️ [INBOUND BOUNCE DETECTED]: Received NDR notification from ${from_email}, parsing...`);
      const parsed = emailVerifier.parseBounceText(`${subject} \n ${content}`);
      
      const matchedLeads = await prisma.lead.findMany({
        where: {
          contact_email: { in: parsed.extractedEmails }
        }
      });

      const updatedIds: number[] = [];
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

        const reason = parsed.failureReasons[lead.contact_email?.toLowerCase() || ''] || '550 Recipient address rejected';

        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: 'bounced',
            email_status: 'bounced',
            bounce_reason: reason,
            bounced_at: new Date(),
            ai_tags: JSON.stringify(currentTags),
          }
        });
        updatedIds.push(lead.id);
      }

      return NextResponse.json({
        success: true,
        is_bounce: true,
        message: `成功拦截入站退信通知，已识别并隔离 ${matchedLeads.length} 个失效商机客户`,
        extracted_emails: parsed.extractedEmails,
        bounced_leads: matchedLeads.map((l) => ({ id: l.id, name: l.name, email: l.contact_email }))
      });
    }

    // 1. Locate existing lead or create a new lead record
    let targetLead = await prisma.lead.findFirst({
      where: { contact_email: from_email }
    });

    if (!targetLead) {
      const uniquePlaceId = `email_inbound_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      targetLead = await prisma.lead.create({
        data: {
          name: from_name,
          contact_email: from_email,
          search_location: 'Direct Mailbox Delivery',
          industry: category === 'feedback' ? 'User Feedback' : 'Direct Client Consultation',
          place_id: uniquePlaceId,
          rating: 5.0,
          status: 'replied',
          ai_score: 92,
          ai_grade: 'A',
          ai_status: 'completed',
          ai_tags: JSON.stringify(['Direct Email to jyu@wisdomitc.com', category.toUpperCase()]),
        }
      });
    } else {
      await prisma.lead.update({
        where: { id: targetLead.id },
        data: {
          status: 'replied',
          last_contacted: new Date()
        }
      });
    }

    // 2. Perform AI analysis for sentiment, executive intent summary, and suggested reply
    const aiAnalysis = await aiService.analyzeCustomerReply(content, targetLead.name);

    // 3. Record in LeadReply table
    const createdReply = await prisma.leadReply.create({
      data: {
        lead_id: targetLead.id,
        from_email: from_email,
        from_name: from_name,
        subject: subject,
        content: content,
        sentiment: aiAnalysis.sentiment || 'CONSULTATION',
        ai_summary: aiAnalysis.ai_summary,
        ai_suggested_reply: aiAnalysis.ai_suggested_reply,
        source: 'direct_email',
        is_read: false
      }
    });

    return NextResponse.json({
      success: true,
      message: `Inbound email successfully ingested for mailbox ${OFFICIAL_INBOUND_EMAIL}`,
      lead: targetLead,
      reply: createdReply
    });
  } catch (error: any) {
    console.error('Failed to ingest inbound email:', error);
    return NextResponse.json({ error: error.message || 'Failed to process email' }, { status: 500 });
  }
}
