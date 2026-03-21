<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
  placeholder?: string
}>(), {
  placeholder: 'Select...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedLabel = computed(() => {
  const opt = props.options.find(o => o.value === props.modelValue)
  return opt?.label || props.placeholder
})
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <SelectTrigger class="inline-flex items-center justify-between gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[140px] hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
      <SelectValue :placeholder="placeholder">{{ selectedLabel }}</SelectValue>
      <SelectIcon>
        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        class="z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden dark:bg-gray-800 dark:border-gray-600"
        position="popper"
        :side-offset="4"
      >
        <SelectViewport class="p-1">
          <SelectItem
            v-for="opt in options"
            :key="opt.value"
            :value="opt.value"
            class="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 dark:text-gray-200 dark:data-[highlighted]:bg-blue-900/30 dark:data-[highlighted]:text-blue-300"
          >
            <SelectItemText>{{ opt.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
