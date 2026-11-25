import { inject, type InjectionKey, type ShallowRef } from 'vue'
import type { Locale } from './seo'

export type PrerenderedPage = {
  locale: Locale
  year: number
}

export const renderContextKey: InjectionKey<{
  prerendered: ShallowRef<PrerenderedPage | undefined>
  assetUrl: (value?: string) => string | undefined
}> = Symbol('portfolio render context')

export function useRenderContext() {
  return inject(renderContextKey)!
}
