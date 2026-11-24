<script setup lang="ts">
import SectionIntro from './SectionIntro.vue'
import TechnologyTags from './TechnologyTags.vue'
import AmbientBackground from './ui/AmbientBackground.vue'

defineProps<{
  intro: { eyebrow?: string; title: string; description?: string }
  categories: readonly { id: string; title: string; items: string[] }[]
}>()
</script>

<template>
  <section id="skills" class="shell portfolio-section section-split relative isolate" tabindex="-1">
    <AmbientBackground />
    <SectionIntro
      class="relative z-10"
      :eyebrow="intro.eyebrow"
      :title="intro.title"
      :description="intro.description"
    />
    <div class="skill-list relative z-10">
      <div v-for="category in categories" :key="category.id" class="skill-row">
        <h3>{{ category.title }}</h3>
        <TechnologyTags :items="category.items" />
      </div>
    </div>
  </section>
</template>
