interface ContactInfo {
  email: string | null;
  email_confidence: number;
  linkedin_url: string | null;
  twitter_handle: string | null;
}

/**
 * NewsAPI author fields come in several messy formats:
 *   "Jane Smith"                       → simple case
 *   "Hengrui Liu, Postdoctoral ..."    → name + title/affiliation
 *   "noreply@site.com (Rohit Gupta)"   → email with name in parens
 *   "nbuchanan@insider.com (Naomi B)"  → same pattern
 *
 * Extraction strategy:
 *   1. If parentheses are present, use the text inside them (the real name)
 *   2. Otherwise take text before the first comma
 *   3. Strip non-alpha characters, keep words with 2+ letters
 *   4. Return { first, last } — falls back to "unknown" if missing
 */
function extractName(raw: string): { first: string; last: string } {
  const parenMatch = raw.match(/\(([^)]+)\)/);
  const nameStr = parenMatch ? parenMatch[1] : raw.split(",")[0];

  const words = nameStr
    .trim()
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  return {
    first: (words[0] || "unknown").toLowerCase(),
    last: (words[words.length - 1] || "unknown").toLowerCase(),
  };
}

/**
 * Generates a plausible email from a reporter's name and outlet.
 * In production, this would call an enrichment API like RocketReach
 * or Apollo. The interface is ready for that swap.
 */
function generateMockEmail(name: string, outlet: string): string {
  const { first, last } = extractName(name);

  const domain = outlet
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .concat(".com");

  return `${first}.${last}@${domain}`;
}

function generateMockTwitter(name: string): string {
  const { first, last } = extractName(name);
  return `@${first}${last}`;
}

function generateMockLinkedIn(name: string): string {
  const { first, last } = extractName(name);
  return `https://linkedin.com/in/${first}-${last}`;
}

/**
 * Returns mocked contact info for a reporter.
 * email_confidence is randomly set between 0.5-0.95 to simulate
 * real-world enrichment APIs that return confidence scores.
 */
export function enrichReporter(name: string, outlet: string): ContactInfo {
  return {
    email: generateMockEmail(name, outlet),
    email_confidence: Math.round((0.5 + Math.random() * 0.45) * 100) / 100,
    linkedin_url: generateMockLinkedIn(name),
    twitter_handle: generateMockTwitter(name),
  };
}
