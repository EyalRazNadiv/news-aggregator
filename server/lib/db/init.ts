import { DEFAULT_SOURCES } from "../config/sources";
import { sources } from "./schema";
import { count } from "drizzle-orm";
import type { DB } from "./index";

/**
 * Seed default sources into the database.
 * Tables are created via D1 migrations (migrations/0001_init.sql),
 * so this only handles seeding — and only when the sources table is empty.
 */
export async function seedDatabase(db: DB) {
  const result = await db.select({ total: count() }).from(sources).execute();
  const existing = result[0]?.total ?? 0;

  if (existing > 0) {
    console.log(`[Seed] Sources table already has ${existing} entries, skipping seed`);
    return;
  }

  console.log(`[Seed] Seeding ${DEFAULT_SOURCES.length} default sources...`);
  const now = new Date().toISOString();

  for (const source of DEFAULT_SOURCES) {
    await db
      .insert(sources)
      .values({
        id: source.id,
        name: source.name,
        type: source.type,
        url: source.url,
        config: source.config ? JSON.stringify(source.config) : null,
        createdAt: now,
      })
      .onConflictDoNothing()
      .execute();
  }
}
