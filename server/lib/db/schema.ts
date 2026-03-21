import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "rss" | "newsapi"
  url: text("url").notNull(),
  config: text("config"), // JSON string
  enabled: integer("enabled").default(1),
  lastFetchedAt: text("last_fetched_at"),
  createdAt: text("created_at").notNull(),
});

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  sourceId: text("source_id").references(() => sources.id),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  urlHash: text("url_hash").notNull(),
  author: text("author"),
  publishedAt: text("published_at"),
  fetchedAt: text("fetched_at").notNull(),
  content: text("content"),
  imageUrl: text("image_url"),
  topicId: text("topic_id"),
  categoryConfidence: real("category_confidence"),
  categoryMethod: text("category_method"), // "keyword" | "claude"
  aiSummary: text("ai_summary"),
  summarizedAt: text("summarized_at"),
  isRead: integer("is_read").default(0),
  isBookmarked: integer("is_bookmarked").default(0),
});

export const topics = sqliteTable("topics", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  keywords: text("keywords"), // JSON array
  displayOrder: integer("display_order").default(0),
});

export const digests = sqliteTable("digests", {
  id: text("id").primaryKey(),
  date: text("date").notNull().unique(),
  content: text("content"),
  articleCount: integer("article_count"),
  generatedAt: text("generated_at"),
  method: text("method"), // "aggregation" | "ai-summary"
});

export const digestArticles = sqliteTable("digest_articles", {
  digestId: text("digest_id").references(() => digests.id),
  articleId: text("article_id").references(() => articles.id),
});
