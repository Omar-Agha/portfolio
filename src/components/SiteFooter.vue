<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { content, type Locale } from '../content'
import { useRenderContext } from '../renderContext'
import ProfileMark from './ProfileMark.vue'

const props = defineProps<{
  locale: Locale
  avatar?: string
  links: { github?: string; linkedin?: string; email?: string }
}>()

const emit = defineEmits<{ activateAnchor: [hash: string] }>()

const route = useRoute()
const { prerendered } = useRenderContext()
const copy = computed(() => content[props.locale])
const profile = computed(() => copy.value.profile)
const footer = computed(() => copy.value.footer)

const socialLinks = computed(() =>
  (['github', 'linkedin', 'email'] as const).flatMap((id) => {
    const href = props.links[id]
    const label = footer.value.socialLabels[id]
    return href && label ? [{ id, label, href }] : []
  }),
)

const copyright = computed(() => {
  const { showCurrentYear, copyrightName } = footer.value
  const year = showCurrentYear
    ? new Intl.NumberFormat(props.locale, { useGrouping: false }).format(
        prerendered.value?.year ?? new Date().getFullYear(),
      )
    : ''
  return [year, copyrightName?.trim()].filter(Boolean).join(' ')
})
</script>

<template>
  <footer class="site-footer">
    <div class="shell footer-content">
      <div>
        <div class="footer-brand flex items-center gap-3">
          <ProfileMark
            class="brand-mark"
            mode="image"
            :text="copy.site.logoText"
            :image-src="avatar"
          />
          <div>
            <p v-if="profile.name" class="brand-name">{{ profile.name }}</p>
            <p v-if="footer.tagline" class="footer-tagline">{{ footer.tagline }}</p>
          </div>
        </div>
        <p v-if="copyright" class="copyright">
          <bdi dir="ltr">© {{ copyright }}</bdi>
        </p>
      </div>
      <div class="footer-end">
        <div
          v-if="footer.showSocialLinks && socialLinks.length"
          class="footer-links flex flex-wrap gap-x-5 gap-y-1"
        >
          <a v-for="link in socialLinks" :key="link.id" :href="link.href" target="_blank">
            <svg v-if="link.id === 'github'" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="6" cy="6" r="2.5" />
              <circle cx="6" cy="18" r="2.5" />
              <circle cx="18" cy="6" r="2.5" />
              <path d="M6 8.5v7m0 0c0-6 12-2 12-7" />
            </svg>
            <svg v-else-if="link.id === 'linkedin'" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8 11v5m0-8v.1M12 16v-5m0 2a2 2 0 0 1 4 0v3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <bdi>{{ link.label }}</bdi>
          </a>
        </div>
        <RouterLink
          v-if="footer.showBackToTop && footer.backToTopLabel"
          class="footer-top"
          :to="{ path: route.path, query: route.query, hash: '#top' }"
          @click="emit('activateAnchor', '#top')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-5 5 5-5 5 5" /></svg>
          <span>{{ footer.backToTopLabel }}</span>
        </RouterLink>
      </div>
    </div>
  </footer>
</template>
