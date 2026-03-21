import type { SourceConfig } from "../types";

export const DEFAULT_SOURCES: SourceConfig[] = [
  // --- General Tech / AI News ---
  {
    id: "hn",
    name: "Hacker News (Best)",
    type: "rss",
    url: "https://hnrss.org/best?q=AI+OR+LLM+OR+GPT+OR+Claude+OR+machine+learning",
  },
  {
    id: "techcrunch-ai",
    name: "TechCrunch AI",
    type: "rss",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    id: "theverge-ai",
    name: "The Verge AI",
    type: "rss",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
  {
    id: "arstechnica-ai",
    name: "Ars Technica AI",
    type: "rss",
    url: "https://feeds.arstechnica.com/arstechnica/features",
  },
  {
    id: "mit-tech-review",
    name: "MIT Technology Review AI",
    type: "rss",
    url: "https://www.technologyreview.com/feed/",
  },

  // --- Company / Research Blogs ---
  {
    id: "openai-blog",
    name: "OpenAI Blog",
    type: "rss",
    url: "https://openai.com/blog/rss.xml",
  },
  {
    id: "anthropic-blog",
    name: "Anthropic Blog",
    type: "rss",
    url: "https://www.anthropic.com/feed.xml",
  },
  {
    id: "google-ai-blog",
    name: "Google AI Blog",
    type: "rss",
    url: "https://blog.google/technology/ai/rss/",
  },
  {
    id: "huggingface-blog",
    name: "Hugging Face Blog",
    type: "rss",
    url: "https://huggingface.co/blog/feed.xml",
  },

  // --- Developer-focused ---
  {
    id: "simon-willison",
    name: "Simon Willison's Weblog",
    type: "rss",
    url: "https://simonwillison.net/atom/everything/",
  },
  {
    id: "the-batch",
    name: "The Batch (deeplearning.ai)",
    type: "rss",
    url: "https://www.deeplearning.ai/feed/",
  },

  // --- News API ---
  {
    id: "newsapi-ai",
    name: "NewsAPI - AI",
    type: "newsapi",
    url: "https://newsapi.org/v2/everything",
    config: {
      q: "artificial intelligence OR large language model OR generative AI",
      language: "en",
      sortBy: "publishedAt",
      pageSize: 30,
    },
  },
];
