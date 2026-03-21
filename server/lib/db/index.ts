import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";
import type { H3Event } from "h3";

export type DB = ReturnType<typeof drizzleD1<typeof schema>>;

/**
 * Get a Drizzle DB instance from the Cloudflare D1 binding.
 * Must be called within a Nitro event handler.
 */
export function useDB(event: H3Event): DB {
  const { cloudflare } = event.context;
  if (!cloudflare?.env?.DB) {
    throw new Error(
      "D1 database binding not found. Ensure wrangler.toml has [[d1_databases]] with binding = \"DB\" " +
      "and you are running via `wrangler pages dev` or deployed to Cloudflare Pages."
    );
  }
  return drizzleD1(cloudflare.env.DB, { schema });
}
