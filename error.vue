<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>()

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="text-center">
      <p class="text-6xl font-bold text-gray-300 dark:text-gray-600">{{ error.statusCode }}</p>
      <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4">Something went wrong</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2">{{ error.message }}</p>
      <UiButton @click="handleError" class="mt-6 px-6">
        Back to home
      </UiButton>
    </div>
  </div>
</template>
