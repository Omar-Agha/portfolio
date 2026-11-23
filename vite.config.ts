import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import ar from './src/data/ar.json' with { type: 'json' }
import en from './src/data/en.json' with { type: 'json' }

const publicDir = fileURLToPath(new URL('./public', import.meta.url))
const publicFiles = readdirSync(publicDir, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map(
    (entry) => `/${relative(publicDir, join(entry.parentPath, entry.name)).replaceAll('\\', '/')}`,
  )

const entry = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const arabicEntry = entry('./ar/index.html')

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
        const arabic = filename === arabicEntry
        const { title, description } = (arabic ? ar : en).site.seo
        return [
          { tag: 'title', children: title, injectTo: 'head' },
          { tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' },
          {
            tag: 'meta',
            attrs: { property: 'og:description', content: description },
            injectTo: 'head',
          },
          { tag: 'meta', attrs: { property: 'og:type', content: 'website' }, injectTo: 'head' },
          {
            tag: 'meta',
            attrs: { property: 'og:locale', content: arabic ? 'ar_SY' : 'en_US' },
            injectTo: 'head',
          },
        ]
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
