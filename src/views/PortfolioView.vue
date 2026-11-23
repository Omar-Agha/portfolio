<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ProjectDrawer, { type ProjectDetail } from '../components/ProjectDrawer.vue'
import SectionIntro from '../components/SectionIntro.vue'
import SystemArtwork from '../components/SystemArtwork.vue'
import TechnologyTags from '../components/TechnologyTags.vue'
import {
  assetUrl,
  content,
  defaultLocale,
  emailUrl,
  isLocale,
  localePaths,
  nonblank,
  presentItems,
  webUrl,
} from '../content'

const route = useRoute()
const locale = computed(() => (isLocale(route.meta.locale) ? route.meta.locale : defaultLocale))
const copy = computed(() => content[locale.value])
const ui = computed(() => copy.value.site.ui)
const profile = computed(() => copy.value.profile)
const hero = computed(() => profile.value.hero)
const alternate = computed(() =>
  copy.value.site.supportedLocales.find((code) => isLocale(code) && code !== locale.value),
)
const languageNames = { en: 'English', ar: 'العربية' }
const labels = computed(() =>
  locale.value === 'ar'
    ? {
        menu: 'القائمة',
        navigation: 'التنقل الرئيسي',
        skip: 'انتقل إلى المحتوى',
        project: 'استعرض المشروع',
        email: 'البريد الإلكتروني',
      }
    : {
        menu: 'Menu',
        navigation: 'Main navigation',
        skip: 'Skip to content',
        project: 'Explore Project',
        email: 'Email',
      },
)

const work = computed(() => presentItems(copy.value.work.items))
const lab = computed(() => presentItems(copy.value.lab.items))
const skills = computed(() =>
  presentItems(copy.value.skills.categories).filter((category) => nonblank(category.items).length),
)
const experience = computed(() => presentItems(copy.value.experience.items))
const about = computed(() => nonblank(copy.value.about.paragraphs))
const sections = computed(() => {
  const available: Record<string, boolean> = {
    hero: Boolean(hero.value.title),
    work: work.value.length > 0,
    lab: lab.value.length > 0,
    skills: skills.value.length > 0,
    experience: experience.value.length > 0,
    about: about.value.length > 0,
    contact: Boolean(copy.value.contact.title),
  }
  return copy.value.site.sections.filter((section) => section.visible && available[section.id])
})
const navigation = computed(() =>
  copy.value.site.navigation.filter((item) =>
    sections.value.some((section) => section.id === item.id),
  ),
)
const menuOpen = ref(false)
const menuButton = useTemplateRef('menuButton')
const navigationElement = useTemplateRef('navigationElement')

async function toggleMenu() {
  if (menuOpen.value) {
    closeMenu()
    return
  }
  menuOpen.value = true
  await nextTick()
  navigationElement.value?.querySelector('a')?.focus()
}

function closeMenu() {
  if (!menuOpen.value) return
  menuOpen.value = false
  menuButton.value?.focus()
}

function sectionLink(hash: string) {
  return { path: route.path, query: route.query, hash }
}

function activateAnchor(hash: string) {
  closeMenu()
  if (route.hash === hash) {
    const target = document.getElementById(hash.slice(1))
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }
}

const titleLines = computed(() => {
  const words = hero.value.title.trim().split(/\s+/)
  if (words.length < 4) return [hero.value.title]
  return [words.slice(0, -2).join(' '), words.slice(-2).join(' ')]
})

const socials = computed(() => ({
  github: webUrl(profile.value.socials.github),
  linkedin: webUrl(profile.value.socials.linkedin),
  email: emailUrl(profile.value.socials.email),
}))
const socialLinks = computed(() =>
  [
    { label: 'GitHub', href: socials.value.github },
    { label: 'LinkedIn', href: socials.value.linkedin },
    { label: labels.value.email, href: socials.value.email },
  ].filter((link) => link.href),
)

const heroActions = computed(() =>
  [
    { action: hero.value.primaryAction, label: hero.value.primaryActionLabel },
    { action: hero.value.secondaryAction, label: hero.value.secondaryActionLabel },
  ].flatMap(({ action, label }) => {
    if (!label || !action) return []
    if (action.type === 'section' && sections.value.some(({ id }) => id === action.target)) {
      return [{ label, href: `#${action.target}`, section: true }]
    }
    const href =
      action.type === 'file' ? assetUrl(action.target || profile.value.resume) : undefined
    return href ? [{ label, href, section: false }] : []
  }),
)

const contactActions = computed(() =>
  [
    { action: copy.value.contact.primaryAction, label: copy.value.contact.primaryActionLabel },
    { action: copy.value.contact.secondaryAction, label: copy.value.contact.secondaryActionLabel },
  ].flatMap(({ action, label }) => {
    const type = action?.type
    if (type !== 'email' && type !== 'linkedin' && type !== 'github') return []
    const href = socials.value[type]
    return label && href ? [{ label, href }] : []
  }),
)

const headline = computed(() =>
  profile.value.headline
    ?.split('|')
    .map((part) => part.trim())
    .filter(Boolean),
)
const avatar = computed(() => assetUrl(profile.value.avatar))
const year = computed(() =>
  new Intl.DateTimeFormat(locale.value, { year: 'numeric' }).format(new Date()),
)

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
    description: project.description || project.summary,
    cover: assetUrl(project.cover),
    meta: [],
    tags: nonblank(project.technologies),
    groups: [
      { title: text.architecture, items: nonblank(project.architecture) },
      { title: text.implemented, items: nonblank(project.implemented) },
      { title: text.planned, items: nonblank(project.planned) },
    ],
    links: [
      ...(repository ? [{ label: text.viewRepository, href: repository }] : []),
      ...(demo ? [{ label: text.viewDemo, href: demo }] : []),
    ],
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
  <header class="site-header" @keydown.esc="closeMenu">
    <div class="shell masthead flex items-center justify-between">
      <RouterLink
        :to="sectionLink('#top')"
        class="brand flex items-center"
        @click="activateAnchor('#top')"
      >
        <bdi class="brand-mark">{{ copy.site.logoText }}</bdi>
        <span v-if="profile.name" class="brand-name">{{ profile.name }}</span>
      </RouterLink>
      <nav
        v-if="navigation.length"
        id="site-navigation"
        ref="navigationElement"
        class="site-nav"
        :class="{ 'site-nav--open': menuOpen }"
        :aria-label="labels.navigation"
      >
        <RouterLink
          v-for="item in navigation"
          :key="item.id"
          :to="sectionLink(item.href)"
          :class="{ 'nav-current': route.hash === item.href }"
          :aria-current="route.hash === item.href ? 'location' : undefined"
          @click="activateAnchor(item.href)"
          >{{ item.label }}</RouterLink
        >
      </nav>
      <div class="masthead-actions flex items-center gap-2">
        <RouterLink
          v-if="isLocale(alternate)"
          :to="{ ...sectionLink(route.hash), path: localePaths[alternate] }"
          class="language-button"
          :lang="alternate"
          :hreflang="alternate"
          @click="menuOpen = false"
          >{{ languageNames[alternate] }}</RouterLink
        >
        <button
          v-if="navigation.length"
          ref="menuButton"
          type="button"
          class="icon-button menu-button"
          :aria-expanded="menuOpen"
          aria-controls="site-navigation"
          :aria-label="menuOpen ? ui.close : labels.menu"
          @click="toggleMenu"
        >
          <span class="menu-icon" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </header>

  <main id="main" tabindex="-1">
    <template v-for="section in sections" :key="section.id">
      <section v-if="section.id === 'hero'" id="hero" class="shell hero" tabindex="-1">
        <div class="hero-copy">
          <p v-if="hero.eyebrow" class="eyebrow">{{ hero.eyebrow }}</p>
          <h1>
            <span v-for="line in titleLines" :key="line">{{ line }}</span>
          </h1>
          <p v-if="hero.description" class="hero-description">{{ hero.description }}</p>
          <div v-if="heroActions.length" class="hero-actions flex flex-wrap gap-3">
            <template v-for="(action, index) in heroActions" :key="action.href">
              <RouterLink
                v-if="action.section"
                :to="sectionLink(action.href)"
                class="button"
                :class="index ? 'button--outline' : 'button--primary'"
                @click="activateAnchor(action.href)"
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

      <section
        v-else-if="section.id === 'work'"
        id="work"
        class="shell portfolio-section"
        tabindex="-1"
      >
        <SectionIntro
          :eyebrow="copy.work.eyebrow"
          :title="copy.work.title"
          :description="copy.work.description"
        />
        <div class="work-list">
          <article
            v-for="project in work"
            :key="project.id"
            class="work-card interactive-card"
            :class="{ 'work-card--featured': project.featured }"
          >
            <div class="work-copy">
              <p v-if="project.subtitle" class="eyebrow" dir="auto">{{ project.subtitle }}</p>
              <h3 :id="`work-title-${project.id}`">
                <bdi>{{ project.title }}</bdi>
              </h3>
              <p v-if="project.summary" class="card-summary">{{ project.summary }}</p>
              <TechnologyTags :items="project.tags" />
              <button
                type="button"
                class="card-action"
                :aria-labelledby="`work-action-${project.id} work-title-${project.id}`"
                aria-haspopup="dialog"
                @click="openProject($event, 'work', project.id)"
              >
                <span :id="`work-action-${project.id}`">{{ ui.viewDetails }}</span
                ><span class="action-plus" aria-hidden="true">+</span>
              </button>
            </div>
            <div class="work-visual">
              <img
                v-if="assetUrl(project.cover)"
                :src="assetUrl(project.cover)"
                alt=""
                loading="lazy"
              />
              <SystemArtwork v-else variant="work" />
            </div>
          </article>
        </div>
      </section>

      <section
        v-else-if="section.id === 'lab'"
        id="lab"
        class="shell portfolio-section"
        tabindex="-1"
      >
        <SectionIntro
          :eyebrow="copy.lab.eyebrow"
          :title="copy.lab.title"
          :description="copy.lab.description"
        />
        <div class="lab-grid">
          <article v-for="project in lab" :key="project.id" class="lab-card interactive-card">
            <img
              v-if="assetUrl(project.cover)"
              :src="assetUrl(project.cover)"
              alt=""
              class="lab-cover"
              loading="lazy"
            />
            <div class="lab-card-top flex items-center justify-between gap-3">
              <span class="lab-glyph" aria-hidden="true"></span>
              <span
                v-if="project.status && ui.status[project.status]"
                class="status"
                :class="`status--${project.status}`"
                ><bdi>{{ ui.status[project.status] }}</bdi></span
              >
            </div>
            <h3 :id="`lab-title-${project.id}`">
              <bdi>{{ project.title }}</bdi>
            </h3>
            <p v-if="project.summary" class="card-summary">{{ project.summary }}</p>
            <TechnologyTags :items="project.technologies" />
            <button
              type="button"
              class="card-action"
              :aria-labelledby="`lab-action-${project.id} lab-title-${project.id}`"
              aria-haspopup="dialog"
              @click="openProject($event, 'lab', project.id)"
            >
              <span :id="`lab-action-${project.id}`">{{ labels.project }}</span
              ><span class="action-plus" aria-hidden="true">+</span>
            </button>
          </article>
        </div>
      </section>

      <section
        v-else-if="section.id === 'skills'"
        id="skills"
        class="shell portfolio-section section-split"
        tabindex="-1"
      >
        <SectionIntro
          :eyebrow="copy.skills.eyebrow"
          :title="copy.skills.title"
          :description="copy.skills.description"
        />
        <div class="skill-list">
          <div v-for="category in skills" :key="category.id" class="skill-row">
            <h3>{{ category.title }}</h3>
            <TechnologyTags :items="category.items" />
          </div>
        </div>
      </section>

      <section
        v-else-if="section.id === 'experience'"
        id="experience"
        class="shell portfolio-section section-split"
        tabindex="-1"
      >
        <SectionIntro
          :eyebrow="copy.experience.eyebrow"
          :title="copy.experience.title"
          :description="copy.experience.description"
        />
        <div class="experience-list">
          <article v-for="job in experience" :key="job.id" class="experience-item">
            <p v-if="job.startDate || job.endDate || job.current" class="experience-date">
              <time v-if="job.startDate" :datetime="job.startDate">{{
                formatMonth(job.startDate)
              }}</time>
              <span v-if="job.startDate && (job.current || job.endDate)" aria-hidden="true">—</span>
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
          </article>
        </div>
      </section>

      <section
        v-else-if="section.id === 'about'"
        id="about"
        class="shell portfolio-section about-section"
        tabindex="-1"
      >
        <div class="about-copy">
          <SectionIntro
            :eyebrow="copy.about.eyebrow"
            :title="copy.about.title"
            :description="copy.about.description"
          />
          <p v-for="paragraph in about" :key="paragraph">{{ paragraph }}</p>
        </div>
        <div class="identity-card">
          <img
            v-if="avatar"
            :src="avatar"
            alt=""
            width="112"
            height="112"
            loading="lazy"
            class="identity-avatar"
          />
          <bdi v-else class="identity-monogram" aria-hidden="true">{{ copy.site.logoText }}</bdi>
          <p class="identity-name">{{ profile.name }}</p>
          <p v-for="line in headline" :key="line" class="identity-headline">{{ line }}</p>
          <p v-if="profile.location" class="location identity-location">
            <i aria-hidden="true"></i>{{ profile.location }}
          </p>
        </div>
      </section>

      <section
        v-else-if="section.id === 'contact'"
        id="contact"
        class="shell portfolio-section contact-section"
        tabindex="-1"
      >
        <div class="contact-panel">
          <SectionIntro
            :eyebrow="copy.contact.eyebrow"
            :title="copy.contact.title"
            :description="copy.contact.description"
          />
          <div v-if="contactActions.length" class="contact-actions flex flex-wrap gap-3">
            <a
              v-for="(action, index) in contactActions"
              :key="action.href"
              :href="action.href"
              class="button"
              :class="index ? 'button--outline' : 'button--primary'"
              >{{ action.label }}</a
            >
          </div>
        </div>
      </section>
    </template>
  </main>

  <footer class="site-footer">
    <div class="shell footer-content">
      <div>
        <div class="footer-brand flex items-center gap-3">
          <bdi class="brand-mark">{{ copy.site.logoText }}</bdi>
          <p v-if="copy.footer.tagline">{{ copy.footer.tagline }}</p>
        </div>
        <p v-if="copy.footer.copyrightName || copy.footer.showCurrentYear" class="copyright">
          © <bdi v-if="copy.footer.showCurrentYear">{{ year }}</bdi>
          <bdi v-if="copy.footer.copyrightName">{{ copy.footer.copyrightName }}</bdi>
        </p>
      </div>
      <div class="footer-end">
        <div class="footer-links flex flex-wrap gap-x-5 gap-y-1">
          <template v-if="copy.footer.showSocialLinks">
            <a v-for="link in socialLinks" :key="link.label" :href="link.href"
              ><bdi>{{ link.label }}</bdi></a
            >
          </template>
          <RouterLink
            v-if="copy.footer.showBackToTop && copy.footer.backToTopLabel"
            :to="sectionLink('#top')"
            @click="activateAnchor('#top')"
            >{{ copy.footer.backToTopLabel }}</RouterLink
          >
        </div>
        <p v-if="copy.footer.creditsVisible && copy.footer.creditsText" class="credits">
          {{ copy.footer.creditsText }}
        </p>
      </div>
    </div>
  </footer>

  <ProjectDrawer :active-project="detail" :labels="ui" @close="closeProject" />
</template>
