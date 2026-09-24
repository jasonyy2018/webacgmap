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
  const { instruction } = await req.json();

  if (!instruction) {
    return NextResponse.json({ error: 'Instruction is required' }, { status: 400 });
  }

  try {
    const analysis = await prisma.leadAnalysis.findUnique({
      where: { lead_id: leadId },
    });

    if (!analysis || !analysis.generated_email) {
      return NextResponse.json({ error: 'No generated email found to refine' }, { status: 404 });
    }

    const refinedContent = await aiService.refineEmailContent(analysis.generated_email, instruction);
    
    await prisma.leadAnalysis.update({
      where: { lead_id: leadId },
      data: {
        generated_email: refinedContent,
      },
    });

    return NextResponse.json({ status: 'success', refined_email: refinedContent });
  } catch (error) {
    console.error('Email refinement failed:', error);
    return NextResponse.json({ error: 'Email refinement failed' }, { status: 500 });
  }
}
