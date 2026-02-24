/**
 * Each outlet gets tagged with its actual region.
 * The search filter then maps user choices to matching regions:
 *   "us"       → ["us"]
 *   "us_eu_uk" → ["us", "uk", "eu"]
 *   "global"   → no filter (show everything)
 */
export type OutletRegion = "us" | "uk" | "eu" | "global";

const OUTLET_GEOGRAPHY: Record<string, OutletRegion> = {
  // US outlets
  "Bloomberg": "us",
  "CNBC": "us",
  "The New York Times": "us",
  "The Washington Post": "us",
  "The Wall Street Journal": "us",
  "Forbes": "us",
  "Fortune": "us",
  "Business Insider": "us",
  "TechCrunch": "us",
  "The Verge": "us",
  "Wired": "us",
  "Ars Technica": "us",
  "Engadget": "us",
  "The Information": "us",
  "Inc.": "us",
  "CNN": "us",
  "Los Angeles Times": "us",
  "San Francisco Chronicle": "us",
  "Chicago Tribune": "us",
  "The Boston Globe": "us",
  "The Dallas Morning News": "us",
  "The Seattle Times": "us",
  "CleanTechnica": "us",
  "Electrek": "us",
  "Restaurant Dive": "us",
  "Restaurant Business": "us",
  "Nation's Restaurant News": "us",
  "American Banker": "us",
  "The Robot Report": "us",
  "HousingWire": "us",
  "National Mortgage News": "us",
  "Mortgage Professional America": "us",
  "BankingDive": "us",
  "Automation World": "us",
  "Axios": "us",
  "Morning Brew": "us",
  "The Hustle": "us",
  "Semafor": "us",
  "Utility Dive": "us",

  // UK outlets
  "The Guardian": "uk",
  "BBC News": "uk",
  "Financial Times": "uk",
  "Finextra": "uk",

  // EU outlets
  "Robotics and Automation News": "eu",
  "Energy Storage News": "eu",
  "GreenBiz": "us",

  // Global (wire services, etc.)
  "Reuters": "global",
  "Substack": "global",
};

/**
 * Classifies an outlet into a geographic region based on where
 * the publication is headquartered / primarily covers.
 */
export function classifyGeography(outletName: string): OutletRegion {
  if (OUTLET_GEOGRAPHY[outletName]) {
    return OUTLET_GEOGRAPHY[outletName];
  }

  const lower = outletName.toLowerCase();

  if (lower.includes("uk") || lower.includes("british") || lower.includes("london")) {
    return "uk";
  }
  if (lower.includes("europe") || lower.includes("eu")) {
    return "eu";
  }

  // Most NewsAPI outlets are US-based
  return "us";
}

/**
 * Maps a user-facing Geography filter to the set of outlet regions
 * it should match. "global" means no filtering.
 */
export function geographyToRegions(geo: string): OutletRegion[] | null {
  switch (geo) {
    case "us":
      return ["us"];
    case "us_eu_uk":
      return ["us", "uk", "eu"];
    case "global":
      return null; // no filter
    default:
      return null;
  }
}
