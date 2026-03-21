<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  defaultOpen?: boolean
}>(), {
  defaultOpen: false,
})
</script>

<template>
  <CollapsibleRoot :default-open="defaultOpen" class="border border-gray-200 rounded-lg dark:border-gray-700">
    <CollapsibleTrigger class="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50 select-none dark:text-gray-300 dark:hover:bg-gray-700/50 rounded-lg">
      {{ title }}
      <svg
        class="h-4 w-4 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': false }"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <div class="px-4 pb-4">
        <slot />
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style scoped>
[data-state="open"] > svg {
  transform: rotate(180deg);
}
</style>
