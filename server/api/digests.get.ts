import { useDB } from "../lib/db";
import { digests } from "../lib/db/schema";
import { desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDB(event);
  return db
    .select({
      id: digests.id,
      date: digests.date,
      articleCount: digests.articleCount,
      method: digests.method,
      generatedAt: digests.generatedAt,
    })
    .from(digests)
    .orderBy(desc(digests.date))
    .limit(30)
    .all();
});
