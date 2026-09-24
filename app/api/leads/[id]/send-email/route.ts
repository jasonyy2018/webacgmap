import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const targetEmail = payload.toEmail || lead.contact_email;
    if (!targetEmail) {
      return NextResponse.json({ error: 'Lead has no contact email. Please enter one before dispatching.' }, { status: 400 });
    }

    const emailSubject = payload.subject || `Web Presence Proposal for ${lead.name}`;
    const emailBody = payload.content || lead.analysis?.generated_email || 'Hello...';
    const stage = payload.stage || 'greeting_sent';

    console.log(`=========================================`);
    console.log(`[EDM DISPATCH ENGINE] Outbound Email Sent`);
    console.log(`Target: ${targetEmail} (${lead.name})`);
    console.log(`Stage: ${stage}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Body Length: ${emailBody.length} chars`);
    console.log(`=========================================`);

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
        contact_attempts: { increment: 1 },
        last_contacted: new Date(),
      },
    });

    return NextResponse.json({ 
      status: 'success', 
      message: `Email successfully dispatched to ${targetEmail}`,
      dispatchedStage: stage,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: `Failed to send email: ${error.message}` }, { status: 500 });
  }
}
