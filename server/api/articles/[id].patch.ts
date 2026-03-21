import { useDB } from "../../lib/db";
import { articles } from "../../lib/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDB(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing article ID" });

  const body = await readBody(event);
  const updates: Record<string, unknown> = {};

  if (body.isRead !== undefined) updates.isRead = body.isRead ? 1 : 0;
  if (body.isBookmarked !== undefined) updates.isBookmarked = body.isBookmarked ? 1 : 0;

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: "No valid fields to update" });
  }

  await db.update(articles).set(updates).where(eq(articles.id, id)).execute();

  return { ok: true };
});
