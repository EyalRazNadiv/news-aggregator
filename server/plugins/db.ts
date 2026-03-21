import { initializeDatabase } from "../lib/db/init";

export default defineNitroPlugin(() => {
  console.log("[DB] Initializing database...");
  initializeDatabase();
  console.log("[DB] Database ready.");
});
