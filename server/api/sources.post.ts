import { useDB } from "../lib/db";
import { sources } from "../lib/db/schema";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export default defineEventHandler(async (event) => {
  const db = useDB(event);
  const body = await readBody(event);

  const { name, type, url, config } = body;

  if (!name || !type || !url) {
    throw createError({ statusCode: 400, message: "name, type, and url are required" });
  }

  if (!["rss", "newsapi"].includes(type)) {
    throw createError({ statusCode: 400, message: "type must be 'rss' or 'newsapi'" });
  }

  // Validate config JSON if provided
  if (config && typeof config === "string") {
    try {
      JSON.parse(config);
    } catch {
      throw createError({ statusCode: 400, message: "config must be valid JSON" });
    }
  }

  const id = slugify(name);

  await db
    .insert(sources)
    .values({
      id,
      name,
      type,
      url,
      config: config
        ? typeof config === "string"
          ? config
          : JSON.stringify(config)
        : null,
      enabled: 1,
      createdAt: new Date().toISOString(),
    })
    .execute();

  return { id, name, type, url };
});
