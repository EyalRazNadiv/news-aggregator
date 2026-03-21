-- Migration: Initial schema
-- Created: 2026-03-21

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  config TEXT,
  enabled INTEGER DEFAULT 1,
  last_fetched_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES sources(id),
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  url_hash TEXT NOT NULL,
  author TEXT,
  published_at TEXT,
  fetched_at TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  topic_id TEXT,
  category_confidence REAL,
  category_method TEXT,
  ai_summary TEXT,
  summarized_at TEXT,
  is_read INTEGER DEFAULT 0,
  is_bookmarked INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_articles_url_hash ON articles(url_hash);
CREATE INDEX IF NOT EXISTS idx_articles_topic_id ON articles(topic_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_fetched_at ON articles(fetched_at);

CREATE TABLE IF NOT EXISTS topics (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  keywords TEXT,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS digests (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  content TEXT,
  article_count INTEGER,
  generated_at TEXT,
  method TEXT
);

CREATE TABLE IF NOT EXISTS digest_articles (
  digest_id TEXT REFERENCES digests(id),
  article_id TEXT REFERENCES articles(id)
);
