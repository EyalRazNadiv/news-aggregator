import { useDB } from "../lib/db";
import { sources } from "../lib/db/schema";
import { seedDatabase } from "../lib/db/init";

export default defineEventHandler(async (event) => {
  const db = useDB(event);

  // Ensure sources are seeded on first access
  await seedDatabase(db);

  const rows = await db.select().from(sources).execute();

  return rows.map((s) => ({
    ...s,
    enabled: s.enabled === 1,
    config: s.config ? JSON.parse(s.config) : null,
  }));
});
