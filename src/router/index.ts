import { createRouter, type RouterHistory } from 'vue-router'
import { localePaths } from '../seo'
import PortfolioView from '../views/PortfolioView.vue'

export function createPortfolioRouter(history: RouterHistory) {
  return createRouter({
    history,
    routes: [
      {
        path: localePaths.en,
        alias: '/index.html',
        component: PortfolioView,
        meta: { locale: 'en' },
      },
      {
        path: localePaths.ar,
        alias: '/ar/index.html',
        component: PortfolioView,
        meta: { locale: 'ar' },
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: (to) => ({ path: '/', query: to.query, hash: to.hash }),
      },
    ],
    scrollBehavior(to, from, savedPosition) {
      if (import.meta.env.SSR) return false
      if (savedPosition) return savedPosition
      if (!to.hash || to.hash === from.hash) return false

      const target = document.getElementById(to.hash.slice(1))
      if (!target) return false

      target.focus({ preventScroll: true })
      const top = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
      const smooth =
        Boolean(from.matched.length) && !matchMedia('(prefers-reduced-motion: reduce)').matches
      return { el: target, top, behavior: smooth ? 'smooth' : 'instant' }
    },
  })
}
