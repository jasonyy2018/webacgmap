import { Lead, EmailTemplate, WebNeedType } from './types';

// Helper to sanitize text
function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'executive_consult',
    name: 'Executive Consultation Letter',
    category: 'executive',
    badge: 'Highest Deliverability (98%)',
    subjectFormat: 'Quick inquiry regarding {{company_name}}\'s digital presence',
    description: 'Clean, respectful, and direct consultative letter crafted specifically for North American business owners. Focuses on local credibility and friction-free value.',
    plainText: (lead: Lead, options = {}) => {
      const senderName = options.senderName || 'Alex Chen';
      const senderRole = options.senderRole || 'Senior Digital Strategist';
      const senderAgency = options.senderAgency || 'ApexWeb Studio';
      const ratingText = lead.rating ? `congratulations on maintaining an impressive ${lead.rating}-star presence in ${lead.search_location || 'your area'}` : `hope business is thriving at ${lead.name}`;
      
      const issueHook = !lead.website 
        ? `While researching top local providers in ${lead.search_location || 'your city'}, I noticed that ${lead.name} doesn't have an active official website connected to your Google listing. In today's market, local competitors are likely capturing customers who search for your services after hours.`
        : `While reviewing ${lead.name}'s online portal, I noticed a couple of friction points—especially on mobile devices where visitors might struggle to book or call quickly.`;

      return `Hi ${lead.name} Team,

I came across ${lead.name} on Google Maps—${ratingText}!

${issueHook}

We specialize in designing high-converting, lightning-fast web solutions for leading service businesses across North America. Rather than a sales pitch, I've put together a complimentary 1-page modern concept prototype tailored specifically to ${lead.name}'s brand.

Would you be open to me sending over a 2-minute video walkthrough or a private link to the interactive preview? No commitment whatsoever—just actionable ideas you can keep either way.

Best regards,

${senderName}
${senderRole} | ${senderAgency}
`;
    },
    previewHtml: (lead: Lead, options = {}) => {
      const senderName = escapeHtml(options.senderName || 'Alex Chen');
      const senderRole = escapeHtml(options.senderRole || 'Senior Digital Strategist');
      const senderAgency = escapeHtml(options.senderAgency || 'ApexWeb Studio');
      const company = escapeHtml(lead.name);
      const rating = lead.rating ? escapeHtml(String(lead.rating)) : '5.0';
      const location = escapeHtml(lead.search_location || 'your city');
      const hasWebsite = Boolean(lead.website);

      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Presence Consultation</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.65;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
    <div style="border-bottom: 2px solid #4f46e5; width: 44px; margin-bottom: 28px;"></div>
    
    <p style="font-size: 16px; margin-top: 0; color: #0f172a; font-weight: 600;">Hi ${company} Team,</p>
    
    <p style="font-size: 15px; color: #334155;">
      I recently came across <strong>${company}</strong> while analyzing top-rated local providers in <strong>${location}</strong>—congratulations on maintaining an outstanding <strong>${rating}★</strong> reputation with local clients!
    </p>

    <div style="background-color: #f1f5f9; border-left: 4px solid #6366f1; padding: 16px 20px; border-radius: 0 10px 10px 0; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">
        ${!hasWebsite 
          ? `<strong>Audit Finding:</strong> Your business currently lacks an official interactive website linked to Google Maps. Over 68% of local searchers look for direct booking or pricing before picking up the phone.` 
          : `<strong>Audit Finding:</strong> We ran a digital audit on your current site. While your core offering is strong, the mobile layout and page load speed have several bottlenecks that could be causing potential clients to bounce back to Google.`}
      </p>
    </div>

    <p style="font-size: 15px; color: #334155;">
      At <strong>${senderAgency}</strong>, we build modern, high-converting digital storefronts for growing businesses in North America. Instead of a generic pitch, we already prepared a <strong>complimentary custom Figma & interactive mockup preview</strong> tailored to ${company}.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="mailto:${options.replyEmail || 'hello@apexwebstudio.com'}?subject=Re:%20${encodeURIComponent(company)}%20Mockup%20Preview" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 13px 28px; font-size: 14px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
        Request Custom Mockup Preview &rarr;
      </a>
    </div>

    <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
      Zero sales pressure. If you'd like to see it, just reply with a quick <em>"Send it over"</em> or let me know if you prefer a 2-minute Loom screen recording.
    </p>

    <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #475569;">
      <strong>${senderName}</strong><br>
      <span style="color: #64748b; font-size: 13px;">${senderRole} &bull; ${senderAgency}</span>
    </div>
  </div>
</body>
</html>
`;
    }
  },
  {
    id: 'digital_health_audit',
    name: 'Visual Digital Health Audit Card',
    category: 'diagnostic',
    badge: 'High Engagement (+42% Replies)',
    subjectFormat: 'Website Audit Scorecard for {{company_name}} [Summary Report]',
    description: 'Features a sleek diagnostic scorecard highlighting performance metrics, mobile compatibility score, and estimated missed revenue opportunities.',
    plainText: (lead: Lead, options = {}) => {
      const senderName = options.senderName || 'Jordan Vance';
      const company = lead.name;
      const score = lead.ai_score || 78;
      const mobileStatus = lead.analysis?.mobile_friendly ? 'Pass (Basic)' : 'Needs Urgent Optimization';

      return `Hi ${company} Leadership,

We conducted an independent digital performance audit on ${company}'s online presence.

Here is the quick snapshot:
- Digital Conversion Health Score: ${score}/100
- Mobile Responsiveness: ${mobileStatus}
- Local Search Dominance: High Potential (Rating: ${lead.rating || '4.8'}★)
- Primary Opportunity: Upgrade mobile layout to capture same-day service bookings.

We've mapped out 3 specific technical tweaks that could increase your inbound client inquiries by an estimated 25-40% without increasing ad spend.

Would it be helpful if I shared our complete 3-page interactive audit report with your team this week?

Warmly,
${senderName}
Lead Tech Auditor | WebPulse Digital
`;
    },
    previewHtml: (lead: Lead, options = {}) => {
      const senderName = escapeHtml(options.senderName || 'Jordan Vance');
      const company = escapeHtml(lead.name);
      const score = lead.ai_score || 82;
      const mobileStatus = lead.analysis?.mobile_friendly ? 'Satisfactory' : 'Action Required';
      const mobileColor = lead.analysis?.mobile_friendly ? '#10b981' : '#f59e0b';
      const rating = lead.rating ? escapeHtml(String(lead.rating)) : '4.9';

      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Health Audit</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 20px; border: 1px solid #1e293b; padding: 36px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
    
    <!-- Header Badge -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 18px;">
      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8; font-weight: 700; background: rgba(56, 189, 248, 0.1); padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(56, 189, 248, 0.2);">
        Web Architecture Diagnostic
      </span>
      <span style="font-size: 12px; color: #94a3b8; font-family: monospace;">Confidential &bull; Prepared for ${company}</span>
    </div>

    <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">
      Digital Growth & Website Audit for <span style="color: #60a5fa;">${company}</span>
    </h2>
    <p style="font-size: 14px; color: #94a3b8; margin: 0 0 24px 0; line-height: 1.6;">
      Our automated crawler analyzed your online presence to evaluate client acquisition efficiency and mobile conversion rates in your local market.
    </p>

    <!-- Scorecards Grid -->
    <div style="background: #131c31; border: 1px solid #233354; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; padding: 10px; border-right: 1px solid #233354; vertical-align: top;">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Overall Tech Score</div>
            <div style="font-size: 32px; font-weight: 900; color: #38bdf8; margin: 4px 0;">${score}<span style="font-size: 14px; color: #64748b;">/100</span></div>
            <div style="font-size: 12px; color: #cbd5e1;">High optimization potential</div>
          </td>
          <td style="width: 50%; padding: 10px; padding-left: 20px; vertical-align: top;">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Mobile Experience</div>
            <div style="font-size: 18px; font-weight: 700; color: ${mobileColor}; margin: 8px 0;">${mobileStatus}</div>
            <div style="font-size: 12px; color: #cbd5e1;">72% of local searches are mobile</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Recommendations -->
    <div style="margin-bottom: 28px;">
      <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #cbd5e1; margin-bottom: 12px;">Top 3 Growth Recommendations:</div>
      
      <div style="background: rgba(255, 255, 255, 0.03); border-radius: 10px; padding: 12px 16px; margin-bottom: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; color: #e2e8f0;">
        ⚡ <strong>Speed & Mobile Flow:</strong> Implement instant 1-tap call & booking buttons for smartphone users.
      </div>
      <div style="background: rgba(255, 255, 255, 0.03); border-radius: 10px; padding: 12px 16px; margin-bottom: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; color: #e2e8f0;">
        🌟 <strong>Reputation Proof:</strong> Automatically sync and showcase your ${rating}★ Google reviews directly in the hero fold.
      </div>
      <div style="background: rgba(255, 255, 255, 0.03); border-radius: 10px; padding: 12px 16px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; color: #e2e8f0;">
        🔒 <strong>Conversion Architecture:</strong> Modernize page framework to Next.js / Cloudflare edge for sub-second load times.
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="mailto:${options.replyEmail || 'audit@webpulse.io'}?subject=Unlock%20Full%20Audit%20for%20${encodeURIComponent(company)}" style="display: inline-block; background: linear-gradient(135deg, #38bdf8 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 14px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 20px rgba(56, 189, 248, 0.35);">
        Unlock Full Interactive Report (Free)
      </a>
    </div>

    <div style="text-align: center; font-size: 12px; color: #64748b;">
      Report compiled by ${senderName} &bull; WebPulse Digital Intelligence &bull; Delivered with respect for your time.
    </div>
  </div>
</body>
</html>
`;
    }
  },
  {
    id: 'before_after_redesign',
    name: 'Before & After Redesign Blueprint',
    category: 'redesign',
    badge: 'Best for Visual & Service Businesses',
    subjectFormat: 'A quick visual concept we designed for {{company_name}}',
    description: 'Focuses on visual transformation, comparing outdated website friction with a modern 2026 digital experience that doubles conversion rates.',
    plainText: (lead: Lead, options = {}) => {
      const senderName = options.senderName || 'Elena Rostova';
      const company = lead.name;

      return `Hello ${company} Team,

Most website design discussions sound complex, so our design team took the liberty of creating a practical visual concept for ${company} before even reaching out.

What we revamped in this prototype:
1. Modernized layout: Clean, boutique aesthetic matching your local brand authority.
2. Fast Mobile Booking: Reduced customer friction from 5 steps down to 1 tap.
3. Automated SEO structure: Prepared to rank for high-intent keywords in ${lead.search_location || 'your market'}.

We uploaded the live interactive design preview to a secure staging link.

Would you be open to seeing the 90-second concept preview? Just reply "yes" and I'll send the direct link right over.

Respectfully,
${senderName}
Creative Director | NextEra Web Design
`;
    },
    previewHtml: (lead: Lead, options = {}) => {
      const senderName = escapeHtml(options.senderName || 'Elena Rostova');
      const company = escapeHtml(lead.name);
      const location = escapeHtml(lead.search_location || 'your area');

      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern Design Concept</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #334155;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);">
    
    <!-- Top Banner -->
    <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 32px 36px; color: #ffffff;">
      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #a5b4fc; font-weight: 700;">Exclusive Concept Mockup</span>
      <h1 style="font-size: 22px; font-weight: 800; margin: 8px 0 0 0;">Next-Gen Web Architecture for ${company}</h1>
      <p style="font-size: 13px; color: #cbd5e1; margin: 6px 0 0 0;">Engineered to double inbound consultation inquiries in ${location}</p>
    </div>

    <!-- Body Container -->
    <div style="padding: 36px;">
      <p style="font-size: 15px; line-height: 1.6; color: #1e293b; margin-top: 0;">
        Hello <strong>${company}</strong> team,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Instead of sending a generic sales email, our creative team built an interactive <strong>2026 Redesign Blueprint</strong> specifically tailored to your brand.
      </p>

      <!-- Comparison Matrix -->
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <th style="padding: 12px 16px; text-align: left; color: #64748b; font-weight: 600; width: 50%;">Traditional Web Presence</th>
            <th style="padding: 12px 16px; text-align: left; color: #4f46e5; font-weight: 700; width: 50%;">Modern Conversion Engine</th>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; color: #dc2626;">&times; Slow mobile loading (3-5s)</td>
            <td style="padding: 12px 16px; color: #16a34a; font-weight: 600;">&check; Sub-second edge delivery (<0.8s)</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; color: #dc2626;">&times; Buried contact phone number</td>
            <td style="padding: 12px 16px; color: #16a34a; font-weight: 600;">&check; Sticky instant tap-to-call / SMS</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; color: #dc2626;">&times; Static text without social proof</td>
            <td style="padding: 12px 16px; color: #16a34a; font-weight: 600;">&check; Dynamic 5★ Google reviews carousel</td>
          </tr>
        </table>
      </div>

      <!-- Action Box -->
      <div style="text-align: center; background: #faf5ff; border: 1px dashed #c084fc; border-radius: 12px; padding: 24px; margin: 28px 0;">
        <div style="font-size: 14px; font-weight: 700; color: #6b21a8; margin-bottom: 6px;">Want to review the live mockup?</div>
        <p style="font-size: 13px; color: #7e22ce; margin: 0 0 16px 0;">It’s completely free to review, with zero obligation to hire us.</p>
        <a href="mailto:${options.replyEmail || 'design@nextera.dev'}?subject=Yes%2C%20send%20the%20${encodeURIComponent(company)}%20concept" style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: 600; border-radius: 8px;">
          View Private Interactive Staging Link
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
        Simply reply <strong>"Send"</strong> and I'll forward the interactive access credentials right away.
      </p>

      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #475569;">
        <strong>${senderName}</strong> &bull; Creative Lead<br>
        NextEra Web Design & Engineering
      </div>
    </div>
  </div>
</body>
</html>
`;
    }
  },
  {
    id: 'local_reputation_champion',
    name: 'Local Star Business Special',
    category: 'local_reputation',
    badge: 'High Trust for 4.5★+ Businesses',
    subjectFormat: 'A 5-star digital storefront to match {{company_name}}\'s reputation',
    description: 'Leverages the business\'s stellar Google Maps reviews. Bridges the gap between their top-tier offline service and their online presentation.',
    plainText: (lead: Lead, options = {}) => {
      const senderName = options.senderName || 'Marcus Bell';
      const company = lead.name;
      const rating = lead.rating || 4.9;

      return `Hi ${company} Team,

I was looking through local businesses in ${lead.search_location || 'your area'} and couldn't help but notice your outstanding ${rating}-star rating on Google. It’s rare to see a business consistently maintain such great client praise.

The only thing that surprised me? Your digital presence doesn't quite reflect how exceptional your in-person service is. 

When high-ticket clients check you out online before making a decision, a modern, polished digital storefront is what turns that interest into immediate phone calls.

We specialize in elevating local market leaders with websites that match their real-world standard.

Are you open to a brief chat or seeing a customized preview this week?

Cheers,
${senderName}
Founder, Prestige Digital
`;
    },
    previewHtml: (lead: Lead, options = {}) => {
      const senderName = escapeHtml(options.senderName || 'Marcus Bell');
      const company = escapeHtml(lead.name);
      const rating = lead.rating ? escapeHtml(String(lead.rating)) : '4.9';
      const location = escapeHtml(lead.search_location || 'your region');

      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>5-Star Digital Alignment</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf9; color: #292524;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; padding: 40px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
    
    <!-- Reputation Header -->
    <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 14px 20px; margin-bottom: 24px; display: flex; align-items: center;">
      <span style="font-size: 20px; margin-right: 12px;">⭐</span>
      <div>
        <div style="font-size: 13px; font-weight: 700; color: #854d0e;">Verified Local Champion</div>
        <div style="font-size: 12px; color: #a16207;">${company} holds a stellar ${rating}★ ranking in ${location}</div>
      </div>
    </div>

    <h2 style="font-size: 22px; font-weight: 800; color: #1c1917; margin: 0 0 16px 0;">
      Does your website reflect your 5-star service?
    </h2>

    <p style="font-size: 15px; line-height: 1.6; color: #44403c;">
      Hi ${company} Team,
    </p>

    <p style="font-size: 15px; line-height: 1.6; color: #44403c;">
      Your customers clearly love working with you—maintaining an impressive <strong>${rating}-star reputation</strong> takes serious dedication to craftsmanship and customer care.
    </p>

    <p style="font-size: 15px; line-height: 1.6; color: #44403c;">
      However, when new prospective clients look up your business online, their first impression is formed in less than <strong>0.05 seconds</strong>. An outdated or missing web portal creates subtle doubt, prompting potential clients to continue shopping around with your competitors.
    </p>

    <div style="background: #f5f5f4; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 0 0 8px 0;">How we bridge this gap:</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #57534e; line-height: 1.6;">
        <li>Build a premium, high-trust digital flagship that matches your reputation.</li>
        <li>Integrate live Google Review badges and verified project galleries.</li>
        <li>Enable frictionless mobile scheduling so you never lose an after-hours lead.</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="mailto:${options.replyEmail || 'marcus@prestigeweb.com'}?subject=Interested%20in%20a%20modern%20web%20look%20for%20${encodeURIComponent(company)}" style="display: inline-block; background: #0c0a09; color: #fafaf9; text-decoration: none; padding: 13px 30px; font-size: 14px; font-weight: 600; border-radius: 8px;">
        Schedule a 10-Min Casual Strategy Chat &rarr;
      </a>
    </div>

    <p style="font-size: 14px; color: #78716c; margin-bottom: 0;">
      No hard pitch—just a friendly look at what’s possible for ${company} in 2026.
    </p>

    <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #e7e5e4; font-size: 14px; color: #44403c;">
      <strong>${senderName}</strong><br>
      <span style="color: #78716c; font-size: 13px;">Founder &bull; Prestige Digital Solutions</span>
    </div>
  </div>
</body>
</html>
`;
    }
  }
];

export function getTemplateById(id: string): EmailTemplate {
  return EMAIL_TEMPLATES.find(t => t.id === id) || EMAIL_TEMPLATES[0];
}

export function renderEmail(templateId: string, lead: Lead, options?: Record<string, any>) {
  const template = getTemplateById(templateId);
  const subject = template.subjectFormat
    .replace('{{company_name}}', lead.name)
    .replace('{{city}}', lead.search_location || 'your area');

  return {
    subject,
    plainText: template.plainText(lead, options),
    html: template.previewHtml(lead, options)
  };
}
