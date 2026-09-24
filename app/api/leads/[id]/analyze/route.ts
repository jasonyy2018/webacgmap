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
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { ai_status: 'analyzing' },
    });

    const websiteData = lead.website
      ? await aiService.fetchWebsiteContent(lead.website)
      : { text: `No official website listed on Google Maps for ${lead.name}. Needs web presence setup.`, hasViewport: false, loadTimeMs: 10000, isHttps: false };
      
    const analysisResult = await aiService.analyzeWebsite(lead.name, websiteData, {
      rating: lead.rating ?? undefined,
      location: lead.search_location ?? undefined,
      website: lead.website ?? undefined,
      industry: lead.industry ?? undefined,
    });

    if ((analysisResult as any).error) {
      throw new Error((analysisResult as any).error);
    }

    const emailSequence = await aiService.generateOutreachSequence(lead, analysisResult);
    const generatedEmail = emailSequence[0]?.content || await aiService.generateOutreachEmail(lead, analysisResult);

    const detailedEdmData = {
      need_category: analysisResult.need_category || (lead.website ? 'LOW_CONVERSION_DESIGN' : 'NO_WEBSITE'),
      need_urgency: analysisResult.need_urgency || 'high',
      load_speed_score: analysisResult.load_speed_score || 50,
      mobile_score: analysisResult.mobile_score || 40,
      seo_score: analysisResult.seo_score || 50,
      estimated_lost_visitors_monthly: analysisResult.estimated_lost_visitors_monthly || 250,
      custom_greeting: analysisResult.custom_greeting || `Great to connect with ${lead.name}!`,
      personalized_hook: analysisResult.personalized_hook || 'We observed several optimization opportunities on your site.',
      email_sequence: emailSequence,
    };

    await prisma.leadAnalysis.upsert({
      where: { lead_id: lead.id },
      update: {
        tech_stack: JSON.stringify(analysisResult.tech_stack || []),
        ux_assessment: analysisResult.ux_assessment,
        mobile_friendly: analysisResult.mobile_friendly,
        business_insight: analysisResult.business_insight,
        detailed_analysis: JSON.stringify(detailedEdmData),
        ai_confidence: (analysisResult.score || 80) / 100,
        generated_email: generatedEmail,
        email_subjects: JSON.stringify(analysisResult.email_subjects || []),
      },
      create: {
        lead_id: lead.id,
        tech_stack: JSON.stringify(analysisResult.tech_stack || []),
        ux_assessment: analysisResult.ux_assessment,
        mobile_friendly: analysisResult.mobile_friendly,
        business_insight: analysisResult.business_insight,
        detailed_analysis: JSON.stringify(detailedEdmData),
        ai_confidence: (analysisResult.score || 80) / 100,
        generated_email: generatedEmail,
        email_subjects: JSON.stringify(analysisResult.email_subjects || []),
      },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        ai_status: 'completed',
        status: lead.status === 'pending' ? 'analyzed' : lead.status,
        ai_score: analysisResult.score || 80,
        ai_grade: analysisResult.grade || 'A',
        ai_tags: JSON.stringify([
          analysisResult.need_category || 'WEB_REDESIGN',
          ...(analysisResult.tech_stack || [])
        ]),
        contact_email: lead.contact_email || analysisResult.contact_email || null,
      },
    });

    return NextResponse.json({ status: 'success', message: 'Analysis completed' });
  } catch (error: any) {
    console.error(`Analysis failed for lead ${leadId}:`, error);
    await prisma.lead.update({
      where: { id: leadId },
      data: { ai_status: 'failed' },
    });
    return NextResponse.json({ error: `Analysis failed: ${error.message}` }, { status: 500 });
  }
}
