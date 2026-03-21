import { readFileSync } from "fs";
import { resolve } from "path";
import { initLLMProvider } from "../lib/llm";
import { ClaudeProvider } from "../lib/llm/claude";
import { PortkeyProvider } from "../lib/llm/portkey";

function loadEnvKey(name: string, configValue?: string): string {
  if (configValue) return configValue;

  // Fallback: read directly from .env.local (Nitro may not expose process.env)
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    const match = content.match(new RegExp(`^${name}=(.+)$`, "m"));
    if (match) return match[1].split("#")[0].trim();
  } catch { /* ignore */ }

  return "";
}

export default defineNitroPlugin(() => {
  try {
    const config = useRuntimeConfig();
    const providerName = loadEnvKey("LLM_PROVIDER", config.llmProvider as string) || "portkey";

    if (providerName === "anthropic") {
      const key = loadEnvKey("ANTHROPIC_API_KEY", config.anthropicApiKey as string);
      if (key) {
        initLLMProvider(new ClaudeProvider(key));
        console.log("[LLM Plugin] Anthropic (Claude) provider initialized");
      } else {
        console.warn("[LLM Plugin] ANTHROPIC_API_KEY not found — AI features disabled");
      }
    } else {
      // Default: Portkey
      const key = loadEnvKey("PORTKEY_API_KEY", config.portkeyApiKey as string);
      const provider = loadEnvKey("PORTKEY_PROVIDER", config.portkeyProvider as string);
      const model = loadEnvKey("LLM_MODEL");
      if (key) {
        initLLMProvider(new PortkeyProvider({ apiKey: key, provider: provider || undefined, model: model || undefined }));
        console.log(`[LLM Plugin] Portkey provider initialized (provider: ${provider || "default"}, model: ${model || "default"})`);
      } else {
        console.warn("[LLM Plugin] PORTKEY_API_KEY not found — AI features disabled");
      }
    }
  } catch (err) {
    console.error("[LLM Plugin] Failed to initialize:", err);
  }
});
