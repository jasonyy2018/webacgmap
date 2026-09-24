import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Lead, LeadAnalysis } from '@prisma/client';

type LeadWithAnalysis = Lead & { analysis: LeadAnalysis | null };

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { created_at: 'desc' },
      include: { analysis: true },
    });

    const formattedLeads = leads.map((lead: LeadWithAnalysis) => {
      let detailedEdmData = {};
      if (lead.analysis?.detailed_analysis) {
        try {
          detailedEdmData = JSON.parse(lead.analysis.detailed_analysis);
        } catch (e) {
          // ignore parsing error
        }
      }

      return {
        ...lead,
        ai_tags: JSON.parse(lead.ai_tags || '[]'),
        analysis: lead.analysis ? {
          ...lead.analysis,
          tech_stack: JSON.parse(lead.analysis.tech_stack || '[]'),
          email_subjects: JSON.parse(lead.analysis.email_subjects || '[]'),
          ...detailedEdmData,
        } : null,
      };
    });

    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.lead.deleteMany();
    return NextResponse.json({ status: 'success', message: 'All leads deleted' });
  } catch (error) {
    console.error('Failed to delete leads:', error);
    return NextResponse.json({ error: 'Failed to delete leads' }, { status: 500 });
  }
}
