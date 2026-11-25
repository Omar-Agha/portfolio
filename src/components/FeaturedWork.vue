<script setup lang="ts">
import { gsap } from 'gsap'
import { computed, useTemplateRef, watch } from 'vue'
import type { WorkProject } from '../content'
import FeaturedWorkCard from './FeaturedWorkCard.vue'
import SectionIntro from './SectionIntro.vue'

const props = defineProps<{
  intro: { eyebrow?: string; title: string; description?: string }
  projects: WorkProject[]
  actionLabel: string
}>()
const emit = defineEmits<{ open: [event: MouseEvent, id: string] }>()
const orderedProjects = computed(() => [
  ...props.projects.filter((project) => project.featured),
  ...props.projects.filter((project) => !project.featured),
])
const section = useTemplateRef('section')
const revealed = new WeakSet<Element>()

function entrance(element: HTMLElement, start: string) {
  if (revealed.has(element)) return
  return gsap.timeline({
    defaults: { ease: 'power2.out', immediateRender: false },
    onStart: () => {
      revealed.add(element)
    },
    scrollTrigger: { trigger: element, start, once: true },
  })
}

function revealCircuit(art: HTMLElement, timeline: gsap.core.Timeline) {
  timeline
    .set(art.querySelectorAll('.circuit-node'), { opacity: 0.2, y: 3 }, 0)
    .set(art.querySelectorAll('.circuit-link'), { scaleX: 0, transformOrigin: 'left center' }, 0)
    .set(art.querySelectorAll('.circuit-junction'), { opacity: 0 }, 0)
    .from(
      art.querySelectorAll('.circuit-bus'),
      { opacity: 0.25, duration: 0.44, clearProps: 'opacity' },
      0,
    )

  const branches = art.querySelectorAll('.circuit-branch')
  branches.forEach((branch, index) => {
    const position = 0.07 + index * 0.12
    timeline
      .to(
        branch.querySelectorAll('.circuit-node'),
        { opacity: 1, y: 0, duration: 0.36, clearProps: 'opacity,transform' },
        position,
      )
      .to(
        branch.querySelectorAll('.circuit-link'),
        { scaleX: 1, duration: 0.38, clearProps: 'transform,transformOrigin' },
        position + 0.06,
      )
      .to(
        branch.querySelectorAll('.circuit-junction'),
        { opacity: 1, duration: 0.24, clearProps: 'opacity' },
        position + 0.22,
      )
  })
  timeline.call(() => {
    revealed.add(art)
  })
}

function animateCircuit(art: HTMLElement) {
  const defaults = { ease: 'power2.out', immediateRender: false }
  const timeline = gsap.timeline({
    defaults,
    scrollTrigger: {
      trigger: art,
      start: 'top bottom',
      end: 'bottom top',
      toggleActions: 'play pause resume pause',
    },
  })
  const needsReveal = !revealed.has(art)
  if (needsReveal) revealCircuit(art, timeline)

  // The outer rows carry brief exchanges in opposite directions.
  const exchanges = gsap.timeline({ defaults, repeat: -1, repeatDelay: 2.5 })
  const signals = art.querySelectorAll('.circuit-signal')
  signals.forEach((signal, index) => {
    const returning = index % 2 === 1
    const branch = signal.closest('.circuit-branch')
    const nodes = branch?.querySelectorAll('.circuit-receipt')
    const receipt = nodes?.[returning ? 0 : 1]
    if (!receipt) return

    const send = index * 1.36
    exchanges
      .fromTo(
        signal,
        { xPercent: returning ? 100 : 0 },
        { xPercent: returning ? 0 : 100, duration: 0.8, ease: 'none' },
        send,
      )
      .to(signal, { opacity: 0.85, duration: 0.12 }, send)
      .to(signal, { opacity: 0, duration: 0.16, clearProps: 'opacity,transform' }, send + 0.65)
      .to(receipt, { opacity: 0.7, duration: 0.11 }, send + 0.77)
      .to(receipt, { opacity: 0, duration: 0.3, clearProps: 'opacity' }, send + 0.88)
  })
  timeline.add(exchanges, needsReveal ? '+=0.17' : 0)
}

watch(
  [section, orderedProjects],
  ([root], _, onCleanup) => {
    if (!root) return

    const motion = gsap.matchMedia(root)
    onCleanup(() => motion.revert())
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const intro = root.querySelector<HTMLElement>('.section-intro')
      if (intro) {
        entrance(intro, 'top 98%')
          ?.set(intro.children, {
            opacity: 0.42,
            y: (_index: number, element: HTMLElement) => (element.tagName === 'H2' ? 10 : 4),
          })
          .to(intro.children, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.075,
            clearProps: 'opacity,transform',
          })
      }

      for (const card of root.querySelectorAll<HTMLElement>('.work-card')) {
        const reveal = entrance(card, 'top 94%')
        reveal?.from(card, { opacity: 0.52, duration: 0.48, clearProps: 'opacity' })
        const tags = card.querySelectorAll('.tags li')
        if (tags.length) {
          reveal?.set(tags, { opacity: 0.36, y: 5 }, 0).to(
            tags,
            {
              opacity: 1,
              y: 0,
              duration: 0.32,
              stagger: { amount: 0.22 },
              clearProps: 'opacity,transform',
            },
            0.21,
          )
        }

        const art = card.querySelector<HTMLElement>('.system-art--work')
        if (art) animateCircuit(art)
      }
    })
  },
  { flush: 'post' },
)
</script>

<template>
  <section id="work" ref="section" class="shell portfolio-section" tabindex="-1">
    <SectionIntro :eyebrow="intro.eyebrow" :title="intro.title" :description="intro.description" />
    <div class="work-list">
      <FeaturedWorkCard
        v-for="project in orderedProjects"
        :key="project.id"
        :project="project"
        :action-label="actionLabel"
        @open="emit('open', $event, project.id)"
      />
    </div>
  </section>
</template>
