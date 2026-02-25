# HoneyJar Media Matching

Semantic search for reporters from story briefs. Paste your brief, select outlet types and geography, and get ranked reporter matches with contact info and article justifications.

## Prerequisites

- **Node.js** 18+
- **Docker** (for Postgres + pgvector)
- **npm**

## Setup

1. Clone the repo.
2. Copy env vars:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   cd backend && npm install
   cd frontend && npm install
   ```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | No | Postgres connection string. Default: `postgresql://honeyjar:honeyjar@localhost:5432/honeyjar` |
| `OPENAI_API_KEY` | **Yes** | OpenAI key for embeddings. Required for search — the brief is embedded at query time. |
| `NEWSAPI_KEY` | For ingest only | [NewsAPI](https://newsapi.org/) key (free tier, no card). Only needed for `make ingest`. |

## Run

1. Start the stack:
   ```bash
   make dev
   ```
   This brings up Postgres and starts backend (port 4000) and frontend (port 3000).

2. **Load sample data** (recommended for quick testing — no NewsAPI key needed):
   ```bash
   make seed
   ```
   Loads committed seed articles with precomputed embeddings. You still need `OPENAI_API_KEY` for search (the brief is embedded at query time).

3. **Or ingest fresh data** (requires `NEWSAPI_KEY` and `OPENAI_API_KEY`):
   ```bash
   make ingest
   ```
   Fetches articles from NewsAPI, classifies outlets/geography, and embeds with OpenAI.

4. Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Paste your story brief** — e.g. "Battery startup raising Series A for domestic EV supply chain."
2. **Select outlet types** — National Business/Tech, Trade/Specialist, Regional, Newsletter, Podcast.
3. **Select geography** — US Only, US + EU + UK, or Global.
4. **Optional**: Focus publications (e.g. TechCrunch, Bloomberg) and competitor context.
5. **Search** — Get ranked reporters with justifications, articles, and contact info.
6. **Refine** — Type follow-ups like "Focus on Bloomberg reporters" to re-run the search.
7. **New search** — Use the refresh icon to start over.

## Architecture

```
┌─────────────────┐     POST /api/search     ┌─────────────────┐
│  Frontend       │ ───────────────────────► │  Backend        │
│  (Next.js 16)   │     brief, filters       │  (Express)      │
│  localhost:3000 │ ◄─────────────────────── │  localhost:4000 │
└─────────────────┘     reporters, articles  └────────┬────────┘
                                                      │
                                                      ▼
                                             ┌─────────────────┐
                                             │  Postgres       │
                                             │  + pgvector     │
                                             │  localhost:5432 │
                                             └─────────────────┘
```

**Flow**:
1. User submits brief → backend embeds it with OpenAI
2. pgvector similarity search over article embeddings
3. Filter by outlet type and geography
4. Rank reporters by similarity + recency + outlet relevance
5. Mock enrichment (email, LinkedIn, Twitter)
6. Return top 10–15 reporters with justifications

## Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start Postgres + backend + frontend |
| `make db-up` | Start Postgres only |
| `make db-down` | Stop Postgres |
| `make seed` | Load seed data (no NewsAPI key; OpenAI key still required for search) |
| `make ingest` | Fetch from NewsAPI + embed (requires API keys) |
