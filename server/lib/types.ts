export interface RawArticle {
  title: string;
  url: string;
  author?: string;
  publishedAt?: string;
  content?: string;
  imageUrl?: string;
  sourceName: string;
  sourceId: string;
}

export interface TopicConfig {
  slug: string;
  name: string;
  description: string;
  keywords: string[];
  displayOrder: number;
}

export interface SourceConfig {
  id: string;
  name: string;
  type: "rss" | "newsapi";
  url: string;
  config?: Record<string, unknown>;
}

export interface PipelineResult {
  fetched: number;
  deduplicated: number;
  stored: number;
  errors: string[];
}
