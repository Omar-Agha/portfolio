<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AboutSection from '../components/AboutSection.vue'
import ContactSection from '../components/ContactSection.vue'
import EngineeringLab from '../components/EngineeringLab.vue'
import ExperienceSection from '../components/ExperienceSection.vue'
import FeaturedWork from '../components/FeaturedWork.vue'
import HeroSection from '../components/HeroSection.vue'
import ProjectDrawer, { type ProjectDetail } from '../components/ProjectDrawer.vue'
import SiteFooter from '../components/SiteFooter.vue'
import SiteHeader from '../components/SiteHeader.vue'
import SkillsSection from '../components/SkillsSection.vue'
import {
  content,
  defaultLocale,
  emailUrl,
  isLocale,
  nonblank,
  presentItems,
  publicAssetPath,
  webUrl,
} from '../content'
import { useRenderContext } from '../renderContext'
import { pageMetadata } from '../seo'
import { portfolioJsonLd, portfolioJsonLdId } from '../structuredData'

const route = useRoute()
const { assetUrl } = useRenderContext()
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

watchEffect(
  (onCleanup) => {
    const header = siteHeader.value?.element
    const main = mainContent.value
    if (!header || !main) return
    const scrollRoot = document.scrollingElement
    if (!scrollRoot) return

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
const avatar = computed(() => assetUrl(profile.value.avatar))
const avatarThumbnail = computed(() => assetUrl(profile.value.avatarThumbnail) ?? avatar.value)

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

function setMeta(attribute: 'name' | 'property', key: string, value: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.append(tag)
  }
  tag.content = value
}

onMounted(() => {
  watchEffect(() => {
    const metadata = pageMetadata(locale.value, copy.value.site.seo)
    document.documentElement.lang = locale.value
    document.documentElement.dir = locale.value === 'ar' ? 'rtl' : 'ltr'
    document.title = metadata.title
    document.head.querySelector('link[rel="canonical"]')?.setAttribute('href', metadata.canonical)
    const favicon = assetUrl('/favicon.ico')
    if (favicon) document.head.querySelector('link[rel="icon"]')?.setAttribute('href', favicon)
    for (const [name, value] of Object.entries(metadata.named)) setMeta('name', name, value)
    for (const [property, value] of Object.entries(metadata.openGraph)) {
      setMeta('property', property, value)
    }
    const schema = document.getElementById(portfolioJsonLdId)
    if (schema) {
      const jsonLd = portfolioJsonLd(
        locale.value,
        copy.value,
        content.en.profile.name,
        (path) => publicAssetPath(path) !== undefined,
      )
      if (schema.textContent !== jsonLd) schema.textContent = jsonLd
    }
  })
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
    :avatar="avatarThumbnail"
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

      <ExperienceSection
        v-else-if="section.id === 'experience'"
        :intro="copy.experience"
        :jobs="experience"
        :locale="locale"
        :present-label="ui.present"
      />

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

  <SiteFooter
    :locale="locale"
    :avatar="avatarThumbnail"
    :links="socials"
    @activate-anchor="activateAnchor"
  />

  <ProjectDrawer :active-project="detail" :labels="ui" @close="closeProject" />
</template>
