<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTemplateRef, watch } from 'vue'
import { nonblank, webUrl, type ExperienceContent, type Locale } from '../content'
import SectionIntro from './SectionIntro.vue'
import TechnologyTags from './TechnologyTags.vue'
import AmbientBackground from './ui/AmbientBackground.vue'

const props = defineProps<{
  intro: Omit<ExperienceContent, 'items'>
  jobs: Readonly<ExperienceContent['items']>
  locale: Locale
  presentLabel: string
}>()

const timeline = useTemplateRef('timeline')

function formatMonth(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) return value
  const date = new Date(`${value}-01T00:00:00Z`)
  if (!Number.isFinite(date.getTime())) return value
  return new Intl.DateTimeFormat(props.locale, {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

watch(
  [timeline, () => props.jobs],
  ([list], _, onCleanup) => {
    const line = list?.querySelector('.experience-progress')
    if (!list || !line) return

    const motion = gsap.matchMedia(list)
    onCleanup(() => motion.revert())
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const markers = [...list.querySelectorAll('.experience-marker')]
      let markerStops: number[] = []
      let refreshing = false
      const fill = gsap.fromTo(
        line,
        { scaleY: 0 },
        { scaleY: 1, duration: 1, ease: 'none', paused: true },
      )

      const updateMarkers = (pulse: boolean) => {
        const progress = fill.progress()
        markers.forEach((marker, index) => {
          const reached = progress >= (markerStops[index] ?? 1)
          if (marker.classList.contains('experience-marker--reached') === reached) return

          marker.classList.toggle('experience-marker--reached', reached)
          marker.classList.toggle('experience-marker--pulse', reached && pulse)
        })
      }

      ScrollTrigger.create({
        animation: fill,
        trigger: list,
        start: 'top 55%',
        end: 'bottom 55%',
        scrub: 0.2,
        onRefreshInit: () => {
          refreshing = true
        },
        onRefresh: ({ progress }) => {
          const bounds = list.getBoundingClientRect()
          markerStops = markers.map((marker) => {
            const { top, height } = marker.getBoundingClientRect()
            return (top + height / 2 - bounds.top) / bounds.height
          })
          fill.progress(progress, true)
          updateMarkers(false)
          refreshing = false
        },
      })
      // Follow the rendered line while the scrub catches up to the scroll position.
      fill.eventCallback('onUpdate', () => updateMarkers(!refreshing))

      list.querySelectorAll('.experience-entry').forEach((entry) => {
        gsap.from(entry, {
          scrollTrigger: { trigger: entry.parentElement, start: 'top 96%', once: true },
          opacity: 0.65,
          y: 7,
          duration: 0.4,
          ease: 'power2.out',
          immediateRender: false,
          clearProps: 'opacity,transform',
        })
      })

      return () => {
        markers.forEach((marker) => {
          marker.classList.remove('experience-marker--reached', 'experience-marker--pulse')
        })
      }
    })
  },
  { flush: 'post' },
)
</script>

<template>
  <section id="experience" class="shell portfolio-section section-split" tabindex="-1">
    <div class="relative isolate">
      <AmbientBackground :intensity="0.045" :count="2" />
      <SectionIntro
        class="relative z-10"
        :eyebrow="intro.eyebrow"
        :title="intro.title"
        :description="intro.description"
      />
    </div>
    <div ref="timeline" class="experience-list">
      <span class="experience-progress" aria-hidden="true"></span>
      <article v-for="job in jobs" :key="job.id" class="experience-item">
        <span class="experience-marker" aria-hidden="true"></span>
        <div class="experience-entry">
          <p v-if="job.startDate || job.endDate || job.current" class="experience-date">
            <time v-if="job.startDate" :datetime="job.startDate">{{
              formatMonth(job.startDate)
            }}</time>
            <span v-if="job.startDate && (job.current || job.endDate)" aria-hidden="true">—</span>
            <span v-if="job.current">{{ presentLabel }}</span>
            <time v-else-if="job.endDate" :datetime="job.endDate">{{
              formatMonth(job.endDate)
            }}</time>
          </p>
          <h3>{{ job.position }}</h3>
          <div v-if="job.company || job.employmentType || job.location" class="experience-meta">
            <a v-if="job.company && webUrl(job.companyUrl)" :href="webUrl(job.companyUrl)">{{
              job.company
            }}</a>
            <bdi v-else-if="job.company">{{ job.company }}</bdi>
            <span v-if="job.employmentType && intro.employmentTypes[job.employmentType]">{{
              intro.employmentTypes[job.employmentType]
            }}</span>
            <span v-if="job.location">{{ job.location }}</span>
          </div>
          <p v-if="job.summary" class="experience-summary">{{ job.summary }}</p>
          <ul v-if="nonblank(job.highlights).length" class="bullets" role="list">
            <li v-for="highlight in nonblank(job.highlights)" :key="highlight">
              {{ highlight }}
            </li>
          </ul>
          <TechnologyTags :items="job.technologies" />
        </div>
      </article>
    </div>
  </section>
</template>
