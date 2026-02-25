# HoneyJar Design Note

## Data Model

**articles** — Each row is a news article with metadata and a 1536-dim embedding:
- `id`, `title`, `author`, `outlet`, `outlet_type`, `geography`, `section`, `url`, `published_at`, `summary`, `embedding` (vector), `created_at`
- HNSW index on `embedding` for fast cosine similarity search

**reporters** — Derived from article authors at query time (grouped by author + outlet). Contact info comes from the enrichment service.

## Ranking Formula

Reporters are scored by grouping their matching articles and combining three factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Similarity** | 0.5 | Average cosine similarity of the reporter's top articles to the brief embedding |
| **Recency** | 0.3 | Best recency score among articles: ≤90 days = 1.0, ≤180 days = 0.5, else 0.2 |
| **Outlet relevance** | 0.2 | 1.0 if outlet type matches user selection, 0.3 otherwise |

Final score: `0.5 × similarity + 0.3 × recency + 0.2 × outlet_relevance`

Top 15 reporters are returned with up to 3 articles each for justification.

## Key Decisions

**pgvector over S3 Vectors** — Chosen for local runnability (Docker) and single-DB simplicity. Production path: RDS for PostgreSQL with pgvector on AWS, or migrate to [S3 Vectors](https://aws.amazon.com/bedrock/s3-vectors/) for cost optimization at scale.

**OpenAI embeddings over sentence-transformers** — Same semantic approach; API-based for TypeScript stack. Production: could add a self-hosted model for cost at scale.

**NewsAPI over Guardian** — Guardian was considered (PDF-approved public API) but has limited outlet diversity. NewsAPI provides fewer articles per query but many more outlets, which better supports the multi-outlet matching use case. Production: add GDELT, NYT, RSS, LexisNexis for breadth.

**Mocked contact enrichment** — Interface ready for RocketReach/Rephonic. Design note documents the integration path.

**Separate frontend/backend** — Mirrors production architecture; API can be deployed independently.

**Refinement vector blending** — Initially, refinements were concatenated to the brief before embedding. Because the brief is much longer, the short refinement text had little effect on the query vector and results barely changed. I now embed the brief and refinements separately, then blend their vectors (65% brief, 35% refinements) and normalize. This gives refinements explicit influence so follow-ups like "Focus on EV and battery technology" meaningfully shift the search toward those topics.

## Next Steps

- **LexisNexis** — Broader news coverage for enterprise clients
- **RocketReach / Rephonic** — Replace mock enrichment with real email/LinkedIn/Twitter lookups; Rephonic for podcast contacts
- **Enterprise needs** — Auth, multitenancy, audit logs, rate limits
- **S3 Vectors** — Migrate from pgvector at scale for lower cost and managed infrastructure
