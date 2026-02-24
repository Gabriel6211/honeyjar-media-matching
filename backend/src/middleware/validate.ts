import { Request, Response, NextFunction } from "express";
import type { OutletType, Geography } from "../types/index.js";

const VALID_OUTLET_TYPES: OutletType[] = [
  "national_business_tech",
  "trade_specialist",
  "regional",
  "newsletter",
  "podcast",
];

const VALID_GEOGRAPHIES: Geography[] = ["us", "us_eu_uk", "global"];

/**
 * Validates the search request body before it reaches the controller.
 * Rejects early with 400 if:
 *   - brief is missing or empty
 *   - outlet_types contains invalid values
 *   - geography contains invalid values
 */
export function validateSearchBody(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { brief, outlet_types, geography } = req.body;

  if (!brief || typeof brief !== "string" || brief.trim().length === 0) {
    res.status(400).json({ error: "brief is required and must be a non-empty string" });
    return;
  }

  if (outlet_types !== undefined) {
    if (!Array.isArray(outlet_types)) {
      res.status(400).json({ error: "outlet_types must be an array" });
      return;
    }

    const invalid = outlet_types.filter(
      (t: string) => !VALID_OUTLET_TYPES.includes(t as OutletType)
    );
    if (invalid.length > 0) {
      res.status(400).json({
        error: `Invalid outlet_types: ${invalid.join(", ")}`,
        valid: VALID_OUTLET_TYPES,
      });
      return;
    }
  }

  if (geography !== undefined) {
    if (!Array.isArray(geography)) {
      res.status(400).json({ error: "geography must be an array" });
      return;
    }

    const invalid = geography.filter(
      (g: string) => !VALID_GEOGRAPHIES.includes(g as Geography)
    );
    if (invalid.length > 0) {
      res.status(400).json({
        error: `Invalid geography: ${invalid.join(", ")}`,
        valid: VALID_GEOGRAPHIES,
      });
      return;
    }
  }

  next();
}
