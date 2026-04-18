<script setup lang="ts">
defineProps<{
  value: number
  color?: string
}>()
</script>

<template>
  <div class="usage-bar-track">
    <div
      class="usage-bar-fill"
      :style="{ width: `${value * 100}%`, background: color ?? 'var(--color-primary)' }"
    />
  </div>
</template>

<style scoped>
.usage-bar-track {
  width: 100%;
  height: 6px;
  background: var(--color-surface-2);
  border-radius: 3px;
  overflow: hidden;
}
.usage-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
</style>
