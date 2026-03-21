import type { LLMProvider } from "./provider";

let _provider: LLMProvider | null = null;

export function initLLMProvider(provider: LLMProvider): void {
  _provider = provider;
}

export function getLLMProvider(): LLMProvider {
  if (!_provider) throw new Error("LLM provider not initialized. Check server/plugins/llm.ts");
  return _provider;
}
