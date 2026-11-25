<script setup lang="ts">
import { gsap } from 'gsap'
import { computed, ref, useTemplateRef, watch } from 'vue'
import type { AboutContent } from '../content'
import { useRenderContext } from '../renderContext'
import AboutPortrait from './AboutPortrait.vue'
import SectionIntro from './SectionIntro.vue'

const props = defineProps<{
  about: AboutContent
  portrait?: string
  portraitAlt: string
}>()
const { assetUrl } = useRenderContext()
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

const failedPortraits = ref(new Set<string>())
const portraitSources = computed(() => {
  const avatar = props.about.profileAvatar
  const large = assetUrl(typeof avatar === 'string' ? avatar : avatar?.lg)
  const small = assetUrl(typeof avatar === 'string' ? undefined : avatar?.sm)
  const mobile = small && !failedPortraits.value.has(small) ? small : undefined
  const src = [large, mobile, props.portrait].find((url) => url && !failedPortraits.value.has(url))
  return { src, mobile }
})
</script>

<template>
  <section
    id="about"
    class="shell portfolio-section about-section"
    :class="{ 'about-section--with-portrait': portraitSources.src }"
    tabindex="-1"
  >
    <div class="about-lead">
      <SectionIntro :eyebrow="about.eyebrow" :title="about.title" />
      <p v-if="about.introduction?.trim()" class="about-introduction">{{ about.introduction }}</p>
    </div>

    <AboutPortrait
      v-if="portraitSources.src"
      :src="portraitSources.src"
      :mobile-src="portraitSources.mobile"
      :alt="portraitAlt"
      @unavailable="failedPortraits.add($event)"
    />

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
