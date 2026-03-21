<script setup lang="ts">
const route = useRoute()
const articleId = route.params.id as string

const { data: article, pending, error } = useFetch(`/api/articles/${articleId}`)

const isBookmarked = ref(false)
const aiSummary = ref<string | null>(null)
const isSummarizing = ref(false)
const summaryError = ref<string | null>(null)

watch(article, (a) => {
  if (a) {
    isBookmarked.value = !!a.isBookmarked
    aiSummary.value = a.aiSummary || null
  }
}, { immediate: true })

async function toggleBookmark() {
  isBookmarked.value = !isBookmarked.value
  await $fetch(`/api/articles/${articleId}`, {
    method: 'PATCH',
    body: { isBookmarked: isBookmarked.value },
  })
}

async function summarize() {
  isSummarizing.value = true
  summaryError.value = null
  try {
    const result = await $fetch(`/api/articles/${articleId}/summarize`, { method: 'POST' })
    aiSummary.value = result.summary
  } catch (err: any) {
    summaryError.value = err?.data?.message || 'Failed to generate summary'
  } finally {
    isSummarizing.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <UiPageLayout>
    <UiBackLink to="/" label="Back to feed" />

    <!-- Loading -->
    <UiSpinner v-if="pending" />

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <p class="text-red-500">Article not found</p>
    </div>

    <!-- Article -->
    <article v-else-if="article" class="space-y-6">
      <header>
        <div class="flex items-center gap-2 mb-3">
          <UiTopicBadge v-if="article.topicId" :topic-id="article.topicId" size="md" />
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ article.sourceName }}</span>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{{ article.title }}</h1>

        <div class="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
          <span v-if="article.author">By {{ article.author }}</span>
          <span v-if="article.publishedAt">{{ formatDate(article.publishedAt) }}</span>
        </div>
      </header>

      <!-- Actions -->
      <div class="flex items-center gap-3 border-y border-gray-200 dark:border-gray-700 py-3">
        <UiButton as="a" :href="article.url" target="_blank">
          Read original
        </UiButton>

        <UiButton
          variant="secondary"
          @click="toggleBookmark"
          :class="isBookmarked && 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300'"
        >
          {{ isBookmarked ? 'Bookmarked' : 'Bookmark' }}
        </UiButton>
      </div>

      <!-- AI Summary -->
      <div v-if="aiSummary" class="bg-violet-50 border border-violet-200 rounded-lg p-4 dark:bg-violet-900/20 dark:border-violet-800">
        <h3 class="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-2">AI Summary</h3>
        <p class="text-sm text-violet-900 dark:text-violet-100 leading-relaxed">{{ aiSummary }}</p>
      </div>

      <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-800 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Summary</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Generate a summary using AI</p>
          </div>
          <UiButton variant="accent" :disabled="isSummarizing" @click="summarize">
            {{ isSummarizing ? 'Summarizing...' : 'Summarize with AI' }}
          </UiButton>
        </div>
        <p v-if="summaryError" class="text-sm text-red-500 mt-2">{{ summaryError }}</p>
      </div>

      <!-- Raw content (collapsible) -->
      <UiCollapsible v-if="article.content" title="Show raw content">
        <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{{ article.content }}</p>
      </UiCollapsible>

      <!-- Metadata -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-400 dark:text-gray-500 space-y-1">
        <p>Categorized by: {{ article.categoryMethod }}</p>
        <p>Fetched: {{ article.fetchedAt ? formatDate(article.fetchedAt) : 'Unknown' }}</p>
      </div>
    </article>
  </UiPageLayout>
</template>
