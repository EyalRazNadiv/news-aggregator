import { Portkey } from "portkey-ai";
import type { LLMProvider } from "./provider";
import { SUMMARIZE_PROMPT, CATEGORIZE_PROMPT, DIGEST_PROMPT } from "./prompts";

export class PortkeyProvider implements LLMProvider {
  private client: Portkey;
  private model: string;

  constructor(opts: { apiKey: string; provider?: string; model?: string }) {
    this.client = new Portkey({
      apiKey: opts.apiKey,
      ...(opts.provider && { provider: opts.provider }),
    });
    this.model = opts.model || "gemini-3-flash-preview";
  }

  async summarizeArticle(title: string, content: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        { role: "system", content: SUMMARIZE_PROMPT },
        {
          role: "user",
          content: `Title: ${title}\n\nContent: ${content || "(no content available — summarize based on the title)"}`,
        },
      ],
    });

    const result = response.choices[0]?.message?.content || "Summary unavailable.";
    if (response.choices[0]?.finish_reason === "length") {
      console.warn("[Portkey] Summary was truncated due to token limit");
    }
    return result;
  }

  async categorizeArticle(
    title: string,
    content: string,
    topics: { slug: string; name: string; description: string }[]
  ): Promise<{ topicId: string; confidence: number }> {
    const topicList = topics
      .map((t) => `- ${t.slug}: ${t.name} — ${t.description}`)
      .join("\n");

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 100,
      temperature: 0,
      messages: [
        { role: "system", content: CATEGORIZE_PROMPT },
        {
          role: "user",
          content: `Topics:\n${topicList}\n\nArticle title: ${title}\nExcerpt: ${content || "(none)"}`,
        },
      ],
    });

    const text = response.choices[0]?.message?.content || "";
    try {
      const parsed = JSON.parse(text);
      return {
        topicId: parsed.topicId || topics[0].slug,
        confidence: parsed.confidence || 0.5,
      };
    } catch {
      return { topicId: topics[0].slug, confidence: 0.3 };
    }
  }

  async generateDigestSummary(
    topicName: string,
    articles: { title: string; content?: string }[]
  ): Promise<string> {
    const articleList = articles
      .slice(0, 15)
      .map((a, i) => `${i + 1}. ${a.title}${a.content ? `\n   ${a.content.slice(0, 200)}` : ""}`)
      .join("\n");

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 500,
      temperature: 0.5,
      messages: [
        { role: "system", content: DIGEST_PROMPT },
        {
          role: "user",
          content: `Topic: ${topicName}\n\nToday's articles:\n${articleList}`,
        },
      ],
    });

    return response.choices[0]?.message?.content || "Digest summary unavailable.";
  }
}
