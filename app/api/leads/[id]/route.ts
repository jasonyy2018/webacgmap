import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
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

    let detailedEdmData = {};
    if (lead.analysis?.detailed_analysis) {
      try {
        detailedEdmData = JSON.parse(lead.analysis.detailed_analysis);
      } catch (e) {
        // ignore parsing error
      }
    }

    const formattedLead = {
      ...lead,
      ai_tags: JSON.parse(lead.ai_tags || '[]'),
      analysis: lead.analysis ? {
        ...lead.analysis,
        tech_stack: JSON.parse(lead.analysis.tech_stack || '[]'),
        email_subjects: JSON.parse(lead.analysis.email_subjects || '[]'),
        ...detailedEdmData,
      } : null,
    };

    return NextResponse.json(formattedLead);
  } catch (error) {
    console.error('Failed to fetch lead:', error);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = parseInt(id);

  try {
    const body = await req.json();
    const allowedFields = ['status', 'contact_email', 'phone', 'website', 'industry'];
    
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
      include: { analysis: true }
    });

    return NextResponse.json(updatedLead);
  } catch (error: any) {
    console.error('Failed to update lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
