import { useDB } from "../lib/db";
import { articles } from "../lib/db/schema";
import { sql, gte } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDB(event);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .get();

  const todayCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(gte(articles.fetchedAt, todayStr))
    .get();

  const byTopic = await db
    .select({
      topicId: articles.topicId,
      count: sql<number>`count(*)`,
    })
    .from(articles)
    .groupBy(articles.topicId)
    .all();

  return {
    total: total?.count || 0,
    today: todayCount?.count || 0,
    byTopic: Object.fromEntries(
      byTopic.map((r) => [r.topicId || "uncategorized", r.count])
    ),
  };
});
