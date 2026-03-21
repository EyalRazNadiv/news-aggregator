const topicColors: Record<string, string> = {
  "ai-development": "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  "ai-production": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "ai-product-tools": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "ai-research": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "ai-business": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

const topicNames: Record<string, string> = {
  "ai-development": "AI Development",
  "ai-production": "AI in Production",
  "ai-product-tools": "Product Tools",
  "ai-research": "Research",
  "ai-business": "Business",
};

export function getTopicColor(topicId: string): string {
  return topicColors[topicId] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
}

export function getTopicName(topicId: string): string {
  return topicNames[topicId] || topicId;
}
