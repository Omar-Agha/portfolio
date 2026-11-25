<script setup lang="ts">
import { gsap } from 'gsap'
import { computed, useTemplateRef, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { assetUrl, type content, type Locale } from '../content'
import SystemArtwork from './SystemArtwork.vue'

const props = defineProps<{
  profile: Pick<
    (typeof content)[Locale]['profile'],
    'hero' | 'resume' | 'availability' | 'location'
  >
  sections: readonly { id: string }[]
}>()

const emit = defineEmits<{ activateAnchor: [hash: string] }>()

const route = useRoute()
const section = useTemplateRef('section')
const hero = computed(() => props.profile.hero)

const titleLines = computed(() => {
  const words = hero.value.title.trim().split(/\s+/)
  if (words.length < 4) return [hero.value.title]
  return [words.slice(0, -2).join(' '), words.slice(-2).join(' ')]
})

const heroActions = computed(() =>
  [
    { action: hero.value.primaryAction, label: hero.value.primaryActionLabel },
    { action: hero.value.secondaryAction, label: hero.value.secondaryActionLabel },
  ].flatMap(({ action, label }) => {
    if (!label || !action) return []
    if (action.type === 'section' && props.sections.some(({ id }) => id === action.target)) {
      return [{ label, href: `#${action.target}`, section: true }]
    }
    const href =
      action.type === 'file' ? assetUrl(action.target || props.profile.resume) : undefined
    return href ? [{ label, href, section: false }] : []
  }),
)

watch(
  [section, () => props.profile],
  ([heroSection], _, onCleanup) => {
    const heroCopy = heroSection?.querySelector('.hero-copy')
    const heroArt = heroSection?.querySelector('.system-art--hero')
    if (!heroSection || !heroCopy || !heroArt || typeof IntersectionObserver === 'undefined') return

    const motion = gsap.matchMedia(heroSection)
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const copyEntrance = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } })
      copyEntrance.from('h1', {
        opacity: 0,
        y: 12,
        duration: 0.55,
        clearProps: 'opacity,transform',
      })

      const details = heroCopy.querySelectorAll('.hero-description, .hero-actions > a')
      if (details.length) {
        copyEntrance.from(
          details,
          { opacity: 0, duration: 0.4, stagger: 0.08, clearProps: 'opacity' },
          0.18,
        )
      }

      const artEntrance = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } })
      artEntrance
        .from('.assembly-axis', { opacity: 0, duration: 0.45, clearProps: 'opacity' })
        .from(
          '.assembly-plane',
          {
            opacity: 0,
            '--plane-reveal-y': '8px',
            duration: 0.55,
            stagger: 0.12,
            clearProps: 'opacity,--plane-reveal-y',
          },
          0.12,
        )
        .addLabel('float')
        .to('.assembly', {
          '--assembly-float-y': '-4px',
          ease: 'sine.inOut',
          duration: 1.8,
          repeat: -1,
          yoyo: true,
        })

      const orbit = gsap.timeline({
        defaults: { duration: 0.76, ease: 'none' },
        repeat: -1,
        repeatDelay: 1.4,
      })
      orbit
        .to('.assembly-signal', { opacity: 0.95, duration: 0.16 }, 0)
        .to('.assembly-signal', { xPercent: 100 }, 0)
        .to('.assembly-signal', { yPercent: 100 })
        .to('.assembly-signal', { xPercent: 0 })
        .to('.assembly-signal', { yPercent: 0 })
        .to('.assembly-signal', { opacity: 0, duration: 0.16 }, '-=0.16')
      artEntrance.add(orbit, 'float+=0.2')

      // The illustration may start below the fold on mobile.
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const visible = entry.intersectionRatio >= 0.12
            if (entry.target === heroArt) {
              artEntrance.paused(!visible)
            } else if (visible) {
              copyEntrance.play()
              observer.unobserve(entry.target)
            }
          }
        },
        { threshold: 0.12 },
      )
      observer.observe(heroCopy)
      observer.observe(heroArt)

      return () => observer.disconnect()
    })

    onCleanup(() => motion.revert())
  },
  { flush: 'post' },
)
</script>

<template>
  <section id="hero" ref="section" class="shell hero" tabindex="-1">
    <div class="hero-copy">
      <p v-if="hero.eyebrow" class="eyebrow">{{ hero.eyebrow }}</p>
      <h1>
        <span v-for="(line, index) in titleLines" :key="line">{{ index ? ` ${line}` : line }}</span>
      </h1>
      <p v-if="hero.description" class="hero-description">{{ hero.description }}</p>
      <div v-if="heroActions.length" class="hero-actions flex flex-wrap gap-3">
        <template v-for="(action, index) in heroActions" :key="action.href">
          <RouterLink
            v-if="action.section"
            :to="{ path: route.path, query: route.query, hash: action.href }"
            class="button"
            :class="index ? 'button--outline' : 'button--primary'"
            @click="emit('activateAnchor', action.href)"
            >{{ action.label }}</RouterLink
          >
          <a
            v-else
            :href="action.href"
            download
            class="button"
            :class="index ? 'button--outline' : 'button--primary'"
            >{{ action.label }}</a
          >
        </template>
      </div>
      <div
        v-if="(profile.availability?.visible && profile.availability.label) || profile.location"
        class="hero-meta flex flex-wrap items-center"
      >
        <span
          v-if="profile.availability?.visible && profile.availability.label"
          class="availability"
          ><i aria-hidden="true"></i>{{ profile.availability.label }}</span
        >
        <span v-if="profile.location" class="location"
          ><i aria-hidden="true"></i>{{ profile.location }}</span
        >
      </div>
    </div>
    <SystemArtwork variant="hero" />
  </section>
</template>
