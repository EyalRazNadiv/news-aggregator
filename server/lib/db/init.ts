import { DEFAULT_SOURCES } from "../config/sources";
import { sources } from "./schema";
import type { DB } from "./index";

/**
 * Seed default sources into the database.
 * Tables are created via D1 migrations (migrations/0001_init.sql),
 * so this only handles seeding.
 */
export async function seedDatabase(db: DB) {
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
