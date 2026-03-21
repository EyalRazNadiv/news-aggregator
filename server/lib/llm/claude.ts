import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider } from "./provider";
import { SUMMARIZE_PROMPT, CATEGORIZE_PROMPT, DIGEST_PROMPT } from "./prompts";

export class ClaudeProvider implements LLMProvider {
  private client: Anthropic;
  private model: string = "claude-sonnet-4-20250514";

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async summarizeArticle(title: string, content: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 300,
      temperature: 0.3,
      system: SUMMARIZE_PROMPT,
      messages: [
        {
          role: "user",
          content: `Title: ${title}\n\nContent: ${content || "(no content available — summarize based on the title)"}`,
        },
      ],
    });

    const block = response.content[0];
    if (block.type === "text") return block.text;
    return "Summary unavailable.";
  }

  async categorizeArticle(
    title: string,
    content: string,
    topics: { slug: string; name: string; description: string }[]
  ): Promise<{ topicId: string; confidence: number }> {
    const topicList = topics
      .map((t) => `- ${t.slug}: ${t.name} — ${t.description}`)
      .join("\n");

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 100,
      temperature: 0,
      system: CATEGORIZE_PROMPT,
      messages: [
        {
          role: "user",
          content: `Topics:\n${topicList}\n\nArticle title: ${title}\nExcerpt: ${content || "(none)"}`,
        },
      ],
    });

    const block = response.content[0];
    if (block.type === "text") {
      try {
        const parsed = JSON.parse(block.text);
        return {
          topicId: parsed.topicId || topics[0].slug,
          confidence: parsed.confidence || 0.5,
        };
      } catch {
        return { topicId: topics[0].slug, confidence: 0.3 };
      }
    }
    return { topicId: topics[0].slug, confidence: 0.3 };
  }

  async generateDigestSummary(
    topicName: string,
    articles: { title: string; content?: string }[]
  ): Promise<string> {
    const articleList = articles
      .slice(0, 15) // limit to avoid token overflow
      .map((a, i) => `${i + 1}. ${a.title}${a.content ? `\n   ${a.content.slice(0, 200)}` : ""}`)
      .join("\n");

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 500,
      temperature: 0.5,
      system: DIGEST_PROMPT,
      messages: [
        {
          role: "user",
          content: `Topic: ${topicName}\n\nToday's articles:\n${articleList}`,
        },
      ],
    });

    const block = response.content[0];
    if (block.type === "text") return block.text;
    return "Digest summary unavailable.";
  }
}

