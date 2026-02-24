import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./db/client.js";
import searchRouter from "./routes/search.js";

import { join } from "path";

dotenv.config({ path: join(process.cwd(), "../.env") });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/search", searchRouter);

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
