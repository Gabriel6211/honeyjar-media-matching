# Submission Note

## Time Spent

Approximately **20 hours** total:
- **16 hours** — Coding (scaffold, DB, ingest, embeddings, search API, chat UI, results, export, refinement, polish)
- **4 hours** — Refinement and testing

## Notable Implementation

- **Refinement vector blending** — Refinements typed after the first search were concatenated to the brief before embedding. Because the brief is much longer, the short refinement text had almost no effect on results. I now embed brief and refinements separately and blend their vectors (65% brief, 35% refinements), then normalize. Refinements like "Focus on EV and battery technology" now meaningfully shift the search.

## Major Shortcuts

- **Mocked contact enrichment** — Email, LinkedIn, Twitter are generated from name/outlet; interface is ready for RocketReach/Rephonic
- **Seed data for testing** — Committed `seed-articles.json` with precomputed embeddings so reviewers can run `make seed` without NewsAPI key. `OPENAI_API_KEY` is still required for search (brief is embedded at query time).
- **NewsAPI only** — Single article source; production would add Guardian, GDELT, NYT, LexisNexis
- **No auth** — No login, API keys, or rate limiting
- **No production deployment** — Local Docker only; no CI/CD or cloud config
