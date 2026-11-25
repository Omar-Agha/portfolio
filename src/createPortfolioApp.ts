import { createApp, createSSRApp, shallowRef } from 'vue'
import type { RouterHistory } from 'vue-router'
import App from './App.vue'
import { publicAssetPath } from './content'
import { renderContextKey, type PrerenderedPage } from './renderContext'
import { createPortfolioRouter } from './router'
import { localePaths, type Locale } from './seo'

function relativePath(locale: Locale, path: string) {
  return (locale === 'ar' ? '../' : './') + path
}

export function createPortfolioApp(history: RouterHistory, base: URL, entry?: PrerenderedPage) {
  const prerendered = shallowRef(entry)
  const browserHref = history.createHref
  // Keep the initial links portable and identical during hydration. The live router
  // restores the actual URL (including any query or hash) once the app is mounted.
  history.createHref = (fullPath) => {
    const page = prerendered.value
    if (!page) return browserHref(fullPath)

    const target = new URL(fullPath, base.origin)
    const path = target.pathname.replace(/index\.html$/, '')
    if (path === localePaths[page.locale] && target.hash) return target.hash
    return relativePath(page.locale, path.slice(1))
  }

  const router = createPortfolioRouter(history)
  const app = entry ? createSSRApp(App) : createApp(App)
  app.provide(renderContextKey, {
    prerendered,
    assetUrl(value) {
      const path = publicAssetPath(value)
      if (!path) return
      const page = prerendered.value
      return page ? relativePath(page.locale, path) : new URL(path, base).href
    },
  })
  app.use(router)
  return { app, router, prerendered }
}
