import type { CompoundTagType } from "./compound-tags/compound-tags.js";
import { TagType } from "./tag-type-union.js";

/**
 * To decide whether to create a new tag, or add arguments to an existing tag,
 * picture a system that suggests similar cards based on "aspects" of the card.
 *
 * Each aspect is represented by a tag, and it find other cards with the same tag
 * regardless of the tag's argument. (Though it could offer to further filter by the argument.)
 *
 * For example a tag `TagBoldFight` exists, but not `TagBold` with argument "fight".
 * Because it is unlikely that user wants to find any card with bold action designator.
 *
 * In the case that it is needed, we can make a compound tag which can group multiple tags together.
 */
export interface TagBase {
  type: TagType;
}

/**
 * A member of a compound tag, narrowed to only the tags of `type` whose arguments
 * match every field in `where`. Use this when a compound should include a tag ONLY
 * for a specific argument value — e.g. "Tome support" includes
 * `SlotAdditionalHand` only `where: { restrictedToTrait: "Tome" }`.
 */
export interface CompoundTagMember {
  type: TagType;
  where?: Record<string, string | number | boolean>;
}

/**
 * Cards cannot be tagged with a compound tag. However, each tag could be searched for
 * compound tags that contains it.
 *
 * A member is either a bare `TagType` (matches any card with that tag, regardless of
 * arguments) or a {@link CompoundTagMember} (matches only when the tag's arguments
 * satisfy `where`).
 */
export interface CompoundTagBase {
  type: CompoundTagType;
  tags: (TagType | CompoundTagMember)[];
}
