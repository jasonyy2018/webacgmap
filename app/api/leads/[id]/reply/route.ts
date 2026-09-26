import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = parseInt(id);

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const body = await req.json();
    const { from_email, from_name, content, subject, source } = body;

    if (!content) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
    }

    // AI analysis
    const aiAnalysis = await aiService.analyzeCustomerReply(content, lead.name);

    const savedReply = await prisma.leadReply.create({
      data: {
        lead_id: leadId,
        from_email: from_email || lead.contact_email || 'client@business.com',
        from_name: from_name || lead.name,
        subject: subject || `Re: Proposal for ${lead.name}`,
        content,
        sentiment: aiAnalysis.sentiment || 'INTERESTED',
        ai_summary: aiAnalysis.ai_summary,
        ai_suggested_reply: aiAnalysis.ai_suggested_reply,
        source: source || 'proposal_inquiry',
        is_read: false
      }
    });

    // Advance Lead pipeline
    const newStatus = aiAnalysis.sentiment === 'BOOKING_REQUEST' ? 'meeting_booked' : 'replied';
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: newStatus,
        last_contacted: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      reply: savedReply
    });
  } catch (error: any) {
    console.error('Failed to save reply:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
