import dns from 'dns';

/**
 * Common disposable / temporary email domains that should be blocked
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'trashmail.com',
  'sharklasers.com',
  'getairmail.com',
  'throwawaymail.com',
  'yopmail.com',
]);

export interface EmailVerificationResult {
  email: string;
  valid: boolean;
  status: 'valid' | 'invalid_syntax' | 'invalid_domain' | 'disposable';
  reason: string;
  mxHost?: string;
}

export interface BounceParseResult {
  extractedEmails: string[];
  failureReasons: Record<string, string>;
  summary: string;
}

export const emailVerifier = {
  /**
   * 1. Validate RFC 5322 Email Syntax
   */
  validateSyntax(email: string): { valid: boolean; reason?: string } {
    if (!email || typeof email !== 'string') {
      return { valid: false, reason: '邮箱地址为空' };
    }
    const trimmed = email.trim();
    if (trimmed.length > 254) {
      return { valid: false, reason: '邮箱长度超出上限 (254字符)' };
    }
    // Standard RFC regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, reason: '邮箱格式不符合标准 RFC 规范' };
    }
    return { valid: true };
  },

  /**
   * 2. Verify Domain DNS MX Records with Timeout
   */
  async checkMx(domain: string, timeoutMs = 3000): Promise<{ valid: boolean; mxRecords?: string[]; reason?: string }> {
    const cleanDomain = domain.trim().toLowerCase();
    
    // Check if domain is in disposable list
    if (DISPOSABLE_DOMAINS.has(cleanDomain)) {
      return { valid: false, reason: '属于一次性临时邮箱域名 (Disposable Email)' };
    }

    // Ignore dummy local domains
    if (cleanDomain.endsWith('.local') || cleanDomain.endsWith('.internal') || cleanDomain === 'localhost') {
      return { valid: false, reason: '本地或内部私有域名无法接收外网邮件' };
    }

    try {
      const resolvePromise = dns.promises.resolveMx(cleanDomain);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('DNS_TIMEOUT')), timeoutMs)
      );

      const records = await Promise.race([resolvePromise, timeoutPromise]);

      if (Array.isArray(records) && records.length > 0) {
        // Sort by priority
        const sorted = records.sort((a, b) => a.priority - b.priority);
        return { 
          valid: true, 
          mxRecords: sorted.map((r) => `${r.exchange} (pri:${r.priority})`) 
        };
      }

      return { valid: false, reason: '该域名未配置任何 MX 邮件交换记录，无法接收邮件' };
    } catch (err: any) {
      if (err.message === 'DNS_TIMEOUT') {
        // In case of DNS timeout, don't strictly hard-block, but flag as risky
        return { valid: true, reason: 'DNS 响应超时，允许保守尝试' };
      }
      if (err.code === 'ENOTFOUND') {
        return { valid: false, reason: 'DNS 域名不存在 (Domain Not Found)' };
      }
      if (err.code === 'ENODATA') {
        return { valid: false, reason: '域名存在但未配置任何 MX 邮件服务器记录' };
      }
      return { valid: false, reason: `DNS 解析异常: ${err.code || err.message}` };
    }
  },

  /**
   * 3. Complete Pre-flight Email Check (Syntax + MX Record)
   */
  async verifyEmail(email: string): Promise<EmailVerificationResult> {
    const syntax = this.validateSyntax(email);
    if (!syntax.valid) {
      return {
        email,
        valid: false,
        status: 'invalid_syntax',
        reason: syntax.reason || '邮箱格式不规范',
      };
    }

    const domain = email.split('@')[1];
    const mx = await this.checkMx(domain);

    if (!mx.valid) {
      return {
        email,
        valid: false,
        status: 'invalid_domain',
        reason: mx.reason || '域名无有效 MX 邮件服务器',
      };
    }

    return {
      email,
      valid: true,
      status: 'valid',
      reason: '邮箱格式规范且域名配置有有效 MX 记录',
      mxHost: mx.mxRecords?.[0],
    };
  },

  /**
   * 4. Detect if an inbound email is an NDR / Bounce Notification
   */
  isBounceNotification(senderEmail: string, subject: string, content: string): boolean {
    const s = (senderEmail || '').toLowerCase();
    const subj = (subject || '').toLowerCase();
    const body = (content || '').toLowerCase();

    // Check sender
    if (
      s.includes('mailer-daemon') ||
      s.includes('postmaster') ||
      s.includes('mail-daemon') ||
      s.includes('noreply') ||
      s.includes('no-reply') ||
      s.includes('bounce') ||
      s.includes('delivery-notification')
    ) {
      return true;
    }

    // Check subject
    if (
      subj.includes('delivery status notification') ||
      subj.includes('mail delivery failed') ||
      subj.includes('undelivered mail') ||
      subj.includes('undeliverable') ||
      subj.includes('failure notice') ||
      subj.includes('returned mail') ||
      subj.includes('delivery failure') ||
      subj.includes('系统退信') ||
      subj.includes('邮件未能送达') ||
      subj.includes('投递失败') ||
      subj.includes('无法送达')
    ) {
      return true;
    }

    // Check body markers
    if (
      body.includes('550 5.1.1') ||
      body.includes('550 user not found') ||
      body.includes('550 user unknown') ||
      body.includes('mailbox unavailable') ||
      body.includes('recipient rejected') ||
      body.includes('host or domain name not found') ||
      body.includes('action: failed') ||
      body.includes('status: 5.')
    ) {
      return true;
    }

    return false;
  },

  /**
   * 5. Parse Bounced Emails from Raw NDR Text or User-Pasted Bounce Notices
   */
  parseBounceText(rawText: string): BounceParseResult {
    if (!rawText) {
      return { extractedEmails: [], failureReasons: {}, summary: '未提供任何退信文本' };
    }

    // Comprehensive regex for email addresses
    const emailRegex = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/g;
    const matches = rawText.match(emailRegex) || [];

    // Filter out our own sender emails & common daemon addresses
    const systemAddresses = new Set([
      'jyu@wisdomitc.com',
      'mailer-daemon@googlemail.com',
      'mailer-daemon@exmail.qq.com',
      'postmaster@exmail.qq.com',
    ]);

    const extractedSet = new Set<string>();
    for (const m of matches) {
      const lower = m.toLowerCase();
      if (
        !systemAddresses.has(lower) &&
        !lower.includes('mailer-daemon') &&
        !lower.includes('postmaster') &&
        !lower.includes('domain.com') &&
        !lower.includes('example.com')
      ) {
        extractedSet.add(lower);
      }
    }

    // Infer bounce reason from text
    let detectedReason = '邮箱地址不存在或已被注销 (550 User Unknown / Mailbox Unavailable)';
    if (rawText.includes('550') || rawText.includes('User unknown') || rawText.includes('does not exist')) {
      detectedReason = '550 Recipient address rejected: User unknown (用户不存在)';
    } else if (rawText.includes('Domain not found') || rawText.includes('Host not found') || rawText.includes('ENOTFOUND')) {
      detectedReason = '域名不存在或已过期注销 (Domain Not Found)';
    } else if (rawText.includes('Mailbox full') || rawText.includes('Quota exceeded')) {
      detectedReason = '对方邮箱已满 (Mailbox Full / Quota Exceeded)';
    } else if (rawText.includes('Spam') || rawText.includes('Blacklist') || rawText.includes('Policy rejection')) {
      detectedReason = '被对方邮件服务器安全策略拒收 (Policy / Anti-Spam Rejection)';
    }

    const failureReasons: Record<string, string> = {};
    extractedSet.forEach((email) => {
      failureReasons[email] = detectedReason;
    });

    const extractedEmails = Array.from(extractedSet);
    const summary = extractedEmails.length > 0
      ? `成功识别出 ${extractedEmails.length} 个失效退信邮箱地址`
      : '未能从文本中检测到有效的外部退信邮箱';

    return {
      extractedEmails,
      failureReasons,
      summary,
    };
  }
};
