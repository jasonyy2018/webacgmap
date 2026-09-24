import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = parseInt(id);
  const { generated_email } = await req.json();

  try {
    await prisma.leadAnalysis.update({
      where: { lead_id: leadId },
      data: {
        generated_email: generated_email,
      },
    });
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Failed to update analysis:', error);
    return NextResponse.json({ error: 'Failed to update analysis' }, { status: 500 });
  }
}
