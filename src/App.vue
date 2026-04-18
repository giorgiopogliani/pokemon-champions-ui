<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { BattleMeta, PokemonUsage } from './types'
import { fetchBattleMeta } from './api'
import PokemonCard from './components/PokemonCard.vue'
import DetailPanel from './components/DetailPanel.vue'
import SearchBar from './components/SearchBar.vue'

const meta = ref<BattleMeta | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const selected = ref<PokemonUsage | null>(null)
const showDetail = ref(false)

onMounted(async () => {
  try {
    meta.value = await fetchBattleMeta()
    if (meta.value.pokemon_usage.length) {
      selected.value = meta.value.pokemon_usage[0]
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
})

const filtered = computed(() => {
  if (!meta.value) return []
  const q = search.value.trim().toLowerCase()
  if (!q) return meta.value.pokemon_usage
  return meta.value.pokemon_usage.filter(p => p.name.toLowerCase().includes(q))
})

function selectPokemon(p: PokemonUsage) {
  selected.value = p
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="topbar-inner">
        <div class="logo">
          <span class="logo-icon">&#x2694;</span>
          <span class="logo-text">Battle Meta</span>
        </div>
        <div v-if="meta" class="meta-info">
          <span class="season-badge">{{ meta.season.name }}</span>
          <span class="updated">Updated {{ formatDate(meta.updated_at) }}</span>
        </div>
      </div>
    </header>

    <main class="main">
      <div v-if="loading" class="state-center">
        <div class="spinner" />
        <p>Loading data…</p>
      </div>

      <div v-else-if="error" class="state-center error-state">
        <p>Failed to load: {{ error }}</p>
      </div>

      <template v-else-if="meta">
        <div class="layout">
          <aside class="sidebar">
            <div class="sidebar-header">
              <SearchBar v-model="search" />
              <p class="count">{{ filtered.length }} Pokémon</p>
            </div>
            <div class="grid">
              <PokemonCard
                v-for="p in filtered"
                :key="p.dex_id"
                :pokemon="p"
                :selected="selected?.dex_id === p.dex_id"
                @select="selectPokemon(p)"
              />
            </div>
          </aside>

          <section class="detail" :class="{ open: showDetail }">
            <button class="close-btn" @click="closeDetail">&#x2715;</button>
            <DetailPanel v-if="selected" :pokemon="selected" />
            <div v-else class="placeholder">
              <p>Select a Pokémon to see details</p>
            </div>
          </section>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.topbar {
  background: var(--color-surface-1);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 17px;
  color: var(--color-text);
}

.logo-icon {
  font-size: 18px;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.season-badge {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.updated {
  font-size: 12px;
  color: var(--color-muted);
}

.main {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  align-items: start;
}

.sidebar {
  position: sticky;
  top: 76px;
  max-height: calc(100vh - 96px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.count {
  margin: 0;
  font-size: 12px;
  color: var(--color-muted);
  padding-left: 2px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  overflow-y: auto;
  padding-right: 4px;
  flex: 1;
  min-height: 0;
}

.detail {
  position: relative;
  background: var(--color-surface-1);
  border-radius: 16px;
  min-height: 400px;
  overflow: hidden;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--color-muted);
  font-size: 14px;
}

.close-btn {
  display: none;
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: var(--color-surface-2);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 12px;
  color: var(--color-text);
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
  color: var(--color-muted);
}

.error-state {
  color: var(--color-error);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    max-height: none;
  }

  .grid {
    grid-template-columns: repeat(3, 1fr);
    /*max-height: 50vh;*/
    overflow-y: auto;
  }

  .detail {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 0;
    z-index: 200;
    display: none;
    overflow-y: auto;
  }

  .detail.open {
    display: block;
  }

  .close-btn {
    display: flex;
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .topbar-inner {
    padding: 0 12px;
  }

  .main {
    padding: 12px;
  }
}
</style>
