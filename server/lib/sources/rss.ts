import Parser from "rss-parser";
import type { RawArticle, SourceConfig } from "../types";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "AI-News-Assistant/1.0",
  },
});

export async function fetchRSSSource(source: SourceConfig): Promise<RawArticle[]> {
  const feed = await parser.parseURL(source.url);

  return (feed.items || []).map((item) => ({
    title: item.title?.trim() || "Untitled",
    url: item.link || "",
    author: item.creator || item["dc:creator"] || undefined,
    publishedAt: item.isoDate || item.pubDate || undefined,
    content: item.contentSnippet?.slice(0, 500) || item.content?.slice(0, 500) || undefined,
    imageUrl: extractImageUrl(item),
    sourceName: source.name,
    sourceId: source.id,
  })).filter((a) => a.url); // drop items without URLs
}

function extractImageUrl(item: Record<string, unknown>): string | undefined {
  // Try common RSS image fields
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined;
  if (enclosure?.url && enclosure.type?.startsWith("image")) {
    return enclosure.url;
  }

  const mediaContent = item["media:content"] as { $?: { url?: string } } | undefined;
  if (mediaContent?.$?.url) {
    return mediaContent.$.url;
  }

  return undefined;
}
