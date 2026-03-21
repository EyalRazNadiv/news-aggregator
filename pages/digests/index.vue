<script setup lang="ts">
const { data: digestList, pending, refresh } = useFetch('/api/digests')

const isGenerating = ref(false)
const generateMethod = ref<'aggregation' | 'ai-summary'>('aggregation')
const generateError = ref<string | null>(null)

const methodOptions = [
  { value: 'aggregation', label: 'Simple' },
  { value: 'ai-summary', label: 'AI Summary' },
]

async function generateDigest() {
  isGenerating.value = true
  generateError.value = null
  try {
    const today = new Date().toISOString().split('T')[0]
    await $fetch('/api/digests', {
      method: 'POST',
      body: { date: today, method: generateMethod.value },
    })
    await refresh()
  } catch (err: any) {
    generateError.value = err?.data?.message || 'Failed to generate digest'
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <UiPageLayout>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Daily Digests</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Summaries of each day's AI news</p>
      </div>

      <div class="flex items-center gap-2">
        <UiSelect v-model="generateMethod" :options="methodOptions" />
        <UiButton variant="accent" :disabled="isGenerating" @click="generateDigest">
          {{ isGenerating ? 'Generating...' : 'Generate Today' }}
        </UiButton>
      </div>
    </div>

    <p v-if="generateError" class="text-sm text-red-500 mb-4">{{ generateError }}</p>

    <UiSpinner v-if="pending" color="violet" />

    <div v-else-if="digestList && digestList.length > 0" class="space-y-3">
      <NuxtLink
        v-for="digest in digestList"
        :key="digest.id"
        :to="`/digests/${digest.date}`"
        class="block"
      >
        <UiCard interactive class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ digest.date }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {{ digest.articleCount }} articles
                <span class="mx-1">-</span>
                <span :class="digest.method === 'ai-summary' ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-gray-400'">
                  {{ digest.method === 'ai-summary' ? 'AI Summary' : 'Aggregation' }}
                </span>
              </p>
            </div>
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </UiCard>
      </NuxtLink>
    </div>

    <UiCard v-else class="text-center py-16">
      <p class="text-gray-400 dark:text-gray-500 text-lg">No digests yet</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Click "Generate Today" to create your first digest</p>
    </UiCard>
  </UiPageLayout>
</template>
