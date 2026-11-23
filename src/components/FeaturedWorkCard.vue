<script setup lang="ts">
import type { WorkProject } from '../content'
import SystemArtwork from './SystemArtwork.vue'
import TechnologyTags from './TechnologyTags.vue'

defineProps<{
  project: WorkProject
  actionLabel: string
}>()
const emit = defineEmits<{ open: [event: MouseEvent] }>()
</script>

<template>
  <article class="work-card interactive-card" :class="{ 'work-card--featured': project.featured }">
    <div class="work-copy">
      <p v-if="project.subtitle" class="eyebrow" dir="auto">{{ project.subtitle }}</p>
      <h3 :id="`work-title-${project.id}`">
        <bdi>{{ project.title }}</bdi>
      </h3>
      <p v-if="project.summary" class="card-summary">{{ project.summary }}</p>
      <TechnologyTags :items="project.tags" />
      <button
        type="button"
        class="card-action"
        :aria-labelledby="`work-action-${project.id} work-title-${project.id}`"
        aria-haspopup="dialog"
        @click="emit('open', $event)"
      >
        <span :id="`work-action-${project.id}`">{{ actionLabel }}</span>
        <span class="action-plus" aria-hidden="true">+</span>
      </button>
    </div>
    <div v-if="project.featured" class="work-visual">
      <SystemArtwork variant="work" />
    </div>
  </article>
</template>
