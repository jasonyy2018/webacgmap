import { prisma } from './prisma';

let isInitialized = false;

/**
 * Ensures SQLite tables exist and are self-healed, even on a brand-new container deployment.
 */
export async function ensureDatabaseReady() {
  if (isInitialized) return;

  try {
    // 1. Create Lead Table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Lead" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "address" TEXT,
        "phone" TEXT,
        "website" TEXT,
        "contact_email" TEXT,
        "rating" REAL,
        "place_id" TEXT NOT NULL,
        "search_query" TEXT,
        "search_location" TEXT,
        "industry" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "email_status" TEXT DEFAULT 'unknown',
        "bounce_reason" TEXT,
        "bounced_at" DATETIME,
        "ai_score" INTEGER,
        "ai_grade" TEXT,
        "ai_status" TEXT NOT NULL DEFAULT 'pending',
        "ai_tags" TEXT NOT NULL DEFAULT '[]',
        "contact_attempts" INTEGER NOT NULL DEFAULT 0,
        "last_contacted" DATETIME,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Lead_place_id_key" ON "Lead"("place_id");
    `);

    // 2. Create LeadAnalysis Table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LeadAnalysis" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "lead_id" INTEGER NOT NULL,
        "tech_stack" TEXT NOT NULL DEFAULT '[]',
        "ux_assessment" TEXT,
        "mobile_friendly" BOOLEAN,
        "business_insight" TEXT,
        "detailed_analysis" TEXT,
        "ai_confidence" REAL,
        "generated_email" TEXT,
        "email_subjects" TEXT NOT NULL DEFAULT '[]',
        "poster_description" TEXT,
        "poster_url" TEXT,
        CONSTRAINT "LeadAnalysis_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "LeadAnalysis_lead_id_key" ON "LeadAnalysis"("lead_id");
    `);

    // 3. Create LeadReply Table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LeadReply" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "lead_id" INTEGER NOT NULL,
        "from_email" TEXT NOT NULL,
        "from_name" TEXT,
        "subject" TEXT,
        "content" TEXT NOT NULL,
        "sentiment" TEXT NOT NULL DEFAULT 'INTERESTED',
        "ai_summary" TEXT,
        "ai_suggested_reply" TEXT,
        "source" TEXT NOT NULL DEFAULT 'email',
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LeadReply_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 4. Backward compatibility migration checks for existing SQLite files
    const columnsToHeal = [
      { table: 'Lead', column: 'contact_attempts', sql: 'ALTER TABLE "Lead" ADD COLUMN "contact_attempts" INTEGER NOT NULL DEFAULT 0;' },
      { table: 'Lead', column: 'last_contacted', sql: 'ALTER TABLE "Lead" ADD COLUMN "last_contacted" DATETIME;' },
      { table: 'Lead', column: 'contact_email', sql: 'ALTER TABLE "Lead" ADD COLUMN "contact_email" TEXT;' },
      { table: 'Lead', column: 'email_status', sql: 'ALTER TABLE "Lead" ADD COLUMN "email_status" TEXT DEFAULT \'unknown\';' },
      { table: 'Lead', column: 'bounce_reason', sql: 'ALTER TABLE "Lead" ADD COLUMN "bounce_reason" TEXT;' },
      { table: 'Lead', column: 'bounced_at', sql: 'ALTER TABLE "Lead" ADD COLUMN "bounced_at" DATETIME;' },
      { table: 'LeadAnalysis', column: 'poster_description', sql: 'ALTER TABLE "LeadAnalysis" ADD COLUMN "poster_description" TEXT;' },
      { table: 'LeadAnalysis', column: 'poster_url', sql: 'ALTER TABLE "LeadAnalysis" ADD COLUMN "poster_url" TEXT;' },
    ];

    for (const item of columnsToHeal) {
      try {
        await prisma.$executeRawUnsafe(item.sql);
      } catch (err: any) {
        // If column already exists, SQLite throws duplicate column name error which is safe to ignore
      }
    }

    // 5. Seed initial high-quality leads if table is completely empty
    const currentCount = await prisma.lead.count();
    if (currentCount === 0) {
      console.log('🌱 Seeding initial high-intent North American business leads...');
      await seedInitialLeads();
    }

    isInitialized = true;
    console.log('✅ SQLite Database ready and verified.');
  } catch (error) {
    console.error('❌ Failed to ensure database tables:', error);
  }
}

async function seedInitialLeads() {
  const starterLeads = [
    {
      name: "Apex Emergency Plumbing & Rooter",
      address: "2401 W Mockingbird Ln, Dallas, TX 75235",
      phone: "+1 (214) 555-0192",
      website: "https://apexemergencyplumbing.com",
      contact_email: "service@apexplumbingdallas.com",
      rating: 4.9,
      place_id: "seed_apex_plumbing_dallas",
      search_query: "Emergency Plumber",
      search_location: "Dallas, TX",
      industry: "Home Services",
      ai_score: 82,
      ai_grade: "A",
      ai_status: "completed",
    },
    {
      name: "Lone Star Premier Roofing & Gutters",
      address: "7901 Cameron Rd, Austin, TX 78754",
      phone: "+1 (512) 555-0144",
      website: "https://lonestarpremierroofing.com",
      contact_email: "contact@lonestarpremierroofing.com",
      rating: 4.8,
      place_id: "seed_lonestar_roofing_austin",
      search_query: "Roofing Contractors",
      search_location: "Austin, TX",
      industry: "Construction & Roofing",
      ai_score: 79,
      ai_grade: "B",
      ai_status: "completed",
    },
    {
      name: "Orlando Elite Water Damage & Restoration",
      address: "1420 W Colonial Dr, Orlando, FL 32804",
      phone: "+1 (407) 555-0188",
      website: "https://orlandowaterdamagerestore.com",
      contact_email: "support@orlandowaterdamagerestore.com",
      rating: 4.9,
      place_id: "seed_orlando_water_damage",
      search_query: "Water Damage Restoration",
      search_location: "Orlando, FL",
      industry: "Restoration Services",
      ai_score: 86,
      ai_grade: "A",
      ai_status: "completed",
    },
    {
      name: "Sunstate HVAC & Climate Solutions",
      address: "3200 E Camelback Rd, Phoenix, AZ 85018",
      phone: "+1 (602) 555-0133",
      website: "https://sunstateclimateaz.com",
      contact_email: "info@sunstateclimateaz.com",
      rating: 4.7,
      place_id: "seed_sunstate_hvac_phoenix",
      search_query: "HVAC Contractors",
      search_location: "Phoenix, AZ",
      industry: "HVAC & Mechanical",
      ai_score: 75,
      ai_grade: "B",
      ai_status: "completed",
    },
  ];

  for (const item of starterLeads) {
    try {
      const created = await prisma.lead.create({
        data: item,
      });

      // Also create analysis record
      await prisma.leadAnalysis.create({
        data: {
          lead_id: created.id,
          tech_stack: JSON.stringify(["WordPress 5.8", "jQuery", "Apache"]),
          ux_assessment: "Site lacks 1-tap mobile call button and has slow TTFB.",
          mobile_friendly: false,
          business_insight: `${item.name} maintains a stellar ${item.rating}★ rating but loses after-hours mobile visitors.`,
          detailed_analysis: JSON.stringify({
            need_category: "MOBILE_UNFRIENDLY",
            need_urgency: "urgent",
            load_speed_score: 42,
            mobile_score: 35,
            seo_score: 55,
            estimated_lost_visitors_monthly: 240,
            custom_greeting: `Congratulations on maintaining an impressive ${item.rating}★ standing!`,
            personalized_hook: `We identified several mobile conversion bottlenecks on your site.`,
            email_sequence: [
              {
                stage: "stage_1_greeting",
                title: "Stage 1: Executive Consultation Letter",
                description: "Warm greeting with tailored conversion blueprint.",
                recommendedDelayDays: 0,
                defaultSubject: `2026 Web Architecture Blueprint for ${item.name}`,
                content: `Hi ${item.name} Leadership,\n\nWe noticed your outstanding ${item.rating}★ reputation on Google Maps. We prepared an interactive 3D concept preview tailored to your brand.\n\nBest,\nJason Yu`,
              }
            ]
          }),
          ai_confidence: 0.92,
          generated_email: `Hi ${item.name} Leadership,\n\nWe prepared an interactive 3D concept preview for ${item.name}.\n\nBest,\nJason Yu\nSenior Web Strategist`,
          email_subjects: JSON.stringify([
            `2026 Web Architecture Blueprint for ${item.name}`,
            `Quick inquiry regarding ${item.name}'s digital presence`
          ]),
        }
      });
    } catch (e) {
      // ignore unique constraint
    }
  }
}
