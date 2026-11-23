<script setup lang="ts">
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import { nonblank } from '../content'
import TechnologyTags from './TechnologyTags.vue'

export type ProjectDetail = {
  title: string
  subtitle?: string
  description?: string
  cover?: string
  meta: string[]
  tags: string[]
  groups: { title: string; items: string[] }[]
  links: { label: string; href: string }[]
}

const props = defineProps<{
  activeProject: ProjectDetail | null
  labels: { close: string; overview: string; technologies: string }
}>()
const emit = defineEmits<{ close: [] }>()
const dialog = useTemplateRef('drawer')
const closeButton = useTemplateRef('closeButton')
const previousProject = shallowRef<ProjectDetail | null>(null)
const project = computed(() => props.activeProject ?? previousProject.value)
const groups = computed(() =>
  project.value?.groups
    .map((group) => ({ ...group, items: nonblank(group.items) }))
    .filter((group) => group.items.length),
)

watch(
  () => props.activeProject,
  (value) => {
    const panel = dialog.value
    if (value && panel) {
      previousProject.value = value
      if (!panel.open) {
        panel.showModal()
        panel.scrollTop = 0
        closeButton.value?.focus({ preventScroll: true })
      }
    } else {
      panel?.close()
    }
  },
  { flush: 'post' },
)
</script>

<template>
  <dialog
    ref="drawer"
    class="project-drawer"
    aria-labelledby="drawer-title"
    @close="emit('close')"
    @click.self="dialog?.close()"
  >
    <div v-if="project" class="drawer-content">
      <div class="drawer-top flex items-center justify-between gap-4">
        <p v-if="project.subtitle" class="eyebrow" dir="auto">{{ project.subtitle }}</p>
        <button
          ref="closeButton"
          type="button"
          class="icon-button drawer-close"
          @click="dialog?.close()"
        >
          <span aria-hidden="true">×</span><span class="sr-only">{{ labels.close }}</span>
        </button>
      </div>
      <div class="drawer-heading">
        <h2 id="drawer-title">
          <bdi>{{ project.title }}</bdi>
        </h2>
        <p v-if="project.meta.length" class="drawer-meta">
          <bdi v-for="value in project.meta" :key="value">{{ value }}</bdi>
        </p>
      </div>
      <img v-if="project.cover" :src="project.cover" alt="" class="drawer-cover" />
      <section v-if="project.description" class="drawer-section">
        <h3>{{ labels.overview }}</h3>
        <p>{{ project.description }}</p>
      </section>
      <section v-if="project.tags.length" class="drawer-section">
        <h3>{{ labels.technologies }}</h3>
        <TechnologyTags :items="project.tags" />
      </section>
      <section v-for="group in groups" :key="group.title" class="drawer-section">
        <h3>{{ group.title }}</h3>
        <ul class="bullets" role="list">
          <li v-for="item in group.items" :key="item">
            <bdi>{{ item }}</bdi>
          </li>
        </ul>
      </section>
      <div v-if="project.links.length" class="drawer-links flex flex-wrap gap-3">
        <a
          v-for="link in project.links"
          :key="link.href"
          :href="link.href"
          class="button button--outline"
          >{{ link.label }}</a
        >
      </div>
    </div>
  </dialog>
</template>
