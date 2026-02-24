interface ContactInfo {
  email: string | null;
  email_confidence: number;
  linkedin_url: string | null;
  twitter_handle: string | null;
}

/**
 * Generates a plausible email from a reporter's name and outlet.
 * In production, this would call an enrichment API like RocketReach
 * or Apollo. The interface is ready for that swap.
 */
function generateMockEmail(name: string, outlet: string): string {
  const nameParts = name.toLowerCase().split(/\s+/);
  const first = nameParts[0] || "unknown";
  const last = nameParts[nameParts.length - 1] || "unknown";

  const domain = outlet
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .concat(".com");

  return `${first}.${last}@${domain}`;
}

function generateMockTwitter(name: string): string {
  return `@${name.toLowerCase().replace(/\s+/g, "")}`;
}

function generateMockLinkedIn(name: string): string {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return `https://linkedin.com/in/${slug}`;
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
