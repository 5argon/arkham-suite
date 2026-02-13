import { AhdbDeckOption } from './deck-option.js';

export const randomBasicWeakness = '01000';

type ObjectString = string

/**
 * This is a definition that matches JSON from `arkhamdb.com`. (Both player and encounter cards)
 */
export interface AhdbCard {
  alternate_of?: string;
  back_flavor?: string;
  back_name?: string;
  back_text?: string;
  backimagesrc?: string;
  bonded_cards?: { count: number; code: string }[];
  bonded_count?: number;
  bonded_to?: string;
  clues?: number;
  clues_fixed?: boolean;
  code: string;
  cost?: number | null;
  customization_change?: string;
  customization_options?: {
    xp: number;
    text_change: 'replace' | 'insert' | 'append';
    choice: 'remove_slot' | 'choose_trait' | 'choose_card';
    position?: number;
    quantity?: number;
    tags?: string;
  }[];
  customization_text?: string;
  deck_limit?: number;
  deck_options?: AhdbDeckOption[];
  deck_requirements?: ObjectString;
  side_deck_options?: AhdbDeckOption[];
  side_deck_requirements?: ObjectString;
  doom?: number;
  double_sided: boolean;
  duplicate_of_code?: string;
  duplicate_of_name?: string;
  duplicated_by?: string[];
  encounter_code?: string;
  encounter_name?: string;
  encounter_position?: number;
  enemy_damage?: number;
  enemy_evade?: number;
  enemy_fight?: number;
  enemy_horror?: number;
  errata_date?: string;
  exceptional: boolean;
  exile?: boolean;
  faction2_code?: string;
  faction2_name?: string;
  faction3_code?: string;
  faction3_name?: string;
  faction_code: string;
  faction_name: string;
  flavor?: string;
  health?: number;
  health_per_investigator: boolean;
  hidden?: boolean;
  illustrator?: string;
  imagesrc?: string;
  is_unique: boolean;
  myriad: boolean;
  name: string;
  octgn_id?: string;
  pack_code: string;
  pack_name: string;
  permanent: boolean;
  position: number;
  quantity: number;
  real_name: string;
  real_slot?: string;
  real_text?: string;
  real_traits?: string;
  restrictions?: ObjectString;
  sanity?: number;
  shroud?: number;
  skill_agility?: number;
  skill_combat?: number;
  skill_intellect?: number;
  skill_wild?: number;
  skill_willpower?: number;
  slot?: string;
  spoiler?: number;
  stage?: number;
  subname?: string;
  subtype_code?: 'basicweakness' | 'weakness';
  subtype_name?: string;
  tags?: string;
  text?: string;
  traits?: string;
  type_code:
    | 'investigator'
    | 'asset'
    | 'treachery'
    | 'event'
    | 'skill'
    | 'enemy'
    | 'location'
    | 'scenario'
    | 'agenda'
    | 'act'
    | 'story'
    | 'key';
  type_name: string;
  url: string;
  vengeance?: number;
  victory?: number;
  xp?: number;
}
