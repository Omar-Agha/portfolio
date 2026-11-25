<script setup lang="ts">
import { gsap } from 'gsap'
import { computed, useTemplateRef, watch } from 'vue'
import { type LabProject, webUrl } from '../content'
import LabProjectIcon from './LabProjectIcon.vue'
import SectionIntro from './SectionIntro.vue'
import TechnologyTags from './TechnologyTags.vue'

const props = defineProps<{
  intro: { eyebrow?: string; title: string; description?: string }
  projects: LabProject[]
  labels: { project: string; newTab: string }
  statuses: Record<string, string>
}>()
const emit = defineEmits<{ open: [event: MouseEvent, id: string] }>()
const projectsWithLinks = computed(() =>
  props.projects.map((project) => ({ ...project, repository: webUrl(project.repositoryUrl) })),
)
const section = useTemplateRef('section')
const revealed = new WeakSet<Element>()

watch(
  [section, projectsWithLinks],
  ([root], _, onCleanup) => {
    if (!root) return

    const motion = gsap.matchMedia(root)
    onCleanup(() => motion.revert())
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const intro = root.querySelector('.section-intro')
      if (intro && !revealed.has(intro)) {
        gsap
          .timeline({
            scrollTrigger: { trigger: intro, start: 'top 98%', once: true },
            onStart: () => {
              revealed.add(intro)
            },
          })
          .set(intro.children, { opacity: 0.65, y: 5 })
          .to(intro.children, {
            opacity: 1,
            y: 0,
            duration: 0.36,
            stagger: 0.05,
            clearProps: 'opacity,transform',
            ease: 'power2.out',
          })
      }

      root.querySelectorAll('.lab-card').forEach((card, index) => {
        if (revealed.has(card)) return
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 97%', once: true },
          onStart: () => {
            revealed.add(card)
          },
          opacity: 0.65,
          y: 6,
          duration: 0.4,
          delay: (index % 3) * 0.07,
          immediateRender: false,
          clearProps: 'opacity,transform',
          ease: 'power2.out',
        })
      })
    })
  },
  { flush: 'post' },
)
</script>

<template>
  <section id="lab" ref="section" class="shell portfolio-section" tabindex="-1">
    <SectionIntro :eyebrow="intro.eyebrow" :title="intro.title" :description="intro.description" />
    <div class="lab-grid">
      <article
        v-for="project in projectsWithLinks"
        :key="project.id"
        class="lab-card interactive-card"
      >
        <div class="lab-card-top flex items-center justify-between gap-3">
          <LabProjectIcon :project-id="project.id" />
          <span
            v-if="project.status && statuses[project.status]"
            class="status"
            :class="`status--${project.status}`"
            ><bdi>{{ statuses[project.status] }}</bdi></span
          >
        </div>
        <h3 :id="`lab-title-${project.id}`">
          <bdi>{{ project.title }}</bdi>
        </h3>
        <p v-if="project.summary" class="card-summary">{{ project.summary }}</p>
        <TechnologyTags :items="project.technologies" />
        <div class="lab-card-actions">
          <button
            type="button"
            class="card-action"
            :aria-labelledby="`lab-action-${project.id} lab-title-${project.id}`"
            aria-haspopup="dialog"
            @click="emit('open', $event, project.id)"
          >
            <span :id="`lab-action-${project.id}`">{{ labels.project }}</span>
            <span class="action-plus" aria-hidden="true">+</span>
          </button>
          <a
            v-if="project.repository"
            class="lab-repository"
            :href="project.repository"
            target="_blank"
            rel="noopener noreferrer"
          >
            <bdi>GitHub</bdi><span class="lab-link-arrow" aria-hidden="true">↗</span>
            <span class="sr-only">{{ project.title }} {{ labels.newTab }}</span>
          </a>
        </div>
      </article>
    </div>
  </section>
</template>
