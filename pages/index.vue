<script setup lang="ts">
import { getTopicName } from '~/composables/useTopicMeta'

const route = useRoute()
const topic = computed(() => route.query.topic as string | undefined)
const search = ref('')
const searchDebounced = ref('')
let searchTimer: ReturnType<typeof setTimeout>

watch(search, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { searchDebounced.value = val }, 300)
})

const { data: articles, pending } = useFetch('/api/articles', {
  query: computed(() => ({
    topic: topic.value || undefined,
    search: searchDebounced.value || undefined,
    limit: 100,
  })),
  watch: [topic, searchDebounced],
})

const groupedArticles = computed(() => {
  if (!articles.value) return []
  if (topic.value) {
    return [{ topicId: topic.value, name: getTopicName(topic.value), articles: articles.value }]
  }
  const groups: Record<string, typeof articles.value> = {}
  const order = ["ai-development", "ai-production", "ai-product-tools", "ai-research", "ai-business"]

  for (const a of articles.value) {
    const key = a.topicId || "uncategorized"
    if (!groups[key]) groups[key] = []
    groups[key].push(a)
  }

  return order
    .filter((k) => groups[k]?.length)
    .map((k) => ({ topicId: k, name: getTopicName(k), articles: groups[k] }))
    .concat(
      groups["uncategorized"]?.length
        ? [{ topicId: "uncategorized", name: "Uncategorized", articles: groups["uncategorized"] }]
        : []
    )
})

const { data: stats } = useFetch('/api/stats')

const pageTitle = computed(() => {
  if (topic.value) return getTopicName(topic.value)
  return "Today's News"
})
</script>

<template>
  <UiPageLayout max-width="6xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ pageTitle }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1" v-if="stats">
          {{ stats.total.toLocaleString() }} articles total
        </p>
      </div>

      <UiSearchInput v-model="search" placeholder="Search articles..." class="w-full sm:w-80" />
    </div>

    <!-- Loading -->
    <UiSpinner v-if="pending" />

    <!-- Articles grouped by topic -->
    <div v-else-if="groupedArticles.length > 0" class="space-y-8">
      <section v-for="group in groupedArticles" :key="group.topicId">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ group.name }}</h2>
          <NuxtLink
            v-if="!topic"
            :to="`/?topic=${group.topicId}`"
            class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View all
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ArticleCard
            v-for="article in (topic ? group.articles : group.articles.slice(0, 4))"
            :key="article.id"
            :article="article"
            :compact="!topic"
          />
        </div>
      </section>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-20">
      <p class="text-gray-500 dark:text-gray-400 text-lg">No articles found</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-2" v-if="search">Try a different search term</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-2" v-else>
        Click <strong>Fetch News</strong> in the sidebar to get started
      </p>
    </div>
  </UiPageLayout>
</template>
