import en from './data/en.json' with { type: 'json' }

export const productionSiteUrl = new URL('https://omar-agha.is-a.dev')

export const localePaths = { en: '/', ar: '/ar/' }
export type Locale = keyof typeof localePaths

export const canonicalUrls = {
  en: new URL(localePaths.en, productionSiteUrl).href,
  ar: new URL(localePaths.ar, productionSiteUrl).href,
}

export type SeoCopy = { title: string; description: string; socialImageAlt: string }

const socialImageUrl = new URL('/images/og-cover.jpg', productionSiteUrl).href
const openGraphLocales: Record<Locale, string> = { en: 'en_US', ar: 'ar_SY' }

export function pageMetadata(locale: Locale, { title, description, socialImageAlt }: SeoCopy) {
  const canonical = canonicalUrls[locale]
  return {
    title,
    canonical,
    named: {
      description,
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': socialImageUrl,
      'twitter:image:alt': socialImageAlt,
    },
    openGraph: {
      'og:type': 'website',
      'og:site_name': en.profile.name,
      'og:title': title,
      'og:description': description,
      'og:url': canonical,
      'og:locale': openGraphLocales[locale],
      'og:locale:alternate': openGraphLocales[locale === 'en' ? 'ar' : 'en'],
      'og:image': socialImageUrl,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/jpeg',
      'og:image:alt': socialImageAlt,
    },
  }
}
