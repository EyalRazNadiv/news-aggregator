<script setup lang="ts">
import { getTopicColor, getTopicName } from '~/composables/useTopicMeta'

const props = withDefaults(defineProps<{
  topicId: string
  size?: 'sm' | 'md'
}>(), {
  size: 'sm',
})

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
}
</script>

<template>
  <span
    class="rounded-full font-medium"
    :class="[getTopicColor(topicId), sizeClasses[size]]"
  >
    <slot>{{ getTopicName(topicId) }}</slot>
  </span>
</template>
