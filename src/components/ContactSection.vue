<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import type { ContactContent } from '../content'
import ContactNetwork from './ContactNetwork.vue'
import SectionIntro from './SectionIntro.vue'

const props = defineProps<{
  contact: ContactContent
  links: { email?: string; linkedin?: string; github?: string }
}>()

const actions = computed(() =>
  [
    {
      variant: 'primary',
      action: props.contact.primaryAction,
      label: props.contact.primaryActionLabel,
    },
    {
      variant: 'secondary',
      action: props.contact.secondaryAction,
      label: props.contact.secondaryActionLabel,
    },
  ].flatMap(({ variant, action, label }) => {
    const type = action?.type
    if (type !== 'email' && type !== 'linkedin' && type !== 'github') return []

    const href = props.links[type]
    return label?.trim() && href ? [{ variant, label, href, type }] : []
  }),
)

const email = computed(() => props.links.email?.replace(/^mailto:/i, ''))
const copyStatus = ref<'idle' | 'copied' | 'failed'>('idle')
const feedback = computed(() =>
  copyStatus.value === 'copied'
    ? props.contact.emailCopied
    : copyStatus.value === 'failed'
      ? props.contact.emailCopyFailed
      : '',
)
watch(email, () => {
  copyStatus.value = 'idle'
})

async function copyEmail() {
  const address = email.value
  if (!address) return

  try {
    await navigator.clipboard.writeText(address)
    if (email.value === address) copyStatus.value = 'copied'
  } catch {
    if (email.value === address) copyStatus.value = 'failed'
  }
}

const section = useTemplateRef('section')
let observer: IntersectionObserver | undefined
onMounted(() => {
  const element = section.value
  if (!element || typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(([entry]) => {
    element.classList.toggle('contact-section--in-view', entry?.isIntersecting ?? false)
  })
  observer.observe(element)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section id="contact" ref="section" class="shell portfolio-section contact-section" tabindex="-1">
    <div class="contact-copy">
      <SectionIntro :eyebrow="contact.eyebrow" :title="contact.title" />
      <p v-if="contact.availability" class="contact-availability">
        <span class="contact-availability-dot" aria-hidden="true"></span>
        {{ contact.availability }}
      </p>
      <p v-if="contact.description" class="contact-description">{{ contact.description }}</p>
      <div v-if="actions.length" class="contact-actions flex flex-wrap gap-3">
        <a
          v-for="action in actions"
          :key="action.variant"
          :href="action.href"
          class="button"
          :target="action.type === 'email' ? undefined : '_blank'"
          :rel="action.type === 'email' ? undefined : 'noopener noreferrer'"
          :class="action.variant === 'primary' ? 'button--primary' : 'button--outline'"
        >
          <svg v-if="action.type === 'email'" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </svg>
          <svg v-else-if="action.type === 'linkedin'" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M8 11v5m0-8v.1M12 16v-5m0 2a2 2 0 0 1 4 0v3" />
          </svg>
          <span>{{ action.label }}</span>
          <svg
            v-if="action.type !== 'email'"
            class="contact-action-arrow"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M7 17 17 7M7 7h10v10" />
          </svg>
          <span v-if="action.type !== 'email' && contact.opensInNewTab" class="sr-only">
            {{ contact.opensInNewTab }}
          </span>
        </a>
      </div>
      <div v-if="email" class="contact-address">
        <div class="contact-address-row">
          <bdi class="contact-email" dir="ltr">{{ email }}</bdi>
          <button
            v-if="contact.copyEmailLabel"
            type="button"
            class="contact-copy-button"
            @click="copyEmail"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path v-if="copyStatus === 'copied'" d="m5 12 4 4L19 6" />
              <template v-else>
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
              </template>
            </svg>
            {{ contact.copyEmailLabel }}
          </button>
        </div>
        <p v-if="contact.copyEmailLabel" class="contact-copy-feedback" role="status">
          {{ feedback }}
        </p>
      </div>
    </div>
    <ContactNetwork />
  </section>
</template>
