<script setup lang="ts">
import { computed } from 'vue'
import { nonblank } from '../content'

const props = defineProps<{ items?: string[] }>()
const tags = computed(() => nonblank(props.items))
</script>

<template>
  <ul v-if="tags.length" class="tags" role="list">
    <li v-for="tag in tags" :key="tag">
      <bdi>{{ tag }}</bdi>
    </li>
  </ul>
</template>
