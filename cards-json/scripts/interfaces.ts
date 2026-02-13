export interface UserDecks {
  id: number
  username: string
  deckGroups: DeckGroup[]
  decks: number[]
}

export interface DeckGroup {
  name: string
  decks: number[]
}

export interface AhdbTaboo {
  id: number
  code: string
  name: string
  active: number
  date_start: string
  date_update: string
  cards: TabooItem[]
}

export interface AhdbTabooProcessing {
  id: number
  code: string
  name: string
  active: number
  date_start: string
  date_update: string
  cards: TabooItemString
}

export type TabooItemString = string

export interface TabooItem {
  code: string
  xp?: number
  text?: string
  deck_limit?: number
  exceptional?: boolean
}

export interface AhdbCard {
  bonded_to?: null | string
  bonded_cards?: { count: number; code: string }[]
  pack_code: string
  pack_name: string
  type_code: string
  type_name: string
  subtype_code?: string
  subtype_name?: string
  faction_code: string
  faction_name: string
  faction2_code?: string
  faction2_name?: string
  faction3_code?: string
  faction3_name?: string
  duplicate_of_code?: string
  duplicate_of_name?: string
  position: number
  exceptional: boolean
  myriad: boolean
  code: string
  name: string
  real_name: string
  subname?: string
  cost?: number
  text: string
  real_text: string
  quantity: number
  skill_combat?: number
  skill_intellect?: number
  skill_agility?: number
  skill_willpower?: number
  skill_wild?: number
  xp?: number | null
  health?: number
  sanity?: number
  health_per_investigator: boolean
  restrictions?: null | string | {
    investigator?: { [k: string]: string }
    trait?: string[]
  } 
  deck_limit?: number
  slot: string
  real_slot: string
  traits?: string
  real_traits?: string
  flavor?: string
  illustrator: string
  is_unique: boolean
  permanent: boolean
  double_sided: boolean
  octgn_id: string
  url: string
  imagesrc?: string
  backimagesrc?: string
  duplicated_by?: string[]
  customization_text?: string
  customization_change?: string
  customization_options?: {
    xp: number
    text_change: "replace" | "insert" | "append"
    choice: "remove_slot" | "choose_trait" | "choose_card"
    position?: number
    quantity?: number
  }[]
  hidden?: boolean
  linked_to_code?: string
  linked_to_name?: string
  spoiler?: number
  back_link?: string
}

export interface AhdbPack {
  name: string
  code: string
  position: number
  cycle_position: number
  available: string
  known: number
  total: number
  url: string
  id: number
}

export interface Repackages {
  repackages: Repackage[]
}

export interface Repackage {
  sources: string[]
  forwardTo?: string
  addAlias?: string
  addParentCode?: string
}

export interface RepackageMaps {
  packForwardMap: { [k: string]: string }
  packAliasMap: { [k: string]: string }
  packParentCodeMap: { [k: string]: string }
}

export type CardList = { [k: string]: number } | null

export interface AhdbDeck {
  id: number
  name: string
  date_creation: string
  date_update: string
  description_md: string
  user_id: number
  investigator_code: string
  investigator_name: string
  slots: CardList
  sideSlots: CardList
  ignoreDeckLimitSlots: CardList
  version: number
  xp: number | null
  xp_spent: number | null
  xp_adjustment: number
  exile_string: null
  taboo_id: number
  meta: string
  tags: string
  previous_deck: number | null
  next_deck: number | null
  problem: string | null
}

export function extractTraits(s: string): string[] {
  return s.split(". ").map((x) => x.replaceAll(".", ""))
}
