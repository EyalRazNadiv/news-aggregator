<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
}>(), {
  placeholder: 'Search...',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="relative">
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      class="w-full px-4 py-2 pl-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
