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
        </div>
      </div>
    </template>
    <div v-else class="circuit">
      <div class="circuit-bus"></div>
      <div v-for="branch in 3" :key="branch" class="circuit-branch"><i></i><i></i></div>
    </div>
  </div>
</template>
