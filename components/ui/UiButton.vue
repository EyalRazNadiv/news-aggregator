<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md'
  disabled?: boolean
  as?: string
}>(), {
  variant: 'primary',
  size: 'md',
  as: 'button',
})

const variantClasses: Record<string, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600',
  secondary: 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
  accent: 'bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-500 dark:hover:bg-violet-600',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-2',
}

const classes = computed(() => [
  'text-sm font-medium rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center',
  variantClasses[props.variant],
  sizeClasses[props.size],
])
</script>

<template>
  <component :is="as" :class="classes" :disabled="disabled">
    <slot />
  </component>
</template>
