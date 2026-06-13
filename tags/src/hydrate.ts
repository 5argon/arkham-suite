import type { Tag } from "./tag-interface-union.js";
import { CompoundTagType } from "./compound-tags/compound-tags.js";
import { tagTypeCategory } from "./tag-category-map.js";

/**
 * The package does NOT ship the tagged cards as TypeScript objects. The single way to
 * consume them is the published, pre-made JSON (`@5argon/arkham-tags/cards.json`), in
 * which each card's compound archetypes are RASTERIZED into the same `tags` list as its
 * base tags — compound entries are marked by the `c-` namespace prefix on their `type`
 * (e.g. `"c-combat-boost"`), so the merged data is self-describing.
 *
 * `hydrate` turns that untyped JSON into type-safe, query-ready cards: it splits the
 * merged list back into the discriminated `Tag` union (base tags, with their arguments)
 * and the `CompoundTagType[]` archetypes, classifying each entry by its prefix.
 */

/** One tag entry as it appears in the public JSON: a base tag (with args) or a bare compound ref. */
export interface RawTag {
  type: string;
  [field: string]: unknown;
}

/** A card as it appears in the public `cards.json` (compounds merged into `tags`). */
export interface RawCard {
  code: string;
  name: string;
  text?: string;
  /** Card level (XP). */
  level?: number;
  /** Card type code ("asset" | "event" | "skill" | …). */
  cardType?: string;
  /** Printed commit/skill icons, one entry per icon. */
  icons?: string[];
  tags: RawTag[];
}

/** A card after hydration: base tags and compound memberships split into typed arrays. */
export interface HydratedCard {
  code: string;
  name: string;
  text?: string;
  /** Card level (XP). */
  level?: number;
  /** Card type code ("asset" | "event" | "skill" | …). */
  cardType?: string;
  /** Printed commit/skill icons, one entry per icon. */
  icons?: string[];
  /** Base tags only, typed as the discriminated `Tag` union (arguments preserved). */
  tags: Tag[];
  /** Compound archetypes this card belongs to (rasterized in the JSON). */
  compoundTags: CompoundTagType[];
}

/** The `c-` namespace prefix that marks a merged tag entry as a compound archetype. */
export const COMPOUND_PREFIX = "c-";

const COMPOUND_TYPES: ReadonlySet<string> = new Set(Object.values(CompoundTagType));
const BASE_TYPES: ReadonlySet<string> = new Set(Object.keys(tagTypeCategory));

export interface HydrateOptions {
  /** Throw on an unrecognized tag `type` instead of silently dropping it. Default false. */
  strict?: boolean;
}

/** Whether a raw tag entry is a compound archetype (by its `c-` prefix). */
export function isCompoundEntry(entry: RawTag): boolean {
  return entry.type.startsWith(COMPOUND_PREFIX);
}

/** Classify + type one raw card's merged tag list into base `tags` + `compoundTags`. */
export function hydrateCard(raw: RawCard, opts: HydrateOptions = {}): HydratedCard {
  const tags: Tag[] = [];
  const compoundTags: CompoundTagType[] = [];
  for (const entry of raw.tags) {
    // Prefix is the primary signal; the vocab sets are a correctness backstop that
    // catches a hand-edited JSON typo (unknown type) under `strict`.
    if (isCompoundEntry(entry)) {
      if (COMPOUND_TYPES.has(entry.type)) compoundTags.push(entry.type as CompoundTagType);
      else if (opts.strict) throw new Error(`Unknown compound type "${entry.type}" on card ${raw.code}`);
    } else if (BASE_TYPES.has(entry.type)) {
      tags.push(entry as unknown as Tag);
    } else if (opts.strict) {
      throw new Error(`Unknown tag type "${entry.type}" on card ${raw.code}`);
    }
  }
  return {
    code: raw.code,
    name: raw.name,
    text: raw.text,
    level: raw.level,
    cardType: raw.cardType,
    icons: raw.icons,
    tags,
    compoundTags,
  };
}

/**
 * Hydrate the full public `cards.json` into typed, query-ready cards. Feed the result to
 * {@link createRepository} (from `./repository.js`) to query it.
 */
export function hydrate(raw: RawCard[], opts: HydrateOptions = {}): HydratedCard[] {
  return raw.map((c) => hydrateCard(c, opts));
}
