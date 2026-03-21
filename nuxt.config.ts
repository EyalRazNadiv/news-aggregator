import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },

  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
    portkeyApiKey: process.env.PORTKEY_API_KEY || "",
    portkeyProvider: process.env.PORTKEY_PROVIDER || "", // e.g. "@vertex-ai" or custom slug
    llmProvider: process.env.LLM_PROVIDER || "portkey", // "portkey" | "anthropic"
    newsApiKey: process.env.NEWS_API_KEY || "",
    cronSecret: process.env.CRON_SECRET || "",
  },

  css: ["~/assets/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  nitro: {
    externals: {
      external: ["better-sqlite3"],
    },
    // Ensure these env vars are available in server runtime via process.env
    envExpansion: true,
  },

  app: {
    head: {
      title: "AI News Assistant",
      meta: [
        { name: "description", content: "Your daily AI news digest from trusted sources" },
      ],
    },
  },

  modules: ["reka-ui/nuxt"],
});
