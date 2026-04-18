import type { BattleMeta } from './types'

const DATA_URL = 'https://eurekaffeine.github.io/pokemon-champions-scraper/battle_meta.json'

export async function fetchBattleMeta(): Promise<BattleMeta> {
  const res = await fetch(DATA_URL)
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
  return res.json()
}

export function spriteUrl(dexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexId}.png`
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}
