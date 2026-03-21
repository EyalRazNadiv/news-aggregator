import type { RawArticle, SourceConfig } from "../types";

/**
 * Minimal RSS/Atom parser that works in Cloudflare Workers.
 * Uses fetch + regex XML parsing instead of rss-parser (which needs Node EventEmitter).
 */
export async function fetchRSSSource(source: SourceConfig): Promise<RawArticle[]> {
  const response = await fetch(source.url, {
    headers: { "User-Agent": "AI-News-Assistant/1.0" },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  return parseRSSXML(xml, source);
}

function parseRSSXML(xml: string, source: SourceConfig): RawArticle[] {
  const articles: RawArticle[] = [];

  // Try RSS 2.0 <item> elements first, then Atom <entry>
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;

  const matches = [...xml.matchAll(itemRegex)];
  const isAtom = matches.length === 0;
  const entries = isAtom ? [...xml.matchAll(entryRegex)] : matches;

  for (const match of entries) {
    const block = match[1];

    const title = extractTag(block, "title");
    const link = isAtom ? extractAtomLink(block) : extractTag(block, "link");
    const author = extractTag(block, "dc:creator") || extractTag(block, "author") || extractTag(block, "name");
    const pubDate = extractTag(block, "pubDate") || extractTag(block, "published") || extractTag(block, "updated");
    const description = extractTag(block, "description") || extractTag(block, "summary") || extractTag(block, "content");

    if (!link) continue;

    articles.push({
      title: decodeEntities(title || "Untitled").trim(),
      url: link.trim(),
      author: author ? decodeEntities(author).trim() : undefined,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : undefined,
      content: description ? decodeEntities(stripHTML(description)).slice(0, 500) : undefined,
      imageUrl: extractImageFromBlock(block),
      sourceName: source.name,
      sourceId: source.id,
    });
  }

  return articles;
}

function extractTag(block: string, tag: string): string | null {
  // Handle CDATA: <tag><![CDATA[content]]></tag>
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i");
  const cdataMatch = block.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1];

  // Handle regular: <tag>content</tag>
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = block.match(regex);
  return match ? match[1] : null;
}

function extractAtomLink(block: string): string | null {
  // Atom links are self-closing: <link href="..." rel="alternate" />
  const linkMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  return linkMatch ? linkMatch[1] : null;
}

function extractImageFromBlock(block: string): string | undefined {
  // <enclosure url="..." type="image/..." />
  const enclosure = block.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image[^"']*["']/i);
  if (enclosure) return enclosure[1];

  // <media:content url="..." />
  const media = block.match(/<media:content[^>]*url=["']([^"']+)["']/i);
  if (media) return media[1];

  return undefined;
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}
