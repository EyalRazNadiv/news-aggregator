import crypto from "crypto";
import { db } from "../db";
import { articles } from "../db/schema";
import { inArray } from "drizzle-orm";
import type { RawArticle } from "../types";

/**
 * Normalize a URL for deduplication:
 * - lowercase hostname
 * - strip tracking params (utm_*, ref, etc.)
 * - remove trailing slashes
 * - remove fragment
 */
export function normalizeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    url.hostname = url.hostname.toLowerCase();
    url.hash = "";

    const stripParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "source"];
    for (const p of stripParams) {
      url.searchParams.delete(p);
    }

    let normalized = url.toString();
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return raw;
  }
}

export function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(normalizeUrl(url)).digest("hex").slice(0, 16);
}

export async function deduplicateArticles(rawArticles: RawArticle[]): Promise<(RawArticle & { urlHash: string })[]> {
  // First: deduplicate within the batch by URL hash
  const seen = new Map<string, RawArticle & { urlHash: string }>();
  for (const article of rawArticles) {
    const hash = hashUrl(article.url);
    if (!seen.has(hash)) {
      seen.set(hash, { ...article, urlHash: hash });
    }
  }

  const candidates = Array.from(seen.values());
  if (candidates.length === 0) return [];

  // Second: check against existing articles in DB
  const hashes = candidates.map((a) => a.urlHash);

  // Batch lookup in chunks of 500 (SQLite variable limit)
  const existingHashes = new Set<string>();
  for (let i = 0; i < hashes.length; i += 500) {
    const chunk = hashes.slice(i, i + 500);
    const existing = db
      .select({ urlHash: articles.urlHash })
      .from(articles)
      .where(inArray(articles.urlHash, chunk))
      .all();
    for (const row of existing) {
      existingHashes.add(row.urlHash);
    }
  }

  return candidates.filter((a) => !existingHashes.has(a.urlHash));
}
