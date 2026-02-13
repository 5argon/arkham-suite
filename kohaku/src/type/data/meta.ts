import { factionCodeToClass } from '../../utility/strings/util.js';
import { CardClass } from '../game/card-class.js';
import { Product } from '../game/product.js';
import { ahdb } from '../../utility/index.js';
import { SkillType } from '../game/skill.js';
import { CardQuantity } from './deck.js';
import { Card, CardCode } from './player-card.js';
import { CardResolver } from './resolver.js';

export interface DecodedMeta extends DecodedMetaArkhamBuild {
  customizableMetas?: DecodedCustomizableMeta[];
  factionSelected?: CardClass;
  optionSelected?: string;
  deckSizeSelected?: number;
  faction1?: CardClass;
  faction2?: CardClass;
  alternateFront?: Card;
  alternateBack?: Card;
}

export interface DecodedMetaArkhamBuild {
  /**
   * Parallel Jim's spirit deck.
   */
  extraDeck?: CardQuantity[];

  /**
   * Cards that are attached to a specific setup deck, for example Joe Diamond or Stick to the Plan.
   * Key: card code, Value: array of cards
   */
  attachments?: Record<string, Card[]>;

  /**
   * Packs that can be used for this deck. Used for limited pool deckbuilding such as #campaign-playalong.
   */
  cardPool?: Product[];

  /**
   * Some cards can extend the card pool with choices. This tracks their selection state.
   * Key: card code, Value: array of selected card codes
   */
  cardPoolExtension?: Record<string, CardCode[]>;

  /**
   * Stores fan-made content (cards, packs, encounter sets) used in this deck.
   */
  fanMadeContent?: any;

  /**
   * When syncing decks with fan-made content to ArkhamDB, we need to extract the slot entries and investigator.
   * This object holds this data so we can later re-apply it.
   */
  hiddenSlots?: any;

  /**
   * Card ids that are pickable for this deck. Used for sealed deckbuilding.
   */
  sealedDeck?: CardQuantity[];

  /**
   * Name of the sealed deck definition used.
   */
  sealedDeckName?: string;

  /**
   * Investigator that this deck's investigator has transformed into.
   */
  transformInto?: Card;

  /**
   * URL to an image to be displayed as banner for the deck. Preferably aspect ratio 4:1.
   */
  bannerUrl?: string;

  /**
   * Short deck introduction that uses the same markdown format that description_md uses.
   */
  introMd?: string;

  /**
   * Annotation for specific cards that uses the same markdown format that description_md uses.
   * Annotations are not limited to cards in deck, but can also target cards in the side deck (upgrades, alternatives) or any card (reasoning for exclusion).
   * Key: card code
   */
  annotations?: Record<string, string>;
}

export interface Meta extends CustomizableMeta, ArkhamBuildMeta {
  alternate_front?: string;
  alternate_back?: string;

  /**
   * Parallel Back Wendy Adams
   */
  option_selected?: 'blessed' | 'cursed' | 'both';

  /**
   * Mandy Thompson
   */
  deck_size_selected?: 30 | 40 | 50;

  /**
   * For anyone with one faction choice.
   */
  faction_selected?: 'guardian' | 'seeker' | 'rogue' | 'mystic' | 'survivor';

  /**
   * Charlie Kane
   */
  faction_1?: 'guardian' | 'seeker' | 'rogue' | 'mystic' | 'survivor';

  /**
   * Charlie Kane
   */
  faction_2?: 'guardian' | 'seeker' | 'rogue' | 'mystic' | 'survivor';
}
/**
 * Metadata additions
 * arkham.build extends the arkhamdb deck schema with a few fields for additional functionality.
 */
export interface ArkhamBuildMeta {
  /**
   * Parallel Jim's spirit deck. Format: comma-separated list of ids "id1,id2,id3".
   */
  extra_deck?: ExtraDeckString;

  /**
   * Cards that are attached to a specific setup deck, for example Joe Diamond or Stick to the Plan. Format: comma-separated list of ids "id1,id2,id2,id3".
   * Dynamic keys in format: attachments_{code}
   */
  [key: `attachments_${string}`]: AttachmentMetaString | undefined;

  /**
   * Packs that can be used for this deck. Used for limited pool deckbuilding such as #campaign-playalong. Format: "<pack_code>,<pack_code>". For arkham.build, new format pack codes take precedence over old format. Cycles can be added as cycle:<cycle_code>.
   */
  card_pool?: string;

  /**
   * Some cards can extend the card pool with choices. This tracks their selection state. Format: "card:<code>,card:<code>".
   * Dynamic keys in format: card_pool_extension_{code}
   */
  [key: `card_pool_extension_${string}`]: string | undefined;

  /**
   * Stores fan-made content (cards, packs, encounter sets) used in this deck.
   */
  fan_made_content?: any;

  /**
   * When syncing decks with fan-made content to ArkhamDB, we need to extract the slot entries and investigator. This object holds this data so we can later re-apply it.
   */
  hidden_slots?: any;

  /**
   * Card ids that are pickable for this deck. Used for sealed deckbuilding. Format: comma-separated list of id / quantity pairs in the format "id:2,id:1,...".
   */
  sealed_deck?: string;

  /**
   * Name of the sealed deck definition used. format: string.
   */
  sealed_deck_name?: string;

  /**
   * Code of the investigator that this deck's investigator has transformed into. I.e. 04244 for Body of a Yithian.
   */
  transform_into?: string;

  /**
   * URL to an image to be displayed as banner for the deck. Preferably aspect ratio 4:1.
   */
  banner_url?: string;

  /**
   * Short deck introduction that uses the same markdown format that description_md uses.
   */
  intro_md?: string;

  /**
   * Annotation for a specific card that uses the same markdown format that description_md uses. Annotations are not limited to cards in deck, but can also target cards in the side deck (upgrades, alternatives) or any card (reasoning for exclusion).
   * Dynamic keys in format: annotation_{code}
   */
  [key: `annotation_${string}`]: string | undefined;
}

export interface CustomizableMeta {
  /** Hunter's Armor */
  cus_09021?: CustomizableMetaString;
  /** Runic Axe */
  cus_09022?: CustomizableMetaString;
  /** Custom Modifications */
  cus_09023?: CustomizableMetaString;

  /** Alchemical Distillation */
  cus_09040?: CustomizableMetaString;
  /** Empirical Hypothesis */
  cus_09041?: CustomizableMetaString;
  /** The Raven Quill */
  cus_09042?: CustomizableMetaString;

  /** Damning Testimony */
  cus_09059?: CustomizableMetaString;
  /** Friends in Low Places */
  cus_09060?: CustomizableMetaString;
  /** Honed Instinct */
  cus_09061?: CustomizableMetaString;

  /** Living Ink */
  cus_09079?: CustomizableMetaString;
  /** Summoned Servitor */
  cus_09080?: CustomizableMetaString;
  /** Power Word */
  cus_09081?: CustomizableMetaString;

  /** Pocket Multi Tool */
  cus_09099?: CustomizableMetaString;
  /** Makeshift Trap */
  cus_09100?: CustomizableMetaString;
  /** Grizzled */
  cus_09101?: CustomizableMetaString;

  /** Hyperphysical Shotcaster */
  cus_09119?: CustomizableMetaString;
}



/**
 * Format: X,X,X,...
 * Each X: index|checked_boxes OR index|checked_boxes|details
 *
 * Each details :
 * - Card's ID
 * - Trait string
 * - willpower | intellect | combat | agility (Living Ink)
 * - Multiple of above, separated by ^
 */
type CustomizableMetaString = string;

/**
 *  Format: comma-separated list of ids "id1,id2,id2,id3".
 */
type AttachmentMetaString = string;

/**
 * Format: X,X,X,...
 * Each X: Card's ID.
 */
type ExtraDeckString = string;

/**
 * Format: X,X,X,...
 * Each X: index|checked_boxes OR index|checked_boxes|details
 */
export interface DecodedCustomizableMeta {
  forCustomizableCard: CardCode;
  index: number;
  checked: number;
  details?: DecodedCustomizableMetaDetails;
}

/**
 * Each details :
 * - Card's ID
 * - Trait string
 * - willpower | intellect | combat | agility (Living Ink)
 * - Multiple of above, separated by ^
 */
export interface DecodedCustomizableMetaDetails {
  recordedCards?: CardCode[];
  recordedTraits?: string[];
  recordedSkills?: SkillType[];
}

export function decodeMeta(metaString: string, cardResolver: CardResolver): DecodedMeta {
  if (metaString === '') {
    return {};
  }
  const json = JSON.parse(metaString) as Meta;
  const dm: DecodedMeta = {
    customizableMetas: [],
  };
  if (json.alternate_front && json.alternate_front !== '') {
    dm.alternateFront = cardResolver.resolve(json.alternate_front);
  }
  if (json.alternate_back && json.alternate_back !== '') {
    dm.alternateBack = cardResolver.resolve(json.alternate_back);
  }
  if (json.faction_selected) {
    dm.factionSelected = factionCodeToClass(json.faction_selected);
  }
  if (json.faction_1) {
    dm.faction1 = factionCodeToClass(json.faction_1);
  }
  if (json.faction_2) {
    dm.faction2 = factionCodeToClass(json.faction_2);
  }
  if (json.option_selected) {
    dm.optionSelected = json.option_selected;
  }
  if (json.deck_size_selected) {
    dm.deckSizeSelected = json.deck_size_selected;
  }
  if (json.extra_deck) {
    dm.extraDeck = json.extra_deck.split(',').map((x) => {
      return {
        card: cardResolver.resolve(x),
        quantity: 1,
      };
    });
  }
  if (json.card_pool) {
    dm.cardPool = json.card_pool.split(',').map((x) => {
      return ahdb.codeToProduct(x, undefined);
    });
  }
  if (json.sealed_deck) {
    dm.sealedDeck = json.sealed_deck.split(',').map((x) => {
      const [code, quantity] = x.split(':');
      return {
        card: cardResolver.resolve(code),
        quantity: parseInt(quantity),
      };
    });
  }
  if (json.sealed_deck_name) {
    dm.sealedDeckName = json.sealed_deck_name;
  }
  if (json.transform_into) {
    dm.transformInto = cardResolver.resolve(json.transform_into);
  }
  if (json.banner_url) {
    dm.bannerUrl = json.banner_url;
  }
  if (json.intro_md) {
    dm.introMd = json.intro_md;
  }
  if (json.fan_made_content) {
    dm.fanMadeContent = json.fan_made_content;
  }
  if (json.hidden_slots) {
    dm.hiddenSlots = json.hidden_slots;
  }

  // Process dynamic attachments_{code} fields
  const attachments: Record<string, Card[]> = {};
  Object.entries(json).forEach(([key, value]) => {
    if (key.startsWith('attachments_') && typeof value === 'string') {
      const code = key.slice(12); // Remove 'attachments_' prefix
      attachments[code] = value.split(',').map((x) => cardResolver.resolve(x));
    }
  });
  if (Object.keys(attachments).length > 0) {
    dm.attachments = attachments;
  }

  // Process dynamic card_pool_extension_{code} fields
  const cardPoolExtension: Record<string, CardCode[]> = {};
  Object.entries(json).forEach(([key, value]) => {
    if (key.startsWith('card_pool_extension_') && typeof value === 'string') {
      const code = key.slice(20); // Remove 'card_pool_extension_' prefix
      cardPoolExtension[code] = value.split(',').map((x) => x.replace('card:', ''));
    }
  });
  if (Object.keys(cardPoolExtension).length > 0) {
    dm.cardPoolExtension = cardPoolExtension;
  }

  // Process dynamic annotation_{code} fields
  const annotations: Record<string, string> = {};
  Object.entries(json).forEach(([key, value]) => {
    if (key.startsWith('annotation_') && typeof value === 'string') {
      const code = key.slice(11); // Remove 'annotation_' prefix
      annotations[code] = value;
    }
  });
  if (Object.keys(annotations).length > 0) {
    dm.annotations = annotations;
  }

  const customizableMetas: DecodedCustomizableMeta[] = [];
  Object.entries(json).forEach(([key, value]) => {
    if (key.startsWith('cus_') && typeof value === 'string') {
      const custCard = key.slice(4);
      const custSep = value.split(',');
      custSep.forEach((x) => {
        const custValue = x.split('|');
        if (custValue.length >= 2) {
          let details: DecodedCustomizableMetaDetails | undefined = undefined;
          if (custValue.length > 2) {
            const detailsString = custValue[2];
            /**
             * Each details :
             * - Card's ID
             * - Trait string
             * - willpower | intellect | combat | agility (Living Ink)
             * - Multiple of above, separated by ^
             */
            const detailsSep = detailsString.split('^');
            const recordedCards: CardCode[] = [];
            const recordedTraits: string[] = [];
            const recordedSkills: SkillType[] = [];
            detailsSep.forEach((y) => {
              const skillStrings = ['willpower', 'intellect', 'combat', 'agility'];
              switch (y) {
                case 'willpower':
                  recordedSkills.push(SkillType.Willpower);
                  break;
                case 'intellect':
                  recordedSkills.push(SkillType.Intellect);
                  break;
                case 'combat':
                  recordedSkills.push(SkillType.Combat);
                  break;
                case 'agility':
                  recordedSkills.push(SkillType.Agility);
                  break;
                default:
                  // If contains any number, likely card code. Otherwise, traits.
                  if (y.match(/\d+/)) {
                    recordedCards.push(y);
                  } else if (skillStrings.includes(y)) {
                    recordedTraits.push(y);
                  }
              }
            });
            details = {};
            details.recordedCards = recordedCards;
            details.recordedTraits = recordedTraits;
            details.recordedSkills = recordedSkills;
          }
          customizableMetas.push({
            forCustomizableCard: custCard,
            index: parseInt(custValue[0]),
            checked: parseInt(custValue[1]),
            details,
          });
        }
      });
    }
  });
  dm.customizableMetas = customizableMetas;
  return dm;
}
