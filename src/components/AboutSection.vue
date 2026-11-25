<script lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
</script>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import type { AboutContent } from '../content'
import SectionIntro from './SectionIntro.vue'

const props = defineProps<{
  about: AboutContent
  portrait?: string
  portraitAlt: string
}>()
const supportsTrail = typeof CSS !== 'undefined' && typeof CSS.registerProperty === 'function'
const trailBands = 20

const entries = computed(() =>
  (props.about.sections ?? []).filter((entry) => entry.title?.trim() || entry.description?.trim()),
)
const editorialList = useTemplateRef('editorialList')
const revealed = new WeakSet<Element>()

watch(
  [editorialList, entries],
  ([list], _, onCleanup) => {
    if (!list) return

    const motion = gsap.matchMedia(list)
    onCleanup(() => motion.revert())
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      for (const row of list.querySelectorAll('.about-entry')) {
        if (revealed.has(row)) continue
        gsap.from(row, {
          scrollTrigger: { trigger: row, start: 'top 96%', once: true },
          onStart: () => {
            revealed.add(row)
          },
          opacity: 0.76,
          y: 6,
          duration: 0.38,
          ease: 'power2.out',
          immediateRender: false,
          clearProps: 'opacity,transform',
        })
      }
    })
  },
  { flush: 'post' },
)

const failedPortrait = ref<string>()
const portraitWidth = ref<number>()
const portraitSrc = computed(() =>
  props.portrait !== failedPortrait.value ? props.portrait : undefined,
)

watch(
  () => props.portrait,
  () => {
    portraitWidth.value = undefined
  },
)

function sizePortrait(event: Event) {
  if (event.currentTarget instanceof HTMLImageElement) {
    const { naturalWidth, naturalHeight } = event.currentTarget
    portraitWidth.value = Math.floor(Math.min(naturalWidth, naturalHeight * 0.8) / 1.25)
  }
}
</script>

<template>
  <section
    id="about"
    class="shell portfolio-section about-section"
    :class="{ 'about-section--with-portrait': portraitSrc }"
    tabindex="-1"
  >
    <div class="about-lead">
      <SectionIntro :eyebrow="about.eyebrow" :title="about.title" />
      <p v-if="about.introduction?.trim()" class="about-introduction">{{ about.introduction }}</p>
    </div>

    <figure
      v-if="portraitSrc"
      class="about-portrait relative"
      :style="{ '--portrait-native-width': portraitWidth ? `${portraitWidth}px` : undefined }"
    >
      <div class="about-portrait-window">
        <img
          :key="about.profileAvatar"
          :src="about.profileAvatar"
          :alt="portraitAlt"
          loading="lazy"
          decoding="async"
          @load="sizePortrait"
          @error="failedPortrait = portraitSrc"
        />
      </div>
      <span class="about-portrait-orbit" aria-hidden="true">
        <svg v-if="supportsTrail" class="about-portrait-trail" focusable="false">
          <rect
            v-for="band in trailBands"
            :key="band"
            width="100%"
            height="100%"
            pathLength="100"
            :style="{ '--trail-length': (band / trailBands) * 5 }"
          />
        </svg>
        <span class="about-portrait-dot"></span>
      </span>
    </figure>

    <ol v-if="entries.length" ref="editorialList" class="about-entries" role="list">
      <li v-for="entry in entries" :key="entry.id" class="about-entry">
        <bdi v-if="String(entry.number ?? '').trim()" class="about-number">{{ entry.number }}</bdi>
        <div>
          <h3 v-if="entry.title?.trim()">{{ entry.title }}</h3>
          <p v-if="entry.description?.trim()">{{ entry.description }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>
