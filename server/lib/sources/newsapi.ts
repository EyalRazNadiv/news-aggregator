import type { RawArticle, SourceConfig } from "../types";

interface NewsAPIArticle {
  title: string;
  url: string;
  author: string | null;
  publishedAt: string;
  description: string | null;
  urlToImage: string | null;
  source: { name: string };
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

export async function fetchNewsAPISource(source: SourceConfig): Promise<RawArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn(`[NewsAPI] No API key configured, skipping ${source.name}`);
    return [];
  }

  const config = source.config as Record<string, string | number> | undefined;
  const params = new URLSearchParams({
    apiKey,
    ...Object.fromEntries(
      Object.entries(config || {}).map(([k, v]) => [k, String(v)])
    ),
  });

  const res = await fetch(`${source.url}?${params}`, {
    headers: { "User-Agent": "AI-News-Assistant/1.0" },
  });

  if (!res.ok) {
    throw new Error(`NewsAPI returned ${res.status}: ${await res.text()}`);
  }

  const data: NewsAPIResponse = await res.json();

  return (data.articles || [])
    .filter((a) => a.title && a.url && a.title !== "[Removed]")
    .map((a) => ({
      title: a.title.trim(),
      url: a.url,
      author: a.author || undefined,
      publishedAt: a.publishedAt || undefined,
      content: a.description?.slice(0, 500) || undefined,
      imageUrl: a.urlToImage || undefined,
      sourceName: a.source.name || source.name,
      sourceId: source.id,
    }));
}
