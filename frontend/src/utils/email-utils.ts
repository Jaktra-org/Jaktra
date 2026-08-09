export function parseEmailBody(fullBody: string): { replyText: string; quotedText: string | null } {
  if (!fullBody) return { replyText: '', quotedText: null };

  const normalized = fullBody.replace(/\r\n/g, '\n');

  // Regex patterns matching standard email thread headers/quotes:
  // 1. "On <date/time> ... wrote:"
  // 2. "-----Original Message-----"
  // 3. "From: ... Sent: ... To: ..."
  // 4. Lines starting with '>'
  const quotePattern = /(?:^|\n)(On\s+[\s\S]{1,200}?\s+wrote:|-----Original Message-----|From:[\s\S]{1,100}?Sent:|>[\s\S]*)/i;

  const match = normalized.match(quotePattern);
  if (match && match.index !== undefined && match.index > 0) {
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
