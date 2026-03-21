import { db } from "../../lib/db";
import { digests } from "../../lib/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const date = getRouterParam(event, "date");
  if (!date) throw createError({ statusCode: 400, message: "Missing date" });

  const digest = db
    .select()
    .from(digests)
    .where(eq(digests.date, date))
    .get();

  if (!digest) throw createError({ statusCode: 404, message: "Digest not found" });

  return digest;
});
