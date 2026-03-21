import { useDB } from "../../lib/db";
import { articles, sources } from "../../lib/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDB(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing article ID" });

  const article = await db
    .select({
      id: articles.id,
      title: articles.title,
      url: articles.url,
      author: articles.author,
      publishedAt: articles.publishedAt,
      fetchedAt: articles.fetchedAt,
      content: articles.content,
      imageUrl: articles.imageUrl,
      topicId: articles.topicId,
      categoryMethod: articles.categoryMethod,
      categoryConfidence: articles.categoryConfidence,
      aiSummary: articles.aiSummary,
      summarizedAt: articles.summarizedAt,
      isRead: articles.isRead,
      isBookmarked: articles.isBookmarked,
      sourceName: sources.name,
    })
    .from(articles)
    .leftJoin(sources, eq(articles.sourceId, sources.id))
    .where(eq(articles.id, id))
    .get();

  if (!article) throw createError({ statusCode: 404, message: "Article not found" });

  // Mark as read
  await db.update(articles).set({ isRead: 1 }).where(eq(articles.id, id)).execute();

  return article;
});
