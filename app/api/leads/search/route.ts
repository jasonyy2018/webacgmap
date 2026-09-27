import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mapsService } from '@/lib/maps';
import { ensureDatabaseReady } from '@/lib/db-init';

export const dynamic = 'force-dynamic';

async function handleSearch(req: NextRequest) {
  await ensureDatabaseReady();
  const { searchParams } = new URL(req.url);
  let query = searchParams.get('query');
  let location = searchParams.get('location');

  if (!query && req.method === 'POST') {
    try {
      const body = await req.json();
      query = body.query || query;
      location = body.location || location;
    } catch (e) {
      // optional json body parse
    }
  }

  if (!query) {
    return NextResponse.json(
      { error: 'Query is required. Example: /api/leads/search?query=Mechanical+Seals&location=Russia' },
      { status: 400 }
    );
  }

  try {
    const results = await mapsService.searchPlaces(query, location || undefined);
    
    const savedLeads = [];
    for (const r of results) {
      try {
        let lead = await prisma.lead.findUnique({
          where: { place_id: r.place_id },
          include: { analysis: true },
        });

        if (!lead) {
          lead = await prisma.lead.create({
            data: {
              name: r.name || "Unknown Business",
              address: r.address,
              website: r.website,
              phone: r.phone,
              contact_email: r.contact_email || null,
              rating: r.rating,
              place_id: r.place_id!,
              search_query: query,
              search_location: location,
            },
            include: { analysis: true },
          });

          // Trigger AI audit for all discovered businesses (both with and without websites)
          fetch(`${req.nextUrl.origin}/api/leads/${lead.id}/analyze`, {
            method: 'POST',
          }).catch(err => console.error('Background analysis trigger failed:', err));
        }
        
        let detailedEdmData = {};
        if (lead.analysis?.detailed_analysis) {
          try {
            detailedEdmData = JSON.parse(lead.analysis.detailed_analysis);
          } catch (e) {
            // ignore parse err
          }
        }

        savedLeads.push({
          id: lead.id,
          companyName: lead.name,
          name: lead.name,
          address: lead.address,
          website: lead.website || '',
          phone: lead.phone || '',
          contact_email: lead.contact_email || r.contact_email || '',
          rating: lead.rating,
          place_id: lead.place_id,
          search_query: query,
          search_location: location,
          ai_tags: JSON.parse(lead.ai_tags || '[]'),
          analysis: lead.analysis ? {
            ...lead.analysis,
            tech_stack: JSON.parse(lead.analysis.tech_stack || '[]'),
            email_subjects: JSON.parse(lead.analysis.email_subjects || '[]'),
            ...detailedEdmData,
          } : null,
        });
      } catch (error) {
        console.error(`Error saving lead ${r.name}:`, error);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      total: savedLeads.length,
      query,
      location,
      leads: savedLeads
    });
  } catch (error: any) {
    console.error('Error in search:', error);
    return NextResponse.json({ error: `Maps search failed: ${error.message}` }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleSearch(req);
}

export async function POST(req: NextRequest) {
  return handleSearch(req);
}
