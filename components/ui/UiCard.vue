<script setup lang="ts">
withDefaults(defineProps<{
  interactive?: boolean
  as?: string | object
}>(), {
  interactive: false,
  as: 'div',
})
</script>

<template>
  <component
    :is="as"
    class="bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
    :class="interactive && 'hover:border-gray-300 hover:shadow-sm transition-all dark:hover:border-gray-600'"
  >
    <slot />
  </component>
</template>
