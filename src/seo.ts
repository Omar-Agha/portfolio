export const productionSiteUrl = new URL('https://omar-agha.is-a.dev')

export const localePaths = { en: '/', ar: '/ar/' }
export type Locale = keyof typeof localePaths

export const canonicalUrls = {
  en: new URL(localePaths.en, productionSiteUrl).href,
  ar: new URL(localePaths.ar, productionSiteUrl).href,
}

export type SeoCopy = { title: string; description: string }

export function pageMetadata(locale: Locale, { title, description }: SeoCopy) {
  const canonical = canonicalUrls[locale]
  return {
    title,
    canonical,
    named: { description, 'twitter:card': 'summary' },
    openGraph: {
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:locale': locale === 'ar' ? 'ar_SY' : 'en_US',
      'og:url': canonical,
    },
  }
}
