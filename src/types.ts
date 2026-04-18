export interface MoveUsage {
  id: number
  usage: number
}

export interface ItemUsage {
  id: number
  usage: number
}

export interface AbilityUsage {
  id: number
  usage: number
}

export interface TeammateUsage {
  id: number
  usage: number
}

export interface PokemonUsage {
  rank: number
  dex_id: number
  name: string
  form: string | null
  usage_rate: number
  win_rate: number | null
  top_moves: MoveUsage[]
  top_items: ItemUsage[]
  top_abilities: AbilityUsage[]
  top_teammates: TeammateUsage[]
  top_tera_types: unknown[]
  top_spreads: unknown[]
}

export interface Season {
  id: string
  name: string
  start_date: string
  end_date: string | null
}

export interface BattleMeta {
  schema_version: string
  updated_at: string
  season: Season
  pokemon_usage: PokemonUsage[]
}
