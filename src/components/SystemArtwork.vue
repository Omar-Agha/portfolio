<script setup lang="ts">
defineProps<{ variant: 'hero' | 'work' }>()
</script>

<template>
  <div class="system-art" :class="`system-art--${variant}`" aria-hidden="true" dir="ltr">
    <span class="art-cross art-cross--first"></span>
    <span class="art-cross art-cross--last"></span>
    <template v-if="variant === 'hero'">
      <div class="assembly">
        <div class="assembly-axis"></div>
        <div
          v-for="layer in 3"
          :key="layer"
          class="assembly-plane"
          :class="`assembly-plane--${layer}`"
        >
          <i v-for="node in 4" :key="node"></i>
          <span v-if="layer === 3" class="assembly-signal"></span>
        </div>
      </div>
    </template>
    <div v-else class="circuit">
      <div class="circuit-bus"></div>
      <div v-for="branch in 3" :key="branch" class="circuit-branch">
        <svg class="circuit-link" viewBox="0 0 100 4" preserveAspectRatio="none">
          <path class="circuit-line" d="M0 2H100" vector-effect="non-scaling-stroke" />
        </svg>
        <span class="circuit-junction"></span>
        <div v-for="node in 2" :key="node" class="circuit-node">
          <span class="circuit-receipt"></span>
        </div>
        <span v-if="branch !== 2" class="circuit-signal"></span>
      </div>
    </div>
  </div>
</template>
