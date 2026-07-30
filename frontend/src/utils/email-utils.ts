export function stripHtml(html: string): string {
  if (!html) return '';
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html.trim();
  }
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/td>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

export function parseEmailBody(fullBody: string): { replyText: string; quotedText: string | null } {
  if (!fullBody) return { replyText: '', quotedText: null };

  const cleanedInput = stripHtml(fullBody);
  const normalized = cleanedInput.replace(/\r\n/g, '\n');

  // Match quote headers such as:
  // "On Thu, 30 Jul... wrote:" or "-----Original Message-----" or "From: ... Sent:" or lines with ">"
  const quotePattern = /(?:^|\s|\n)(On\s+[\s\S]{1,150}?\s+wrote:|-----Original Message-----|From:[\s\S]{1,100}?Sent:|>[\s\S]*)/i;

  const match = normalized.match(quotePattern);
  if (match && match.index !== undefined) {
    const replyText = normalized.substring(0, match.index).trim();
    const rawQuotedText = normalized.substring(match.index).trim();
    // Strip leading '>' quote prefixes from lines so original email shows cleanly as sent
    const cleanedQuotedText = rawQuotedText.replace(/^>\s?/gm, '');
    return {
      replyText: replyText || normalized.trim(),
      quotedText: cleanedQuotedText || null,
    };
  }

  return {
    replyText: normalized.trim(),
    quotedText: null,
  };
}

export function extractMainContentSummary(fullBody: string): string {
  if (!fullBody) return '';
  const { replyText } = parseEmailBody(fullBody);
  if (!replyText) return '';

  // Remove common salutations and greetings from the beginning
  let clean = replyText
    .replace(/^(?:hi|hello|dear|hey|good\s+(?:morning|afternoon|evening))\s*,?\s*/i, '')
    .replace(/^(?:team|support|customer|sir|madam)\s*,?\s*/i, '');

  // Remove common sign-offs and closing remarks from the end
  clean = clean
    .replace(/(?:thanks|thank\s+you|regards|best\s+regards|kind\s+regards|sincerely|looking\s+forward\s+to[\s\S]*)$/i, '')
    .trim();

  // If cleaning stripped all text, fall back to the normalized replyText
  const summary = clean || replyText.trim();
  
  if (!summary) return '';
  // Ensure the summary starts with a capital letter
  return summary.charAt(0).toUpperCase() + summary.slice(1);
}
