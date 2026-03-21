<script setup lang="ts">
const route = useRoute()
const date = route.params.date as string

const { data: digest, pending, error } = useFetch(`/api/digests/${date}`)

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">$1</h1>')
    .replace(/^\*\*(.+?)\*\*$/gm, '<p class="font-semibold text-gray-700 dark:text-gray-300 mt-3 mb-1">$1</p>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-gray-600 dark:text-gray-300">$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700 dark:text-gray-300 py-0.5">$1</li>')
    // Indented continuation lines (content previews under list items)
    .replace(/^  (.+)$/gm, '<p class="ml-4 text-sm text-gray-500 dark:text-gray-400">$1</p>')
    .replace(/^---$/gm, '<hr class="my-4 border-gray-200 dark:border-gray-700" />')
    .replace(/\n\n/g, '<br/>')
}
</script>

<template>
  <UiPageLayout>
    <UiBackLink to="/digests" label="Back to digests" />

    <UiSpinner v-if="pending" color="violet" />

    <div v-else-if="error" class="text-center py-20">
      <p class="text-red-500">Digest not found</p>
    </div>

    <UiCard v-else-if="digest" class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <span
          class="px-3 py-1 rounded-full text-xs font-medium"
          :class="digest.method === 'ai-summary' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'"
        >
          {{ digest.method === 'ai-summary' ? 'AI Summary' : 'Aggregation' }}
        </span>
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ digest.articleCount }} articles</span>
      </div>

      <div class="prose prose-gray dark:prose-invert max-w-none" v-html="renderMarkdown(digest.content || '')"></div>
    </UiCard>
  </UiPageLayout>
</template>
