import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/ai';

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

    if (!lead || !lead.analysis) {
      return NextResponse.json({ error: 'Lead or analysis not found' }, { status: 404 });
    }

    const posterData = await aiService.generatePosterData(lead, JSON.parse(lead.analysis.tech_stack || '[]'));
    
    return NextResponse.json(posterData);
  } catch (error) {
    console.error('Failed to generate poster data:', error);
    return NextResponse.json({ error: 'Failed to generate poster data' }, { status: 500 });
  }
}
