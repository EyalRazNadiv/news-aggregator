import { initLLMProvider } from "../lib/llm";
import { ClaudeProvider } from "../lib/llm/claude";
import { PortkeyProvider } from "../lib/llm/portkey";

export default defineNitroPlugin(() => {
  try {
    const config = useRuntimeConfig();
    const providerName = (config.llmProvider as string) || "portkey";

    if (providerName === "anthropic") {
      const key = config.anthropicApiKey as string;
      if (key) {
        initLLMProvider(new ClaudeProvider(key));
        console.log("[LLM Plugin] Anthropic (Claude) provider initialized");
      } else {
        console.warn("[LLM Plugin] ANTHROPIC_API_KEY not found — AI features disabled");
      }
    } else {
      const key = config.portkeyApiKey as string;
      const provider = config.portkeyProvider as string;
      if (key) {
        initLLMProvider(new PortkeyProvider({ apiKey: key, provider: provider || undefined }));
        console.log(`[LLM Plugin] Portkey provider initialized (provider: ${provider || "default"})`);
      } else {
        console.warn("[LLM Plugin] PORTKEY_API_KEY not found — AI features disabled");
      }
    }
  } catch (err) {
    console.error("[LLM Plugin] Failed to initialize:", err);
  }
});
