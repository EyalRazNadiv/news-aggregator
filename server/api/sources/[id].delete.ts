import { useDB } from "../../lib/db";
import { sources, articles } from "../../lib/db/schema";
import { eq, count } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDB(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing source ID" });

  const query = getQuery(event);
  const force = query.force === "true";

  // Check for associated articles
  const result = await db
    .select({ total: count() })
    .from(articles)
    .where(eq(articles.sourceId, id))
    .execute();

  const articleCount = result[0]?.total ?? 0;

  if (articleCount > 0 && !force) {
    throw createError({
      statusCode: 409,
      message: `Source has ${articleCount} associated articles. Use ?force=true to delete anyway.`,
    });
  }

  // Nullify article references if force-deleting
  if (articleCount > 0 && force) {
    await db
      .update(articles)
      .set({ sourceId: null })
      .where(eq(articles.sourceId, id))
      .execute();
  }

  await db.delete(sources).where(eq(sources.id, id)).execute();

  return { ok: true, articlesOrphaned: force ? articleCount : 0 };
});
