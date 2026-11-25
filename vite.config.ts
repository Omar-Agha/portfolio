import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import ar from './src/data/ar.json' with { type: 'json' }
import en from './src/data/en.json' with { type: 'json' }
import { canonicalUrls, pageMetadata, productionSiteUrl } from './src/seo.ts'

const publicDir = fileURLToPath(new URL('./public', import.meta.url))
const publicFiles = readdirSync(publicDir, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map(
    (entry) => `/${relative(publicDir, join(entry.parentPath, entry.name)).replaceAll('\\', '/')}`,
  )

const entry = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const arabicEntry = entry('./ar/index.html')
const alternateUrls = { ...canonicalUrls, 'x-default': canonicalUrls.en }

export default defineConfig({
  base: './',
  build: { rolldownOptions: { input: [entry('./index.html'), arabicEntry] } },
  define: { __PORTFOLIO_PUBLIC_FILES__: JSON.stringify(publicFiles) },
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'portfolio-metadata',
      transformIndexHtml: (_html, { filename }) => {
        const locale = filename === arabicEntry ? 'ar' : 'en'
        const metadata = pageMetadata(locale, (locale === 'ar' ? ar : en).site.seo)
        return [
          {
            tag: 'title',
            children: metadata.title.replaceAll('&', '&amp;').replaceAll('<', '&lt;'),
            injectTo: 'head',
          },
          {
            tag: 'link',
            attrs: { rel: 'canonical', href: metadata.canonical },
            injectTo: 'head',
          },
          ...Object.entries(alternateUrls).map(([hreflang, href]) => ({
            tag: 'link',
            attrs: { rel: 'alternate', hreflang, href },
            injectTo: 'head' as const,
          })),
          ...Object.entries(metadata.named).map(([name, content]) => ({
            tag: 'meta',
            attrs: { name, content },
            injectTo: 'head' as const,
          })),
          ...Object.entries(metadata.openGraph).map(([property, content]) => ({
            tag: 'meta',
            attrs: { property, content },
            injectTo: 'head' as const,
          })),
        ]
      },
      generateBundle() {
        const sitemapUrl = new URL('/sitemap.xml', productionSiteUrl)
        const entries = Object.values(canonicalUrls).map((url) => `  <url><loc>${url}</loc></url>`)
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...entries,
            '</urlset>',
            '',
          ].join('\n'),
        })
        this.emitFile({
          type: 'asset',
          fileName: 'robots.txt',
          source: `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl.href}\n`,
        })
        this.emitFile({
          type: 'asset',
          fileName: 'CNAME',
          source: `${productionSiteUrl.hostname}\n`,
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
