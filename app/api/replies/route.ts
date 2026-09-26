import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const replies = await prisma.leadReply.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            contact_email: true,
            phone: true,
            search_location: true,
            rating: true,
            status: true,
            ai_score: true
          }
        }
      }
    });

    return NextResponse.json(replies);
  } catch (error: any) {
    console.error('Failed to fetch replies:', error);
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}

// Inbound email webhook or general reply ingestion
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id, from_email, from_name, content, subject, source } = body;

    let targetLead = null;
    if (lead_id) {
      targetLead = await prisma.lead.findUnique({ where: { id: parseInt(lead_id) } });
    } else if (from_email) {
      targetLead = await prisma.lead.findFirst({ where: { contact_email: from_email } });
    }

    if (!targetLead) {
      const generatedName = from_name || (from_email ? from_email.split('@')[0] : 'Inbound Client');
      const uniquePlaceId = `inbound_reply_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      targetLead = await prisma.lead.create({
        data: {
          name: generatedName,
          contact_email: from_email || 'inbound@client.com',
          search_location: 'Inbound Message',
          industry: 'Direct Consultation',
          place_id: uniquePlaceId,
          rating: 5.0,
          status: 'replied',
          ai_score: 90,
          ai_grade: 'A',
          ai_status: 'completed',
          ai_tags: JSON.stringify(['Inbound Mail', 'jyu@wisdomitc.com']),
        }
      });
    }

    // AI sentiment and intent analysis
    const aiAnalysis = await aiService.analyzeCustomerReply(content, targetLead.name);

    const savedReply = await prisma.leadReply.create({
      data: {
        lead_id: targetLead.id,
        from_email: from_email || targetLead.contact_email || 'unknown@client.com',
        from_name: from_name || targetLead.name,
        subject: subject || `Re: Web Modernization Proposal for ${targetLead.name}`,
        content,
        sentiment: aiAnalysis.sentiment || 'INTERESTED',
        ai_summary: aiAnalysis.ai_summary,
        ai_suggested_reply: aiAnalysis.ai_suggested_reply,
        source: source || 'email_reply',
        is_read: false
      }
    });

    // Advance Lead pipeline status
    const newStatus = aiAnalysis.sentiment === 'BOOKING_REQUEST' ? 'meeting_booked' : 'replied';
    await prisma.lead.update({
      where: { id: targetLead.id },
      data: {
        status: newStatus,
        last_contacted: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Inbound reply successfully recorded and analyzed',
      reply: savedReply
    });
  } catch (error: any) {
    console.error('Failed to record reply:', error);
    return NextResponse.json({ error: `Failed to record reply: ${error.message}` }, { status: 500 });
  }
}

// Mark reply as read
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_read } = body;
    if (!id) return NextResponse.json({ error: 'Missing reply ID' }, { status: 400 });

    const updated = await prisma.leadReply.update({
      where: { id: parseInt(id) },
      data: { is_read: is_read ?? true }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Failed to update reply status:', error);
    return NextResponse.json({ error: 'Failed to update reply' }, { status: 500 });
  }
}
