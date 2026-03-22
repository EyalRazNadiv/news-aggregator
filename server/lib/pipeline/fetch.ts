import { sources } from "../db/schema";
import { eq } from "drizzle-orm";
import { fetchRSSSource } from "../sources/rss";
import { fetchNewsAPISource } from "../sources/newsapi";
import { deduplicateArticles } from "./dedup";
import { categorizeArticles } from "./categorize";
import { storeArticles } from "./store";
import type { RawArticle, PipelineResult, SourceConfig } from "../types";
import type { DB } from "../db";

async function fetchSource(source: SourceConfig): Promise<RawArticle[]> {
  switch (source.type) {
    case "rss":
      return fetchRSSSource(source);
    case "newsapi":
      return fetchNewsAPISource(source);
    default:
      console.warn(`[Fetch] Unknown source type: ${source.type}`);
      return [];
  }
}

export async function runFetchPipeline(db: DB): Promise<PipelineResult> {
  const errors: string[] = [];
  const allRawArticles: RawArticle[] = [];

  // Read enabled sources from the database
  const dbSources = await db
    .select()
    .from(sources)
    .where(eq(sources.enabled, 1))
    .execute();

  const enabledSources: SourceConfig[] = dbSources.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type as "rss" | "newsapi",
    url: s.url,
    config: s.config ? JSON.parse(s.config) : undefined,
  }));

  console.log(`[Pipeline] Fetching from ${enabledSources.length} sources...`);

  const results = await Promise.allSettled(
    enabledSources.map(async (source) => {
      try {
        const articles = await fetchSource(source);
        console.log(`[Pipeline] ${source.name}: ${articles.length} articles`);

        // Update lastFetchedAt
        await db
          .update(sources)
          .set({ lastFetchedAt: new Date().toISOString() })
          .where(eq(sources.id, source.id))
          .execute();

        return articles;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[Pipeline] ${source.name} failed: ${message}`);
        errors.push(`${source.name}: ${message}`);
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allRawArticles.push(...result.value);
    }
  }

  console.log(`[Pipeline] Fetched ${allRawArticles.length} total articles`);

  // Deduplicate
  const unique = await deduplicateArticles(db, allRawArticles);
  console.log(`[Pipeline] ${unique.length} new articles after dedup`);

  // Categorize
  const categorized = categorizeArticles(unique);
  const categorizedCount = categorized.filter((a) => a.topicId).length;
  console.log(`[Pipeline] ${categorizedCount}/${categorized.length} categorized by keywords`);

  // Store
  const stored = await storeArticles(db, categorized);
  console.log(`[Pipeline] Stored ${stored} articles`);

  return {
    fetched: allRawArticles.length,
    deduplicated: unique.length,
    stored,
    errors,
  };
}
