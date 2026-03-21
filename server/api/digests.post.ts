import { generateDigest } from "../lib/pipeline/digest";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const date = body.date || new Date().toISOString().split("T")[0];
  const method = body.method === "ai-summary" ? "ai-summary" : "aggregation";

  const result = await generateDigest(date, method);
  return result;
});
