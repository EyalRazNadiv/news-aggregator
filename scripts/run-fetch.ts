/**
 * CLI script to manually trigger the fetch pipeline.
 * Usage: npx tsx -r tsconfig-paths/register scripts/run-fetch.ts
 */
import { initializeDatabase } from "../server/lib/db/init";
import { runFetchPipeline } from "../server/lib/pipeline/fetch";
import { db } from "../server/lib/db";
import { articles } from "../server/lib/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Initializing database...");
  initializeDatabase();

  console.log("\nStarting fetch pipeline...\n");
  const result = await runFetchPipeline();

  console.log("\n=== Pipeline Results ===");
  console.log(`  Fetched:      ${result.fetched} articles`);
  console.log(`  New (deduped): ${result.deduplicated} articles`);
  console.log(`  Stored:       ${result.stored} articles`);

  if (result.errors.length > 0) {
    console.log(`\n  Errors (${result.errors.length}):`);
    for (const err of result.errors) {
      console.log(`    - ${err}`);
    }
  }

  // Quick DB stats
  const total = db.select({ count: sql<number>`count(*)` }).from(articles).get();
  console.log(`\n  Total articles in DB: ${total?.count || 0}`);

  const byTopic = db
    .select({
      topicId: articles.topicId,
      count: sql<number>`count(*)`,
    })
    .from(articles)
    .groupBy(articles.topicId)
    .all();

  console.log("\n  By topic:");
  for (const row of byTopic) {
    console.log(`    ${row.topicId || "(uncategorized)"}: ${row.count}`);
  }
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
