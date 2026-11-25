import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory } from 'vue-router'
import { createPortfolioApp } from './createPortfolioApp'
import { localePaths, productionSiteUrl, type Locale } from './seo'

export async function renderPage(locale: Locale, year: number) {
  const { app, router } = createPortfolioApp(createMemoryHistory(), productionSiteUrl, {
    locale,
    year,
  })
  await router.push(localePaths[locale])
  await router.isReady()
  return renderToString(app)
}
