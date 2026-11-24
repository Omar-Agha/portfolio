<script setup lang="ts">
import { computed } from 'vue'
import type { ContactContent } from '../content'
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
    return label?.trim() && href ? [{ variant, label, href }] : []
  }),
)
</script>

<template>
  <section id="contact" class="shell portfolio-section contact-section" tabindex="-1">
    <div class="contact-panel">
      <SectionIntro
        :eyebrow="contact.eyebrow"
        :title="contact.title"
        :description="contact.description"
      />
      <div v-if="actions.length" class="contact-actions flex flex-wrap gap-3">
        <a
          v-for="action in actions"
          :key="action.variant"
          :href="action.href"
          class="button"
          target="_blank"
          :class="action.variant === 'primary' ? 'button--primary' : 'button--outline'"
          >{{ action.label }}</a
        >
      </div>
    </div>
  </section>
</template>
