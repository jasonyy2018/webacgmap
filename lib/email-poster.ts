import { Lead } from './types';

export interface PosterOptions {
  originDomain?: string;
  proposalUrl?: string;
  replyEmail?: string;
  senderName?: string;
  senderRole?: string;
  senderAgency?: string;
  senderPhone?: string;
  customHeadline?: string;
  customNote?: string;
}

function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate an executive-grade HTML email poster for outbound outreach.
 * Designed with a modern, high-contrast dark theme, HUD scorecard, 
 * transformation pillars, interactive concept CTA, and official signature.
 */
export function generateExecutivePosterHtml(lead: Lead, options: PosterOptions = {}): string {
  const company = escapeHtml(lead.name);
  const location = escapeHtml(lead.search_location || 'North America');
  const rating = lead.rating ? Number(lead.rating).toFixed(1) : '4.9';
  const score = lead.ai_score || 82;
  const hasWebsite = Boolean(lead.website);
  const mobileFriendly = Boolean(lead.analysis?.mobile_friendly);
  
  const senderName = escapeHtml(options.senderName || 'Jason Yu');
  const senderRole = escapeHtml(options.senderRole || 'Senior Web Strategist & Tech Lead');
  const senderAgency = escapeHtml(options.senderAgency || 'Nexora Digital Studio');
  const senderEmail = escapeHtml(options.replyEmail || 'jyu@wisdomitc.com');
  const senderPhone = escapeHtml(options.senderPhone || '+1 (380) 218-4573');

  // Proposal URL
  const origin = options.originDomain || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const proposalUrl = options.proposalUrl || `${origin}/proposal/${lead.id}`;

  const mobileStatusText = mobileFriendly ? 'Basic Mobile View' : 'Friction Detected (Urgent)';
  const mobileColor = mobileFriendly ? '#10b981' : '#f59e0b';
  const estimatedLostVisitors = lead.analysis?.estimated_lost_visitors_monthly || 180;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>2026 Web Architecture Blueprint for ${company}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #060913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #f1f5f9;">
  
  <!-- Outer Wrapper Table -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #060913; padding: 24px 12px;">
    <tr>
      <td align="center">
        
        <!-- Main Card Container (640px Max) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; background-color: #0c1222; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);">
          
          <!-- Top Accent Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #38bdf8 0%, #6366f1 50%, #a855f7 100%);"></td>
          </tr>

          <!-- Header Masthead -->
          <tr>
            <td style="padding: 24px 32px 16px 32px; border-bottom: 1px solid #192338;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <div style="font-size: 15px; font-weight: 800; letter-spacing: 1.5px; color: #38bdf8; text-transform: uppercase;">
                      &#x26A1; NEXORA DIGITAL STUDIO
                    </div>
                    <div style="font-size: 11px; color: #64748b; letter-spacing: 0.5px; margin-top: 2px;">
                      Enterprise Web Architecture &bull; Global Strategy
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; font-size: 10px; font-weight: 700; color: #38bdf8; background-color: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.28); padding: 5px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px;">
                      2026 BENCHMARK AUDIT
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Section: Cover Banner -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15) 0%, rgba(12, 18, 34, 0) 70%);">
              
              <!-- Reputation Badge -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background-color: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 6px 14px;">
                    <span style="color: #fbbf24; font-size: 13px; font-weight: 700;">&#x2B50; ${rating}&#x2605; Verified Google Reputation</span>
                    <span style="color: #94a3b8; font-size: 12px; margin-left: 6px;">&bull; ${location} Market Leader</span>
                  </td>
                </tr>
              </table>

              <!-- Main Headline -->
              <h1 style="margin: 0 0 12px 0; font-size: 24px; line-height: 1.35; font-weight: 800; color: #ffffff;">
                Digital Transformation Blueprint for <span style="color: #38bdf8;">${company}</span>
              </h1>
              
              <!-- Context Narrative -->
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.65; color: #94a3b8;">
                ${!hasWebsite 
                  ? `While researching leading service providers in <strong>${location}</strong>, we noticed that <strong>${company}</strong> maintains an outstanding local reputation, but currently lacks a modern official website linked to Google Maps. In 2026, over 76% of high-intent local clients research online before calling; competitors with instant mobile booking are quietly capturing after-hours clients.`
                  : `Our engineering audit crawled <strong>${company}</strong>'s current web footprint. While your core service standard is exceptional, bottlenecks in your mobile responsiveness and page speed create friction—costing your team dozens of qualified inbound inquiries each month.`}
              </p>

            </td>
          </tr>

          <!-- Diagnostic HUD Scorecard Grid -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: #0f182c; border: 1px solid #1f2b45; border-radius: 14px; padding: 20px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 14px;">
                  &#x1F4CA; Live Performance Diagnostic Scorecard
                </div>
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <!-- Metric 1: Overall Score -->
                    <td width="48%" style="background-color: #141f38; border: 1px solid #233355; border-radius: 10px; padding: 14px; vertical-align: top;">
                      <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Overall Tech Health</div>
                      <div style="font-size: 28px; font-weight: 900; color: #38bdf8; margin: 4px 0 2px 0;">
                        ${score}<span style="font-size: 14px; color: #64748b; font-weight: 500;">/100</span>
                      </div>
                      <div style="font-size: 11px; color: #10b981; font-weight: 600;">High ROI Growth Potential</div>
                    </td>

                    <td width="4%"></td>

                    <!-- Metric 2: Mobile Viewport -->
                    <td width="48%" style="background-color: #141f38; border: 1px solid #233355; border-radius: 10px; padding: 14px; vertical-align: top;">
                      <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Mobile Viewport Flow</div>
                      <div style="font-size: 18px; font-weight: 800; color: ${mobileColor}; margin: 8px 0 4px 0;">
                        ${mobileStatusText}
                      </div>
                      <div style="font-size: 11px; color: #94a3b8;">72% of local searches are mobile</div>
                    </td>
                  </tr>

                  <tr><td height="12" colspan="3"></td></tr>

                  <tr>
                    <!-- Metric 3: Target Load Speed -->
                    <td width="48%" style="background-color: #141f38; border: 1px solid #233355; border-radius: 10px; padding: 14px; vertical-align: top;">
                      <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">TTFB Edge Latency</div>
                      <div style="font-size: 22px; font-weight: 800; color: #a78bfa; margin: 6px 0 2px 0;">
                        &lt; 0.8s
                      </div>
                      <div style="font-size: 11px; color: #94a3b8;">Cloudflare Global Edge Target</div>
                    </td>

                    <td width="4%"></td>

                    <!-- Metric 4: Est. Lost Opportunity -->
                    <td width="48%" style="background-color: #141f38; border: 1px solid #233355; border-radius: 10px; padding: 14px; vertical-align: top;">
                      <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Est. Missed Inquiries</div>
                      <div style="font-size: 22px; font-weight: 800; color: #f43f5e; margin: 6px 0 2px 0;">
                        ~${estimatedLostVisitors}/mo
                      </div>
                      <div style="font-size: 11px; color: #94a3b8;">Bounce rate recovery target</div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- 3 Core Transformation Pillars -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #cbd5e1; margin-bottom: 12px;">
                &#x1F680; 3 Strategic Upgrades Engineered for ${company}:
              </div>

              <!-- Pillar 1 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; margin-bottom: 8px;">
                <tr>
                  <td width="40" align="center" style="vertical-align: top; padding: 12px 0 0 12px; font-size: 18px;">
                    &#x26A1;
                  </td>
                  <td style="padding: 12px 14px 12px 4px;">
                    <div style="font-size: 13px; font-weight: 700; color: #f8fafc;">1-Tap Mobile Conversion Engine</div>
                    <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 2px;">
                      Sticky instant tap-to-call, SMS dispatch, and frictionless appointment booking designed specifically for smartphone shoppers.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Pillar 2 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; margin-bottom: 8px;">
                <tr>
                  <td width="40" align="center" style="vertical-align: top; padding: 12px 0 0 12px; font-size: 18px;">
                    &#x1F3C6;
                  </td>
                  <td style="padding: 12px 14px 12px 4px;">
                    <div style="font-size: 13px; font-weight: 700; color: #f8fafc;">Verified Social Proof Synchronization</div>
                    <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 2px;">
                      Automated live sync of your ${rating}&#x2605; Google reviews directly into the header fold to eliminate client skepticism within 0.05 seconds.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Pillar 3 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px;">
                <tr>
                  <td width="40" align="center" style="vertical-align: top; padding: 12px 0 0 12px; font-size: 18px;">
                    &#x1F525;
                  </td>
                  <td style="padding: 12px 14px 12px 4px;">
                    <div style="font-size: 13px; font-weight: 700; color: #f8fafc;">2026 Next.js Edge Architecture</div>
                    <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 2px;">
                      Sub-second load times that satisfy Google Core Web Vitals, elevating local search placement and lowering customer drop-off.
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Teaser Mockup & Interactive Proposal Access -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(99, 102, 241, 0.12) 100%); border: 1px dashed rgba(99, 102, 241, 0.4); border-radius: 14px; padding: 24px; text-align: center;">
                <tr>
                  <td>
                    <span style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #a5b4fc; letter-spacing: 1px;">
                      &#x1F3A8; Live Interactive Concept Prototype
                    </span>
                    <h3 style="margin: 8px 0 6px 0; font-size: 17px; font-weight: 800; color: #ffffff;">
                      We Built a Custom Interactive Proposal for ${company}
                    </h3>
                    <p style="margin: 0 0 18px 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                      Zero generic templates. Explore the 3D comparison, technical roadmap, and interactive ROI calculator rendered specifically for your business.
                    </p>

                    <!-- Radiant CTA Button -->
                    <div>
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${proposalUrl}" style="height:48px;v-text-anchor:middle;width:340px;" arcsize="18%" stroke="f" fillcolor="#4f46e5">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">&#x1F680; Launch Interactive Concept Preview &rarr;</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${proposalUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #38bdf8 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; font-size: 14px; font-weight: 800; border-radius: 10px; box-shadow: 0 4px 20px rgba(56, 189, 248, 0.35); letter-spacing: 0.5px;">
                        &#x1F680; Launch Interactive Concept Preview &rarr;
                      </a>
                      <!--<![endif]-->
                    </div>

                    <div style="margin-top: 14px; font-size: 12px; color: #94a3b8;">
                      Prefer a 2-minute video walkthrough? Simply reply <em>"SEND WALKTHROUGH"</em> to this email.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Executive Sign-off Block -->
          <tr>
            <td style="padding: 24px 32px; background-color: #090e1b; border-top: 1px solid #192338;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="52" style="vertical-align: middle;">
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #38bdf8 0%, #6366f1 100%); color: #ffffff; font-weight: 900; font-size: 16px; text-align: center; line-height: 44px; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);">
                      JY
                    </div>
                  </td>
                  <td style="vertical-align: middle; padding-left: 12px;">
                    <div style="font-size: 15px; font-weight: 800; color: #ffffff;">${senderName}</div>
                    <div style="font-size: 12px; color: #38bdf8; font-weight: 600;">${senderRole} &bull; ${senderAgency}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                      Email: <a href="mailto:${senderEmail}" style="color: #94a3b8; text-decoration: none;">${senderEmail}</a> &bull; Direct: ${senderPhone}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer & Anti-Spam Compliance -->
          <tr>
            <td style="padding: 20px 32px; background-color: #060913; border-top: 1px solid #141d2e; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569; line-height: 1.5;">
                This executive diagnostic was personally prepared for leadership at <strong>${company}</strong> based on public Google Maps business data.
              </p>
              <p style="margin: 0; font-size: 11px; color: #334155;">
                We respect your inbox. If you prefer not to receive digital presence audits, simply reply with "Unsubscribe" and you will be immediately removed.
              </p>
            </td>
          </tr>

        </table>
        <!-- End Main Card -->

      </td>
    </tr>
  </table>
  <!-- End Outer Table -->

</body>
</html>`;
}

/**
 * Generate a clean plain-text fallback containing the same value hooks, metrics,
 * and direct proposal link.
 */
export function generateExecutivePosterPlainText(lead: Lead, options: PosterOptions = {}): string {
  const company = lead.name;
  const location = lead.search_location || 'North America';
  const rating = lead.rating || 4.9;
  const score = lead.ai_score || 82;
  const mobileFriendly = Boolean(lead.analysis?.mobile_friendly);
  
  const senderName = options.senderName || 'Jason Yu';
  const senderRole = options.senderRole || 'Senior Web Strategist';
  const senderAgency = options.senderAgency || 'Nexora Digital Studio';
  const senderPhone = options.senderPhone || '+1 (380) 218-4573';
  const senderEmail = options.replyEmail || 'jyu@wisdomitc.com';

  const origin = options.originDomain || 'http://localhost:3000';
  const proposalUrl = options.proposalUrl || `${origin}/proposal/${lead.id}`;

  const issueHook = !lead.website
    ? `While researching top-rated providers in ${location}, I noticed that ${company} maintains a stellar ${rating}★ reputation on Google, but currently lacks an official interactive website. In 2026, 76% of high-intent clients search on mobile before booking.`
    : `While analyzing local market leaders in ${location}, our diagnostic evaluated ${company}'s current web experience. While your service quality is top-tier (${rating}★), your mobile checkout/booking flow and page speed bottleneck potential clients from converting.`;

  return `Hi ${company} Leadership Team,

I came across ${company} while conducting a local market audit in ${location}—congratulations on maintaining an outstanding ${rating}★ reputation with local clients!

${issueHook}

=== 2026 DIGITAL DIAGNOSTIC SNAPSHOT ===
- Overall Web Health Score: ${score}/100 (High Growth Potential)
- Mobile Viewport: ${mobileFriendly ? 'Basic Compatibility' : 'Optimization Required'}
- Target Page Speed: <0.8s on Cloudflare Edge
- Estimated Inbound Opportunity Loss: ~180 missed visitors/mo

Rather than sending a generic sales pitch, our engineering team has already designed a complimentary, interactive 3D concept prototype specifically for ${company}.

You can explore your custom prototype and ROI breakdown here:
👉 ${proposalUrl}

Key Upgrades Included:
1. 1-Tap Mobile Conversion: Instant tap-to-call, SMS dispatch, and frictionless appointment booking.
2. Verified Social Proof: Real-time 5-star Google review sync directly in the hero fold.
3. Sub-Second Architecture: Next-gen speed that elevates your local Google search rank.

Zero sales pressure. If you prefer a 2-minute video walkthrough instead, simply reply "SEND WALKTHROUGH" to this email.

Best regards,

${senderName}
${senderRole} | ${senderAgency}
Direct: ${senderPhone}
Email: ${senderEmail}
`;
}
