import { db } from "../db";
import { articles, digests } from "../db/schema";
import { eq, gte, lte, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getLLMProvider } from "../llm";
import { TOPICS } from "../config/topics";

interface DigestResult {
  id: string;
  date: string;
  method: "aggregation" | "ai-summary";
  articleCount: number;
  content: string;
}

export async function generateDigest(
  date: string,
  method: "aggregation" | "ai-summary" = "aggregation"
): Promise<DigestResult> {
  // Check if digest already exists for this date
  const existing = db
    .select()
    .from(digests)
    .where(eq(digests.date, date))
    .get();

  if (existing?.content) {
    return {
      id: existing.id,
      date: existing.date,
      method: existing.method as "aggregation" | "ai-summary",
      articleCount: existing.articleCount || 0,
      content: existing.content,
    };
  }

  // Get articles for the date
  const startOfDay = `${date}T00:00:00.000Z`;
  const endOfDay = `${date}T23:59:59.999Z`;

  const dayArticles = db
    .select({
      id: articles.id,
      title: articles.title,
      content: articles.content,
      topicId: articles.topicId,
      publishedAt: articles.publishedAt,
      url: articles.url,
    })
    .from(articles)
    .where(gte(articles.fetchedAt, startOfDay))
    .orderBy(desc(articles.publishedAt))
    .all();

  if (dayArticles.length === 0) {
    // No articles for this date, try using all articles from the last 24h
    const allArticles = db
      .select({
        id: articles.id,
        title: articles.title,
        content: articles.content,
        topicId: articles.topicId,
        publishedAt: articles.publishedAt,
        url: articles.url,
      })
      .from(articles)
      .orderBy(desc(articles.publishedAt))
      .limit(100)
      .all();

    if (allArticles.length === 0) {
      throw new Error("No articles available to generate a digest");
    }

    return buildDigest(date, allArticles, method);
  }

  return buildDigest(date, dayArticles, method);
}

/** Returns cleaned content if it's a usable excerpt, or null if it's junk */
function isCleanContent(content: string | null): string | null {
  if (!content) return null;
  const trimmed = content.trim();
  // HN raw metadata
  if (/^(Article URL:|Comments URL:|Points:|# Comments:)/i.test(trimmed)) return null;
  if (/https?:\/\/\S+\s+(Comments URL|Points:)/i.test(trimmed)) return null;
  // Scraped page chrome (nav text, "Back to...", "Published...", "Upvote")
  if (/^(Back to \w+|Published |Upvote \d|Enterprise \+)/i.test(trimmed)) return null;
  // Content that looks like scraped page fragments (too many non-sentence tokens)
  if (trimmed.split(/\s+/).length < 5) return null;
  return trimmed;
}

async function buildDigest(
  date: string,
  dayArticles: { id: string; title: string; content: string | null; topicId: string | null; publishedAt: string | null; url: string }[],
  method: "aggregation" | "ai-summary"
): Promise<DigestResult> {
  // Group by topic
  const grouped: Record<string, typeof dayArticles> = {};
  for (const a of dayArticles) {
    const key = a.topicId || "uncategorized";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  }

  let content = `# AI News Digest — ${date}\n\n`;
  content += `*${dayArticles.length} articles collected*\n\n---\n\n`;

  const topicOrder = [...TOPICS.map((t) => t.slug), "uncategorized"];

  if (method === "ai-summary") {
    const provider = getLLMProvider();

    for (const slug of topicOrder) {
      const topicArticles = grouped[slug];
      if (!topicArticles?.length) continue;

      const topic = TOPICS.find((t) => t.slug === slug);
      const topicName = topic?.name || "Uncategorized";

      content += `## ${topicName}\n\n`;

      // Generate AI summary for this topic
      try {
        const summary = await provider.generateDigestSummary(
          topicName,
          topicArticles.map((a) => ({ title: a.title, content: a.content || undefined }))
        );
        content += `${summary}\n\n`;
      } catch (err) {
        content += `*AI summary unavailable for this section.*\n\n`;
      }

      // List articles
      content += `**Articles:**\n`;
      for (const a of topicArticles.slice(0, 10)) {
        content += `- ${a.title}\n`;
      }
      content += `\n`;
    }
  } else {
    // Aggregation mode — just list articles grouped by topic
    for (const slug of topicOrder) {
      const topicArticles = grouped[slug];
      if (!topicArticles?.length) continue;

      const topic = TOPICS.find((t) => t.slug === slug);
      const topicName = topic?.name || "Uncategorized";

      content += `## ${topicName} (${topicArticles.length})\n\n`;

      for (const a of topicArticles.slice(0, 10)) {
        content += `- **${a.title}**`;
        const clean = isCleanContent(a.content);
        if (clean) {
          content += `\n  ${clean.slice(0, 150).trim()}...`;
        }
        content += `\n`;
      }

      if (topicArticles.length > 10) {
        content += `- *...and ${topicArticles.length - 10} more*\n`;
      }
      content += `\n`;
    }
  }

  // Store digest
  const id = nanoid();
  db.insert(digests)
    .values({
      id,
      date,
      content,
      articleCount: dayArticles.length,
      generatedAt: new Date().toISOString(),
      method,
    })
    .onConflictDoUpdate({
      target: digests.date,
      set: {
        content,
        articleCount: dayArticles.length,
        generatedAt: new Date().toISOString(),
        method,
      },
    })
    .run();

  return { id, date, method, articleCount: dayArticles.length, content };
}
