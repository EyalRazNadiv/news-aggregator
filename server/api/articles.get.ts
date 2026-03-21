import { useDB } from "../lib/db";
import { articles, sources } from "../lib/db/schema";
import { desc, eq, like, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDB(event);
  const query = getQuery(event);
  const topic = query.topic as string | undefined;
  const search = query.search as string | undefined;
  const bookmarked = query.bookmarked === "true";
  const limit = Math.min(Number(query.limit) || 50, 200);
  const offset = Number(query.offset) || 0;

  let q = db
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
      aiSummary: articles.aiSummary,
      isRead: articles.isRead,
      isBookmarked: articles.isBookmarked,
      sourceName: sources.name,
    })
    .from(articles)
    .leftJoin(sources, eq(articles.sourceId, sources.id))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

  if (topic) {
    q = q.where(eq(articles.topicId, topic)) as typeof q;
  }

  if (search) {
    q = q.where(like(articles.title, `%${search}%`)) as typeof q;
  }

  if (bookmarked) {
    q = q.where(eq(articles.isBookmarked, 1)) as typeof q;
  }

  return q.all();
});
