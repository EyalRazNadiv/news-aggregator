# AI News Assistant

A daily AI news aggregator that fetches from trusted RSS feeds and APIs, organizes articles by topic, and presents them in a dashboard with optional Claude-powered summaries.

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | For AI features | Claude API key for summaries and AI digests |
| `NEWS_API_KEY` | Optional | NewsAPI.org key for additional news sources |
| `CRON_SECRET` | For cron endpoint | Secret token to authenticate external cron triggers |

## Usage

```bash
# Start dev server
npm run dev

# Fetch news from all sources
npm run fetch

# Or trigger fetch via API
curl -X POST http://localhost:3000/api/fetch

# External cron trigger
curl "http://localhost:3000/api/cron?secret=YOUR_SECRET"
```

## Topics

1. **AI Development** — frameworks, tools, libraries
2. **AI in Production** — LLMs in apps, RAG, agents
3. **Product Tools** — AI for product teams
4. **Research & Breakthroughs** — papers, model releases
5. **Business & Industry** — funding, regulation, enterprise

## Sources

RSS: Hacker News, TechCrunch AI, The Verge AI, Ars Technica, MIT Tech Review, OpenAI Blog, Anthropic Blog, Google AI Blog, Hugging Face Blog, Simon Willison's Weblog, deeplearning.ai

API: NewsAPI.org

## Stack

- **Nuxt 4** (Vue 3) + Tailwind CSS
- **SQLite** via better-sqlite3 + Drizzle ORM
- **Claude** (Anthropic SDK) for AI features
- **rss-parser** for RSS feeds
