import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { build, type Plugin, type ResolvedConfig } from 'vite'
import { localePaths, type Locale } from '../src/seo.ts'

export function prerenderPortfolio(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'portfolio-prerender',
    apply: (_, { command, isSsrBuild }) => command === 'build' && !isSsrBuild,
    configResolved(resolved) {
      config = resolved
    },
    async writeBundle({ dir }) {
      const outputDir = resolve(config.root, dir ?? config.build.outDir)
      await mkdir(config.cacheDir, { recursive: true })
      const temporaryDir = await mkdtemp(join(config.cacheDir, 'portfolio-ssr-'))

      try {
        await build({
          configFile: false,
          root: config.root,
          mode: config.mode,
          plugins: [vue()],
          define: config.define,
          ssr: { noExternal: ['gsap'] },
          build: {
            ssr: resolve(config.root, 'src/entry-server.ts'),
            outDir: temporaryDir,
            copyPublicDir: false,
            rolldownOptions: { output: { entryFileNames: 'entry-server.mjs' } },
          },
        })

        const { renderPage } = (await import(
          pathToFileURL(join(temporaryDir, 'entry-server.mjs')).href
        )) as { renderPage: (locale: Locale, year: number) => Promise<string> }
        const year = new Date().getUTCFullYear()
        const outlet = '<div id="app"></div>'

        for (const locale of Object.keys(localePaths) as Locale[]) {
          const file = join(outputDir, localePaths[locale].slice(1), 'index.html')
          const html = await readFile(file, 'utf8')
          if (!html.includes(outlet)) throw new Error(`Missing prerender outlet in ${file}`)
          const body = await renderPage(locale, year)
          await writeFile(
            file,
            html.replace(outlet, () => `<div id="app" data-prerender-year="${year}">${body}</div>`),
          )
        }
      } finally {
        await rm(temporaryDir, { recursive: true, force: true })
      }
    },
  }
}
