<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import type { PokemonUsage } from '../types'
import {
  spriteUrl,
  formatPercent,
  fetchPokeApiEntries,
  fallbackPokeApiName,
  fallbackPokeApiEntry,
  type PokeApiResource,
} from '../api'
import UsageBar from './UsageBar.vue'

const props = defineProps<{
  pokemon: PokemonUsage
}>()

const moveEntriesQuery = useEntryQuery(
  'move',
  computed(() => props.pokemon.top_moves.map(move => move.id)),
)
const itemEntriesQuery = useEntryQuery(
  'item',
  computed(() => props.pokemon.top_items.map(item => item.id)),
)
const abilityEntriesQuery = useEntryQuery(
  'ability',
  computed(() => props.pokemon.top_abilities.map(ability => ability.id)),
)
const teammateNamesQuery = useNameQuery(
  'pokemon',
  computed(() => props.pokemon.top_teammates.map(teammate => teammate.id)),
)

function moveName(id: number) {
  return moveEntriesQuery.data.value?.[id]?.name ?? fallbackPokeApiName('move', id)
}
function itemName(id: number) {
  return itemEntriesQuery.data.value?.[id]?.name ?? fallbackPokeApiName('item', id)
}
function abilityName(id: number) {
  return abilityEntriesQuery.data.value?.[id]?.name ?? fallbackPokeApiName('ability', id)
}
function moveDescription(id: number) {
  return moveEntriesQuery.data.value?.[id]?.description ?? fallbackPokeApiEntry('move', id).description
}
function moveStats(id: number) {
  return moveEntriesQuery.data.value?.[id]?.moveStats
}
function itemDescription(id: number) {
  return itemEntriesQuery.data.value?.[id]?.description ?? fallbackPokeApiEntry('item', id).description
}
function abilityDescription(id: number) {
  return abilityEntriesQuery.data.value?.[id]?.description ?? fallbackPokeApiEntry('ability', id).description
}
function teammateName(id: number) {
  return teammateNamesQuery.data.value?.[id] ?? fallbackPokeApiName('pokemon', id)
}

function moveMeta(id: number) {
  const stats = moveStats(id)
  if (!stats) return []

  return [
    stats.damageClass ? `Class: ${stats.damageClass}` : null,
    `Power: ${stats.power ?? '-'}`,
    `Accuracy: ${stats.accuracy ?? '-'}`,
  ].filter((value): value is string => Boolean(value))
}

function useEntryQuery(resource: PokeApiResource, ids: ComputedRef<number[]>) {
  const uniqueIds = computed(() => [...new Set(ids.value)])

  return useQuery({
    queryKey: computed(() => ['pokeapi-entries', resource, ...uniqueIds.value]),
    queryFn: () => fetchPokeApiEntries(resource, uniqueIds.value),
    enabled: computed(() => uniqueIds.value.length > 0),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  })
}

function useNameQuery(resource: PokeApiResource, ids: ComputedRef<number[]>) {
  const uniqueIds = computed(() => [...new Set(ids.value)])

  return useQuery({
    queryKey: computed(() => ['pokeapi-names', resource, ...uniqueIds.value]),
    queryFn: async () => {
      const entries = await fetchPokeApiEntries(resource, uniqueIds.value)
      return Object.fromEntries(
        Object.entries(entries).map(([id, entry]) => [Number(id), entry.name]),
      ) as Record<number, string>
    },
    enabled: computed(() => uniqueIds.value.length > 0),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  })
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
            <p v-if="moveDescription(m.id)" class="item-description">{{ moveDescription(m.id) }}</p>
            <div v-if="moveMeta(m.id).length" class="move-meta">
              <span v-for="value in moveMeta(m.id)" :key="value" class="move-meta-chip">{{ value }}</span>
            </div>
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
            <p v-if="itemDescription(i.id)" class="item-description">{{ itemDescription(i.id) }}</p>
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
            <p v-if="abilityDescription(a.id)" class="item-description">{{ abilityDescription(a.id) }}</p>
            <UsageBar :value="a.usage" color="var(--color-warning)" />
          </li>
        </ul>
      </section>

      <section v-if="pokemon.top_teammates.length">
        <h3>Top Teammates</h3>
        <div class="teammates">
          <div v-for="t in pokemon.top_teammates" :key="t.id" class="teammate">
            <img :src="spriteUrl(t.id)" :alt="teammateName(t.id)" class="tm-sprite" loading="lazy" />
            <span class="tm-name">{{ teammateName(t.id) }}</span>
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
  gap: 12px;
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

.item-description {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-muted);
}

.move-meta {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.move-meta-chip {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-surface-2);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text);
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

.tm-name {
  font-size: 11px;
  color: var(--color-text);
  font-weight: 500;
  text-align: center;
}

.tm-pct {
  font-size: 10px;
  color: var(--color-muted);
  font-weight: 600;
}
</style>
