// DB initialization is now handled by D1 migrations.
// Seeding happens on first request via middleware.
// This plugin is kept as a no-op for compatibility.
export default defineNitroPlugin(() => {
  console.log("[DB] Using Cloudflare D1 — tables managed via migrations");
});
