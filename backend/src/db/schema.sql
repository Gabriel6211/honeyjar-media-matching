CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS articles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  author        TEXT,
  outlet        TEXT NOT NULL,
  outlet_type   TEXT,
  geography     TEXT,
  section       TEXT,
  url           TEXT NOT NULL UNIQUE,
  published_at  TIMESTAMPTZ,
  summary       TEXT,
  embedding     vector(1536),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS articles_embedding_idx
  ON articles USING hnsw (embedding vector_cosine_ops);
