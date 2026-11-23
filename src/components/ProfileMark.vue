<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  mode: 'image' | 'text'
  text: string
  imageSrc?: string
  loading?: 'eager' | 'lazy'
}>()

const failedImageSrc = ref<string>()
</script>

<template>
  <img
    v-if="mode === 'image' && imageSrc && imageSrc !== failedImageSrc"
    :src="imageSrc"
    alt=""
    :loading="loading"
    class="object-cover rounded-full"
    @error="failedImageSrc = imageSrc"
  />
  <bdi v-else-if="text.trim()">{{ text }}</bdi>
</template>
