import './assets/main.css'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createWebHistory } from 'vue-router'
import { createPortfolioApp } from './createPortfolioApp'
import type { PrerenderedPage } from './renderContext'

gsap.registerPlugin(ScrollTrigger)

const root = document.getElementById('app')!
const locale = document.documentElement.lang === 'ar' ? 'ar' : 'en'
const year = root.dataset.prerenderYear
const page: PrerenderedPage | undefined = year ? { locale, year: Number(year) } : undefined
const base = new URL(
  import.meta.env.BASE_URL === './' && locale === 'ar' ? '../' : import.meta.env.BASE_URL,
  document.baseURI,
)

const { app, router, prerendered } = createPortfolioApp(createWebHistory(base.pathname), base, page)

if (page) {
  void router.isReady().then(() => {
    app.mount(root)
    prerendered.value = undefined
  })
} else {
  app.mount(root)
}
