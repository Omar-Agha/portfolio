<script setup lang="ts">
import { gsap } from 'gsap'
import { ref, useTemplateRef, watch, watchPostEffect } from 'vue'

const props = defineProps<{ src: string; mobileSrc?: string; alt: string }>()
const emit = defineEmits<{ unavailable: [src: string] }>()

// Positions and paths share a 100 × 100 grid so they stay aligned with the portrait crop.
const nodes = [
  { id: 'dotnet', x: 13, y: 17, corner: [24, 7], route: 'M24 7H18L13 12V17', duration: 7 },
  { id: 'docker', x: 15, y: 81, corner: [6, 94], route: 'M6 94V91L15 85V81', duration: 9 },
  { id: 'rabbitmq', x: 88, y: 44, corner: [95, 30], route: 'M95 30V36L88 41V44', duration: 8 },
]
const trailBands = 20
const portrait = useTemplateRef('portrait')
const nativeWidth = ref<number>()

watch([() => props.src, () => props.mobileSrc], () => {
  nativeWidth.value = undefined
})

function sizePortrait(event: Event) {
  if (event.currentTarget instanceof HTMLImageElement) {
    const { naturalWidth, naturalHeight } = event.currentTarget
    nativeWidth.value = Math.floor(Math.min(naturalWidth, naturalHeight * 0.8) / 1.25)
  }
}

function reportUnavailable(event: Event) {
  if (event.currentTarget instanceof HTMLImageElement) {
    emit('unavailable', event.currentTarget.currentSrc || event.currentTarget.src)
  }
}

watchPostEffect((onCleanup) => {
  const frame = portrait.value
  if (!frame || typeof IntersectionObserver === 'undefined') return

  const select = gsap.utils.selector(frame)
  const motion = gsap.matchMedia(frame)
  onCleanup(() => motion.revert())

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const animation = gsap.timeline({ paused: true })
    animation
      .to(
        select('.portrait-panel'),
        {
          y: -3,
          duration: 4.6,
          stagger: { each: 0.85, repeat: -1, yoyo: true },
          ease: 'sine.inOut',
        },
        0,
      )
      .to(
        select('.portrait-ambient'),
        {
          opacity: 0.82,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        },
        0,
      )

    if (CSS.supports('offset-path', 'path("M0 0H1")')) {
      select<SVGCircleElement>('.portrait-signal').forEach((signal, index) => {
        const duration = Number(signal.dataset.duration)
        const travel = gsap.timeline({ repeat: -1, repeatDelay: 2, defaults: { ease: 'none' } })
        travel
          .fromTo(signal, { offsetDistance: '0%' }, { offsetDistance: '100%', duration }, 0)
          .fromTo(signal, { opacity: 0 }, { opacity: 0.85, duration: 0.9 }, 0)
          .to(signal, { opacity: 0, duration: 1.2 }, duration - 1.2)
        animation.add(travel, index * 1.6)
      })
    }

    if (CSS.supports('offset-path', 'inset(0 round 1px)')) {
      const orbit = select('.portrait-orbit')
      const lap = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } })
      lap
        .fromTo(orbit, { '--lap-progress': 0 }, { '--lap-progress': 100, duration: 10 }, 0)
        .fromTo(orbit, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0)
        .to(orbit, { opacity: 0, duration: 1.2 }, 8.8)
      animation.add(lap, 0)
    }

    const observer = new IntersectionObserver(([entry]) => {
      animation.paused(!entry?.isIntersecting)
    })
    observer.observe(frame)
    return () => observer.disconnect()
  })
})
</script>

<template>
  <figure
    ref="portrait"
    class="portrait"
    :style="{ '--portrait-native-width': nativeWidth ? `${nativeWidth}px` : undefined }"
  >
    <div class="portrait-window">
      <picture>
        <source
          v-if="mobileSrc && mobileSrc !== src"
          media="(max-width: 47rem)"
          :srcset="mobileSrc"
        />
        <img
          :src="src"
          :alt="alt"
          loading="lazy"
          decoding="async"
          @load="sizePortrait"
          @error="reportUnavailable"
        />
      </picture>
      <!-- Keep the overlay anchored to the photograph's asymmetrical composition in both locales. -->
      <div class="portrait-decoration" dir="ltr" aria-hidden="true">
        <span class="portrait-ambient"></span>
        <svg
          class="portrait-network"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          focusable="false"
        >
          <g v-for="node in nodes" :key="node.id">
            <path class="portrait-route" :d="node.route" vector-effect="non-scaling-stroke" />
            <circle class="portrait-junction" :cx="node.corner[0]" :cy="node.corner[1]" r="0.48" />
            <circle
              class="portrait-signal"
              r="0.58"
              :data-duration="node.duration"
              :style="{ offsetPath: `path('${node.route}')` }"
            />
          </g>
        </svg>

        <span
          v-for="node in nodes"
          :key="node.id"
          class="portrait-node"
          :style="{ insetInlineStart: `${node.x}%`, insetBlockStart: `${node.y}%` }"
        >
          <span class="portrait-panel">
            <svg viewBox="0 0 24 24" focusable="false">
              <text
                v-if="node.id === 'dotnet'"
                x="12"
                y="15.5"
                text-anchor="middle"
                class="portrait-wordmark"
              >
                .NET
              </text>
              <path
                v-else-if="node.id === 'docker'"
                d="M6 7h3v3H6zm4 0h3v3h-3zm4 0h3v3h-3zm-4-4h3v3h-3zm-8 8h16.5c.6-.7.8-1.7.8-2.8 1.1.4 1.8 1.1 2 2 .7 0 1.5.2 2 .6-.6 1.3-1.6 1.8-3.2 1.8C18.2 17.3 14.3 20 9.4 20 4.8 20 2 17.2 2 12.4z"
              />
              <path
                v-else
                fill-rule="evenodd"
                d="M4 2h3a1 1 0 0 1 1 1v7h2V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7h5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm11 12v4h4v-4z"
              />
            </svg>
          </span>
        </span>
      </div>
    </div>

    <span class="portrait-orbit" aria-hidden="true">
      <svg class="portrait-trail" focusable="false">
        <rect
          v-for="band in trailBands"
          :key="band"
          width="100%"
          height="100%"
          pathLength="100"
          :style="{ '--trail-length': (band / trailBands) * 5 }"
        />
      </svg>
      <span class="portrait-dot"></span>
    </span>
  </figure>
</template>

<style scoped>
.portrait {
  --portrait-border: 1px;
  --portrait-radius: 0.8rem;
  position: relative;
  grid-column: 2;
  grid-row: 1;
  align-self: center;
  justify-self: start;
  inline-size: min(100%, 27.5rem, var(--portrait-native-width, 27.5rem));
  padding: 0.45rem;
  border: var(--portrait-border) solid var(--line-strong);
  border-radius: var(--portrait-radius);
  background: var(--surface);
}

.portrait-window {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 0.45rem;
  background: var(--background);
}

.portrait-window picture {
  display: block;
  block-size: 100%;
}

.portrait-window img {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
  object-position: 50% 28%;
  scale: 1.25;
  transform-origin: 50% 38%;
}

.portrait-decoration,
.portrait-network,
.portrait-ambient {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  pointer-events: none;
}

.portrait-ambient {
  background:
    radial-gradient(
      ellipse at 12% 17%,
      color-mix(in srgb, var(--accent) 13%, transparent),
      transparent 29%
    ),
    radial-gradient(
      ellipse at 88% 44%,
      color-mix(in srgb, var(--accent) 10%, transparent),
      transparent 26%
    );
  opacity: 0.48;
}

.portrait-route {
  fill: none;
  stroke: var(--accent);
  stroke-opacity: 0.3;
  stroke-width: 1;
  stroke-linejoin: round;
}

.portrait-junction,
.portrait-signal {
  fill: var(--accent);
}

.portrait-junction {
  opacity: 0.48;
}

.portrait-signal {
  opacity: 0;
  offset-anchor: center;
  offset-distance: 0%;
  offset-rotate: 0deg;
  transform-box: fill-box;
  filter: drop-shadow(0 0 2px var(--accent));
}

.portrait-node {
  position: absolute;
  translate: -50% -50%;
}

.portrait-panel {
  display: grid;
  place-items: center;
  inline-size: clamp(2.1rem, 5.6vw, 3.1rem);
  aspect-ratio: 1;
  border: 1px solid var(--accent-line);
  border-radius: 0.38rem;
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  color: var(--accent);
}

.portrait-panel svg {
  inline-size: 57%;
  fill: currentColor;
}

.portrait-wordmark {
  font-family: var(--font-body);
  font-size: 9px;
  font-weight: 700;
}

.portrait-orbit {
  --lap-progress: 0;
  --track-radius: calc(var(--portrait-radius) - var(--portrait-border) / 2);
  position: absolute;
  z-index: 1;
  inset: calc(var(--portrait-border) / -2);
  pointer-events: none;
  opacity: 0;
}

.portrait-trail {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  overflow: visible;
}

.portrait-trail rect {
  rx: var(--track-radius);
  ry: var(--track-radius);
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.75px;
  stroke-linecap: round;
  stroke-opacity: 0.032;
  stroke-dasharray: var(--trail-length) calc(100 - var(--trail-length));
  stroke-dashoffset: calc(var(--trail-length) - var(--lap-progress));
}

.portrait-dot {
  position: absolute;
  inset: 0 auto auto 0;
  inline-size: 5.5px;
  block-size: 5.5px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 6px 1px color-mix(in srgb, var(--accent) 45%, transparent);
  offset-path: inset(0 round var(--track-radius));
  offset-distance: calc(var(--lap-progress) * 1%);
  offset-anchor: center;
  offset-rotate: 0deg;
}

@media (max-width: 47rem) {
  .portrait {
    grid-column: auto;
    grid-row: auto;
    inline-size: min(100%, 22rem, var(--portrait-native-width, 22rem));
  }
  .portrait-window {
    aspect-ratio: 5 / 4;
  }
}
</style>
