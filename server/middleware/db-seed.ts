import { useDB } from "../lib/db";
import { seedDatabase } from "../lib/db/init";

let seeded = false;

export default defineEventHandler(async (event) => {
  // Only seed once per worker lifecycle, only for API routes
  if (seeded || !event.path.startsWith("/api/")) return;

  try {
    const db = useDB(event);
    await seedDatabase(db);
    seeded = true;
  } catch (err) {
    // Don't block requests if seeding fails
    console.warn("[DB Seed]", err instanceof Error ? err.message : err);
  }
});
