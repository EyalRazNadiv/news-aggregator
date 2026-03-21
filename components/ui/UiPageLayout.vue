<script setup lang="ts">
withDefaults(defineProps<{
  maxWidth?: '3xl' | '6xl'
}>(), {
  maxWidth: '3xl',
})
</script>

<template>
  <div class="mx-auto px-4 py-4 sm:px-6 sm:py-6" :class="maxWidth === '6xl' ? 'max-w-6xl' : 'max-w-3xl'">
    <slot />
  </div>
</template>
