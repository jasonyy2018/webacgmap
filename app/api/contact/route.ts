import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      name, 
      email, 
      phone, 
      website, 
      category = 'CONSULTATION', 
      message 
    } = body;

    if (!name || (!email && !phone)) {
      return NextResponse.json({ 
        error: 'Please provide your name and at least an email or phone number.' 
      }, { status: 400 });
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        error: 'Please enter your inquiry or feedback message.'
      }, { status: 400 });
    }

    const cleanWebsite = website ? (website.startsWith('http') ? website : `https://${website}`) : null;
    const categoryLabels: Record<string, string> = {
      CONSULTATION: 'Web Redesign & Development Inquiry',
      QUOTATION: 'Custom Scope Quotation & RFP',
      FEEDBACK: 'Platform Experience & Usability Feedback',
      PARTNERSHIP: 'Business & Channel Partnership'
    };
    const categoryName = categoryLabels[category] || 'Web Consultation';

    // 1. Check if lead already exists by email
    let targetLead = email ? await prisma.lead.findFirst({ where: { contact_email: email } }) : null;

    if (!targetLead) {
      const uniquePlaceId = `contact_web_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      targetLead = await prisma.lead.create({
        data: {
          name,
          website: cleanWebsite,
          contact_email: email || null,
          phone: phone || null,
          industry: category === 'FEEDBACK' ? 'User Feedback' : 'Direct Web Consultation',
          search_location: 'Official Website Inbound',
          place_id: uniquePlaceId,
          rating: 5.0,
          status: 'replied',
          ai_score: 95,
          ai_grade: 'A+',
          ai_status: 'completed',
          ai_tags: JSON.stringify(['Website Contact Us', categoryName]),
        }
      });
    } else {
      await prisma.lead.update({
        where: { id: targetLead.id },
        data: {
          status: 'replied',
          last_contacted: new Date(),
          phone: phone || targetLead.phone,
          website: cleanWebsite || targetLead.website,
        }
      });
    }

    // 2. Perform AI sentiment analysis & intent synthesis
    const aiAnalysis = await aiService.analyzeCustomerReply(message, name);

    // 3. Create LeadReply
    const createdReply = await prisma.leadReply.create({
      data: {
        lead_id: targetLead.id,
        from_email: email || 'web-form@contact.com',
        from_name: name,
        subject: `[Web Contact - ${categoryName}] ${name}`,
        content: `[Category]: ${categoryName}\n[Direct Phone]: ${phone || 'Not provided'}\n[Target Website]: ${cleanWebsite || 'None'}\n\n[Inquiry / Feedback]:\n${message}`,
        sentiment: category === 'FEEDBACK' ? 'FEEDBACK' : (aiAnalysis.sentiment || 'CONSULTATION'),
        ai_summary: aiAnalysis.ai_summary,
        ai_suggested_reply: aiAnalysis.ai_suggested_reply,
        source: 'web_contact',
        is_read: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry received successfully! Our team has logged your submission and will get in touch.',
      leadId: targetLead.id,
      replyId: createdReply.id,
      officialEmail: 'jyu@wisdomitc.com'
    });
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit contact request' }, { status: 500 });
  }
}
