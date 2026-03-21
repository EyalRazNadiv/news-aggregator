<script setup lang="ts">
withDefaults(defineProps<{
  to: string
  label?: string
}>(), {
  label: 'Back',
})
</script>

<template>
  <NuxtLink :to="to" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
    {{ label }}
  </NuxtLink>
</template>
