import type { BattleMeta } from './types'

const DATA_URL = 'https://eurekaffeine.github.io/pokemon-champions-scraper/battle_meta.json'
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'

export type PokeApiResource = 'move' | 'ability' | 'item' | 'pokemon'
export interface MoveStats {
  power?: number
  accuracy?: number
  damageClass?: string
}

export interface PokeApiEntry {
  name: string
  description?: string
  moveStats?: MoveStats
}

export async function fetchBattleMeta(): Promise<BattleMeta> {
  const res = await fetch(DATA_URL)
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
  return res.json()
}

export async function fetchPokeApiName(resource: PokeApiResource, id: number): Promise<string> {
  const res = await fetch(`${POKEAPI_BASE_URL}/${resource}/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch ${resource} ${id}: ${res.status}`)

  const data = await res.json() as PokeApiPayload
  return formatPokeApiName(data.name)
}

export async function fetchPokeApiNames(
  resource: PokeApiResource,
  ids: number[],
): Promise<Record<number, string>> {
  const uniqueIds = [...new Set(ids)]
  const entries = await Promise.all(
    uniqueIds.map(async id => {
      try {
        return [id, await fetchPokeApiName(resource, id)] as const
      } catch {
        return [id, fallbackPokeApiName(resource, id)] as const
      }
    }),
  )

  return Object.fromEntries(entries) as Record<number, string>
}

export async function fetchPokeApiEntries(
  resource: PokeApiResource,
  ids: number[],
): Promise<Record<number, PokeApiEntry>> {
  const uniqueIds = [...new Set(ids)]
  const entries = await Promise.all(
    uniqueIds.map(async id => {
      try {
        return [id, await fetchPokeApiEntry(resource, id)] as const
      } catch {
        return [id, fallbackPokeApiEntry(resource, id)] as const
      }
    }),
  )

  return Object.fromEntries(entries) as Record<number, PokeApiEntry>
}

export function spriteUrl(dexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexId}.png`
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function fallbackPokeApiName(resource: PokeApiResource, id: number): string {
  switch (resource) {
    case 'move':
      return `Move #${id}`
    case 'item':
      return `Item #${id}`
    case 'ability':
      return `Ability #${id}`
    case 'pokemon':
      return `Pokemon #${id}`
  }
}

export function fallbackPokeApiEntry(resource: PokeApiResource, id: number): PokeApiEntry {
  return {
    name: fallbackPokeApiName(resource, id),
  }
}

async function fetchPokeApiEntry(resource: PokeApiResource, id: number): Promise<PokeApiEntry> {
  const res = await fetch(`${POKEAPI_BASE_URL}/${resource}/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch ${resource} ${id}: ${res.status}`)

  const data = await res.json() as PokeApiPayload

  return {
    name: formatPokeApiName(data.name),
    description: extractDescription(resource, data),
    moveStats: resource === 'move' ? extractMoveStats(data) : undefined,
  }
}

function formatPokeApiName(name: string): string {
  return name
    .split('-')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function extractDescription(resource: PokeApiResource, data: PokeApiPayload): string | undefined {
  if (resource === 'move') {
    const shortEffect = data.effect_entries?.find(entry => entry.language.name === 'en')?.short_effect
    return normalizeDescription(shortEffect)
  }

  if (resource === 'ability') {
    const flavorText = findLatestEnglishFlavorText(data.flavor_text_entries)
    if (flavorText) return normalizeDescription(flavorText)

    const shortEffect = data.effect_entries?.find(entry => entry.language.name === 'en')?.short_effect
    return normalizeDescription(shortEffect)
  }

  if (resource === 'item') {
    const flavorText = findLatestEnglishFlavorText(data.flavor_text_entries)
    if (flavorText) return normalizeDescription(flavorText)

    const shortEffect = data.effect_entries?.find(entry => entry.language.name === 'en')?.short_effect
    return normalizeDescription(shortEffect)
  }

  return undefined
}

function findLatestEnglishFlavorText(entries: FlavorTextEntry[] | undefined): string | undefined {
  if (!entries?.length) return undefined

  for (let i = entries.length - 1; i >= 0; i -= 1) {
    if (entries[i].language.name === 'en') {
      return entries[i].flavor_text
    }
  }

  return undefined
}

function normalizeDescription(value: string | undefined): string | undefined {
  return value?.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractMoveStats(data: PokeApiPayload): MoveStats | undefined {
  if (
    data.power === undefined
    && data.accuracy === undefined
    && data.damage_class?.name === undefined
  ) {
    return undefined
  }

  return {
    power: data.power ?? undefined,
    accuracy: data.accuracy ?? undefined,
    damageClass: data.damage_class?.name ? formatPokeApiName(data.damage_class.name) : undefined,
  }
}

interface LanguageRef {
  name: string
}

interface EffectEntry {
  language: LanguageRef
  short_effect?: string
}

interface FlavorTextEntry {
  language: LanguageRef
  flavor_text: string
}

interface PokeApiPayload {
  name: string
  power?: number | null
  accuracy?: number | null
  damage_class?: {
    name: string
  }
  effect_entries?: EffectEntry[]
  flavor_text_entries?: FlavorTextEntry[]
}
