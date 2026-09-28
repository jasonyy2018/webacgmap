import axios from 'axios';
import * as cheerio from 'cheerio';
import { emailVerifier, EmailVerificationResult } from './email-verifier';

export interface EmailHunterResult {
  found: boolean;
  email?: string;
  source?: 'existing' | 'website_homepage' | 'website_contact_page' | 'website_about_page' | 'website_footer' | 'domain_role_candidate';
  reason?: string;
  verification?: EmailVerificationResult;
  testedCandidates?: string[];
}

const COMMON_CONTACT_PATHS = [
  '/contact',
  '/contact-us',
  '/contact_us',
  '/about',
  '/about-us',
  '/get-in-touch',
  '/customer-service',
  '/reach-us',
  '/privacy-policy',
];

const STANDARD_ROLE_PREFIXES = [
  'info',
  'contact',
  'office',
  'service',
  'support',
  'hello',
  'estimates',
  'sales',
  'admin',
];

/**
 * Extract clean emails from raw HTML content
 */
function extractEmailsFromHtml(html: string): string[] {
  if (!html || typeof html !== 'string') return [];

  const foundSet = new Set<string>();

  try {
    const $ = cheerio.load(html);

    // 1. Mailto links
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        const clean = href.replace(/^mailto:/i, '').split('?')[0].trim().toLowerCase();
        if (clean && clean.includes('@')) {
          foundSet.add(clean);
        }
      }
    });

    // 2. Body text search
    $('script, style, noscript, svg').remove();
    const text = $('body').text();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];

    for (const m of matches) {
      const lower = m.toLowerCase();
      // Filter out common false positives and image files
      if (
        !lower.endsWith('.png') &&
        !lower.endsWith('.jpg') &&
        !lower.endsWith('.jpeg') &&
        !lower.endsWith('.webp') &&
        !lower.endsWith('.gif') &&
        !lower.endsWith('.svg') &&
        !lower.includes('sentry') &&
        !lower.includes('wixpress') &&
        !lower.includes('webpack') &&
        !lower.includes('example.com') &&
        !lower.includes('domain.com') &&
        !lower.includes('schema.org')
      ) {
        foundSet.add(lower);
      }
    }
  } catch (err) {
    // ignore parse error
  }

  return Array.from(foundSet);
}

/**
 * Fetch a webpage with browser headers and strict timeout
 */
async function fetchUrlHtml(url: string, timeoutMs = 5000): Promise<string | null> {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: timeoutMs,
      maxRedirects: 3,
      validateStatus: () => true,
    });

    if (typeof res.data === 'string') {
      return res.data;
    }
    return null;
  } catch {
    return null;
  }
}

export const emailHunter = {
  /**
   * Intelligently discovers a valid, reachable email for a given business lead.
   * If current email is invalid, it crawls their website subpages and checks domain MX.
   */
  async findValidEmailForLead(lead: {
    id?: number;
    name: string;
    website?: string | null;
    contact_email?: string | null;
    search_location?: string | null;
  }): Promise<EmailHunterResult> {
    const testedCandidates: string[] = [];

    // -------------------------------------------------------------
    // STEP 1: Verify current contact_email if provided
    // -------------------------------------------------------------
    if (lead.contact_email && lead.contact_email.includes('@')) {
      const candidate = lead.contact_email.trim().toLowerCase();
      testedCandidates.push(candidate);
      const verification = await emailVerifier.verifyEmail(candidate);
      if (verification.valid) {
        return {
          found: true,
          email: candidate,
          source: 'existing',
          verification,
          testedCandidates,
        };
      }
    }

    // If current email is invalid or missing, check if business has a website
    const rawWebsite = (lead.website || '').trim();
    if (!rawWebsite) {
      return {
        found: false,
        reason: '该商机未登记官方网站，且当前无有效公开邮箱',
        testedCandidates,
      };
    }

    // Normalize URL
    let baseUrl: string;
    let domain: string;
    try {
      const fullUrl = rawWebsite.startsWith('http') ? rawWebsite : `https://${rawWebsite}`;
      const parsed = new URL(fullUrl);
      baseUrl = `${parsed.protocol}//${parsed.host}`;
      domain = parsed.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      return {
        found: false,
        reason: `网站网址格式异常: ${rawWebsite}`,
        testedCandidates,
      };
    }

    // Ignore social media or directories as company domains
    const invalidHosts = ['facebook.com', 'instagram.com', 'yelp.com', 'google.com', 'yellowpages.com', 'linkedin.com', 'twitter.com'];
    if (invalidHosts.some((h) => domain.includes(h))) {
      return {
        found: false,
        reason: '客户登记的网址属于第三方社交媒体或目录网站，无法推导企业自建邮箱',
        testedCandidates,
      };
    }

    // -------------------------------------------------------------
    // STEP 2: Verify if the domain itself has valid DNS MX records
    // -------------------------------------------------------------
    const domainMx = await emailVerifier.checkMx(domain, 3000);
    const domainCanReceiveEmail = domainMx.valid;

    // -------------------------------------------------------------
    // STEP 3: Deep Crawl Website Subpages (Contact, About, Footer)
    // -------------------------------------------------------------
    const discoveredFromPages = new Set<string>();

    // 3.1 Fetch Homepage
    const homeHtml = await fetchUrlHtml(baseUrl, 6000);
    if (homeHtml) {
      extractEmailsFromHtml(homeHtml).forEach((e) => discoveredFromPages.add(e));
    }

    // 3.2 Fetch Key Contact Subpages concurrently
    const subpageUrls = COMMON_CONTACT_PATHS.map((path) => `${baseUrl}${path}`);
    const subpagePromises = subpageUrls.slice(0, 4).map((url) => fetchUrlHtml(url, 4000));
    const subpageResults = await Promise.allSettled(subpagePromises);

    for (const res of subpageResults) {
      if (res.status === 'fulfilled' && res.value) {
        extractEmailsFromHtml(res.value).forEach((e) => discoveredFromPages.add(e));
      }
    }

    // -------------------------------------------------------------
    // STEP 4: Test and Verify all Scraped Candidates
    // -------------------------------------------------------------
    const candidateList = Array.from(discoveredFromPages);

    // Prioritize emails sharing the company's domain
    candidateList.sort((a, b) => {
      const aMatchesDomain = a.endsWith(`@${domain}`) ? 1 : 0;
      const bMatchesDomain = b.endsWith(`@${domain}`) ? 1 : 0;
      return bMatchesDomain - aMatchesDomain;
    });

    for (const candidate of candidateList) {
      if (testedCandidates.includes(candidate)) continue;
      testedCandidates.push(candidate);

      const verification = await emailVerifier.verifyEmail(candidate);
      if (verification.valid) {
        return {
          found: true,
          email: candidate,
          source: candidate.endsWith(`@${domain}`) ? 'website_contact_page' : 'website_homepage',
          verification,
          testedCandidates,
        };
      }
    }

    // -------------------------------------------------------------
    // STEP 5: Standard Role Prefix Probing (Only if domain MX is 100% valid)
    // -------------------------------------------------------------
    if (domainCanReceiveEmail) {
      for (const prefix of STANDARD_ROLE_PREFIXES) {
        const roleCandidate = `${prefix}@${domain}`;
        if (testedCandidates.includes(roleCandidate)) continue;
        testedCandidates.push(roleCandidate);

        const verification = await emailVerifier.verifyEmail(roleCandidate);
        if (verification.valid) {
          return {
            found: true,
            email: roleCandidate,
            source: 'domain_role_candidate',
            verification,
            testedCandidates,
          };
        }
      }
    }

    // -------------------------------------------------------------
    // STEP 6: No valid email found across all sources
    // -------------------------------------------------------------
    return {
      found: false,
      reason: domainCanReceiveEmail
        ? `官网全量深度爬取未匹配到公开邮箱，已探测 ${testedCandidates.length} 个候选地址均未通过校验`
        : `客户官方网站域名 (${domain}) 未配置任何有效 MX 邮件服务器或已过期`,
      testedCandidates,
    };
  },
};
