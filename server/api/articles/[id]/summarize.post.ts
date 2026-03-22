import { useDB } from "../../../lib/db";
import { articles } from "../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { getLLMProvider } from "../../../lib/llm";
import { scrapeArticleContent } from "../../../lib/scraper";

export default defineEventHandler(async (event) => {
  const db = useDB(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing article ID" });

  const article = await db
    .select({
      id: articles.id,
      title: articles.title,
      url: articles.url,
      content: articles.content,
      aiSummary: articles.aiSummary,
    })
    .from(articles)
    .where(eq(articles.id, id))
    .get();

  if (!article) throw createError({ statusCode: 404, message: "Article not found" });

  // Return cached summary if exists
  if (article.aiSummary) {
    return { summary: article.aiSummary, cached: true };
  }

  // Generate summary — scrape full content if RSS snippet is missing or too short
  try {
    let content = article.content || "";
    if (content.length < 200 && article.url) {
      const scraped = await scrapeArticleContent(article.url);
      if (scraped) {
        content = scraped;
        // Cache the scraped content in the DB for future use
        await db.update(articles).set({ content: scraped }).where(eq(articles.id, id)).execute();
      }
    }

    const provider = getLLMProvider(event);
    const summary = await provider.summarizeArticle(article.title, content);

    // Store in DB
    await db.update(articles)
      .set({
        aiSummary: summary,
        summarizedAt: new Date().toISOString(),
      })
      .where(eq(articles.id, id))
      .execute();

    return { summary, cached: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Summarize] Failed for article ${id}:`, message);
    throw createError({
      statusCode: 500,
      message: `Failed to generate summary: ${message}`,
    });
  }
});
