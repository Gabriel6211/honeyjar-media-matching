import type { OutletType } from "../types/index.js";

/**
 * Known outlet-to-type mappings.
 * In production, this would be a database table or a more sophisticated
 * classification system (e.g. LexisNexis metadata).
 */
const OUTLET_MAP: Record<string, OutletType> = {
  // National business / tech
  "Bloomberg": "national_business_tech",
  "Reuters": "national_business_tech",
  "The Wall Street Journal": "national_business_tech",
  "CNBC": "national_business_tech",
  "The New York Times": "national_business_tech",
  "The Washington Post": "national_business_tech",
  "BBC News": "national_business_tech",
  "CNN": "national_business_tech",
  "The Guardian": "national_business_tech",
  "Financial Times": "national_business_tech",
  "Forbes": "national_business_tech",
  "Business Insider": "national_business_tech",
  "TechCrunch": "national_business_tech",
  "The Verge": "national_business_tech",
  "Wired": "national_business_tech",
  "Ars Technica": "national_business_tech",
  "Engadget": "national_business_tech",
  "The Information": "national_business_tech",
  "Fortune": "national_business_tech",
  "Inc.": "national_business_tech",

  // Trade / specialist
  "CleanTechnica": "trade_specialist",
  "Electrek": "trade_specialist",
  "Restaurant Dive": "trade_specialist",
  "Restaurant Business": "trade_specialist",
  "Nation's Restaurant News": "trade_specialist",
  "American Banker": "trade_specialist",
  "Finextra": "trade_specialist",
  "Robotics and Automation News": "trade_specialist",
  "The Robot Report": "trade_specialist",
  "GreenBiz": "trade_specialist",
  "Utility Dive": "trade_specialist",
  "Energy Storage News": "trade_specialist",
  "HousingWire": "trade_specialist",
  "National Mortgage News": "trade_specialist",
  "Mortgage Professional America": "trade_specialist",
  "BankingDive": "trade_specialist",
  "Automation World": "trade_specialist",

  // Regional
  "The Boston Globe": "regional",
  "San Francisco Chronicle": "regional",
  "Chicago Tribune": "regional",
  "Los Angeles Times": "regional",
  "The Dallas Morning News": "regional",
  "The Seattle Times": "regional",

  // Newsletters
  "Substack": "newsletter",
  "The Hustle": "newsletter",
  "Morning Brew": "newsletter",
  "Axios": "newsletter",
  "Semafor": "newsletter",
};

/**
 * Classifies an outlet name into an OutletType.
 * Falls back to "national_business_tech" for unknown outlets since
 * NewsAPI primarily indexes mainstream publications.
 */
export function classifyOutlet(outletName: string): OutletType {
  if (OUTLET_MAP[outletName]) {
    return OUTLET_MAP[outletName];
  }

  // Simple keyword heuristics for outlets not in our map
  const lower = outletName.toLowerCase();

  if (lower.includes("substack") || lower.includes("newsletter")) {
    return "newsletter";
  }
  if (lower.includes("dive") || lower.includes("trade") || lower.includes("journal of")) {
    return "trade_specialist";
  }
  if (lower.includes("times") || lower.includes("herald") || lower.includes("tribune")) {
    return "regional";
  }

  return "national_business_tech";
}
