import { CardClass } from "../game/card-class.js";
import { CardType } from "../game/card-type.js";

export interface AhdbDeckOption {
  faction?: string[];
  faction_select?: string[];
  not?: boolean;
  trait?: string[];
  level?: { min: number; max: number };
  base_level?: { min: number; max: number };
  text?: string[];
  tag?: string[];
  limit?: number;
  error?: string;
  atleast?: { factions: number; min: number };
  name?: string;
  id?: string;
  option_select?: AhdbDeckOption[];
  uses?: string[];
  size?: number;
  type?: string[];
  permanent?: boolean;
  deck_size_select?: string[];
}

export interface DeckOption {
  faction?: CardClass[];
  factionSelect?: CardClass[];
  not?: boolean;
  trait?: string[];
  level?: { min: number; max: number };
  baseLevel?: { min: number; max: number };
  text?: string[];
  tag?: string[];
  limit?: number;
  atLeast?: { factions: number; min: number };
  name?: string;
  id?: string;
  optionSelect?: DeckOption[];
  uses?: string[];
  size?: number;
  type?: CardType[];
  permanent?: boolean;
  deckSizeSelect?: number[];
}
