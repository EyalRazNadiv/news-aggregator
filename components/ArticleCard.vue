<script setup lang="ts">
defineProps<{
  article: {
    id: string
    title: string
    url: string
    author?: string | null
    publishedAt?: string | null
    content?: string | null
    topicId?: string | null
    sourceName?: string | null
    isRead?: number | null
    isBookmarked?: number | null
  }
  compact?: boolean
}>()

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <UiCard interactive class="p-4 group relative" :class="{ 'opacity-60': article.isRead }">
    <!-- Bookmark indicator -->
    <svg
      v-if="article.isBookmarked"
      class="absolute top-2 right-2 h-4 w-4 text-amber-500"
      fill="currentColor" viewBox="0 0 24 24"
    >
      <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z" />
    </svg>

    <NuxtLink :to="`/article/${article.id}`" class="block">
      <h3 class="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug pr-6" :class="compact ? 'text-sm' : 'text-base'">
        {{ article.title }}
      </h3>
    </NuxtLink>

    <div class="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
      <UiTopicBadge v-if="article.topicId" :topic-id="article.topicId">
        {{ article.topicId.replace('ai-', '').replace('-', ' ') }}
      </UiTopicBadge>
      <span v-if="article.sourceName" class="font-medium text-gray-600 dark:text-gray-300">{{ article.sourceName }}</span>
      <span v-if="article.publishedAt">{{ timeAgo(article.publishedAt) }}</span>
    </div>

    <p v-if="article.content && !compact" class="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
      {{ article.content }}
    </p>
  </UiCard>
</template>
