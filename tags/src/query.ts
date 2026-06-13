import type { Tag } from "./tag-interface-union.js";
import type { TagType } from "./tag-type-union.js";
import type { CompoundTagBase, CompoundTagMember } from "./base.js";
import { CompoundTagType, compoundTags } from "./compound-tags/compound-tags.js";

/**
 * Definition-level helpers over the compound-tag taxonomy. These are pure functions of
 * the `compoundTags` definitions — they need no card data. Queries that operate over a
 * card SET live on the repository (`./repository.js`), built from hydrated JSON; the
 * package no longer bundles or exports the tagged cards themselves.
 */

/** The tag type of a compound member (bare type or a conditioned `{type, where}`). */
export function memberType(m: TagType | CompoundTagMember): TagType {
  return typeof m === "string" ? m : m.type;
}

/** Whether a card's tag satisfies a compound member (type match + `where` args match). */
export function memberMatches(m: TagType | CompoundTagMember, tag: Tag): boolean {
  if (typeof m === "string") return tag.type === m;
  if (tag.type !== m.type) return false;
  if (!m.where) return true;
  const fields = tag as unknown as Record<string, unknown>;
  return Object.entries(m.where).every(([k, v]) => fields[k] === v);
}

/** Whether a single tag is one of a compound's members (honoring the member's `where`). */
export function tagMatchesCompound(tag: Tag, compoundType: CompoundTagType): boolean {
  const ct = compoundTags.find((c) => c.type === compoundType);
  return !!ct && ct.tags.some((m) => memberMatches(m, tag));
}

/** Compound tags whose member list contains the given tag type (ignoring any `where`). */
export function compoundTagsContaining(type: TagType): CompoundTagBase[] {
  return compoundTags.filter((c) => c.tags.some((m) => memberType(m) === type));
}

/**
 * The compound archetypes a set of base tags belongs to — honoring each member's `where`
 * condition (so a Spell-restricted arcane slot matches Spell Support but NOT Tome Support).
 * This is how the published JSON is rasterized (see `script/export-json.ts`); at runtime
 * consumers read the already-rasterized `HydratedCard.compoundTags` instead of recomputing.
 */
export function resolveCompounds(tags: Tag[]): CompoundTagType[] {
  return compoundTags
    .filter((ct) => ct.tags.some((m) => tags.some((t) => memberMatches(m, t))))
    .map((c) => c.type);
}

/** The member tag types of a compound tag (conditioned members reduced to their type). */
export function tagTypesInCompound(type: CompoundTagType): TagType[] {
  return (compoundTags.find((c) => c.type === type)?.tags ?? []).map(memberType);
}

/** The raw members of a compound tag, preserving any per-member `where` conditions. */
export function compoundTagMembers(type: CompoundTagType): (TagType | CompoundTagMember)[] {
  return compoundTags.find((c) => c.type === type)?.tags ?? [];
}
