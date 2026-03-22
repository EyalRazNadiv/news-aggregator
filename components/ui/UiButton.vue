<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'accent' | 'danger'
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
  danger: 'border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-2',
}

const classes = computed(() => [
  'text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center',
  variantClasses[props.variant],
  sizeClasses[props.size],
])
</script>

<template>
  <component :is="as" :class="classes" :disabled="disabled">
    <slot />
  </component>
</template>
