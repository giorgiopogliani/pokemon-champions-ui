<script setup lang="ts">
import type { PokemonUsage } from '../types'
import { spriteUrl, formatPercent } from '../api'
import UsageBar from './UsageBar.vue'

defineProps<{
  pokemon: PokemonUsage
}>()

const MOVE_NAMES: Record<number, string> = {}
const ITEM_NAMES: Record<number, string> = {}
const ABILITY_NAMES: Record<number, string> = {}

function moveName(id: number) {
  return MOVE_NAMES[id] ?? `Move #${id}`
}
function itemName(id: number) {
  return ITEM_NAMES[id] ?? `Item #${id}`
}
function abilityName(id: number) {
  return ABILITY_NAMES[id] ?? `Ability #${id}`
}
</script>

<template>
  <div class="panel">
    <div class="header">
      <img :src="spriteUrl(pokemon.dex_id)" :alt="pokemon.name" class="sprite" />
      <div class="header-info">
        <h2>{{ pokemon.name }}</h2>
        <div class="badges">
          <span class="badge rank">Rank #{{ pokemon.rank }}</span>
          <span class="badge usage">{{ formatPercent(pokemon.usage_rate) }} usage</span>
        </div>
      </div>
    </div>

    <div class="sections">
      <section v-if="pokemon.top_moves.length">
        <h3>Top Moves</h3>
        <ul>
          <li v-for="m in pokemon.top_moves" :key="m.id">
            <span class="item-name">{{ moveName(m.id) }}</span>
            <span class="item-pct">{{ formatPercent(m.usage) }}</span>
            <UsageBar :value="m.usage" color="var(--color-accent)" />
          </li>
        </ul>
      </section>

      <section v-if="pokemon.top_items.length">
        <h3>Top Items</h3>
        <ul>
          <li v-for="i in pokemon.top_items" :key="i.id">
            <span class="item-name">{{ itemName(i.id) }}</span>
            <span class="item-pct">{{ formatPercent(i.usage) }}</span>
            <UsageBar :value="i.usage" color="var(--color-success)" />
          </li>
        </ul>
      </section>

      <section v-if="pokemon.top_abilities.length">
        <h3>Top Abilities</h3>
        <ul>
          <li v-for="a in pokemon.top_abilities" :key="a.id">
            <span class="item-name">{{ abilityName(a.id) }}</span>
            <span class="item-pct">{{ formatPercent(a.usage) }}</span>
            <UsageBar :value="a.usage" color="var(--color-warning)" />
          </li>
        </ul>
      </section>

      <section v-if="pokemon.top_teammates.length">
        <h3>Top Teammates</h3>
        <div class="teammates">
          <div v-for="t in pokemon.top_teammates" :key="t.id" class="teammate">
            <img :src="spriteUrl(t.id)" :alt="`#${t.id}`" class="tm-sprite" loading="lazy" />
            <span class="tm-pct">{{ formatPercent(t.usage) }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.panel {
  background: var(--color-surface-1);
  border-radius: 16px;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.sprite {
  width: 80px;
  height: 80px;
  image-rendering: pixelated;
  flex-shrink: 0;
}

.header-info h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge.rank {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
}

.badge.usage {
  background: var(--color-success-alpha);
  color: var(--color-success);
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

section h3 {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-muted);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

li {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  column-gap: 8px;
  row-gap: 3px;
}

.item-name {
  font-size: 13px;
  color: var(--color-text);
  font-weight: 500;
}

.item-pct {
  font-size: 12px;
  color: var(--color-muted);
  text-align: right;
}

li :last-child {
  grid-column: 1 / -1;
}

.teammates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.teammate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: var(--color-surface-2);
  border-radius: 10px;
  padding: 6px 8px;
}

.tm-sprite {
  width: 40px;
  height: 40px;
  image-rendering: pixelated;
}

.tm-pct {
  font-size: 10px;
  color: var(--color-muted);
  font-weight: 600;
}
</style>
