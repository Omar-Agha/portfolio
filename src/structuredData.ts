import { canonicalUrls, productionSiteUrl, type Locale, type SeoCopy } from './seo.ts'

type StructuredDataCopy = {
  site: { seo: SeoCopy; sections: readonly { id: string; visible: boolean }[] }
  profile: {
    name: string
    headline?: string
    avatar?: string
    socials: { github?: string; linkedin?: string }
  }
  about: { profileAvatar?: string | { lg?: string; sm?: string } }
  skills: { categories: readonly { visible?: boolean; items: readonly string[] }[] }
}

export const portfolioJsonLdId = 'portfolio-json-ld'

const personId = new URL('#person', productionSiteUrl).href
const websiteId = new URL('#website', productionSiteUrl).href

export function portfolioJsonLd(
  locale: Locale,
  { site, profile, about, skills }: StructuredDataCopy,
  websiteName: string,
  hasPublicAsset: (path: string) => boolean,
) {
  const canonical = canonicalUrls[locale]
  const avatar = about.profileAvatar
  const portrait = [
    typeof avatar === 'string' ? avatar : avatar?.lg,
    typeof avatar === 'object' ? avatar?.sm : undefined,
    profile.avatar,
  ]
    .map((path) => path && '/' + path.replace(/^\/+/, ''))
    .find((path) => path && hasPublicAsset(path))
  const sameAs = [profile.socials.github, profile.socials.linkedin].flatMap((value) => {
    if (!value?.trim()) return []
    try {
      const url = new URL(value)
      return ['https:', 'http:'].includes(url.protocol) ? [url.href] : []
    } catch {
      return []
    }
  })
  const topics = site.sections.some(({ id, visible }) => id === 'skills' && visible)
    ? skills.categories.filter(({ visible }) => visible !== false).flatMap(({ items }) => items)
    : []
  const knowsAbout = [...new Set(topics.map((item) => item.trim()).filter(Boolean))]

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: profile.name,
        jobTitle: profile.headline?.split('|', 1)[0]?.trim() || undefined,
        description: site.seo.description,
        url: canonicalUrls.en,
        image: portrait ? new URL(portrait, productionSiteUrl).href : undefined,
        sameAs,
        knowsAbout,
      },
      {
        '@type': 'ProfilePage',
        '@id': new URL('#profile-page', canonical).href,
        url: canonical,
        name: site.seo.title,
        description: site.seo.description,
        inLanguage: locale,
        mainEntity: { '@id': personId },
        isPartOf: { '@id': websiteId },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: websiteName,
        url: canonicalUrls.en,
        publisher: { '@id': personId },
      },
    ],
  }

  // Escape script delimiters and Vite's HTML replacement tokens inside text values.
  return JSON.stringify(graph).replaceAll('<', '\\u003c').replaceAll('$', '\\u0024')
}
