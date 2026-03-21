import { initializeDatabase } from "../lib/db/init";
import { runFetchPipeline } from "../lib/pipeline/fetch";

export default defineEventHandler(async () => {
  initializeDatabase();
  const result = await runFetchPipeline();
  return result;
});
