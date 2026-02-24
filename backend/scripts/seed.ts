import dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(process.cwd(), "../.env") });

import { initDb } from "../src/db/client.js";
import { loadSeedData } from "../src/db/seed.js";

async function main() {
  await initDb();
  await loadSeedData();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
