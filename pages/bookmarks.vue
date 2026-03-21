<script setup lang="ts">
const { data: articles, pending } = useFetch('/api/articles', {
  query: { bookmarked: 'true', limit: 100 },
})
</script>

<template>
  <UiPageLayout max-width="6xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Bookmarks</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Your saved articles</p>
    </div>

    <UiSpinner v-if="pending" />

    <div v-else-if="articles && articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
      />
    </div>

    <div v-else class="text-center py-20">
      <p class="text-gray-500 dark:text-gray-400 text-lg">No bookmarks yet</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">
        Click "Bookmark" on any article to save it here
      </p>
    </div>
  </UiPageLayout>
</template>
