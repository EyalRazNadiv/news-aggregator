import { db, sqlite } from "../db";
import { articles } from "../db/schema";
import { nanoid } from "nanoid";
import type { CategorizedArticle } from "./categorize";

export function storeArticles(categorized: CategorizedArticle[]): number {
  if (categorized.length === 0) return 0;

  const now = new Date().toISOString();
  let stored = 0;

  const insertStmt = sqlite.prepare(`
    INSERT OR IGNORE INTO articles (
      id, source_id, title, url, url_hash, author, published_at,
      fetched_at, content, image_url, topic_id, category_confidence, category_method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const runBatch = sqlite.transaction(() => {
    for (const article of categorized) {
      try {
        const result = insertStmt.run(
          nanoid(),
          article.sourceId,
          article.title,
          article.url,
          article.urlHash,
          article.author || null,
          article.publishedAt || null,
          now,
          article.content || null,
          article.imageUrl || null,
          article.topicId ?? null,
          article.categoryConfidence ?? null,
          article.categoryMethod ?? null,
        );
        if (result.changes > 0) stored++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!message.includes("UNIQUE constraint")) {
          console.error(`[Store] Error inserting article "${article.title}":`, message);
        }
      }
    }
  });

  runBatch();
  return stored;
}
