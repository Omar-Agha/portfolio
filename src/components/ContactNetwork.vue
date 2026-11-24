<script setup lang="ts">
import { useId } from 'vue'

const gridId = useId()
const supportsSignals = typeof CSS !== 'undefined' && typeof CSS.registerProperty === 'function'
const trailBands = 12
const routes = [
  { path: 'M52 104H156V52H286V104H390V208H260V260H130V208H52Z', duration: 19, delay: -4 },
  { path: 'M156 156H338V130H442V234H364V312H208V260H156Z', duration: 17, delay: -10 },
  { path: 'M104 234H208V182H286V234H338V338H156V286H104Z', duration: 15, delay: -8 },
  { path: 'M234 78H416V156H468V260H390V208H312V156H234Z', duration: 21, delay: -3 },
]

const nodes = [
  [52, 104],
  [104, 234],
  [130, 208],
  [156, 52],
  [156, 104],
  [156, 156],
  [156, 286],
  [208, 182],
  [208, 234],
  [234, 78],
  [260, 208],
  [286, 104],
  [286, 182],
  [286, 234],
  [312, 156],
  [338, 130],
  [338, 312],
  [364, 234],
  [390, 208],
  [416, 156],
  [442, 234],
]
</script>

<template>
  <svg class="contact-network" viewBox="0 0 520 390" aria-hidden="true" focusable="false">
    <defs>
      <pattern :id="gridId" width="26" height="26" patternUnits="userSpaceOnUse">
        <path class="network-grid-line" d="M26 0H0V26" />
      </pattern>
    </defs>
    <rect width="520" height="390" :fill="`url(#${gridId})`" />
    <g class="network-routes">
      <path v-for="route in routes" :key="route.path" :d="route.path" />
      <path
        class="network-branches"
        d="M26 156H78V104M156 52H104V26M286 52H338V78M442 130H494M338 338V364M104 286H78V312H156"
      />
    </g>
    <g class="network-nodes">
      <circle v-for="[x, y] in nodes" :key="`${x}-${y}`" :cx="x" :cy="y" r="2.5" />
    </g>
    <template v-if="supportsSignals">
      <g
        v-for="(route, index) in routes"
        :key="route.path"
        class="network-signal"
        :class="{ 'network-signal--extra': index === routes.length - 1 }"
        :style="{
          '--signal-path': `path('${route.path}')`,
          '--signal-duration': `${route.duration}s`,
          '--signal-delay': `${route.delay}s`,
        }"
      >
        <path
          v-for="band in trailBands"
          :key="band"
          class="network-trail"
          :d="route.path"
          pathLength="100"
          :style="{ '--trail-length': (band / trailBands) * 4.5 }"
        />
        <circle class="network-signal-head" r="2.55" />
      </g>
    </template>
  </svg>
</template>

<style scoped>
@property --contact-journey {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

.contact-network {
  display: block;
  inline-size: min(100%, 34rem);
  aspect-ratio: 4 / 3;
  justify-self: center;
  pointer-events: none;
  mask-image: radial-gradient(ellipse, #000 28%, #000 46%, #0009 65%, transparent 80%);
}

.contact-network:dir(rtl) {
  scale: -1 1;
}

.network-grid-line,
.network-routes,
.network-trail {
  fill: none;
  stroke: var(--accent);
}

.network-grid-line {
  stroke-opacity: 0.09;
  stroke-width: 0.7;
}

.network-routes {
  stroke-opacity: 0.24;
  stroke-width: 1;
}

.network-branches {
  opacity: 0.56;
}

.network-nodes {
  fill: var(--background);
  stroke: var(--accent);
  stroke-opacity: 0.43;
  stroke-width: 1;
}

.network-signal {
  display: none;
}

@media (prefers-reduced-motion: no-preference) {
  @supports (offset-path: path('M0 0H1')) {
    .network-signal {
      display: inline;
      animation: contact-travel var(--signal-duration) linear var(--signal-delay) infinite;
      animation-play-state: var(--contact-animation-state, paused);
    }

    .network-trail {
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-opacity: 0.045;
      stroke-dasharray: var(--trail-length) calc(100 - var(--trail-length));
      stroke-dashoffset: calc(var(--trail-length) - var(--contact-journey));
    }

    .network-signal-head {
      fill: var(--accent);
      filter: drop-shadow(0 0 3px color-mix(in srgb, var(--accent) 54%, transparent));
      transform-box: fill-box;
      offset-path: var(--signal-path);
      offset-distance: calc(var(--contact-journey) * 1%);
      offset-anchor: center;
      offset-rotate: 0deg;
    }
  }
}

@keyframes contact-travel {
  to {
    --contact-journey: 100;
  }
}

@media (max-width: 50rem) {
  .contact-network {
    inline-size: min(100%, 27rem);
    max-block-size: 16rem;
    opacity: 0.82;
  }

  .network-signal--extra {
    display: none;
  }
}
</style>
