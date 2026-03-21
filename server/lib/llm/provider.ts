export interface LLMProvider {
  summarizeArticle(title: string, content: string): Promise<string>;
  categorizeArticle(title: string, content: string, topics: { slug: string; name: string; description: string }[]): Promise<{ topicId: string; confidence: number }>;
  generateDigestSummary(topicName: string, articles: { title: string; content?: string }[]): Promise<string>;
}

export interface LLMOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}
