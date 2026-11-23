<script setup lang="ts">
defineProps<{ projectId: string }>()
</script>

<template>
  <span class="lab-glyph" aria-hidden="true">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.35"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      <g v-if="projectId === 'microservices-template'">
        <path d="M12 8v4m-6 4v-4h12v4" />
        <rect x="9" y="2.5" width="6" height="5.5" rx="0.75" />
        <rect x="3" y="16" width="6" height="5.5" rx="0.75" />
        <rect x="15" y="16" width="6" height="5.5" rx="0.75" />
      </g>
      <g v-else-if="projectId === '7ake'">
        <path
          d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5M12 12 4 7.5M12 12v9M8 5.25l8 4.5v3"
        />
      </g>
      <g v-else-if="projectId === 'spring-boot'">
        <rect x="3" y="4" width="18" height="12" rx="1.25" />
        <path d="m9 7-3 3 3 3m6-6 3 3-3 3M5 20h14" />
      </g>
      <g v-else>
        <path d="m12 3 9 9-9 9-9-9 9-9Z" />
        <path d="m12 9 3 3-3 3-3-3 3-3Z" fill="currentColor" stroke="none" />
      </g>
    </svg>
  </span>
</template>
