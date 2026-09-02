import type { Tag } from "./tag-interface-union.js";
import type { TagType } from "./tag-type-union.js";
import { CompoundTagType, compoundTags } from "./compound-tags/compound-tags.js";
import type { HydratedCard } from "./hydrate.js";
import { groupOfTagType, type TagGroupId } from "./tag-group.js";
import { tagName, tagGroupName, compoundTagName } from "./strings.js";
import { memberMatches, memberType } from "./query.js";

/** Usage summary for one tag type. */
export interface TagTypeUsage {
  type: TagType;
  /** The group (folder) the tag belongs to. */
  group: TagGroupId;
  /** Localized display name. */
  label: string;
  /** Number of cards carrying this tag type. */
  count: number;
}

/** Usage summary for one compound tag. */
export interface CompoundTagUsage {
  type: CompoundTagType;
  /** Localized display name. */
  label: string;
  /** Number of cards matching this compound. */
  count: number;
}

/** Usage summary for one member of a compound tag (its type, optional `where`, and count). */
export interface CompoundMemberUsage {
  type: TagType;
  /** The per-member argument condition, if this member is conditioned. */
  where?: Record<string, string | number | boolean>;
  /** Localized display name of the member tag. */
  label: string;
  /** Number of cards matching this member specifically (honoring `where`). */
  count: number;
}

/** Locale option for label-producing queries. */
export interface RepositoryOptions {
  /** Locale for the `label`; defaults to the package base locale. */
  locale?: string;
}

/**
 * A query surface over a set of hydrated cards. Build one with {@link createRepository}
 * from the output of `hydrate(cardsJson)`. Per-tag counts are memoized (O(1)); the card
 * listings scan the set. Compound queries read the rasterized `HydratedCard.compoundTags`.
 */
export interface TagRepository {
  /** The hydrated cards this repository was built from. */
  readonly cards: HydratedCard[];

  /** Base tags of a card by code, or undefined if the card is absent. */
  tagsOfCard(code: string): Tag[] | undefined;
  /** Compound archetypes of a card by code (empty if absent). */
  compoundTagsOfCard(code: string): CompoundTagType[];

  /** Cards carrying a given base tag type. */
  cardsByTagType(type: TagType): HydratedCard[];
  /** Cards belonging to a given compound archetype. */
  cardsByCompoundTag(type: CompoundTagType): HydratedCard[];

  /** How many cards carry a base tag type (O(1)). */
  tagTypeCount(type: TagType): number;
  /** How many cards belong to a compound archetype (O(1)). */
  compoundTagCount(type: CompoundTagType): number;

  /** Every base tag type used by ≥1 card, with group, localized label and count. */
  listUsedTagTypes(opts?: RepositoryOptions): TagTypeUsage[];
  /** Every compound tag with its localized label and count. */
  listUsedCompoundTags(opts?: RepositoryOptions): CompoundTagUsage[];

  /** Used tag types matching a query (name / type value / group name), ranked. */
  searchTags(query: string, opts?: RepositoryOptions): TagTypeUsage[];
  /** Compound tags matching a query (name / type value / member tag), ranked. */
  searchCompoundTags(query: string, opts?: RepositoryOptions): CompoundTagUsage[];

  /** The members of a compound, each with localized label and (where-honoring) count. */
  compoundTagMemberUsages(type: CompoundTagType, opts?: RepositoryOptions): CompoundMemberUsage[];
}

/** Build a {@link TagRepository} over a set of hydrated cards. */
export function createRepository(cards: HydratedCard[]): TagRepository {
  const byCode = new Map(cards.map((c) => [c.code, c]));

  const tagCounts = new Map<TagType, number>();
  for (const card of cards) {
    const seen = new Set<TagType>();
    for (const t of card.tags) seen.add(t.type);
    for (const t of seen) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  const compoundCounts = new Map<CompoundTagType, number>();
  for (const card of cards) {
    const seen = new Set<CompoundTagType>();
    for (const ct of card.compoundTags) seen.add(ct);
    for (const ct of seen) compoundCounts.set(ct, (compoundCounts.get(ct) ?? 0) + 1);
  }

  const tagTypeCount = (type: TagType) => tagCounts.get(type) ?? 0;
  const compoundTagCount = (type: CompoundTagType) => compoundCounts.get(type) ?? 0;

  const listUsedTagTypes = (opts: RepositoryOptions = {}): TagTypeUsage[] =>
    Array.from(tagCounts.entries())
      .map(([type, count]) => ({
        type,
        count,
        group: groupOfTagType(type),
        label: tagName(type, { locale: opts.locale }),
      }))
      .sort(
        (a, b) =>
          a.group.localeCompare(b.group) ||
          b.count - a.count ||
          a.label.localeCompare(b.label),
      );

  const listUsedCompoundTags = (opts: RepositoryOptions = {}): CompoundTagUsage[] =>
    compoundTags.map((c) => ({
      type: c.type,
      label: compoundTagName(c.type, { locale: opts.locale }),
      count: compoundTagCount(c.type),
    }));

  const searchTags = (query: string, opts: RepositoryOptions = {}): TagTypeUsage[] => {
    const all = listUsedTagTypes(opts);
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all
      .map((u) => {
        let score = 0;
        if (u.label.toLowerCase().includes(q)) score = 3;
        else if (u.type.toLowerCase().includes(q)) score = 2;
        else if (tagGroupName(u.group, { locale: opts.locale }).toLowerCase().includes(q)) score = 1;
        return { u, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.u);
  };

  const searchCompoundTags = (query: string, opts: RepositoryOptions = {}): CompoundTagUsage[] => {
    const usages = listUsedCompoundTags(opts);
    const q = query.trim().toLowerCase();
    if (!q) return usages;
    const byType = new Map(compoundTags.map((c) => [c.type, c]));
    const scored = usages
      .map((u) => {
        const c = byType.get(u.type)!;
        let score = 0;
        if (u.label.toLowerCase().includes(q)) score = 3;
        else if (String(u.type).toLowerCase().includes(q)) score = 2;
        else if (
          c.tags.some((m) => {
            const type = memberType(m);
            return (
              type.toLowerCase().includes(q) ||
              tagName(type, { locale: opts.locale }).toLowerCase().includes(q)
            );
          })
        )
          score = 1;
        return { u, score };
      })
      .filter((x) => x.score > 0);
    scored.sort((a, b) => b.score - a.score || a.u.label.localeCompare(b.u.label));
    return scored.map((x) => x.u);
  };

  const compoundTagMemberUsages = (
    type: CompoundTagType,
    opts: RepositoryOptions = {},
  ): CompoundMemberUsage[] => {
    const members = compoundTags.find((c) => c.type === type)?.tags ?? [];
    return members.map((m) => {
      const mt = memberType(m);
      const where = typeof m === "string" ? undefined : m.where;
      const count = cards.filter((c) => c.tags.some((t) => memberMatches(m, t))).length;
      return { type: mt, where, label: tagName(mt, { locale: opts.locale }), count };
    });
  };

  return {
    cards,
    tagsOfCard: (code) => byCode.get(code)?.tags,
    compoundTagsOfCard: (code) => byCode.get(code)?.compoundTags ?? [],
    cardsByTagType: (type) => cards.filter((c) => c.tags.some((t) => t.type === type)),
    cardsByCompoundTag: (type) => cards.filter((c) => c.compoundTags.includes(type)),
    tagTypeCount,
    compoundTagCount,
    listUsedTagTypes,
    listUsedCompoundTags,
    searchTags,
    searchCompoundTags,
    compoundTagMemberUsages,
  };
}
