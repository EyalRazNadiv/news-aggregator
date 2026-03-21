<script setup lang="ts">
withDefaults(defineProps<{
  color?: 'blue' | 'violet'
}>(), {
  color: 'blue',
})
</script>

<template>
  <div class="flex items-center justify-center py-20">
    <div
      class="animate-spin rounded-full h-8 w-8 border-b-2"
      :class="color === 'violet' ? 'border-violet-600' : 'border-blue-600'"
    />
  </div>
</template>
