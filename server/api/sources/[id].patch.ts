import { useDB } from "../../lib/db";
import { sources } from "../../lib/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDB(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing source ID" });

  const body = await readBody(event);
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.type !== undefined) updates.type = body.type;
  if (body.url !== undefined) updates.url = body.url;
  if (body.enabled !== undefined) updates.enabled = body.enabled ? 1 : 0;
  if (body.config !== undefined) {
    updates.config = body.config
      ? typeof body.config === "string"
        ? body.config
        : JSON.stringify(body.config)
      : null;
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: "No valid fields to update" });
  }

  await db.update(sources).set(updates).where(eq(sources.id, id)).execute();

  return { ok: true };
});
