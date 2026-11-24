<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AboutSection from '../components/AboutSection.vue'
import ContactSection from '../components/ContactSection.vue'
import EngineeringLab from '../components/EngineeringLab.vue'
import FeaturedWork from '../components/FeaturedWork.vue'
import HeroSection from '../components/HeroSection.vue'
import ProfileMark from '../components/ProfileMark.vue'
import ProjectDrawer, { type ProjectDetail } from '../components/ProjectDrawer.vue'
import SectionIntro from '../components/SectionIntro.vue'
import SiteHeader from '../components/SiteHeader.vue'
import SkillsSection from '../components/SkillsSection.vue'
import TechnologyTags from '../components/TechnologyTags.vue'
import AmbientBackground from '../components/ui/AmbientBackground.vue'
import {
  assetUrl,
  content,
  defaultLocale,
  emailUrl,
  isLocale,
  nonblank,
  presentItems,
  webUrl,
} from '../content'

gsap.registerPlugin(ScrollTrigger)

const route = useRoute()
const locale = computed(() => (isLocale(route.meta.locale) ? route.meta.locale : defaultLocale))
const copy = computed(() => content[locale.value])
const ui = computed(() => copy.value.site.ui)
const profile = computed(() => copy.value.profile)
const labels = computed(() =>
  locale.value === 'ar'
    ? {
        skip: 'انتقل إلى المحتوى',
        project: 'استعرض المشروع',
        viewOnGitHub: 'عرض على GitHub',
        newTab: '(يفتح في تبويب جديد)',
      }
    : {
        skip: 'Skip to content',
        project: 'Explore Project',
        viewOnGitHub: 'View on GitHub',
        newTab: '(opens in a new tab)',
      },
)

const work = computed(() => presentItems(copy.value.work.items))
const lab = computed(() => presentItems(copy.value.lab.items))
const skills = computed(() =>
  presentItems(copy.value.skills.categories).filter((category) => nonblank(category.items).length),
)
const experience = computed(() => presentItems(copy.value.experience.items))
const sections = computed(() => {
  const available: Record<string, boolean> = {
    hero: Boolean(profile.value.hero.title),
    work: work.value.length > 0,
    lab: lab.value.length > 0,
    skills: skills.value.length > 0,
    experience: experience.value.length > 0,
    about: Boolean(copy.value.about.title.trim()),
    contact: Boolean(copy.value.contact.title),
  }
  return copy.value.site.sections.filter((section) => section.visible && available[section.id])
})
const siteHeader = useTemplateRef('siteHeader')
const mainContent = useTemplateRef('mainContent')
const activeSectionId = ref<string>()

watch(
  [mainContent, experience],
  ([main], _, onCleanup) => {
    const list = main?.querySelector('#experience .experience-list')
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

watchEffect(
  (onCleanup) => {
    const header = siteHeader.value?.element
    const main = mainContent.value
    const scrollRoot = document.scrollingElement
    if (!header || !main || !scrollRoot) return

    const sectionsFromBottom = sections.value
      .map(({ id }) => document.getElementById(id))
      .filter((section) => section !== null)
      .reverse()
    let frame: number | undefined

    const scheduleUpdate = () => {
      if (frame !== undefined) return
      frame = requestAnimationFrame(() => {
        frame = undefined
        const { scrollTop, scrollHeight, clientHeight } = scrollRoot

        // A short final section may never reach the activation line.
        if (scrollTop > 0 && scrollTop + clientHeight >= scrollHeight - 1) {
          activeSectionId.value = sectionsFromBottom[0]?.id
          return
        }

        const activationLine = Math.max(
          header.getBoundingClientRect().bottom + 16,
          clientHeight / 4,
        )
        activeSectionId.value = sectionsFromBottom.find(
          (section) => section.getBoundingClientRect().top <= activationLine,
        )?.id
      })
    }

    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(header)
    resizeObserver.observe(main)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    scheduleUpdate()

    onCleanup(() => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frame !== undefined) cancelAnimationFrame(frame)
    })
  },
  { flush: 'post' },
)

function sectionLink(hash: string) {
  return { path: route.path, query: route.query, hash }
}

function activateAnchor(hash: string) {
  siteHeader.value?.closeMenu()
  if (route.hash === hash) {
    const target = document.getElementById(hash.slice(1))
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }
}

const socials = computed(() => ({
  github: webUrl(profile.value.socials.github),
  linkedin: webUrl(profile.value.socials.linkedin),
  email: emailUrl(profile.value.socials.email),
}))
const socialLinks = computed(() =>
  (['github', 'linkedin', 'email'] as const).flatMap((id) => {
    const href = socials.value[id]
    const label = copy.value.footer.socialLabels[id]
    return href && label ? [{ id, label, href }] : []
  }),
)

const avatar = computed(() => assetUrl(profile.value.avatar))
const copyright = computed(() => {
  const { showCurrentYear, copyrightName } = copy.value.footer
  const year = showCurrentYear
    ? new Intl.DateTimeFormat(locale.value, { year: 'numeric' }).format(new Date())
    : ''
  return [year, copyrightName?.trim()].filter(Boolean).join(' ')
})

function formatMonth(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) return value
  const date = new Date(`${value}-01T00:00:00Z`)
  if (!Number.isFinite(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

const selection = ref<{ kind: 'work' | 'lab'; id: string } | null>(null)
let drawerOpener: HTMLButtonElement | undefined

function openProject(event: MouseEvent, kind: 'work' | 'lab', id: string) {
  if (event.currentTarget instanceof HTMLButtonElement) drawerOpener = event.currentTarget
  selection.value = { kind, id }
}

function closeProject() {
  selection.value = null
  drawerOpener?.focus({ preventScroll: true })
  drawerOpener = undefined
}
const detail = computed<ProjectDetail | null>(() => {
  const current = selection.value
  if (!current) return null

  const text = ui.value
  if (current.kind === 'work') {
    const project = work.value.find(({ id }) => id === current.id)
    if (!project) return null
    return {
      title: project.title,
      subtitle: project.subtitle,
      description: project.description || project.summary,
      cover: assetUrl(project.cover),
      meta: nonblank([project.role ?? '', project.period ?? '']),
      tags: nonblank(project.tags),
      groups: [
        { title: text.architecture, items: nonblank(project.architecture) },
        { title: text.challenges, items: nonblank(project.challenges) },
        { title: text.contributions, items: nonblank(project.contributions) },
        { title: text.outcomes, items: nonblank(project.outcomes) },
      ],
      links: (project.links ?? []).flatMap((link) => {
        const href = webUrl(link.url ?? link.href)
        return href && link.label?.trim() ? [{ label: link.label, href }] : []
      }),
    }
  }

  const project = lab.value.find(({ id }) => id === current.id)
  if (!project) return null
  const repository = webUrl(project.repositoryUrl)
  const demo = webUrl(project.demoUrl)
  return {
    title: project.title,
    subtitle: project.status ? text.status[project.status] : undefined,
    description: project.description?.trim() || project.summary?.trim(),
    cover: assetUrl(project.cover),
    repository: repository
      ? { href: repository, label: labels.value.viewOnGitHub, newTab: labels.value.newTab }
      : undefined,
    meta: [],
    tags: nonblank(project.technologies),
    groups: [
      { title: text.architecture, items: nonblank(project.architecture) },
      { title: text.implemented, items: nonblank(project.implemented) },
      { title: text.planned, items: nonblank(project.planned) },
    ],
    links: demo ? [{ label: text.viewDemo, href: demo }] : [],
  }
})

function setMeta(attribute: 'name' | 'property', key: string, value?: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!value) {
    tag?.remove()
    return
  }
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.append(tag)
  }
  tag.content = value
}

watchEffect(() => {
  const { title, description, ogImage } = copy.value.site.seo
  document.documentElement.lang = locale.value
  document.documentElement.dir = locale.value === 'ar' ? 'rtl' : 'ltr'
  document.title = title
  setMeta('name', 'description', description)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:locale', locale.value === 'ar' ? 'ar_SY' : 'en_US')
  const image = assetUrl(ogImage)
  setMeta('property', 'og:image', image)
  setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
})
</script>

<template>
  <RouterLink :to="sectionLink('#main')" class="skip-link" @click="activateAnchor('#main')">{{
    labels.skip
  }}</RouterLink>
  <div id="top" class="page-top" tabindex="-1"></div>
  <SiteHeader
    ref="siteHeader"
    :locale="locale"
    :sections="sections"
    :avatar="avatar"
    :active-section-id="activeSectionId"
    @activate-anchor="activateAnchor"
  />

  <main id="main" ref="mainContent" tabindex="-1">
    <template v-for="section in sections" :key="section.id">
      <HeroSection
        v-if="section.id === 'hero'"
        :profile="profile"
        :sections="sections"
        @activate-anchor="activateAnchor"
      />

      <FeaturedWork
        v-else-if="section.id === 'work'"
        :intro="copy.work"
        :projects="work"
        :action-label="ui.viewDetails"
        @open="(event, id) => openProject(event, 'work', id)"
      />

      <EngineeringLab
        v-else-if="section.id === 'lab'"
        :intro="copy.lab"
        :projects="lab"
        :labels="labels"
        :statuses="ui.status"
        @open="(event, id) => openProject(event, 'lab', id)"
      />

      <SkillsSection
        v-else-if="section.id === 'skills'"
        :intro="copy.skills"
        :categories="skills"
      />

      <section
        v-else-if="section.id === 'experience'"
        id="experience"
        class="shell portfolio-section section-split"
        tabindex="-1"
      >
        <div class="relative isolate">
          <AmbientBackground :intensity="0.045" :count="2" />
          <SectionIntro
            class="relative z-10"
            :eyebrow="copy.experience.eyebrow"
            :title="copy.experience.title"
            :description="copy.experience.description"
          />
        </div>
        <div class="experience-list">
          <span class="experience-progress" aria-hidden="true"></span>
          <article v-for="job in experience" :key="job.id" class="experience-item">
            <span class="experience-marker" aria-hidden="true"></span>
            <div class="experience-entry">
              <p v-if="job.startDate || job.endDate || job.current" class="experience-date">
                <time v-if="job.startDate" :datetime="job.startDate">{{
                  formatMonth(job.startDate)
                }}</time>
                <span v-if="job.startDate && (job.current || job.endDate)" aria-hidden="true"
                  >—</span
                >
                <span v-if="job.current">{{ ui.present }}</span>
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
                <span
                  v-if="job.employmentType && copy.experience.employmentTypes[job.employmentType]"
                  >{{ copy.experience.employmentTypes[job.employmentType] }}</span
                >
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

      <AboutSection
        v-else-if="section.id === 'about'"
        :about="copy.about"
        :portrait="avatar"
        :portrait-alt="profile.name"
      />

      <ContactSection
        v-else-if="section.id === 'contact'"
        :contact="copy.contact"
        :links="socials"
      />
    </template>
  </main>

  <footer class="site-footer">
    <div class="shell footer-content">
      <div>
        <div class="footer-brand flex items-center gap-3">
          <ProfileMark
            class="brand-mark"
            mode="image"
            :text="copy.site.logoText"
            :image-src="avatar"
          />
          <div>
            <p v-if="profile.name" class="brand-name">{{ profile.name }}</p>
            <p v-if="copy.footer.tagline" class="footer-tagline">{{ copy.footer.tagline }}</p>
          </div>
        </div>
        <p v-if="copyright" class="copyright">
          <bdi dir="ltr">© {{ copyright }}</bdi>
        </p>
      </div>
      <div class="footer-end">
        <div
          v-if="copy.footer.showSocialLinks && socialLinks.length"
          class="footer-links flex flex-wrap gap-x-5 gap-y-1"
        >
          <a v-for="link in socialLinks" :key="link.id" :href="link.href">
            <svg v-if="link.id === 'github'" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="6" cy="6" r="2.5" />
              <circle cx="6" cy="18" r="2.5" />
              <circle cx="18" cy="6" r="2.5" />
              <path d="M6 8.5v7m0 0c0-6 12-2 12-7" />
            </svg>
            <svg v-else-if="link.id === 'linkedin'" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8 11v5m0-8v.1M12 16v-5m0 2a2 2 0 0 1 4 0v3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <bdi>{{ link.label }}</bdi>
          </a>
        </div>
        <RouterLink
          v-if="copy.footer.showBackToTop && copy.footer.backToTopLabel"
          class="footer-top"
          :to="sectionLink('#top')"
          @click="activateAnchor('#top')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-5 5 5-5 5 5" /></svg>
          <span>{{ copy.footer.backToTopLabel }}</span>
        </RouterLink>
      </div>
    </div>
  </footer>

  <ProjectDrawer :active-project="detail" :labels="ui" @close="closeProject" />
</template>
