import type { ClassSlots } from '../game/card-class.js';
import { CardType, WeaknessType } from '../game/card-type.js';
import type { EncounterSet } from '../game/encounter-set.js';
import { Product } from '../game/product.js';
import type { Slot } from '../game/slot.js';
import { randomBasicWeakness, type AhdbCard } from './ahdb-card.js';
import type { AhdbDeckOption, DeckOption } from './deck-option.js';
import * as utility from '../../utility/index.js';
import { isRandomBasicWeakness } from '../../utility/card/util.js';

export type CardCode = string;

export type Cost = number | 'x' | null;

export type SubtypeCode = 'basicweakness' | 'weakness';

export interface CustomizationText {
  title: string;
  description: string;
}

export interface DeckRequirements {
  size: number;
  card: CardCode[];
  random?: SubtypeCode[];
}

export interface Card {
  advanced?: boolean;
  alternateOf?: CardCode;
  alternates?: CardCode[];
  backFlavor?: string;
  backName?: string;
  backText?: string;
  backImageCode?: CardCode;
  bondedCards?: CardCode[];
  bondedTo?: CardCode;
  code: CardCode;
  cost?: Cost;
  customizationChange?: string;
  customizationOptions?: CustomizationOption[];
  customizationText?: string;
  deckLimit?: number;
  deckOptions?: DeckOption[];
  deckRequirements?: DeckRequirements;
  sideDeckOptions?: DeckOption[];
  sideDeckRequirements?: DeckRequirements;
  doubleSided?: boolean;
  duplicates?: CardCode[];
  duplicateOf?: CardCode;
  encounterSet?: EncounterSet;
  encounterPosition?: number;
  encounterName?: string;
  enemyDamage?: number;
  enemyEvade?: number;
  enemyFight?: number;
  enemyHorror?: number;
  errataDate?: Date;
  exceptional?: boolean;
  exile?: boolean;
  fast?: boolean;
  /**
   * Class is `undefined` for mythos faction cards.
   */
  cardClass?: ClassSlots;
  mythos?: boolean;
  flavor?: string;
  health?: number;
  hidden?: boolean;
  illustrator?: string;
  unique?: boolean;
  myriad?: boolean;
  name: string;
  product: Product;
  permanent: boolean;
  position: number;
  quantity: number;
  researched?: boolean;
  restrictions?: { investigator: CardCode[]; trait: string[] };
  reward?: boolean;
  sanity?: number;
  skillAgility?: number;
  skillCombat?: number;
  skillIntellect?: number;
  skillWild?: number;
  skillWillpower?: number;
  slots?: Slot[];
  spoiler?: boolean;
  subname?: string;
  subtypeCode?: SubtypeCode;
  weakness?: WeaknessType;
  text?: string;
  traits?: string[];
  tags?: string[];
  traitsDisplay?: string[];
  cardType: CardType;
  xp?: number;
  /**
   * Taboo XP adjustment, positive or negative.
   * This is the change in XP cost, not the absolute value.
   */
  chained?: number;
}

export interface CustomizationOption {
  xp: number;
  textChange: 'replace' | 'insert' | 'append';
  choice: 'remove_slot' | 'choose_trait' | 'choose_card';
  position?: number;
  quantity?: number;
  tags?: string[];
  text?: CustomizationText;
}

/**
 * Parse customization_text HTML to extract title and description.
 * @param customizationText - The HTML string from customization_text field
 * @param index - The index of the customization option
 * @returns CustomizationText object or undefined if parsing fails
 */
function parseCustomizationText(
  customizationText: string | undefined,
  index: number
): CustomizationText | undefined {
  if (!customizationText) return undefined;

  const lines = customizationText.split('\n').filter((line) => line.trim() !== '');
  if (index < lines.length) {
    const line = lines[index];
    // Extract text inside <b> tags as title
    const boldMatch = line.match(/<b>(.+?)<\/b>/);
    if (boldMatch) {
      let title = boldMatch[1];
      // Trim trailing dot from title
      if (title.endsWith('.')) {
        title = title.slice(0, -1);
      }
      // Extract text after </b> as description
      const afterBold = line.substring(line.indexOf('</b>') + 4).trim();
      return {
        title: title,
        description: afterBold,
      };
    }
  }
  return undefined;
}

/**
 * Internal function to convert AhdbCard to Card.
 * This is private to the kohaku package. Use CardResolver to manage card conversion.
 * @internal
 */
export function ahdbCardToCard(ahdbCard: AhdbCard): Card {
  try {
    const cardClass: ClassSlots | undefined =
      ahdbCard.faction_code === 'mythos'
        ? undefined
        : {
            class1: utility.ahdb.factionToCardClass(ahdbCard.faction_code),
            class2: ahdbCard.faction2_code
              ? utility.ahdb.factionToCardClass(ahdbCard.faction2_code)
              : undefined,
            class3: ahdbCard.faction3_code
              ? utility.ahdb.factionToCardClass(ahdbCard.faction3_code)
              : undefined,
          };

    function convertCost(ahdbCard: AhdbCard): Cost | undefined {
      if (ahdbCard.cost === -2) {
        return 'x';
      }
      return ahdbCard.cost;
    }

    function parseDeckRequirements(
      requirementsString: string | undefined
    ): DeckRequirements | undefined {
      if (!requirementsString) {
        return undefined;
      }

      // Format: "size:30, card:05007:98011, card:05008:98012, random:subtype:basicweakness"
      const parts = requirementsString.split(',').map((s) => s.trim());
      let size = 30; // default
      const cards: CardCode[] = [];
      const randoms: SubtypeCode[] = [];

      for (const part of parts) {
        if (part.startsWith('size:')) {
          size = parseInt(part.substring(5));
        } else if (part.startsWith('card:')) {
          // Format: card:05007:98011 or card:89002
          // Extract the first code after 'card:'
          const cardPart = part.substring(5);
          const firstCode = cardPart.split(':')[0];
          cards.push(firstCode);
        } else if (part.startsWith('random:')) {
          // Format: random:subtype:basicweakness or random:subtype:weakness
          const randomParts = part.split(':');
          if (randomParts.length >= 3 && randomParts[1] === 'subtype') {
            const subtypeCode = randomParts[2] as SubtypeCode;
            randoms.push(subtypeCode);
          }
        }
      }

      return {
        size,
        card: cards,
        random: randoms.length > 0 ? randoms : undefined,
      };
    }

    let restrictions: Card['restrictions'] | undefined;
    if (ahdbCard.restrictions) {
      // Format: "investigator:CODE1, investigator:CODE2, trait:TRAIT1, trait:TRAIT2"
      const restrictionParts = ahdbCard.restrictions.split(', ');
      const investigator: CardCode[] = [];
      const trait: string[] = [];
      restrictionParts.forEach((part) => {
        const [key, value] = part.split(':');
        if (key === 'investigator') {
          investigator.push(value);
        } else if (key === 'trait') {
          trait.push(value);
        }
      });
      restrictions = { investigator, trait };
    }

    function convertDeckOptions(ahdbDeckOption: AhdbDeckOption): DeckOption {
      const deckOption: DeckOption = {
        faction: ahdbDeckOption.faction?.map((faction) => utility.ahdb.factionToCardClass(faction)),
        factionSelect: ahdbDeckOption.faction_select?.map((faction) =>
          utility.ahdb.factionToCardClass(faction)
        ),
        not: ahdbDeckOption.not,
        trait: ahdbDeckOption.trait,
        level: ahdbDeckOption.level,
        baseLevel: ahdbDeckOption.base_level,
        text: ahdbDeckOption.text,
        tag: ahdbDeckOption.tag,
        limit: ahdbDeckOption.limit,
        atLeast: ahdbDeckOption.atleast,
        name: ahdbDeckOption.name,
        id: ahdbDeckOption.id,
        optionSelect: ahdbDeckOption.option_select?.map((opt, index) => convertDeckOptions(opt)),
        uses: ahdbDeckOption.uses,
        size: ahdbDeckOption.size,
        type: ahdbDeckOption.type?.map((type) => utility.ahdb.typeToCardType(type)),
        permanent: ahdbDeckOption.permanent,
        deckSizeSelect: ahdbDeckOption.deck_size_select?.map((size) => parseInt(size)),
      };
      return deckOption;
    }

    const deckOptions: DeckOption[] | undefined = ahdbCard.deck_options?.map((ahdbDeckOption) => {
      return convertDeckOptions(ahdbDeckOption);
    });
    const product = utility.ahdb.codeToProduct(ahdbCard.pack_code, ahdbCard.encounter_code);
    const playerCard: Card = {
      code: ahdbCard.code,
      name: ahdbCard.name,
      cardClass: cardClass,
      mythos: ahdbCard.faction_code === 'mythos',
      cardType: utility.ahdb.typeToCardType(ahdbCard.type_code),
      product: ahdbCard.code === randomBasicWeakness ? Product.RandomBasicWeakness : product,
      permanent: ahdbCard.permanent,
      position: ahdbCard.position,
      quantity: ahdbCard.quantity,
      advanced: ahdbCard.text?.includes('Advanced.') ? true : undefined,
      alternateOf: ahdbCard.alternate_of,
      backFlavor: ahdbCard.back_flavor,
      backName: ahdbCard.back_name,
      backText: ahdbCard.back_text,
      backImageCode: ahdbCard.double_sided ? ahdbCard.code + 'b' : undefined,
      bondedCards: undefined, // Populated in CardResolver's 2nd pass
      bondedTo: ahdbCard.bonded_to,
      cost: convertCost(ahdbCard),
      customizationChange: ahdbCard.customization_change,
      customizationOptions: ahdbCard.customization_options?.map((option, index) => {
        const text = parseCustomizationText(ahdbCard.customization_text, index);
        return {
          xp: option.xp,
          textChange: option.text_change,
          choice: option.choice,
          position: option.position,
          quantity: option.quantity,
          tags: option.tags?.split('.').filter((tag) => tag !== ''),
          text: text,
        };
      }),
      customizationText: ahdbCard.customization_text,
      deckLimit: ahdbCard.deck_limit,
      deckOptions: deckOptions,
      deckRequirements: parseDeckRequirements(ahdbCard.deck_requirements),
      sideDeckOptions: ahdbCard.side_deck_options?.map((ahdbDeckOption) => {
        return convertDeckOptions(ahdbDeckOption);
      }),
      sideDeckRequirements: parseDeckRequirements(ahdbCard.side_deck_requirements),
      doubleSided: ahdbCard.double_sided,
      duplicates: ahdbCard.duplicated_by,
      duplicateOf: ahdbCard.duplicate_of_code,
      encounterSet: ahdbCard.encounter_code
        ? utility.ahdb.encounterSetToEncounterSet(ahdbCard.encounter_code)
        : undefined,
      encounterPosition: ahdbCard.encounter_position,
      encounterName: ahdbCard.encounter_name,
      enemyDamage: ahdbCard.enemy_damage,
      enemyEvade: ahdbCard.enemy_evade,
      enemyFight: ahdbCard.enemy_fight,
      enemyHorror: ahdbCard.enemy_horror,
      errataDate: ahdbCard.errata_date ? new Date(ahdbCard.errata_date) : undefined,
      exceptional: ahdbCard.exceptional,
      exile: ahdbCard.exile,
      fast: ahdbCard.text?.includes('Fast.') ? true : undefined,
      flavor: ahdbCard.flavor,
      health: ahdbCard.health,
      hidden: ahdbCard.hidden,
      illustrator: ahdbCard.illustrator,
      unique: ahdbCard.is_unique,
      myriad: ahdbCard.myriad,
      researched: ahdbCard.text?.includes('Researched.') ? true : undefined,
      restrictions: restrictions,
      reward: ahdbCard.text?.includes('Reward.') ? true : undefined,
      sanity: ahdbCard.sanity,
      skillAgility: ahdbCard.skill_agility,
      skillCombat: ahdbCard.skill_combat,
      skillIntellect: ahdbCard.skill_intellect,
      skillWild: ahdbCard.skill_wild,
      skillWillpower: ahdbCard.skill_willpower,
      slots: utility.ahdb.slotStringToSlots(ahdbCard.slot),
      spoiler: ahdbCard.spoiler !== undefined,
      subname: ahdbCard.subname,
      subtypeCode: ahdbCard.subtype_code,
      weakness: utility.ahdb.subtypeCodeToWeaknessType(ahdbCard.subtype_code),
      tags: ahdbCard.tags?.split('.').filter((tag) => tag !== ''),
      text: ahdbCard.text,
      traits: ahdbCard.traits?.split('.').map((trait) => trait.trim()),
      traitsDisplay: ahdbCard.traits?.split('.').map((trait) => trait.trim()),
      xp: ahdbCard.xp,
    };
    return playerCard;
  } catch (error) {
    const stringifiedCard = JSON.stringify(ahdbCard, null, 2);
    console.error('Error converting AhdbCard to Card. Input card:', stringifiedCard);
    throw error;
  }
}

/**
 * For each key, return related cards that should be required to play.
 */
export const specialLinkedCards: { [key: string]: string[] } = {
	'04040': ['04041', '04042'], // Doomed -> Accursed Fate, The Bell Tolls
	'04041': ['04042'], // Accursed Fate -> The Bell Tolls
	'04038': ['04039'], // Dark Pact -> The Price of Failure
	'04039': ['04038'], // The Price of Failure -> Dark Pact
	'53013': ['53014', '53015'], // Offer You Cannot Refuse -> Fine Print, Sell Your Soul
	'53014': ['53015'], // Fine Print -> Sell Your Soul
}