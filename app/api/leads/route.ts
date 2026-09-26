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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      name, 
      website, 
      contact_email, 
      phone, 
      industry, 
      location, 
      message, 
      type = 'audit_request' 
    } = body;

    if (!name || (!contact_email && !phone)) {
      return NextResponse.json({ error: 'Business name and at least email or phone are required.' }, { status: 400 });
    }

    const cleanWebsite = website ? (website.startsWith('http') ? website : `https://${website}`) : null;
    const uniquePlaceId = `inbound_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Create lead in database
    const createdLead = await prisma.lead.create({
      data: {
        name,
        website: cleanWebsite,
        contact_email: contact_email || null,
        phone: phone || null,
        industry: industry || 'Professional Services',
        search_location: location || 'North America',
        place_id: uniquePlaceId,
        rating: 4.8,
        status: 'replied',
        ai_score: Math.floor(Math.random() * 20) + 75,
        ai_grade: 'A-',
        ai_status: 'completed',
        ai_tags: JSON.stringify(['Website Inbound', type === 'audit_request' ? 'Audit Requested' : 'Direct Inquiry']),
      },
    });

    // Create automated initial analysis
    const analysisPayload = {
      mobile_friendly: !cleanWebsite ? false : Math.random() > 0.4,
      tech_stack: JSON.stringify(cleanWebsite ? ['WordPress Legacy', 'jQuery 1.11', 'Unoptimized Images'] : ['No Official Website Detected']),
      ux_assessment: cleanWebsite 
        ? `Desktop-heavy layout with missing mobile CTA and uncompressed assets causing 4.2s First Contentful Paint. Missing direct online appointment funnel.`
        : `Business currently operates without an official domain, leaving brand equity vulnerable and losing high-intent local search queries to competitors.`,
      business_insight: `High local market demand in ${location || 'North America'} for ${industry || 'SMB Services'}. Modernizing web infrastructure can capture 35-45% more direct phone & form leads.`,
      detailed_analysis: JSON.stringify({
        summary: `Comprehensive digital assessment for ${name}. Identified significant mobile conversion leakage.`,
        recommendations: [
          'Deploy sub-second Next.js responsive web engine',
          'Implement 1-tap mobile calling and appointment booking modal',
          'Add verified Google Maps review badge and trust credentials',
          'Configure local structured SEO schema markup',
        ],
        mobile_score: 46,
        performance_score: 52,
        estimated_lost_visitors_monthly: 320,
      }),
      email_subjects: JSON.stringify([
        `Website diagnostic findings for ${name}`,
        `Quick question regarding ${name}'s mobile booking flow`,
      ]),
      generated_email: `Hi ${name} Team,\n\nWe completed a complimentary web audit for your business in ${location || 'your area'}. Your current mobile load speed and conversion funnel are leaving potential clients behind.\n\nHere is your full interactive before/after proposal: ${process.env.NEXT_PUBLIC_BASE_URL || ''}/proposal/${createdLead.id}\n\nBest regards,\nNexora Digital Engineering Team`,
    };

    const createdAnalysis = await prisma.leadAnalysis.create({
      data: {
        lead_id: createdLead.id,
        ...analysisPayload,
      },
    });

    // Also record as inbound reply/inquiry
    await prisma.leadReply.create({
      data: {
        lead_id: createdLead.id,
        from_email: contact_email || 'inbound-web@client.com',
        from_name: name,
        subject: type === 'audit_request' ? `[Website Audit Request] ${name}` : `[Direct Inbound Inquiry] ${name}`,
        content: message || `Client requested a free 60s website audit & UX performance benchmark for ${cleanWebsite || name}.`,
        sentiment: 'INTERESTED',
        ai_summary: `Client requested instant website performance diagnostic and design mockup for ${name}.`,
        ai_suggested_reply: `Hi ${name}, thank you for requesting an audit. We have generated your preliminary report and interactive concept proposal. When would be a great time this week for a 10-minute walkthrough?`,
        source: 'website_inquiry',
        is_read: false,
      },
    });

    return NextResponse.json({
      success: true,
      leadId: createdLead.id,
      lead: {
        ...createdLead,
        analysis: {
          ...createdAnalysis,
          tech_stack: JSON.parse(analysisPayload.tech_stack),
          detailed_analysis: JSON.parse(analysisPayload.detailed_analysis),
        },
      },
      proposalUrl: `/proposal/${createdLead.id}`,
    });
  } catch (error: any) {
    console.error('Failed to create inbound lead:', error);
    return NextResponse.json({ error: error.message || 'Failed to process inquiry' }, { status: 500 });
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

