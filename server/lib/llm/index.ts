import type { LLMProvider } from "./provider";
import type { H3Event } from "h3";
import { ClaudeProvider } from "./claude";
import { PortkeyProvider } from "./portkey";

let _provider: LLMProvider | null = null;

export function initLLMProvider(provider: LLMProvider): void {
  _provider = provider;
}

/**
 * Get the LLM provider, lazily initializing from env on first call.
 * Reads from Cloudflare env (event.context.cloudflare.env) first,
 * then falls back to process.env and Nuxt runtimeConfig.
 */
export function getLLMProvider(event?: H3Event): LLMProvider {
  if (_provider) return _provider;

  // Gather keys from all available sources
  const cfEnv = event?.context?.cloudflare?.env as Record<string, string> | undefined;
  let config: Record<string, string> = {};
  try {
    config = useRuntimeConfig(event) as unknown as Record<string, string>;
  } catch {
    // runtimeConfig may not be available outside event context
  }

  const portkeyKey = cfEnv?.PORTKEY_API_KEY || config.portkeyApiKey || process.env.PORTKEY_API_KEY;
  const portkeyProvider = cfEnv?.PORTKEY_PROVIDER || config.portkeyProvider || process.env.PORTKEY_PROVIDER;
  const anthropicKey = cfEnv?.ANTHROPIC_API_KEY || config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
  const llmProvider = config.llmProvider || process.env.LLM_PROVIDER || "portkey";

  if (llmProvider === "anthropic" && anthropicKey) {
    _provider = new ClaudeProvider(anthropicKey);
    console.log("[LLM] Anthropic (Claude) provider initialized");
  } else if (portkeyKey) {
    _provider = new PortkeyProvider({ apiKey: portkeyKey, provider: portkeyProvider || undefined });
    console.log(`[LLM] Portkey provider initialized (provider: ${portkeyProvider || "default"})`);
  } else {
    throw new Error(
      "No LLM provider configured. Set PORTKEY_API_KEY or ANTHROPIC_API_KEY in .env.local"
    );
  }

  return _provider;
}
