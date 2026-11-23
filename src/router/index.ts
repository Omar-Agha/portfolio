import { createRouter, createWebHistory } from 'vue-router'
import { siteBase, localePaths } from '../content'
import PortfolioView from '../views/PortfolioView.vue'

const router = createRouter({
  history: createWebHistory(siteBase.pathname),
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
    { path: '/:pathMatch(.*)*', redirect: (to) => ({ path: '/', query: to.query, hash: to.hash }) },
  ],
  scrollBehavior(to, from, savedPosition) {
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

export default router
