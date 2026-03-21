import { TOPICS } from "../config/topics";
import type { RawArticle } from "../types";

export interface CategorizedArticle extends RawArticle {
  urlHash: string;
  topicId: string | null;
  categoryConfidence: number;
  categoryMethod: "keyword" | "uncategorized";
}

/**
 * Categorize articles using keyword matching against topic definitions.
 * Scores each article against all topics and assigns the best match.
 */
export function categorizeArticles(
  articles: (RawArticle & { urlHash: string })[]
): CategorizedArticle[] {
  return articles.map((article) => {
    const text = `${article.title} ${article.content || ""}`.toLowerCase();
    let bestTopic: string | null = null;
    let bestScore = 0;

    for (const topic of TOPICS) {
      let score = 0;
      for (const keyword of topic.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          // Title matches are worth more
          if (article.title.toLowerCase().includes(keyword.toLowerCase())) {
            score += 2;
          } else {
            score += 1;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestTopic = topic.slug;
      }
    }

    // Require at least 2 keyword hits for a confident match
    const isConfident = bestScore >= 2;

    return {
      ...article,
      topicId: isConfident ? bestTopic : null,
      categoryConfidence: bestScore > 0 ? Math.min(bestScore / 10, 1) : 0,
      categoryMethod: isConfident ? "keyword" as const : "uncategorized" as const,
    };
  });
}
