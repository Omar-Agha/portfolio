<script setup lang="ts">
import { computed, ref, useTemplateRef, watchEffect } from 'vue'

const props = withDefaults(
  defineProps<{
    intensity?: number
    speed?: number
    count?: number
    color?: string
    animated?: boolean
  }>(),
  { intensity: 0.08, speed: 1, count: 3, animated: true },
)

const glows = [
  {
    inline: 29,
    block: 28,
    width: 57,
    height: 60,
    x: 8,
    y: 10,
    strength: 1,
    duration: 40,
    delay: 5,
  },
  {
    inline: 72,
    block: 66,
    width: 53,
    height: 66,
    x: -11,
    y: -10,
    strength: 0.82,
    duration: 53,
    delay: 23,
  },
  {
    inline: 77,
    block: 29,
    width: 29,
    height: 34,
    x: 10,
    y: 15,
    strength: 0.58,
    duration: 47,
    delay: 38,
  },
  {
    inline: 26,
    block: 76,
    width: 27,
    height: 39,
    x: -8,
    y: -12,
    strength: 0.52,
    duration: 61,
    delay: 16,
  },
]

const glowStyles = computed(() => {
  const count = Math.max(0, Math.min(glows.length, Math.floor(props.count)))
  const speed = Math.max(0.25, Math.min(2, props.speed))

  return glows.slice(0, count).map((glow) => ({
    insetInlineStart: `${glow.inline}%`,
    insetBlockStart: `${glow.block}%`,
    inlineSize: `${glow.width}%`,
    blockSize: `${glow.height}%`,
    '--glow-x': `${glow.x}%`,
    '--glow-y': `${glow.y}%`,
    '--glow-strength': glow.strength,
    animationDuration: `${glow.duration / speed}s`,
    animationDelay: `${-glow.delay / speed}s`,
  }))
})
const background = useTemplateRef('background')
const visible = ref(false)

watchEffect(
  (onCleanup) => {
    const element = background.value
    if (!element || !props.animated || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(([entry]) => {
      visible.value = entry?.isIntersecting ?? false
    })
    observer.observe(element)
    onCleanup(() => {
      observer.disconnect()
      visible.value = false
    })
  },
  { flush: 'post' },
)
</script>

<template>
  <div
    ref="background"
    class="ambient-background"
    :class="{ 'ambient-background--animated': animated, 'ambient-background--visible': visible }"
    :style="{
      '--ambient-color': color,
      '--ambient-intensity': Math.max(0, Math.min(1, intensity)),
    }"
    aria-hidden="true"
  >
    <span v-for="(style, index) in glowStyles" :key="index" class="ambient-glow" :style="style" />
  </div>
</template>

<style scoped>
.ambient-background {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: clip;
  pointer-events: none;
}

.ambient-glow {
  --inline-direction: 1;
  --glow-opacity: calc(var(--ambient-intensity) * var(--glow-strength));
  --glow-color: var(--ambient-color, var(--accent, #d1ef9b));
  position: absolute;
  translate: -50% -50%;
  opacity: var(--glow-opacity);
  background: radial-gradient(ellipse closest-side, var(--glow-color), transparent);
}

.ambient-glow:dir(rtl) {
  --inline-direction: -1;
  translate: 50% -50%;
}

@media (prefers-reduced-motion: no-preference) {
  .ambient-background--animated .ambient-glow {
    animation-name: ambient-drift;
    animation-timing-function: ease-in-out;
    animation-direction: alternate;
    animation-iteration-count: infinite;
    animation-play-state: paused;
  }

  .ambient-background--visible .ambient-glow {
    animation-play-state: running;
  }
}

@keyframes ambient-drift {
  0% {
    transform: translate(0, 0);
    opacity: calc(var(--glow-opacity) * 0.74);
  }
  45% {
    transform: translate(
        calc(var(--glow-x) * var(--inline-direction) * 0.28),
        calc(var(--glow-y) * 0.7)
      )
      scale(1.04);
    opacity: var(--glow-opacity);
  }
  100% {
    transform: translate(calc(var(--glow-x) * var(--inline-direction)), var(--glow-y));
    opacity: calc(var(--glow-opacity) * 0.88);
  }
}
</style>
