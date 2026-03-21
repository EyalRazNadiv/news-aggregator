import { articles } from "../db/schema";
import { nanoid } from "nanoid";
import type { CategorizedArticle } from "./categorize";
import type { DB } from "../db";

export async function storeArticles(db: DB, categorized: CategorizedArticle[]): Promise<number> {
  if (categorized.length === 0) return 0;

  const now = new Date().toISOString();
  let stored = 0;

  for (const article of categorized) {
    try {
      await db
        .insert(articles)
        .values({
          id: nanoid(),
          sourceId: article.sourceId,
          title: article.title,
          url: article.url,
          urlHash: article.urlHash,
          author: article.author || null,
          publishedAt: article.publishedAt || null,
          fetchedAt: now,
          content: article.content || null,
          imageUrl: article.imageUrl || null,
          topicId: article.topicId ?? null,
          categoryConfidence: article.categoryConfidence ?? null,
          categoryMethod: article.categoryMethod ?? null,
        })
        .onConflictDoNothing()
        .execute();
      stored++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("UNIQUE constraint")) {
        console.error(`[Store] Error inserting article "${article.title}":`, message);
      }
    }
  }

  return stored;
}
