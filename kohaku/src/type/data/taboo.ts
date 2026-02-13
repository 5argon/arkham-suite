import { Deck } from './deck.js';
import { Card } from './player-card.js';

export type AhdbTabooList = AhdbTaboo[];

export interface AhdbTaboo {
  id?: number;
  code: string;
  name: string;
  active: number;
  date_start: string;
  cards: TabooItemString;
}

export type TabooItemString = TabooCard[];

export function ahdbTabooListToTabooList(tabooList: AhdbTabooList): TabooLists {
  return tabooList.map(ahdbTabooToTaboo);
}

export function ahdbTabooToTaboo(taboo: AhdbTaboo): Taboo {
  const effectiveId = taboo.id ?? parseInt(taboo.code);
  return {
    id: effectiveId,
    code: taboo.code,
    name: taboo.name,
    active: taboo.active,
    date_start: taboo.date_start,
    cards: taboo.cards,
  };
}

export type TabooLists = Taboo[];

export interface Taboo {
  id: number;
  code: string;
  name: string;
  active: number;
  date_start: string;
  cards: TabooCard[];
}

export interface TabooCustomizationOption {
  xp: number;
  cost?: number;
  real_traits?: string;
  text_change: string;
  real_text?: string;
  tags?: string;
  position?: number;
  deck_limit?: number;
}

export interface TabooDeckOption {
  faction: string[];
  level: {
    min: number;
    max: number;
  };
  name?: string;
  faction_select?: string[];
  type?: string[];
  limit?: number;
}

export interface TabooDeckRequirement {
  size: number;
  card: Record<string, Record<string, string>>;
  random: {
    target: string;
    value: string;
  }[];
}

export interface TabooCard {
  code: string;
  xp?: number;
  text?: string;
  replacement_text?: string;
  customization_options?: TabooCustomizationOption[];
  customization_text?: string;
  /** Can be boolean (true/false) or number (1/0) depending on the source */
  exceptional?: boolean | number;
  deck_limit?: number;
  deck_options?: TabooDeckOption[];
  deck_requirements?: TabooDeckRequirement;
}
