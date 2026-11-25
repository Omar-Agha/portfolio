import en from './data/en.json'
import ar from './data/ar.json'
import type { Locale, SeoCopy } from './seo'

export { localePaths, type Locale } from './seo'

type Action = { type: string; target?: string }

type Introduction = { eyebrow?: string; title: string; description?: string }

export type ContactContent = Introduction & {
  availability?: string
  primaryAction?: Action
  secondaryAction?: Action
  primaryActionLabel?: string
  secondaryActionLabel?: string
  copyEmailLabel?: string
  emailCopied?: string
  emailCopyFailed?: string
  opensInNewTab?: string
}

export type AboutContent = {
  eyebrow?: string
  profileAvatar?: string | { lg?: string; sm?: string }
  title: string
  introduction?: string
  sections?: { id: string; number?: string | number; title?: string; description?: string }[]
}

type ProjectBase = {
  id: string
  visible?: boolean
  title: string
  summary?: string
  description?: string
  cover?: string
  architecture?: string[]
}

export type WorkProject = ProjectBase & {
  featured?: boolean
  subtitle?: string
  tags?: string[]
  role?: string
  period?: string
  challenges?: string[]
  contributions?: string[]
  outcomes?: string[]
  links?: { label: string; url?: string; href?: string }[]
}

export type LabProject = ProjectBase & {
  status?: string
  technologies?: string[]
  repositoryUrl?: string
  demoUrl?: string
  implemented?: string[]
  planned?: string[]
}

export type ExperienceContent = Introduction & {
  employmentTypes: Record<string, string>
  items: {
    id: string
    visible?: boolean
    position: string
    employmentType?: string
    startDate?: string
    endDate?: string | null
    current?: boolean
    company?: string
    companyUrl?: string
    location?: string
    summary?: string
    highlights?: string[]
    technologies?: string[]
  }[]
}

type PortfolioContent = {
  site: {
    defaultLocale: string
    supportedLocales: string[]
    navigation: { id: string; label: string; href: string }[]
    sections: { id: string; visible: boolean }[]
    seo: SeoCopy
    ui: Omit<typeof en.site.ui, 'status'> & { status: Record<string, string> }
    logoText: string
  }
  profile: {
    name: string
    headline?: string
    location?: string
    avatar?: string
    resume?: string
    socials: { github?: string; linkedin?: string; email?: string }
    availability?: { visible: boolean; label: string }
    hero: Introduction & {
      primaryAction?: Action
      secondaryAction?: Action
      primaryActionLabel?: string
      secondaryActionLabel?: string
    }
  }
  work: Introduction & { items: WorkProject[] }
  lab: Introduction & { items: LabProject[] }
  skills: Introduction & {
    categories: { id: string; visible?: boolean; title: string; items: string[] }[]
  }
  experience: ExperienceContent
  about: AboutContent
  contact: ContactContent
  footer: {
    showCurrentYear?: boolean
    showSocialLinks?: boolean
    showBackToTop?: boolean
    tagline?: string
    copyrightName?: string
    backToTopLabel?: string
    socialLabels: Record<'github' | 'linkedin' | 'email', string>
  }
}

export const content: Record<Locale, PortfolioContent> = { en, ar }

export const defaultLocale: Locale = en.site.defaultLocale === 'ar' ? 'ar' : 'en'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && Object.hasOwn(content, value)
}

const publicFiles = new Set(__PORTFOLIO_PUBLIC_FILES__)

export function publicAssetPath(value?: string): string | undefined {
  if (!value) return
  const path = value.replace(/^\/+/, '')
  if (publicFiles.has('/' + path)) return path
}

export function webUrl(value?: string): string | undefined {
  if (!value?.trim()) return
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href
  } catch {
    return undefined
  }
}

export function emailUrl(value?: string): string | undefined {
  const email = value?.trim().replace(/^mailto:/i, '')
  if (email && /^[^\s@?#]+@[^\s@?#]+\.[^\s@?#]+$/.test(email)) return `mailto:${email}`
}

export function presentItems<T extends { visible?: boolean }>(items: T[]): T[] {
  return items.filter((item) => item.visible !== false)
}

export function nonblank(items?: string[]): string[] {
  return items?.filter((item) => item.trim()) ?? []
}
