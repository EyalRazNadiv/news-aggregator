import { useDB } from "../lib/db";
import { seedDatabase } from "../lib/db/init";
import { runFetchPipeline } from "../lib/pipeline/fetch";

export default defineEventHandler(async (event) => {
  const db = useDB(event);
  await seedDatabase(db);
  const result = await runFetchPipeline(db);
  return result;
});
