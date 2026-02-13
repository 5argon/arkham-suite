interface CustomizationOption {
  xp: number;
  cost?: number;
  real_traits?: string;
  text_change: string;
  real_text?: string;
  tags?: string;
  position?: number;
  deck_limit?: number;
}

interface DeckOption {
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

interface DeckRequirement {
  size: number;
  card: Record<string, Record<string, string>>;
  random: {
    target: string;
    value: string;
  }[];
}

interface Card {
  code: string;
  xp?: number;
  text?: string;
  replacement_text?: string;
  customization_options?: CustomizationOption[];
  customization_text?: string;
  exceptional?: boolean;
  deck_limit?: number;
  deck_options?: DeckOption[];
  deck_requirements?: DeckRequirement;
}

interface TabooList {
  id: number;
  code: string;
  name: string;
  active: number;
  date_start: string;
  date_update: string;
  cards: Card[];
}

type TabooLists = TabooList[];
