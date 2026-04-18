<script setup lang="ts">
import type { PokemonUsage } from '../types'
import { spriteUrl, formatPercent } from '../api'
import UsageBar from './UsageBar.vue'

defineProps<{
  pokemon: PokemonUsage
  selected: boolean
}>()

defineEmits<{
  select: []
}>()
</script>

<template>
  <button
    class="card"
    :class="{ selected }"
    @click="$emit('select')"
  >
    <div class="rank">#{{ pokemon.rank }}</div>
    <img
      :src="spriteUrl(pokemon.dex_id)"
      :alt="pokemon.name"
      class="sprite"
      loading="lazy"
    />
    <div class="name">{{ pokemon.name }}</div>
    <div class="usage-label">{{ formatPercent(pokemon.usage_rate) }} usage</div>
    <UsageBar :value="pokemon.usage_rate" />
  </button>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: var(--color-surface-1);
  border: 1.5px solid transparent;
  border-radius: 12px;
  padding: 12px 10px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  width: 100%;
  text-align: center;
  font-family: inherit;
}

.card:hover {
  border-color: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--color-shadow);
}

.card.selected {
  border-color: var(--color-primary);
  background: var(--color-surface-2);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.rank {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-muted);
  letter-spacing: 0.04em;
}

.sprite {
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
}

.name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.usage-label {
  font-size: 11px;
  color: var(--color-muted);
}
</style>
