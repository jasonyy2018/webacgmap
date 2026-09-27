const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing EDM & Lead Generation Pipeline...');

  // 1. Seed or retrieve high-intent North American leads
  const testPlaceId = 'test_na_plumbing_dallas_01';
  let lead = await prisma.lead.findUnique({
    where: { place_id: testPlaceId }
  });

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        name: 'Apex Emergency Plumbing & Rooter',
        address: '2410 Commerce St, Dallas, TX 75201',
        phone: '+1 (214) 555-0199',
        website: 'https://apexplumbingdallas-example.com',
        contact_email: 'service@apexplumbingdallas.com',
        rating: 4.9,
        place_id: testPlaceId,
        search_query: 'Emergency plumber',
        search_location: 'Dallas, TX',
        industry: 'Home & Commercial Services',
        status: 'analyzed',
        ai_score: 92,
        ai_grade: 'A',
        ai_status: 'completed',
        ai_tags: JSON.stringify(['MOBILE_UNFRIENDLY', 'WordPress 4.9', 'No HTTPS']),
      }
    });
    console.log('Created test lead:', lead.name);
  }

  // 2. Attach EDM sequence and detailed analysis
  const edmSequence = [
    {
      stage: 'stage_1_greeting',
      title: 'Stage 1: Warm Greeting & Free Prototype',
      description: 'Congratulates 4.9-star rating, highlights mobile tap-to-call friction, offers complimentary Figma mockup.',
      recommendedDelayDays: 0,
      defaultSubject: "Quick idea regarding Apex Plumbing's mobile conversion",
      content: "Hi Apex Plumbing Team,\n\nI was looking through reputable local emergency contractors in Dallas and wanted to congratulate you on your impressive 4.9★ customer rating!\n\nWhile checking your online portal, I noticed smartphone visitors currently experience delay when attempting to tap-to-call during emergency water leaks.\n\nOur team created a complimentary 1-page modern interactive concept prototype specifically for Apex Plumbing.\n\nWould you be open to me sharing a private staging link with you? Zero strings attached.\n\nBest regards,\nJason Yu\nApexWeb Studios"
    },
    {
      stage: 'stage_2_case_study',
      title: 'Stage 2: Social Proof & Conversion Walkthrough',
      description: 'Case study of another Dallas contractor whose inquiries jumped 140%.',
      recommendedDelayDays: 3,
      defaultSubject: "Case study: How modernizing the mobile flow doubled service calls in Dallas",
      content: "Hi Team,\n\nFollowing up on my previous note. We recently helped another service business in Dallas revamp their mobile booking architecture, resulting in +140% more emergency calls.\n\nWould you like me to send the preview link over?\n\nWarmly,\nJason Yu"
    }
  ];

  const detailedEdmData = {
    need_category: 'MOBILE_UNFRIENDLY',
    need_urgency: 'urgent',
    load_speed_score: 42,
    mobile_score: 38,
    seo_score: 65,
    estimated_lost_visitors_monthly: 380,
    custom_greeting: 'Congratulations on maintaining such strong 4.9★ feedback in Dallas!',
    personalized_hook: 'Smartphone visitors currently experience delay when attempting to tap-to-call during emergency leaks.',
    email_sequence: edmSequence
  };

  await prisma.leadAnalysis.upsert({
    where: { lead_id: lead.id },
    update: {
      tech_stack: JSON.stringify(['Legacy WordPress', 'Insecure HTTP']),
      ux_assessment: 'Mobile layout is not responsive, missing prominent emergency tap-to-call buttons.',
      mobile_friendly: false,
      business_insight: 'Apex Plumbing has top-tier Dallas reputation but loses high-value emergency service calls due to mobile friction.',
      detailed_analysis: JSON.stringify(detailedEdmData),
      ai_confidence: 0.95,
      generated_email: edmSequence[0].content,
      email_subjects: JSON.stringify([
        "Quick idea regarding Apex Plumbing's mobile conversion",
        "A 5-star digital storefront to match Apex Plumbing's reputation"
      ])
    },
    create: {
      lead_id: lead.id,
      tech_stack: JSON.stringify(['Legacy WordPress', 'Insecure HTTP']),
      ux_assessment: 'Mobile layout is not responsive, missing prominent emergency tap-to-call buttons.',
      mobile_friendly: false,
      business_insight: 'Apex Plumbing has top-tier Dallas reputation but loses high-value emergency service calls due to mobile friction.',
      detailed_analysis: JSON.stringify(detailedEdmData),
      ai_confidence: 0.95,
      generated_email: edmSequence[0].content,
      email_subjects: JSON.stringify([
        "Quick idea regarding Apex Plumbing's mobile conversion",
        "A 5-star digital storefront to match Apex Plumbing's reputation"
      ])
    }
  });

  console.log('✅ Lead & EDM sequence verification complete in database!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
