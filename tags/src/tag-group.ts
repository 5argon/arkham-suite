import type { TagType } from "./tag-type-union.js";
import { tagTypeCategory } from "./tag-category-map.js";

/**
 * A tag group id — the category folder that defines the tag's enum. Groups are the
 * first-class, browsable grouping of tags (one tag belongs to exactly one group).
 * Display names come from the i18n string layer (see `tagGroupName` in strings.ts);
 * the rule "all tags in a folder share the folder's prefix" keeps the group
 * discoverable by substring search.
 */
export type TagGroupId = string;

/** The group a tag type belongs to (= the folder that defines its enum). */
export function groupOfTagType(type: TagType): TagGroupId {
  return tagTypeCategory[type] ?? "other";
}

export interface TagGroup {
  id: TagGroupId;
  /** Every tag type defined under this group, sorted. */
  tagTypes: TagType[];
}

function buildGroups(): TagGroup[] {
  const map = new Map<TagGroupId, TagType[]>();
  for (const value of Object.keys(tagTypeCategory) as TagType[]) {
    const id = groupOfTagType(value);
    const arr = map.get(id) ?? [];
    arr.push(value);
    map.set(id, arr);
  }
  return Array.from(map.entries())
    .map(([id, tagTypes]) => ({ id, tagTypes: tagTypes.sort() }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** All tag groups (one per category folder), each with its full member tag types. */
export const tagGroups: TagGroup[] = buildGroups();

/** All group ids, sorted. */
export const tagGroupIds: TagGroupId[] = tagGroups.map((g) => g.id);
