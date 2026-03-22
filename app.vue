<script setup lang="ts">
const { isDark, toggleDark } = useDarkMode()

const topics = [
  { slug: "ai-development", name: "AI Development" },
  { slug: "ai-production", name: "AI in Production" },
  { slug: "ai-product-tools", name: "Product Tools" },
  { slug: "ai-research", name: "Research" },
  { slug: "ai-business", name: "Business" },
]

const route = useRoute()
const currentTopic = computed(() => route.query.topic as string | undefined)
const isOnDigests = computed(() => route.path.startsWith('/digests'))
const isOnBookmarks = computed(() => route.path === '/bookmarks')
const isOnSources = computed(() => route.path === '/sources')
const isOnHome = computed(() => route.path === '/' && !currentTopic.value)
const isFetching = ref(false)
const sidebarOpen = ref(false)

async function triggerFetch() {
  isFetching.value = true
  try {
    await $fetch('/api/fetch', { method: 'POST' })
    await navigateTo(route.fullPath, { replace: true })
    window.location.reload()
  } catch (e) {
    console.error('Fetch failed:', e)
  } finally {
    isFetching.value = false
  }
}

// Close sidebar on navigation (mobile)
watch(() => route.fullPath, () => {
  sidebarOpen.value = false
})
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Mobile header -->
    <div class="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-gray-900 lg:hidden">
      <button @click="sidebarOpen = !sidebarOpen" class="text-gray-300 hover:text-white">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!sidebarOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <NuxtLink to="/" class="text-white font-bold">AI News</NuxtLink>
      <button @click="toggleDark" class="text-gray-300 hover:text-white">
        <svg v-if="isDark" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    </div>

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed lg:static inset-y-0 left-0 z-40 w-56 bg-gray-900 text-gray-300 flex flex-col flex-shrink-0 transition-transform lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-5 pb-3">
        <NuxtLink to="/" class="block">
          <h1 class="text-xl font-bold text-white">AI News</h1>
          <span class="text-blue-400 text-lg font-semibold">Assistant</span>
        </NuxtLink>
      </div>

      <nav class="flex-1 px-3 mt-4 space-y-1 overflow-y-auto">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="isOnHome ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-800 text-gray-400'"
        >
          All Topics
        </NuxtLink>

        <NuxtLink
          v-for="t in topics"
          :key="t.slug"
          :to="`/?topic=${t.slug}`"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          :class="currentTopic === t.slug ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:bg-gray-800 text-gray-400'"
        >
          {{ t.name }}
        </NuxtLink>

        <div class="border-t border-gray-700 my-4"></div>

        <NuxtLink
          to="/digests"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          :class="isOnDigests ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-400 hover:bg-gray-800'"
        >
          Daily Digests
        </NuxtLink>

        <NuxtLink
          to="/bookmarks"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          :class="isOnBookmarks ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-400 hover:bg-gray-800'"
        >
          Bookmarks
        </NuxtLink>

        <NuxtLink
          to="/sources"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          :class="isOnSources ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-400 hover:bg-gray-800'"
        >
          Sources
        </NuxtLink>
      </nav>

      <div class="p-3 space-y-2 border-t border-gray-700">
        <!-- Dark mode toggle -->
        <button
          @click="toggleDark"
          class="hidden lg:flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg v-if="isDark" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          {{ isDark ? 'Light mode' : 'Dark mode' }}
        </button>

        <UiButton variant="primary" size="sm" :disabled="isFetching" @click="triggerFetch" class="w-full">
          {{ isFetching ? 'Fetching...' : 'Fetch News' }}
        </UiButton>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto pt-14 lg:pt-0">
      <NuxtPage />
    </main>
  </div>
</template>
