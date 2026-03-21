import * as cheerio from "cheerio";

const TIMEOUT_MS = 10_000;
const MAX_CONTENT_LENGTH = 5_000;

/**
 * Scrape the main text content from an article URL.
 * Returns the extracted text or null if scraping fails.
 */
export async function scrapeArticleContent(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AI-News-Assistant/1.0)",
        Accept: "text/html",
      },
    });
    clearTimeout(timer);

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove non-content elements
    $("script, style, nav, header, footer, aside, iframe, form, .ad, .sidebar, .comments, .related").remove();

    // Try common article content selectors in priority order
    const selectors = [
      "article",
      '[role="main"]',
      ".post-content",
      ".article-content",
      ".entry-content",
      ".post-body",
      "main",
      ".content",
    ];

    let text = "";
    for (const selector of selectors) {
      const el = $(selector);
      if (el.length) {
        text = el.text();
        break;
      }
    }

    // Fallback to body
    if (!text) {
      text = $("body").text();
    }

    // Clean up whitespace
    text = text
      .replace(/\s+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (text.length < 50) return null; // Too short, likely failed

    return text.slice(0, MAX_CONTENT_LENGTH);
  } catch {
    return null;
  }
}
