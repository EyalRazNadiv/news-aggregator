<script setup lang="ts">
interface Source {
  id: string
  name: string
  type: string
  url: string
  config: Record<string, unknown> | null
  enabled: boolean
  lastFetchedAt: string | null
  createdAt: string
}

const { data: sourcesList, pending, refresh } = useFetch<Source[]>('/api/sources')

const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  name: '',
  type: 'rss' as 'rss' | 'newsapi',
  url: '',
  config: '',
})

function resetForm() {
  form.name = ''
  form.type = 'rss'
  form.url = ''
  form.config = ''
  editingId.value = null
  showForm.value = false
}

function startAdd() {
  resetForm()
  showForm.value = true
}

function startEdit(source: Source) {
  editingId.value = source.id
  form.name = source.name
  form.type = source.type as 'rss' | 'newsapi'
  form.url = source.url
  form.config = source.config ? JSON.stringify(source.config, null, 2) : ''
  showForm.value = true
}

async function saveSource() {
  if (editingId.value) {
    await $fetch(`/api/sources/${editingId.value}`, {
      method: 'PATCH',
      body: {
        name: form.name,
        type: form.type,
        url: form.url,
        config: form.config || null,
      },
    })
  } else {
    await $fetch('/api/sources', {
      method: 'POST',
      body: {
        name: form.name,
        type: form.type,
        url: form.url,
        config: form.config || null,
      },
    })
  }
  resetForm()
  await refresh()
}

async function toggleEnabled(source: Source) {
  await $fetch(`/api/sources/${source.id}`, {
    method: 'PATCH',
    body: { enabled: !source.enabled },
  })
  await refresh()
}

async function deleteSource(source: Source) {
  if (!confirm(`Delete "${source.name}"? This cannot be undone.`)) return

  try {
    await $fetch(`/api/sources/${source.id}?force=true`, { method: 'DELETE' })
    await refresh()
  } catch (err) {
    console.error('Delete failed:', err)
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleString()
}
</script>

<template>
  <UiPageLayout max-width="6xl">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Sources</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage news sources for your feed
        </p>
      </div>
      <UiButton v-if="!showForm" variant="primary" size="sm" @click="startAdd">
        Add Source
      </UiButton>
    </div>

    <!-- Add/Edit Form -->
    <UiCard v-if="showForm" class="mb-6">
      <div class="p-4 space-y-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ editingId ? 'Edit Source' : 'Add New Source' }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. TechCrunch AI"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <UiSelect v-model="form.type" :options="[{ value: 'rss', label: 'RSS Feed' }, { value: 'newsapi', label: 'NewsAPI' }]" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
          <input
            v-model="form.url"
            type="url"
            placeholder="https://feeds.example.com/rss"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div v-if="form.type === 'newsapi'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Config (JSON)
          </label>
          <textarea
            v-model="form.config"
            rows="3"
            placeholder='{"query": "artificial intelligence", "language": "en"}'
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex gap-2">
          <UiButton variant="primary" size="sm" @click="saveSource">
            {{ editingId ? 'Save Changes' : 'Add Source' }}
          </UiButton>
          <UiButton variant="secondary" size="sm" @click="resetForm">
            Cancel
          </UiButton>
        </div>
      </div>
    </UiCard>

    <!-- Loading -->
    <UiSpinner v-if="pending" />

    <!-- Sources List -->
    <div v-else-if="sourcesList && sourcesList.length > 0" class="space-y-3">
      <UiCard v-for="source in sourcesList" :key="source.id">
        <div class="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <!-- Source info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-gray-900 dark:text-gray-100">{{ source.name }}</span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :class="source.type === 'rss'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'"
              >
                {{ source.type === 'rss' ? 'RSS' : 'NewsAPI' }}
              </span>
              <span
                class="inline-flex items-center gap-1 text-xs"
                :class="source.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="source.enabled ? 'bg-green-500' : 'bg-gray-400'" />
                {{ source.enabled ? 'Active' : 'Disabled' }}
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{{ source.url }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Last fetched: {{ formatDate(source.lastFetchedAt) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <UiButton variant="secondary" size="sm" @click="toggleEnabled(source)">
              {{ source.enabled ? 'Disable' : 'Enable' }}
            </UiButton>
            <UiButton variant="secondary" size="sm" @click="startEdit(source)">
              Edit
            </UiButton>
            <UiButton variant="danger" size="sm" @click="deleteSource(source)">
              Delete
            </UiButton>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-20">
      <p class="text-gray-500 dark:text-gray-400 text-lg">No sources configured</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">
        Add a source to start fetching news
      </p>
    </div>
  </UiPageLayout>
</template>
