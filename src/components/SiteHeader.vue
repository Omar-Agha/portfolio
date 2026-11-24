<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { content, isLocale, localePaths, type Locale } from '../content'
import ProfileMark from './ProfileMark.vue'

const props = defineProps<{
  locale: Locale
  sections: readonly { id: string }[]
  avatar?: string
  activeSectionId?: string
}>()

const emit = defineEmits<{ activateAnchor: [hash: string] }>()

const route = useRoute()
const site = computed(() => content[props.locale].site)
const profile = computed(() => content[props.locale].profile)
const navigation = computed(() =>
  site.value.navigation.filter((item) => props.sections.some((section) => section.id === item.id)),
)
const alternate = computed(() =>
  site.value.supportedLocales.find((code) => isLocale(code) && code !== props.locale),
)
const languageNames = { en: 'English', ar: 'العربية' }
const labels = computed(() =>
  props.locale === 'ar'
    ? { menu: 'القائمة', navigation: 'التنقل الرئيسي' }
    : { menu: 'Menu', navigation: 'Main navigation' },
)

const element = useTemplateRef('header')
const menuOpen = ref(false)
const menuButton = useTemplateRef('menuButton')
const navigationElement = useTemplateRef('navigationElement')

async function toggleMenu() {
  if (menuOpen.value) {
    closeMenu()
    return
  }
  menuOpen.value = true
  await nextTick()
  navigationElement.value?.querySelector('a')?.focus()
}

function closeMenu() {
  if (!menuOpen.value) return
  menuOpen.value = false
  menuButton.value?.focus()
}

defineExpose({ element, closeMenu })
</script>

<template>
  <header ref="header" class="site-header" @keydown.esc="closeMenu">
    <div class="shell masthead flex items-center justify-between">
      <RouterLink
        :to="{ query: route.query, hash: '#top' }"
        class="brand flex items-center"
        :aria-label="profile.name || site.logoText"
        @click="emit('activateAnchor', '#top')"
      >
        <ProfileMark class="brand-mark" mode="image" :text="site.logoText" :image-src="avatar" />
        <span v-if="profile.name" class="brand-name">{{ profile.name }}</span>
      </RouterLink>
      <nav
        v-if="navigation.length"
        id="site-navigation"
        ref="navigationElement"
        class="site-nav"
        :class="{ 'site-nav--open': menuOpen }"
        :aria-label="labels.navigation"
      >
        <RouterLink
          v-for="item in navigation"
          :key="item.id"
          :to="{ query: route.query, hash: item.href }"
          :class="{ 'nav-current': activeSectionId === item.id }"
          :aria-current="activeSectionId === item.id ? 'location' : undefined"
          @click="emit('activateAnchor', item.href)"
          >{{ item.label }}</RouterLink
        >
      </nav>
      <div class="masthead-actions flex items-center gap-2">
        <RouterLink
          v-if="isLocale(alternate)"
          :to="{ path: localePaths[alternate], query: route.query, hash: route.hash }"
          class="language-button"
          :lang="alternate"
          :hreflang="alternate"
          @click="menuOpen = false"
          >{{ languageNames[alternate] }}</RouterLink
        >
        <button
          v-if="navigation.length"
          ref="menuButton"
          type="button"
          class="icon-button menu-button"
          :aria-expanded="menuOpen"
          aria-controls="site-navigation"
          :aria-label="menuOpen ? site.ui.close : labels.menu"
          @click="toggleMenu"
        >
          <span class="menu-icon" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </header>
</template>
