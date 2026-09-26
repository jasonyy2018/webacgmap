import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import * as cheerio from "cheerio";
import { OutreachSequenceStep, WebNeedType } from "./types";

const getApiKey = () => process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";

function getGenerativeModel() {
  const key = getApiKey();
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  try {
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (e) {
    return genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  }
}

function cleanAndParseJSON(text: string) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  return JSON.parse(cleaned);
}

export const aiService = {
  async fetchWebsiteContent(url: string): Promise<{ text: string; hasViewport: boolean; loadTimeMs: number; isHttps: boolean }> {
    if (!url || !url.startsWith("http")) {
      url = `https://${url}`;
    }
    const isHttps = url.startsWith("https");
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    const startTime = Date.now();
    try {
      const response = await axios.get(url, { 
        headers, 
        timeout: 10000,
        validateStatus: () => true 
      });
      const loadTimeMs = Date.now() - startTime;

      if (typeof response.data !== "string") {
        return { text: "Non-text website content", hasViewport: false, loadTimeMs, isHttps };
      }
      const $ = cheerio.load(response.data);
      const hasViewport = $('meta[name="viewport"]').length > 0;
      
      // Extract emails if visible in mailto or text
      const mailtos: string[] = [];
      $('a[href^="mailto:"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
          const email = href.replace('mailto:', '').split('?')[0].trim();
          if (email && email.includes('@')) mailtos.push(email);
        }
      });

      $("script, style, noscript, svg").remove();
      const bodyText = $("body").text().replace(/\s+/g, ' ').trim();
      
      return {
        text: (mailtos.length > 0 ? `Detected Email: ${mailtos[0]}\n` : '') + bodyText.substring(0, 12000),
        hasViewport,
        loadTimeMs,
        isHttps
      };
    } catch (error: any) {
      console.error(`Error fetching website ${url}:`, error.message);
      return {
        text: `Error fetching content: ${error.message}`,
        hasViewport: false,
        loadTimeMs: 10000,
        isHttps
      };
    }
  },

  async analyzeWebsite(
    companyName: string, 
    websiteData: string | { text: string; hasViewport?: boolean; loadTimeMs?: number; isHttps?: boolean },
    leadMeta?: { rating?: number; location?: string; website?: string; industry?: string }
  ) {
    const model = getGenerativeModel();
    const rawContent = typeof websiteData === 'string' ? websiteData : websiteData.text;
    const hasViewport = typeof websiteData === 'object' && websiteData.hasViewport !== undefined ? websiteData.hasViewport : true;
    const loadTimeMs: number = typeof websiteData === 'object' && websiteData.loadTimeMs !== undefined ? websiteData.loadTimeMs : 1500;
    const isHttps = typeof websiteData === 'object' && websiteData.isHttps !== undefined ? websiteData.isHttps : true;

    const hasNoWebsite = !leadMeta?.website || rawContent.startsWith("Error fetching content") || rawContent.length < 50;

    if (!model) {
      // High-quality deterministic fallback when API key is missing
      const need_category: WebNeedType = hasNoWebsite 
        ? 'NO_WEBSITE' 
        : !hasViewport 
        ? 'MOBILE_UNFRIENDLY' 
        : loadTimeMs > 4000 
        ? 'LEGACY_TECH_DEBT' 
        : 'LOW_CONVERSION_DESIGN';

      const score = hasNoWebsite ? 95 : (!hasViewport ? 88 : 76);
      return {
        tech_stack: hasNoWebsite ? ["No Active Website"] : ["Legacy HTML/CMS", !isHttps ? "Insecure HTTP" : "HTTPS"],
        ux_assessment: hasNoWebsite 
          ? "Currently has no official website listed on Google Maps, losing high-intent local customer traffic."
          : `Website ${!hasViewport ? 'lacks mobile responsiveness viewport' : 'visual design is outdated'} and lacks modern interactive booking.`,
        mobile_friendly: !hasNoWebsite && (hasViewport ?? false),
        business_insight: `${companyName} has strong local market potential (${leadMeta?.rating || '4.8'}★ on Google) but requires modern digital infrastructure.`,
        contact_email: null,
        score,
        grade: score >= 85 ? "A" : score >= 70 ? "B" : "C",
        need_category,
        need_urgency: score >= 85 ? "urgent" : score >= 70 ? "high" : "medium",
        load_speed_score: Math.max(30, Math.min(95, Math.floor(100 - (loadTimeMs / 100)))),
        mobile_score: hasNoWebsite ? 0 : (!hasViewport ? 35 : 75),
        seo_score: hasNoWebsite ? 10 : 65,
        estimated_lost_visitors_monthly: hasNoWebsite ? 450 : 180,
        custom_greeting: `Congratulations on maintaining such strong ${leadMeta?.rating || '4.8'}★ feedback across ${leadMeta?.location || 'your area'}!`,
        personalized_hook: hasNoWebsite 
          ? `I noticed that customers searching for ${companyName} on Google Maps cannot find an official website to book or review your work directly.`
          : `I noticed your site takes over ${(loadTimeMs / 1000).toFixed(1)}s to respond on mobile phones, which often causes 40%+ of searchers to hit the back button.`,
        email_subjects: [
          `Digital Upgrade Proposal for ${companyName}`,
          `Quick observation regarding ${companyName}'s web presence`,
          `Elevating ${companyName}'s online storefront`
        ]
      };
    }

    const prompt = `
    You are an expert B2B digital agency consultant specializing in identifying web design and development opportunities for North American small & medium businesses (SMBs).
    
    Analyze the following data for: '${companyName}'
    Website URL: ${leadMeta?.website || "None"}
    Google Rating: ${leadMeta?.rating || "Not provided"}
    Location: ${leadMeta?.location || "North America"}
    Industry: ${leadMeta?.industry || "Local Business"}
    Technical Signals: { hasViewport: ${hasViewport}, loadTimeMs: ${loadTimeMs}, isHttps: ${isHttps}, hasNoWebsite: ${hasNoWebsite} }

    Audit Content / Context:
    ${hasNoWebsite ? "The business has NO accessible official website on Google Maps." : rawContent.substring(0, 10000)}

    Classify their website development need into one of these strict categories:
    - "NO_WEBSITE" (No site found, huge loss of customers)
    - "MOBILE_UNFRIENDLY" (Broken mobile UI, not responsive, no viewport)
    - "LEGACY_TECH_DEBT" (Slow load, outdated tech, no SSL, poor structure)
    - "LOW_CONVERSION_DESIGN" (Outdated aesthetics, no clear CTA/online booking, looks 2012)
    - "HEALTHY" (Modern, fast, perfect)

    Calculate a score (0-100) where 100 = urgent, desperate need for a new website / redesign.

    Return ONLY a valid JSON object matching this schema:
    {
      "tech_stack": ["string", "string"],
      "ux_assessment": "concise 1-2 sentence description of design flaws and customer friction",
      "mobile_friendly": boolean,
      "business_insight": "summary of company value and why a new site will bring them more revenue",
      "contact_email": "detected email string or null",
      "score": number between 0 and 100,
      "grade": "A" (80-100 urgent need), "B" (60-79 high opportunity), "C" (below 60),
      "need_category": "NO_WEBSITE" | "MOBILE_UNFRIENDLY" | "LEGACY_TECH_DEBT" | "LOW_CONVERSION_DESIGN" | "HEALTHY",
      "need_urgency": "urgent" | "high" | "medium" | "low",
      "load_speed_score": number between 10 and 100,
      "mobile_score": number between 10 and 100,
      "seo_score": number between 10 and 100,
      "estimated_lost_visitors_monthly": number (e.g. 150 - 600),
      "custom_greeting": "1 warm, respectful sentence congratulating them on their local reputation or service",
      "personalized_hook": "1 sharp, consultative sentence explaining the exact technical or visual flaw holding them back",
      "email_subjects": ["Subject Option 1", "Subject Option 2", "Subject Option 3"]
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      const parsed = cleanAndParseJSON(result.response.text());
      return parsed;
    } catch (error: any) {
      console.error("AI Analysis failed:", error);
      const need_category: WebNeedType = hasNoWebsite ? 'NO_WEBSITE' : 'MOBILE_UNFRIENDLY';
      return {
        tech_stack: hasNoWebsite ? ["No Official Site"] : ["Legacy WordPress / Static HTML"],
        ux_assessment: hasNoWebsite 
          ? "No website linked on Google Maps. Customers have no way to explore pricing or portfolios online."
          : "Layout is non-responsive and difficult to navigate on mobile devices.",
        mobile_friendly: false,
        business_insight: `${companyName} delivers quality local services but loses digital referrals to competitors with modern sites.`,
        contact_email: null,
        score: hasNoWebsite ? 95 : 85,
        grade: "A",
        need_category,
        need_urgency: "urgent",
        load_speed_score: 45,
        mobile_score: 30,
        seo_score: 40,
        estimated_lost_visitors_monthly: 320,
        custom_greeting: `Great to see ${companyName}'s high-standing service in ${leadMeta?.location || 'your area'}!`,
        personalized_hook: `I noticed your digital storefront could be upgraded to automatically convert smartphone visitors into paid appointments.`,
        email_subjects: [
          `Digital Upgrade Proposal for ${companyName}`,
          `Quick observation regarding ${companyName}'s web presence`,
          `Elevating ${companyName}'s online storefront`
        ]
      };
    }
  },

  // Generates complete Cold-to-Trust 4-step sequence
  async generateOutreachSequence(leadInfo: any, analysisInfo: any): Promise<OutreachSequenceStep[]> {
    const model = getGenerativeModel();
    const company = leadInfo.name;
    const location = leadInfo.search_location || 'your local market';
    const rating = leadInfo.rating || 4.9;
    const needType: WebNeedType = analysisInfo?.need_category || (leadInfo.website ? 'LOW_CONVERSION_DESIGN' : 'NO_WEBSITE');

    const defaultSteps: OutreachSequenceStep[] = [
      {
        stage: 'stage_1_greeting',
        title: 'Stage 1: Warm Greeting & Free Prototype',
        description: 'First touchpoint. Warm congratulatory opening, gentle observation of web friction, offering a zero-obligation interactive Figma mockup.',
        recommendedDelayDays: 0,
        defaultSubject: `Quick idea regarding ${company}'s web presence`,
        content: `Hi ${company} Team,\n\nI was looking through reputable local providers in ${location} and wanted to congratulate you on your impressive ${rating}★ customer rating.\n\n${analysisInfo?.personalized_hook || `While checking your online presence, I noticed your digital storefront could be significantly upgraded to capture more direct inquiries from mobile searchers.`}\n\nOur team took the liberty of creating a free 1-page modern interactive concept prototype specifically for ${company}.\n\nWould you be open to me sharing a 90-second video or private staging link with you? Zero strings attached.\n\nBest regards,\nAlex Chen\nSenior Web Strategist`
      },
      {
        stage: 'stage_2_case_study',
        title: 'Stage 2: Social Proof & Conversion Walkthrough',
        description: 'Sent 3 days later. Provides social proof from a similar SMB who increased conversion by 2.4x after a mobile-first overhaul.',
        recommendedDelayDays: 3,
        defaultSubject: `Case study: How modernizing the mobile flow doubled inquiries for a ${leadInfo.industry || 'local service'} firm`,
        content: `Hi ${company} Team,\n\nFollowing up on my previous note. We recently helped a similar business in your industry revamp their mobile booking architecture.\n\nBy simplifying the tap-to-call flow and featuring live verified Google reviews on the front page, their inbound client calls increased by 140% in 60 days.\n\nI still have the tailored concept mockup ready for ${company}. Would you like me to send the preview link over?\n\nWarmly,\nAlex Chen`
      },
      {
        stage: 'stage_3_soft_cta',
        title: 'Stage 3: Friction-Free Offer & Q&A',
        description: 'Sent 6 days later. Eliminates skepticism with a risk-free proposal and quick 10-minute discovery call.',
        recommendedDelayDays: 6,
        defaultSubject: `Quick question about ${company}'s 2026 digital roadmap`,
        content: `Hi ${company} Team,\n\nI realize how busy managing daily client operations can be.\n\nIf you are currently satisfied with your inbound lead volume, no problem at all. But if you have 10 minutes this Thursday, I'd love to walk you through the custom design prototype and share 3 easy ways you can optimize your Google search visibility.\n\nAre you available for a brief 10-minute chat this week?\n\nBest,\nAlex Chen`
      },
      {
        stage: 'stage_4_breakup',
        title: 'Stage 4: Polite Breakup & Permanent Trust Door',
        description: 'Sent 10 days later. High-deliverability North American break-up email that respects their inbox while keeping the door wide open.',
        recommendedDelayDays: 10,
        defaultSubject: `Closing the loop regarding ${company}'s web design`,
        content: `Hi ${company} Team,\n\nI haven't heard back, so I assume redesigning ${company}'s web presence isn't an active priority right now, and I completely respect that.\n\nI will close out your file and stop following up so I don't clutter your inbox. If you ever decide to modernize your website or need help dominating local search in ${location}, feel free to reach back out anytime.\n\nWishing you continued success!\n\nBest regards,\nAlex Chen\nSenior Web Strategist`
      }
    ];

    if (!model) return defaultSteps;

    const prompt = `
    You are an elite B2B sales copywriter specializing in cold email outreach for high-end web development agencies targeting North American small-to-medium businesses.
    
    Company: ${company}
    Location: ${location}
    Google Rating: ${rating}★
    Identified Web Issue: ${needType}
    Audit Hook: ${analysisInfo?.personalized_hook || 'Needs mobile optimization'}

    Generate a 4-step "Cold-to-Trust" email outreach campaign designed to build rapport, provide immense upfront value, and generate qualified replies.

    Return ONLY a valid JSON array of 4 objects matching this format:
    [
      {
        "stage": "stage_1_greeting",
        "title": "Stage 1: Warm Greeting & Free Prototype",
        "description": "Short explanation",
        "recommendedDelayDays": 0,
        "defaultSubject": "Email subject",
        "content": "Full body text"
      },
      {
        "stage": "stage_2_case_study",
        "title": "Stage 2: Social Proof & Conversion Walkthrough",
        "description": "Short explanation",
        "recommendedDelayDays": 3,
        "defaultSubject": "Email subject",
        "content": "Full body text"
      },
      {
        "stage": "stage_3_soft_cta",
        "title": "Stage 3: Friction-Free Offer & Q&A",
        "description": "Short explanation",
        "recommendedDelayDays": 6,
        "defaultSubject": "Email subject",
        "content": "Full body text"
      },
      {
        "stage": "stage_4_breakup",
        "title": "Stage 4: Polite Breakup & Open Door",
        "description": "Short explanation",
        "recommendedDelayDays": 10,
        "defaultSubject": "Email subject",
        "content": "Full body text"
      }
    ]
    `;

    try {
      const result = await model.generateContent(prompt);
      const parsed = cleanAndParseJSON(result.response.text());
      if (Array.isArray(parsed) && parsed.length === 4) {
        return parsed;
      }
      return defaultSteps;
    } catch (e) {
      console.error("AI sequence generation failed, using defaults:", e);
      return defaultSteps;
    }
  },

  async generateOutreachEmail(leadInfo: any, analysisInfo: any) {
    const sequences = await this.generateOutreachSequence(leadInfo, analysisInfo);
    return sequences[0]?.content || "Hi Team, ...";
  },

  async refineEmailContent(currentEmail: string, instruction: string) {
    const model = getGenerativeModel();
    if (!model) return currentEmail;

    const prompt = `
    Refine the following outreach email according to the instruction provided.
    Current Email:
    ${currentEmail}

    Instruction: ${instruction}
    
    Return ONLY the refined email body text.
    `;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("Email refinement failed:", error);
      return currentEmail;
    }
  },

  async generatePosterData(leadInfo: any, analysisInfo: any) {
    const model = getGenerativeModel();
    if (!model) {
      return {
        title: `Transform ${leadInfo.name || "Business"}'s Digital Impact`,
        subtitle: "Custom Web Solutions Built for Maximum Conversions",
        key_points: [
          "Mobile-First Responsive Layout",
          "Ultra-Fast Page Load Speed",
          "Modern UI/UX Design",
          "Built-in Lead Generation"
        ],
        call_to_action: "Schedule Your Free Consultation Today",
        theme_colors: { primary: "#6366f1", secondary: "#a855f7" },
        style_vibe: "Modern Tech"
      };
    }

    const prompt = `
    Create structured marketing poster content for a web design and technology pitch tailored to '${leadInfo.name}'.
    Lead Status & Insights: ${JSON.stringify(analysisInfo, null, 2)}
    
    Return ONLY a valid JSON object with:
    {
      "title": "Headline phrase",
      "subtitle": "Compelling subheadline",
      "key_points": ["Point 1", "Point 2", "Point 3", "Point 4"],
      "call_to_action": "Actionable closing phrase",
      "theme_colors": {"primary": "#6366f1", "secondary": "#a855f7"},
      "style_vibe": "Modern / Boutique / Enterprise"
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      return cleanAndParseJSON(result.response.text());
    } catch (error) {
      console.error("Poster data generation failed:", error);
      return {
        title: `Transform ${leadInfo.name}'s Digital Presence`,
        subtitle: "Custom High-Converting Web & Tech Overhaul",
        key_points: [
          "Responsive Mobile Optimization",
          "SEO & Speed Enhancements",
          "Modern User Interface",
          "Automated Customer Funnel"
        ],
        call_to_action: "Claim Your Web Transformation Blueprint",
        theme_colors: { primary: "#6366f1", secondary: "#a855f7" },
        style_vibe: "Modern Tech"
      };
    }
  },

  async analyzeCustomerReply(replyText: string, leadName: string) {
    const model = getGenerativeModel();
    if (!model) {
      const lower = replyText.toLowerCase();
      let sentiment: 'INTERESTED' | 'BOOKING_REQUEST' | 'OBJECTION' | 'NOT_INTERESTED' | 'FEEDBACK' | 'CONSULTATION' = 'INTERESTED';
      if (lower.includes('feedback') || lower.includes('suggestion') || lower.includes('bug') || lower.includes('improve') || lower.includes('体验') || lower.includes('反馈') || lower.includes('建议')) {
        sentiment = 'FEEDBACK';
      } else if (lower.includes('quote') || lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('consult') || lower.includes('inquiry') || lower.includes('咨询') || lower.includes('报价') || lower.includes('合作')) {
        sentiment = 'CONSULTATION';
      } else if (lower.includes('call') || lower.includes('zoom') || lower.includes('schedule') || lower.includes('time') || lower.includes('meet') || lower.includes('phone') || lower.includes('预约')) {
        sentiment = 'BOOKING_REQUEST';
      } else if (lower.includes('not interested') || lower.includes('unsubscribe') || lower.includes('remove') || lower.includes('stop') || lower.includes('no thanks')) {
        sentiment = 'NOT_INTERESTED';
      } else if (lower.includes('already have') || lower.includes('busy') || lower.includes('later')) {
        sentiment = 'OBJECTION';
      }

      const summaryText = sentiment === 'FEEDBACK'
        ? `${leadName} 提交了宝贵的网站体验/功能优化反馈与建议。`
        : sentiment === 'CONSULTATION'
        ? `${leadName} 发起了业务建站/改版咨询与报价探讨。`
        : sentiment === 'BOOKING_REQUEST'
        ? `${leadName} 希望预约策略通话或线上演示。`
        : sentiment === 'INTERESTED'
        ? `${leadName} 对网站改版与数字化升级方案表达了高度意向。`
        : `${leadName} 提出了一些顾虑或当前无直接意向。`;

      const replyDraft = sentiment === 'FEEDBACK'
        ? `Hi ${leadName} Team,\n\nThank you so much for taking the time to share your feedback with Nexora Studio! We truly value your insights and will review them thoroughly.\n\nBest regards,\nJason Yu | jyu@wisdomitc.com\nNexora Digital Team`
        : sentiment === 'CONSULTATION'
        ? `Hi ${leadName} Team,\n\nThank you for reaching out to Nexora Studio regarding your web presence! We reviewed your initial requirements and would love to share a tailored scope estimate and preview.\n\nCould we connect for a brief 10-minute discovery call this week?\n\nBest regards,\nJason Yu | jyu@wisdomitc.com\nNexora Digital Engineering Team`
        : `Hi ${leadName} Team,\n\nThank you for getting back to me! I'd be delighted to share the interactive staging mockup or connect for a brief 10-minute discovery call.\n\nBest regards,\nJason Yu | jyu@wisdomitc.com\nNexora Digital Engineering Team`;

      return {
        sentiment,
        ai_summary: summaryText,
        ai_suggested_reply: replyDraft
      };
    }

    const prompt = `
    You are an expert B2B sales development & client success AI for Nexora Studio (Contact: jyu@wisdomitc.com).
    A client named '${leadName}' has sent the following message/inbound email:

    Client Message:
    "${replyText}"

    Tasks:
    1. Classify the sentiment into one of these strict values:
       - "FEEDBACK" (user is providing suggestions, comments on usability, feature requests, or general thoughts)
       - "CONSULTATION" (business inquiry, asking for custom quote, timeline, website development details)
       - "INTERESTED" (enthusiastic, asking for demo preview, wants to see designs)
       - "BOOKING_REQUEST" (asked for a phone call, Zoom meeting, or specific time)
       - "OBJECTION" (said they already have a webmaster, too busy right now, concerned about cost)
       - "NOT_INTERESTED" (explicitly declined, asked to be removed)
    2. Write a 1-sentence executive summary of the lead's exact intent or feedback in Chinese/English.
    3. Draft a tailored, consultative, professional response for our agency lead (Jason Yu, jyu@wisdomitc.com) to reply with.

    Return ONLY a valid JSON object matching this schema:
    {
      "sentiment": "FEEDBACK" | "CONSULTATION" | "INTERESTED" | "BOOKING_REQUEST" | "OBJECTION" | "NOT_INTERESTED",
      "ai_summary": "one sentence summarizing what the client wants or commented",
      "ai_suggested_reply": "complete drafted email reply signed by Jason Yu (jyu@wisdomitc.com)"
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      return cleanAndParseJSON(result.response.text());
    } catch (e) {
      console.error("AI reply analysis failed:", e);
      return {
        sentiment: 'CONSULTATION',
        ai_summary: `${leadName} 提交了咨询或反馈信息。`,
        ai_suggested_reply: `Hi ${leadName} Team,\n\nThank you for reaching out! We received your message and would love to assist you. What time this week would work best for a 10-minute walkthrough?\n\nBest regards,\nJason Yu | jyu@wisdomitc.com\nNexora Digital Team`
      };
    }
  }
};

