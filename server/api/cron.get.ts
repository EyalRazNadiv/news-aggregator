import { useDB } from "../lib/db";
import { runFetchPipeline } from "../lib/pipeline/fetch";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const query = getQuery(event);
  const secret = query.secret as string | undefined;
  const expectedSecret = config.cronSecret;

  if (!expectedSecret) {
    throw createError({ statusCode: 500, message: "CRON_SECRET not configured" });
  }

  if (secret !== expectedSecret) {
    throw createError({ statusCode: 401, message: "Invalid secret" });
  }

  const db = useDB(event);
  const result = await runFetchPipeline(db);
  return result;
});
